import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Briefcase, Award, DollarSign, TrendingUp } from 'lucide-react';

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

const JobTitleModal = ({ isOpen, onClose, jobTitle = null }) => {
  const { addJobTitle, updateJobTitle } = useApp();

  const [formData, setFormData] = useState({
    title: '',
    grade: 'الدرجة الرابعة',
    min_salary: '',
    max_salary: '',
    allowance_rate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (jobTitle) {
      setFormData({
        title: jobTitle.title || '',
        grade: jobTitle.grade || 'الدرجة الرابعة',
        min_salary: jobTitle.min_salary || '',
        max_salary: jobTitle.max_salary || '',
        allowance_rate: jobTitle.allowance_rate || '',
      });
    } else {
      setFormData({
        title: '',
        grade: 'الدرجة الرابعة',
        min_salary: 600000,
        max_salary: 1200000,
        allowance_rate: 35000,
      });
    }
    setErrors({});
  }, [jobTitle, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'يرجى إدخال مسمى العنوان الوظيفي';
    if (!formData.grade) newErrors.grade = 'يرجى اختيار الدرجة الوظيفية';
    if (!formData.min_salary || Number(formData.min_salary) <= 0) {
      newErrors.min_salary = 'يرجى إدخال الحد الأدنى للراتب';
    }
    if (!formData.max_salary || Number(formData.max_salary) < Number(formData.min_salary)) {
      newErrors.max_salary = 'الحد الأقصى للراتب يجب أن يكون مساوياً أو أكبر من الحد الأدنى';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    let res;
    if (jobTitle) {
      res = await updateJobTitle(jobTitle.id, formData);
    } else {
      res = await addJobTitle(formData);
    }
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={jobTitle ? 'تعديل العنوان الوظيفي' : 'إضافة عنوان وظيفي جديد'}
      subtitle="حدد المسمى الوظيفي والدرجة وسلم الرواتب والعلاوة السنوية"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* العنوان الوظيفي */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            العنوان الوظيفي <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="مثال: مهندس برمجيات رئيسي"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                errors.title
                  ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            />
          </div>
          {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
        </div>

        {/* الدرجة الوظيفية ومقدار العلاوة السنوية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الدرجة الوظيفية <span className="text-rose-500">*</span>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              العلاوة السنوية للدرجة (د.ع)
            </label>
            <div className="relative">
              <TrendingUp className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="مثال: 35000"
                value={formData.allowance_rate}
                onChange={(e) => setFormData({ ...formData, allowance_rate: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* سلم الرواتب: الحد الأدنى والحد الأقصى */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الحد الأدنى للراتب (د.ع) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="5000"
                required
                placeholder="مثال: 600000"
                value={formData.min_salary}
                onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 ${
                  errors.min_salary
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.min_salary && <p className="text-xs text-rose-500 mt-1">{errors.min_salary}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الحد الأقصى للراتب (د.ع) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="5000"
                required
                placeholder="مثال: 1200000"
                value={formData.max_salary}
                onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 ${
                  errors.max_salary
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.max_salary && <p className="text-xs text-rose-500 mt-1">{errors.max_salary}</p>}
          </div>
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
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'جاري الحفظ...' : jobTitle ? 'حفظ التعديلات' : 'إضافة العنوان'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default JobTitleModal;
