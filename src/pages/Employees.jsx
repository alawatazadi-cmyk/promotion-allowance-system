import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  Building2,
  X,
  AlertCircle,
  CheckCircle2,
  Hash,
  Layers,
  Award,
  Sparkles,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { GRADES_LIST } from './JobTitles';

// بيانات نموذجية متوافقة مع الهيكلية المحدثة
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

const defaultEmployees = [
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
    department: 'الصحة والسلامة',
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
    department: 'الشؤون الهندسية',
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
    department: 'المالية والحسابات',
    main_job_titles: { name: 'محاسب' },
    job_titles: { title_name: 'محاسب رئيسي', grade: 'الدرجة الرابعة' },
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    employee_number: 'EMP-1004',
    full_name: 'نور صادق الخفاجي',
    main_job_title_id: '10000000-0000-0000-0000-000000000004',
    job_title_id: '20000000-0000-0000-0000-000000000032',
    job_stage: 'المرحلة 1',
    hire_date: '2022-04-18',
    last_promotion_date: '',
    last_allowance_date: '2023-04-18',
    current_salary: 690000,
    department: 'الموارد البشرية',
    main_job_titles: { name: 'تقني إداري' },
    job_titles: { title_name: 'مسؤول موارد بشرية', grade: 'الدرجة الخامسة' },
  },
];

const STAGES = [
  'المرحلة 1',
  'المرحلة 2',
  'المرحلة 3',
  'المرحلة 4',
  'المرحلة 5',
  'المرحلة 6',
  'المرحلة 7',
  'المرحلة 8',
  'المرحلة 9',
  'المرحلة 10',
  'المرحلة 11',
];

const Employees = () => {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_employees');
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [mainTitles, setMainTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_main_titles');
    return saved ? JSON.parse(saved) : defaultMainTitles;
  });

  const [subTitles, setSubTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_job_titles');
    return saved ? JSON.parse(saved) : defaultSubTitles;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [notification, setNotification] = useState(null);

  // حالة نموذج الإضافة والتعديل بما يشمل تاريخ آخر علاوة وتاريخ آخر ترفيع
  const [formData, setFormData] = useState({
    employee_number: '',
    full_name: '',
    main_job_title_id: '',
    selected_grade: 'الدرجة الخامسة',
    job_title_id: '',
    job_stage: 'المرحلة 1',
    hire_date: new Date().toISOString().split('T')[0],
    last_promotion_date: '',
    last_allowance_date: '',
    current_salary: '',
    department: 'الشؤون الإدارية',
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // جلب البيانات من Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: mains } = await supabase.from('main_job_titles').select('*').order('name');
      if (mains && mains.length > 0) {
        setMainTitles(mains);
        localStorage.setItem('supabase_mock_main_titles', JSON.stringify(mains));
      }

      const { data: subs } = await supabase.from('job_titles').select('*');
      if (subs && subs.length > 0) {
        setSubTitles(subs);
        localStorage.setItem('supabase_mock_job_titles', JSON.stringify(subs));
      }

      const { data: emps, error: empsError } = await supabase
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
          department,
          created_at,
          main_job_titles ( id, name ),
          job_titles ( id, title_name, grade )
        `)
        .order('created_at', { ascending: false });

      if (!empsError && emps) {
        setEmployees(emps);
        localStorage.setItem('supabase_mock_employees', JSON.stringify(emps));
      }
    } catch (err) {
      console.warn('تنبيه أثناء الاتصال بـ Supabase:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('supabase_mock_employees', JSON.stringify(employees));
  }, [employees]);

  // قائمة المسميات الفرعية المتاحة بحسب العنوان الأساسي المختار
  const availableSubTitles = useMemo(() => {
    if (!formData.main_job_title_id) return subTitles;
    const filtered = subTitles.filter((s) => s.main_title_id === formData.main_job_title_id);
    return filtered.length > 0 ? filtered : subTitles;
  }, [formData.main_job_title_id, subTitles]);

  // المسمى الفرعي المختار حالياً
  const selectedSubTitle = useMemo(() => {
    return subTitles.find((s) => s.id === formData.job_title_id) || null;
  }, [formData.job_title_id, subTitles]);

  // تغيير العنوان الأساسي وتحديث قائمة العناوين الفرعية تلقائياً
  const handleMainTitleChange = (mainId) => {
    const filtered = subTitles.filter((s) => s.main_title_id === mainId);
    const firstSub = filtered.length > 0 ? filtered[0] : null;
    setFormData((prev) => ({
      ...prev,
      main_job_title_id: mainId,
      job_title_id: firstSub ? firstSub.id : '',
      selected_grade: firstSub ? firstSub.grade : '',
    }));
  };

  // تغيير العنوان الفرعي وتحديث الدرجة المرتبطة به تلقائياً
  const handleSubTitleChange = (subId) => {
    const found = subTitles.find((s) => s.id === subId);
    setFormData((prev) => ({
      ...prev,
      job_title_id: subId,
      selected_grade: found ? found.grade : '',
      main_job_title_id: found?.main_title_id || prev.main_job_title_id,
    }));
  };

  // فتح نافذة الإضافة أو التعديل
  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      const currentSub = subTitles.find((s) => s.id === employee.job_title_id);
      const currentGrade = currentSub?.grade || employee.job_titles?.grade || '';
      setFormData({
        employee_number: employee.employee_number || '',
        full_name: employee.full_name || '',
        main_job_title_id:
          employee.main_job_title_id || (mainTitles[0] ? mainTitles[0].id : ''),
        selected_grade: currentGrade,
        job_title_id: employee.job_title_id || '',
        job_stage: employee.job_stage || 'المرحلة 1',
        hire_date: employee.hire_date || '',
        last_promotion_date: employee.last_promotion_date || '',
        last_allowance_date: employee.last_allowance_date || '',
        current_salary: employee.current_salary || '',
        department: employee.department || 'الشؤون الإدارية',
      });
    } else {
      setEditingEmployee(null);
      const nextNum = employees.length + 1001;
      const initialMain = mainTitles[0] ? mainTitles[0].id : '';
      const initialSubs = subTitles.filter((s) => s.main_title_id === initialMain);
      const firstSub = initialSubs.length > 0 ? initialSubs[0] : (subTitles[0] || null);

      setFormData({
        employee_number: `EMP-${nextNum}`,
        full_name: '',
        main_job_title_id: initialMain,
        selected_grade: firstSub ? firstSub.grade : '',
        job_title_id: firstSub ? firstSub.id : '',
        job_stage: 'المرحلة 1',
        hire_date: new Date().toISOString().split('T')[0],
        last_promotion_date: '',
        last_allowance_date: '',
        current_salary: 650000,
        department: 'الشؤون الإدارية',
      });
    }
    setIsModalOpen(true);
  };

  // إرسال النموذج وحفظ الموظف
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name.trim()) {
      notify('يرجى إدخال اسم الموظف كاملاً', 'error');
      return;
    }
    if (!formData.main_job_title_id) {
      notify('يرجى اختيار العنوان الأساسي للموظف', 'error');
      return;
    }
    if (!formData.job_title_id) {
      notify('يرجى اختيار العنوان الفرعي للموظف', 'error');
      return;
    }
    if (!formData.current_salary || Number(formData.current_salary) <= 0) {
      notify('يرجى إدخال راتب صحيح', 'error');
      return;
    }

    const matchedMain = mainTitles.find((m) => m.id === formData.main_job_title_id);
    const matchedSub = subTitles.find((s) => s.id === formData.job_title_id);

    const payload = {
      employee_number: formData.employee_number ? formData.employee_number.trim() : null,
      full_name: formData.full_name.trim(),
      main_job_title_id: formData.main_job_title_id,
      job_title_id: formData.job_title_id,
      job_stage: formData.job_stage || 'المرحلة 1',
      hire_date: formData.hire_date,
      last_promotion_date: formData.last_promotion_date || null,
      last_allowance_date: formData.last_allowance_date || null,
      current_salary: Number(formData.current_salary),
      department: formData.department.trim(),
    };

    if (isSupabaseConfigured()) {
      try {
        if (editingEmployee) {
          const { error } = await supabase
            .from('employees')
            .update(payload)
            .eq('id', editingEmployee.id);

          if (error) throw error;

          setEmployees((prev) =>
            prev.map((emp) =>
              emp.id === editingEmployee.id
                ? {
                    ...emp,
                    ...payload,
                    main_job_titles: matchedMain,
                    job_titles: matchedSub,
                  }
                : emp
            )
          );
          notify('تم تعديل بيانات الموظف بنجاح');
        } else {
          const { data, error } = await supabase
            .from('employees')
            .insert([payload])
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
              department,
              created_at,
              main_job_titles ( id, name ),
              job_titles ( id, title_name, grade )
            `);

          if (error) throw error;
          if (data && data[0]) {
            setEmployees((prev) => [data[0], ...prev]);
          }
          notify('تمت إضافة الموظف بنجاح');
        }
        setIsModalOpen(false);
      } catch (err) {
        notify(`خطأ أثناء الحفظ في Supabase: ${err.message}`, 'error');
      }
    } else {
      // حفظ محلي
      if (editingEmployee) {
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === editingEmployee.id
              ? {
                  ...emp,
                  ...payload,
                  main_job_titles: matchedMain,
                  job_titles: matchedSub,
                }
              : emp
          )
        );
        notify('تم تعديل بيانات الموظف (حفظ محلي)');
      } else {
        const newEmp = {
          ...payload,
          id: 'emp_' + Date.now(),
          created_at: new Date().toISOString(),
          main_job_titles: matchedMain,
          job_titles: matchedSub,
        };
        setEmployees((prev) => [newEmp, ...prev]);
        notify('تمت إضافة الموظف بنجاح (حفظ محلي)');
      }
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف الموظف: "${name}"؟`)) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) throw error;
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        notify('تم حذف الموظف بنجاح');
      } catch (err) {
        notify(`خطأ أثناء الحذف: ${err.message}`, 'error');
      }
    } else {
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      notify('تم حذف الموظف بنجاح');
    }
  };

  // فلترة وبحث
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const numMatch = emp.employee_number && emp.employee_number.toLowerCase().includes(q);
      const nameMatch = emp.full_name && emp.full_name.toLowerCase().includes(q);
      const deptMatch = emp.department && emp.department.toLowerCase().includes(q);
      const stageMatch = emp.job_stage && emp.job_stage.toLowerCase().includes(q);
      const mainMatch =
        emp.main_job_titles?.name && emp.main_job_titles.name.toLowerCase().includes(q);
      const subMatch =
        emp.job_titles?.title_name && emp.job_titles.title_name.toLowerCase().includes(q);
      const gradeMatch =
        emp.job_titles?.grade && emp.job_titles.grade.toLowerCase().includes(q);

      return (
        numMatch || nameMatch || deptMatch || stageMatch || mainMatch || subMatch || gradeMatch
      );
    });
  }, [employees, searchQuery]);

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">سجل بيانات الموظفين</h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الكادر الوظيفي، العناوين الأساسية والفرعية، المرحلة، تواريخ آخر علاوة وترفيع، والراتب
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:shadow-md transition-all duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالاسم، الرقم الوظيفي، العنوان، الدرجة، أو القسم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          إجمالي الموظفين: <strong className="text-slate-800">{employees.length}</strong>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-4">الرقم الوظيفي</th>
                <th className="py-4 px-5">الاسم الكامل</th>
                <th className="py-4 px-5">العنوان الوظيفي الأساسي</th>
                <th className="py-4 px-5">العنوان الوظيفي الفرعي</th>
                <th className="py-4 px-4 text-center">الدرجة الوظيفية</th>
                <th className="py-4 px-4 text-center">المرحلة</th>
                <th className="py-4 px-4">تاريخ التعيين</th>
                <th className="py-4 px-4">تاريخ آخر علاوة</th>
                <th className="py-4 px-4">تاريخ آخر ترفيع</th>
                <th className="py-4 px-5">الراتب الحالي</th>
                <th className="py-4 px-4">القسم</th>
                <th className="py-4 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="12" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-semibold text-slate-600">لا يوجد موظفون مطابقون لبحثك</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* الرقم الوظيفي */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{emp.employee_number || 'غير محدد'}</span>
                      </span>
                    </td>

                    {/* الاسم الكامل */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 font-bold text-xs flex-shrink-0">
                          {emp.full_name ? emp.full_name.charAt(0) : 'م'}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                          {emp.full_name}
                        </span>
                      </div>
                    </td>

                    {/* العنوان الوظيفي الأساسي */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          {emp.main_job_titles?.name || '-'}
                        </span>
                      </div>
                    </td>

                    {/* العنوان الوظيفي الفرعي */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg inline-block">
                        {emp.job_titles?.title_name || '-'}
                      </span>
                    </td>

                    {/* الدرجة الوظيفية - عمود مستقل وبارز */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {emp.job_titles?.grade ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                          <Award className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>{emp.job_titles.grade}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs px-2 py-0.5 bg-slate-50 rounded border border-slate-100">
                          -
                        </span>
                      )}
                    </td>

                    {/* المرحلة الوظيفية */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
                        <Layers className="w-3 h-3 text-blue-500" />
                        <span>{emp.job_stage || 'المرحلة 1'}</span>
                      </span>
                    </td>

                    {/* تاريخ التعيين */}
                    <td className="py-4 px-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.hire_date}</span>
                      </div>
                    </td>

                    {/* تاريخ آخر علاوة */}
                    <td className="py-4 px-4 text-xs font-mono whitespace-nowrap">
                      {emp.last_allowance_date ? (
                        <div className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{emp.last_allowance_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">لم تسجل علاوة</span>
                      )}
                    </td>

                    {/* تاريخ آخر ترفيع */}
                    <td className="py-4 px-4 text-xs font-mono whitespace-nowrap">
                      {emp.last_promotion_date ? (
                        <div className="flex items-center gap-1 text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                          <TrendingUp className="w-3 h-3 text-purple-600" />
                          <span>{emp.last_promotion_date}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">لم يسجل ترفيع</span>
                      )}
                    </td>

                    {/* الراتب الحالي */}
                    <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatMoney(emp.current_salary)}
                    </td>

                    {/* القسم */}
                    <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.department || '-'}</span>
                      </div>
                    </td>

                    {/* الإجراءات */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="تعديل الموظف"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id, emp.full_name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الموظف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* Modal إضافة أو تعديل موظف مع كافة الحقول وتواريخ الاستحقاق */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* الرقم الوظيفي والاسم الكامل */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الرقم الوظيفي (employee_number)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: EMP-1001"
                    value={formData.employee_number}
                    onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الاسم الكامل (full_name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أحمد محمود العبدلي"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* اختيار العنوان الأساسي والعنوان الفرعي */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    العنوان الوظيفي الأساسي (main_job_title) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.main_job_title_id}
                    onChange={(e) => handleMainTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  >
                    <option value="">-- اختر العنوان الأساسي --</option>
                    {mainTitles.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    العنوان الوظيفي الفرعي (job_title) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.job_title_id}
                    onChange={(e) => handleSubTitleChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  >
                    <option value="">
                      {availableSubTitles.length === 0
                        ? '-- لا توجد مسميات فرعية لهذا العنوان --'
                        : '-- اختر العنوان الفرعي --'}
                    </option>
                    {availableSubTitles.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title_name} {s.grade ? `(${s.grade})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* معاينة الدرجة الوظيفية التلقائية بناءً على العنوان الفرعي المختار */}
              <div className="p-3.5 rounded-xl border border-purple-200/80 bg-purple-50/50">
                <div className="flex items-center justify-between text-xs font-semibold mb-1 text-purple-900">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>معاينة الدرجة الوظيفية المعتمدة للمسمى الفرعي:</span>
                  </span>
                  <span className="text-[11px] font-normal text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                    ربط تلقائي
                  </span>
                </div>

                {selectedSubTitle ? (
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-purple-200 shadow-2xs mt-1.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-slate-800">
                        {selectedSubTitle.title_name}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300/80">
                      <Award className="w-3.5 h-3.5 text-purple-700" />
                      <span>{selectedSubTitle.grade || 'غير محددة'}</span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-800 mt-1.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      {formData.main_job_title_id && availableSubTitles.length === 0
                        ? 'لا توجد مسميات فرعية مسجلة لهذا العنوان الأساسي. يرجى إضافتها من صفحة العناوين الوظيفية.'
                        : 'يرجى اختيار العنوان الأساسي والفرعي لعرض الدرجة الوظيفية المعتمدة تلقائياً.'}
                    </span>
                  </div>
                )}
              </div>

              {/* المرحلة والراتب الحالي */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    المرحلة الوظيفية (job_stage) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.job_stage}
                    onChange={(e) => setFormData({ ...formData, job_stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الراتب الحالي (current_salary) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5000"
                    placeholder="مثال: 750000"
                    value={formData.current_salary}
                    onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* تاريخ التعيين والقسم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تاريخ التعيين (hire_date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    القسم / الدائرة (department)
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: المالية، تكنولوجيا المعلومات..."
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* تواريخ آخر علاوة وآخر ترفيع */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تاريخ آخر علاوة (last_allowance_date)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.last_allowance_date}
                    onChange={(e) =>
                      setFormData({ ...formData, last_allowance_date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    يتم تحديثه آلياً عند تسجيل علاوة من سجل الاستحقاقات
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>تاريخ آخر ترفيع (last_promotion_date)</span>
                  </label>
                  <input
                    type="date"
                    value={formData.last_promotion_date}
                    onChange={(e) =>
                      setFormData({ ...formData, last_promotion_date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-200"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    يتم تحديثه آلياً عند تسجيل ترفيع من سجل الاستحقاقات
                  </p>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm"
                >
                  {editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
