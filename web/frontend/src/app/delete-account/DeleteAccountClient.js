'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DeleteAccountClient() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('No longer using the app');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (!confirmed) {
      setErrorMsg('Please tick the confirmation checkbox to proceed.');
      return;
    }

    const confirmPrompt = window.confirm(
      `Are you sure you want to permanently delete the account associated with "${email}"?\n\nThis will immediately purge all cloud-saved PAN profiles, push tokens, and account information.`
    );
    if (!confirmPrompt) return;

    setLoading(true);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          reason,
          confirmed: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message || 'Your account deletion request has been processed successfully.',
          email: email.trim().toLowerCase(),
        });
        setEmail('');
        setConfirmed(false);
      } else {
        setErrorMsg(data.message || 'Failed to process account deletion. Please try again or email support@pkctechs.in.');
      }
    } catch (err) {
      setErrorMsg('Network error occurred. Please check your connection or contact support@pkctechs.in directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Policy Transparency Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-rose-50 text-rose-600 text-xs font-bold inline-flex items-center justify-center">1</span>
            Account & Data Deletion Transparency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In accordance with Google Play Developer Policies and global privacy standards (GDPR, DPDP Act), <strong>pkctechs</strong> allows users of the <strong>Banji – IPO Allotment Checker</strong> mobile application and website to request immediate and permanent deletion of their accounts and all associated data.
          </p>
        </div>

        {/* Data Matrix Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-2 text-rose-900 font-semibold text-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              Data That Will Be Permanently Erased:
            </div>
            <ul className="text-xs text-rose-800/90 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Your registered Google Profile info (Name, Email address, Profile avatar).</li>
              <li>All cloud-synchronized PAN profiles and family account records.</li>
              <li>Push notification registration tokens (FCM) & device associations.</li>
              <li>Personalized IPO watchlist bookmarks and customized filters.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs mb-2">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              Data Retention & On-Device Info:
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Financial Data:</strong> We never collect bank accounts, trading PINs, or demat passwords.</li>
              <li><strong>Local Storage:</strong> PANs stored exclusively in on-device KeyStore/Keychain are deleted when you clear app storage or uninstall the app.</li>
              <li><strong>Audit Logs:</strong> Non-personally identifiable server access logs are purged every 30 days.</li>
            </ul>
          </div>
        </div>

        {/* In-app alternative instructions */}
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 space-y-1">
          <span className="font-semibold block">📱 Prefer deleting directly from the mobile app?</span>
          <p className="text-amber-800 leading-relaxed">
            Open the <strong>Banji</strong> app &rarr; Tap on <strong>Profile / Settings</strong> &rarr; Scroll down to <strong>Account</strong> &rarr; Tap <strong>Delete Account & Data</strong>. This instantly wipes all local device storage and deletes your cloud profile in one step.
          </p>
        </div>
      </div>

      {/* Interactive Web Self-Service Deletion Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-3">
            <span>⚠️ Self-Service Request Form</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Submit Account Deletion Request
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter the Google account email address you used to sign into Banji / pkctechs.
          </p>
        </div>

        {result?.success ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <h3 className="text-base font-bold text-emerald-950">
                Account Deletion Completed / Requested
              </h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {result.message}
            </p>
            <div className="text-xs text-emerald-700 pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
              <span>Account: <strong>{result.email}</strong></span>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="text-xs font-semibold underline text-emerald-900 hover:text-emerald-700"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="deleteEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Registered Google Account / Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="deleteEmail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all placeholder:text-slate-400 bg-slate-50/50"
              />
              <span className="text-[11px] text-slate-500 mt-1.5 block">
                Must match the Google account or email linked to your mobile app profile.
              </span>
            </div>

            <div>
              <label htmlFor="deleteReason" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Reason for leaving (Optional)
              </label>
              <select
                id="deleteReason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-slate-50/50"
              >
                <option value="No longer investing in IPOs">No longer investing in IPOs</option>
                <option value="Privacy concerns">Privacy concerns</option>
                <option value="Switching devices / platform">Switching devices / platform</option>
                <option value="Too many notifications">Too many notifications</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <span className="text-xs text-slate-700 leading-relaxed font-normal">
                  I understand that this action is <strong>permanent and irreversible</strong>. All my cloud profiles, saved PAN records, and notification subscriptions will be completely erased and cannot be restored.
                </span>
              </label>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white text-xs font-bold tracking-wide transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing Permanent Deletion...</span>
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete My Account & All Data</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center sm:text-right">
                Need help? Contact{' '}
                <a href="mailto:support@pkctechs.in" className="text-slate-800 font-medium underline">
                  support@pkctechs.in
                </a>
              </p>
            </div>
          </form>
        )}
      </div>

      {/* Google Play / Policy Verification Details */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-xs text-slate-600 space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">
          Regulatory & Policy Compliance Notice
        </h3>
        <p className="leading-relaxed">
          This page serves as the official Account & Data Deletion URL for <strong>Banji – IPO Allotment Checker</strong> (`com.pkc.banji`) published by <strong>pkctechs</strong> in compliance with Google Play Store Data Safety guidelines.
        </p>
        <p className="leading-relaxed">
          Requests submitted through this web form are processed automatically by our identity removal service. If you experience any issues or wish to verify the status of your data wipe, please write directly to our Data Protection Officer at{' '}
          <a href="mailto:privacy@pkctechs.in" className="text-slate-900 font-medium underline">
            privacy@pkctechs.in
          </a>{' '}
          with your registered email address.
        </p>
        <div className="pt-2 flex gap-4 text-[11px] text-slate-500">
          <Link href="/privacy-policy" className="hover:text-slate-800 underline">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-800 underline">Terms of Service</Link>
          <Link href="/contact" className="hover:text-slate-800 underline">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
