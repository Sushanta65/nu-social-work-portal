import React from 'react';
import {
  GraduationCap,
  Search,
  Menu,
  FileDown,
  Sparkles,
  Printer,
  Calendar
} from 'lucide-react';
import { AUTHOR_CREDIT } from '../data/subjectsData';

export default function Navbar({
  studentUser,
  onLogout,
  selectedSubject,
  searchQuery,
  setSearchQuery,
  onOpenMobileDrawer,
  onOpenPdfModal,
  onOpenMethodologyModal,
  onOpenRoutineModal
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a] text-white shadow-md border-b border-slate-800">
      {/* Top Meta Strip */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Mobile Single Compact Strip */}
          <div className="flex sm:hidden items-center justify-between w-full text-slate-300">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
              <span className="truncate font-medium">
                {studentUser ? `স্বাগতম, ${studentUser.name}` : 'অনার্স ৩য় বর্ষ • সেশন: ২০২২-২৩'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenRoutineModal}
              className="text-amber-400 font-bold shrink-0 flex items-center gap-1 text-[11px] pl-2 cursor-pointer hover:underline"
            >
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>রুটিন দেখুন</span>
            </button>
          </div>

          {/* Desktop Full Strip */}
          <div className="hidden sm:flex items-center gap-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>জাতীয় বিশ্ববিদ্যালয় • অনার্স ৩য় বর্ষ পরীক্ষা • শিক্ষাবর্ষ: ২০২২-২০২৩ (সমাজকর্ম বিভাগ)</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-slate-400">
            {studentUser && (
              <div className="flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 px-2.5 py-0.5 rounded-md border border-emerald-500/30 font-medium">
                <span>👤 {studentUser.name}</span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="text-slate-400 hover:text-rose-400 ml-1 text-[10px] cursor-pointer"
                  title="লগআউট / নাম পরিবর্তন করুন"
                >
                  (লগআউট)
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onOpenRoutineModal}
              className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>পরীক্ষার রুটিন দেখুন</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={onOpenMethodologyModal}
              className="hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>সাজেশনের বৈশিষ্ট্য</span>
            </button>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-amber-400 font-semibold">
              প্রস্তুতকারক: {AUTHOR_CREDIT}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo & Subject Info */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={onOpenMobileDrawer}
                className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer shrink-0"
                aria-label="কোর্স তালিকা দেখুন"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white leading-tight truncate">
                  NU Social Work Portal
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-300 truncate font-medium">
                  {selectedSubject.code}: {selectedSubject.titleBn}
                </p>
              </div>
            </div>

            {/* Mobile Actions: Compact Routine & Print */}
            <div className="flex items-center gap-1.5 md:hidden shrink-0">
              <button
                type="button"
                onClick={onOpenRoutineModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 shadow-xs cursor-pointer"
                title="পরীক্ষার রুটিন দেখুন"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>রুটিন</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenPdfModal(selectedSubject)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Search Input & Desktop Action */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 md:max-w-xl justify-end">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm pl-9 pr-3 py-1.5 sm:py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:border-blue-400 transition-colors"
              />
            </div>

            {/* View Routine Button (Desktop) */}
            <button
              type="button"
              onClick={onOpenRoutineModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs shrink-0 cursor-pointer"
              title="পরীক্ষার রুটিন দেখুন"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>রুটিন দেখুন</span>
            </button>

            {/* Download Routine Button (Desktop) */}
            <a
              href="/social-work-3rd-year-exam-routine.jpg"
              download="Social_Work_3rd_Year_Final_Routine.jpg"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs shrink-0 cursor-pointer"
              title="চূড়ান্ত পরীক্ষার রুটিন ডাউনলোড করুন"
            >
              <FileDown className="w-4 h-4" />
              <span>ডাউনলোড</span>
            </a>

            <button
              type="button"
              onClick={() => onOpenPdfModal(selectedSubject)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PDF প্রিন্ট</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
