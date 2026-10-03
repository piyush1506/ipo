import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Complete IPO Allotment & Bidding Guide 2026 | pkctechs',
  description: 'Master Indian IPOs: How allotment works, SEBI lottery rules, step-by-step PAN checking on Link Intime & KFintech, ASBA UPI mandate timeline, and Mainboard vs SME.',
  alternates: {
    canonical: 'https://www.pkctechs.com/ipo-guide',
  },
};

export default function IpoGuidePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">IPO Investor Guide</span>
        </nav>

        {/* Header Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>📖 Comprehensive Investor Education</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Indian IPO Master Guide: Allotment, Bidding & Timelines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Everything you need to know about Initial Public Offerings in India—from understanding the SEBI allotment lottery mechanism to checking your status across major registrars.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-10 text-slate-700 text-sm leading-relaxed">
          {/* Chapter 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">1</span>
              How Does IPO Allotment Work in India?
            </h2>
            <p className="mb-3">
              When a company launches an Initial Public Offering (IPO) in India, shares are reserved for different investor categories in predetermined percentages as mandated by SEBI:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Retail (RII)</h4>
                <p className="text-[11px] text-slate-600">Minimum 35% reservation for bids up to ₹2,00,000.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Non-Institutional (NII/HNI)</h4>
                <p className="text-[11px] text-slate-600">15% reservation (divided into sHNI ₹2L–₹10L and bHNI &gt;₹10L).</p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">Qualified Institutional (QIB)</h4>
                <p className="text-[11px] text-slate-600">50% reservation for mutual funds, banks, and FPIs.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              <strong>The SEBI Lottery Mechanism:</strong> If the retail category is oversubscribed (e.g., subscribed 15x or 50x), every valid retail applicant gets an equal chance in an automated, computerized lottery to receive exactly <strong>one minimum lot</strong> of shares. Applying for multiple lots under a single PAN does not increase your probability of receiving an allotment in the retail category.
            </p>
          </section>

          {/* Chapter 2 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">2</span>
              Step-by-Step: How to Check Allotment Status
            </h2>
            <p className="mb-3">
              Once the Basis of Allotment is finalized by the company and stock exchanges, allotment data is uploaded to the official registrar portal. Here is the step-by-step verification method:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-xs text-slate-600">
              <li>
                <strong>Identify the Registrar:</strong> Check which registrar manages the IPO (e.g., Link Intime, KFin Technologies, Bigshare, Maashitla, Cameo). You can verify this on our <Link href="/" className="text-slate-900 underline font-medium">IPO Dashboard</Link>.
              </li>
              <li>
                <strong>Visit the Registrar Portal:</strong> Navigate to the official allotment status page using our direct links on the <Link href="/allotment-status" className="text-slate-900 underline font-medium">Allotment Status Page</Link>.
              </li>
              <li>
                <strong>Select the Company Name:</strong> Pick the specific IPO from the dropdown list. (If the IPO is not visible in the dropdown, the registrar is still processing data).
              </li>
              <li>
                <strong>Enter Identifier:</strong> Choose <em>PAN Number</em> (easiest method), <em>Application Number</em>, or <em>DPI/Client ID</em>.
              </li>
              <li>
                <strong>Submit and View Result:</strong> The system will display your applied shares and allotted shares. If allotted, the shares will be credited to your Demat account on the settlement date.
              </li>
            </ol>
          </section>

          {/* Chapter 3 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">3</span>
              ASBA, UPI Mandates & Refund Timelines
            </h2>
            <p className="mb-3">
              In India, retail IPO applications are executed via <strong>ASBA (Application Supported by Blocked Amount)</strong> using UPI 2.0 or direct net banking.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p>• <strong>Fund Hold (No Debit):</strong> When you submit a bid, funds are merely blocked (lien marked) in your bank account, not debited immediately. You continue earning bank interest on blocked funds.</p>
              <p>• <strong>Mandate Approval:</strong> You must approve the UPI mandate request in your UPI app (Google Pay, PhonePe, BHIM, Paytm) before 5:00 PM on the IPO closing day.</p>
              <p>• <strong>Refund / Unblocking:</strong> If you do not receive an allotment, the bank unblocks the lien on the designated Refund Initiation Date (typically 1 day after basis of allotment).</p>
            </div>
          </section>

          {/* Chapter 4 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold inline-flex items-center justify-center">4</span>
              Mainboard vs SME IPOs: Key Differences
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-800 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3">Mainboard IPO</th>
                    <th className="p-3">SME IPO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Platform</td>
                    <td className="p-3">BSE & NSE Main Board</td>
                    <td className="p-3">BSE SME & NSE Emerge</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Minimum Investment</td>
                    <td className="p-3">~₹14,000 – ₹15,000</td>
                    <td className="p-3">~₹1,00,000 – ₹1,50,000</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Post-Issue Paid-up Capital</td>
                    <td className="p-3">Minimum ₹10 Crores</td>
                    <td className="p-3">Up to ₹25 Crores</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Trading Lot Size</td>
                    <td className="p-3">1 Share after listing</td>
                    <td className="p-3">Fixed lot size (e.g. 1000 shares)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-slate-800">Risk Profile</td>
                    <td className="p-3">Moderate / Regulated</td>
                    <td className="p-3">Higher Risk & Volatility</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Regulatory Reminder */}
          <section className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
            <h3 className="font-bold text-slate-900">Important Regulatory Notice</h3>
            <p>
              This guide is created strictly for educational purposes by pkctechs. We are not SEBI-registered research analysts or investment advisors. For complete disclaimers, please read our{' '}
              <Link href="/disclaimer" className="text-slate-900 font-semibold underline">Legal Disclaimer</Link>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
