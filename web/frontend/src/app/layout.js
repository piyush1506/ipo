import { Inter } from 'next/font/google';
import Script from 'next/script';
import "./globals.css";
import CookieBanner from '../components/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'pkctechs: Latest IPO Information | Stock Broker Reviews | IPO Allotment Status',
    template: '%s | pkctechs',
  },
  description: 'The Initial Public Offering (IPO) platform by pkctechs. Live subscription tracking, allotment status checker, official price bands, lot size calculator, DRHP timeline, and direct registrar links for Mainboard and SME IPOs.',
  keywords: [
    'pkctechs',
    'IPO',
    'IPO Allotment',
    'Chittorgarh',
    'IPO Subscription',
    'Mainboard IPO',
    'SME IPO',
    'BSE',
    'NSE',
    'Upstox IPO',
    'Registrar Allotment Status',
    'IPO Allotment Checker',
    'IPO Listing Dates',
    'IPO Issue Size'
  ],
  authors: [{ name: 'pkctechs', url: siteUrl }],
  creator: 'pkctechs',
  publisher: 'pkctechs',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'pkctechs: Latest IPO Information | IPO Allotment Status | Stock & SME IPOs',
    description: 'Real-time Indian IPO tracking platform with price bands, lot sizes, live subscription rates, timelines, and registrar allotment status on pkctechs.',
    url: siteUrl,
    siteName: 'pkctechs',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'pkctechs IPO Intelligence Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'pkctechs: Latest IPO Information & Allotment Status',
    description: 'Real-time Indian IPO tracking platform with price bands, subscription rates, and allotment status on pkctechs.',
    site: '@pkctechs',
    creator: '@pkctechs',
    images: ['/icon.svg'],
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: [
      { url: '/icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ],
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'agXT8M9maUK56Q-9h9DQgKKZfeEUsTboj7xO3e12Tl4',
  },
  other: {
    'google-adsense-account': 'ca-pub-9516698796421486',
  },
};

export default function RootLayout({ children }) {
  // Google Rich Sitelinks & Structured Data
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        'url': siteUrl,
        'name': 'pkctechs',
        'description': 'Latest IPO Information, Subscription Status, and Allotment Status Checking Portal.',
        'publisher': {
          '@id': `${siteUrl}/#organization`,
        },
        'potentialAction': [
          {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${siteUrl}/?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        ],
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        'name': 'pkctechs',
        'url': siteUrl,
        'logo': {
          '@type': 'ImageObject',
          'url': `${siteUrl}/icon.svg`,
          'caption': 'pkctechs Logo',
        },
        'sameAs': [
          'https://twitter.com/pkctechs',
          'https://linkedin.com/company/pkctechs',
        ],
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#sitelinks`,
        'name': 'pkctechs IPO Sitelinks',
        'itemListElement': [
          {
            '@type': 'SiteNavigationElement',
            'position': 1,
            'name': 'IPO GMP Today & Expected Listing Gains',
            'description': 'Track today\'s live Grey Market Premium (GMP), expected listing price, profit per lot, and Kostak rates for Mainboard & SME IPOs.',
            'url': `${siteUrl}/?tab=OPEN`,
          },
          {
            '@type': 'SiteNavigationElement',
            'position': 3,
            'name': 'Live IPO Subscription & Demand',
            'description': 'Real-time subscription status, QIB, NII, Retail demand, and live updates for active IPOs.',
            'url': `${siteUrl}/?tab=OPEN`,
          },
          {
            '@type': 'SiteNavigationElement',
            'position': 4,
            'name': 'IPO Dashboard (Mainboard & SME)',
            'description': 'Explore all open, upcoming, and closed Mainboard and SME IPOs on NSE and BSE with full details.',
            'url': `${siteUrl}/?tab=ALL`,
          },
          {
            '@type': 'SiteNavigationElement',
            'position': 5,
            'name': 'SME IPO Platform',
            'description': 'Small and medium enterprises (SME) IPO listings, lot details, minimum investment, and timelines.',
            'url': `${siteUrl}/?tab=SME`,
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={inter.className} style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        {children}
        <CookieBanner />

        {/* Google Analytics (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-8TEVCHMFE9"
        />
        <Script
          id="google-gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8TEVCHMFE9', { page_path: window.location.pathname });
            `,
          }}
        />

        {/* Google AdSense */}
        <Script
          id="google-adsense"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9516698796421486"
          crossOrigin="anonymous"
        />

        {/* JSON-LD Structured Data for Google SEO */}
        <Script
          id="schema-structured-data"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </body>
    </html>
  );
}
