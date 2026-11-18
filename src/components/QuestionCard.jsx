import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  Lightbulb,
  Quote,
  GitBranch,
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
      return 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80 font-bold';
    }
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 font-semibold';
  };

  const getPlainTextAnswer = () => {
    if (partType === 'A') {
      if (typeof item.answer === 'string') {
        return `${item.question}\nউত্তর: ${item.answer}`;
      }
      return [
        item.question,
        `মূল উত্তর: ${item.answer?.main || item.answer?.intro || ''}`,
        item.answer?.easyExplanation ? `সহজ ব্যাখ্যা: ${item.answer.easyExplanation}` : '',
        item.answer?.examples?.length
          ? `বাস্তব উদাহরণ:\n${item.answer.examples.map((ex) => `• ${ex}`).join('\n')}`
          : ''
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    if (partType === 'B') {
      if (typeof item.answer === 'string') return `${item.question}\n\n${item.answer}`;
      return [
        item.question,
        `ভূমিকা: ${item.answer.intro || ''}`,
        item.answer.definition ? `প্রামাণ্য সংজ্ঞা: ${item.answer.definition}` : '',
        item.answer.examples?.length
          ? `বাস্তব উদাহরণ:\n${item.answer.examples.map((ex) => `• ${ex}`).join('\n')}`
          : '',
        ...(item.answer.points || []),
        `উপসংহার: ${item.answer.conclusion || ''}`
      ]
        .filter(Boolean)
        .join('\n\n');
    }
    if (typeof item.answer === 'string') return `${item.question}\n\n${item.answer}`;
    return [
      item.question,
      `ভূমিকা: ${item.answer.step1_intro || ''}`,
      item.answer.step2_definitions?.length
        ? `প্রামাণ্য সংজ্ঞা:\n${item.answer.step2_definitions.join('\n')}`
        : '',
      item.answer.examples?.length
        ? `বাস্তব উদাহরণ:\n${item.answer.examples.map((ex) => `• ${ex}`).join('\n')}`
        : '',
      item.answer.step3_diagram
        ? `রূপরেখা (${item.answer.step3_diagram.title}):\n${(item.answer.step3_diagram.flow || []).join(' ➔ ')}`
        : '',
      `মূল পয়েন্টসমূহ:\n${(item.answer.step4_points || []).join('\n')}`,
      `উপসংহার: ${item.answer.step5_conclusion || ''}`
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  const handleCopy = (e) => {
    e.stopPropagation();
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
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <article
      className={`rounded-2xl transition-all duration-200 overflow-hidden ${
        isExpanded
          ? 'bg-white dark:bg-slate-900 border-2 border-blue-500/80 dark:border-blue-500 shadow-md'
          : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 shadow-2xs'
      }`}
    >
      {/* Clickable Question Header */}
      <div
        onClick={onToggleExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        className="p-4 sm:p-5 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
      >
        {/* Top Meta & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
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
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {item.years}
              </span>
            )}
          </div>

          <div
            className="flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => onToggleRead(item.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-colors cursor-pointer ${
                isRead
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRead ? 'পড়া হয়েছে' : 'পড়েছি'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleBookmark(item.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isBookmarked
                  ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="সংরক্ষণ করুন"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Question Title & Expand Indicator */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug flex-1">
            {item.question}
          </h3>
          <div
            className={`mt-0.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              isExpanded
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60'
            }`}
          >
            <span className="hidden sm:inline">
              {isExpanded ? 'বন্ধ করুন' : 'উত্তর দেখুন'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Answer Body */}
      {isExpanded && (
        <div className="bg-slate-50/70 dark:bg-slate-950/50 border-t border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 space-y-4">
          {/* Copy Button Bar */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                    কপি হয়েছে!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>উত্তর কপি করুন</span>
                </>
              )}
            </button>
          </div>

          {/* ================= PART A ANSWER ================= */}
          {partType === 'A' && (
            <div className="space-y-3.5">
              {/* Direct 1-Mark Exam Answer */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border-l-4 border-emerald-500 border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                  ✓ পরীক্ষার খাতায় লেখার মূল উত্তর:
                </div>
                <p className="text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed font-semibold">
                  {typeof item.answer === 'string'
                    ? item.answer
                    : item.answer?.main || item.answer?.intro || ''}
                </p>
              </div>

              {/* Easy Explanation */}
              {typeof item.answer === 'object' && item.answer?.easyExplanation && (
                <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-200/80 dark:border-blue-900/60">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                    📖 সহজ ভাষায় ব্যাখ্যা (বোঝার জন্য):
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    {item.answer.easyExplanation}
                  </p>
                </div>
              )}

              {/* Real-Life Examples for Part A */}
              {typeof item.answer === 'object' &&
                item.answer?.examples &&
                item.answer.examples.length > 0 && (
                  <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-xl p-4 border border-amber-200/90 dark:border-amber-900/60 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                      <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>বাস্তব উদাহরণ দিয়ে সহজ ধারণা:</span>
                    </div>
                    <ul className="space-y-2">
                      {item.answer.examples.map((ex, idx) => (
                        <li
                          key={idx}
                          className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed bg-white/80 dark:bg-slate-900/70 p-3 rounded-lg border border-amber-200/60 dark:border-amber-900/40"
                        >
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {/* ================= PART B ANSWER ================= */}
          {partType === 'B' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
              {typeof item.answer === 'string' ? (
                <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                  {item.answer}
                </p>
              ) : (
                <>
                  {/* Intro */}
                  {item.answer.intro && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300 mb-1.5">
                        ১. সহজ ধারণা ও ভূমিকা:
                      </h4>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.intro}
                      </p>
                    </div>
                  )}

                  {/* Definition */}
                  {item.answer.definition && (
                    <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border-l-4 border-blue-600 dark:border-blue-500">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                        <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>২. প্রামাণ্য সংজ্ঞা:</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.definition}
                      </p>
                    </div>
                  )}

                  {/* Real-Life Examples Box */}
                  {item.answer.examples && item.answer.examples.length > 0 && (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>বাস্তব উদাহরণ দিয়ে সহজ ব্যাখ্যা:</span>
                      </div>
                      <div className="space-y-2">
                        {item.answer.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-white dark:bg-slate-800/90 border border-amber-200/70 dark:border-amber-900/50 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Core Points */}
                  {item.answer.points && item.answer.points.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-300 mb-2.5">
                        <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>মূল পয়েন্টসমূহ (উদাহরণসহ সহজ আলোচনা):</span>
                      </div>
                      <ul className="space-y-2.5">
                        {item.answer.points.map((pt, idx) => (
                          <li
                            key={idx}
                            className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed p-3 rounded-lg bg-slate-50 dark:bg-slate-800/70 border-l-4 border-emerald-500"
                          >
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Conclusion */}
                  {item.answer.conclusion && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                        উপসংহার:
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

          {/* ================= PART C ANSWER ================= */}
          {partType === 'C' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
              {typeof item.answer === 'string' ? (
                <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                  {item.answer}
                </p>
              ) : (
                <>
                  {/* Step 1: Intro */}
                  {item.answer.step1_intro && (
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-xs sm:text-sm font-bold mb-2">
                        ১. সহজ ভূমিকা ও মূল ধারণা
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                        {item.answer.step1_intro}
                      </p>
                    </div>
                  )}

                  {/* Step 2: Definitions */}
                  {item.answer.step2_definitions &&
                    item.answer.step2_definitions.length > 0 && (
                      <div className="p-4 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border-l-4 border-[#1e40af] dark:border-blue-500">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">
                          <Quote className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>২. প্রামাণ্য সংজ্ঞা</span>
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

                  {/* Real-Life Examples & Case Studies Box */}
                  {item.answer.examples && item.answer.examples.length > 0 && (
                    <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-2.5">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                        <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>বাস্তব উদাহরণ ও কেস স্টাডি (সহজে বোঝার জন্য):</span>
                      </div>
                      <div className="space-y-2.5">
                        {item.answer.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-lg bg-white dark:bg-slate-800/90 border border-amber-200/80 dark:border-amber-900/50 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed"
                          >
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Diagram Flow */}
                  {item.answer.step3_diagram && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
                      <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5">
                        <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>একনজরে মূল কাঠামো: {item.answer.step3_diagram.title}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(item.answer.step3_diagram.flow || []).map((node, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{node}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Detailed Points */}
                  {item.answer.step4_points && item.answer.step4_points.length > 0 && (
                    <div>
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-bold mb-2.5">
                        বিস্তারিত আলোচনা ও পয়েন্টসমূহ (উদাহরণসহ)
                      </div>
                      <div className="space-y-3">
                        {item.answer.step4_points.map((pt, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border-l-4 border-emerald-500 border border-slate-200/80 dark:border-slate-700/80 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed"
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
                      <div className="inline-block px-2.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-xs sm:text-sm font-bold mb-1.5">
                        উপসংহার
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
