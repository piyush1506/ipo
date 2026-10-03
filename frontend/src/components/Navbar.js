'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar({ searchQuery, onSearchChange, onSelectTab, activeTab }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId) => {
    setMobileMenuOpen(false);

    if (tabId === 'GUIDE') {
      router.push('/ipo-guide');
      return;
    }

    if (tabId === 'BLOG') {
      router.push('/blog');
      return;
    }

    if (tabId === 'ABOUT') {
      router.push('/about');
      return;
    }

    if (tabId === 'CONTACT') {
      router.push('/contact');
      return;
    }

    if (pathname === '/' && onSelectTab) {
      onSelectTab(tabId);
      if (typeof window !== 'undefined') {
        const el = document.getElementById('ipo-listings') || document.getElementById('tab-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else {
      router.push(`/?tab=${tabId}#ipo-listings`);
    }
  };

  const navLinks = [
    { id: 'OPEN', label: 'Open IPOs', hasPulse: true },
    { id: 'UPCOMING', label: 'Upcoming', hasPulse: false },
    { id: 'CLOSED', label: 'Recently Listed', hasPulse: false },
    { id: 'SME', label: 'SME Platform', hasPulse: false },
    { id: 'BLOG', label: 'IPO Blog & Guides', hasPulse: false },
  ];

  return (
    <header className="sticky top-0 z-[100] bg-white border-b border-slate-200/80 shadow-2xs backdrop-blur-md">
      <div className="max-w-[1240px] mx-auto px-5 h-[64px] flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/' && onSelectTab) {
              e.preventDefault();
              onSelectTab('OPEN');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2.5 no-underline group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-white shadow-2xs group-hover:bg-slate-800 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                pkc<span className="text-slate-500 font-medium">techs</span>
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                IPO
              </span>
            </div>
          </div>
        </Link>

        {/* Global Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-[340px] relative items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => {
              if (pathname !== '/' && e.target.value) {
                router.push(`/?search=${encodeURIComponent(e.target.value)}#ipo-listings`);
              } else if (onSearchChange) {
                onSearchChange(e.target.value);
              }
            }}
            placeholder="Search IPOs, companies..."
            className="w-full h-9 pl-9.5 pr-4 rounded-lg border border-slate-200 bg-slate-50/80 text-xs text-slate-800 placeholder:text-slate-400 font-normal outline-none transition-all focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-500/15"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-5">
          {navLinks.map((item) => {
            const isActive =
              (item.id === 'BLOG' && pathname.startsWith('/blog')) ||
              (item.id === 'GUIDE' && pathname === '/ipo-guide') ||
              (pathname === '/' && activeTab === item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-xs font-medium flex items-center gap-1.5 py-1 transition-colors cursor-pointer bg-transparent border-none ${
                  isActive ? 'font-bold text-slate-900 border-b-2 border-slate-700' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.hasPulse && <span className="pulse-live"></span>}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Live Indicator & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="hidden xl:inline-block text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="hidden xl:inline-block text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            Contact
          </Link>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-normal">
            <span className="pulse-live"></span>
            <span>Live Stream</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M4 12h16M4 6h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-5 py-4 flex flex-col gap-3">
          {/* Mobile Search */}
          <div className="relative mb-1">
            <input
              type="text"
              value={searchQuery || ''}
              onChange={(e) => {
                if (pathname !== '/' && e.target.value) {
                  router.push(`/?search=${encodeURIComponent(e.target.value)}#ipo-listings`);
                } else if (onSearchChange) {
                  onSearchChange(e.target.value);
                }
              }}
              placeholder="Search IPOs..."
              className="w-full h-9 pl-4 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800"
            />
          </div>

          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`text-xs text-left py-2 flex items-center gap-2 cursor-pointer bg-transparent border-none ${
                (pathname === '/' && activeTab === item.id) ||
                (item.id === 'GUIDE' && pathname === '/ipo-guide') ||
                (item.id === 'BLOG' && pathname.startsWith('/blog'))
                  ? 'font-bold text-slate-900 bg-slate-50 px-2 rounded-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.hasPulse && <span className="pulse-live"></span>}
              {item.label}
            </button>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100 flex flex-col gap-2 text-xs">
            <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-900 py-1">
              About Us
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-900 py-1">
              Contact Support
            </Link>
            <Link href="/privacy-policy" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-900 py-1">
              Privacy Policy
            </Link>
            <Link href="/disclaimer" onClick={() => setMobileMenuOpen(false)} className="text-slate-600 hover:text-slate-900 py-1">
              Financial Disclaimer
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
