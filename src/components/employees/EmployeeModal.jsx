import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { User, Briefcase, Calendar, DollarSign, Phone, Mail, Building2, FileText, Award, Sparkles } from 'lucide-react';

const EmployeeModal = ({ isOpen, onClose, employee = null }) => {
  const { jobTitles, addEmployee, updateEmployee } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    job_title_id: '',
    job_title: '',
    grade: '',
    hire_date: new Date().toISOString().split('T')[0],
    current_salary: '',
    phone: '',
    email: '',
    department: 'الشؤون الإدارية',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        job_title_id: employee.job_title_id || (jobTitles[0] ? jobTitles[0].id : ''),
        job_title: employee.job_title || '',
        grade: employee.grade || '',
        hire_date: employee.hire_date || '',
        current_salary: employee.current_salary || '',
        phone: employee.phone || '',
        email: employee.email || '',
        department: employee.department || 'الشؤون الإدارية',
        notes: employee.notes || '',
      });
    } else {
      const defaultTitle = jobTitles[0];
      setFormData({
        name: '',
        job_title_id: defaultTitle ? defaultTitle.id : '',
        job_title: defaultTitle ? defaultTitle.title : '',
        grade: defaultTitle ? defaultTitle.grade : '',
        hire_date: new Date().toISOString().split('T')[0],
        current_salary: defaultTitle ? defaultTitle.min_salary : 500000,
        phone: '',
        email: '',
        department: 'الشؤون الإدارية',
        notes: '',
      });
    }
    setErrors({});
  }, [employee, jobTitles, isOpen]);

  // تحديث الدرجة تلقائياً عند تغيير العنوان الوظيفي
  const handleJobTitleChange = (e) => {
    const titleId = e.target.value;
    const selected = jobTitles.find((t) => t.id === titleId);
    setFormData((prev) => ({
      ...prev,
      job_title_id: titleId,
      job_title: selected ? selected.title : '',
      grade: selected ? selected.grade : '',
      current_salary: prev.current_salary || (selected ? selected.min_salary : ''),
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'يرجى إدخال اسم الموظف';
    if (!formData.hire_date) newErrors.hire_date = 'يرجى تحديد تاريخ التعيين';
    if (!formData.current_salary || Number(formData.current_salary) <= 0) {
      newErrors.current_salary = 'يرجى إدخال راتب صحيح أكبر من الصفر';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    let res;
    if (employee) {
      res = await updateEmployee(employee.id, formData);
    } else {
      res = await addEmployee(formData);
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
      title={employee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
      subtitle="أدخل بيانات الموظف الأساسية والعنوان الوظيفي والراتب"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* الاسم الكامل */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            الاسم الكامل للموظف <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="مثال: علي حسن عبد الله"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                errors.name
                  ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
              }`}
            />
          </div>
          {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
        </div>

        {/* العنوان والدرجة الوظيفية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              العنوان الوظيفي <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={formData.job_title_id}
                onChange={handleJobTitleChange}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
              >
                {jobTitles.map((title) => (
                  <option key={title.id} value={title.id}>
                    {title.title} ({title.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">الدرجة الوظيفية (معاينة آلية)</label>
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-purple-200 bg-purple-50/60 min-h-[42px]">
              <div className="flex items-center gap-1.5 text-xs text-purple-900 font-semibold">
                <Award className="w-4 h-4 text-purple-600" />
                <span>الدرجة:</span>
              </div>
              {formData.grade ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-purple-700 border border-purple-200 shadow-2xs">
                  {formData.grade}
                </span>
              ) : (
                <span className="text-xs text-slate-400">غير محدد</span>
              )}
            </div>
          </div>
        </div>

        {/* تاريخ التعيين والراتب الحالي */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تاريخ التعيين <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={formData.hire_date}
                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              الراتب الحالي (د.ع) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="0"
                step="5000"
                required
                placeholder="مثال: 750000"
                value={formData.current_salary}
                onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-hidden focus:ring-2 ${
                  errors.current_salary
                    ? 'border-rose-300 focus:ring-rose-200 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-emerald-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.current_salary && <p className="text-xs text-rose-500 mt-1">{errors.current_salary}</p>}
          </div>
        </div>

        {/* القسم والهاتف */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">القسم / الإدارة</label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="مثال: الموارد البشرية"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">رقم الهاتف</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="0770xxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* البريد الإلكتروني والملاحظات */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              placeholder="employee@domain.iq"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">ملاحظات إضافية</label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <textarea
              rows="2"
              placeholder="أي ملاحظات حول الموظف أو مؤهلاته..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
            />
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
            {isSubmitting ? 'جاري الحفظ...' : employee ? 'حفظ التعديلات' : 'إضافة الموظف'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EmployeeModal;
