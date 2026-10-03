import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Privacy Policy | pkctechs IPO Intelligence',
  description: 'Learn how pkctechs collects, uses, and safeguards your information in compliance with Google AdSense, GDPR, CCPA, and Indian Digital Personal Data Protection guidelines.',
  alternates: {
    canonical: 'https://www.pkctechs.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'October 3, 2026';

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>🛡️ Legal & Privacy Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Effective Date: {lastUpdated} &nbsp;•&nbsp; Applicable to all visitors and users of pkctechs.com
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">1</span>
              Introduction and Overview
            </h2>
            <p className="mb-3">
              Welcome to <strong>pkctechs</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;), accessible at{' '}
              <a href="https://www.pkctechs.com" className="text-slate-900 font-medium underline">https://www.pkctechs.com</a>.
              Your privacy and trust are paramount to us. This Privacy Policy documents the types of personal and technical information collected and recorded by pkctechs and explains how we use, safeguard, and disclose that data in strict compliance with applicable data protection legislation, including the <strong>Google AdSense Publisher Policies</strong>, the <strong>General Data Protection Regulation (GDPR)</strong>, the <strong>California Consumer Privacy Act (CCPA/CPRA)</strong>, and the <strong>Digital Personal Data Protection Act (DPDP Act)</strong>.
            </p>
            <p>
              By accessing or using our website, tools, IPO calculators, or allotment checking services, you signify your acceptance of this Privacy Policy. If you do not agree with our policies, please discontinue your use of the website immediately.
            </p>
          </section>

          {/* Section 2 - No Financial Data Collection */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="text-slate-700">🔒</span>
              Important Notice: Zero Collection of Sensitive Financial Identifiers
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              pkctechs provides educational tools and direct registrar portal routing for Indian IPO allotment checks. <strong>We do NOT store, log, capture, or transmit your Permanent Account Number (PAN), Demat DP ID, Application Number, Bank Account Number, UPI PIN, or Trading Account credentials on our servers.</strong> Any search identifier entered on our interface is utilized solely in real time within your local browser session to generate direct deep-links to official registrar portals (e.g., Link Intime, KFintech, Bigshare).
            </p>
          </section>

          {/* Section 3 - Google AdSense & Advertising Cookies */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">2</span>
              Google AdSense & Third-Party Advertising Technologies
            </h2>
            <p className="mb-3">
              pkctechs partners with third-party vendors, including <strong>Google Inc. (Google AdSense)</strong>, to serve advertisements when you visit our website. These advertising networks employ automated technologies to measure ad effectiveness and personalize the advertising content displayed to you.
            </p>
            <div className="space-y-3 pl-4 border-l-2 border-slate-300">
              <p>
                <strong>DoubleClick DART Cookie:</strong> Google is a third-party vendor on our site. It uses cookies, specifically the DART cookie, to serve targeted ads to our site visitors based upon their visit to pkctechs.com and other websites on the internet.
              </p>
              <p>
                <strong>Ad Personalization Opt-Out:</strong> Users may opt out of the use of the DART cookie and personalized advertising at any time by visiting the{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold underline hover:text-slate-700"
                >
                  Google Ad and Content Network Privacy Policy & Ads Settings
                </a>.
              </p>
              <p>
                <strong>Network Advertising Initiative (NAI):</strong> You can also opt out of participating third-party vendor cookies across the web by visiting the{' '}
                <a
                  href="https://optout.aboutads.info/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold underline hover:text-slate-700"
                >
                  Digital Advertising Alliance (DAA) Opt-Out Portal
                </a>{' '}
                or the{' '}
                <a
                  href="https://www.networkadvertising.org/choices/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-900 font-semibold underline hover:text-slate-700"
                >
                  Network Advertising Initiative Opt-Out Page
                </a>.
              </p>
            </div>
          </section>

          {/* Section 4 - Log Files & Web Analytics */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">3</span>
              Log Files and Web Analytics
            </h2>
            <p className="mb-3">
              Like virtually all standard web applications, pkctechs utilizes standard server log files and analytics software (including Google Analytics 4, Tag Manager ID: <code>G-8TEVCHMFE9</code>). The information collected includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li>Internet Protocol (IP) addresses (anonymized/aggregated)</li>
              <li>Browser type and version</li>
              <li>Internet Service Provider (ISP)</li>
              <li>Date and time stamp of visits</li>
              <li>Referring and exit pages</li>
              <li>Number of clicks and navigational paths across the site</li>
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              This information is not linked to any information that is personally identifiable. The sole purpose is to analyze broad demographic trends, administer the website, optimize server performance, prevent distributed denial-of-service (DDoS) attacks, and maintain operational stability.
            </p>
          </section>

          {/* Section 5 - Cookies & Web Beacons */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">4</span>
              Cookies and Web Beacons
            </h2>
            <p className="mb-3">
              Cookies are small text files placed on your device to store user preferences, session configurations (such as card/table display modes, dark/light settings, or active filter tabs), and record session information.
            </p>
            <p>
              You can choose to disable or selectively turn off our cookies or third-party cookies in your browser settings. However, doing so may affect how you are able to interact with our site and other websites. For detailed cookie management steps, please read our dedicated{' '}
              <Link href="/cookie-policy" className="text-slate-900 font-semibold underline hover:text-slate-700">Cookie Policy</Link>.
            </p>
          </section>

          {/* Section 6 - CCPA / CPRA Privacy Rights */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">5</span>
              California Consumer Privacy Act (CCPA / CPRA)
            </h2>
            <p className="mb-3">
              Under the CCPA and CPRA, California residents possess specific rights regarding their personal data:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li><strong>Right to Know:</strong> Request disclosure of categories and specific pieces of personal data collected.</li>
              <li><strong>Right to Delete:</strong> Request deletion of any personal data collected from the consumer.</li>
              <li><strong>Right to Opt-Out:</strong> Direct us not to sell or share your personal information. (Note: pkctechs does not sell personal information to any third party).</li>
              <li><strong>Right to Non-Discrimination:</strong> We will never discriminate against you for exercising your privacy rights.</li>
            </ul>
          </section>

          {/* Section 7 - GDPR Data Protection Rights */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">6</span>
              GDPR Data Protection Rights (European Union & UK)
            </h2>
            <p className="mb-3">
              If you reside within the European Economic Area (EEA) or United Kingdom, you are entitled to the full spectrum of GDPR rights:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-600">
              <li><strong>The Right to Access:</strong> You have the right to request copies of your personal data.</li>
              <li><strong>The Right to Rectification:</strong> You have the right to request correction of inaccurate or incomplete information.</li>
              <li><strong>The Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> You have the right to request deletion of your personal data under certain conditions.</li>
              <li><strong>The Right to Restrict Processing:</strong> You have the right to request that we restrict processing of your personal data.</li>
              <li><strong>The Right to Object to Processing:</strong> You have the right to object to our processing of your personal data.</li>
              <li><strong>The Right to Data Portability:</strong> You have the right to request transfer of your data to another organization.</li>
            </ul>
          </section>

          {/* Section 8 - Children's Privacy (COPPA) */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">7</span>
              Children&apos;s Online Privacy Protection (COPPA)
            </h2>
            <p>
              Protecting the online privacy of children is especially critical. pkctechs is an informational stock market and IPO portal intended for adult investors and financial market participants. We do not knowingly collect any personally identifiable information from children under the age of 13 (or 16 in certain jurisdictions). If you believe your child has provided personal information on our website, please contact us immediately, and we will promptly remove such information from our records.
            </p>
          </section>

          {/* Section 9 - External Links */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">8</span>
              Third-Party Links & External Registrars
            </h2>
            <p>
              Our website contains outbound hyperlinks to external third-party portals, including official stock exchanges (NSE India, BSE India), market regulators (SEBI), stockbrokers (Upstox, Zerodha, Groww), and registrar entities (Link Intime, KFin Technologies, Bigshare Services, Maashitla). We do not control and are not responsible for the privacy practices, content, or cookie policies of these external sites. We encourage you to review their respective privacy policies when visiting them.
            </p>
          </section>

          {/* Section 10 - Data Security */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">9</span>
              Data Security and Encryption
            </h2>
            <p>
              We employ strict industry-standard technical and organizational security protocols, including HTTPS (HyperText Transfer Protocol Secure), TLS 1.3 encryption, secure HTTP-only headers, Cloudflare protection, and regular automated vulnerability scanning to safeguard user interactions against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          {/* Section 11 - Contact & Inquiries */}
          <section className="border-t border-slate-200 pt-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center justify-center">10</span>
              Contact Information & Privacy Officer
            </h2>
            <p className="mb-4">
              If you have any questions, clarifications, or requests concerning this Privacy Policy or wish to exercise any of your statutory data rights, please contact our designated Data Protection & Privacy Team:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-700 space-y-1.5">
              <p><strong>Platform:</strong> pkctechs IPO Intelligence Platform</p>
              <p><strong>Website:</strong> <a href="https://www.pkctechs.com" className="underline">https://www.pkctechs.com</a></p>
              <p><strong>Official Privacy Email:</strong> <a href="mailto:privacy@pkctechs.com" className="text-slate-900 font-semibold underline">privacy@pkctechs.com</a></p>
              <p><strong>General Support Email:</strong> <a href="mailto:support@pkctechs.com" className="text-slate-900 font-semibold underline">support@pkctechs.com</a></p>
              <p><strong>Contact Page:</strong> <Link href="/contact" className="text-slate-900 font-semibold underline">pkctechs.com/contact</Link></p>
              <p><strong>Expected Response Time:</strong> Within 24 to 48 business hours</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
