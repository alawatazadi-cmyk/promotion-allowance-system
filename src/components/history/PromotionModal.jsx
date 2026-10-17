import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Award, TrendingUp, Calendar, DollarSign, FileText, User, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const PromotionModal = ({ isOpen, onClose, preselectedEmployeeId = null }) => {
  const { employees, jobTitles, addPromotionOrAllowance, formatCurrency } = useApp();

  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'علاوة سنوية', // 'علاوة سنوية' | 'ترفيع وظيفي'
    effective_date: new Date().toISOString().split('T')[0],
    old_salary: 0,
    new_salary: 0,
    increase_amount: 0,
    new_job_title_id: '',
    order_number: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // تحديث بيانات الموظف المختار
  useEffect(() => {
    if (!isOpen) return;

    const targetEmpId = preselectedEmployeeId || (employees[0] ? employees[0].id : '');
    const emp = employees.find((e) => e.id === targetEmpId);

    if (emp) {
      const currentSal = Number(emp.current_salary) || 0;
      // البحث عن مقدار العلاوة الموصى بها للعنوان الوظيفي
      const titleObj = jobTitles.find((t) => t.id === emp.job_title_id);
      const standardRate = titleObj ? Number(titleObj.allowance_rate) || 30000 : 30000;

      setFormData({
        employee_id: emp.id,
        type: 'علاوة سنوية',
        effective_date: new Date().toISOString().split('T')[0],
        old_salary: currentSal,
        new_salary: currentSal + standardRate,
        increase_amount: standardRate,
        new_job_title_id: emp.job_title_id || '',
        order_number: '',
        notes: 'استحقاق علاوة سنوية نظامية',
      });
    }
    setErrors({});
  }, [isOpen, preselectedEmployeeId, employees, jobTitles]);

  const selectedEmployee = employees.find((e) => e.id === formData.employee_id);

  // عند تغيير الموظف من القائمة
  const handleEmployeeChange = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const currentSal = Number(emp.current_salary) || 0;
    const titleObj = jobTitles.find((t) => t.id === emp.job_title_id);
    const standardRate = titleObj ? Number(titleObj.allowance_rate) || 30000 : 30000;

    setFormData((prev) => ({
      ...prev,
      employee_id: empId,
      old_salary: currentSal,
      new_salary: currentSal + (prev.type === 'علاوة سنوية' ? standardRate : standardRate * 2),
      increase_amount: prev.type === 'علاوة سنوية' ? standardRate : standardRate * 2,
      new_job_title_id: emp.job_title_id || '',
    }));
  };

  // عند تغيير نوع الاستحقاق (علاوة أو ترفيع)
  const handleTypeChange = (newType) => {
    const currentSal = Number(formData.old_salary) || 0;
    const titleObj = selectedEmployee ? jobTitles.find((t) => t.id === selectedEmployee.job_title_id) : null;
    const standardRate = titleObj ? Number(titleObj.allowance_rate) || 30000 : 30000;

    const inc = newType === 'علاوة سنوية' ? standardRate : standardRate * 2;
    setFormData((prev) => ({
      ...prev,
      type: newType,
      increase_amount: inc,
      new_salary: currentSal + inc,
      notes:
        newType === 'علاوة سنوية'
          ? 'استحقاق علاوة سنوية نظامية'
          : 'ترفيع وظيفي لاجتياز الشروط والمدة القانونية المقررة',
    }));
  };

  // عند تعديل مقدار الزيادة يدوياً
  const handleIncreaseChange = (incVal) => {
    const inc = Number(incVal) || 0;
    setFormData((prev) => ({
      ...prev,
      increase_amount: inc,
      new_salary: (Number(prev.old_salary) || 0) + inc,
    }));
  };

  // عند تعديل الراتب الجديد مباشرة
  const handleNewSalaryChange = (newSalVal) => {
    const sal = Number(newSalVal) || 0;
    const old = Number(formData.old_salary) || 0;
    setFormData((prev) => ({
      ...prev,
      new_salary: sal,
      increase_amount: sal - old,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = 'يرجى اختيار الموظف';
    if (!formData.effective_date) newErrors.effective_date = 'يرجى تحديد تاريخ الاستحقاق';
    if (!formData.new_salary || Number(formData.new_salary) <= 0) {
      newErrors.new_salary = 'يرجى تحديد الراتب الجديد بشكل صحيح';
    }
    if (Number(formData.new_salary) <= Number(formData.old_salary)) {
      newErrors.new_salary = 'يجب أن يكون الراتب الجديد أكبر من الراتب السابق';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await addPromotionOrAllowance({
      employee_id: formData.employee_id,
      type: formData.type,
      effective_date: formData.effective_date,
      old_salary: formData.old_salary,
      new_salary: formData.new_salary,
      new_job_title_id: formData.new_job_title_id,
      order_number: formData.order_number,
      notes: formData.notes,
    });
    setIsSubmitting(false);

    if (res.success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="إضافة استحقاق جديد (علاوة أو ترفيع)"
      subtitle="سيتم تسجيل القيد في السجل وتحديث راتب الموظف آلياً في جدول الموظفين"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* اختيار نوع الاستحقاق بأزرار عصرية */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">نوع الاستحقاق</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('علاوة سنوية')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                formData.type === 'علاوة سنوية'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>علاوة سنوية</span>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange('ترفيع وظيفي')}
              className={`flex items-center justify-center gap-2.5 p-3 rounded-xl border text-sm font-semibold transition-all ${
                formData.type === 'ترفيع وظيفي'
                  ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>ترفيع وظيفي (ترقية)</span>
            </button>
          </div>
        </div>

        {/* اختيار الموظف */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            الموظف المستحق <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={formData.employee_id}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — ({emp.job_title} | {formatCurrency(emp.current_salary)})
                </option>
              ))}
            </select>
          </div>
          {errors.employee_id && <p className="text-xs text-rose-500 mt-1">{errors.employee_id}</p>}
        </div>

        {/* بطاقة ملخص الموظف المختار */}
        {selectedEmployee && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-slate-400">العنوان الحالي: </span>
              <span className="font-semibold text-slate-700">{selectedEmployee.job_title}</span>
              <span className="text-slate-400 mr-3">الدرجة: </span>
              <span className="font-semibold text-slate-700">{selectedEmployee.grade}</span>
            </div>
            <div>
              <span className="text-slate-400">الراتب الحالي المسجل: </span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {formatCurrency(selectedEmployee.current_salary)}
              </span>
            </div>
          </div>
        )}

        {/* في حالة الترفيع: خيار تغيير العنوان والدرجة الوظيفية */}
        {formData.type === 'ترفيع وظيفي' && (
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
            <label className="block text-xs font-semibold text-amber-900 mb-1.5">
              ترقية إلى العنوان الوظيفي الجديد (اختياري)
            </label>
            <select
              value={formData.new_job_title_id}
              onChange={(e) => setFormData({ ...formData, new_job_title_id: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-amber-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-200"
            >
              <option value="">-- الإبقاء على نفس العنوان الوظيفي --</option>
              {jobTitles.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.grade})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-amber-700 mt-1">
              سيتم تحديث العنوان والدرجة الوظيفية لبطاقة الموظف تلقائياً عند حفظ الترفيع.
            </p>
          </div>
        )}

        {/* الراتب السابق ومقدار الزيادة والراتب الجديد */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
          {/* الراتب السابق */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">الراتب السابق</label>
            <div className="text-base font-bold text-slate-700 font-mono py-2">
              {formatCurrency(formData.old_salary)}
            </div>
          </div>

          {/* مقدار الزيادة */}
          <div>
            <label className="block text-xs font-semibold text-emerald-700 mb-1">
              مقدار الزيادة (د.ع) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <ArrowUpRight className="w-4 h-4 text-emerald-600 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                step="1000"
                min="1000"
                value={formData.increase_amount}
                onChange={(e) => handleIncreaseChange(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-emerald-300 text-sm font-mono font-semibold text-emerald-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
              />
            </div>
          </div>

          {/* الراتب الجديد الناتج */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">الراتب الجديد بعد التحديث</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                step="5000"
                value={formData.new_salary}
                onChange={(e) => handleNewSalaryChange(e.target.value)}
                className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
              />
            </div>
            {errors.new_salary && <p className="text-xs text-rose-500 mt-1">{errors.new_salary}</p>}
          </div>
        </div>

        {/* تاريخ الاستحقاق ورقم الأمر الإداري */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              تاريخ سريان الاستحقاق <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={formData.effective_date}
                onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
            {errors.effective_date && <p className="text-xs text-rose-500 mt-1">{errors.effective_date}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              رقم الأمر الإداري / المرجع
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="مثال: أ.إ/2026/89"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* الملاحظات */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">الملاحظات وسند المنح</label>
          <textarea
            rows="2"
            placeholder="ملاحظات توثيقية أو سند الاستحقاق..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        {/* إشعار التحديث الآلي */}
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl text-emerald-800 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            بمجرد الضغط على الحفظ، سيتم تحديث حقل <strong>الراتب الحالي</strong> في بطاقة الموظف فورياً
            إلى <strong>{formatCurrency(formData.new_salary)}</strong>.
          </span>
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
            {isSubmitting ? 'جاري التنفيذ...' : 'تسجيل الاستحقاق وتحديث الراتب'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PromotionModal;
