import React, { useState, useMemo, useEffect } from 'react';
import {
  Filter,
  CheckCircle2,
  FileDown,
  Printer,
  X,
  GraduationCap,
  Calendar,
  Clock,
  Hourglass,
  Bookmark,
  BookOpen
} from 'lucide-react';
import SUBJECTS_DATA, { AUTHOR_CREDIT, EXAM_ROUTINE } from './data/subjectsData';
import Navbar from './components/Navbar';
import SubjectSelector from './components/SubjectSelector';
import QuestionCard from './components/QuestionCard';
import StudentAccessGate from './components/StudentAccessGate';
import { STUDENT_STORAGE_KEY } from './config';
import {
  printSubjectDocument,
  downloadPrintableHtml
} from './components/PdfExportButton';

export default function App() {
  const [studentUser, setStudentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STUDENT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('nu_theme') === 'dark';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('nu_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('nu_theme', 'light');
      }
    } catch (e) {}
  }, [isDarkMode]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(SUBJECTS_DATA[0]?.id || '232101');
  const [activePart, setActivePart] = useState('ALL'); // 'ALL', 'A', 'B', 'C', 'BOOKMARKED'
  const [importanceFilter, setImportanceFilter] = useState('ALL'); // 'ALL', '99%', '90%'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nu_bookmarked_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [readQuestionIds, setReadQuestionIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nu_read_question_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [pdfModalSubject, setPdfModalSubject] = useState(null);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [routineViewTab, setRoutineViewTab] = useState('card');

  const selectedSubject = useMemo(
    () => SUBJECTS_DATA.find((s) => s.id === selectedSubjectId) || SUBJECTS_DATA[0],
    [selectedSubjectId]
  );

  // Live Exam Countdown Timer
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 });
  useEffect(() => {
    const updateCountdown = () => {
      if (!selectedSubject?.examIsoDate) return;
      const targetTime = new Date(selectedSubject.examIsoDate).getTime();
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown({ days, hours, minutes });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [selectedSubject]);

  // Subject Questions for Progress Tracker
  const allSubjectQuestions = useMemo(
    () => [...selectedSubject.partA, ...selectedSubject.partB, ...selectedSubject.partC],
    [selectedSubject]
  );

  const subjectReadCount = useMemo(
    () => allSubjectQuestions.filter((q) => readQuestionIds.includes(q.id)).length,
    [allSubjectQuestions, readQuestionIds]
  );

  const subjectBookmarkedCount = useMemo(
    () => allSubjectQuestions.filter((q) => bookmarkedIds.includes(q.id)).length,
    [allSubjectQuestions, bookmarkedIds]
  );

  const progressPercentage = Math.round(
    (subjectReadCount / (allSubjectQuestions.length || 1)) * 100
  );

  const handleShare = async () => {
    const shareUrl = 'https://nu-social-work-portal.vercel.app/';
    const shareTitle = `জাতীয় বিশ্ববিদ্যালয় সমাজকর্ম ৩য় বর্ষ ফাইনাল সাজেশন (${selectedSubject.titleBn})`;
    const shareText = `জাতীয় বিশ্ববিদ্যালয় অনার্স ৩য় বর্ষ সমাজকর্ম ফাইনাল সাজেশন ও উদাহরণসহ সহজ উত্তর পেয়ে গেছি এখানে:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch (err) {}
    }

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      }
    } catch (e) {}

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
    window.open(waUrl, '_blank');
  };

  const filterQuestionList = (list, partCode) => {
    return list
      .filter((item) => {
        if (activePart === 'BOOKMARKED' && !bookmarkedIds.includes(item.id)) {
          return false;
        }
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
    [selectedSubject, importanceFilter, searchQuery, activePart, bookmarkedIds]
  );
  const filteredPartB = useMemo(
    () => filterQuestionList(selectedSubject.partB, 'B'),
    [selectedSubject, importanceFilter, searchQuery, activePart, bookmarkedIds]
  );
  const filteredPartC = useMemo(
    () => filterQuestionList(selectedSubject.partC, 'C'),
    [selectedSubject, importanceFilter, searchQuery, activePart, bookmarkedIds]
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
    setBookmarkedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('nu_bookmarked_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  const handleToggleRead = (id) => {
    setReadQuestionIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem('nu_read_question_ids', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div
      className={`min-h-screen flex flex-col antialiased transition-colors duration-200 ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'
      }`}
      style={{ fontFamily: "'Kalpurush', 'Hind Siliguri', 'Noto Serif Bengali', sans-serif" }}
    >
      {/* Top Navbar */}
      <Navbar
        selectedSubject={selectedSubject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onOpenPdfModal={(subj) => setPdfModalSubject(subj)}
        onOpenRoutineModal={() => setRoutineModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onShare={handleShare}
      />

      {/* Student Access Gate Modal */}
      {!studentUser && (
        <StudentAccessGate onAccessGranted={(user) => setStudentUser(user)} />
      )}

      {/* Main Content Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 py-5 flex-1 flex flex-col lg:flex-row gap-6">
        {/* Course Index Sidebar */}
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
        <main className="flex-1 min-w-0 space-y-4 pb-16 lg:pb-8">
          {/* Student Greeting Bar */}
          {studentUser?.name && (
            <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-white via-blue-50/40 to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 border border-slate-200/90 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#1e40af] to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-xs ring-2 ring-blue-100 dark:ring-blue-900/50 shrink-0 uppercase">
                  {studentUser.name.trim().charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-snug truncate">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Hello, </span>
                    <span className="text-[#1e40af] dark:text-blue-400">{studentUser.name}</span>
                  </p>
                  {studentUser.college && studentUser.college !== 'উল্লেখ নেই' && (
                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                      {studentUser.college}
                    </p>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>শুভ প্রস্তুতি</span>
              </span>
            </div>
          )}

          {/* Quick Subject Switcher for Mobile & Tablet */}
          <div className="lg:hidden bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {SUBJECTS_DATA.map((subj) => {
              const active = subj.id === selectedSubjectId;
              const shortNames = {
                '232101': 'সমাজকর্ম পদ্ধতি',
                '232103': 'সমাজকর্ম তত্ত্ব',
                '232105': 'স্বেচ্ছাসেবিতা ও এনজিও',
                '232107': 'দরিদ্র সেবা',
                '232109': 'প্রকল্প পরিকল্পনা',
                '232111': 'জনসংখ্যা ইস্যু'
              };
              const shortName = shortNames[subj.code] || subj.titleBn;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-[#1e40af] text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <span className="font-mono">{subj.code}</span>
                  <span className="truncate font-medium text-[11px] opacity-90">
                    ({shortName})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimal & Clean Course Header Card */}
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-md font-bold bg-[#1e40af] text-white">
                    কোর্স কোড: {selectedSubject.code}
                  </span>
                  {selectedSubject.examDate && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>পরীক্ষা: {selectedSubject.examDate}</span>
                    </span>
                  )}
                  {countdown && countdown.days >= 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">
                      <Hourglass className="w-3 h-3 text-rose-600 animate-pulse" />
                      <span>
                        বাকি: {countdown.days} দিন {countdown.hours} ঘণ্টা
                      </span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedSubject.titleBn}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {selectedSubject.titleEn}
                </p>
              </div>

              {/* Clean PDF Download Button */}
              {selectedSubject.pdfUrl && (
                <a
                  href={selectedSubject.pdfUrl}
                  download
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>চূড়ান্ত সাজেশন PDF ডাউনলোড</span>
                </a>
              )}
            </div>
          </section>

          {/* Compact Study Progress Bar */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl px-4 py-3 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  আপনার পড়ার অগ্রগতি:{' '}
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {subjectReadCount}/{allSubjectQuestions.length}টি প্রশ্ন ({progressPercentage}%)
                  </span>
                </span>
              </div>
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercentage, 2)}%` }}
              />
            </div>
          </section>

          {/* Clean Section Tabs & Filter Bar */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Clean Section Tabs (without confusing mark numbers in parentheses) */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  {
                    id: 'ALL',
                    label: 'সকল বিভাগ',
                    count: filteredPartA.length + filteredPartB.length + filteredPartC.length
                  },
                  {
                    id: 'A',
                    label: 'ক-বিভাগ',
                    count: filteredPartA.length
                  },
                  {
                    id: 'B',
                    label: 'খ-বিভাগ',
                    count: filteredPartB.length
                  },
                  {
                    id: 'C',
                    label: 'গ-বিভাগ',
                    count: filteredPartC.length
                  },
                  {
                    id: 'BOOKMARKED',
                    label: '⭐ সংরক্ষিত',
                    count: subjectBookmarkedCount
                  }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActivePart(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activePart === tab.id
                        ? 'bg-[#1e40af] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[11px] ${
                        activePart === tab.id
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
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
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                >
                  সব উত্তর খুলুন
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button
                  type="button"
                  onClick={() => handleExpandAllVisible(false)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  সব বন্ধ করুন
                </button>
              </div>
            </div>

            {/* Importance Filter */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mr-1">
                  <Filter className="w-3.5 h-3.5" /> ফিল্টার:
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
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {imp.label}
                  </button>
                ))}
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                প্রদর্শিত প্রশ্ন: {filteredPartA.length + filteredPartB.length + filteredPartC.length}টি
              </span>
            </div>
          </section>

          {/* Bookmarked Empty State */}
          {activePart === 'BOOKMARKED' &&
            filteredPartA.length + filteredPartB.length + filteredPartC.length === 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                  <Bookmark className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  কোনো প্রশ্ন সংরক্ষিত করা নেই
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  যেকোনো প্রশ্নের পাশে বুকমার্ক আইকনে ক্লিক করে সংরক্ষণ করুন।
                </p>
              </div>
            )}

          {/* SECTION A: ক-বিভাগ */}
          {(activePart === 'ALL' || activePart === 'A' || activePart === 'BOOKMARKED') &&
            (activePart !== 'BOOKMARKED' || filteredPartA.length > 0) && (
              <section className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs">
                  <h3 className="text-sm sm:text-base font-bold">
                    ক-বিভাগ: অতি সংক্ষিপ্ত প্রশ্নাবলি
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-amber-300">
                    {filteredPartA.length}টি প্রশ্ন
                  </span>
                </div>

                {filteredPartA.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
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
          {(activePart === 'ALL' || activePart === 'B' || activePart === 'BOOKMARKED') &&
            (activePart !== 'BOOKMARKED' || filteredPartB.length > 0) && (
              <section className="space-y-3">
                <div className="flex items-center justify-between bg-[#1e40af] text-white px-4 py-2.5 rounded-xl shadow-xs">
                  <h3 className="text-sm sm:text-base font-bold">
                    খ-বিভাগ: সংক্ষিপ্ত প্রশ্নাবলি
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900 text-white">
                    {filteredPartB.length}টি প্রশ্ন
                  </span>
                </div>

                {filteredPartB.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
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
          {(activePart === 'ALL' || activePart === 'C' || activePart === 'BOOKMARKED') &&
            (activePart !== 'BOOKMARKED' || filteredPartC.length > 0) && (
              <section className="space-y-3">
                <div className="flex items-center justify-between bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xs">
                  <h3 className="text-sm sm:text-base font-bold">
                    গ-বিভাগ: রচনামূলক প্রশ্নাবলি
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                    {filteredPartC.length}টি প্রশ্ন
                  </span>
                </div>

                {filteredPartC.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                    গ-বিভাগে কোনো প্রশ্ন পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="space-y-3">
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

      {/* PDF Preview & Download Modal */}
      {pdfModalSubject && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                  <FileDown className="w-5 h-5 text-amber-400" />
                  <span>
                    সাজেশন PDF — {pdfModalSubject.code}: {pdfModalSubject.titleBn}
                  </span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {pdfModalSubject.pdfUrl && (
                  <a
                    href={pdfModalSubject.pdfUrl}
                    download
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>অফিশিয়াল v2 PDF ডাউনলোড</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => printSubjectDocument(pdfModalSubject)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadPrintableHtml(pdfModalSubject)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>HTML</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPdfModalSubject(null)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80 space-y-4">
              <div className="bg-white max-w-3xl mx-auto p-6 sm:p-8 rounded-xl shadow-xs border border-slate-300 space-y-6">
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
                </div>

                {/* Part A Preview */}
                <div className="space-y-3">
                  <div className="bg-slate-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center">
                    <span>ক-বিভাগ: অতি সংক্ষিপ্ত প্রশ্নোত্তর</span>
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
                          <strong>উত্তর:</strong>{' '}
                          {typeof q.answer === 'string'
                            ? q.answer
                            : q.answer?.main || q.answer?.intro || ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Part B Preview */}
                <div className="space-y-3">
                  <div className="bg-[#1e40af] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex justify-between items-center">
                    <span>খ-বিভাগ: সংক্ষিপ্ত প্রশ্নাবলি</span>
                    <span className="text-blue-200 text-[11px]">{pdfModalSubject.partB.length}টি প্রশ্ন</span>
                  </div>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {pdfModalSubject.partB.map((q, idx) => (
                      <div key={q.id} className="p-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800">
                          {idx + 1}. {q.question}{' '}
                          {q.years && <span className="text-slate-400 font-normal">[{q.years}]</span>}
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
                    <span>গ-বিভাগ: রচনামূলক প্রশ্নাবলি</span>
                    <span className="text-amber-300 text-[11px]">{pdfModalSubject.partC.length}টি প্রশ্ন</span>
                  </div>
                  <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                    {pdfModalSubject.partC.map((q, idx) => (
                      <div key={q.id} className="p-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-900">
                          {idx + 1}. {q.question}{' '}
                          {q.years && <span className="text-slate-400 font-normal">[{q.years}]</span>}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                          {q.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-300 flex justify-between items-center text-xs text-slate-600 font-semibold">
                  <span>জাতীয় বিশ্ববিদ্যালয় — অনার্স ৩য় বর্ষ পরীক্ষা ২০২৫ • কোর্স: {pdfModalSubject.code}</span>
                  <span className="text-[#1e40af] font-bold">Suggestion created by {AUTHOR_CREDIT}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Routine Modal */}
      {routineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    সমাজকর্ম ৩য় বর্ষ চূড়ান্ত পরীক্ষার রুটিন
                  </h3>
                  <p className="text-xs text-slate-400">পরীক্ষা আরম্ভ: দুপুর ১:০০ টা</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setRoutineViewTab('card')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      routineViewTab === 'card'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    ডিজাইন রুটিন
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoutineViewTab('image')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      routineViewTab === 'image'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    মূল ছবি
                  </button>
                </div>

                <a
                  href="/social-work-3rd-year-exam-routine.jpg"
                  download="Social_Work_3rd_Year_Final_Routine.jpg"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">ডাউনলোড</span>
                </a>

                <button
                  type="button"
                  onClick={() => setRoutineModalOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#f4f7f4] dark:bg-slate-950">
              {routineViewTab === 'card' ? (
                <div className="max-w-3xl mx-auto bg-[#fafbfa] dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-6 space-y-4">
                  <div className="space-y-2.5">
                    {EXAM_ROUTINE.map((item) => (
                      <div
                        key={item.code}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="bg-slate-900 text-white px-3 py-2 rounded-lg text-center min-w-[120px]">
                            <div className="text-xs font-bold text-amber-300">{item.date}</div>
                            <div className="text-[11px] text-slate-300">({item.day})</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#1e40af] dark:text-blue-300 font-mono font-bold text-xs">
                            {item.code}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.nameBn}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {item.nameEn}
                          </p>
                        </div>

                        <div className="shrink-0">
                          {item.status === 'ready' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSubjectId(item.code);
                                setRoutineModalOpen(false);
                              }}
                              className="px-3.5 py-2 rounded-xl bg-[#1e40af] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                              <span>সাজেশন পড়ুন</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                              প্রক্রিয়াধীন
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center">
                  <img
                    src="/social-work-3rd-year-exam-routine.jpg"
                    alt="Social Work 3rd Year Final Routine"
                    className="max-h-[70vh] w-auto object-contain rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Academic Footer */}
      <footer className="bg-slate-900 text-slate-300 py-5 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>
              <strong>জাতীয় বিশ্ববিদ্যালয় • বি.এস.এস. (অনার্স) ৩য় বর্ষ চূড়ান্ত পরীক্ষা ২০২৫</strong> (সমাজকর্ম বিভাগ)
            </span>
          </div>
          <div className="text-slate-400">
            প্রস্তুতকারক: <span className="text-amber-400 font-bold">{AUTHOR_CREDIT}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
