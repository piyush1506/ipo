import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Financial & Legal Disclaimer | pkctechs IPO Intelligence',
  description: 'Important legal disclosure, market risk warnings, non-SEBI registration declaration, and limitation of liability for pkctechs IPO platform.',
  alternates: {
    canonical: 'https://www.pkctechs.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = 'October 3, 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Disclaimer</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 mb-4">
            <span>⚖️ Statutory Financial & Legal Disclosures</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Financial & Legal Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Last Updated: {lastUpdated} &nbsp;•&nbsp; Mandatory Disclosure for all pkctechs visitors
          </p>
        </div>

        {/* Prominent Warning Callout */}
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 mb-8 text-slate-800">
          <h2 className="text-base font-bold text-amber-950 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            CRITICAL REGULATORY & INVESTMENT NOTICE
          </h2>
          <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Investments in Initial Public Offerings (IPOs), equity shares, and debt instruments are subject to significant market risks.</strong> Past performance, subscription rates, Grey Market Premium (GMP) numbers, and historical listing gains are not indicative of future returns. Please read the Red Herring Prospectus (RHP) and all relevant offer documents issued by the issuer company before investing.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 - SEBI Non-Registration */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">1</span>
              Non-SEBI Registered Entity Declaration
            </h2>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
              <p>
                <strong>pkctechs (pkctechs.com)</strong> is an independent software tool and financial information portal.
              </p>
              <p>
                <strong>pkctechs is NOT registered with the Securities and Exchange Board of India (SEBI)</strong> under SEBI (Research Analysts) Regulations, 2014, SEBI (Investment Advisers) Regulations, 2013, or any other SEBI rules or statutory provisions.
              </p>
              <p>
                We do NOT provide portfolio management services, stock tips, buy/sell recommendations, target prices, or personalized investment advisory.
              </p>
            </div>
          </section>

          {/* Section 2 - Informational & Educational Purposes Only */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">2</span>
              Strictly Informational and Educational Purpose
            </h2>
            <p className="mb-3">
              All content provided on this website—including IPO calendars, issue price bands, lot size calculation tables, timeline dates (open, close, allotment, refund, listing), category reservation quotas (QIB, NII/HNI, Retail, Employee), subscription multiples, company financial summaries, and Grey Market Premium (GMP) indicators—is published <strong>exclusively for general informational, tracking, and educational purposes</strong>.
            </p>
            <p className="text-xs text-slate-600">
              None of the data, tables, charts, or editorial descriptions should be construed as legal, tax, financial, accounting, or investment advice. You must consult a qualified SEBI-registered financial advisor or your licensed stock broker prior to making any financial investment or IPO application.
            </p>
          </section>

          {/* Section 3 - No Allotment Guarantee */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">3</span>
              No Guarantee of Allotment or Application Success
            </h2>
            <p className="mb-3">
              pkctechs does not accept IPO bids, does not participate in the bidding process, and does not guarantee share allotment in any Mainboard or SME public issue.
            </p>
            <p className="text-xs text-slate-600">
              In India, share allotment is determined strictly by the Registrar to the Issue according to SEBI allotment rules and the Basis of Allotment finalized in consultation with Stock Exchanges (BSE and NSE). In oversubscribed retail categories, allotment is carried out via an automated computerized lottery mechanism conducted by the registrar. pkctechs has no influence, connection, or role in the allotment decision.
            </p>
          </section>

          {/* Section 4 - No Affiliation with Registrars or Exchanges */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">4</span>
              No Affiliation with Official Registrars, Exchanges, or Brokers
            </h2>
            <p className="mb-3">
              pkctechs is an independent technology platform. We are NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li>Official IPO Registrars (including Link Intime India Pvt. Ltd., KFin Technologies Ltd., Bigshare Services Pvt. Ltd., Maashitla Securities, Cameo Corporate, Skyline Financial, etc.)</li>
              <li>Stock Exchanges (National Stock Exchange of India - NSE, Bombay Stock Exchange - BSE)</li>
              <li>Market Regulators (Securities and Exchange Board of India - SEBI, Reserve Bank of India - RBI)</li>
              <li>Depository Participants (NSDL, CDSL)</li>
              <li>Stock Brokers (Upstox, Zerodha, Groww, Angel One, ICICI Direct, HDFC Sky, etc.)</li>
            </ul>
            <p className="mt-3 text-xs text-slate-600">
              All names, logos, trademarks, and registered trademarks displayed on pkctechs remain the property of their respective owners. Their mention is strictly for informational identification and reference under fair use.
            </p>
          </section>

          {/* Section 5 - Zero Collection of Sensitive Financial Identifiers */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">5</span>
              No Collection or Storage of Sensitive Financial Identifiers
            </h2>
            <p className="mb-3">
              Our Allotment Checker Hub acts as a client-side navigation tool designed to assist users in identifying the registrar and navigating directly to the official registrar checking portal.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1.5">
              <p>• We do NOT collect, save, transmit, or store your PAN Number, Application Number, or DP ID / Demat Client ID on any server.</p>
              <p>• We do NOT have access to your bank accounts, UPI mandates, Demat portfolios, or trading records.</p>
              <p>• All verification requests occur directly between your browser and the verified third-party registrar servers.</p>
            </div>
          </section>

          {/* Section 6 - Third-Party Data Feeds & Accuracy Disclaimer */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">6</span>
              Data Accuracy, Latency & Third-Party APIs
            </h2>
            <p className="mb-3">
              Data displayed on pkctechs is ingested from third-party primary market feeds (including Upstox Primary Market API), exchange public disclosures, and issuer filings. While we strive to maintain high accuracy and real-time freshness, we cannot and do not warrant that the data is 100% complete, error-free, uninterrupted, or timely.
            </p>
            <p className="text-xs text-slate-600">
              Market data, Grey Market Premiums (GMP), subscription multiples, and schedules can change dynamically without notice. Always cross-verify critical dates, price bands, and allotment basis on the official BSE/NSE websites and registrar portals.
            </p>
          </section>

          {/* Section 7 - Complete Release of Legal Action & Liability Waiver */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">7</span>
              Release of Legal Action & Limitation of Liability
            </h2>
            <p className="mb-3">
              BY USING PKCTECHS.COM, YOU EXPRESSLY AGREE THAT:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600">
              <li>
                <strong>Waiver of Claims:</strong> You unconditionally waive, release, and forfeit any right to initiate any lawsuit, class action, regulatory complaint, consumer dispute, arbitration, or legal proceedings against pkctechs, its website creators, developers, administrators, contributors, or partners.
              </li>
              <li>
                <strong>Total Release of Damages:</strong> pkctechs shall not be liable for any direct, indirect, incidental, punitive, special, or consequential damages resulting from reliance on website data, investment decisions, lost profits, financial loss, bidding mistakes, UPI mandate failures, or missed allotment opportunities.
              </li>
              <li>
                <strong>User Responsibility:</strong> All investment decisions, bidding amounts, UPI authorizations, and financial risk are undertaken solely and exclusively at your own risk and discretion.
              </li>
            </ul>
          </section>

          {/* Section 8 - Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">8</span>
              Contact and Compliance
            </h2>
            <p className="mb-4">
              If you have any questions regarding these regulatory and legal disclaimers, please contact our compliance desk:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-1.5">
              <p><strong>Platform:</strong> pkctechs IPO Intelligence Platform</p>
              <p><strong>Compliance Email:</strong> <a href="mailto:compliance@pkctechs.com" className="text-slate-900 font-semibold underline">compliance@pkctechs.com</a></p>
              <p><strong>General Support:</strong> <a href="mailto:support@pkctechs.com" className="text-slate-900 font-semibold underline">support@pkctechs.com</a></p>
              <p><strong>Direct Inquiries:</strong> <Link href="/contact" className="text-slate-900 font-semibold underline">pkctechs.com/contact</Link></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
