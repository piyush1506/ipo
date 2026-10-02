export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com';
  const currentDate = new Date().toISOString();

  // Static routes / Sitelinks
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/?tab=OPEN`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/?tab=UPCOMING`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/?tab=CLOSED`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/?tab=SME`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.85,
    },
  ];

  let ipoRoutes = [];
  try {
    const res = await fetch('http://localhost:5000/api/ipos', { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const ipos = Array.isArray(data) ? data : (data.data || []);
      ipoRoutes = ipos.map((item) => ({
        url: `${baseUrl}/ipo/${item.ipoId || item.Symbol}`,
        lastModified: item.updatedAt || currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error('Sitemap dynamic IPO fetch fallback:', err);
  }

  return [...staticRoutes, ...ipoRoutes];
}
