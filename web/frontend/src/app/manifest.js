export default function manifest() {
  return {
    name: 'pkctechs — Live Indian IPO Tracker & Allotment Checker',
    short_name: 'pkctechs',
    description: 'pkctechs real-time Indian IPO tracking platform with price bands, lot sizes, live subscription rates, SEBI timelines, and registrar allotment status.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#334155',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
