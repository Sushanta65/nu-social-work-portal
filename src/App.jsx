import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Filter,
  CheckCircle2,
  FileDown,
  Printer,
  X,
  Layers,
  Search,
  Sparkles,
  GraduationCap,
  Calendar,
  Clock,
  Download
} from 'lucide-react';
import SUBJECTS_DATA, { AUTHOR_CREDIT, PORTAL_META, EXAM_ROUTINE } from './data/subjectsData';
import Navbar from './components/Navbar';
import SubjectSelector from './components/SubjectSelector';
import QuestionCard from './components/QuestionCard';
import PdfExportButton, {
  buildPrintableHtmlDocument,
  printSubjectDocument,
  downloadPrintableHtml
} from './components/PdfExportButton';

export default function App() {
  const [selectedSubjectId, setSelectedSubjectId] = useState(SUBJECTS_DATA[0]?.id || '232109');
  const [activePart, setActivePart] = useState('ALL'); // 'ALL', 'A', 'B', 'C'
  const [importanceFilter, setImportanceFilter] = useState('ALL'); // 'ALL', '99%', '90%'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({ '232109-a1': true });
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [readQuestionIds, setReadQuestionIds] = useState([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [pdfModalSubject, setPdfModalSubject] = useState(null);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [routineViewTab, setRoutineViewTab] = useState('card'); // 'card' | 'image'

  const selectedSubject = useMemo(
    () => SUBJECTS_DATA.find((s) => s.id === selectedSubjectId) || SUBJECTS_DATA[0],
    [selectedSubjectId]
  );

  const filterQuestionList = (list, partCode) => {
    return list
      .filter((item) => {
        if (importanceFilter !== 'ALL' && item.importance !== importanceFilter) {
          return false;
        }
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const inQuestion = (item.question || '').toLowerCase().includes(q);
        const inYears = (item.years || '').toLowerCase().includes(q);
        let inAnswer = false;
        if (typeof item.answer === 'string') {
          inAnswer = item.answer.toLowerCase().includes(q);
        } else if (item.answer) {
          inAnswer = JSON.stringify(item.answer).toLowerCase().includes(q);
        }
        return inQuestion || inYears || inAnswer;
      })
      .map((item) => ({ ...item, partType: partCode }));
  };

  const filteredPartA = useMemo(
    () => filterQuestionList(selectedSubject.partA, 'A'),
    [selectedSubject, importanceFilter, searchQuery]
  );
  const filteredPartB = useMemo(
    () => filterQuestionList(selectedSubject.partB, 'B'),
    [selectedSubject, importanceFilter, searchQuery]
  );
  const filteredPartC = useMemo(
    () => filterQuestionList(selectedSubject.partC, 'C'),
    [selectedSubject, importanceFilter, searchQuery]
  );

  const handleToggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAllVisible = (expand) => {
    const next = { ...expandedIds };
    [...filteredPartA, ...filteredPartB, ...filteredPartC].forEach((item) => {
      next[item.id] = expand;
    });
    setExpandedIds(next);
  };

  const handleToggleBookmark = (id) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleRead = (id) => {
    setReadQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased"
      style={{ fontFamily: "'Kalpurush', 'Hind Siliguri', 'Noto Serif Bengali', sans-serif" }}
    >
      {/* Top Navbar */}
      <Navbar
        selectedSubject={selectedSubject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onOpenPdfModal={(subj) => setPdfModalSubject(subj)}
        onOpenMethodologyModal={() => setMethodologyModalOpen(true)}
        onOpenRoutineModal={() => setRoutineModalOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Course Index Sidebar (Desktop) */}
        <SubjectSelector
          subjects={SUBJECTS_DATA}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={(id) => {
            setSelectedSubjectId(id);
            setSearchQuery('');
          }}
          mobileDrawerOpen={mobileDrawerOpen}
          onCloseMobileDrawer={() => setMobileDrawerOpen(false)}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 min-w-0 space-y-6 pb-16 lg:pb-8">
          {/* Quick Subject Switcher for Mobile & Tablet */}
          <div className="lg:hidden bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-1.5">
            {SUBJECTS_DATA.map((subj) => {
              const active = subj.id === selectedSubjectId;
              const shortName = subj.code === '232109' ? 'প্রকল্প পরিকল্পনা' : 'জনসংখ্যা ইস্যু';
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-mono">{subj.code}</span>
                  <span className="truncate font-medium text-[11px] opacity-90 max-w-[130px]">
                    ({shortName})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clean Course Hero Card */}
          <section className="rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#1e40af] text-white">
                    কোর্স কোড: {selectedSubject.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    শিক্ষাবর্ষ: ২০২২-২০২৩
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200">
                    পূর্ণমান: ৮০ (তত্ত্বীয়/লিখিত) + ২০ (ইনকোর্স) • ক্রেডিট: ৪
                  </span>
                  {selectedSubject.examOrder && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedSubject.examOrder}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {selectedSubject.titleBn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {selectedSubject.titleEn}
                </p>

                {/* Exam Schedule Bar */}
                {selectedSubject.examDate && (
                  <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <Calendar className="w-4 h-4 text-amber-700" />
                      <span>পরীক্ষার তারিখ: {selectedSubject.examDate}</span>
                    </div>
                    <span className="text-amber-300 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 text-slate-700 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>সময়: {selectedSubject.examTime || 'দুপুর ১:০০ টা'}</span>
                    </div>
                    {selectedSubject.examGap && (
                      <>
                        <span className="text-amber-300 hidden sm:inline">•</span>
                        <span className="text-indigo-800 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-md">
                          প্রস্তুতি ছুটি: {selectedSubject.examGap}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                  <strong>সিলেবাস বিভাজন:</strong> {selectedSubject.syllabusSplit}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRoutineModalOpen(true)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>রুটিন দেখুন</span>
                  </button>

                  <a
                    href="/social-work-3rd-year-exam-routine.jpg"
                    download="Social_Work_3rd_Year_Final_Routine.jpg"
                    className="px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="রুটিনের ছবি ডাউনলোড করুন"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setPdfModalSubject(selectedSubject)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>সাজেশন PDF প্রিন্ট / সেভ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethodologyModalOpen(true)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>সাজেশনের বৈশিষ্ট্য ও টিপস</span>
                </button>
              </div>
            </div>
          </section>

          {/* Filter Bar: Section Tabs (ক/খ/গ) + Importance Filter */}
          <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Segmented Section Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    id: 'ALL',
                    label: 'সকল বিভাগ',
                    count: filteredPartA.length + filteredPartB.length + filteredPartC.length
                  },
                  {
                    id: 'A',
                    label: 'ক-বিভাগ (১ নম্বর)',
                    count: filteredPartA.length
                  },
                  {
                    id: 'B',
                    label: 'খ-বিভাগ (৪ নম্বর)',
                    count: filteredPartB.length
                  },
                  {
                    id: 'C',
                    label: 'গ-বিভাগ (১০ নম্বর)',
                    count: filteredPartC.length
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePart(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePart === tab.id
                        ? 'bg-[#1e40af] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                        activePart === tab.id
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Expand / Collapse All */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExpandAllVisible(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1e40af] hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  সব উত্তর খুলুন
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => handleExpandAllVisible(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  সব সংকুচিত করুন
                </button>
              </div>
            </div>

            {/* Importance Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> গুরুত্ব:
                </span>
                {[
                  { id: 'ALL', label: 'সবগুলো' },
                  { id: '99%', label: '★★★ ৯৯% নিশ্চিত' },
                  { id: '90%', label: '★★ ৯০% গুরুত্বপূর্ণ' }
                ].map((imp) => (
                  <button
                    key={imp.id}
                    type="button"
                    onClick={() => setImportanceFilter(imp.id)}
                    className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                      importanceFilter === imp.id
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {imp.label}
                  </button>
                ))}
              </div>
              <span className="text-slate-500 font-medium">
                প্রদর্শিত প্রশ্ন: {filteredPartA.length + filteredPartB.length + filteredPartC.length}টি
              </span>
            </div>
          </section>

          {/* SECTION A: ক-বিভাগ */}
          {(activePart === 'ALL' || activePart === 'A') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    ক-বিভাগ: অতি সংক্ষিপ্ত প্রশ্নোত্তর (মান: ১ × ১০ = ১০)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    মনীষীদের নাম, গ্রন্থ, সাল ও সহজ মৌলিক সংজ্ঞা (১২টির মধ্যে ১০টির উত্তর দিতে হবে)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-amber-300">
                  {filteredPartA.length}টি প্রশ্ন
                </span>
              </div>

              {filteredPartA.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-slate-500 border border-slate-200">
                  ক-বিভাগে কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPartA.map((item, idx) => (
                    <QuestionCard
                      key={item.id}
                      item={item}
                      index={idx}
                      partType="A"
                      isExpanded={!!expandedIds[item.id]}
                      onToggleExpand={() => handleToggleExpand(item.id)}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isRead={readQuestionIds.includes(item.id)}
                      onToggleRead={handleToggleRead}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION B: খ-বিভাগ */}
          {(activePart === 'ALL' || activePart === 'B') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between bg-[#1e40af] text-white px-4 py-2.5 rounded-xl shadow-xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    খ-বিভাগ: সংক্ষিপ্ত প্রশ্নাবলি (মান: ৪ × ৫ = ২০)
                  </h3>
                  <p className="text-[11px] text-blue-100">
                    সংক্ষিপ্ত ধারণা, সংজ্ঞা ও পয়েন্টভিত্তিক সহজ উত্তর (৮টির মধ্যে ৫টির উত্তর দিতে হবে)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-white">
                  {filteredPartB.length}টি প্রশ্ন
                </span>
              </div>

              {filteredPartB.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-slate-500 border border-slate-200">
                  খ-বিভাগে কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPartB.map((item, idx) => (
                    <QuestionCard
                      key={item.id}
                      item={item}
                      index={idx}
                      partType="B"
                      isExpanded={!!expandedIds[item.id]}
                      onToggleExpand={() => handleToggleExpand(item.id)}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isRead={readQuestionIds.includes(item.id)}
                      onToggleRead={handleToggleRead}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* SECTION C: গ-বিভাগ */}
          {(activePart === 'ALL' || activePart === 'C') && (
            <section className="space-y-3">
              <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold">
                    গ-বিভাগ: রচনামূলক প্রশ্নাবলি (মান: ১০ × ৫ = ৫০)
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    ফার্স্ট-ক্লাস নম্বর পাওয়ার ৫-ধাপ সংবলিত মডেল উত্তর (৮টির মধ্যে ৫টির উত্তর দিতে হবে)
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                  {filteredPartC.length}টি প্রশ্ন
                </span>
              </div>

              {filteredPartC.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center text-slate-500 border border-slate-200">
                  গ-বিভাগে কোনো প্রশ্ন পাওয়া যায়নি।
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPartC.map((item, idx) => (
                    <QuestionCard
                      key={item.id}
                      item={item}
                      index={idx}
                      partType="C"
                      isExpanded={!!expandedIds[item.id]}
                      onToggleExpand={() => handleToggleExpand(item.id)}
                      isBookmarked={bookmarkedIds.includes(item.id)}
                      onToggleBookmark={handleToggleBookmark}
                      isRead={readQuestionIds.includes(item.id)}
                      onToggleRead={handleToggleRead}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* PDF Preview & Print Modal */}
      {pdfModalSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-amber-400" />
                  <span>
                    সাজেশন PDF প্রিভিউ — {pdfModalSubject.code}: {pdfModalSubject.titleBn}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  নিয়ম: ক-বিভাগ (উত্তরসহ) • খ ও গ-বিভাগ (শুধুমাত্র প্রশ্ন তালিকা)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printSubjectDocument(pdfModalSubject)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট / PDF সংরক্ষণ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadPrintableHtml(pdfModalSubject)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>HTML ডাউনলোড</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfModalSubject(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  aria-label="মোডাল বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Clean Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80 space-y-4">
              <div className="bg-white max-w-3xl mx-auto p-6 sm:p-8 rounded-xl shadow-xs border border-slate-300 space-y-6">
                {/* Header */}
                <div className="border-b-2 border-[#1e40af] pb-3 text-center">
                  <h2 className="text-base sm:text-lg font-bold text-[#1e40af]">
                    জাতীয় বিশ্ববিদ্যালয় (National University, Bangladesh)
                  </h2>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                    বি.এস.এস. (অনার্স) ৩য় বর্ষ চূড়ান্ত পরীক্ষা ২০২৫ (সমাজকর্ম বিভাগ)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    কোর্স: {pdfModalSubject.code}: {pdfModalSubject.titleBn} ({pdfModalSubject.titleEn})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    পূর্ণমান: ৮০ (তত্ত্বীয়/লিখিত) + ২০ (ইনকোর্স) • ক্রেডিট: ৪ • শিক্ষাবর্ষ: ২০২২-২০২৩
                  </p>
                </div>

                {/* Part A Preview */}
                <div className="space-y-3">
                  <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center">
                    <span>ক-বিভাগ: অতি সংক্ষিপ্ত প্রশ্নোত্তর (মান: ১ × ১০ = ১০) [উত্তরসহ]</span>
                    <span className="text-amber-300 text-[11px]">{pdfModalSubject.partA.length}টি প্রশ্ন</span>
                  </div>
                  <div className="space-y-2">
                    {pdfModalSubject.partA.map((q, idx) => (
                      <div key={q.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                        <div className="flex justify-between items-start gap-2 font-bold text-slate-900">
                          <span>{idx + 1}. {q.question}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 shrink-0">
                            {q.badge}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 pl-1">
                          <strong>উত্তর:</strong> {typeof q.answer === 'string' ? q.answer : q.answer?.intro || JSON.stringify(q.answer)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part B Preview */}
                <div className="space-y-3">
                  <div className="bg-[#1e40af] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center">
                    <span>খ-বিভাগ: সংক্ষিপ্ত প্রশ্ন তালিকা (মান: ৪ × ৫ = ২০) [শুধুমাত্র প্রশ্ন তালিকা]</span>
                    <span className="text-blue-200 text-[11px]">{pdfModalSubject.partB.length}টি প্রশ্ন</span>
                  </div>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {pdfModalSubject.partB.map((q, idx) => (
                      <div key={q.id} className="p-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800">
                          {idx + 1}. {q.question} {q.years && <span className="text-slate-400 font-normal">[{q.years}]</span>}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                          {q.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part C Preview */}
                <div className="space-y-3">
                  <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center">
                    <span>গ-বিভাগ: রচনামূলক প্রশ্ন তালিকা (মান: ১০ × ৫ = ৫০) [শুধুমাত্র প্রশ্ন তালিকা]</span>
                    <span className="text-amber-300 text-[11px]">{pdfModalSubject.partC.length}টি প্রশ্ন</span>
                  </div>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {pdfModalSubject.partC.map((q, idx) => (
                      <div key={q.id} className="p-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {q.question} {q.years && <span className="text-slate-400 font-normal">[{q.years}]</span>}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                          {q.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Attribution */}
                <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-xs text-slate-600 font-semibold">
                  <span>জাতীয় বিশ্ববিদ্যালয় — অনার্স ৩য় বর্ষ পরীক্ষা ২০২৫ • কোর্স: {pdfModalSubject.code}</span>
                  <span className="text-[#1e40af] font-bold">Suggestion created by {AUTHOR_CREDIT}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodology Modal */}
      {methodologyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  সাজেশন ও পরীক্ষার গাইডলাইন (Exam 2025)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMethodologyModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <strong>১. জাতীয় বিশ্ববিদ্যালয় অনার্স ৩য় বর্ষ পরীক্ষা:</strong> এই সাজেশনটি ২০২২-২০২৩ শিক্ষাবর্ষের নিয়মিত শিক্ষার্থীদের অনার্স ৩য় বর্ষ চূড়ান্ত পরীক্ষার জন্য বিগত ৭ বছরের প্রশ্নপত্র বিশ্লেষণ করে তৈরি।
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <strong>২. ৯৯% কমন ভিত্তি:</strong> জাতীয় বিশ্ববিদ্যালয়ে ৭০-৮৫% প্রশ্ন বিগত বছরের বোর্ড প্রশ্ন থেকে সরাসরি আসে। সেই প্রশ্নগুলোকে <strong>★★★ ৯৯% নিশ্চিত</strong> হিসেবে চিহ্নিত করা হয়েছে।
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <strong>৩. সহজ ও নির্ভুল উত্তর:</strong> উত্তরগুলো জটিল পারিভাষিক শব্দের বদলে সহজ, প্রাঞ্জল ও পরীক্ষায় সরাসরি লেখার উপযোগী পয়েন্ট আকারে সাজানো হয়েছে।
              </div>
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                <strong>৪. সম্পূর্ণ PDF প্রিন্ট সুবিধা:</strong> প্রিন্ট বোতামে চাপ দিলে কোনো অংশ না কেটে পুরো ডকুমেন্টটি এ৪ আকারে স্বয়ংক্রিয়ভাবে প্রিন্ট বা সেভ হবে।
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMethodologyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1e40af] text-white text-xs sm:text-sm font-bold cursor-pointer"
              >
                ঠিক আছে (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Routine Modal */}
      {routineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <span>সমাজকর্ম ৩য় বর্ষ চূড়ান্ত পরীক্ষার রুটিন</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      সেশন: ২০২২-২০২৩
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    পরীক্ষা আরম্ভ: দুপুর ১:০০ টা • পূর্ণমান: ৮০ (লিখিত) + ২০ (ইনকোর্স)
                  </p>
                </div>
              </div>

              {/* View Switcher Tabs & Actions */}
              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRoutineViewTab('card')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      routineViewTab === 'card'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🎨 ডিজাইন রুটিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutineViewTab('image')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      routineViewTab === 'image'
                        ? 'bg-blue-600 text-white shadow-xs font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    🖼️ মূল ছবি
                  </button>
                </div>

                <a
                  href="/social-work-3rd-year-exam-routine.jpg"
                  download="Social_Work_3rd_Year_Final_Routine.jpg"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  title="রুটিনের মূল ছবি ডাউনলোড করুন"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">ডাউনলোড</span>
                </a>

                <button
                  type="button"
                  onClick={() => setRoutineModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  aria-label="মোডাল বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#f4f7f4]">
              {routineViewTab === 'card' ? (
                /* Beautifully Designed Routine Poster Card */
                <div className="max-w-3xl mx-auto bg-[#fafbfa] rounded-2xl border-2 border-[#3d5a45]/20 shadow-md p-4 sm:p-7 space-y-5">
                  {/* Routine Card Header */}
                  <div className="text-center space-y-2 border-b-2 border-[#3d5a45]/20 pb-4">
                    <div className="inline-flex items-center justify-center gap-2 text-[#2e4736]">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f3326] tracking-tight">
                      Social Work - 3rd Year Final Routine
                    </h2>
                    <p className="text-sm sm:text-base font-bold text-[#2e4736]">
                      জাতীয় বিশ্ববিদ্যালয় • সমাজকর্ম বিভাগ ৩য় বর্ষ চূড়ান্ত পরীক্ষা
                    </p>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                      <span className="px-3.5 py-1 rounded-full font-bold bg-[#3d5a45] text-white shadow-2xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Exam Starts at 1:00 PM (দুপুর ১:০০ টা)</span>
                      </span>
                      <span className="px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        শিক্ষাবর্ষ: ২০২২-২০২৩
                      </span>
                      <span className="px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-950 border border-amber-300">
                        পূর্ণমান: ৮০ (তত্ত্বীয়/লিখিত) + ২০ (ইনকোর্স)
                      </span>
                    </div>
                  </div>

                  {/* Routine Subject Timeline List */}
                  <div className="space-y-2.5">
                    {EXAM_ROUTINE.map((item, idx) => (
                      <React.Fragment key={item.code}>
                        {/* Gap Pill between subjects */}
                        {item.gap && item.gap !== '-' && (
                          <div className="flex justify-center my-1">
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-2xs">
                              <span>⏳ Gap: {item.gap}</span>
                            </span>
                          </div>
                        )}

                        {/* Subject Exam Card */}
                        <div
                          className={`rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
                            item.status === 'ready'
                              ? 'bg-white border-[#2e4736] ring-2 ring-[#2e4736]/10'
                              : 'bg-white/90 border-[#3d5a45]/20 hover:border-[#3d5a45]/40'
                          }`}
                        >
                          {/* Date and Day Badge */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-[#345244] text-white px-3.5 py-2.5 rounded-xl text-center min-w-[130px] shadow-2xs">
                              <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                                <span>{item.date}</span>
                              </div>
                              <div className="text-[11px] text-emerald-100 font-semibold mt-0.5">
                                ({item.day})
                              </div>
                            </div>

                            {/* Subject Code */}
                            <div className="bg-[#eaf0eb] border border-[#3d5a45]/30 text-[#1f3326] px-3 py-2 rounded-xl text-center shrink-0">
                              <span className="block text-[10px] text-slate-500 font-medium uppercase">
                                কোড
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold font-mono">
                                {item.code}
                              </span>
                            </div>
                          </div>

                          {/* Subject Titles */}
                          <div className="flex-1 min-w-0 md:pl-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {item.nameEn}
                            </h4>
                            <p className="text-xs sm:text-sm font-medium text-slate-700 mt-0.5">
                              {item.nameBn}
                            </p>
                          </div>

                          {/* Action Button: Jump to Suggestion or Pending */}
                          <div className="shrink-0 flex items-center justify-end">
                            {item.status === 'ready' ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedSubjectId(item.code);
                                  setRoutineModalOpen(false);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#2e4736] to-[#3d5a45] hover:from-[#24392b] hover:to-[#2e4736] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02] cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                                <span>সাজেশন পড়ুন ➔</span>
                              </button>
                            ) : (
                              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                সাজেশন প্রক্রিয়াধীন
                              </span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Routine Card Footer */}
                  <div className="text-center pt-3 border-t-2 border-[#3d5a45]/20 text-[#2e4736] font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                    <span>🌿 STUDY</span>
                    <span>•</span>
                    <span>PREPARE</span>
                    <span>•</span>
                    <span>SUCCEED 🌿</span>
                  </div>
                </div>
              ) : (
                /* Original Image View */
                <div className="max-w-2xl mx-auto bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-md flex flex-col items-center space-y-3">
                  <div className="w-full flex items-center justify-between text-xs text-slate-600 pb-2 border-b">
                    <span className="font-semibold">অরিজিনাল রুটিনের অফিশিয়াল ছবি:</span>
                    <a
                      href="/social-work-3rd-year-exam-routine.jpg"
                      download="Social_Work_3rd_Year_Final_Routine.jpg"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>হাই-কোয়ালিটি ছবি ডাউনলোড করুন</span>
                    </a>
                  </div>
                  <img
                    src="/social-work-3rd-year-exam-routine.jpg"
                    alt="Social Work 3rd Year Final Routine"
                    className="max-h-[68vh] w-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="p-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                জাতীয় বিশ্ববিদ্যালয় • বি.এস.এস. (অনার্স) ৩য় বর্ষ পরীক্ষা • শিক্ষাবর্ষ: ২০২২-২০২৩
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/social-work-3rd-year-exam-routine.jpg"
                  download="Social_Work_3rd_Year_Final_Routine.jpg"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>রুটিন ইমেজ সেভ করুন</span>
                </a>
                <button
                  type="button"
                  onClick={() => setRoutineModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academic Footer */}
      <footer className="bg-slate-900 text-slate-300 py-6 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>
              <strong>জাতীয় বিশ্ববিদ্যালয় • বি.এস.এস. (অনার্স) ৩য় বর্ষ চূড়ান্ত পরীক্ষা ২০২৫</strong> (সমাজকর্ম বিভাগ)
            </span>
          </div>
          <div className="text-slate-400">
            সাজেশন ও বিষয়বস্তু প্রস্তুতকারক:{' '}
            <span className="text-amber-400 font-bold">{AUTHOR_CREDIT}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
