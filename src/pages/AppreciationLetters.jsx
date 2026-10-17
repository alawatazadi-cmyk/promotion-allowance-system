import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  FileCheck2,
  PlusCircle,
  Search,
  Calendar,
  Building,
  Users,
  UserCheck,
  FileText,
  Trash2,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Hash,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  Printer,
  Sparkles,
} from 'lucide-react';

// عينات بيانات أولية لكتب الشكر والتقدير للاختبار المحلي
const defaultEmployeesList = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    employee_number: 'EMP-1001',
    full_name: 'أحمد محمود العبدلي',
    department: 'تكنولوجيا المعلومات',
    job_titles: { title_name: 'مدير قسم تقنية المعلومات', grade: 'الدرجة الأولى' },
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    employee_number: 'EMP-1002',
    full_name: 'سارة حسين التميمي',
    department: 'تكنولوجيا المعلومات',
    job_titles: { title_name: 'مهندس برمجيات أقدم', grade: 'الدرجة الثالثة' },
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    employee_number: 'EMP-1003',
    full_name: 'حيدر كريم الجبوري',
    department: 'المالية والحسابات',
    job_titles: { title_name: 'محاسب رئيسي', grade: 'الدرجة الرابعة' },
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    employee_number: 'EMP-1004',
    full_name: 'نور صادق الخفاجي',
    department: 'الموارد البشرية',
    job_titles: { title_name: 'مسؤول موارد بشرية', grade: 'الدرجة الخامسة' },
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    employee_number: 'EMP-1005',
    full_name: 'عمر فاروق الحديثي',
    department: 'الشؤون الإدارية',
    job_titles: { title_name: 'مساعد إداري', grade: 'الدرجة السابعة' },
  },
];

const defaultLetters = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    letter_number: '104/وزاري/2024',
    letter_date: '2024-05-10',
    issuer: 'مكتب الوزير',
    notes: 'كتاب شكر وتقدير للجهود الاستثنائية في إنجاز الربط الشبكي الموحد (استحقاق قدم شهر)',
    created_at: '2024-05-10T09:00:00Z',
    selected_employees: [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        employee_number: 'EMP-1001',
        full_name: 'أحمد محمود العبدلي',
        department: 'تكنولوجيا المعلومات',
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        employee_number: 'EMP-1002',
        full_name: 'سارة حسين التميمي',
        department: 'تكنولوجيا المعلومات',
      },
    ],
  },
  {
    id: '66666666-6666-6666-6666-666666666662',
    letter_number: '452/د.ع/2024',
    letter_date: '2024-08-22',
    issuer: 'المدير العام',
    notes: 'شكر وتقدير للإشراف المالي المتميز وإغلاق الميزانية السنوية دون أي ملاحظات رقابية',
    created_at: '2024-08-22T10:30:00Z',
    selected_employees: [
      {
        id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        employee_number: 'EMP-1003',
        full_name: 'حيدر كريم الجبوري',
        department: 'المالية والحسابات',
      },
    ],
  },
];

const AppreciationLetters = () => {
  // حالة كتب الشكر المسجلة
  const [letters, setLetters] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_letters');
    return saved ? JSON.parse(saved) : defaultLetters;
  });

  // قائمة جميع الموظفين للاختيار منهم
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_employees');
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : defaultEmployeesList;
  });

  // النوافذ والبحث والتنبيهات
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLetterDetails, setSelectedLetterDetails] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedLetterId, setExpandedLetterId] = useState(null);

  // حالة نموذج إضافة كتاب شكر جديد
  const [formData, setFormData] = useState({
    letter_number: '',
    letter_date: new Date().toISOString().split('T')[0],
    issuer: '',
    notes: '',
  });

  // مصفوفة بمعرفات الموظفين المحددين في الكتاب (Multi-select)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. جلب كتب الشكر والموظفين المشمولين من قاعدة بيانات Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      // أ) جلب قائمة الموظفين مع العناوين الأساسية والفرعية
      const { data: empsData, error: empsError } = await supabase
        .from('employees')
        .select(`
          id,
          employee_number,
          full_name,
          department,
          job_stage,
          main_job_titles (
            id,
            name
          ),
          job_titles (
            id,
            title_name,
            grade
          )
        `)
        .order('full_name');

      if (!empsError && empsData && empsData.length > 0) {
        setEmployees(empsData);
      }

      // ب) جلب كتب الشكر مع الربط بجدول الموظفين المشمولين
      const { data: lettersData, error: lettersError } = await supabase
        .from('appreciation_letters')
        .select(`
          id,
          letter_number,
          letter_date,
          issuer,
          notes,
          created_at,
          letter_employees (
            id,
            employee_id,
            employees (
              id,
              employee_number,
              full_name,
              department,
              main_job_titles ( name ),
              job_titles ( title_name, grade )
            )
          )
        `)
        .order('letter_date', { ascending: false });

      if (lettersError) {
        console.warn('تنبيه أثناء جلب كتب الشكر من Supabase:', lettersError.message);
      } else if (lettersData) {
        // تحويل البيانات لتناسب العرض بسهولة
        const formattedLetters = lettersData.map((item) => {
          const list = (item.letter_employees || [])
            .map((le) => le.employees)
            .filter(Boolean);
          return {
            ...item,
            selected_employees: list,
          };
        });
        setLetters(formattedLetters);
        localStorage.setItem('supabase_mock_letters', JSON.stringify(formattedLetters));
      }
    } catch (err) {
      console.warn('تنبيه أثناء الاتصال بـ Supabase:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('supabase_mock_letters', JSON.stringify(letters));
  }, [letters]);

  // فتح نافذة إضافة كتاب جديد
  const handleOpenAddModal = () => {
    const nextNum = Math.floor(100 + Math.random() * 900);
    const curYear = new Date().getFullYear();
    setFormData({
      letter_number: `${nextNum}/ش.ت/${curYear}`,
      letter_date: new Date().toISOString().split('T')[0],
      issuer: 'مكتب الوزير',
      notes: 'كتاب شكر وتقدير للجهود المتميزة في إنجاز المهام الوظيفية الموكلة (قدم شهر)',
    });
    setSelectedEmployeeIds([]);
    setModalSearchQuery('');
    setIsAddModalOpen(true);
  };

  // اختيار أو إلغاء اختيار موظف
  const toggleEmployeeSelection = (empId) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  // تحديد الكل
  const handleSelectAllEmployees = () => {
    const allFilteredIds = filteredModalEmployees.map((e) => e.id);
    setSelectedEmployeeIds((prev) => {
      const merged = new Set([...prev, ...allFilteredIds]);
      return Array.from(merged);
    });
  };

  // إلغاء تحديد الكل
  const handleDeselectAllEmployees = () => {
    setSelectedEmployeeIds([]);
  };

  // حفظ كتاب الشكر والموظفين المشمولين
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.letter_number.trim()) {
      notify('يرجى إدخال رقم كتاب الشكر', 'error');
      return;
    }
    if (!formData.letter_date) {
      notify('يرجى تحديد تاريخ صدور الكتاب', 'error');
      return;
    }
    if (!formData.issuer.trim()) {
      notify('يرجى تحديد الجهة المصدرة للكتاب', 'error');
      return;
    }
    if (selectedEmployeeIds.length === 0) {
      notify('يرجى اختيار موظف واحد على الأقل مشمول بهذا الكتاب', 'error');
      return;
    }

    setIsSubmitting(true);

    const chosenEmployeesList = employees
      .filter((emp) => selectedEmployeeIds.includes(emp.id))
      .map((emp) => ({
        id: emp.id,
        employee_number: emp.employee_number,
        full_name: emp.full_name,
        department: emp.department,
      }));

    if (isSupabaseConfigured()) {
      try {
        // 1. إضافة الكتاب في جدول appreciation_letters
        const { data: newLetter, error: letterError } = await supabase
          .from('appreciation_letters')
          .insert([
            {
              letter_number: formData.letter_number.trim(),
              letter_date: formData.letter_date,
              issuer: formData.issuer.trim(),
              notes: formData.notes.trim() || null,
            },
          ])
          .select()
          .single();

        if (letterError) throw letterError;

        // 2. ربط الموظفين في جدول letter_employees
        const letterEmployeesPayload = selectedEmployeeIds.map((empId) => ({
          letter_id: newLetter.id,
          employee_id: empId,
        }));

        const { error: linkError } = await supabase
          .from('letter_employees')
          .insert(letterEmployeesPayload);

        if (linkError) throw linkError;

        const completeLetterObj = {
          ...newLetter,
          selected_employees: chosenEmployeesList,
        };

        setLetters((prev) => [completeLetterObj, ...prev]);
        notify(
          `تم حفظ كتاب الشكر بنجاح وربط ${selectedEmployeeIds.length} موظف(ين) به!`
        );
        setIsAddModalOpen(false);
      } catch (err) {
        notify(`خطأ أثناء الحفظ في Supabase: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // حفظ محلي
      const localLetter = {
        id: 'letter_' + Date.now(),
        letter_number: formData.letter_number.trim(),
        letter_date: formData.letter_date,
        issuer: formData.issuer.trim(),
        notes: formData.notes.trim() || null,
        created_at: new Date().toISOString(),
        selected_employees: chosenEmployeesList,
      };

      setLetters((prev) => [localLetter, ...prev]);
      notify(`تم حفظ كتاب الشكر بنجاح (حفظ محلي) وربط ${selectedEmployeeIds.length} موظف(ين)`);
      setIsAddModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // حذف كتاب شكر
  const handleDeleteLetter = async (id, letterNumber) => {
    if (!window.confirm(`هل أنت متأكد من حذف كتاب الشكر رقم: "${letterNumber}"؟`)) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        // حذف القيود من جدول الربط أولاً إن لم يكن كاسكيد
        await supabase.from('letter_employees').delete().eq('letter_id', id);
        const { error } = await supabase.from('appreciation_letters').delete().eq('id', id);

        if (error) throw error;
        setLetters((prev) => prev.filter((item) => item.id !== id));
        notify('تم حذف كتاب الشكر بنجاح');
      } catch (err) {
        notify(`خطأ أثناء الحذف: ${err.message}`, 'error');
      }
    } else {
      setLetters((prev) => prev.filter((item) => item.id !== id));
      notify('تم حذف كتاب الشكر بنجاح (محلياً)');
    }
  };

  // فلترة قائمة الموظفين في النافذة المنبثقة
  const filteredModalEmployees = useMemo(() => {
    if (!modalSearchQuery.trim()) return employees;
    const q = modalSearchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        (e.full_name && e.full_name.toLowerCase().includes(q)) ||
        (e.employee_number && e.employee_number.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
    );
  }, [employees, modalSearchQuery]);

  // فلترة كتب الشكر في الجدول الرئيسي
  const filteredLetters = useMemo(() => {
    if (!searchQuery.trim()) return letters;
    const q = searchQuery.toLowerCase();
    return letters.filter((l) => {
      const matchNum = l.letter_number && l.letter_number.toLowerCase().includes(q);
      const matchIssuer = l.issuer && l.issuer.toLowerCase().includes(q);
      const matchNotes = l.notes && l.notes.toLowerCase().includes(q);
      const matchEmployees =
        l.selected_employees &&
        l.selected_employees.some(
          (emp) =>
            (emp.full_name && emp.full_name.toLowerCase().includes(q)) ||
            (emp.employee_number && emp.employee_number.toLowerCase().includes(q))
        );
      return matchNum || matchIssuer || matchNotes || matchEmployees;
    });
  }, [letters, searchQuery]);

  // إحصائيات سريعة
  const totalEmployeesHonored = useMemo(() => {
    return letters.reduce((sum, l) => sum + (l.selected_employees?.length || 0), 0);
  }, [letters]);

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

      {/* الرأس وإحصائيات كتب الشكر */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              كتب الشكر والتقدير
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {letters.length} كتاب مسجل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            إدارة وتوثيق كتب الشكر والتقدير الوزارية والإدارية وربطها بالموظفين المشمولين
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة كتاب شكر جديد</span>
        </button>
      </div>

      {/* بطاقات المؤشرات الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">إجمالي كتب الشكر</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{letters.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">إجمالي الموظفين المكرمين</p>
            <h3 className="text-xl font-bold text-slate-800 mt-0.5">{totalEmployeesHonored}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">الأثر الوظيفي</p>
            <h3 className="text-sm font-bold text-slate-700 mt-1">
              تسريع العلاوات والترفيعات (قُدم)
            </h3>
          </div>
        </div>
      </div>

      {/* شريط البحث المباشر */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث برقم الكتاب، الجهة، أو اسم الموظف المشمول..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          النتائج المعروضة: <strong className="text-slate-800">{filteredLetters.length}</strong> من أصل {letters.length}
        </div>
      </div>

      {/* جدول عرض كتب الشكر والتقدير */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-5">رقم الكتاب</th>
                <th className="py-4 px-5">تاريخ الكتاب</th>
                <th className="py-4 px-5">الجهة المصدرة</th>
                <th className="py-4 px-6">الموظفون المشمولون</th>
                <th className="py-4 px-5 text-center">عدد المشمولين</th>
                <th className="py-4 px-6">ملاحظات</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileCheck2 className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-semibold text-slate-600">لا توجد كتب شكر مسجلة مطابقة للبحث</p>
                      <p className="text-xs text-slate-400 mt-1">
                        يمكنك إضافة كتاب شكر جديد وربطه بالموظفين المشمولين عبر الزر أعلاه
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => {
                  const empCount = letter.selected_employees?.length || 0;
                  const isExpanded = expandedLetterId === letter.id;

                  return (
                    <React.Fragment key={letter.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors group">
                        {/* رقم الكتاب */}
                        <td className="py-4 px-5 font-mono">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200/70">
                            <Hash className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{letter.letter_number}</span>
                          </div>
                        </td>

                        {/* تاريخ الكتاب */}
                        <td className="py-4 px-5 font-mono text-xs text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{letter.letter_date}</span>
                          </div>
                        </td>

                        {/* الجهة المصدرة */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                            <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{letter.issuer}</span>
                          </div>
                        </td>

                        {/* الموظفون المشمولون (عرض أولي سريع) */}
                        <td className="py-4 px-6 max-w-xs">
                          {empCount === 0 ? (
                            <span className="text-xs text-slate-400">لم يتم تحديد موظفين</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {letter.selected_employees.slice(0, 2).map((emp) => (
                                <span
                                  key={emp.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  <span className="font-semibold">{emp.full_name}</span>
                                  {emp.employee_number && (
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      ({emp.employee_number})
                                    </span>
                                  )}
                                </span>
                              ))}

                              {empCount > 2 && (
                                <button
                                  onClick={() =>
                                    setExpandedLetterId(isExpanded ? null : letter.id)
                                  }
                                  className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                >
                                  <span>+{empCount - 2} آخرين</span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </td>

                        {/* عدد الموظفين المشمولين */}
                        <td className="py-4 px-5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Users className="w-3 h-3" />
                            <span>{empCount} موظف</span>
                          </span>
                        </td>

                        {/* ملاحظات */}
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-xs truncate">
                          {letter.notes || '-'}
                        </td>

                        {/* الإجراءات */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedLetterDetails(letter)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="عرض تفاصيل الكتاب وقائمة الموظفين الكاملة"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteLetter(letter.id, letter.letter_number)
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف كتاب الشكر"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* الصف الموسّع للموظفين إذا كان عددهم أكبر من 2 وتم النقر عليه */}
                      {isExpanded && (
                        <tr className="bg-emerald-50/40 border-b border-emerald-100">
                          <td colSpan="7" className="p-4 px-8">
                            <div className="text-xs font-semibold text-emerald-900 mb-2 flex items-center gap-1.5">
                              <Users className="w-4 h-4 text-emerald-600" />
                              <span>جميع الموظفين المشمولين بهذا الكتاب ({empCount} موظف):</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                              {letter.selected_employees.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-emerald-200/80 shadow-2xs text-xs"
                                >
                                  <div className="font-semibold text-slate-800">
                                    {emp.full_name}
                                  </div>
                                  <div className="font-mono text-[11px] text-slate-500">
                                    {emp.employee_number || 'بدون رقم'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة إضافة كتاب شكر جديد (Modal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 animate-in zoom-in-95 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">إضافة كتاب شكر وتقدير</h3>
                  <p className="text-xs text-slate-500">
                    أدخل بيانات الكتاب وحدد الموظفين المشمولين لحفظهم في قاعدة البيانات
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pt-4 space-y-4 pr-1">
              {/* رقم الكتاب وتاريخه */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الكتاب (letter_number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 125/ش/2024"
                    value={formData.letter_number}
                    onChange={(e) =>
                      setFormData({ ...formData, letter_number: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تاريخ الكتاب (letter_date) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.letter_date}
                    onChange={(e) =>
                      setFormData({ ...formData, letter_date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* الجهة المصدرة */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الجهة المصدرة (issuer) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مكتب الوزير، الأمانة العامة لمجلس الوزراء، المدير العام"
                  value={formData.issuer}
                  onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>

              {/* ملاحظات الكتاب */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الملاحظات والتفاصيل (notes)
                </label>
                <textarea
                  rows="2"
                  placeholder="مثال: منح قدم شهر لأغراض العلاوة والترفيع استناداً لقانون انضباط موظفي الدولة"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>

              {/* قسم اختيار الموظفين المشمولين بالكتاب (Multi-select) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>الموظفون المشمولون بهذا الكتاب (letter_employees)</span>
                      <span className="text-rose-500">*</span>
                    </span>
                    <p className="text-[11px] text-slate-500">
                      حدد الموظفين عبر خانات الاختيار (Checkboxes)
                    </p>
                  </div>

                  {/* عداد التحديد وأزرار تحديد الكل */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                      تم تحديد: {selectedEmployeeIds.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllEmployees}
                      className="text-[11px] font-semibold text-emerald-700 hover:underline"
                    >
                      تحديد الكل
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={handleDeselectAllEmployees}
                      className="text-[11px] font-semibold text-slate-500 hover:underline"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>

                {/* حقل تصفية وبحث سريع في قائمة الموظفين */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الرقم الوظيفي لتحديد الموظف..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pr-8 pl-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
                  />
                </div>

                {/* قائمة الاختيار المتعدد مع التمرير */}
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100">
                  {filteredModalEmployees.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      لا يوجد موظف مطابق للبحث
                    </div>
                  ) : (
                    filteredModalEmployees.map((emp) => {
                      const isChecked = selectedEmployeeIds.includes(emp.id);

                      return (
                        <label
                          key={emp.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50 border border-emerald-200'
                              : 'bg-white hover:bg-slate-100/70 border border-slate-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEmployeeSelection(emp.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />

                          <div className="flex-1 flex items-center justify-between gap-2 text-xs">
                            <div>
                              <span className="font-bold text-slate-800">{emp.full_name}</span>
                              <span className="text-slate-400 mx-1.5">•</span>
                              <span className="text-slate-500">{emp.department || 'إداري'}</span>
                            </div>

                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {emp.employee_number || 'بدون رقم'}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>جاري الحفظ...</span>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>حفظ كتاب الشكر ({selectedEmployeeIds.length} موظف)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة عرض تفاصيل الكتاب والموظفين المشمولين بالكامل (View Modal) */}
      {selectedLetterDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedLetterDetails(null)}
          />

          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10 p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    تفاصيل كتاب الشكر والتقدير
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedLetterDetails.letter_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLetterDetails(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">الجهة المصدرة:</span>
                  <span className="font-bold text-slate-800 text-sm">
                    {selectedLetterDetails.issuer}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">تاريخ الكتاب:</span>
                  <span className="font-bold font-mono text-slate-800 text-sm">
                    {selectedLetterDetails.letter_date}
                  </span>
                </div>
              </div>

              {selectedLetterDetails.notes && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <span className="text-slate-500 block mb-1">الملاحظات:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedLetterDetails.notes}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>
                      قائمة الموظفين المشمولين (
                      {selectedLetterDetails.selected_employees?.length || 0}):
                    </span>
                  </h4>
                </div>

                <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {selectedLetterDetails.selected_employees &&
                  selectedLetterDetails.selected_employees.length > 0 ? (
                    selectedLetterDetails.selected_employees.map((emp, idx) => (
                      <div
                        key={emp.id || idx}
                        className="p-3 flex items-center justify-between text-xs hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{emp.full_name}</div>
                            <div className="text-[11px] text-slate-500">
                              {emp.department || 'إداري'}
                            </div>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {emp.employee_number || 'بدون رقم'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      لا يوجد موظفون مقيدون في هذا الكتاب
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedLetterDetails(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppreciationLetters;
