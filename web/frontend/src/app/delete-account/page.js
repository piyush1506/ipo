import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DeleteAccountClient from './DeleteAccountClient';

export const metadata = {
  title: 'Delete Account & Data | Banji - IPO Allotment Checker',
  description: 'Submit an official account and data deletion request for Banji – IPO Allotment Checker app and pkctechs platform in accordance with Google Play Data Safety policies.',
  alternates: {
    canonical: 'https://pkctechs.in/delete-account',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Delete Account</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 mb-4">
            <span>🗑️ Account & Data Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Delete Your Banji Account & Associated Data
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            You can delete your account, saved cloud profiles, and associated data at any time. Read below to understand what data will be deleted or submit your deletion request directly.
          </p>
        </div>

        {/* Interactive Client Component */}
        <DeleteAccountClient />
      </main>

      <Footer />
    </div>
  );
}
