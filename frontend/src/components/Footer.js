'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-20 px-6 pt-14 pb-8 text-slate-600">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-10">
        {/* Brand Col */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <span className="text-base font-bold text-slate-900">
              pkc<span className="text-slate-500 font-medium">techs</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-sm mb-4">
            pkctechs is an independent Indian IPO intelligence engine streaming live primary market metrics, price bands, and direct registrar routing for retail investors.
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200">
            <span className="pulse-live"></span>
            <span className="text-[11px] text-slate-600 font-medium">
              Real-Time Upstox Market Stream
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
            IPO Market & Guides
          </h4>
          <ul className="list-none flex flex-col gap-2.5 text-xs font-normal">
            <li><Link href="/?tab=OPEN" className="text-slate-600 hover:text-slate-900 transition-colors">Open for Bidding</Link></li>
            <li><Link href="/?tab=UPCOMING" className="text-slate-600 hover:text-slate-900 transition-colors">Upcoming Pipeline</Link></li>
            <li><Link href="/?tab=CLOSED" className="text-slate-600 hover:text-slate-900 transition-colors">Recently Listed</Link></li>
            <li><Link href="/?tab=SME" className="text-slate-600 hover:text-slate-900 transition-colors">SME Platform Issues</Link></li>
            <li><Link href="/blog" className="text-slate-900 font-semibold hover:text-slate-700 transition-colors">IPO Blog & Analysis</Link></li>
            <li><Link href="/ipo-guide" className="text-slate-600 hover:text-slate-900 transition-colors">IPO Master Guide</Link></li>
          </ul>
        </div>

        {/* Major Registrars */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
            Official Registrars
          </h4>
          <ul className="list-none flex flex-col gap-2.5 text-xs font-normal">
            <li><a href="https://linkintime.co.in/initial_offer/public-issues.html" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Link Intime India ↗</a></li>
            <li><a href="https://ris.kfintech.com/ipostatus/" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">KFin Technologies ↗</a></li>
            <li><a href="https://www.bigshareonline.com/ipo_Allotment.html" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Bigshare Services ↗</a></li>
            <li><a href="https://www.maashitla.com/allotment-status/public-issues" target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-900 transition-colors">Maashitla Securities ↗</a></li>
          </ul>
        </div>

        {/* Legal & Compliance */}
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5">
            Legal & Policy
          </h4>
          <ul className="list-none flex flex-col gap-2.5 text-xs font-normal">
            <li><Link href="/privacy-policy" className="text-slate-600 hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-slate-600 hover:text-slate-900 transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/disclaimer" className="text-slate-600 hover:text-slate-900 transition-colors">Financial Disclaimer</Link></li>
            <li><Link href="/cookie-policy" className="text-slate-600 hover:text-slate-900 transition-colors">Cookie Policy</Link></li>
            <li><Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer Callout */}
      <div className="max-w-[1240px] mx-auto p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6 text-[11px] text-slate-500 leading-relaxed">
        <p className="mb-1">
          <strong className="text-slate-700">Statutory Regulatory Notice:</strong> pkctechs is an independent informational platform and is NOT registered with SEBI as an Investment Advisor or Research Analyst. None of the materials or data on this website constitute investment recommendations or financial advice. We do NOT store or log PAN numbers or sensitive user details. Equity and IPO investments are subject to market risk. Please review the official Red Herring Prospectus (RHP) before bidding.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1240px] mx-auto pt-5 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-400 font-normal">
        <span suppressHydrationWarning>© {new Date().getFullYear()} pkctechs. All rights reserved. Google AdSense & SEBI compliant.</span>
        <div className="flex gap-4">
          <Link href="/privacy-policy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          <Link href="/disclaimer" className="hover:text-slate-600 transition-colors">Disclaimer</Link>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
