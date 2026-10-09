const axios = require('axios');
const CustomLogo = require('../models/CustomLogo');

const SUCCESS_TTL_MS = 24 * 60 * 60 * 1000;
const FAILURE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;
const MAX_HTML_BYTES = 750 * 1024;
const MAX_IMAGE_BYTES = 1024 * 1024;
const REQUEST_TIMEOUT_MS = 3500;

const logoCache = new Map();

function normalizeKey(companyName, symbol = '') {
  return `${companyName}|${symbol}`.trim().toLowerCase();
}

function cleanCompanyName(companyName) {
  return String(companyName || '')
    .replace(/\b(ipo|limited|ltd|pvt|private|inc|corp|corporation|industries|international|services|technologies|technology|holdings|solutions|india)\b\.?/gi, ' ')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildDomainCandidates(companyName, symbol = '') {
  const cleaned = cleanCompanyName(companyName);
  const words = cleaned.split(' ').filter(Boolean);
  const slug = words.join('');
  const firstTwo = words.slice(0, 2).join('');
  const firstWord = words[0] || '';
  const cleanSymbol = String(symbol || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const stems = [slug, firstTwo, firstWord, cleanSymbol]
    .filter((stem) => stem.length >= 2 && stem.length <= 63);
  const domains = [];

  for (const stem of [...new Set(stems)]) {
    domains.push(`${stem}.com`, `${stem}.in`, `${stem}.co.in`);
  }

  return [...new Set(domains)].slice(0, 8);
}

function readAttribute(tag, attribute) {
  const pattern = new RegExp(`\\b${attribute}\\s*=\\s*(?:["']([^"']+)["']|([^\\s>]+))`, 'i');
  const match = tag.match(pattern);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function toAbsoluteHttpUrl(value, baseUrl) {
  if (!value || value.startsWith('data:')) return null;
  try {
    const url = new URL(value, baseUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractLogoCandidates(html, baseUrl) {
  const candidates = [];
  const linkTags = String(html).match(/<link\b[^>]*>/gi) || [];
  const metaTags = String(html).match(/<meta\b[^>]*>/gi) || [];
  const imageTags = String(html).match(/<img\b[^>]*>/gi) || [];

  for (const tag of linkTags) {
    const rel = readAttribute(tag, 'rel').toLowerCase();
    if (!rel.includes('icon')) continue;
    const href = toAbsoluteHttpUrl(readAttribute(tag, 'href'), baseUrl);
    if (href) candidates.push(href);
  }

  for (const tag of metaTags) {
    const property = (readAttribute(tag, 'property') || readAttribute(tag, 'name')).toLowerCase();
    if (!['og:image', 'og:image:url', 'twitter:image', 'twitter:image:src'].includes(property)) continue;
    const content = toAbsoluteHttpUrl(readAttribute(tag, 'content'), baseUrl);
    if (content) candidates.push(content);
  }

  for (const tag of imageTags) {
    const searchable = [
      readAttribute(tag, 'alt'),
      readAttribute(tag, 'class'),
      readAttribute(tag, 'id'),
      readAttribute(tag, 'src'),
    ].join(' ').toLowerCase();
    if (!searchable.includes('logo') && !searchable.includes('brand')) continue;
    const src = toAbsoluteHttpUrl(readAttribute(tag, 'src'), baseUrl);
    if (src) candidates.push(src);
  }

  return [...new Set(candidates)].slice(0, 12);
}

async function fetchWebsite(domain) {
  const variants = [`https://${domain}`, `https://www.${domain}`];
  for (const url of variants) {
    try {
      const response = await axios.get(url, {
        timeout: REQUEST_TIMEOUT_MS,
        maxRedirects: 4,
        maxContentLength: MAX_HTML_BYTES,
        responseType: 'text',
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          'User-Agent': 'Mozilla/5.0 (compatible; PKCTechsLogoBot/1.0)',
        },
        validateStatus: (status) => status >= 200 && status < 400,
      });
      const contentType = String(response.headers['content-type'] || '').toLowerCase();
      if (!contentType.includes('text/html')) continue;
      return {
        html: response.data,
        finalUrl: response.request?.res?.responseUrl || url,
      };
    } catch {
      // Try the next safe domain variant.
    }
  }
  return null;
}

function isSupportedImage(contentType, data) {
  if (!Buffer.isBuffer(data) || data.length === 0 || data.length > MAX_IMAGE_BYTES) return false;
  const type = String(contentType || '').split(';')[0].trim().toLowerCase();
  return ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'].includes(type);
}

async function downloadImage(url) {
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT_MS,
      maxRedirects: 4,
      maxContentLength: MAX_IMAGE_BYTES,
      responseType: 'arraybuffer',
      headers: {
        Accept: 'image/svg+xml,image/png,image/jpeg,image/webp,image/gif;q=0.8',
        Referer: new URL(url).origin,
        'User-Agent': 'Mozilla/5.0 (compatible; PKCTechsLogoBot/1.0)',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });
    const data = Buffer.from(response.data);
    const contentType = response.headers['content-type'];
    if (!isSupportedImage(contentType, data)) return null;
    return { data, contentType: String(contentType).split(';')[0].trim().toLowerCase() };
  } catch {
    return null;
  }
}

function setCache(key, value) {
  if (logoCache.has(key)) logoCache.delete(key);
  logoCache.set(key, value);
  while (logoCache.size > MAX_CACHE_ENTRIES) {
    const oldestKey = logoCache.keys().next().value;
    if (oldestKey === undefined) break;
    logoCache.delete(oldestKey);
  }
}

async function discoverCompanyLogo(companyName, symbol = '') {
  const key = normalizeKey(companyName, symbol);
  const cached = logoCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return { ...cached, cacheStatus: cached.data ? 'HIT' : 'NEGATIVE-HIT' };
  }
  if (cached) logoCache.delete(key);

  try {
    const customLogo = await CustomLogo.findOne({ key });
    if (customLogo) {
      const value = {
        data: customLogo.data,
        contentType: customLogo.contentType,
        sourceUrl: 'admin-upload',
        expiresAt: Date.now() + SUCCESS_TTL_MS,
      };
      setCache(key, value);
      return { ...value, cacheStatus: 'HIT-CUSTOM' };
    }
  } catch (err) {
    console.error('Error fetching custom logo:', err.message);
  }

  const domains = buildDomainCandidates(companyName, symbol);
  const websites = await Promise.all(domains.map((domain) => fetchWebsite(domain)));

  for (const website of websites.filter(Boolean)) {
    const candidates = extractLogoCandidates(website.html, website.finalUrl);
    for (const candidate of candidates) {
      const image = await downloadImage(candidate);
      if (!image) continue;
      const value = {
        ...image,
        sourceUrl: candidate,
        expiresAt: Date.now() + SUCCESS_TTL_MS,
      };
      setCache(key, value);
      return { ...value, cacheStatus: 'MISS' };
    }
  }

  const miss = { data: null, contentType: null, expiresAt: Date.now() + FAILURE_TTL_MS };
  setCache(key, miss);
  return { ...miss, cacheStatus: 'NEGATIVE-MISS' };
}

function invalidateCache(key) {
  if (logoCache.has(key)) logoCache.delete(key);
}

module.exports = {
  normalizeKey,
  invalidateCache,
  buildDomainCandidates,
  extractLogoCandidates,
  discoverCompanyLogo,
};
