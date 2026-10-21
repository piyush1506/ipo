'use client';

import {
  ArrowRight,
  CalendarBlank,
  ChartBar,
  ShareNetwork,
  TrendUp,
} from '@phosphor-icons/react';
import { formatCrores, formatCurrency, formatDate, getDaysRemainingBadge } from '../lib/ipoData';

// Minimal compact styles - single color palette (blue only, no state variations)
const STYLE = {
  card: 'group cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md',
  header: 'border-b border-white/80 px-3 pb-3 pt-2.5',
  badge: 'inline-flex items-center gap-2 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.05em] bg-blue-50/80 border border-blue-200 text-blue-600',
  accentText: 'text-blue-600',
  icon: 'text-blue-600 bg-blue-100',
  progress: 'bg-blue-500',
  button: 'mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-white shadow-sm',
};

export default function IpoCard({ ipo, onViewDetails, onShare }) {
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minPrice = Number(ipo.priceband?.min || 0);
  const maxPrice = Number(ipo.priceband?.max || ipo.cutoffPrice || minPrice || 0);
  const lotSize = Number(ipo.lotsize || 0);
  const hasLotSize = lotSize > 1;
  const minInvestment = maxPrice > 0 && hasLotSize ? maxPrice * lotSize : 0;
  const subscriptionNum = Number.parseFloat(ipo.totalSubscription) || 0;

  const rawStatus = (ipo.status || 'Upcoming').toUpperCase();
  const isListed = rawStatus === 'LISTED' || (ipo.listingdate && new Date(ipo.listingdate) <= new Date() && !['OPEN', 'UPCOMING', 'CLOSED', 'ALLOTTED'].includes(rawStatus));
  const isClosed = ['CLOSED', 'LISTED', 'ALLOTTED'].includes(rawStatus);
  const isOpen = rawStatus === 'OPEN';
  const isUpcoming = rawStatus === 'UPCOMING';
  const gmpPrice = Number(ipo.gmp?.price || 0);
  const gmpPercent = Number(ipo.gmp?.percentage || (maxPrice > 0 && gmpPrice > 0 ? ((gmpPrice / maxPrice) * 100).toFixed(1) : 0));

  const companyName = ipo.companyName || ipo.ipoName || 'IPO Company';
  const companyMark = ipo.Symbol
    ? ipo.Symbol.slice(0, 3)
    : companyName.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  const openDate = formatDate(ipo.opendate);
  const closeDate = formatDate(ipo.closedate);

  const statusLabel = isOpen
    ? 'IPO Open'
    : isListed
      ? 'Listed'
      : rawStatus === 'ALLOTTED'
        ? 'Allotted'
        : rawStatus === 'CLOSED'
          ? 'Closed'
          : 'Upcoming IPO';

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onViewDetails(ipo);
    }
  };

  return (
    <article
      className={STYLE.card}
      onClick={() => onViewDetails(ipo)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`View details for ${companyName}`}
    >
      <header className={STYLE.header}>
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className={STYLE.badge}>
              <span className="h-1 w-1 rounded-full bg-current opacity-80" aria-hidden="true" />
              {statusLabel}
            </span>
            {gmpPrice > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-[10px] font-bold text-blue-600 bg-transparent border border-blue-300 shadow-xs">
                <TrendUp size={10} weight="bold" aria-hidden="true" />
                {isListed
                  ? `Listing Gain: +${gmpPercent}%`
                  : `GMP: ₹${gmpPrice} (+${gmpPercent}%)`}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold ${STYLE.accentText}`}>
              <ChartBar size={12} weight="bold" aria-hidden="true" />
              {isSME ? 'SME' : 'Mainboard'}
            </span>
            {onShare && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onShare(ipo);
                }}
                title="Share offering"
                aria-label={`Share ${companyName}`}
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/90 bg-white/90 text-slate-500 shadow-sm transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ShareNetwork size={14} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tracking-wide shadow-lg">
            {companyMark}
          </div>
          <div>
            <h3 className="line-clamp-1 text-[13px] font-bold leading-snug tracking-[-0.01em] text-slate-950">
              {companyName}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-600">
              {ipo.industry || (isSME ? 'SME Platform Issue' : 'Public Market Offering')}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-3 py-2">
        <section className="border-b border-slate-200 pb-2">
          <p className="text-xs font-medium text-slate-500">Minimum Investment</p>
          <p className="mt-0.5 text-lg font-extrabold leading-none tracking-[-0.035em] text-blue-600">
            {minInvestment > 0 ? formatCurrency(minInvestment) : 'To Be Announced'}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {hasLotSize ? `1 Lot · ${lotSize.toLocaleString('en-IN')} Shares` : 'Lot size to be announced'}
          </p>
        </section>

        <section className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 pb-2">
          <div className="pr-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Price Band</p>
            <p className="mt-0.5 text-sm font-bold leading-snug text-slate-900">
              {minPrice > 0 && maxPrice > 0
                ? minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice}–${maxPrice}`
                : maxPrice > 0 ? `₹${maxPrice}` : 'To Be Announced'}
            </p>
          </div>
          <div className="px-2">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Lot Size</p>
            <p className="mt-0.5 text-sm font-bold leading-snug text-slate-900">
              {hasLotSize ? `${lotSize.toLocaleString('en-IN')} Shares` : 'To Be Announced'}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <CalendarBlank size={12} weight="bold" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Open Date</p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">{openDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <CalendarBlank size={12} weight="bold" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Close Date</p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">{closeDate}</p>
            </div>
          </div>
        </section>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails(ipo);
          }}
          className={STYLE.button}
        >
          {isClosed ? 'View Listing Report' : isOpen ? 'View & Apply Details' : 'View Details'}
          <ArrowRight size={14} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}