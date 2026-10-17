import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Employees from './pages/Employees';
import JobTitles from './pages/JobTitles';
import History from './pages/History';
import AppreciationLetters from './pages/AppreciationLetters';
import ProcessingEngine from './pages/ProcessingEngine';
import { Calendar } from 'lucide-react';

function App() {
  const todayFormatted = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-50 text-slate-800 font-cairo" dir="rtl">
        {/* لوحة التحكم الجانبية المطلوبة */}
        <Sidebar />

        {/* مساحة المحتوى الرئيسية */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* الشريط العلوي */}
          <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>اليوم: {todayFormatted}</span>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              نظام إدارة العلاوات والترفيعات الوظيفية
            </div>
          </header>

          {/* محتوى الصفحات */}
          <main className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<Employees />} />
              <Route path="/employees" element={<Navigate to="/" replace />} />
              <Route path="/processing-engine" element={<ProcessingEngine />} />
              <Route path="/job-titles" element={<JobTitles />} />
              <Route path="/history" element={<History />} />
              <Route path="/appreciation-letters" element={<AppreciationLetters />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
