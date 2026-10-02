'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import IpoCard from '../components/IpoCard';
import IpoTableView from '../components/IpoTableView';
import AllotmentChecker from '../components/AllotmentChecker';
import GoogleSerpPreview from '../components/GoogleSerpPreview';
import Footer from '../components/Footer';
import { fetchAllIPOs, formatCurrency, formatCrores, getDaysRemainingBadge, getBrandPalette } from '../lib/ipoData';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ipos, setIpos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  // View Mode: 'GRID' or 'TABLE'
  const [viewMode, setViewMode] = useState('GRID');

  // Filters & State
  const [activeTab, setActiveTab] = useState('OPEN');
  const [quickFilter, setQuickFilter] = useState('ALL'); // ALL, CLOSING_SOON, HIGH_SUB, MAINBOARD, SME
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // Listen to searchParams (e.g. ?tab=UPCOMING or ?search=VNL from Navbar links)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['OPEN', 'UPCOMING', 'CLOSED', 'SME', 'ALL'].includes(tabParam.toUpperCase())) {
      setActiveTab(tabParam.toUpperCase());
    }
    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  // Load real Upstox IPOs
  const loadIpos = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const data = await fetchAllIPOs();
      if (Array.isArray(data) && data.length > 0) {
        setIpos(data);
      }
    } catch (err) {
      console.error('Error fetching real IPOs:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Real-time automatic data stream: initial load + 20s interval + window focus refresh
  useEffect(() => {
    loadIpos(true);

    const interval = setInterval(() => {
      loadIpos(false);
    }, 20000);

    const handleFocus = () => {
      loadIpos(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadIpos(false);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Direct full-screen navigation handler
  const handleNavigateToIpo = (ipo) => {
    const key = ipo.ipoId || ipo.Symbol;
    router.push(`/ipo/${key}`);
  };

  // Toast notifier
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Share handler
  const handleShare = (ipo) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/ipo/${ipo.ipoId || ipo.Symbol}` : '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Copied link for ${ipo.companyName || ipo.ipoName}!`);
    } else {
      showToast(`Link: ${url}`);
    }
  };

  // Filter & Sort IPOs
  const filteredIpos = useMemo(() => {
    return ipos.filter(ipo => {
      const status = (ipo.status || '').toUpperCase();
      if (activeTab === 'OPEN' && status !== 'OPEN') return false;
      if (activeTab === 'UPCOMING' && status !== 'UPCOMING') return false;
      if (activeTab === 'CLOSED' && status !== 'CLOSED' && status !== 'ALLOTTED' && status !== 'LISTED') return false;
      if (activeTab === 'SME' && (ipo.issueType || '').toUpperCase() !== 'SME') return false;

      // Quick Chips Filter
      const type = (ipo.issueType || '').toUpperCase();
      const sub = parseFloat(ipo.totalSubscription) || 0;
      const daysBadge = getDaysRemainingBadge(ipo.opendate, ipo.closedate, ipo.status);

      if (quickFilter === 'HIGH_SUB' && sub < 1.0) return false;
      if (quickFilter === 'CLOSING_SOON' && daysBadge.type !== 'urgent') return false;
      if (quickFilter === 'MAINBOARD' && type === 'SME') return false;
      if (quickFilter === 'SME' && type !== 'SME') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = (ipo.companyName || '').toLowerCase().includes(query);
        const symbolMatch = (ipo.Symbol || '').toLowerCase().includes(query);
        const industryMatch = (ipo.industry || '').toLowerCase().includes(query);
        if (!nameMatch && !symbolMatch && !industryMatch) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') {
        const da = new Date(a.opendate || 0);
        const db = new Date(b.opendate || 0);
        return db - da;
      }
      if (sortBy === 'DATE_ASC') {
        const da = new Date(a.opendate || 0);
        const db = new Date(b.opendate || 0);
        return da - db;
      }
      if (sortBy === 'SIZE_DESC') {
        return (b.issuesize || 0) - (a.issuesize || 0);
      }
      if (sortBy === 'SUB_DESC') {
        return (parseFloat(b.totalSubscription) || 0) - (parseFloat(a.totalSubscription) || 0);
      }
      return 0;
    });
  }, [ipos, activeTab, quickFilter, searchQuery, sortBy]);

  // Spotlight IPOs (Top 3 open offerings)
  const spotlightIpos = useMemo(() => {
    return ipos
      .filter(i => (i.status || '').toUpperCase() === 'OPEN')
      .slice(0, 3);
  }, [ipos]);

  // Aggregated Counts & Stats
  const metrics = useMemo(() => {
    const openCount = ipos.filter(i => (i.status || '').toUpperCase() === 'OPEN').length;
    const upcomingCount = ipos.filter(i => (i.status || '').toUpperCase() === 'UPCOMING').length;
    const closedCount = ipos.filter(i => {
      const s = (i.status || '').toUpperCase();
      return s === 'CLOSED' || s === 'ALLOTTED' || s === 'LISTED';
    }).length;
    const smeCount = ipos.filter(i => (i.issueType || '').toUpperCase() === 'SME').length;
    const totalPipelineValue = ipos.reduce((acc, curr) => acc + (curr.issuesize || 0), 0);

    return {
      openCount,
      upcomingCount,
      closedCount,
      smeCount,
      totalPipelineValue
    };
  }, [ipos]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectTab={setActiveTab}
        activeTab={activeTab}
      />

      {/* Market Ticker Bar */}
      <div className="bg-white border-b border-slate-200/90 py-2 px-5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <div className="max-w-[1240px] mx-auto flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">NIFTY 50</span>
            <span className="text-slate-800 font-semibold">25,810.15 (+0.42%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">BSE SENSEX</span>
            <span className="text-slate-800 font-semibold">84,282.40 (+0.38%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">NIFTY SME</span>
            <span className="text-slate-800 font-semibold">18,420.10 (+1.15%)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="pulse-live"></span>
            <span className="text-slate-700 font-medium">{ipos.length} Real Upstox Offerings Tracked</span>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="animate-toast fixed top-[76px] right-6 z-[1000] bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-medium shadow-md border border-slate-600 flex items-center gap-2">
          <span className="text-emerald-300">✓</span> {toastMessage}
        </div>
      )}

      {/* Hero Header & Pill Tabs */}
      <section id="tab-container" className="bg-white border-b border-slate-200 pt-8 pb-6 px-5">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Initial Public Offerings (IPOs)
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-normal">
                Apply for live offerings and track upcoming Indian market issues streamed directly from Upstox
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex gap-2 flex-wrap">
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-1.5 flex items-center gap-2">
                <span className="pulse-live"></span>
                <span className="text-xs font-semibold text-slate-700">
                  {loading ? '...' : metrics.openCount} Open Now
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  {loading ? '...' : metrics.upcomingCount} Upcoming
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-lg px-3.5 py-1.5 flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">
                  Total Pipeline Fund: {loading ? '...' : formatCrores(metrics.totalPipelineValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Pill Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[
              { id: 'OPEN', label: `Open now (${metrics.openCount})` },
              { id: 'UPCOMING', label: `Upcoming (${metrics.upcomingCount})` },
              { id: 'CLOSED', label: `Recently Listed (${metrics.closedCount})` },
              { id: 'SME', label: `SME Platform (${metrics.smeCount})` },
              { id: 'ALL', label: `All Offerings (${ipos.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`groww-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Spotlight Carousel / Strip for Open IPOs */}
      {spotlightIpos.length > 0 && activeTab === 'OPEN' && !searchQuery && (
        <section className="max-w-[1240px] mx-auto mt-6 px-5 w-full">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-sm">✨</span>
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              In the Spotlight
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spotlightIpos.map((ipo) => {
              const brand = getBrandPalette(ipo.companyName || ipo.Symbol);
              const maxP = ipo.priceband?.max || ipo.cutoffPrice || ipo.priceband?.min || 0;
              const minInv = maxP * (ipo.lotsize || 1);

              return (
                <div
                  key={ipo.ipoId || ipo.Symbol}
                  onClick={() => handleNavigateToIpo(ipo)}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 flex items-center justify-between gap-3 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-medium text-xs shrink-0 border shadow-2xs"
                      style={{
                        backgroundColor: brand.bg,
                        borderColor: brand.border,
                        color: brand.text,
                      }}
                    >
                      {ipo.Symbol ? ipo.Symbol.slice(0, 3) : 'IPO'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                        {ipo.companyName || ipo.ipoName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-normal">
                        Min. Inv: <span className="font-semibold text-slate-700">{minInv > 0 ? formatCurrency(minInv) : 'Price TBA'}</span> • {ipo.totalSubscription || '0.0'}x Subscribed
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToIpo(ipo);
                    }}
                    className="btn-gray-outline text-xs px-2.5 py-1 rounded-md"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Main Content Area */}
      <main id="ipo-listings" className="max-w-[1240px] mx-auto mt-7 px-5 w-full flex-1">
        {/* Quick Filter Chips & Controls Row */}
        <div className="flex justify-between items-center flex-wrap gap-3.5 mb-5">
          {/* Quick Filter Chips */}
          <div className="flex gap-2 flex-wrap items-center">
            <span className="text-xs font-normal text-slate-500">Filter:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'HIGH_SUB', label: '🔥 High Demand (>1x)' },
              { id: 'CLOSING_SOON', label: '⚡ Closing Soon' },
              { id: 'MAINBOARD', label: '🏢 Mainboard Only' },
              { id: 'SME', label: '🚀 SME Only' }
            ].map(chip => (
              <button
                key={chip.id}
                onClick={() => setQuickFilter(chip.id)}
                className={`filter-chip ${quickFilter === chip.id ? 'active' : ''}`}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Sort & Grid/Table View Switcher */}
          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 cursor-pointer outline-none focus:border-slate-500"
            >
              <option value="DATE_DESC">Bidding Date (Newest)</option>
              <option value="DATE_ASC">Bidding Date (Oldest)</option>
              <option value="SIZE_DESC">Issue Size (High to Low)</option>
              <option value="SUB_DESC">Subscription (Highest)</option>
            </select>

            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button
                onClick={() => setViewMode('GRID')}
                title="Grid Card View"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'GRID' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="7" height="7" x="3" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="3" rx="1"/>
                  <rect width="7" height="7" x="14" y="14" rx="1"/>
                  <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                title="List / Table View"
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'TABLE' ? 'bg-white text-slate-700 shadow-2xs' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" x2="21" y1="6" y2="6"/>
                  <line x1="8" x2="21" y1="12" y2="12"/>
                  <line x1="8" x2="21" y1="18" y2="18"/>
                  <line x1="3" x2="3.01" y1="6" y2="6"/>
                  <line x1="3" x2="3.01" y1="12" y2="12"/>
                  <line x1="3" x2="3.01" y1="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {activeTab === 'OPEN' ? 'Open for Bidding' : activeTab === 'UPCOMING' ? 'Upcoming Offerings' : activeTab === 'CLOSED' ? 'Recently Listed' : activeTab === 'SME' ? 'SME Platform Issues' : 'All Offerings'}
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              Showing {filteredIpos.length} real issues streamed from Upstox (Click any card to open full-screen detail)
            </p>
          </div>
        </div>

        {/* Dynamic IPO Listing: Grid or Table */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 p-5 skeleton" />
            ))}
          </div>
        ) : filteredIpos.length > 0 ? (
          viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredIpos.map(ipo => (
                <IpoCard
                  key={ipo.ipoId || ipo.Symbol}
                  ipo={ipo}
                  onViewDetails={handleNavigateToIpo}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <IpoTableView
              ipos={filteredIpos}
              onViewDetails={handleNavigateToIpo}
              onShare={handleShare}
            />
          )
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-sm font-semibold text-slate-800">No IPOs found</p>
            <p className="text-xs text-slate-500 mt-1 font-normal">Try switching tabs or resetting filters.</p>
            <button
              onClick={() => { setActiveTab('OPEN'); setQuickFilter('ALL'); setSearchQuery(''); }}
              className="btn-dark-primary mt-3.5"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* 5. Direct Allotment Checker Hub */}
        <AllotmentChecker ipos={ipos} />

        {/* 6. Google Search Engine Simulation / SERP Preview */}
        <GoogleSerpPreview />

        {/* 7. FAQ Section */}
        <section className="mt-10">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Frequently Asked Questions about IPOs
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { q: 'How do I apply for an IPO using UPI?', a: 'You can apply for any active IPO by entering your UPI ID through your registered stockbroker or ASBA bank account. Once submitted, accept the mandate request on your UPI app (Google Pay, PhonePe, BHIM, etc.) to block the bidding amount.' },
              { q: 'What is the Cut-off Price in an IPO?', a: 'The cut-off price is the final price per share decided by the issuing company and merchant bankers. Individual retail bidders typically bid at the cut-off price to maximize their chances of allotment.' },
              { q: 'What is the difference between Mainboard and SME IPOs?', a: 'Mainboard IPOs are larger companies listed on the main NSE/BSE platforms with typical minimum investments around ₹14,000–₹15,000. SME IPOs are smaller emerging enterprises listed on BSE SME/NSE Emerge with larger lot sizes and minimum investments around ₹1,00,000–₹1,40,000.' },
              { q: 'When is the blocked money refunded if not allotted?', a: 'If you are not allotted shares, the funds hold is released on the Refund Initiation Date specified in the IPO timetable, typically 1 to 2 working days after the basis of allotment.' }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-3.5 text-left flex justify-between items-center text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {faq.q}
                  <span className="text-slate-600 text-base font-semibold">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-4 text-xs text-slate-500 font-normal leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <HomeContent />
    </Suspense>
  );
}
