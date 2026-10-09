import { getAllBlogPosts } from '../data/blogPosts';
import { FALLBACK_IPOS } from '../data/fallbackIpos';

export default async function sitemap() {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com').replace(/\/$/, '');
  const currentDate = new Date().toISOString();

  // Clean Canonical Static Routes (No query params)
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/allotment-status`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ipo-guide`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Blog Post Routes
  const blogPosts = getAllBlogPosts();
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishDate ? new Date(post.publishDate).toISOString() : currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Dynamic & Fallback IPO Detail Routes
  let iposList = FALLBACK_IPOS;
  try {
    const apiBase = (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${apiBase}/api/ipos`, {
      next: { revalidate: 3600 },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const fetched = Array.isArray(data) ? data : (data.data || []);
      if (Array.isArray(fetched) && fetched.length > 0) {
        iposList = fetched;
      }
    }
  } catch {
    // Silent fallback to FALLBACK_IPOS
    iposList = FALLBACK_IPOS;
  }

  const seenIds = new Set();
  const ipoRoutes = [];

  for (const item of iposList) {
    const id = item.ipoId || item.Symbol;
    if (id && !seenIds.has(id)) {
      seenIds.add(id);
      ipoRoutes.push({
        url: `${baseUrl}/ipo/${encodeURIComponent(id)}`,
        lastModified: item.lastupdated || item.updatedAt || currentDate,
        changeFrequency: 'daily',
        priority: 0.85,
      });
    }
  }

  return [...staticRoutes, ...blogRoutes, ...ipoRoutes];
}
