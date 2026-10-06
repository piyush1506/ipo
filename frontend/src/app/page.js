import HomeClient from './HomeClient';
import { FALLBACK_IPOS } from '../data/fallbackIpos';

const BACKEND_TIMEOUT_MS = 2500;

async function getInitialIPOs() {
  const backendUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:5000'
  ).replace(/\/$/, '');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(`${backendUrl}/api/ipos`, {
      headers: { Accept: 'application/json' },
      cache: 'force-cache',
      next: { revalidate: 60 },
      signal: controller.signal
    });

    if (!response.ok) {
      return FALLBACK_IPOS;
    }

    const payload = await response.json();
    if (payload.success && Array.isArray(payload.data) && payload.data.length > 0) {
      return payload.data;
    }
    return FALLBACK_IPOS;
  } catch (error) {
    console.warn('Initial IPO server fetch notice:', error.message);
    return FALLBACK_IPOS;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function HomePage() {
  const initialIpos = await getInitialIPOs();
  return <HomeClient initialIpos={initialIpos} />;
}
