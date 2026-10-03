'use client';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate instant client-side feedback
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[900px] mx-auto px-5 sm:px-6 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-normal">
          <Link href="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Contact Us</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-2xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 mb-4">
            <span>📬 Support & Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Contact pkctechs Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            We are here to assist with platform questions, data correction requests, API queries, or general feedback. Our support team typically responds within 24–48 business hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Direct Contact Details & Officers */}
          <div className="md:col-span-1 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Official Channels
              </h2>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  General Inquiries
                </span>
                <a href="mailto:support@pkctechs.com" className="text-xs text-slate-800 hover:text-slate-900 font-medium underline">
                  support@pkctechs.com
                </a>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Legal & Compliance
                </span>
                <a href="mailto:legal@pkctechs.com" className="text-xs text-slate-800 hover:text-slate-900 font-medium underline">
                  legal@pkctechs.com
                </a>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Editorial & Corrections
                </span>
                <a href="mailto:editorial@pkctechs.com" className="text-xs text-slate-800 hover:text-slate-900 font-medium underline">
                  editorial@pkctechs.com
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Operating Hours
                </span>
                <p className="text-xs text-slate-600">
                  Mon – Fri: 9:00 AM – 6:00 PM IST (Excluding NSE/BSE Market Holidays)
                </p>
              </div>
            </div>

            {/* Grievance & Compliance Box */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
              <h3 className="font-bold text-slate-900">Grievance Redressal</h3>
              <p className="leading-relaxed">
                Under the Indian Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, you may submit regulatory grievances to our designated Grievance Officer at <a href="mailto:compliance@pkctechs.com" className="underline font-medium text-slate-800">compliance@pkctechs.com</a>.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
            <h2 className="text-base font-bold text-slate-900 mb-2">Send us a Message</h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill out the form below and our team will get back to your email address promptly.
            </p>

            {submitted ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-3 text-xl">
                  ✓
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Message Received!</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Thank you for reaching out to pkctechs. We have recorded your message and will reply to your email within 24–48 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn-dark-primary text-xs"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="e.g. rahul@example.com"
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Subject / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="General Inquiry">General Platform Inquiry</option>
                    <option value="Data Correction">IPO Data Correction / Update</option>
                    <option value="Allotment Help">Allotment Verification Feedback</option>
                    <option value="Bug Report">Technical Bug Report</option>
                    <option value="Advertising">Advertising / Partnership</option>
                    <option value="Compliance">Regulatory / Legal Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message Details <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    placeholder="Please describe your question or issue in detail..."
                    className="w-full p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 outline-none focus:border-slate-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-dark-primary w-full text-xs py-3"
                  >
                    {loading ? 'Submitting Message...' : 'Send Message to pkctechs Team'}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    🔒 We respect your privacy. Your email will never be shared with third parties.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
