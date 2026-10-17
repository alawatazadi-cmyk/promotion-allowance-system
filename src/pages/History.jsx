import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  Award,
  TrendingUp,
  PlusCircle,
  Search,
  Calendar,
  ArrowUpRight,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Sparkles,
  Clock,
} from 'lucide-react';
import { GRADES_LIST } from './JobTitles';

// بيانات أولية متوافقة
const defaultMainTitles = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'صيدلي' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'مهندس' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'محاسب' },
  { id: '10000000-0000-0000-0000-000000000004', name: 'تقني إداري' },
];

const defaultSubTitles = [
  { id: '20000000-0000-0000-0000-000000000001', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'معاون صيدلي', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000002', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'صيدلي', grade: 'الدرجة الرابعة' },
  { id: '20000000-0000-0000-0000-000000000003', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'صيدلي ممارس', grade: 'الدرجة الثالثة' },
  { id: '20000000-0000-0000-0000-000000000011', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'معاون مهندس', grade: 'الدرجة السابعة' },
  { id: '20000000-0000-0000-0000-000000000012', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'مهندس', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000014', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'مهندس أقدم', grade: 'الدرجة الثالثة' },
  { id: '20000000-0000-0000-0000-000000000023', main_title_id: '10000000-0000-0000-0000-000000000003', title_name: 'محاسب رئيسي', grade: 'الدرجة الرابعة' },
  { id: '20000000-0000-0000-0000-000000000032', main_title_id: '10000000-0000-0000-0000-000000000004', title_name: 'مسؤول موارد بشرية', grade: 'الدرجة الخامسة' },
];

const defaultEmployeesList = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    employee_number: 'EMP-1001',
    full_name: 'أحمد محمود العبدلي',
    main_job_title_id: '10000000-0000-0000-0000-000000000001',
    job_title_id: '20000000-0000-0000-0000-000000000002',
    job_stage: 'المرحلة 4',
    hire_date: '2019-03-15',
    last_promotion_date: '2022-03-15',
    last_allowance_date: '2024-03-15',
    current_salary: 1450000,
    main_job_titles: { name: 'صيدلي' },
    job_titles: { title_name: 'صيدلي', grade: 'الدرجة الرابعة' },
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    employee_number: 'EMP-1002',
    full_name: 'سارة حسين التميمي',
    main_job_title_id: '10000000-0000-0000-0000-000000000002',
    job_title_id: '20000000-0000-0000-0000-000000000014',
    job_stage: 'المرحلة 2',
    hire_date: '2020-07-01',
    last_promotion_date: '2024-07-01',
    last_allowance_date: '2023-07-01',
    current_salary: 1120000,
    main_job_titles: { name: 'مهندس' },
    job_titles: { title_name: 'مهندس أقدم', grade: 'الدرجة الثالثة' },
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    employee_number: 'EMP-1003',
    full_name: 'حيدر كريم الجبوري',
    main_job_title_id: '10000000-0000-0000-0000-000000000003',
    job_title_id: '20000000-0000-0000-0000-000000000023',
    job_stage: 'المرحلة 3',
    hire_date: '2021-01-10',
    last_promotion_date: '2023-01-10',
    last_allowance_date: '2024-01-10',
    current_salary: 890000,
    main_job_titles: { name: 'محاسب' },
    job_titles: { title_name: 'محاسب رئيسي', grade: 'الدرجة الرابعة' },
  },
];

const defaultHistory = [
  {
    id: '99999999-9999-9999-9999-999999999991',
    employee_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    type: 'علاوة',
    decision_date: '2024-03-15',
    previous_salary: 1400000,
    new_salary: 1450000,
    notes: 'أمر إداري رقم 118 / استحقاق سنوي دوري',
    employees: { employee_number: 'EMP-1001', full_name: 'أحمد محمود العبدلي' },
  },
  {
    id: '99999999-9999-9999-9999-999999999992',
    employee_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    type: 'ترفيع',
    decision_date: '2024-07-01',
    previous_salary: 1050000,
    new_salary: 1120000,
    notes: 'أمر إداري رقم 254 / ترفيع إلى الدرجة الثالثة (مهندس أقدم)',
    employees: { employee_number: 'EMP-1002', full_name: 'سارة حسين التميمي' },
  },
];

const History = () => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_history');
    return saved ? JSON.parse(saved) : defaultHistory;
  });

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_employees');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : defaultEmployeesList;
  });

  const [subTitles, setSubTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_job_titles');
    return saved ? JSON.parse(saved) : defaultSubTitles;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالة نموذج إضافة استحقاق
  const [formData, setFormData] = useState({
    employee_id: '',
    type: 'علاوة', // 'علاوة' أو 'ترفيع'
    decision_date: new Date().toISOString().split('T')[0],
    previous_salary: 0,
    new_salary: 0,
    target_grade: 'الدرجة الرابعة',
    target_stage: 'المرحلة 1',
    target_job_title_id: '',
    notes: '',
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // جلب البيانات من Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: subs } = await supabase.from('job_titles').select('*');
      if (subs && subs.length > 0) setSubTitles(subs);

      const { data: empsData } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          full_name,
          main_job_title_id,
          job_title_id,
          job_stage,
          hire_date,
          last_promotion_date,
          last_allowance_date,
          current_salary,
          main_job_titles ( id, name ),
          job_titles ( id, title_name, grade )
        `)
        .order('full_name');

      if (empsData && empsData.length > 0) {
        setEmployees(empsData);
      }

      const { data: histData, error: histError } = await supabase
        .from('allowances_promotions_history')
        .select(`
          id,
          employee_id,
          type,
          decision_date,
          previous_salary,
          new_salary,
          notes,
          created_at,
          employees (
            id,
            employee_number,
            full_name
          )
        `)
        .order('decision_date', { ascending: false });

      if (!histError && histData) {
        setHistory(histData);
        localStorage.setItem('supabase_mock_history', JSON.stringify(histData));
      }
    } catch (err) {
      console.warn('تنبيه أثناء جلب السجل:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('supabase_mock_history', JSON.stringify(history));
  }, [history]);

  const currentSelectedEmp = useMemo(() => {
    return employees.find((e) => e.id === formData.employee_id) || null;
  }, [employees, formData.employee_id]);

  // جلب المسمى الفرعي الجديد تلقائياً عند تغيير الدرجة في الترفيع
  const autoNewSubTitle = useMemo(() => {
    if (!currentSelectedEmp || formData.type !== 'ترفيع') return null;
    const mainId = currentSelectedEmp.main_job_title_id;
    return subTitles.find(
      (s) => s.main_title_id === mainId && s.grade === formData.target_grade
    );
  }, [currentSelectedEmp, formData.type, formData.target_grade, subTitles]);

  useEffect(() => {
    if (formData.type === 'ترفيع' && autoNewSubTitle) {
      setFormData((prev) => ({ ...prev, target_job_title_id: autoNewSubTitle.id }));
    }
  }, [formData.type, autoNewSubTitle]);

  const handleOpenModal = () => {
    const firstEmp = employees[0];
    const prevSal = firstEmp ? Number(firstEmp.current_salary) || 0 : 700000;
    const curGrade = firstEmp?.job_titles?.grade || 'الدرجة الخامسة';

    setFormData({
      employee_id: firstEmp ? firstEmp.id : '',
      type: 'علاوة',
      decision_date: new Date().toISOString().split('T')[0],
      previous_salary: prevSal,
      new_salary: prevSal + 35000,
      target_grade: curGrade,
      target_stage: firstEmp?.job_stage || 'المرحلة 1',
      target_job_title_id: firstEmp?.job_title_id || '',
      notes: 'أمر إداري رقم / استحقاق سنوي دوري',
    });
    setIsModalOpen(true);
  };

  const handleEmployeeChange = (empId) => {
    const selected = employees.find((e) => e.id === empId);
    if (!selected) return;

    const currentSal = Number(selected.current_salary) || 0;
    const isPromo = formData.type === 'ترفيع';
    const curGrade = selected.job_titles?.grade || 'الدرجة الخامسة';

    setFormData((prev) => ({
      ...prev,
      employee_id: empId,
      previous_salary: currentSal,
      new_salary: currentSal + (isPromo ? 70000 : 35000),
      target_grade: curGrade,
      target_stage: selected.job_stage || 'المرحلة 1',
      target_job_title_id: selected.job_title_id || '',
    }));
  };

  const handleTypeChange = (newType) => {
    const prevSal = Number(formData.previous_salary) || 0;
    let nextGrade = formData.target_grade;

    if (newType === 'ترفيع' && currentSelectedEmp?.job_titles?.grade) {
      const curGradeIdx = GRADES_LIST.indexOf(currentSelectedEmp.job_titles.grade);
      if (curGradeIdx > 0) nextGrade = GRADES_LIST[curGradeIdx - 1]; // الدرجة الأعلى
    }

    setFormData((prev) => ({
      ...prev,
      type: newType,
      new_salary: prevSal + (newType === 'علاوة' ? 35000 : 70000),
      target_grade: nextGrade,
      target_stage: newType === 'ترفيع' ? 'المرحلة 1' : prev.target_stage,
      notes:
        newType === 'علاوة'
          ? 'استحقاق علاوة سنوية دورية'
          : `ترفيع وظيفي إلى ${nextGrade}`,
    }));
  };

  const handleTargetGradeChange = (newGrade) => {
    const mainId = currentSelectedEmp?.main_job_title_id;
    const matched = subTitles.find((s) => s.main_title_id === mainId && s.grade === newGrade);

    setFormData((prev) => ({
      ...prev,
      target_grade: newGrade,
      target_job_title_id: matched ? matched.id : '',
      notes: `أمر إداري / ترفيع وظيفي إلى ${newGrade}${
        matched ? ` (${matched.title_name})` : ''
      }`,
    }));
  };

  // حفظ الاستحقاق مع تحديث الراتب وتاريخ آخر علاوة أو ترفيع تلقائياً
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employee_id) return notify('يرجى اختيار الموظف المستحق', 'error');
    if (Number(formData.new_salary) <= Number(formData.previous_salary)) {
      return notify('يجب أن يكون الراتب الجديد أكبر من الراتب السابق', 'error');
    }
    if (formData.type === 'ترفيع' && !formData.target_job_title_id) {
      return notify('لا يوجد مسمى فرعي محدد لهذه الدرجة في عنوان الموظف!', 'error');
    }

    setIsSubmitting(true);
    const newSalaryNum = Number(formData.new_salary);
    const prevSalaryNum = Number(formData.previous_salary);

    const historyPayload = {
      employee_id: formData.employee_id,
      type: formData.type,
      decision_date: formData.decision_date,
      previous_salary: prevSalaryNum,
      new_salary: newSalaryNum,
      notes: formData.notes.trim(),
    };

    // إعداد التحديث الآلي لجدول الموظفين
    const employeeUpdatePayload = {
      current_salary: newSalaryNum,
    };

    // أ) في حال العلاوة: تحديث تاريخ آخر علاوة
    if (formData.type === 'علاوة') {
      employeeUpdatePayload.last_allowance_date = formData.decision_date;
    }
    // ب) في حال الترفيع: تحديث تاريخ آخر ترفيع والمسمى والدرجة والمرحلة
    else if (formData.type === 'ترفيع') {
      employeeUpdatePayload.last_promotion_date = formData.decision_date;
      employeeUpdatePayload.job_title_id = formData.target_job_title_id;
      employeeUpdatePayload.job_stage = formData.target_stage || 'المرحلة 1';
    }

    if (isSupabaseConfigured()) {
      try {
        // 1. إضافة القيد في جدول سجل العلاوات والترفيعات
        const { data: insertedHistory, error: historyError } = await supabase
          .from('allowances_promotions_history')
          .insert([historyPayload])
          .select(`
            id,
            employee_id,
            type,
            decision_date,
            previous_salary,
            new_salary,
            notes,
            created_at,
            employees (
              id,
              employee_number,
              full_name
            )
          `);

        if (historyError) throw historyError;

        // 2. تحديث جدول الموظفين فوراً (الراتب + تواريخ آخر استحقاق + المسمى والدرجة)
        const { error: empUpdateError } = await supabase
          .from('employees')
          .update(employeeUpdatePayload)
          .eq('id', formData.employee_id);

        if (empUpdateError) throw empUpdateError;

        if (insertedHistory && insertedHistory[0]) {
          setHistory((prev) => [insertedHistory[0], ...prev]);
        }

        // تحديث حالة الموظفين المحلية
        const updatedEmployees = employees.map((emp) =>
          emp.id === formData.employee_id
            ? {
                ...emp,
                ...employeeUpdatePayload,
                job_titles:
                  formData.type === 'ترفيع' && autoNewSubTitle
                    ? autoNewSubTitle
                    : emp.job_titles,
              }
            : emp
        );

        setEmployees(updatedEmployees);
        localStorage.setItem('supabase_mock_employees', JSON.stringify(updatedEmployees));

        notify(
          `تم تسجيل الـ (${formData.type}) بنجاح وتحديث الراتب و${
            formData.type === 'علاوة' ? 'تاريخ آخر علاوة' : 'تاريخ آخر ترفيع والمسمى الوظيفي'
          } في جدول الموظفين!`
        );
        setIsModalOpen(false);
      } catch (err) {
        notify(`خطأ أثناء الحفظ: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // حفظ محلي
      const newHistoryItem = {
        ...historyPayload,
        id: 'hist_' + Date.now(),
        created_at: new Date().toISOString(),
        employees: {
          id: currentSelectedEmp?.id,
          employee_number: currentSelectedEmp?.employee_number,
          full_name: currentSelectedEmp?.full_name,
        },
      };

      setHistory((prev) => [newHistoryItem, ...prev]);

      const updatedEmployees = employees.map((emp) =>
        emp.id === formData.employee_id
          ? {
              ...emp,
              ...employeeUpdatePayload,
              job_titles:
                formData.type === 'ترفيع' && autoNewSubTitle
                  ? autoNewSubTitle
                  : emp.job_titles,
            }
          : emp
      );

      setEmployees(updatedEmployees);
      localStorage.setItem('supabase_mock_employees', JSON.stringify(updatedEmployees));

      notify(
        `تم حفظ الـ (${formData.type}) وتحديث الراتب وتواريخ الاستحقاق محلياً بنجاح!`
      );
      setIsModalOpen(false);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الاستحقاق من السجل؟')) return;

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('allowances_promotions_history')
          .delete()
          .eq('id', id);
        if (error) throw error;
        setHistory((prev) => prev.filter((h) => h.id !== id));
        notify('تم حذف الاستحقاق بنجاح');
      } catch (err) {
        notify(`خطأ أثناء الحذف: ${err.message}`, 'error');
      }
    } else {
      setHistory((prev) => prev.filter((h) => h.id !== id));
      notify('تم حذف الاستحقاق بنجاح (محلياً)');
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchType = typeFilter === 'ALL' || item.type === typeFilter;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (item.employees?.full_name && item.employees.full_name.toLowerCase().includes(q)) ||
        (item.employees?.employee_number &&
          item.employees.employee_number.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
  }, [history, typeFilter, searchQuery]);

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('ar-IQ') + ' د.ع';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 p-4 rounded-xl border bg-white shadow-xl animate-in fade-in slide-in-from-bottom-2">
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-slate-800">{notification.message}</span>
        </div>
      )}

      {/* الرأس */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            سجل العلاوات والترفيعات
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            توثيق الاستحقاقات الوظيفية مع التحديث التلقائي للراتب وتواريخ آخر علاوة أو ترفيع
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة استحقاق (علاوة / ترفيع)</span>
        </button>
      </div>

      {/* مؤشرات سريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">إجمالي الاستحقاقات</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{history.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">العلاوات السنوية الدورية</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">
              {history.filter((h) => h.type === 'علاوة').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">الترفيعات للدرجات الوظيفية</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">
              {history.filter((h) => h.type === 'ترفيع').length}
            </h3>
          </div>
        </div>
      </div>

      {/* الفلترة والبحث */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالاسم، الرقم الوظيفي، أو الملاحظات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'علاوة', 'ترفيع'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'ALL' ? 'الكل' : t}
            </button>
          ))}
        </div>
      </div>

      {/* جدول السجل */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">الموظف والرقم الوظيفي</th>
                <th className="py-4 px-5">نوع الاستحقاق</th>
                <th className="py-4 px-5">تاريخ القرار (تاريخ الاستحقاق)</th>
                <th className="py-4 px-5">الراتب السابق</th>
                <th className="py-4 px-5">الراتب الجديد</th>
                <th className="py-4 px-6">الملاحظات والأمر الإداري</th>
                <th className="py-4 px-5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <Award className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
                    <p className="font-semibold text-slate-600">لا توجد استحقاقات مسجلة مطابقة للبحث</p>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => {
                  const isPromo = item.type === 'ترفيع';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">
                          {item.employees?.full_name || 'موظف غير محدد'}
                        </div>
                        <span className="font-mono text-xs text-slate-500">
                          {item.employees?.employee_number || '-'}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                            isPromo
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isPromo ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingUp className="w-3.5 h-3.5" />
                          )}
                          <span>{item.type}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 font-mono text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.decision_date}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 font-mono text-slate-600 text-xs">
                        {formatMoney(item.previous_salary)}
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-emerald-700 text-xs">
                        {formatMoney(item.new_salary)}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                        {item.notes || '-'}
                      </td>

                      <td className="py-4 px-5 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف القيد"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal إضافة استحقاق مع التحديث الآلي لتواريخ الاستحقاق والراتب */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => !isSubmitting && setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                تسجيل استحقاق وظيفي جديد (علاوة أو ترفيع)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الموظف المستحق (employee) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-medium"
                >
                  <option value="">-- اختر الموظف المستحق --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_number || 'بدون رقم'}) —{' '}
                      {emp.main_job_titles?.name || 'عام'} (
                      {emp.job_titles?.grade || 'الدرجة'})
                    </option>
                  ))}
                </select>
              </div>

              {currentSelectedEmp && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">العنوان الأساسي والمسمى الحالي:</span>
                    <strong className="text-slate-800">
                      {currentSelectedEmp.main_job_titles?.name || 'غير محدد'} /{' '}
                      {currentSelectedEmp.job_titles?.title_name || 'بدون مسمى'} (
                      {currentSelectedEmp.job_titles?.grade || 'الدرجة غير محددة'})
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">تاريخ آخر علاوة مسجلة:</span>
                    <strong className="text-slate-700 font-mono">
                      {currentSelectedEmp.last_allowance_date || 'لم تسجل'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">تاريخ آخر ترفيع مسجل:</span>
                    <strong className="text-slate-700 font-mono">
                      {currentSelectedEmp.last_promotion_date || 'لم يسجل'}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">الراتب الحالي:</span>
                    <strong className="text-emerald-700 font-mono">
                      {formatMoney(currentSelectedEmp.current_salary)}
                    </strong>
                  </div>
                </div>
              )}

              {/* نوع الاستحقاق وتاريخ القرار */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    نوع الاستحقاق (type) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleTypeChange('علاوة')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.type === 'علاوة'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      علاوة سنوية
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTypeChange('ترفيع')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        formData.type === 'ترفيع'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      ترفيع وظيفي
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تاريخ القرار والاستحقاق <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.decision_date}
                    onChange={(e) =>
                      setFormData({ ...formData, decision_date: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    سيُحدّث تاريخ {formData.type === 'علاوة' ? 'آخر علاوة' : 'آخر ترفيع'} في جدول الموظفين بهذا التاريخ
                  </p>
                </div>
              </div>

              {/* قسم خاص بالترفيع: اختيار الدرجة وجلب المسمى الفرعي الجديد تلقائياً */}
              {formData.type === 'ترفيع' && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>الترقية إلى درجة جديدة وجلب المسمى تلقائياً</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        الدرجة الوظيفية الجديدة:
                      </label>
                      <select
                        value={formData.target_grade}
                        onChange={(e) => handleTargetGradeChange(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-purple-300 text-xs bg-white font-semibold text-purple-950 focus:outline-hidden"
                      >
                        {GRADES_LIST.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        المرحلة بعد الترفيع:
                      </label>
                      <select
                        value={formData.target_stage}
                        onChange={(e) =>
                          setFormData({ ...formData, target_stage: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                      >
                        <option value="المرحلة 1">المرحلة 1 (استحقاق الترفيع)</option>
                        <option value="المرحلة 2">المرحلة 2</option>
                        <option value="المرحلة 3">المرحلة 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-purple-200 text-xs">
                    <span className="text-slate-500 block mb-1">
                      المسمى الوظيفي الآلي المقابل للدرجة في العنوان الأساسي:
                    </span>
                    {autoNewSubTitle ? (
                      <div className="flex items-center gap-2 text-sm font-bold text-purple-900">
                        <span>{autoNewSubTitle.title_name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {autoNewSubTitle.grade}
                        </span>
                      </div>
                    ) : (
                      <span className="text-amber-700 font-semibold">
                        لم يتم تعريف مسمى فرعي لهذه الدرجة في هذا العنوان. يرجى إضافته من صفحة العناوين الوظيفية!
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* الراتب السابق والراتب الجديد */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الراتب السابق (previous_salary)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={formData.previous_salary}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm font-mono cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الراتب الجديد بعد الاستحقاق (new_salary) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={Number(formData.previous_salary) + 1}
                    step="5000"
                    value={formData.new_salary}
                    onChange={(e) =>
                      setFormData({ ...formData, new_salary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-emerald-50/40 text-emerald-900 text-sm font-mono font-bold"
                  />
                </div>
              </div>

              {/* الملاحظات */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الملاحظات ورقم الأمر الإداري (notes)
                </label>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري التحديث...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>حفظ الاستحقاق وتحديث سجل الموظف</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
