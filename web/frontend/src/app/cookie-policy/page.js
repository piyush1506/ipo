import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Cookie Policy | pkctechs IPO Intelligence',
  description: 'Understand how pkctechs and Google AdSense utilize cookies, web beacons, and local storage to optimize performance and serve ads.',
  alternates: {
    canonical: 'https://www.pkctechs.com/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = 'October 3, 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Cookie Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>🍪 Tracking & Cookie Technologies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Cookie Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Effective Date: {lastUpdated} &nbsp;•&nbsp; Explaining how pkctechs.com uses cookies and tracking technologies.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. What Are Cookies?</h2>
            <p className="mb-3">
              Cookies are small text files that are stored on your computer, smartphone, or tablet when you visit a website. They are widely used by web developers to make websites work efficiently, save user interface preferences, and provide analytical reporting data.
            </p>
            <p>
              Along with cookies, we may use related web technologies such as web beacons, pixel tags, and browser local storage to maintain session state.
            </p>
          </section>

          {/* Section 2 - Categories of Cookies */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Categories of Cookies We Use</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">⚙️ Essential & Functional Cookies</h4>
                <p className="text-xs text-slate-600 font-normal">
                  These cookies and local storage variables are strictly necessary for the core operation of our platform. They remember your active filter tabs (e.g., OPEN vs UPCOMING IPOs), display preferences (Grid Card vs Table list view), and cookie consent choice.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">📊 Performance & Analytical Cookies</h4>
                <p className="text-xs text-slate-600 font-normal">
                  We utilize analytics providers, such as Google Analytics 4 (<code>G-8TEVCHMFE9</code>), to gather anonymized aggregate statistics on visitor volume, page views, session duration, and device types. This allows us to optimize load times and improve user experience.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">📢 Advertising & Marketing Cookies (Google AdSense & DART)</h4>
                <p className="text-xs text-slate-600 font-normal">
                  Third-party ad vendors, including <strong>Google AdSense</strong>, use cookies to serve ads based on your prior visits to our website or other websites across the Internet. Google&apos;s use of advertising cookies enables it and its partners to serve relevant ads based on your visit to pkctechs and other websites on the internet.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 - Opting Out of Cookies */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. How Can You Control or Opt Out of Cookies?</h2>
            <p className="mb-3">
              You have the right to decide whether to accept or reject cookies. You can manage or disable advertising cookies through several mechanisms:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-xs text-slate-600">
              <li>
                <strong>Google Ads Settings:</strong> Opt out of personalized Google advertising at{' '}
                <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-medium">
                  adssettings.google.com
                </a>.
              </li>
              <li>
                <strong>Digital Advertising Alliance (DAA):</strong> Opt out of multiple ad networks simultaneously via{' '}
                <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-medium">
                  optout.aboutads.info
                </a>.
              </li>
              <li>
                <strong>Your Online Choices (EU/EEA):</strong> European visitors can manage cookie preferences at{' '}
                <a href="https://www.youronlinechoices.eu" target="_blank" rel="noopener noreferrer" className="text-slate-900 underline font-medium">
                  youronlinechoices.eu
                </a>.
              </li>
              <li>
                <strong>Browser Settings:</strong> You can configure your browser (Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge) to refuse all cookies or notify you when a cookie is sent.
              </li>
            </ul>
          </section>

          {/* Section 4 - Policy Updates */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Updates to This Cookie Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect modifications in operational practices, technological enhancements, or regulatory mandates. We encourage you to review this page periodically.
            </p>
          </section>

          {/* Section 5 - Contact */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Contact Us</h2>
            <p className="mb-4">
              If you have any questions regarding our use of cookies or tracking technologies, please contact us at:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
              <p>Email: <a href="mailto:privacy@pkctechs.com" className="text-slate-900 font-semibold underline">privacy@pkctechs.com</a></p>
              <p className="mt-1">More information: <Link href="/privacy-policy" className="text-slate-900 font-semibold underline">Privacy Policy</Link></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
