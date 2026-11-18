import React from 'react';
import { Layers, X } from 'lucide-react';

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
        <div className="sticky top-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="bg-slate-900 dark:bg-slate-950 px-4 py-3.5 text-white border-b border-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="font-bold text-sm tracking-wide text-slate-100">
              অনার্স ৩য় বর্ষ কোর্স তালিকা
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[calc(100vh-150px)] overflow-y-auto">
            {subjects.map((subj) => {
              const isSelected = subj.id === selectedSubjectId;
              const totalQ = subj.partA.length + subj.partB.length + subj.partC.length;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => onSelectSubject(subj.id)}
                  className={`w-full text-left px-4 py-3.5 transition-colors flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-[#1e40af] dark:border-blue-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-l-4 border-transparent'
                  }`}
                >
                  <div
                    className={`mt-0.5 px-2 py-0.5 rounded-md text-xs font-bold font-mono shrink-0 ${
                      isSelected
                        ? 'bg-[#1e40af] text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {subj.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold leading-snug ${
                        isSelected
                          ? 'text-[#1e40af] dark:text-blue-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {subj.titleBn}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>প্রশ্ন: {totalQ}টি</span>
                      {subj.examDate && (
                        <>
                          <span>•</span>
                          <span className="text-amber-800 dark:text-amber-300 font-semibold">
                            {subj.examDate.split(' ')[0]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Mobile Slide-in Drawer */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-2xs flex">
          <div className="bg-white dark:bg-slate-900 w-5/6 max-w-sm h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800">
            <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">অনার্স ৩য় বর্ষ কোর্স তালিকা</h3>
              </div>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                aria-label="ড্রয়ার বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
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
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-[#1e40af] dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        isSelected
                          ? 'bg-[#1e40af] text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {subj.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug">{subj.titleBn}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        প্রশ্ন: {totalQ}টি •{' '}
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          {subj.examDate?.split(' ')[0] || ''}
                        </span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex-1" onClick={onCloseMobileDrawer} />
        </div>
      )}
    </>
  );
}
