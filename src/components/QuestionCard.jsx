import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  Calendar,
  Sparkles,
  GitBranch,
  Quote,
  ListChecks
} from 'lucide-react';

export default function QuestionCard({
  item,
  index,
  partType,
  isExpanded,
  onToggleExpand,
  isBookmarked,
  onToggleBookmark,
  isRead,
  onToggleRead
}) {
  const [copied, setCopied] = useState(false);

  const getBadgeStyle = (importance) => {
    if (importance === '99%') {
      return 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold';
    }
    if (importance === '90%') {
      return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold';
    }
    return 'bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-medium';
  };

  const getPlainTextAnswer = () => {
    if (partType === 'A') {
      const ans = typeof item.answer === 'string' ? item.answer : item.answer?.intro || JSON.stringify(item.answer);
      return `${item.question}\nউত্তর: ${ans}`;
    }
    if (partType === 'B') {
      if (typeof item.answer === 'string') return `${item.question}\n\n${item.answer}`;
      return [
        item.question,
        `ভূমিকা: ${item.answer.intro || ''}`,
        item.answer.definition ? `প্রামাণ্য সংজ্ঞা: ${item.answer.definition}` : '',
        ...(item.answer.points || []),
        `উপসংহার: ${item.answer.conclusion || ''}`
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    if (typeof item.answer === 'string') return `${item.question}\n\n${item.answer}`;
    return [
      item.question,
      `১. ভূমিকা: ${item.answer.step1_intro || ''}`,
      `২. প্রামাণ্য সংজ্ঞা:\n${(item.answer.step2_definitions || []).join('\n')}`,
      item.answer.step3_diagram ? `৩. রূপরেখা: ${item.answer.step3_diagram.title}\n${(item.answer.step3_diagram.flow || []).join(' -> ')}` : '',
      `৪. মূল আলোচনা:\n${(item.answer.step4_points || []).join('\n')}`,
      `৫. উপসংহার: ${item.answer.step5_conclusion || ''}`
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const handleCopy = () => {
    const text = getPlainTextAnswer();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <article
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'bg-white dark:bg-slate-900 border-2 border-blue-500/80 dark:border-blue-500 shadow-md ring-1 ring-blue-500/20'
          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs hover:shadow-xs'
      }`}
    >
      {/* Question Header */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-800 dark:bg-slate-700 text-white">
              প্রশ্ন #{index + 1}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs border ${getBadgeStyle(
                item.importance
              )}`}
            >
              {item.badge}
            </span>
            {item.years && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                {item.years}
              </span>
            )}
          </div>

          {/* Quick Actions (Optimized touch targets for mobile) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleRead(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer select-none ${
                isRead
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="পড়া সম্পন্ন হিসেবে চিহ্নিত করুন"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRead ? 'পড়া হয়েছে' : 'পড়েছি'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(item.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer select-none ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="বুকমার্ক করুন"
              aria-label="বুকমার্ক করুন"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Clean, Readable Bengali Question Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {item.question}
        </h3>

        {/* Action Toggle Bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onToggleExpand}
            className={`group inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-xs ${
              isExpanded
                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700 shadow-2xs hover:shadow-xs'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform ${
                isExpanded
                  ? 'bg-slate-200 text-slate-700'
                  : 'bg-white/20 text-white group-hover:rotate-12'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            <span>{isExpanded ? 'উত্তর সংকুচিত করুন' : 'পূর্ণাঙ্গ উত্তর দেখুন'}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500 group-hover:-translate-y-0.5 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-blue-200 group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>

          {isExpanded && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>উত্তর কপি করুন</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Answer View */}
      {isExpanded && (
        <div className="bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
          {/* PART A ANSWER */}
          {partType === 'A' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/60 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide mb-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>সঠিক ও নির্ভুল উত্তর (১ নম্বর মানদণ্ড):</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed font-medium">
                {typeof item.answer === 'string'
                  ? item.answer
                  : item.answer?.intro || JSON.stringify(item.answer)}
              </p>
            </div>
          )}

          {/* PART B ANSWER */}
          {partType === 'B' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              {typeof item.answer === 'string' ? (
                <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">{item.answer}</p>
              ) : (
                <>
                  {/* Intro */}
                  {item.answer.intro && (
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wide mb-1">
                        ১. সংক্ষিপ্ত ধারণা ও ভূমিকা:
                      </h4>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.intro}
                      </p>
                    </div>
                  )}

                  {/* Definition */}
                  {item.answer.definition && (
                    <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-lg border-l-3 border-blue-600 dark:border-blue-500">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                        <Quote className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>২. প্রামাণ্য সংজ্ঞা:</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base italic leading-relaxed">
                        {item.answer.definition}
                      </p>
                    </div>
                  )}

                  {/* Core Points */}
                  {item.answer.points && item.answer.points.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide mb-2">
                        <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>৩. মূল পয়েন্টসমূহ (পরীক্ষায় লেখার উপযোগী):</span>
                      </div>
                      <ul className="space-y-2">
                        {item.answer.points.map((pt, idx) => (
                          <li
                            key={idx}
                            className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed pl-3 border-l-2 border-emerald-400 dark:border-emerald-500"
                          >
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Conclusion */}
                  {item.answer.conclusion && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide mb-1">
                        ৪. উপসংহার:
                      </h4>
                      <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                        {item.answer.conclusion}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PART C ANSWER (10 Marks Model) */}
          {partType === 'C' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
              {typeof item.answer === 'string' ? (
                <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">{item.answer}</p>
              ) : (
                <>
                  {/* Step 1: Intro */}
                  {item.answer.step1_intro && (
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-xs font-bold mb-1.5 border border-blue-200 dark:border-blue-800">
                        ধাপ ১: সহজ ভূমিকা
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.step1_intro}
                      </p>
                    </div>
                  )}

                  {/* Step 2: Definitions */}
                  {item.answer.step2_definitions && item.answer.step2_definitions.length > 0 && (
                    <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border-l-3 border-[#1e40af] dark:border-blue-500">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300 mb-2">
                        <Quote className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>ধাপ ২: প্রামাণ্য সংজ্ঞা</span>
                      </div>
                      <div className="space-y-2">
                        {item.answer.step2_definitions.map((defText, idx) => (
                          <blockquote
                            key={idx}
                            className="bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-blue-200/80 dark:border-blue-900/60 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed"
                          >
                            {defText}
                          </blockquote>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Diagram Flow */}
                  {item.answer.step3_diagram && (
                    <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-2">
                        <GitBranch className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        <span>ধাপ ৩: মূল কাঠামোর রূপরেখা ({item.answer.step3_diagram.title})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {(item.answer.step3_diagram.flow || []).map((node, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700/60 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <span className="w-5 h-5 rounded-full bg-amber-600 dark:bg-amber-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{node}</span>
                          </div>
                        ))}
                      </div>
                      {item.answer.step3_diagram.caption && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 italic">
                          {item.answer.step3_diagram.caption}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Step 4: Points */}
                  {item.answer.step4_points && item.answer.step4_points.length > 0 && (
                    <div>
                      <div className="inline-block px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs font-bold mb-2 border border-emerald-200 dark:border-emerald-800">
                        ধাপ ৪: পরীক্ষায় লেখার উপযোগী মূল পয়েন্টসমূহ
                      </div>
                      <div className="space-y-2.5">
                        {item.answer.step4_points.map((pt, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed"
                          >
                            {pt}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 5: Conclusion */}
                  {item.answer.step5_conclusion && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <div className="inline-block px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs font-bold mb-1 border border-slate-300 dark:border-slate-700">
                        ধাপ ৫: উপসংহার
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.step5_conclusion}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
