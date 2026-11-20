import React from 'react';
import {
  GraduationCap,
  Search,
  Menu,
  FileDown,
  Calendar,
  Sun,
  Moon,
  Share2
} from 'lucide-react';

export default function Navbar({
  selectedSubject,
  studentUser,
  searchQuery,
  setSearchQuery,
  onOpenMobileDrawer,
  onOpenPdfModal,
  onOpenRoutineModal,
  isDarkMode,
  onToggleDarkMode,
  onShare
}) {
  return (
    <header className="sticky top-0 z-30 bg-[#0f172a] text-white shadow-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Logo & Subject Info */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                type="button"
                onClick={onOpenMobileDrawer}
                className="lg:hidden p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer shrink-0"
                aria-label="কোর্স তালিকা দেখুন"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e40af] to-[#2563eb] flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight truncate">
                    NU Social Work Portal
                  </h1>
                  {studentUser?.name && (
                    <span
                      className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0 max-w-[140px] sm:max-w-[200px] truncate"
                      title={studentUser.name}
                    >
                      Hello, {studentUser.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 truncate font-medium">
                  {selectedSubject.code}: {selectedSubject.titleBn}
                </p>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center gap-1.5 md:hidden shrink-0">
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/90 border border-slate-700 transition-colors cursor-pointer"
                title={isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-300" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-300" />
                )}
              </button>

              <button
                type="button"
                onClick={onOpenRoutineModal}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>রুটিন</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenPdfModal(selectedSubject)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Search Input & Desktop Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 md:max-w-lg justify-end">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="প্রশ্ন বা বিষয় খুঁজুন..."
                className="w-full bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-hidden focus:border-blue-400 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={onToggleDarkMode}
              className="hidden md:inline-flex items-center justify-center p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0 cursor-pointer"
              title={isDarkMode ? 'লাইট মোড অন করুন' : 'ডার্ক মোড অন করুন'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            <button
              type="button"
              onClick={onShare}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer"
              title="শেয়ার করুন"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>শেয়ার</span>
            </button>

            <button
              type="button"
              onClick={onOpenRoutineModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shrink-0 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-300" />
              <span>রুটিন</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenPdfModal(selectedSubject)}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shrink-0 cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
