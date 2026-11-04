import React from 'react';
import { BookOpen, ChevronRight, Layers, X } from 'lucide-react';

export default function SubjectSelector({
  subjects,
  selectedSubjectId,
  onSelectSubject,
  mobileDrawerOpen,
  onCloseMobileDrawer
}) {
  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="bg-slate-900 px-4 py-3.5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                  অনার্স ৩য় বর্ষ কোর্স তালিকা
                </h2>
              </div>
              <span className="text-[11px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {subjects.length}টি কোর্স প্রস্তুত
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              সেশন: ২০২২-২০২৩ • প্রস্তুতকৃত চূড়ান্ত সাজেশন
            </p>
          </div>

          <div className="divide-y divide-slate-100 max-h-[calc(100vh-230px)] overflow-y-auto">
            {subjects.map((subj) => {
              const isSelected = subj.id === selectedSubjectId;
              const totalQ = subj.partA.length + subj.partB.length + subj.partC.length;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => onSelectSubject(subj.id)}
                  className={`w-full text-left px-3.5 py-3 transition-colors flex items-start gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-l-4 border-[#1e40af]'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div
                    className={`mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                      isSelected
                        ? 'bg-[#1e40af] text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {subj.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-tight line-clamp-2 ${
                        isSelected ? 'text-[#1e40af]' : 'text-slate-800'
                      }`}
                    >
                      {subj.titleBn}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {subj.titleEn}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="text-slate-500 font-medium">প্রশ্ন: {totalQ}টি</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-amber-800 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        {subj.examDate?.split(' ')[0] || ''}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200/80 text-[11px] text-slate-500 text-center">
            📌 বাকি ৬টি বিষয়ের সাজেশন তৈরি সম্পন্ন হলে স্বয়ংক্রিয়ভাবে এখানে যুক্ত করা হবে।
          </div>
        </div>
      </aside>

      {/* Mobile Slide-in Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex">
          <div className="bg-white w-5/6 max-w-sm h-full flex flex-col shadow-2xl">
            <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">কোর্স তালিকা (Course List)</h3>
              </div>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                aria-label="ড্রয়ার বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {subjects.map((subj) => {
                const isSelected = subj.id === selectedSubjectId;
                const totalQ = subj.partA.length + subj.partB.length + subj.partC.length;
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => {
                      onSelectSubject(subj.id);
                      onCloseMobileDrawer();
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50 text-[#1e40af] border border-blue-200'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        isSelected
                          ? 'bg-[#1e40af] text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {subj.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold leading-tight">
                        {subj.titleBn}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        প্রশ্ন: {totalQ}টি • <span className="text-amber-700 font-semibold">{subj.examDate || ''}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600">
              <p className="font-bold text-slate-800">জাতীয় বিশ্ববিদ্যালয় • সমাজকর্ম ৩য় বর্ষ</p>
              <p className="text-[11px] text-slate-500 mt-0.5">শিক্ষাবর্ষ: ২০২২-২০২৩</p>
            </div>
          </div>
          <div className="flex-1" onClick={onCloseMobileDrawer} />
        </div>
      )}
    </>
  );
}
