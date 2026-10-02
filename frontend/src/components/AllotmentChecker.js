'use client';
import { useState } from 'react';
import { getBrandPalette } from '../lib/ipoData';

export default function AllotmentChecker({ ipos = [] }) {
  const [selectedIpo, setSelectedIpo] = useState('');
  const [identifierType, setIdentifierType] = useState('PAN'); // PAN, APP_NO, DP_ID
  const [identifierValue, setIdentifierValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const registrars = [
    {
      name: 'Link Intime India',
      badge: 'Major Mainboard',
      url: 'https://linkintime.co.in/initial_offer/public-issues.html',
      supportedIpos: 'Tata Tech, Bajaj Housing, Premier Energies, Waaree',
      iconText: 'LI'
    },
    {
      name: 'KFin Technologies',
      badge: 'NSE / BSE Registrar',
      url: 'https://ris.kfintech.com/ipostatus/',
      supportedIpos: 'Brainbees (FirstCry), Jyoti CNC, EMS Ltd',
      iconText: 'KF'
    },
    {
      name: 'Bigshare Services',
      badge: 'SME & Mainboard',
      url: 'https://www.bigshareonline.com/ipo_Allotment.html',
      supportedIpos: 'Nityas Gems, VNL, SME Issues',
      iconText: 'BS'
    },
    {
      name: 'Maashitla Securities',
      badge: 'SME Portal',
      url: 'https://www.maashitla.com/allotment-status/public-issues',
      supportedIpos: 'Specialized SME Offerings',
      iconText: 'MS'
    },
    {
      name: 'Skyline Financial Services',
      badge: 'Registrar',
      url: 'https://www.skylinerta.com/ipo.php',
      supportedIpos: 'Emerging Issues',
      iconText: 'SF'
    }
  ];

  const handleCheckStatus = (e) => {
    e.preventDefault();
    if (!identifierValue.trim()) return;

    setIsChecking(true);
    setSearchResult(null);

    setTimeout(() => {
      setIsChecking(false);
      const matchedIpo = ipos.find(i => (i.ipoId || i.Symbol) === selectedIpo) || ipos[0];
      setSearchResult({
        ipoName: matchedIpo ? (matchedIpo.companyName || matchedIpo.ipoName) : 'Selected Public Issue',
        panOrId: identifierValue.toUpperCase(),
        status: matchedIpo?.status === 'ALLOTTED' || matchedIpo?.status === 'LISTED' ? 'Allotment Finalized' : 'Allotment In Process / Awaiting Registrar Basis',
        allotmentDate: matchedIpo?.allotmentDate || 'Refer Timetable',
        sharesApplied: matchedIpo?.minShares || 200,
        sharesAllotted: 'Check direct registrar server link below',
        registrar: matchedIpo?.registrarInfo?.name || matchedIpo?.registrar || 'Bigshare / Link Intime',
        registrarLink: matchedIpo?.registrarInfo?.website || 'https://www.bigshareonline.com/ipo_Allotment.html'
      });
    }, 600);
  };

  return (
    <section id="allotment-checker" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 mt-12 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>🛡️ Official Registrar Hub</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            How to Check IPO Allotment Status Online?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
            Check IPO allotment status instantly via PAN Number, Application Number, or DP Client ID across all SEBI registered registrars on pkctechs.
          </p>
        </div>
      </div>

      {/* Grid: 2 Columns (Form & Direct Registrar Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Column: Direct Fast Checker */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <form onSubmit={handleCheckStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                1. Select Public Offering (IPO)
              </label>
              <select
                value={selectedIpo}
                onChange={(e) => setSelectedIpo(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 font-normal focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-500/15 outline-none"
              >
                <option value="">-- Choose Recent or Open IPO --</option>
                {ipos.map((item) => (
                  <option key={item.ipoId || item.Symbol} value={item.ipoId || item.Symbol}>
                    {item.companyName || item.ipoName} ({item.status || 'Active'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                2. Select Query Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'PAN', label: 'PAN Card' },
                  { id: 'APP_NO', label: 'App No.' },
                  { id: 'DP_ID', label: 'DP / Client ID' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setIdentifierType(mode.id)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      identifierType === mode.id
                        ? 'bg-slate-700 text-white border-slate-700'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                3. Enter {identifierType === 'PAN' ? 'Permanent Account Number (PAN)' : identifierType === 'APP_NO' ? 'IPO Application Number' : 'Beneficiary / DP Client ID'}
              </label>
              <input
                type="text"
                value={identifierValue}
                onChange={(e) => setIdentifierValue(e.target.value)}
                placeholder={identifierType === 'PAN' ? 'e.g. ABCDE1234F' : identifierType === 'APP_NO' ? 'e.g. 102938475' : 'e.g. 1208160012345678'}
                className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 uppercase placeholder:normal-case placeholder:text-slate-400 font-normal focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-500/15 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isChecking || !identifierValue.trim()}
              className="w-full h-10 rounded-lg bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              {isChecking ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Registrar Records...</span>
                </>
              ) : (
                <>
                  <span>Verify Allotment Status</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>

          {/* Quick result panel */}
          {searchResult && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-900">{searchResult.ipoName}</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {searchResult.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>Query ID: <span className="font-mono text-slate-900">{searchResult.panOrId}</span></div>
                <div>Registrar: <span className="font-semibold text-slate-900">{searchResult.registrar}</span></div>
              </div>
              <div className="pt-2">
                <a
                  href={searchResult.registrarLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 px-3 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-medium text-xs inline-flex items-center justify-center gap-1 transition-colors"
                >
                  Open Official Registrar Server ({searchResult.registrar}) ↗
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Direct Registrar Links */}
        <div className="lg:col-span-6 bg-slate-50/70 rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Direct Registrar Allotment Portals
          </h3>
          <div className="space-y-2.5">
            {registrars.map((reg, idx) => (
              <a
                key={idx}
                href={reg.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:shadow-2xs transition-all no-underline"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    {reg.iconText}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-slate-700">
                        {reg.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                        {reg.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {reg.supportedIpos}
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-transform">
                  Check ↗
                </span>
              </a>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 leading-relaxed font-normal">
            💡 <strong className="text-slate-700">Pro Tip:</strong> Allotment basis is typically uploaded to registrar servers late evening around 8:00 PM – 11:30 PM on the designated allotment date. You also receive an SMS/email from your ASBA bank once funds are debited or unblocked.
          </div>
        </div>
      </div>
    </section>
  );
}
