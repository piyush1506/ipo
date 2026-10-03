import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'About Us | pkctechs IPO Intelligence Platform',
  description: 'Learn about pkctechs, our mission to simplify Indian IPO tracking, real-time data streaming architecture, editorial standards, and our team.',
  alternates: {
    canonical: 'https://www.pkctechs.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">About Us</span>
        </nav>

        {/* Header Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>✨ About Our Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Democratizing Indian IPO Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            pkctechs is an independent Indian primary market intelligence and allotment status portal. We empower everyday retail investors with institutional-grade data, real-time subscription streaming, and instant registrar verification tools.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-4">
              ⚡
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Real-Time Data Feed</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Direct primary market data streaming with live subscription numbers, QIB/NII/Retail breakdown, and instant updates.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-4">
              🔍
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Direct Allotment Hub</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Instant routing to official registrars (Link Intime, KFintech, Bigshare) without saving your sensitive personal identifiers.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl mb-4">
              🛡️
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1.5">Unbiased Transparency</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              100% independent and educational. No paid stock recommendations, no hidden fees, and full regulatory transparency.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Our Mission</h2>
            <p className="mb-3">
              The Indian stock market has seen an unprecedented surge in retail participation in Initial Public Offerings (IPOs) across both Mainboard (BSE/NSE) and SME platforms (BSE SME & NSE Emerge). However, retail investors often face scattered data across dozens of registrar portals, complex DRHP filings, outdated subscription multiples, and confusing allotment verification processes.
            </p>
            <p>
              <strong>pkctechs</strong> was established with a singular objective: to build a lightning-fast, beautifully designed, and completely transparent dashboard that aggregates everything an Indian retail investor needs to track, evaluate, and verify IPO issues in one unified platform.
            </p>
          </section>

          {/* Section 2 - What We Provide */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">What We Provide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">📊 Comprehensive IPO Directory</h4>
                <p className="text-xs text-slate-500 font-normal">
                  Live tracking of active, upcoming, and recently listed Mainboard and SME IPOs with full price bands, lot sizes, and issue timelines.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">🧮 Interactive Investment Calculator</h4>
                <p className="text-xs text-slate-500 font-normal">
                  Dynamic calculations for Retail, sHNI (Small HNI), and bHNI (Big HNI) categories with exact lot sizes and maximum allowable UPI limits.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">⚡ Direct Registrar Allotment Status</h4>
                <p className="text-xs text-slate-500 font-normal">
                  Smart routing system that identifies the official registrar for any given IPO and directs users directly to the secure verification page.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">📚 In-Depth Investor Guides</h4>
                <p className="text-xs text-slate-500 font-normal">
                  Educational explainers on ASBA bidding, UPI mandate approval timelines, cut-off pricing, and the SEBI lottery allotment mechanism.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Data Architecture & Sourcing */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Data Integrity & Sourcing</h2>
            <p className="mb-3">
              We believe in data accuracy and integrity. Our platform aggregates and normalizes data from verified market sources:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li><strong>Primary Market Feeds:</strong> Live market data streamed via enterprise broker APIs (Upstox Primary Market API).</li>
              <li><strong>Exchange Disclosures:</strong> Official public bidding data and circulars published by the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE).</li>
              <li><strong>Registrar Filings:</strong> Basis of allotment documents and registrar announcements from Link Intime, KFintech, Bigshare, Maashitla, and Skyline.</li>
              <li><strong>Issuer Documentation:</strong> Official Draft Red Herring Prospectuses (DRHP) and Red Herring Prospectuses (RHP) filed with SEBI.</li>
            </ul>
          </section>

          {/* Section 4 - Editorial Independence */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Editorial Independence & Policy</h2>
            <p className="mb-3">
              pkctechs operates under strict editorial independence. We do not accept sponsored IPO reviews, paid ratings, or promotional endorsements from issuer companies or merchant bankers. All mathematical calculations, valuation comparisons, and subscription statistics are presented objectively without financial bias.
            </p>
            <p className="text-xs text-slate-500">
              For complete legal terms and regulatory disclaimers, please consult our{' '}
              <Link href="/terms" className="text-slate-900 underline font-medium">Terms of Service</Link> and{' '}
              <Link href="/disclaimer" className="text-slate-900 underline font-medium">Regulatory Disclaimer</Link>.
            </p>
          </section>

          {/* Section 5 - Team & Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Get in Touch</h2>
            <p className="mb-4">
              Have feedback, data correction requests, or questions? Our team is always eager to hear from fellow market enthusiasts:
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-dark-primary text-xs">
                Contact Our Team
              </Link>
              <Link href="/ipo-guide" className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                Read IPO Guide
              </Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
