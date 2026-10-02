'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function GoogleSerpPreview() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSchemaTab, setActiveSchemaTab] = useState('PREVIEW'); // 'PREVIEW' or 'JSONLD'

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com';

  const sitelinks = [
    {
      title: 'How to Check IPO Allotment?',
      snippet: 'Check IPO allotment status online with PAN number, Application number, or DP Client ID on pkctechs...',
      href: '#allotment-checker'
    },
    {
      title: 'Live IPO Subscription & Demand',
      snippet: 'Real-time subscription status, QIB, NII, Retail demand, and verified bidding numbers for open IPOs...',
      href: '/?tab=OPEN#ipo-listings'
    },
    {
      title: 'IPO Dashboard (Mainboard & SME)',
      snippet: 'Explore all open, upcoming, and closed Mainboard and SME IPOs on NSE and BSE with complete timetable...',
      href: '/?tab=ALL#ipo-listings'
    },
    {
      title: 'Upcoming IPOs Calendar & Price Bands',
      snippet: 'Stay ahead with the latest upcoming IPO issues, draft red herring prospectuses (DRHP), and listing dates...',
      href: '/?tab=UPCOMING#ipo-listings'
    }
  ];

  return (
    <div className="mt-8 mb-4">
      {/* Trigger Toggle */}
      <div className="bg-slate-100/80 rounded-xl border border-slate-200 p-3.5 sm:p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
            G
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">
              Google Search Result & Sitelinks Simulation
            </span>
            <span className="text-[11px] text-slate-500 block font-normal">
              Live SERP preview showing how search engines index pkctechs with sitelinks
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>{isOpen ? 'Hide Google Preview' : 'View Google SERP Result'}</span>
          <span>{isOpen ? '▲' : '▼'}</span>
        </button>
      </div>

      {/* Accordion Content */}
      {isOpen && (
        <div className="mt-3 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Search Query:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                pkctechs ipo
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveSchemaTab('PREVIEW')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  activeSchemaTab === 'PREVIEW'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Visual Google SERP
              </button>
              <button
                onClick={() => setActiveSchemaTab('JSONLD')}
                className={`text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                  activeSchemaTab === 'JSONLD'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Schema.org JSON-LD
              </button>
            </div>
          </div>

          {activeSchemaTab === 'PREVIEW' ? (
            <div className="mt-6 max-w-[650px] font-sans">
              {/* Google Result Header: Favicon + Breadcrumb */}
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-white text-[11px] font-bold shadow-2xs">
                  P
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-normal text-slate-800 leading-none">
                    pkctechs
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal leading-tight">
                    {siteUrl}
                  </span>
                </div>
              </div>

              {/* Main SERP Title */}
              <h3 className="text-lg sm:text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug mb-1">
                pkctechs: Latest IPO Information | Stock Broker Reviews | IPO Allotment Status
              </h3>

              {/* SERP Meta Snippet */}
              <p className="text-xs sm:text-[13px] text-[#4d5156] font-normal leading-relaxed mb-4">
                The Initial Public Offering (IPO) platform by pkctechs. Live subscription tracking, allotment status checker, official price bands, lot size calculator, DRHP timeline, and direct registrar links for Mainboard and SME IPOs.
              </p>

              {/* Google Sitelinks Grid (4 rich sublinks) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-3 border-t border-slate-100">
                {sitelinks.map((sitelink, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <Link
                      href={sitelink.href}
                      onClick={(e) => {
                        if (sitelink.href.startsWith('#')) {
                          e.preventDefault();
                          const el = document.querySelector(sitelink.href);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-sm font-medium text-[#1a0dab] hover:underline block leading-snug"
                    >
                      {sitelink.title}
                    </Link>
                    <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-2">
                      {sitelink.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
{`{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.pkctechs.com/#website",
      "url": "https://www.pkctechs.com",
      "name": "pkctechs",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.pkctechs.com/?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://www.pkctechs.com/#organization",
      "name": "pkctechs",
      "url": "https://www.pkctechs.com",
      "logo": "https://www.pkctechs.com/icon.svg"
    },
    {
      "@type": "ItemList",
      "@id": "https://www.pkctechs.com/#sitelinks",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "How to Check IPO Allotment?",
          "url": "https://www.pkctechs.com/#allotment-checker"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Live IPO Subscription & Demand",
          "url": "https://www.pkctechs.com/?tab=OPEN"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "IPO Dashboard (Mainboard & SME)",
          "url": "https://www.pkctechs.com/?tab=ALL"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Upcoming IPOs Calendar & Dates",
          "url": "https://www.pkctechs.com/?tab=UPCOMING"
        }
      ]
    }
  ]
}`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
