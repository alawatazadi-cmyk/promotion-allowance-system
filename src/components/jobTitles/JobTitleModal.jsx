import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { Briefcase, Award, Layers, AlertCircle } from 'lucide-react';

const GRADES = [
  'الدرجة الممتازة',
  'الدرجة الأولى',
  'الدرجة الثانية',
  'الدرجة الثالثة',
  'الدرجة الرابعة',
  'الدرجة الخامسة',
  'الدرجة السادسة',
  'الدرجة السابعة',
  'الدرجة الثامنة',
  'الدرجة التاسعة',
  'الدرجة العاشرة',
];

// دالة التحقق من صحة معرّف UUID
const isValidUUID = (val) => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val.trim());
};

const JobTitleModal = ({ isOpen, onClose, jobTitle = null }) => {
  const { addJobTitle, updateJobTitle, showToast } = useApp ? useApp() : {};

  const [mainTitles, setMainTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_main_titles');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    main_title_id: '',
    title_name: '',
    grade: 'الدرجة الخامسة',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // جلب كافة العناوين الأساسية المتاحة لتعبئة القائمة المنسدلة تلقائياً
  useEffect(() => {
    const fetchMainTitles = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase
          .from('main_job_titles')
          .select('*')
          .order('name');
        if (!error && data && data.length > 0) {
          setMainTitles(data);
          localStorage.setItem('supabase_mock_main_titles', JSON.stringify(data));
        }
      } catch (err) {
        console.warn('تعذر جلب العناوين الأساسية في النافذة المنبثقة:', err.message);
      }
    };

    if (isOpen) {
      fetchMainTitles();
    }
  }, [isOpen]);

  // تعبئة وتحديث البيانات وتحديد أول عنوان أساسي افتراضياً
  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setErrors({});
      return;
    }

    if (jobTitle) {
      const isExistingMain = mainTitles.some((m) => m.id === jobTitle.main_title_id);
      setFormData({
        main_title_id: isExistingMain
          ? jobTitle.main_title_id
          : mainTitles[0]?.id || '',
        title_name: jobTitle.title_name || jobTitle.title || '',
        grade: jobTitle.grade || 'الدرجة الخامسة',
      });
    } else {
      // تحديد أول عنوان أساسي افتراضياً لمنع تحويل الحقل إلى فارغ
      setFormData({
        main_title_id: mainTitles[0]?.id || '',
        title_name: '',
        grade: 'الدرجة الخامسة',
      });
    }
    setErrors({});
    setErrorMessage(null);
  }, [jobTitle, isOpen, mainTitles]);

  // التحقق قبل إرسال البيانات للـ Supabase
  const validate = () => {
    const newErrors = {};

    // 1. تأكيد اختيار main_title_id
    if (!formData.main_title_id || !formData.main_title_id.trim()) {
      newErrors.main_title_id = 'يرجى اختيار العنوان الأساسي الذي يتبع له هذا المسمى';
    } else {
      // 2. التحقق من وجوده في قائمة العناوين الأساسية
      const matched = mainTitles.find((m) => m.id === formData.main_title_id.trim());
      if (!matched) {
        newErrors.main_title_id = 'العنوان الأساسي المختار غير موجود في قاعدة البيانات';
      }
      // 3. التأكد من إرسال قيمة main_title_id كـ UUID صحيح
      if (isSupabaseConfigured() && !isValidUUID(formData.main_title_id)) {
        newErrors.main_title_id = 'معرف العنوان الأساسي غير صالح (يجب أن يكون صيغة UUID)';
      }
    }

    // 4. التحقق من كتابة المسمى الوظيفي
    if (!formData.title_name || !formData.title_name.trim()) {
      newErrors.title_name = 'يرجى إدخال مسمى العنوان الوظيفي الفرعي';
    }

    if (!formData.grade) {
      newErrors.grade = 'يرجى اختيار الدرجة الوظيفية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    const payload = {
      main_title_id: formData.main_title_id.trim(),
      title_name: formData.title_name.trim(),
      grade: formData.grade,
    };

    setIsSubmitting(true);

    if (isSupabaseConfigured()) {
      try {
        if (jobTitle) {
          const { error } = await supabase
            .from('job_titles')
            .update(payload)
            .eq('id', jobTitle.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('job_titles')
            .insert([payload]);
          if (error) throw error;
        }

        if (showToast) {
          showToast(
            jobTitle ? 'تم تعديل العنوان الفرعي بنجاح' : 'تمت إضافة العنوان الفرعي بنجاح',
            'success'
          );
        }
        setIsSubmitting(false);
        onClose();
      } catch (err) {
        console.error('خطأ Supabase:', err);
        let msg = `خطأ في Supabase: ${err.message}`;

        if (err.message?.includes('foreign key constraint') || err.code === '23503') {
          msg = 'فشل الحفظ: العنوان الأساسي المختار غير موجود في جدول العناوين الأساسية (main_job_titles). يرجى التأكد من إضافة العنوان الأساسي أولاً.';
        } else if (err.message?.includes('unique_main_grade') || err.code === '23505') {
          msg = 'فشل الحفظ: تم تسجيل مسمى وظيفي مسبقاً لنفس الدرجة في هذا العنوان الأساسي!';
        }

        setErrorMessage(msg);
        if (showToast) {
          showToast(msg, 'error');
        }
        setIsSubmitting(false);
      }
    } else {
      // وضع الحفظ عبر السياق المحلي
      if (jobTitle && updateJobTitle) {
        await updateJobTitle(jobTitle.id, payload);
      } else if (addJobTitle) {
        await addJobTitle(payload);
      }
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobTitle ? 'تعديل العنوان الفرعي للدرجة' : 'إضافة مسمى وظيفي فرعي لدرجة'}
      subtitle="ربط المسمى الفرعي والدرجة بالعنوان الأساسي (main_job_title)"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* رسالة الخطأ العامة إن وجدت */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* العنوان الأساسي (main_title_id) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            العنوان الأساسي (main_title_id) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Layers className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              required
              value={formData.main_title_id}
              onChange={(e) => {
                setFormData({ ...formData, main_title_id: e.target.value });
                if (errors.main_title_id) {
                  setErrors((prev) => ({ ...prev, main_title_id: null }));
                }
              }}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-hidden focus:ring-2 ${
                errors.main_title_id
                  ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            >
              {mainTitles.length === 0 ? (
                <option value="">-- لا توجد عناوين أساسية مضافة --</option>
              ) : (
                mainTitles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </select>
          </div>
          {errors.main_title_id ? (
            <p className="text-xs text-rose-500 mt-1">{errors.main_title_id}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              اختر العنوان الوظيفي الأساسي الذي يتبع له هذا المسمى
            </p>
          )}
        </div>

        {/* الدرجة الوظيفية */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            الدرجة الوظيفية (grade) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Award className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* المسمى الوظيفي المعتمد للدرجة */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            المسمى الوظيفي المعتمد للدرجة (title_name) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="مثال: معاون صيدلي، مهندس أقدم، صيدلي ممارس..."
              value={formData.title_name}
              onChange={(e) => {
                setFormData({ ...formData, title_name: e.target.value });
                if (errors.title_name) {
                  setErrors((prev) => ({ ...prev, title_name: null }));
                }
              }}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                errors.title_name
                  ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            />
          </div>
          {errors.title_name && <p className="text-xs text-rose-500 mt-1">{errors.title_name}</p>}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mainTitles.length === 0}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الحفظ...' : jobTitle ? 'حفظ التعديلات' : 'إضافة المسمى'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JobTitleModal;
