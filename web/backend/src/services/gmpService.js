const axios = require('axios');

const IPOGURU_API_URL = process.env.IPOGURU_API_URL || process.env.IPO_GURU_API_URL || 'https://www.ipoguru.in/api/v2/gmp';

// In-memory cache for IPOGuru GMP data to respect the 1 request/minute free tier limit
let gmpCache = {
  data: [],
  timestamp: 0,
  inFlight: null
};

const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

function getApiKey() {
  return process.env.IPOGURU_API_KEY || process.env.IPO_GURU_API_KEY || '';
}

/**
 * Fetch full list of GMPs from IPOGuru with in-memory caching & rate-limit deduplication
 */
async function fetchIpoGuruGmpList(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && gmpCache.data.length > 0 && (now - gmpCache.timestamp < CACHE_TTL_MS)) {
    return gmpCache.data;
  }

  if (gmpCache.inFlight) {
    return gmpCache.inFlight;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[IPOGuru GMP] IPOGURU_API_KEY is not configured in .env');
    return gmpCache.data;
  }

  gmpCache.inFlight = (async () => {
    try {
      console.log('[IPOGuru GMP] Fetching latest GMP data from IPOGuru API...');
      const response = await axios.get(IPOGURU_API_URL, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json'
        },
        timeout: 10000
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        gmpCache.data = response.data.data;
        gmpCache.timestamp = Date.now();
        console.log(`[IPOGuru GMP] Successfully fetched ${gmpCache.data.length} GMP items.`);
        return gmpCache.data;
      }

      if (Array.isArray(response.data)) {
        gmpCache.data = response.data;
        gmpCache.timestamp = Date.now();
        return gmpCache.data;
      }

      return gmpCache.data;
    } catch (err) {
      if (err.response?.status === 429) {
        console.warn('[IPOGuru GMP] Rate limit reached (free tier limit 1 req/min). Serving cached GMP data.');
      } else {
        console.warn('[IPOGuru GMP] Failed to fetch GMP:', err.message);
      }
      return gmpCache.data;
    } finally {
      gmpCache.inFlight = null;
    }
  })();

  return gmpCache.inFlight;
}

/**
 * Normalizes company / IPO names for reliable matching
 */
function normalizeName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[-_.]/g, ' ')
    .replace(/\b(limited|ltd|pvt|private|ipo|sme|corporation|corp|enterprises|holdings|infra|technologies|tech|solutions|services|industries|india)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Normalizes slug/ID strings
 */
function normalizeSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[-_.]/g, '')
    .replace(/\b(limited|ltd|ipo|sme)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Calculates word overlap similarity (Jaccard token similarity)
 */
function tokenSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const stopWords = new Set(['limited', 'ltd', 'private', 'pvt', 'ipo', 'sme', 'india', 'the', 'and', '&']);
  const tokenize = s => s.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const tokens1 = new Set(tokenize(str1));
  const tokens2 = new Set(tokenize(str2));
  if (tokens1.size === 0 || tokens2.size === 0) return 0;

  let intersection = 0;
  for (const t of tokens1) {
    if (tokens2.has(t)) intersection++;
  }

  return intersection / Math.min(tokens1.size, tokens2.size);
}

/**
 * Find matching IPOGuru item for an Upstox IPO
 */
function findMatchingGuruIpo(upstoxIpo, guruList) {
  if (!guruList || guruList.length === 0) return null;

  const upstoxIdSlug = normalizeSlug(upstoxIpo.ipoId || '');
  const upstoxNormCompany = normalizeName(upstoxIpo.companyName || '');
  const upstoxNormIpo = normalizeName(upstoxIpo.ipoName || '');
  const upstoxRawCompany = (upstoxIpo.companyName || upstoxIpo.ipoName || '').toLowerCase();

  // Pass 1: Exact slug match
  for (const guru of guruList) {
    const guruSlug = normalizeSlug(guru.slug || '');
    if (upstoxIdSlug && guruSlug && (upstoxIdSlug === guruSlug)) {
      return guru;
    }
  }

  // Pass 2: Exact normalized name match
  for (const guru of guruList) {
    const guruNorm = normalizeName(guru.name || '');
    if (guruNorm && (guruNorm === upstoxNormCompany || guruNorm === upstoxNormIpo)) {
      return guru;
    }
  }

  // Pass 3: Substring containment (if cleaned length is substantial)
  for (const guru of guruList) {
    const guruNorm = normalizeName(guru.name || '');
    if (guruNorm.length >= 5 && upstoxNormCompany.length >= 5) {
      if (upstoxNormCompany.includes(guruNorm) || guruNorm.includes(upstoxNormCompany)) {
        return guru;
      }
    }
  }

  // Pass 4: Word token overlap (>= 75% match)
  let bestGuru = null;
  let bestScore = 0;
  for (const guru of guruList) {
    const score = tokenSimilarity(upstoxRawCompany, guru.name || '');
    if (score > bestScore && score >= 0.75) {
      bestScore = score;
      bestGuru = guru;
    }
  }

  return bestGuru;
}

/**
 * Extract and normalize GMP details from an IPOGuru item into our standard schema
 */
function extractGmpDetails(guruItem, upstoxIpo) {
  if (!guruItem || !guruItem.gmp) {
    return null;
  }

  const rawGmp = guruItem.gmp;
  const price = parseFloat(rawGmp.price) || 0;

  // Compute percentage if not directly provided
  let percentage = 0;
  if (rawGmp.percentage != null && !isNaN(parseFloat(rawGmp.percentage))) {
    percentage = parseFloat(rawGmp.percentage);
  } else {
    const basePrice = upstoxIpo.cutoffPrice || upstoxIpo.priceband?.max || 0;
    if (basePrice > 0 && price > 0) {
      percentage = parseFloat(((price / basePrice) * 100).toFixed(2));
    }
  }

  const basePrice = upstoxIpo.cutoffPrice || upstoxIpo.priceband?.max || 0;
  const estimatedListingPrice = parseFloat(rawGmp.estimated_listing_price) || (basePrice > 0 ? basePrice + price : 0);

  const now = new Date();
  const isListed = rawStatus === 'listed' ||
    (upstoxIpo.listingdate && new Date(upstoxIpo.listingdate) <= now && !['upcoming', 'open', 'closed', 'allotted'].includes(rawStatus));

  return {
    price,
    percentage,
    lastupdated: rawGmp.updated_at ? new Date(rawGmp.updated_at) : new Date(),
    source: 'IPOGuru',
    kostak: parseFloat(rawGmp.kostak) || 0,
    subjectToSauda: parseFloat(rawGmp.subject_to_sauda) || 0,
    estimatedListingPrice,
    isListed,
    listingGain: isListed ? price : null,
    listingGainPercentage: isListed ? percentage : null,
    listingPrice: isListed ? estimatedListingPrice : null
  };
}

/**
 * Matches and enriches an array of Upstox IPOs with IPOGuru GMP data
 */
async function enrichIposWithGmp(upstoxIpos) {
  if (!Array.isArray(upstoxIpos) || upstoxIpos.length === 0) {
    return upstoxIpos;
  }

  try {
    const guruList = await fetchIpoGuruGmpList();
    if (!guruList || guruList.length === 0) {
      return upstoxIpos;
    }

    let matchCount = 0;
    for (const ipo of upstoxIpos) {
      const matchedGuru = findMatchingGuruIpo(ipo, guruList);
      if (matchedGuru) {
        const gmpData = extractGmpDetails(matchedGuru, ipo);
        if (gmpData) {
          ipo.gmp = gmpData;
          matchCount++;
        }
      }
    }

    console.log(`[IPOGuru GMP] Matched live GMP for ${matchCount} / ${upstoxIpos.length} Upstox IPOs.`);
  } catch (err) {
    console.warn('[IPOGuru GMP] Error enriching IPOs with GMP:', err.message);
  }

  return upstoxIpos;
}

/**
 * Standalone update: Matches latest IPOGuru GMP with existing Upstox IPOs in MongoDB
 */
async function refreshGmpInDatabase() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    return { success: false, message: 'MongoDB not connected' };
  }

  const Ipo = require('../models/ipo');
  const guruList = await fetchIpoGuruGmpList();
  if (!guruList || guruList.length === 0) {
    return { success: false, message: 'No GMP data fetched from IPOGuru' };
  }

  const allIpos = await Ipo.find({ source: 'upstox' });
  const ops = [];
  let matchedCount = 0;

  for (const ipo of allIpos) {
    const matchedGuru = findMatchingGuruIpo(ipo, guruList);
    if (matchedGuru) {
      const gmpData = extractGmpDetails(matchedGuru, ipo);
      if (gmpData) {
        ops.push({
          updateOne: {
            filter: { _id: ipo._id },
            update: { $set: { gmp: gmpData } }
          }
        });
        matchedCount++;
      }
    }
  }

  if (ops.length > 0) {
    await Ipo.bulkWrite(ops, { ordered: false });
    console.log(`[IPOGuru GMP] Successfully updated GMP in MongoDB for ${matchedCount} / ${allIpos.length} IPOs.`);
  }

  return {
    success: true,
    matchedCount,
    totalIpos: allIpos.length
  };
}

module.exports = {
  fetchIpoGuruGmpList,
  enrichIposWithGmp,
  findMatchingGuruIpo,
  extractGmpDetails,
  refreshGmpInDatabase
};
