import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Terms & Conditions | pkctechs IPO Intelligence',
  description: 'Read the terms of service, conditions of use, limitation of liability, and legal disclaimers governing the use of pkctechs.com IPO information platform.',
  alternates: {
    canonical: 'https://www.pkctechs.com/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'October 3, 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Terms & Conditions</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>📜 Legal Terms of Service</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Terms and Conditions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Effective Date: {lastUpdated} &nbsp;•&nbsp; Please read these terms carefully before utilizing our services.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">1</span>
              Agreement to Terms
            </h2>
            <p className="mb-3">
              These Terms and Conditions (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) and <strong>pkctechs</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our,&rdquo; or &ldquo;pkctechs.com&rdquo;), concerning your access to and use of the website{' '}
              <a href="https://www.pkctechs.com" className="text-slate-900 font-medium underline">https://www.pkctechs.com</a>, including any related mobile web apps, widgets, or data APIs (collectively, the &ldquo;Platform&rdquo;).
            </p>
            <p>
              By accessing, browsing, or using pkctechs, you acknowledge that you have read, understood, and agree to be bound by all of these Terms and our{' '}
              <Link href="/privacy-policy" className="text-slate-900 font-semibold underline">Privacy Policy</Link> and{' '}
              <Link href="/disclaimer" className="text-slate-900 font-semibold underline">Disclaimer</Link>. If you do not agree with all of these terms, you are expressly prohibited from using the site and must discontinue use immediately.
            </p>
          </section>

          {/* Section 2 - Informational & Educational Nature */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-slate-700">⚠️</span>
              2. Informational Purpose & SEBI Non-Registration Clause
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              <strong>pkctechs is NOT registered with the Securities and Exchange Board of India (SEBI)</strong> as an Investment Advisor, Research Analyst, Stock Broker, Portfolio Manager, or Merchant Banker under any SEBI (Investment Advisers) Regulations, 2013 or related statutory guidelines.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              All information, IPO schedules, bidding dates, issue price bands, lot calculations, Grey Market Premium (GMP) estimates, live subscription tallies, and financial ratios displayed on pkctechs are provided solely for general informational, educational, and reference purposes. <strong>Nothing on this website constitutes investment advice, financial consultation, stock recommendation, or solicitation to purchase securities.</strong>
            </p>
          </section>

          {/* Section 3 - Limitation of Liability & Legal Protection */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">3</span>
              Absolute Limitation of Liability & Release of Legal Action
            </h2>
            <p className="mb-3">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL PKCTECHS, ITS FOUNDERS, OWNERS, EMPLOYEES, AFFILIATES, AGENTS, DATA LICENSORS, OR SUPPLIERS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li>Financial losses, loss of capital, loss of profits, lost revenue, or trading losses arising from IPO applications or stock market investments.</li>
              <li>Rejection, technical failure, UPI mandate delay, or non-allotment of IPO shares by any registrar, banker, exchange, or broker.</li>
              <li>Inaccuracies, omissions, typographical errors, or latency in subscription rates, lot size tables, listing dates, or price bands.</li>
              <li>Server downtime, interruptions, API feed delays, transmission failures, or software bugs.</li>
              <li>Actions taken or decisions made based on data, articles, or tools available on pkctechs.com.</li>
            </ul>
            <p className="mt-3 text-xs text-slate-600">
              You agree to waive, release, and hold harmless pkctechs and its operators from any claims, suits, demands, disputes, or legal actions arising out of your use of or inability to use this platform.
            </p>
          </section>

          {/* Section 4 - Disclaimer of Warranties */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">4</span>
              Disclaimer of Warranties (&ldquo;AS IS&rdquo; Basis)
            </h2>
            <p>
              The platform, including all information, tools, calculations, and content, is provided on an <strong>&ldquo;AS IS&rdquo;</strong> and <strong>&ldquo;AS AVAILABLE&rdquo;</strong> basis without warranties of any kind, whether express, statutory, or implied. We expressly disclaim all warranties, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, timeliness, completeness, and uninterrupted availability.
            </p>
          </section>

          {/* Section 5 - User Conduct & Prohibited Uses */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">5</span>
              User Conduct and Prohibited Activities
            </h2>
            <p className="mb-3">
              When using pkctechs, you agree that you will not:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li>Use any automated scraping, crawling, bot, spider, or extraction script to systematically harvest data from the Platform without prior written consent.</li>
              <li>Attempt to reverse-engineer, decompile, or compromise the security architecture or source code of pkctechs.</li>
              <li>Interfere with or disrupt the normal operation of our servers or networks through DDoS attacks, payload injection, or spam.</li>
              <li>Use the Platform for any illegal, fraudulent, or unauthorized purpose violating Indian law or your local jurisdiction.</li>
              <li>Falsely represent affiliation with pkctechs, SEBI, stock exchanges, or official registrars.</li>
            </ul>
          </section>

          {/* Section 6 - Intellectual Property & Trademarks */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">6</span>
              Intellectual Property Rights & Third-Party Trademarks
            </h2>
            <p className="mb-3">
              All proprietary software, code, UI design, text, graphics, logos, and custom tools on pkctechs are the intellectual property of pkctechs and protected by copyright and intellectual property laws.
            </p>
            <p className="text-xs text-slate-600">
              All third-party company names, ticker symbols, logos, exchange names (NSE, BSE), and registrar trademarks (e.g., Link Intime, KFintech, Bigshare, Maashitla, Upstox) referenced on this platform remain the exclusive property of their respective trademark holders. Reference to them does not imply any affiliation, sponsorship, endorsement, or recommendation.
            </p>
          </section>

          {/* Section 7 - External Links & Third-Party Services */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">7</span>
              Third-Party Links & External Portals
            </h2>
            <p>
              The Platform provides outbound links for your convenience to official registrars, exchange portals, and broker platforms. pkctechs exercises no control over the content, policies, security, or availability of these external websites. Your interactions with third-party sites are conducted entirely at your own risk and subject to the respective terms and privacy policies of those external entities.
            </p>
          </section>

          {/* Section 8 - Indemnification */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">8</span>
              Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless pkctechs, its founders, operators, employees, contractors, and partners against any and all claims, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising from or relating to: (a) your use or misuse of the Platform; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) any investment or trading decisions made by you.
            </p>
          </section>

          {/* Section 9 - Governing Law & Jurisdiction */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">9</span>
              Governing Law and Jurisdiction
            </h2>
            <p>
              These Terms shall be governed by, construed, and enforced in accordance with the laws of India, without regard to its conflict of law principles. Any legal dispute, claim, or controversy arising out of or relating to these Terms or the Platform shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          {/* Section 10 - Modifications to Terms */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">10</span>
              Modifications and Updates
            </h2>
            <p>
              We reserve the right to revise or update these Terms at any time at our sole discretion. Any changes will be posted directly on this page with an updated Effective Date. Your continued use of pkctechs following the posting of revised Terms signifies your binding acceptance of the changes.
            </p>
          </section>

          {/* Section 11 - Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">11</span>
              Contact & Inquiries
            </h2>
            <p className="mb-4">
              For any questions or legal inquiries regarding these Terms and Conditions, please reach out to our legal compliance team:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-1.5">
              <p><strong>Platform:</strong> pkctechs IPO Intelligence Platform</p>
              <p><strong>Official Legal Inquiries:</strong> <a href="mailto:legal@pkctechs.com" className="text-slate-900 font-semibold underline">legal@pkctechs.com</a></p>
              <p><strong>General Support:</strong> <a href="mailto:support@pkctechs.com" className="text-slate-900 font-semibold underline">support@pkctechs.com</a></p>
              <p><strong>Direct Contact Form:</strong> <Link href="/contact" className="text-slate-900 font-semibold underline">pkctechs.com/contact</Link></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
