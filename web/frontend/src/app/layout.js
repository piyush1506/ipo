import { Inter } from 'next/font/google';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import CookieBanner from '../components/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://pkctechs.in').replace(/\/$/, '');

// Structured Data for Google SEO — rendered server-side for crawler visibility
const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      'url': siteUrl,
      'name': 'pkctechs',
      'alternateName': 'pkctechs IPO',
      'description': 'Latest IPO Information, Subscription Status, and Allotment Status Checking Portal for Indian Mainboard & SME IPOs.',
      'inLanguage': 'en-IN',
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
        'width': 512,
        'height': 512,
        'caption': 'pkctechs Logo',
      },
      'sameAs': [
        'https://twitter.com/pkctechs',
        'https://linkedin.com/company/pkctechs',
      ],
      'contactPoint': {
        '@type': 'ContactPoint',
        'contactType': 'customer support',
        'url': `${siteUrl}/contact`,
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${siteUrl}/#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteUrl,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'IPO Allotment Status',
          'item': `${siteUrl}/allotment-status`,
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'IPO Blog & Guides',
          'item': `${siteUrl}/blog`,
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': 'IPO Guide',
          'item': `${siteUrl}/ipo-guide`,
        },
        {
          '@type': 'ListItem',
          'position': 5,
          'name': 'About Us',
          'item': `${siteUrl}/about`,
        },
        {
          '@type': 'ListItem',
          'position': 6,
          'name': 'Contact Us',
          'item': `${siteUrl}/contact`,
        },
      ],
    },
    {
      '@type': 'ItemList',
      '@id': `${siteUrl}/#sitelinks`,
      'name': 'pkctechs Site Navigation',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'IPO Allotment Status Checker',
          'url': `${siteUrl}/allotment-status`,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': 'IPO Blog & Analysis',
          'url': `${siteUrl}/blog`,
        },
        {
          '@type': 'ListItem',
          'position': 3,
          'name': 'Complete IPO Guide',
          'url': `${siteUrl}/ipo-guide`,
        },
        {
          '@type': 'ListItem',
          'position': 4,
          'name': 'About pkctechs',
          'url': `${siteUrl}/about`,
        },
        {
          '@type': 'ListItem',
          'position': 5,
          'name': 'Contact Us',
          'url': `${siteUrl}/contact`,
        },
      ],
    },
  ],
};

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
  // Preconnect to Google AdSense and related origins to improve LCP
  links: [
    { rel: 'preconnect', href: 'https://pagead2.googlesyndication.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://googlesyndication.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://www.google.com', crossorigin: 'anonymous' }
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data — rendered server-side in <head> so crawlers always see it */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className} style={{ margin: 0, padding: 0 }} suppressHydrationWarning>
        {children}
        <CookieBanner />
        <Analytics />
        <SpeedInsights />

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
      </body>
    </html>
  );
}