'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getAllBlogPosts } from '../../data/blogPosts';

export default function BlogIndexPage() {
  const allPosts = getAllBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const set = new Set(allPosts.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [allPosts]);

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      if (selectedCategory !== 'ALL' && post.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = post.title.toLowerCase().includes(query);
        const summaryMatch = post.summary.toLowerCase().includes(query);
        const tagMatch = post.tags.some((t) => t.toLowerCase().includes(query));
        if (!titleMatch && !summaryMatch && !tagMatch) return false;
      }
      return true;
    });
  }, [allPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return allPosts.find((p) => p.featured) || allPosts[0];
  }, [allPosts]);

  // Schema for Blog Index
  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'pkctechs IPO Investor Insights & Market Guides',
    description: 'Expert guides, allotment strategies, and regulatory insights on Indian Primary Equity Markets.',
    url: 'https://www.pkctechs.com/blog',
    publisher: {
      '@type': 'Organization',
      name: 'pkctechs',
      url: 'https://www.pkctechs.com',
      logo: 'https://www.pkctechs.com/icon.svg',
    },
    blogPost: allPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.summary,
      url: `https://www.pkctechs.com/blog/${post.slug}`,
      datePublished: post.publishDate,
      author: {
        '@type': 'Organization',
        name: post.author.name,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <Script
        id="blog-list-ld-json"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      <main className="max-w-[1240px] mx-auto px-5 sm:px-6 py-8 sm:py-10 w-full flex-1">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">IPO Knowledge Base & Blog</span>
        </nav>

        {/* Hero Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-3.5">
                <span>📚 Master Primary Markets</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                IPO Guides, Allotment Strategies & Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-2.5 leading-relaxed">
                Empower your primary market decisions with expert, SEBI-compliant guides covering retail lottery mechanics, GMP insights, DRHP analysis, and ASBA banking rules.
              </p>
            </div>

            {/* Live Counter Badge */}
            <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200 shrink-0 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {allPosts.length} Educational Guides
              </span>
              <span className="text-[11px] text-slate-500 font-normal">
                Updated weekly with SEBI regulatory changes
              </span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by topic, keyword, or tag..."
                className="w-full h-10 pl-9.5 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder:text-slate-400 font-normal outline-none focus:bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-500/15 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-slate-800 text-white border-slate-800 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'ALL' ? 'All Guides' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Guide Banner (if on ALL and no search) */}
        {selectedCategory === 'ALL' && !searchQuery && featuredPost && (
          <section className="mb-10">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 uppercase tracking-wider">
                    ⭐ Editor's Pick
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {featuredPost.category} • {featuredPost.readTime}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-3">
                  <Link href={`/blog/${featuredPost.slug}`} className="hover:underline">
                    {featuredPost.title}
                  </Link>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5 line-clamp-2">
                  {featuredPost.summary}
                </p>
                <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-t border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white">
                      {featuredPost.author.avatar}
                    </div>
                    <div className="text-xs text-slate-300">
                      <span className="font-semibold text-white">{featuredPost.author.name}</span> • {featuredPost.publishDate}
                    </div>
                  </div>
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition-colors shadow-xs"
                  >
                    Read Master Guide →
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Blog Posts Grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {selectedCategory === 'ALL' ? 'Latest Guides & Articles' : `${selectedCategory} Guides`}
            </h3>
            <span className="text-xs text-slate-500 font-normal">
              Showing {filteredPosts.length} of {allPosts.length} articles
            </span>
          </div>

          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.slug}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div>
                    {/* Header: Category + Read Time */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        {post.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        {post.readTime}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-slate-600 transition-colors leading-snug mb-2.5">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h4>

                    {/* Summary */}
                    <p className="text-xs text-slate-500 leading-relaxed font-normal mb-4 line-clamp-3">
                      {post.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer: Author & Read CTA */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {post.author.avatar}
                      </div>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {post.publishDate}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-semibold text-slate-800 group-hover:text-slate-600 flex items-center gap-1 transition-colors"
                    >
                      Read Guide
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6"/>
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <p className="text-sm font-semibold text-slate-800">No guides matching your criteria</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting "All Guides".</p>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="btn-dark-primary mt-4"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>

        {/* Direct Registrar & Live IPO CTA */}
        <section className="mt-14 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xs">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-slate-900">
              Ready to check live offerings or allotment status?
            </h4>
            <p className="text-xs text-slate-500 max-w-xl">
              Track live price bands, real-time subscription multiples, and direct registrar routing on our high-speed dashboard.
            </p>
          </div>
          <div className="flex gap-3 shrink-0 flex-wrap justify-center">
            <Link href="/" className="btn-dark-primary text-xs py-2.5 px-4">
              View Live IPOs
            </Link>
            <Link href="/allotment-status" className="btn-gray-outline text-xs py-2.5 px-4">
              Official Registrars
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
