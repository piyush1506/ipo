'use client';
import { formatCrores, formatCurrency, formatDate, getDaysRemainingBadge, getBrandPalette } from '../lib/ipoData';

export default function IpoCard({ ipo, onViewDetails, onShare }) {
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minPrice = ipo.priceband?.min || 0;
  const maxPrice = ipo.priceband?.max || ipo.cutoffPrice || minPrice || 0;
  const lotSize = ipo.lotsize || 0;
  const minInvestment = (maxPrice > 0 && lotSize > 0) ? maxPrice * lotSize : 0;
  const subscriptionNum = parseFloat(ipo.totalSubscription) || 0;

  const rawStatus = (ipo.status || 'Upcoming').toUpperCase();
  const isClosed = rawStatus === 'CLOSED' || rawStatus === 'LISTED' || rawStatus === 'ALLOTTED';
  const isOpen = rawStatus === 'OPEN';
  const isUpcoming = rawStatus === 'UPCOMING';

  const daysBadge = getDaysRemainingBadge(ipo.opendate, ipo.closedate, ipo.status);
  const brand = getBrandPalette(ipo.companyName || ipo.Symbol || 'IPO');

  // Date range display
  const openDateFmt = formatDate(ipo.opendate);
  const closeDateFmt = formatDate(ipo.closedate);
  const dateRangeStr = (ipo.opendate && ipo.closedate)
    ? `${openDateFmt.replace(/\d{4}/, '').trim()} - ${closeDateFmt}`
    : openDateFmt || 'TBA';

  return (
    <div
      className={`groww-card flex flex-col justify-between p-5 relative cursor-pointer group transition-all ${
        isClosed ? 'bg-white border-slate-200/90' : 'bg-white border-slate-200'
      }`}
      onClick={() => onViewDetails(ipo)}
    >
      <div>
        {/* Top Header: Brand Avatar + Title + Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            {/* Soft Gray Brand Avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-medium text-xs tracking-wider shrink-0 border shadow-2xs"
              style={{
                backgroundColor: brand.bg,
                borderColor: brand.border,
                color: brand.text,
              }}
            >
              {ipo.Symbol ? ipo.Symbol.slice(0, 3) : (ipo.companyName || 'IPO').slice(0, 2).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-800 leading-snug truncate group-hover:text-slate-600 transition-colors">
                {ipo.companyName || ipo.ipoName}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                <span className="text-xs text-slate-500 font-normal">
                  {isClosed ? `Closed: ${closeDateFmt}` : isUpcoming ? `Opens: ${openDateFmt}` : dateRangeStr}
                </span>
                <span className="text-slate-300">•</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                  isSME
                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {isSME ? 'SME' : 'MAINBOARD'}
                </span>
              </div>
            </div>
          </div>

          {/* Status Chip Badge */}
          <div className="shrink-0">
            {isClosed ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-300">
                <span>🏁</span> Listed
              </span>
            ) : daysBadge.type === 'urgent' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                {daysBadge.text}
              </span>
            ) : isOpen ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Open for Bidding
              </span>
            ) : (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                {daysBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Metrics Box — Tailored for Closed/Listed vs Open/Upcoming */}
        {isClosed ? (
          /* Closed / Listed Card Content */
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/90 rounded-xl border border-slate-200/70 mb-3.5">
            <div>
              <span className="text-[11px] text-slate-500 font-normal block">
                Final Issue Price
              </span>
              <p className="text-sm font-bold mt-0.5 leading-snug text-slate-900">
                {maxPrice > 0 ? `₹${maxPrice}` : 'Price TBA'}
              </p>
              <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                {lotSize > 0 ? `Lot: ${lotSize} Shares` : 'Lot size TBA'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-normal block">
                Total Issue Size
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                {ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : 'TBA'}
              </p>
              <span className="text-[11px] text-slate-500 font-normal block mt-0.5">
                {isSME ? 'BSE SME / NSE Emerge' : 'NSE / BSE Mainboard'}
              </span>
            </div>
          </div>
        ) : (
          /* Open / Upcoming Card Content */
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3.5">
            <div>
              <span className="text-[11px] text-slate-500 font-normal block">
                Min. Investment
              </span>
              <p className="text-sm font-semibold mt-0.5 leading-snug text-slate-800">
                {minInvestment > 0 ? formatCurrency(minInvestment) : 'Price TBA'}
              </p>
              <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                {lotSize > 0 ? `${lotSize} Shares (1 Lot)` : 'Lot size TBA'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 font-normal block">
                Price Band
              </span>
              <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">
                {minPrice > 0 && maxPrice > 0
                  ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`)
                  : (maxPrice > 0 ? `₹${maxPrice}` : 'To Be Announced')}
              </p>
              <span className="text-[11px] text-slate-400 font-normal block mt-0.5">
                {ipo.issuesize > 0 ? `Issue: ${formatCrores(ipo.issuesize)}` : 'Issue size TBA'}
              </span>
            </div>
          </div>
        )}

        {/* Subscription Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500 font-normal">
              {isClosed ? 'Final Subscription Demand' : 'Live Subscription Rate'}
            </span>
            <span className={`text-xs font-semibold ${subscriptionNum > 0 ? 'text-slate-800' : 'text-slate-500'}`}>
              {ipo.totalSubscription || '0.0'}x {isClosed && subscriptionNum >= 1 ? '(Final)' : ''}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isClosed
                  ? 'bg-slate-700'
                  : subscriptionNum >= 1
                  ? 'bg-emerald-600'
                  : 'bg-slate-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(subscriptionNum > 0 ? 12 : 0, subscriptionNum * 25))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onViewDetails(ipo)}
          className="btn-dark-primary flex-1 py-2 px-3.5 rounded-lg text-xs font-medium text-center flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          {isClosed ? 'View Listing Report' : isOpen ? 'View & Apply Details' : 'View Details'}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>

        {onShare && (
          <button
            onClick={() => onShare(ipo)}
            title="Share Offering"
            className="bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 p-2 rounded-lg text-xs flex items-center justify-center transition-colors shadow-2xs"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
