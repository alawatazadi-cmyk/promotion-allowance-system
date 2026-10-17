import React, { useState } from 'react';
import { Calendar, Database, PlusCircle, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PromotionModal from '../history/PromotionModal';
import Modal from '../common/Modal';

const Header = () => {
  const { isLiveConnected, isConfigured } = useApp();
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // تاريخ اليوم باللغة العربية
  const todayFormatted = new Intl.DateTimeFormat('ar-IQ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return (
    <>
      <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left / Date & Welcome */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{todayFormatted}</span>
          </div>

          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              isLiveConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isLiveConnected ? 'Supabase متصل' : 'وضع المعاينة المحلي'}</span>
          </div>
        </div>

        {/* Right / Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            title="تعليمات ربط Supabase"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsPromotionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة علاوة أو ترفيع</span>
          </button>
        </div>
      </header>

      {/* Promotion Modal triggered from Header */}
      <PromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
      />

      {/* Instructions Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="دليل ربط قاعدة بيانات Supabase"
        subtitle="خطوات الربط والتشغيل السحابي في دقيقتين"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900">
            <p className="font-semibold mb-1">الربط جاهز تماماً بالكود المصدري!</p>
            <p className="text-xs text-emerald-800">
              النظام متوافق 100% مع Supabase ويقوم بتحديث الراتب آلياً فور إدخال العلاوة أو الترفيع.
            </p>
          </div>

          <ol className="list-decimal list-inside space-y-3 pr-2">
            <li>
              <strong>إنشاء مشروع في Supabase:</strong> قم بزيارة موقع{' '}
              <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-mono">
                supabase.com
              </a>{' '}
              وأنشئ مشروعاً جديداً مجانياً.
            </li>
            <li>
              <strong>تنفيذ مخطط الجداول (SQL Schema):</strong> افتح تبويب <strong>SQL Editor</strong> في لوحة تحكم Supabase، وانسخ محتوى الملف المرفق في المشروع{' '}
              <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">supabase-schema.sql</code> ثم اضغط <strong>RUN</strong>.
            </li>
            <li>
              <strong>إعداد ملف البيئة (.env):</strong> افتح ملف <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs">.env</code> وضع القيم التالية من إعدادات مشروعك (Project Settings &gt; API):
              <div className="mt-2 bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs text-left dir-ltr">
                VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=your-anon-public-key
              </div>
            </li>
            <li>
              <strong>إعادة تشغيل المشروع:</strong> بمجرد وضع المفاتيح، سيتصل النظام بقاعدتك الحية فوراً وستتحول شارة الاتصال في الشريط الجانبي إلى اللون الأخضر.
            </li>
          </ol>
        </div>
      </Modal>
    </>
  );
};

export default Header;
