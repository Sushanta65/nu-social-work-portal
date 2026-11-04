import React, { useState } from 'react';
import {
  GraduationCap,
  User,
  Mail,
  Building,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import { GOOGLE_SHEETS_WEBHOOK_URL, STUDENT_STORAGE_KEY } from '../config';

export default function StudentAccessGate({ onAccessGranted }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedCollege = college.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setError('অনুগ্রহ করে আপনার সঠিক নাম লিখুন।');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('অনুগ্রহ করে একটি সঠিক ও সক্রিয় ইমেইল অ্যাড্রেস লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const studentData = {
      name: trimmedName,
      email: trimmedEmail,
      college: trimmedCollege || 'উল্লেখ নেই',
      timestamp: new Date().toISOString(),
      formattedDate: new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })
    };

    // If Webhook URL is configured, send data to Google Sheets
    if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim() !== '') {
      try {
        await Promise.race([
          fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Important for Google Apps Script redirects
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(studentData)
          }),
          new Promise((resolve) => setTimeout(resolve, 3500)) // 3.5s timeout fallback
        ]);
      } catch (err) {
        console.warn('Google Sheet submission warning:', err);
      }
    }

    // Save to LocalStorage so they never have to re-enter on this device
    try {
      localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(studentData));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    setIsSubmitting(false);
    onAccessGranted(studentData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-amber-300 shadow-md ring-4 ring-white/10 mb-3.5">
            <GraduationCap className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            সমাজকর্ম ৩য় বর্ষ ফাইনাল সাজেশন
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            জাতীয় বিশ্ববিদ্যালয় • শিক্ষাবর্ষ: ২০২২-২০২৩
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>১০০% ফ্রি স্টুডেন্ট অ্যাক্সেস পোর্টাল</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              পোর্টালে প্রবেশের জন্য তথ্য দিন
            </h3>
            <p className="text-xs text-slate-500">
              একবার এন্ট্রি করলেই সকল বিষয়ের মডেল উত্তর ও রুটিন দেখতে পাবেন
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার নাম <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সুশান্ত চন্দ্র দাস"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 text-sm pl-10 pr-3.5 py-2.5 rounded-xl outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                আপনার ইমেইল অ্যাড্রেস <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="যেমন: yourname@gmail.com"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 text-sm pl-10 pr-3.5 py-2.5 rounded-xl outline-none transition-colors"
                />
              </div>
            </div>

            {/* College Name (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                কলেজের নাম <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="যেমন: ঢাকা কলেজ / ভিক্টোরিয়া কলেজ"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 text-sm pl-10 pr-3.5 py-2.5 rounded-xl outline-none transition-colors"
                />
              </div>
            </div>

            {/* Student Declaration */}
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>আমি জাতীয় বিশ্ববিদ্যালয় অনার্স ৩য় বর্ষের একজন শিক্ষার্থী</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 hover:from-blue-800 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>প্রবেশ করা হচ্ছে...</span>
                </div>
              ) : (
                <>
                  <span>সাজেশন পোর্টালে প্রবেশ করুন</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>আপনার তথ্য সম্পূর্ণ নিরাপদ ও গোপন রাখা হবে</span>
          </div>
        </div>
      </div>
    </div>
  );
}
