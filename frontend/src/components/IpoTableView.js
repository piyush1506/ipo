'use client';
import { formatCrores, formatCurrency, formatDate, getDaysRemainingBadge, getBrandPalette } from '../lib/ipoData';

export default function IpoTableView({ ipos, onViewDetails, onShare }) {
  if (!ipos || ipos.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left min-w-[780px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="py-3.5 px-4.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company & Symbol</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bidding Dates</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Price Range</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Min. Investment</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Issue Size</th>
              <th className="py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subscription</th>
              <th className="py-3.5 px-4.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ipos.map((ipo) => {
              const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
              const minPrice = ipo.priceband?.min || 0;
              const maxPrice = ipo.priceband?.max || ipo.cutoffPrice || minPrice || 0;
              const lotSize = ipo.lotsize || 0;
              const minInvestment = (maxPrice > 0 && lotSize > 0) ? maxPrice * lotSize : 0;
              const subscriptionNum = parseFloat(ipo.totalSubscription) || 0;
              const brand = getBrandPalette(ipo.companyName || ipo.Symbol || 'IPO');
              const daysBadge = getDaysRemainingBadge(ipo.opendate, ipo.closedate, ipo.status);

              return (
                <tr
                  key={ipo.ipoId || ipo.Symbol}
                  className="groww-table-row cursor-pointer"
                  onClick={() => onViewDetails(ipo)}
                >
                  {/* Company & Symbol */}
                  <td className="py-4 px-4.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg border flex items-center justify-center font-medium text-xs shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: brand.bg,
                          borderColor: brand.border,
                          color: brand.text,
                        }}
                      >
                        {ipo.Symbol ? ipo.Symbol.slice(0, 3) : (ipo.companyName || 'IPO').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-800">
                            {ipo.companyName || ipo.ipoName}
                          </span>
                          <span className={`text-[10px] font-medium px-1.25 py-0.25 rounded border ${
                            isSME ? 'bg-slate-100 text-slate-700 border-slate-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {isSME ? 'SME' : 'MAIN'}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-normal">
                          {ipo.Symbol || 'EQUITY'} • {ipo.industry || 'Market Offer'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-semibold text-slate-800">
                        {formatDate(ipo.opendate)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        to {formatDate(ipo.closedate)}
                      </span>
                      <span className={`text-[10px] font-medium mt-0.5 ${
                        daysBadge.type === 'urgent' ? 'text-rose-700' : 'text-slate-500'
                      }`}>
                        {daysBadge.text}
                      </span>
                    </div>
                  </td>

                  {/* Price Range */}
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-slate-800">
                      {minPrice > 0 && maxPrice > 0
                        ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`)
                        : (maxPrice > 0 ? `₹${maxPrice}` : 'To Be Announced')}
                    </span>
                  </td>

                  {/* Min. Investment Fund */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-800">
                        {minInvestment > 0 ? formatCurrency(minInvestment) : 'Price TBA'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        {lotSize > 0 ? `${lotSize} Shares (1 Lot)` : 'Lot size TBA'}
                      </span>
                    </div>
                  </td>

                  {/* Issue Size */}
                  <td className="py-4 px-4">
                    <span className="text-xs font-medium text-slate-600">
                      {ipo.issuesize > 0 ? formatCrores(ipo.issuesize) : 'TBA'}
                    </span>
                  </td>

                  {/* Subscription */}
                  <td className="py-4 px-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                      subscriptionNum > 0
                        ? 'text-slate-700 bg-slate-100 border-slate-300'
                        : 'text-slate-500 bg-slate-50 border-slate-200'
                    }`}>
                      {ipo.totalSubscription || '0.0'}x
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5 justify-end items-center">
                      <button
                        onClick={() => onViewDetails(ipo)}
                        className="bg-slate-600 hover:bg-slate-700 text-white px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shadow-xs"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
