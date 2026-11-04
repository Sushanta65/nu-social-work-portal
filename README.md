# 🎓 NU Honours 3rd Year Social Work — Suggestion & Academic Study Portal

A complete, mobile-responsive React + Tailwind CSS academic web application for **National University (NU), Bangladesh — Honours 3rd Year Social Work** (Courses `232101` to `232115`), featuring:

- **Multi-Subject Navigation:** Switch seamlessly across all 8 Honours 3rd Year Social Work courses (`232101`, `232103`, `232105`, `232107`, `232109`, `232111`, `232113`, `232115`).
- **Interactive Q&A Accordion (`Show Answer / উত্তর দেখুন`):**
  - **ক-বিভাগ (Part A: 1-Mark Brief Questions):** Pinpoint 1–2 sentence answers with book titles, publication years, and proponents.
  - **খ-বিভাগ (Part B: 4-Mark Short Questions):** Structured academic answers with Introduction, Scholarly Definition, Core Points, and Conclusion.
  - **গ-বিভাগ (Part C: 10-Mark Broad Questions):** First-Class 5-Step Model Answers (১. ভূমিকা, ২. প্রামাণ্য সংজ্ঞা, ৩. ভিজ্যুয়াল ডায়াগ্রাম/ফ্লো-চার্ট, ৪. ৮–১০টি মূল পয়েন্ট বাংলা ও ইংরেজি পরিভাষাসহ, ৫. সীমাবদ্ধতা ও গঠনমূলক উপসংহার).
- **Dynamic Printable PDF Export Per Subject:**
  - Includes **ক-বিভাগ with Questions & Answers** and **খ & গ-বিভাগ with Questions ONLY (+ Importance Badges)** for lightweight revision.
  - Every page includes the footer: `Suggestion created by Susanto Chandra Das | [Course Name & Code]`.

---

## 📁 Project Structure

```text
nu-social-work-portal/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx
    ├── data/
    │   └── subjectsData.js
    └── components/
        ├── Navbar.jsx
        ├── SubjectSelector.jsx
        ├── QuestionCard.jsx
        └── PdfExportButton.jsx
```

---

## 🚀 Quick Local Setup & 2-Minute Deployment (Vercel / Netlify)

### 1. Run Locally
```bash
npm install
npm run dev
```

### 2. Deploy to Vercel (Recommended — 2 Minutes)
1. Push this project folder to a GitHub repository (or install the Vercel CLI: `npm i -g vercel`).
2. Go to [https://vercel.com/new](https://vercel.com/new) and import your repository.
3. Framework Preset will auto-detect **Vite** (`npm run build`, output directory `dist`).
4. Click **Deploy** — your live academic portal URL will be ready in under 60 seconds!

### 3. Deploy to Netlify
1. Run `npm run build` locally to generate the production `dist/` folder, or connect your GitHub repo on [https://app.netlify.com](https://app.netlify.com).
2. Set **Build command:** `npm run build` and **Publish directory:** `dist`.
3. Click **Deploy site**.
