import React, { useState, useMemo, useEffect } from 'react';
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
  Download,
  Hourglass,
  Share2,
  Bookmark,
  Check,
  TrendingUp,
  Moon,
  Sun
} from 'lucide-react';
import SUBJECTS_DATA, { AUTHOR_CREDIT, PORTAL_META, EXAM_ROUTINE } from './data/subjectsData';
import Navbar from './components/Navbar';
import SubjectSelector from './components/SubjectSelector';
import QuestionCard from './components/QuestionCard';
import StudentAccessGate from './components/StudentAccessGate';
import { STUDENT_STORAGE_KEY } from './config';
import PdfExportButton, {
  buildPrintableHtmlDocument,
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

  const [selectedSubjectId, setSelectedSubjectId] = useState(SUBJECTS_DATA[0]?.id || '232109');
  const [activePart, setActivePart] = useState('ALL'); // 'ALL', 'A', 'B', 'C', 'BOOKMARKED'
  const [importanceFilter, setImportanceFilter] = useState('ALL'); // 'ALL', '99%', '90%'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({ '232109-a1': true });

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
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [routineModalOpen, setRoutineModalOpen] = useState(false);
  const [routineViewTab, setRoutineViewTab] = useState('card'); // 'card' | 'image'
  const [shareSuccess, setShareSuccess] = useState(false);

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

  // Share functionality (WhatsApp + Native Share Sheet)
  const handleShare = async () => {
    const shareUrl = 'https://nu-social-work-portal.vercel.app/';
    const shareTitle = `জাতীয় বিশ্ববিদ্যালয় সমাজকর্ম ৩য় বর্ষ ফাইনাল সাজেশন (${selectedSubject.titleBn})`;
    const shareText = `জাতীয় বিশ্ববিদ্যালয় অনার্স ৩য় বর্ষ সমাজকর্ম ফাইনাল সাজেশন ও ১০০% কমন মডেল উত্তর (রুটিনসহ) পেয়ে গেছি এখানে! এখনই দেখে নাও:`;

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
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
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
        studentUser={studentUser}
        onLogout={() => {
          try {
            localStorage.removeItem(STUDENT_STORAGE_KEY);
          } catch (e) {}
          setStudentUser(null);
        }}
        selectedSubject={selectedSubject}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenMobileDrawer={() => setMobileDrawerOpen(true)}
        onOpenPdfModal={(subj) => setPdfModalSubject(subj)}
        onOpenMethodologyModal={() => setMethodologyModalOpen(true)}
        onOpenRoutineModal={() => setRoutineModalOpen(true)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onShare={handleShare}
      />

      {/* Student Access Gate Modal (Only if not verified) */}
      {!studentUser && (
        <StudentAccessGate onAccessGranted={(user) => setStudentUser(user)} />
      )}

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
        <main className="flex-1 min-w-0 space-y-5 pb-16 lg:pb-8">
          {/* Quick Subject Switcher for Mobile & Tablet */}
          <div className="lg:hidden bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center gap-1.5">
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
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
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
          <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#1e40af] text-white">
                    কোর্স কোড: {selectedSubject.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    শিক্ষাবর্ষ: ২০২২-২০২৩
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    পূর্ণমান: ৮০ (তত্ত্বীয়/লিখিত) + ২০ (ইনকোর্স)
                  </span>
                  {selectedSubject.examOrder && (
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {selectedSubject.examOrder}
                    </span>
                  )}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {selectedSubject.titleBn}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {selectedSubject.titleEn}
                </p>

                {/* Exam Schedule Bar with Live Countdown */}
                {selectedSubject.examDate && (
                  <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950 dark:text-amber-300">
                      <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span>পরীক্ষার তারিখ: {selectedSubject.examDate}</span>
                    </div>
                    <span className="text-amber-300 dark:text-amber-800 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>সময়: {selectedSubject.examTime || 'দুপুর ১:০০ টা'}</span>
                    </div>

                    {/* Live Countdown Badge */}
                    {countdown && countdown.days >= 0 && (
                      <>
                        <span className="text-amber-300 dark:text-amber-800 hidden sm:inline">•</span>
                        <div className="inline-flex items-center gap-1 font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2.5 py-0.5 rounded-md shadow-2xs">
                          <Hourglass className="w-3 h-3 text-rose-600 animate-pulse" />
                          <span>
                            বাকি: {countdown.days} দিন {countdown.hours} ঘণ্টা {countdown.minutes} মি.
                          </span>
                        </div>
                      </>
                    )}

                    {selectedSubject.examGap && (
                      <>
                        <span className="text-amber-300 dark:text-amber-800 hidden sm:inline">•</span>
                        <span className="text-indigo-800 dark:text-indigo-300 font-semibold bg-indigo-100/60 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50 dark:border-indigo-900/50">
                          প্রস্তুতি ছুটি: {selectedSubject.examGap}
                        </span>
                      </>
                    )}
                  </div>
                )}

                <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <strong>সিলেবাস বিভাজন:</strong> {selectedSubject.syllabusSplit}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:w-56">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoutineModalOpen(true)}
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-amber-300" />
                    <span>রুটিন দেখুন</span>
                  </button>

                  <a
                    href="/social-work-3rd-year-exam-routine.jpg"
                    download="Social_Work_3rd_Year_Final_Routine.jpg"
                    className="px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="রুটিনের ছবি ডাউনলোড করুন"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => setPdfModalSubject(selectedSubject)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>সাজেশন PDF প্রিন্ট / সেভ</span>
                </button>

                {/* Share Button (WhatsApp / Mobile Share) */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  title="বন্ধুদের সাথে শেয়ার করুন"
                >
                  {shareSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-amber-300" />
                      <span>লিংক কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>বন্ধুদের সাথে শেয়ার করুন</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMethodologyModalOpen(true)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>সাজেশনের বৈশিষ্ট্য ও টিপস</span>
                </button>
              </div>
            </div>
          </section>

          {/* Study Progress Tracker Card */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <span>আপনার পড়ার অগ্রগতি:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
                      {subjectReadCount}/{allSubjectQuestions.length}টি প্রশ্ন ({progressPercentage}%)
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {progressPercentage === 100
                      ? '🎉 অভিনন্দন! এই বিষয়ের শতভাগ প্রশ্ন পড়া সম্পন্ন হয়েছে।'
                      : progressPercentage >= 50
                      ? '🔥 চমৎকার অগ্রগতি! অর্ধেকের বেশি প্রশ্নের প্রস্তুতি সম্পন্ন।'
                      : 'প্রতিটি প্রশ্ন পড়ার পর "পড়েছি" বাটনে ক্লিক করে অগ্রগতি ট্র্যাকিং করুন।'}
                  </p>
                </div>
              </div>

              <span className="font-black text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {progressPercentage}%
              </span>
            </div>

            {/* Progress Bar Line */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              <div
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercentage, 2)}%` }}
              ></div>
            </div>
          </section>

          {/* Filter Bar: Section Tabs (ক/খ/গ/সংরক্ষিত) + Importance Filter */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
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
                    label: 'ক-বিভাগ (১)',
                    count: filteredPartA.length
                  },
                  {
                    id: 'B',
                    label: 'খ-বিভাগ (৪)',
                    count: filteredPartB.length
                  },
                  {
                    id: 'C',
                    label: 'গ-বিভাগ (১০)',
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
                  সব সংকুচিত করুন
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
                  পড়ার সময় যেকোনো গুরুত্বপূর্ণ বা কঠিন প্রশ্নের পাশে বুকমার্ক (🔖) আইকনে ক্লিক করে সংরক্ষণ করুন। তাহলে পরীক্ষার আগের রাতে সেগুলো এখানে একনজরে রিভিশন দিতে পারবেন!
                </p>
              </div>
            )}

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
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  সাজেশন ও পরীক্ষার গাইডলাইন (Exam 2025)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMethodologyModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
                <strong>১. জাতীয় বিশ্ববিদ্যালয় অনার্স ৩য় বর্ষ পরীক্ষা:</strong> এই সাজেশনটি ২০২২-২০২৩ শিক্ষাবর্ষের নিয়মিত শিক্ষার্থীদের অনার্স ৩য় বর্ষ চূড়ান্ত পরীক্ষার জন্য বিগত ৭ বছরের প্রশ্নপত্র বিশ্লেষণ করে তৈরি।
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                <strong>২. ৯৯% কমন ভিত্তি:</strong> জাতীয় বিশ্ববিদ্যালয়ে ৭০-৮৫% প্রশ্ন বিগত বছরের বোর্ড প্রশ্ন থেকে সরাসরি আসে। সেই প্রশ্নগুলোকে <strong>★★★ ৯৯% নিশ্চিত</strong> হিসেবে চিহ্নিত করা হয়েছে।
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                <strong>৩. সহজ ও নির্ভুল উত্তর:</strong> উত্তরগুলো জটিল পারিভাষিক শব্দের বদলে সহজ, প্রাঞ্জল ও পরীক্ষায় সরাসরি লেখার উপযোগী পয়েন্ট আকারে সাজানো হয়েছে।
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <strong>৪. সম্পূর্ণ PDF প্রিন্ট সুবিধা:</strong> প্রিন্ট বোতামে চাপ দিলে কোনো অংশ না কেটে পুরো ডকুমেন্টটি এ৪ আকারে স্বয়ংক্রিয়ভাবে প্রিন্ট বা সেভ হবে।
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setMethodologyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1e40af] hover:bg-blue-600 text-white text-xs sm:text-sm font-bold cursor-pointer"
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
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-[#f4f7f4] dark:bg-slate-950">
              {routineViewTab === 'card' ? (
                /* Beautifully Designed Routine Poster Card */
                <div className="max-w-3xl mx-auto bg-[#fafbfa] dark:bg-slate-900 rounded-2xl border-2 border-[#3d5a45]/20 dark:border-emerald-900/50 shadow-md p-4 sm:p-7 space-y-5">
                  {/* Routine Card Header */}
                  <div className="text-center space-y-2 border-b-2 border-[#3d5a45]/20 dark:border-emerald-900/50 pb-4">
                    <div className="inline-flex items-center justify-center gap-2 text-[#2e4736] dark:text-emerald-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f3326] dark:text-white tracking-tight">
                      Social Work - 3rd Year Final Routine
                    </h2>
                    <p className="text-sm sm:text-base font-bold text-[#2e4736] dark:text-emerald-400">
                      জাতীয় বিশ্ববিদ্যালয় • সমাজকর্ম বিভাগ ৩য় বর্ষ চূড়ান্ত পরীক্ষা
                    </p>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                      <span className="px-3.5 py-1 rounded-full font-bold bg-[#3d5a45] text-white shadow-2xs flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Exam Starts at 1:00 PM (দুপুর ১:০০ টা)</span>
                      </span>
                      <span className="px-3 py-1 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        শিক্ষাবর্ষ: ২০২২-২০২৩
                      </span>
                      <span className="px-3 py-1 rounded-full font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
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
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/90 dark:bg-amber-950/70 text-amber-950 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800 shadow-2xs">
                              <span>⏳ Gap: {item.gap}</span>
                            </span>
                          </div>
                        )}

                        {/* Subject Exam Card */}
                        <div
                          className={`rounded-2xl border transition-all p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
                            item.status === 'ready'
                              ? 'bg-white dark:bg-slate-800 border-[#2e4736] dark:border-emerald-600 ring-2 ring-[#2e4736]/10'
                              : 'bg-white/90 dark:bg-slate-850 border-[#3d5a45]/20 dark:border-slate-750'
                          }`}
                        >
                          {/* Date and Day Badge */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="bg-[#345244] dark:bg-slate-950 text-white px-3.5 py-2.5 rounded-xl text-center min-w-[130px] shadow-2xs border border-[#3d5a45]/40 dark:border-slate-800">
                              <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                                <span>{item.date}</span>
                              </div>
                              <div className="text-[11px] text-emerald-100 dark:text-emerald-400 font-semibold mt-0.5">
                                ({item.day})
                              </div>
                            </div>

                            {/* Subject Code */}
                            <div className="bg-[#eaf0eb] dark:bg-slate-900 border border-[#3d5a45]/30 dark:border-slate-700 text-[#1f3326] dark:text-slate-200 px-3 py-2 rounded-xl text-center shrink-0">
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">
                                কোড
                              </span>
                              <span className="text-xs sm:text-sm font-extrabold font-mono">
                                {item.code}
                              </span>
                            </div>
                          </div>

                          {/* Subject Titles */}
                          <div className="flex-1 min-w-0 md:pl-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                              {item.nameEn}
                            </h4>
                            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
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
                              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                সাজেশন প্রক্রিয়াধীন
                              </span>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Routine Card Footer */}
                  <div className="text-center pt-3 border-t-2 border-[#3d5a45]/20 dark:border-emerald-900/50 text-[#2e4736] dark:text-emerald-400 font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2">
                    <span>🌿 STUDY</span>
                    <span>•</span>
                    <span>PREPARE</span>
                    <span>•</span>
                    <span>SUCCEED 🌿</span>
                  </div>
                </div>
              ) : (
                /* Original Image View */
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center space-y-3">
                  <div className="w-full flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="font-semibold">অরিজিনাল রুটিনের অফিশিয়াল ছবি:</span>
                    <a
                      href="/social-work-3rd-year-exam-routine.jpg"
                      download="Social_Work_3rd_Year_Final_Routine.jpg"
                      className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
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
            <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400">
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
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
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
