'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import IpoCard from '../components/IpoCard';
import IpoCardSkeleton from '../components/IpoCardSkeleton';
import IpoTableView from '../components/IpoTableView';
import Footer from '../components/Footer';
import { fetchAllIPOs, getCachedIPOs, formatCurrency, formatCrores, getDaysRemainingBadge, getBrandPalette } from '../lib/ipoData';

function HomeContent({ initialIpos = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ipos, setIpos] = useState(() => initialIpos);
  const [loading, setLoading] = useState(initialIpos.length === 0);
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

  // Sync state with URL params on client navigation
  useEffect(() => {
    let isCurrent = true;

    queueMicrotask(() => {
      if (!isCurrent) return;

      const tabParam = searchParams.get('tab');
      if (tabParam && ['OPEN', 'UPCOMING', 'CLOSED', 'SME', 'ALL'].includes(tabParam.toUpperCase())) {
        setActiveTab((prev) => (prev !== tabParam.toUpperCase() ? tabParam.toUpperCase() : prev));
      }
      const searchParam = searchParams.get('search');
      if (searchParam !== null) {
        setSearchQuery((prev) => (prev !== searchParam ? searchParam : prev));
      }
    });

    return () => {
      isCurrent = false;
    };
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

  // Real-time automatic data stream: instant cached mount + 60s interval + window focus refresh
  useEffect(() => {
    let isMounted = true;
    let retryTimeout;
    let retryDelay = 2000;

    // Instantly check local cache on mount for 0ms render
    const cached = getCachedIPOs();
    if (initialIpos.length === 0 && cached.length > 0) {
      queueMicrotask(() => {
        if (!isMounted) return;
        setIpos(cached);
        setLoading(false);
      });
    }

    const loadInitialData = async () => {
      try {
        const data = await fetchAllIPOs();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setIpos(data);
          retryDelay = 2000;
        } else if (isMounted) {
          retryTimeout = setTimeout(loadInitialData, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      } catch (err) {
        console.error('Error fetching initial IPOs:', err);
        if (isMounted) {
          retryTimeout = setTimeout(loadInitialData, retryDelay);
          retryDelay = Math.min(retryDelay * 2, 30000);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitialData();

    const interval = setInterval(() => {
      loadIpos(false);
    }, 60000);

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
      isMounted = false;
      clearTimeout(retryTimeout);
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [initialIpos]);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <IpoCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredIpos.length > 0 ? (
          viewMode === 'GRID' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-xl">
                ⏳
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {activeTab === 'OPEN' ? 'No IPOs Currently Accepting Live Bids Today' : 'No Offerings Match Your Filter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-lg mx-auto leading-relaxed">
                {activeTab === 'OPEN'
                  ? 'Indian stock exchange bidding windows operate Monday to Friday (10:00 AM – 5:00 PM IST). You can explore recently listed benchmark offerings or check upcoming issues in the pipeline below.'
                  : 'Try adjusting your search criteria or resetting filters to view all tracked market issues.'}
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => { setActiveTab('CLOSED'); setQuickFilter('ALL'); setSearchQuery(''); }}
                  className="btn-dark-primary text-xs"
                >
                  View Recently Listed IPOs
                </button>
                <button
                  onClick={() => { setActiveTab('UPCOMING'); setQuickFilter('ALL'); setSearchQuery(''); }}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  View Upcoming Pipeline
                </button>
              </div>
            </div>

            {/* Display Benchmark / Recent IPOs so crawlers and visitors always see complete cards */}
            {ipos.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-800 mb-3">
                  Benchmark & Recent Indian IPO Issues
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ipos.slice(0, 6).map(ipo => (
                    <IpoCard
                      key={ipo.ipoId || ipo.Symbol}
                      ipo={ipo}
                      onViewDetails={handleNavigateToIpo}
                      onShare={handleShare}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. Comprehensive Educational Content Section for AdSense & Investor Awareness */}
        <section className="mt-14 bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-10 text-slate-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 mb-3">
              <span>📖 Complete Primary Market Masterclass</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Comprehensive Guide to Indian Initial Public Offerings (IPOs)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl">
              An Initial Public Offering (IPO) is the process by which a privately-held Indian company raises capital from retail investors, High Net-worth Individuals (HNIs), and Qualified Institutional Buyers (QIBs) to list its equity shares on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE).
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>1. Understanding Issue Pricing & Cut-off Price</span>
              </h3>
              <p className="text-slate-600">
                Most Indian IPOs use a <strong>Book Building Process</strong> with a defined price band (e.g., ₹450 to ₹475 per share). Retail investors have the unique privilege of bidding at the <em>"Cut-off Price"</em>, which guarantees their bid will automatically match whatever final price the issuer and book-running lead managers determine upon closing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>2. SEBI ASBA & UPI 2.0 Bidding Framework</span>
              </h3>
              <p className="text-slate-600">
                Under SEBI regulations, physical cheques and direct cash debits are prohibited. Applications must be routed via <strong>ASBA (Application Supported by Blocked Amount)</strong> or <strong>UPI 2.0 Mandates</strong> (up to ₹5,00,000 per application). Your money never leaves your bank account until shares are officially allotted.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>3. Mainboard vs. SME Platform IPOs</span>
              </h3>
              <p className="text-slate-600">
                <strong>Mainboard IPOs</strong> feature established enterprises with minimum retail investments of approximately ₹14,000–₹15,000 per lot. In contrast, <strong>SME IPOs</strong> (listed on BSE SME or NSE Emerge) are tailored for early-stage and medium businesses, featuring higher minimum lot values (typically ₹1,00,000 to ₹1,40,000) and strict market maker liquidity provisions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span>4. The Allotment Lottery Mechanism & Refunds</span>
              </h3>
              <p className="text-slate-600">
                When an IPO is oversubscribed in the retail category, shares are allotted through an automated, computerized lottery overseen by SEBI and exchange representatives. Every valid retail applicant has an equal chance of receiving one minimum lot. For unallotted applications, the UPI bank mandate hold is automatically revoked within T+2 days.
              </p>
            </div>
          </div>

          {/* Section: How to Analyze an IPO (DRHP/RHP Checklist) */}
          <div className="border-t border-slate-200 pt-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              How to Evaluate an IPO: Fundamental Checklist Before Bidding
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Evaluating an IPO requires analyzing the company’s Draft Red Herring Prospectus (DRHP) filed with SEBI rather than relying on market rumors or unofficial premiums. Here are the 4 fundamental pillars every retail investor should review:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">A. Objects of the Issue (Fresh Issue vs. OFS)</span>
                <p className="text-slate-500 leading-relaxed">
                  Look at how much of the capital is a <strong>Fresh Issue</strong> (injected directly into company operations, capex, or debt reduction) versus an <strong>Offer for Sale (OFS)</strong>, where existing promoters or venture funds are monetizing their stake without funds entering the company.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">B. Financial Health & Operating Margins</span>
                <p className="text-slate-500 leading-relaxed">
                  Review 3-year restated financials for compound annual growth rates (CAGR) in revenue, EBITDA margins, PAT (Profit After Tax), and Debt-to-Equity ratios. Consistent revenue expansion and positive free cash flows indicate underlying business strength.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">C. Valuation & Peer Comparison</span>
                <p className="text-slate-500 leading-relaxed">
                  Compare the issuer's asking Price-to-Earnings (P/E) multiple, Return on Net Worth (RoNW), and Price-to-Book (P/B) value against already-listed domestic industry competitors. An aggressive asking valuation leaves minimal margin of safety for retail listing gains.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <span className="font-bold text-slate-900 block">D. Promoter Pedigree & Litigation Risks</span>
                <p className="text-slate-500 leading-relaxed">
                  Carefully read Section V ("Risk Factors") in the RHP for pending regulatory lawsuits, promoter pledging, key customer concentration risks, and vendor dependency.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Indian Primary Market Glossary */}
          <div className="border-t border-slate-200 pt-8 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Key Indian IPO Terminology & Glossary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">ASBA</strong>
                <p className="text-slate-500">Application Supported by Blocked Amount. Money stays in your bank account until allotment.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">RHP (Red Herring Prospectus)</strong>
                <p className="text-slate-500">Official legal disclosure document detailing business operations, financials, and risks.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Cut-Off Price</strong>
                <p className="text-slate-500">The final issue price determined by the issuer. Retail bidders select this to avoid rejection.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Anchor Allocation</strong>
                <p className="text-slate-500">Institutional allocation (QIBs) finalized 1 day prior to the public opening with lock-in terms.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">Basis of Allotment</strong>
                <p className="text-slate-500">Official document published by the registrar detailing oversubscription ratios and lottery winners.</p>
              </div>
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <strong className="text-slate-900 block mb-1">T+3 Listing Timeline</strong>
                <p className="text-slate-500">SEBI mandate requiring equity shares to list on stock exchanges within 3 working days of closing.</p>
              </div>
            </div>
          </div>

          {/* Step-by-Step Registrar Verification */}
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-sm font-bold text-slate-900 mb-2">How to Verify Allotment on Official Registrars</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Allotment status is compiled by SEBI-registered Registrars and Transfer Agents (RTAs) such as <strong>Link Intime India</strong>, <strong>KFin Technologies</strong>, <strong>Bigshare Services</strong>, and <strong>Maashitla Securities</strong>. To check your status:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
              <li>Identify the designated registrar from our IPO Detail or Allotment Status page.</li>
              <li>Click the direct registrar link to open their secure verification portal.</li>
              <li>Select the company name from the dropdown and enter your PAN number, Application Number, or DP Client ID.</li>
              <li>Submit to view your allotted share count and refund credit details instantly.</li>
            </ol>
          </div>
        </section>

        {/* 7. Comprehensive Statutory Financial Disclaimer Banner */}
        <section className="mt-10 bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 sm:p-8 text-xs text-amber-900/90 space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-950 text-sm">
            <span>⚠️</span> Statutory Regulatory Notice & Financial Risk Disclaimer
          </div>
          <p className="leading-relaxed">
            <strong>pkctechs</strong> is an independent educational and financial market intelligence portal. We are <strong>NOT</strong> registered with the Securities and Exchange Board of India (SEBI) as an Investment Advisor (RIA) or Research Analyst (RA). None of the information, subscription data, calculations, or articles published on this platform constitute investment advice, buy/sell recommendations, or solicitations to participate in public issues.
          </p>
          <p className="leading-relaxed">
            Equity investments and Initial Public Offerings (IPOs) are subject to significant market risks, including the complete loss of invested principal. Historical subscription figures or unofficial Grey Market Premiums (GMP) do not guarantee positive listing gains. Always read the official Red Herring Prospectus (RHP) approved by SEBI and consult a certified SEBI-registered financial planner before making investment decisions.
          </p>
        </section>

        {/* 8. FAQ Section */}
        <section className="mt-10">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Frequently Asked Questions about IPOs
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { q: 'How do I apply for an IPO using UPI?', a: 'You can apply for any active IPO by entering your UPI ID through your registered stockbroker or ASBA bank account. Once submitted, accept the mandate request on your UPI app (Google Pay, PhonePe, BHIM, etc.) to block the bidding amount.' },
              { q: 'What is the Cut-off Price in an IPO?', a: 'The cut-off price is the final price per share decided by the issuing company and merchant bankers. Individual retail bidders typically bid at the cut-off price to maximize their chances of allotment.' },
              { q: 'What is the difference between Mainboard and SME IPOs?', a: 'Mainboard IPOs are larger companies listed on the main NSE/BSE platforms with typical minimum investments around ₹14,000–₹15,000. SME IPOs are smaller emerging enterprises listed on BSE SME/NSE Emerge with larger lot sizes and minimum investments around ₹1,00,000–₹1,40,000.' },
              { q: 'When is the blocked money refunded if not allotted?', a: 'If you are not allotted shares, the funds hold is released on the Refund Initiation Date specified in the IPO timetable, typically 1 to 2 working days after the basis of allotment.' },
              { q: 'Can I apply for multiple lots in an oversubscribed IPO to increase chances?', a: 'Under SEBI retail allotment rules, oversubscribed IPOs are allotted via a computerized randomized lottery where each winner receives exactly one minimum lot. Applying for multiple lots under a single PAN does not increase your mathematical lottery probability.' },
              { q: 'What is Grey Market Premium (GMP) and is it reliable?', a: 'Grey Market Premium (GMP) is an unofficial, unregulated cash premium traded between private dealers before listing. It is not endorsed by SEBI, BSE, or NSE, and can fluctuate wildly. Investors should never base financial decisions solely on GMP.' },
              { q: 'What happens during the IPO listing day pre-open session?', a: 'On listing day, a special 45-minute Call Auction session takes place from 9:00 AM to 9:45 AM on NSE and BSE. Orders are matched to discover the official listing opening price before regular trading commences at 10:00 AM.' },
              { q: 'How do I verify if my IPO application was rejected due to technical errors?', a: 'You can verify rejection reasons by downloading the Bid Confirmation Slip from your broker portal or checking the designated registrar website once the basis of allotment is finalized.' }
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

export default function Home({ initialIpos = [] }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <HomeContent initialIpos={initialIpos} />
    </Suspense>
  );
}
