import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Official IPO Registrars Directory | pkctechs',
  description: 'Official direct portals and contact information for major Indian IPO registrars including Link Intime, KFin Technologies, Bigshare Services, and Maashitla.',
  alternates: {
    canonical: 'https://www.pkctechs.com/allotment-status',
  },
};

export default function RegistrarsDirectoryPage() {
  const registrars = [
    {
      name: 'Link Intime India Pvt. Ltd.',
      type: 'Major Mainboard & SME Registrar',
      url: 'https://linkintime.co.in/initial_offer/public-issues.html',
      notableIpos: 'Tata Technologies, Bajaj Housing Finance, Swiggy, Waaree Energies, Premier Energies',
      supportEmail: 'ipo.helpdesk@linkintime.co.in',
      phone: '+91 22 4918 6200',
    },
    {
      name: 'KFin Technologies Ltd.',
      type: 'BSE / NSE Primary Market Registrar',
      url: 'https://ris.kfintech.com/ipostatus/',
      notableIpos: 'Life Insurance Corporation (LIC), FirstCry (Brainbees), Hyundai Motor India',
      supportEmail: 'einward.ris@kfintech.com',
      phone: '+91 40 6716 2222 / 1800 309 4001',
    },
    {
      name: 'Bigshare Services Pvt. Ltd.',
      type: 'SME & Emerging Enterprise Specialist',
      url: 'https://www.bigshareonline.com/ipo_Allotment.html',
      notableIpos: 'Leading registrar for high-growth BSE SME and NSE Emerge platform public offerings',
      supportEmail: 'ipo@bigshareonline.com',
      phone: '+91 22 6263 8200',
    },
    {
      name: 'Maashitla Securities Pvt. Ltd.',
      type: 'SME Platform Issues',
      url: 'https://www.maashitla.com/allotment-status/public-issues',
      notableIpos: 'Official registrar for numerous manufacturing and IT SME offerings',
      supportEmail: 'ipo@maashitla.com',
      phone: '+91 11 4512 1795',
    },
    {
      name: 'Cameo Corporate Services Ltd.',
      type: 'South India & SME Issues',
      url: 'https://ipo.cameoindia.com/',
      notableIpos: 'Registrar for regional and SME public issues',
      supportEmail: 'cameo@cameoindia.com',
      phone: '+91 44 2846 0390',
    },
    {
      name: 'Skyline Financial Services Pvt. Ltd.',
      type: 'Mainboard & SME Offerings',
      url: 'https://www.skylinerta.com/ipo.php',
      notableIpos: 'Specialist in diverse SME sector offerings',
      supportEmail: 'compliances@skylinerta.com',
      phone: '+91 11 2681 2682',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1000px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Official Registrars Directory</span>
        </nav>

        {/* Header Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>🏛️ Official Primary Market Registrars</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Official Indian IPO Registrars Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Direct verified links and contact details for all official SEBI-registered registrars in India.
          </p>
        </div>

        {/* Informational Registrar Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          {registrars.map((reg, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{reg.name}</h3>
                  <span className="inline-block text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {reg.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  <strong className="text-slate-700">Notable Issues:</strong> {reg.notableIpos}
                </p>
                <div className="text-[11px] text-slate-400 space-y-1 mb-5">
                  <p>📧 Email: <span className="text-slate-600">{reg.supportEmail}</span></p>
                  <p>📞 Phone: <span className="text-slate-600">{reg.phone}</span></p>
                </div>
              </div>
              <a
                href={reg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 text-center text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors block"
              >
                Visit Official Registrar Portal ↗
              </a>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
          <p className="font-bold text-slate-700">Disclaimer & Data Protection Notice:</p>
          <p className="leading-relaxed">
            pkctechs provides external links to official SEBI-registered registrars for investor convenience. We do not store, process, or collect user PAN details or financial credentials. All interactions on third-party registrar portals are governed by their respective privacy policies and terms.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
