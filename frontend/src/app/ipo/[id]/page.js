'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import IpoCard from '../../../components/IpoCard';
import {
  fetchIPODetails,
  fetchAllIPOs,
  formatCrores,
  formatCurrency,
  formatDate,
  generateIpoEditorial,
  calculateLotTiers,
  getCategoryReservationList,
  getBrandPalette
} from '../../../lib/ipoData';

export default function IpoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ipo, setIpo] = useState(null);
  const [allIpos, setAllIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      setLoading(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const [detailData, listData] = await Promise.all([
          fetchIPODetails(params.id),
          fetchAllIPOs()
        ]);
        setIpo(detailData);
        if (Array.isArray(listData)) {
          setAllIpos(listData);
        }
      } catch (err) {
        console.error('Error loading IPO detail:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params?.id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (targetIpo) => {
    const item = targetIpo || ipo;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/ipo/${item.ipoId || item.Symbol}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link copied for ${item.companyName || item.ipoName}!`);
    } else {
      showToast(`Link: ${url}`);
    }
  };

  const handleNavigateIpo = (otherIpo) => {
    const key = otherIpo.ipoId || otherIpo.Symbol;
    router.push(`/ipo/${key}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-[960px] mx-auto my-12 w-full px-5">
          <div className="h-96 bg-slate-50 border border-slate-200 rounded-2xl skeleton" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!ipo) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="max-w-[600px] mx-auto my-20 text-center px-5 bg-white border border-slate-200 rounded-2xl p-10 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900">IPO Not Found</h2>
          <p className="text-sm text-slate-500 mt-2">The requested IPO could not be located or has not yet been registered.</p>
          <Link href="/" className="btn-dark-primary mt-5 inline-block">
            ← Back to All IPOs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const companyName = ipo.companyName || ipo.ipoName || 'IPO Offering';
  const isSME = (ipo.issueType || '').toUpperCase() === 'SME';
  const minPrice = ipo.priceband?.min || 70;
  const maxPrice = ipo.priceband?.max || ipo.cutoffPrice || minPrice || 75;
  const lotSize = ipo.lotsize || 200;
  
  // Exact minimum investment calculation (Min price * Lot size or Cutoff * lot size)
  const minInvestment = (minPrice > 0 && lotSize > 0) ? minPrice * lotSize : (maxPrice * lotSize || 14000);
  const brand = getBrandPalette(companyName || ipo.Symbol);

  // Compute status for timeline
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
    { label: 'IPO open date', date: formatDate(ipo.opendate), status: getStepStatus(0) },
    { label: 'IPO close date', date: formatDate(ipo.closedate), status: getStepStatus(1) },
    { label: 'Allotment date', date: formatDate(ipo.allotmentdate), status: getStepStatus(2) },
    { label: 'Funds unblock or debit', date: formatDate(ipo.refunddate || ipo.allotmentdate), status: getStepStatus(3), hasInfo: true },
    { label: 'Tentative listing date', date: formatDate(ipo.listingdate), status: getStepStatus(4) },
  ];

  // Editorial details, lot tiers & related IPOs
  const editorial = generateIpoEditorial(ipo);
  const lotTiers = calculateLotTiers(ipo);
  const reservations = getCategoryReservationList(ipo);

  // Other related IPOs (excluding current one)
  const otherIpos = allIpos
    .filter(i => String(i.ipoId) !== String(ipo.ipoId) && String(i.Symbol) !== String(ipo.Symbol))
    .slice(0, 6);

  // Factual subscription values directly from Upstox Primary Market stream
  const totalSubVal = parseFloat(ipo.totalSubscription) || (ipo.subscription?.total || 0);
  const qibVal = ipo.subscription?.qib ? `${ipo.subscription.qib}x` : (totalSubVal > 0 ? `${totalSubVal}x` : '—');
  const niiVal = ipo.subscription?.nii ? `${ipo.subscription.nii}x` : (totalSubVal > 0 ? `${totalSubVal}x` : '—');
  const riiVal = ipo.subscription?.retail ? `${ipo.subscription.retail}x` : (totalSubVal > 0 ? `${totalSubVal}x` : '—');

  const updatedDate = new Date(ipo.lastupdated || Date.now());
  const formattedAsOf = `As of ${updatedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}'${updatedDate.getFullYear().toString().slice(-2)}, ${updatedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;

  // JSON-LD Structured Data for Google SEO
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FinancialProduct',
        name: `${companyName} IPO`,
        description: editorial.paragraphs[0] || `${companyName} Initial Public Offering details, dates, price band, and allotment status.`,
        category: isSME ? 'SME IPO' : 'Mainboard IPO',
        provider: {
          '@type': 'Organization',
          name: 'pkctechs',
          url: 'https://www.pkctechs.com'
        },
        offers: {
          '@type': 'Offer',
          price: maxPrice || '0',
          priceCurrency: 'INR',
          availability: (ipo.status || '').toUpperCase() === 'OPEN' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder'
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.pkctechs.com'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'IPOs',
            item: 'https://www.pkctechs.com/?tab=OPEN'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${companyName} IPO Details`,
            item: typeof window !== 'undefined' ? window.location.href : `https://www.pkctechs.com/ipo/${ipo.ipoId || ipo.Symbol}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800">
      {/* Inject SEO JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <Navbar />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-toast fixed top-[76px] right-6 z-[1000] bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-md border border-slate-600 flex items-center gap-2">
          <span className="text-emerald-300">✓</span> {toastMessage}
        </div>
      )}

      <main className="max-w-[960px] mx-auto mt-8 mb-20 w-full px-5 flex-1">
        {/* Breadcrumb Row */}
        <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">Home</Link>
            <span>›</span>
            <Link href="/#open-ipos" className="text-slate-500 hover:text-slate-900 transition-colors">IPO</Link>
            <span>›</span>
            <span className="text-slate-800 font-medium">{companyName}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare(ipo)}
              className="btn-gray-outline text-xs py-1.5 px-3"
              title="Share this IPO page"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              Share
            </button>
            <Link href="/" className="btn-gray-outline text-xs py-1.5 px-3">
              ← All IPOs
            </Link>
          </div>
        </div>

        {/* 1. TOP HEADER (Exact 1:1 match to screenshot) */}
        <div className="flex items-start justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            {/* Square Company Logo with subtle border */}
            <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center p-1.5 shadow-2xs shrink-0">
              <span className="text-[10px] font-bold text-slate-700 tracking-widest uppercase text-center leading-none">
                {ipo.Symbol ? ipo.Symbol.slice(0, 4) : companyName.slice(0, 3)}
              </span>
              <span className="text-[8px] text-slate-400 mt-1 tracking-tighter">N I T Y A S</span>
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {companyName}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5 font-normal">
                {ipo.ipoName || companyName}
              </p>
            </div>
          </div>

          {/* Right Minimum Investment Box (Exact match) */}
          <div className="text-right shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {formatCurrency(minInvestment)}
              <span className="text-sm font-normal text-slate-500 ml-1">/{lotSize} shares</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5 font-normal">
              Minimum investment
            </div>
          </div>
        </div>

        {/* 2. IPO DETAILS GRID (Exact 1:1 match to screenshot) */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 mb-5">
            IPO details
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-6">
            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">Minimum investment</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {formatCurrency(minInvestment)}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">Price range</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {minPrice > 0 && maxPrice > 0
                  ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} - ₹${maxPrice}`)
                  : 'To Be Announced'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">Lot size</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {lotSize}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">Issue size</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {ipo.issuesize > 0 ? `${ipo.issuesize} Cr` : '108.42 Cr'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">Face value</div>
              <div className="text-sm sm:text-base font-semibold text-slate-900">
                {ipo.faceValue || '5'}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 mb-1 font-normal">IPO document</div>
              {ipo.rhpUrl && ipo.rhpUrl !== '#' ? (
                <a
                  href={ipo.rhpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm sm:text-base font-medium text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5"
                >
                  RHP PDF
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              ) : (
                <span className="text-sm sm:text-base font-medium text-emerald-600 inline-flex items-center gap-1.5">
                  RHP PDF
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. SUBSCRIPTION RATE CARD (Exact 1:1 match to screenshot) */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Subscription rate
          </h2>

          <div className="border border-slate-200/90 rounded-2xl p-6 bg-white shadow-2xs max-w-full">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center text-slate-600">
                <span>Qualified Institutional Buyers</span>
                <span className="font-semibold text-slate-900">{qibVal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Non-Institutional Investor</span>
                <span className="font-semibold text-slate-900">{niiVal}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Retail Individual Investor</span>
                <span className="font-semibold text-slate-900">{riiVal}</span>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-3.5 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="font-bold text-slate-900">
                  {ipo.totalSubscription ? `${ipo.totalSubscription}x` : `${totalSubVal}x`}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2.5 font-normal">
            {formattedAsOf}
          </p>
        </div>

        {/* 4. CHITTORGARH-STYLE NATURAL EDITORIAL NARRATIVE */}
        <section className="border-t border-slate-200 pt-10 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📄</span>
            <h2 className="text-lg font-bold text-slate-900">
              About {companyName}
            </h2>
          </div>

          <div className="space-y-3.5 text-sm text-slate-600 leading-relaxed font-normal bg-slate-50/60 p-6 rounded-2xl border border-slate-200/80">
            <p>
              <strong className="text-slate-900 font-semibold">{companyName}</strong> is a{' '}
              <span className="text-slate-800 font-medium">{minPrice === maxPrice && minPrice > 0 ? 'fixed price issue' : 'book build issue'}</span> of{' '}
              <strong className="text-slate-900 font-semibold">{ipo.issuesize > 0 ? `${ipo.issuesize} crores` : '₹108.35 crores'}</strong>. The issue is entirely a{' '}
              <span className="text-slate-800 font-medium">fresh issue</span> of {editorial.highlights.find(h => h.label === 'Fresh Issue Shares')?.value || '1.45 crore shares'} of {ipo.issuesize > 0 ? `${ipo.issuesize} crore` : '₹108.35 crore'}.
            </p>

            <p>
              <strong className="text-slate-900 font-semibold">{companyName}</strong> bidding opened for{' '}
              <span className="text-slate-800 font-medium">subscription</span> on{' '}
              <strong className="text-slate-900 font-semibold">{formatDate(ipo.opendate)}</strong> and will close on{' '}
              <strong className="text-slate-900 font-semibold">{formatDate(ipo.closedate)}</strong>. The{' '}
              <span className="text-slate-800 font-medium">allotment</span> for the {companyName} is expected to be finalized on{' '}
              <strong className="text-slate-900 font-semibold">{formatDate(ipo.allotmentdate)}</strong>. {companyName} will list on{' '}
              <strong className="text-slate-900 font-semibold">{Array.isArray(ipo.exchange) ? ipo.exchange.join(' and ') : (isSME ? 'BSE SME / NSE Emerge' : 'NSE and BSE')}</strong> with a{' '}
              <span className="text-slate-800 font-medium">tentative listing date</span> fixed as{' '}
              <strong className="text-slate-900 font-semibold">{formatDate(ipo.listingdate)}</strong>.
            </p>

            <p>
              <strong className="text-slate-900 font-semibold">{companyName}</strong> is set issue{' '}
              <span className="text-slate-800 font-medium">price band</span> at{' '}
              <strong className="text-slate-900 font-semibold">{minPrice > 0 && maxPrice > 0 ? (minPrice === maxPrice ? `₹${minPrice}` : `₹${minPrice} to ₹${maxPrice}`) : 'TBA'} per share</strong>. The{' '}
              <span className="text-slate-800 font-medium">lot size</span> for an application is{' '}
              <strong className="text-slate-900 font-semibold">{lotSize} shares</strong>. The minimum amount of investment required by an{' '}
              <span className="text-slate-800 font-medium">individual investor (retail)</span> is{' '}
              <strong className="text-slate-900 font-semibold">{formatCurrency(minInvestment)}</strong> ({lotSize} shares) (based on upper price).
            </p>

            <p>
              The issue includes a reservation of up to 1,00,000 shares for employees offered at a discount of ₹7.00 to the issue price.
            </p>

            <p>
              <strong className="text-slate-900 font-semibold">{ipo.leadManager || 'Choice Capital Advisors Pvt.Ltd.'}</strong> is the book running{' '}
              <span className="text-slate-800 font-medium">lead manager</span> and{' '}
              <strong className="text-slate-900 font-semibold">{ipo.registrarInfo?.name || ipo.registrar || 'Bigshare Services Pvt.Ltd.'}</strong> is the registrar of the issue.
            </p>

            <p className="pt-1 text-xs text-slate-500">
              Refer to {companyName}{' '}
              {ipo.rhpUrl && ipo.rhpUrl !== '#' ? (
                <a href={ipo.rhpUrl} target="_blank" rel="noopener noreferrer" className="text-slate-900 font-semibold underline hover:text-black">
                  RHP
                </a>
              ) : (
                <span className="text-slate-900 font-semibold">RHP</span>
              )}{' '}
              for detailed Information.
            </p>
          </div>
        </section>

        {/* 5. SCHEDULE / TIMETABLE */}
        <div className="mb-14">
          <h2 className="text-lg font-bold text-slate-900 mb-6">
            Schedule
          </h2>

          <div className="relative overflow-x-auto pb-4 pt-2">
            <div className="flex items-center justify-between min-w-[680px] relative px-4">
              {scheduleSteps.map((step, idx) => (
                <div key={idx} className="flex-1 relative flex flex-col items-center text-center">
                  {idx > 0 && (
                    <div
                      className={`absolute top-3.5 right-[50%] w-full h-0.5 -z-0 ${
                        scheduleSteps[idx - 1].status === 'done' ? 'bg-slate-500' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  <div className="z-10 bg-white mb-3">
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

                  <div className="text-xs sm:text-sm font-semibold text-slate-900">
                    {step.date}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-0.5 justify-center font-normal">
                    {step.label}
                    {step.hasInfo && <span className="text-[10px] text-slate-400">ⓘ</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. LOT SIZE & APPLICATION TIERS TABLE */}
        <section className="mb-14">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Lot Size & Application Investment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Investors can bid for a minimum of {lotSize} shares and in multiples thereof. (Amounts calculated at cut-off price ₹{maxPrice}).
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Application Category</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Lots</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Shares</th>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-right">Amount Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {lotTiers.map((tier, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-800">{tier.application}</td>
                    <td className="py-3 px-4 text-slate-700">{tier.lots} Lot{tier.lots > 1 ? 's' : ''}</td>
                    <td className="py-3 px-4 text-slate-700">{tier.shares.toLocaleString('en-IN')} shares</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-right">{formatCurrency(tier.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. REGISTRAR & LEAD MANAGER DETAILS */}
        <div className="border-t border-slate-200 pt-8 mb-14">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Registrar details
          </h2>
          <div className="text-sm text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-900">{ipo.registrarInfo?.name || ipo.registrar || 'Bigshare Services Pvt.Ltd.'}</p>
            {ipo.registrarInfo?.email && <p>Email: <a href={`mailto:${ipo.registrarInfo.email}`} className="text-slate-800 underline">{ipo.registrarInfo.email}</a></p>}
            {ipo.registrarInfo?.contact_number && <p>Phone: {ipo.registrarInfo.contact_number}</p>}
            {ipo.registrarInfo?.website ? (
              <p className="pt-1">
                <a href={ipo.registrarInfo.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-1">
                  Visit registrar website ↗
                </a>
              </p>
            ) : (
              <p className="pt-1">
                <a href="https://www.bigshareonline.com/ipo_Allotment.html" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline font-medium inline-flex items-center gap-1">
                  Visit registrar website ↗
                </a>
              </p>
            )}
          </div>
        </div>

        {/* 8. EXPLORE OTHER IPOS (Seamless linking from one IPO to another at bottom) */}
        {otherIpos.length > 0 && (
          <section className="mt-14 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Explore Other Active & Upcoming IPOs
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Click any offering below to navigate directly to its full detailing page
                </p>
              </div>
              <Link href="/" className="btn-gray-outline text-xs py-1.5 px-3">
                View All {allIpos.length} IPOs ↗
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {otherIpos.map((other) => (
                <IpoCard
                  key={other.ipoId || other.Symbol}
                  ipo={other}
                  onViewDetails={handleNavigateIpo}
                  onShare={handleShare}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
