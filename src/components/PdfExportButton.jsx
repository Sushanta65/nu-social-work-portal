import React from 'react';
import { FileDown, Printer } from 'lucide-react';
import { AUTHOR_CREDIT } from '../data/subjectsData';

/**
 * Builds standard W3C multi-page printable HTML document.
 * Strictly adheres to the rule:
 * - Part A: Question + Answer (with importance badge)
 * - Part B & C: Questions ONLY (with importance badge & years)
 * - Header on every page: National University Honours 3rd Year Exam 2025
 * - Footer on every page: "Suggestion created by Susanto Chandra Das"
 */
export function buildPrintableHtmlDocument(subject) {
  const courseHeader = `${subject.code}: ${subject.titleBn} (${subject.titleEn})`;
  const footerAttribution = `Suggestion created by ${AUTHOR_CREDIT}`;

  const partAItems = subject.partA
    .map(
      (q, i) => `
      <div class="qa-item">
        <div class="q-header">
          <span class="q-num">প্রশ্ন ${i + 1}:</span>
          <span class="q-text">${q.question}</span>
          <span class="badge ${q.importance === '99%' ? 'badge-high' : 'badge-mid'}">${q.badge}</span>
        </div>
        <div class="a-body">
          <strong>উত্তর:</strong> ${typeof q.answer === 'string' ? q.answer : q.answer?.intro || JSON.stringify(q.answer)}
        </div>
      </div>`
    )
    .join('');

  const partBItems = subject.partB
    .map(
      (q, i) => `
      <div class="q-only-item">
        <span class="q-num">${i + 1}.</span>
        <span class="q-text">${q.question}</span>
        ${q.years ? `<span class="year-tag">[${q.years}]</span>` : ''}
        <span class="badge ${q.importance === '99%' ? 'badge-high' : 'badge-mid'}">${q.badge}</span>
      </div>`
    )
    .join('');

  const partCItems = subject.partC
    .map(
      (q, i) => `
      <div class="q-only-item">
        <span class="q-num">${i + 1}.</span>
        <span class="q-text">${q.question}</span>
        ${q.years ? `<span class="year-tag">[${q.years}]</span>` : ''}
        <span class="badge ${q.importance === '99%' ? 'badge-high' : 'badge-mid'}">${q.badge}</span>
      </div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NU Honours 3rd Year Suggestion - ${subject.code} (${subject.titleBn})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Kalpurush', 'Hind Siliguri', 'Segoe UI', Tahoma, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.55;
      margin: 0;
      padding: 0;
      font-size: 10.5pt;
    }
    table.print-wrapper {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    thead {
      display: table-header-group;
    }
    tfoot {
      display: table-footer-group;
    }
    tbody {
      display: table-row-group;
    }
    .header-box {
      border-bottom: 2.5px solid #1e3a8a;
      padding-bottom: 8px;
      margin-bottom: 14px;
      text-align: center;
    }
    .uni-name {
      font-size: 14pt;
      font-weight: 700;
      color: #1e3a8a;
      margin: 0 0 2px 0;
    }
    .exam-title {
      font-size: 12pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 2px 0;
    }
    .course-title {
      font-size: 11pt;
      font-weight: 700;
      color: #1e40af;
      margin: 0 0 4px 0;
    }
    .meta-line {
      font-size: 8.5pt;
      color: #475569;
      font-weight: 500;
    }
    .section-header {
      background: #1e3a8a;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 11pt;
      font-weight: 700;
      margin: 14px 0 8px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      page-break-after: avoid;
      break-after: avoid;
    }
    .section-note {
      font-size: 8pt;
      font-weight: normal;
      opacity: 0.9;
    }
    .qa-item {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      padding: 7px 10px;
      margin-bottom: 7px;
      background: #f8fafc;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .q-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 3px;
    }
    .q-num {
      font-weight: 700;
      color: #1e3a8a;
      font-size: 10pt;
      white-space: nowrap;
    }
    .q-text {
      font-weight: 600;
      color: #0f172a;
      flex: 1;
      font-size: 10.5pt;
    }
    .a-body {
      color: #1e293b;
      font-size: 10pt;
      padding-left: 2px;
      line-height: 1.5;
    }
    .q-only-item {
      border-bottom: 1px dashed #cbd5e1;
      padding: 6px 4px;
      page-break-inside: avoid;
      break-inside: avoid;
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .year-tag {
      font-size: 8pt;
      color: #64748b;
      white-space: nowrap;
    }
    .badge {
      font-size: 7.5pt;
      font-weight: 700;
      padding: 1.5px 6px;
      border-radius: 10px;
      white-space: nowrap;
      margin-left: auto;
    }
    .badge-high {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #f59e0b;
    }
    .badge-mid {
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #10b981;
    }
    .footer-box {
      border-top: 1px solid #94a3b8;
      padding-top: 5px;
      font-size: 8.5pt;
      color: #475569;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
    }
    .footer-author {
      font-weight: 700;
      color: #1e3a8a;
    }
    @media print {
      body {
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <table class="print-wrapper">
    <thead>
      <tr>
        <th style="font-weight: normal; text-align: left; border: none;">
          <div class="header-box">
            <h1 class="uni-name">জাতীয় বিশ্ববিদ্যালয় (National University, Bangladesh)</h1>
            <h2 class="exam-title">বি.এস.এস. (অনার্স) ৩য় বর্ষ চূড়ান্ত পরীক্ষা ২০২৫ (সমাজকর্ম বিভাগ)</h2>
            <h3 class="course-title">চূড়ান্ত সাজেশন • কোর্স কোড: ${courseHeader}</h3>
            <div class="meta-line">
              পূর্ণমান: ৮০ (লিখিত পরীক্ষা) | ইনকোর্স: ২০ | ক্রেডিট: ৪ ${subject.examDate ? `| পরীক্ষার তারিখ: ${subject.examDate}` : ''} | শিক্ষাবর্ষ: ২০২২-২০২৩ | প্রস্তুতকারক: ${AUTHOR_CREDIT}
            </div>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: none;">
          <!-- SECTION A: Questions & Answers -->
          <div class="section-header">
            <span>ক-বিভাগ: অতি সংক্ষিপ্ত প্রশ্নোত্তর (মান: ১ × ১০ = ১০)</span>
            <span class="section-note">[প্রশ্ন ও পূর্ণাঙ্গ নির্ভুল উত্তরসহ সংকলিত]</span>
          </div>
          ${partAItems}

          <!-- SECTION B: Questions Only -->
          <div class="section-header" style="background: #2563eb; margin-top: 16px;">
            <span>খ-বিভাগ: সংক্ষিপ্ত প্রশ্নাবলি (মান: ৪ × ৫ = ২০)</span>
            <span class="section-note">[দ্রুত রিভিশন তালিকা — ৮টি প্রশ্ন থেকে যেকোনো ৫টির উত্তর দিতে হবে]</span>
          </div>
          ${partBItems}

          <!-- SECTION C: Questions Only -->
          <div class="section-header" style="background: #1e3a8a; margin-top: 16px;">
            <span>গ-বিভাগ: রচনামূলক প্রশ্নাবলি (মান: ১০ × ৫ = ৫০)</span>
            <span class="section-note">[ফার্স্ট-ক্লাস প্রস্তুতি প্রশ্নাবলি — ৮টি থেকে যেকোনো ৫টির উত্তর দিতে হবে]</span>
          </div>
          ${partCItems}
        </td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td style="border: none;">
          <div class="footer-box">
            <span>জাতীয় বিশ্ববিদ্যালয় — অনার্স ৩য় বর্ষ পরীক্ষা ২০২৫ • কোর্স: ${subject.code} (${subject.titleBn})</span>
            <span class="footer-author">${footerAttribution}</span>
          </div>
        </td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`;
}

/**
 * Triggers clean, unclipped print via an isolated iframe.
 * Avoids modal scroll and fixed position traps that cause truncation in browsers!
 */
export function printSubjectDocument(subject) {
  const htmlContent = buildPrintableHtmlDocument(subject);
  let iframe = document.getElementById('nu-isolated-print-iframe');
  
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'nu-isolated-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1000px';
    iframe.style.height = '1000px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Allow web fonts to load before opening print dialog
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 450);
}

/**
 * Downloads the clean standalone printable HTML file.
 */
export function downloadPrintableHtml(subject) {
  const htmlContent = buildPrintableHtmlDocument(subject);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NU_Social_Work_${subject.code}_Suggestion_Exam_2025_by_Susanto_Chandra_Das.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PdfExportButton({ subject, compact = false, onOpenPdfModal }) {
  return (
    <button
      type="button"
      onClick={() => onOpenPdfModal(subject)}
      className={`inline-flex items-center gap-2 rounded-xl font-bold transition-all shadow-xs cursor-pointer ${
        compact
          ? 'px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400'
          : 'px-4 py-2.5 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold border border-amber-400/50'
      }`}
      title="সাজেশন PDF প্রিভিউ ও প্রিন্ট করুন"
    >
      <Printer className="w-4 h-4 shrink-0" />
      <span>{compact ? 'PDF প্রিন্ট / সেভ' : 'সাজেশন PDF প্রিন্ট / সেভ করুন'}</span>
    </button>
  );
}
