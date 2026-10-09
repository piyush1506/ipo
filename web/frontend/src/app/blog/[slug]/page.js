import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { getBlogPostBySlug, getAllBlogPosts, getRelatedBlogPosts } from '../../../data/blogPosts';

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: 'Article Not Found | pkctechs',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com';
  const url = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | pkctechs Blog`,
    description: post.summary,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      type: 'article',
      publishedTime: post.publishDate,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pkctechs.com';

  // Article JSON-LD Structured Data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.summary,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'pkctechs',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.svg`,
      },
    },
    datePublished: post.publishDate,
    dateModified: post.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${baseUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `${baseUrl}/blog/${post.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <Script
        id="article-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="max-w-[1100px] mx-auto px-5 sm:px-6 py-8 sm:py-10 w-full flex-1">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal flex-wrap">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-slate-800 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">{post.title}</span>
        </nav>

        {/* Article Header */}
        <header className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-normal">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              {post.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mb-6">
            {post.summary}
          </p>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-slate-100">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {post.author.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">{post.author.name}</p>
                <p className="text-[11px] text-slate-500 font-normal">{post.author.role} • Published {post.publishDate}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </header>

        {/* Article Grid: Content + TOC Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Article Body */}
          <article className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-8 text-slate-700 text-sm sm:text-base leading-relaxed">
            {post.sections.map((sec, idx) => (
              <section key={sec.id || idx} id={sec.id} className="scroll-mt-24 space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug pt-2 border-t border-slate-100 first:border-0 first:pt-0">
                  {sec.heading}
                </h2>
                <div className="text-slate-700 text-xs sm:text-sm leading-relaxed space-y-3 whitespace-pre-line font-normal">
                  {sec.content}
                </div>
              </section>
            ))}

            {/* Callout Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-xs sm:text-sm text-slate-600 space-y-2 mt-8">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <span>💡</span> Key Investor Takeaway
              </div>
              <p>
                IPO allotment success is grounded in disciplined adherence to SEBI lottery mechanics and strict data accuracy. Always verify promoter fundamentals and avoid relying solely on unofficial market hype.
              </p>
            </div>

            {/* Author Signature Box */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 flex items-start gap-4 mt-8">
              <div className="w-10 h-10 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {post.author.avatar || 'PK'}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">{post.author.name}</p>
                <p className="text-slate-500 mt-0.5 font-medium">{post.author.role}</p>
                <p className="text-slate-600 mt-2 leading-relaxed">
                  {post.author.bio || 'Tracking Indian primary market offerings, SEBI guidelines, and registrar updates to empower retail investors with objective data, valuation benchmarks, and allotment routing.'}
                </p>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Table of Contents */}
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3.5 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Table of Contents
                </h3>
                <ul className="space-y-2 text-xs font-normal">
                  {post.tableOfContents.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="text-slate-600 hover:text-slate-900 transition-colors block py-0.5 leading-snug"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Action Widget */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
                Live Data
              </span>
              <h4 className="text-sm font-bold mt-2.5 mb-1 text-white">
                Track Live Offerings & Bidding
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed font-normal">
                Stream real-time price bands, issue sizes, and subscription rates across Mainboard and SME.
              </p>
              <Link
                href="/"
                className="btn-light-primary w-full text-xs py-2 block text-center"
              >
                Go to Live Dashboard →
              </Link>
            </div>

            {/* Statutory Disclaimer Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">
              <strong className="text-slate-700 block mb-1">Non-Advisory Notice:</strong>
              This article is published strictly for educational and informational purposes. pkctechs is not a SEBI-registered advisor. Refer to official DRHP/RHP filings before investing.
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                Recommended IPO Guides & Analysis
              </h3>
              <Link href="/blog" className="text-xs font-semibold text-slate-700 hover:text-slate-900">
                View All Guides →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((rel) => (
                <article
                  key={rel.slug}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rel.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {rel.readTime}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-slate-600 transition-colors leading-snug mb-2 line-clamp-2">
                      <Link href={`/blog/${rel.slug}`}>
                        {rel.title}
                      </Link>
                    </h4>
                    <p className="text-[11px] text-slate-500 font-normal leading-relaxed line-clamp-2 mb-3">
                      {rel.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{rel.publishDate}</span>
                    <Link href={`/blog/${rel.slug}`} className="font-semibold text-slate-800 hover:text-slate-600">
                      Read →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
