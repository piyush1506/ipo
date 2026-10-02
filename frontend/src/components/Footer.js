'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 px-6 pt-12 pb-8 text-slate-600">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-9 mb-10">
        {/* Brand Col */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-600 flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900">
              pkc<span className="text-slate-500 font-medium">techs</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-normal">
            pkctechs Indian IPO tracking engine streaming 100% real-time data from the Upstox Primary Market API.
          </p>
          <div className="mt-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
            <span className="pulse-live"></span>
            <span className="text-[11px] text-slate-600 font-medium">
              Real Upstox Stream
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3.5">
            IPO Offerings
          </h4>
          <ul className="list-none flex flex-col gap-2.5 text-xs font-normal">
            <li><Link href="/#open-ipos" className="text-slate-600 hover:text-slate-900 transition-colors">Open for Bidding</Link></li>
            <li><Link href="/#upcoming-ipos" className="text-slate-600 hover:text-slate-900 transition-colors">Upcoming Pipeline</Link></li>
            <li><Link href="/#closed-ipos" className="text-slate-600 hover:text-slate-900 transition-colors">Recently Closed</Link></li>
          </ul>
        </div>

        {/* Major Registrars */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3.5">
            Registrar Portals
          </h4>
          <ul className="list-none flex flex-col gap-2.5 text-xs font-normal">
            <li><a href="https://linkintime.co.in" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Link Intime India ↗</a></li>
            <li><a href="https://ris.kfintech.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">KFin Technologies ↗</a></li>
            <li><a href="https://www.bigshareonline.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Bigshare Services ↗</a></li>
            <li><a href="https://www.maashitla.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Maashitla Securities ↗</a></li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div>
          <h4 className="text-sm font-semibold text-slate-800 mb-3.5">
            Disclaimer
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Investments in IPOs are subject to market risks. Real data is sourced from Upstox Primary Market API. Please read the Red Herring Prospectus (RHP) before applying.
          </p>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto pt-5 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-400 font-normal">
        <span>© {new Date().getFullYear()} pkctechs. All rights reserved. Upstox API.</span>
        <span>Built by pkctechs with Next.js & Upstox Market Stream</span>
      </div>
    </footer>
  );
}
