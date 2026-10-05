'use client';

import {
  ArrowRight,
  CalendarBlank,
  ChartBar,
  ShareNetwork,
  TrendUp,
} from '@phosphor-icons/react';
import { formatCrores, formatCurrency, formatDate, getDaysRemainingBadge } from '../lib/ipoData';

const STATE_STYLES = {
  open: {
    card: 'border-emerald-100 border-l-emerald-600',
    header: 'bg-emerald-50/80',
    avatar: 'bg-emerald-700 text-white shadow-emerald-900/15',
    badge: 'bg-emerald-700 text-white',
    accentText: 'text-emerald-700',
    icon: 'text-emerald-700 bg-emerald-100',
    progress: 'bg-emerald-600',
    button: 'bg-emerald-700 hover:bg-emerald-800 focus-visible:ring-emerald-500',
  },
  upcoming: {
    card: 'border-amber-100 border-l-amber-500',
    header: 'bg-amber-50/85',
    avatar: 'bg-amber-600 text-white shadow-amber-900/15',
    badge: 'bg-amber-100 text-amber-900 border border-amber-200',
    accentText: 'text-amber-700',
    icon: 'text-amber-700 bg-amber-100',
    progress: 'bg-amber-500',
    button: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500',
  },
  closed: {
    card: 'border-blue-100 border-l-blue-600',
    header: 'bg-blue-50/85',
    avatar: 'bg-blue-700 text-white shadow-blue-900/15',
    badge: 'bg-blue-100 text-blue-800 border border-blue-200',
    accentText: 'text-blue-700',
    icon: 'text-blue-700 bg-blue-100',
    progress: 'bg-blue-600',
    button: 'bg-blue-700 hover:bg-blue-800 focus-visible:ring-blue-500',
  },
};

export default function IpoCard({ ipo, onViewDetails, onShare }) {
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minPrice = Number(ipo.priceband?.min || 0);
  const maxPrice = Number(ipo.priceband?.max || ipo.cutoffPrice || minPrice || 0);
  const lotSize = Number(ipo.lotsize || 0);
  const minInvestment = maxPrice > 0 && lotSize > 0 ? maxPrice * lotSize : 0;
  const subscriptionNum = Number.parseFloat(ipo.totalSubscription) || 0;

  const rawStatus = (ipo.status || 'Upcoming').toUpperCase();
  const isClosed = ['CLOSED', 'LISTED', 'ALLOTTED'].includes(rawStatus);
  const isOpen = rawStatus === 'OPEN';
  const isUpcoming = rawStatus === 'UPCOMING';
  const state = isClosed ? 'closed' : isOpen ? 'open' : 'upcoming';
  const styles = STATE_STYLES[state];
  const daysBadge = getDaysRemainingBadge(ipo.opendate, ipo.closedate, ipo.status);

  const companyName = ipo.companyName || ipo.ipoName || 'IPO Company';
  const companyMark = ipo.Symbol
    ? ipo.Symbol.slice(0, 3)
    : companyName.split(/\s+/).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  const openDate = formatDate(ipo.opendate);
  const closeDate = formatDate(ipo.closedate);

  const statusLabel = isOpen
    ? 'IPO Open'
    : rawStatus === 'LISTED'
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
      className={`group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-l-4 bg-white shadow-[0_8px_28px_-18px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_-20px_rgba(15,23,42,0.38)] ${styles.card}`}
      onClick={() => onViewDetails(ipo)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`View details for ${companyName}`}
    >
      <header className={`border-b border-white/80 px-4 pb-4 pt-3.5 ${styles.header}`}>
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${styles.badge}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
            {statusLabel}
          </span>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${styles.accentText}`}>
              <ChartBar size={15} weight="bold" aria-hidden="true" />
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
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/90 bg-white/90 text-slate-500 shadow-sm transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <ShareNetwork size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold tracking-wide shadow-lg ${styles.avatar}`}>
            {companyMark}
          </div>
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-[-0.01em] text-slate-950">
              {companyName}
            </h3>
            <p className="mt-1 truncate text-xs font-medium text-slate-600">
              {ipo.industry || (isSME ? 'SME Platform Issue' : 'Public Market Offering')}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-4 py-4">
        <section className="border-b border-slate-200 pb-3">
          <p className="text-xs font-medium text-slate-500">Minimum Investment</p>
          <p className={`mt-1 text-2xl font-extrabold leading-none tracking-[-0.035em] ${styles.accentText}`}>
            {minInvestment > 0 ? formatCurrency(minInvestment) : 'Price TBA'}
          </p>
          <p className="mt-2 text-xs font-medium text-slate-500">
            {lotSize > 0 ? `1 Lot · ${lotSize.toLocaleString('en-IN')} Shares` : 'Lot size to be announced'}
          </p>
        </section>

        <section className="grid grid-cols-3 divide-x divide-slate-200 border-b border-slate-200 py-3">
          <div className="pr-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Price Band</p>
            <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
              {minPrice > 0 && maxPrice > 0
                ? minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice}–${maxPrice}`
                : maxPrice > 0 ? `₹${maxPrice}` : 'TBA'}
            </p>
          </div>
          <div className="px-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Lot Size</p>
            <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
              {lotSize > 0 ? lotSize.toLocaleString('en-IN') : 'TBA'}
            </p>
          </div>
          <div className="pl-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Issue Size</p>
            <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
              {ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : 'TBA'}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 border-b border-slate-200 py-3">
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
              <CalendarBlank size={15} weight="bold" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Open Date</p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">{openDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${styles.icon}`}>
              <CalendarBlank size={15} weight="bold" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Close Date</p>
              <p className="mt-0.5 text-xs font-bold text-slate-800">{closeDate}</p>
            </div>
          </div>
        </section>

        <section className="py-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isClosed ? 'Final Subscription' : isOpen ? 'Live Subscription' : 'Subscription'}
              </p>
              <p className={`mt-1 flex items-center gap-1.5 text-xl font-extrabold leading-none ${styles.accentText}`}>
                {subscriptionNum > 0 ? `${subscriptionNum}x` : '—'}
                {subscriptionNum >= 1 && <TrendUp size={18} weight="bold" aria-hidden="true" />}
              </p>
            </div>
            <p className="max-w-[45%] text-right text-[11px] font-medium leading-relaxed text-slate-500">
              {isUpcoming ? daysBadge.text : subscriptionNum >= 1 ? 'Strong investor demand' : 'Demand building'}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Subscription ${subscriptionNum} times`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${styles.progress}`}
              style={{ width: `${Math.min(100, Math.max(subscriptionNum > 0 ? 10 : 0, subscriptionNum * 10))}%` }}
            />
          </div>
        </section>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewDetails(ipo);
          }}
          className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${styles.button}`}
        >
          {isClosed ? 'View Listing Report' : isOpen ? 'View & Apply Details' : 'View Details'}
          <ArrowRight size={17} weight="bold" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
