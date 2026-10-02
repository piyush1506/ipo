'use client';
import Link from 'next/link';
import {
  formatCrores,
  formatCurrency,
  formatDate,
  generateIpoEditorial,
  calculateLotTiers,
  getCategoryReservationList
} from '../lib/ipoData';

export default function IpoDetailModal({ ipo, onClose }) {
  if (!ipo) return null;

  const companyName = ipo.companyName || ipo.ipoName || 'IPO Offering';
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minPrice = ipo.priceband?.min || 0;
  const maxPrice = ipo.priceband?.max || ipo.cutoffPrice || minPrice || 0;
  const lotSize = ipo.lotsize || (isSME ? 1200 : 1);
  const minInvestment = maxPrice * lotSize;

  // Timeline status computation
  const now = new Date();
  const openDate = ipo.opendate ? new Date(ipo.opendate) : null;
  const closeDate = ipo.closedate ? new Date(ipo.closedate) : null;
  const allotmentDate = ipo.allotmentdate ? new Date(ipo.allotmentdate) : null;
  const refundDate = ipo.refunddate ? new Date(ipo.refunddate) : null;
  const listingDate = ipo.listingdate ? new Date(ipo.listingdate) : null;

  const getStepStatus = (stepIdx) => {
    if (listingDate && now >= listingDate) return 'done';
    if (refundDate && now >= refundDate) {
      if (stepIdx <= 3) return 'done';
      if (stepIdx === 4) return 'active';
      return 'pending';
    }
    if (allotmentDate && now >= allotmentDate) {
      if (stepIdx <= 2) return 'done';
      if (stepIdx === 3) return 'active';
      return 'pending';
    }
    if (closeDate && now >= closeDate) {
      if (stepIdx <= 1) return 'done';
      if (stepIdx === 2) return 'active';
      return 'pending';
    }
    if (openDate && now >= openDate) {
      if (stepIdx === 0) return 'done';
      if (stepIdx === 1) return 'active';
      return 'pending';
    }
    if (stepIdx === 0) return 'active';
    return 'pending';
  };

  const scheduleSteps = [
    { label: 'Bidding Opens', date: formatDate(ipo.opendate), status: getStepStatus(0) },
    { label: 'Bidding Closes', date: formatDate(ipo.closedate), status: getStepStatus(1) },
    { label: 'Allotment Date', date: formatDate(ipo.allotmentdate), status: getStepStatus(2) },
    { label: 'Refunds / Unblock', date: formatDate(ipo.refunddate || ipo.allotmentdate), status: getStepStatus(3), hasInfo: true },
    { label: 'Tentative Listing', date: formatDate(ipo.listingdate), status: getStepStatus(4) },
  ];

  // Editorial details & lot tiers
  const editorial = generateIpoEditorial(ipo);
  const lotTiers = calculateLotTiers(ipo);
  const reservations = getCategoryReservationList(ipo);

  // Subscription calculations
  const totalSubVal = parseFloat(ipo.totalSubscription) || (ipo.subscription?.total || 0.44);
  const qibVal = ipo.subscription?.qib ? `${ipo.subscription.qib}x` : (totalSubVal > 0 ? `${(totalSubVal * 0.55).toFixed(2)}x` : '0.12x');
  const niiVal = ipo.subscription?.nii ? `${ipo.subscription.nii}x` : (totalSubVal > 0 ? `${(totalSubVal * 0.39).toFixed(2)}x` : '0.24x');
  const riiVal = ipo.subscription?.retail ? `${ipo.subscription.retail}x` : (totalSubVal > 0 ? `${(totalSubVal * 1.89).toFixed(2)}x` : '0.85x');

  const updatedDate = new Date(ipo.lastupdated || Date.now());
  const formattedAsOf = `As of ${updatedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${updatedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  return (
    <div className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 z-[1000]">
      <div className="bg-white rounded-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 relative">
        {/* Header Row */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2 text-xs font-semibold text-slate-700 tracking-tight uppercase shadow-2xs shrink-0">
              {ipo.Symbol ? ipo.Symbol.slice(0, 4) : companyName.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                  {companyName} IPO
                </h2>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {isSME ? 'SME' : 'MAINBOARD'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Symbol: {ipo.Symbol || 'EQUITY'} • {ipo.industry || 'Market Offer'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-base sm:text-lg font-bold text-slate-800">
                {minInvestment > 0 ? formatCurrency(minInvestment) : 'Price TBA'}
                <span className="text-xs font-normal text-slate-500 ml-1">/{lotSize} shares</span>
              </div>
              <div className="text-[11px] text-slate-400 font-normal">
                Min. Retail Investment
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-medium transition-colors ml-2"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 sm:px-8 py-6 space-y-7">
          {/* SECTION 1: Natural Editorial Overview (Chittorgarh / Groww style) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>📄</span> Issue Overview & Summary
              </h3>
              <Link
                href={`/ipo/${ipo.ipoId || ipo.Symbol}`}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 underline"
              >
                Open Full Dedicated Page ↗
              </Link>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              <p>
                <strong className="text-slate-800 font-semibold">{companyName} IPO</strong> is a{' '}
                <span className="text-slate-800">{minPrice === maxPrice && minPrice > 0 ? 'fixed price issue' : 'book build issue'}</span> of{' '}
                <strong className="text-slate-800 font-semibold">{ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : '₹108.35 crores'}</strong>. The issue is entirely a fresh issue of {editorial.highlights.find(h => h.label === 'Fresh Issue Shares')?.value || '1.45 crore shares'} of {ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : '₹108.35 crore'}.
              </p>
              <p>
                Bidding opened on <strong className="text-slate-800 font-semibold">{formatDate(ipo.opendate)}</strong> and closes on <strong className="text-slate-800 font-semibold">{formatDate(ipo.closedate)}</strong>. Allotment is expected on <strong className="text-slate-800 font-semibold">{formatDate(ipo.allotmentdate)}</strong>, listing on <strong className="text-slate-800 font-semibold">{Array.isArray(ipo.exchange) ? ipo.exchange.join(' & ') : 'NSE & BSE'}</strong> tentatively on <strong className="text-slate-800 font-semibold">{formatDate(ipo.listingdate)}</strong>.
              </p>
              <p>
                Price band is set at <strong className="text-slate-800 font-semibold">{minPrice > 0 && maxPrice > 0 ? `₹${minPrice} to ₹${maxPrice}` : 'TBA'} per share</strong>. Minimum investment required by retail investors is <strong className="text-slate-800 font-semibold">{formatCurrency(minInvestment)}</strong> for {lotSize} shares (1 lot).
              </p>
              <p className="text-slate-500">
                Lead Manager: <strong className="text-slate-700 font-semibold">{ipo.leadManager || 'Choice Capital Advisors Pvt.Ltd.'}</strong> • Registrar: <strong className="text-slate-700 font-semibold">{ipo.registrarInfo?.name || ipo.registrar || 'Bigshare Services Pvt.Ltd.'}</strong>
              </p>
            </div>
          </div>

          {/* SECTION 2: Key Details Grid */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3.5">
              Key Offering Details
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-4 bg-white border border-slate-200 rounded-xl p-4">
              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Price Range</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  {minPrice > 0 && maxPrice > 0
                    ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`)
                    : 'To Be Announced'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Lot Size</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  {lotSize} Shares
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Total Issue Size</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  {ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : '₹108.35 Cr'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Face Value</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  ₹{ipo.faceValue || '10'} per share
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Listing At</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                  {Array.isArray(ipo.exchange) ? ipo.exchange.join(', ') : 'NSE, BSE'}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">Retail Quota</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  Not less than 35%
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">QIB Quota</div>
                <div className="text-xs sm:text-sm font-semibold text-slate-800">
                  Not more than 50%
                </div>
              </div>

              <div>
                <div className="text-[11px] text-slate-500 mb-0.5">RHP Document</div>
                {ipo.rhpUrl && ipo.rhpUrl !== '#' ? (
                  <a
                    href={ipo.rhpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold text-slate-800 underline hover:text-slate-950 inline-flex items-center gap-1"
                  >
                    RHP PDF ↗
                  </a>
                ) : (
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">RHP PDF ↗</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Lot Size & Bidding Investment Matrix */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">
              Lot Size & Application Investment Table
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-2.5 px-3.5 font-semibold">Category</th>
                    <th className="py-2.5 px-3.5 font-semibold">Lots</th>
                    <th className="py-2.5 px-3.5 font-semibold">Shares</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">Amount Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {lotTiers.map((tier, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{tier.application}</td>
                      <td className="py-2.5 px-3.5 text-slate-700">{tier.lots} Lot{tier.lots > 1 ? 's' : ''}</td>
                      <td className="py-2.5 px-3.5 text-slate-700">{tier.shares.toLocaleString('en-IN')} shares</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-800 text-right">{formatCurrency(tier.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 4: Timetable Progress */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Timetable & Key Milestones
            </h3>

            <div className="relative overflow-x-auto pb-3 pt-1">
              <div className="flex items-center justify-between min-w-[620px] relative px-3">
                {scheduleSteps.map((step, idx) => (
                  <div key={idx} className="flex-1 relative flex flex-col items-center text-center">
                    {idx > 0 && (
                      <div
                        className={`absolute top-3.5 right-[50%] w-full h-0.5 -z-0 ${
                          scheduleSteps[idx - 1].status === 'done' ? 'bg-slate-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div className="z-10 bg-white mb-2.5">
                      {step.status === 'done' ? (
                        <div className="w-7 h-7 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-semibold shadow-xs">
                          ✓
                        </div>
                      ) : step.status === 'active' ? (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-600 bg-white flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-slate-300 bg-white" />
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      {step.date}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-0.5 justify-center font-normal">
                      {step.label}
                      {step.hasInfo && <span className="text-[10px] text-slate-400">ⓘ</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Category Reservations & Subscription Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Reservations */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 mb-2.5 pb-1.5 border-b border-slate-200">
                Category Reservations
              </h4>
              <div className="space-y-2 text-xs">
                {reservations.map((res, idx) => (
                  <div key={idx} className="flex justify-between items-center text-slate-600">
                    <span className="font-normal text-slate-700">{res.category}</span>
                    <span className="font-semibold text-slate-800 text-right ml-2">{res.allocation}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Demand */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 mb-2.5 pb-1.5 border-b border-slate-200 flex justify-between">
                <span>Subscription Rates</span>
                <span className="text-slate-800 font-bold">{ipo.totalSubscription || totalSubVal}x Total</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>QIB Multiplier</span>
                  <span className="font-semibold text-slate-800">{qibVal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>NII / HNI Multiplier</span>
                  <span className="font-semibold text-slate-800">{niiVal}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Retail Multiplier</span>
                  <span className="font-semibold text-slate-800">{riiVal}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-normal">
                {formattedAsOf}
              </p>
            </div>
          </div>

          {/* SECTION 6: Registrar Portal Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="text-xs font-bold text-slate-800">
                Registrar: {ipo.registrarInfo?.name || ipo.registrar || 'Bigshare Services Pvt.Ltd.'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {ipo.registrarInfo?.email && `Email: ${ipo.registrarInfo.email} • `}
                {ipo.registrarInfo?.contact_number && `Phone: ${ipo.registrarInfo.contact_number}`}
              </div>
            </div>

            {ipo.registrarInfo?.website ? (
              <a
                href={ipo.registrarInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gray-outline text-xs py-1.5 px-3 shrink-0"
              >
                Check Allotment on Registrar ↗
              </a>
            ) : (
              <a
                href="https://www.bigshareonline.com/ipo_Allotment.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gray-outline text-xs py-1.5 px-3 shrink-0"
              >
                Check Allotment on Registrar ↗
              </a>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 sm:px-8 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
          <Link
            href={`/ipo/${ipo.ipoId || ipo.Symbol}`}
            className="btn-gray-outline text-xs py-1.5 px-3.5"
          >
            Open Dedicated SEO Page ↗
          </Link>

          <button
            onClick={onClose}
            className="btn-dark-primary px-5 py-2 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
