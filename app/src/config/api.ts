// Application API Configuration
// Change this to your Render backend URL (e.g. 'https://your-ipo-backend.onrender.com')

export const DEFAULT_RENDER_API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://ipo-allotment-backend.onrender.com';

export const FALLBACK_API_URLS = [
  DEFAULT_RENDER_API_URL,
  'https://www.pkctechs.com',
  'http://localhost:5000'
];

export const API_CONFIG = {
  baseUrl: DEFAULT_RENDER_API_URL.replace(/\/$/, ''),
  endpoints: {
    ipos: '/api/ipos',
    health: '/api/health',
    detail: (id: string) => `/api/ipos/${id}`,
  },
  timeoutMs: 15000, // Render free tier can take a few seconds to wake up from sleep
};
