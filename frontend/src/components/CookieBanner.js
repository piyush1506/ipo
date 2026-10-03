'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('pkc_cookie_consent');
      if (!consent) {
        // Show banner after brief delay
        const timer = setTimeout(() => setShowBanner(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localStorage errors in restricted environments
    }
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem('pkc_cookie_consent', 'all');
    } catch (e) {}
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    try {
      localStorage.setItem('pkc_cookie_consent', 'essential');
    } catch (e) {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-[440px] z-[999] bg-white rounded-2xl border border-slate-200 shadow-xl p-5 text-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-lg shrink-0">
          🍪
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-bold text-slate-900 mb-1">
            Cookie & Privacy Preferences
          </h3>
          <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
            We use cookies and third-party services (such as Google AdSense & Google Analytics) to improve performance, remember settings, and display personalized or relevant ads. Read our{' '}
            <Link href="/cookie-policy" className="text-slate-800 underline font-medium hover:text-slate-950">
              Cookie Policy
            </Link>{' '}
            and{' '}
            <Link href="/privacy-policy" className="text-slate-800 underline font-medium hover:text-slate-950">
              Privacy Policy
            </Link>.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Accept All
            </button>
            <button
              onClick={handleEssentialOnly}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Essential Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
