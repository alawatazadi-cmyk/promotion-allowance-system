import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  Briefcase,
  PlusCircle,
  Search,
  Award,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  Layers,
  FolderPlus,
  ChevronDown,
  ChevronUp,
  Tag,
  Hash,
} from 'lucide-react';

// قائمة الدرجات الوظيفية المعتمدة
export const GRADES_LIST = [
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

// بيانات نموذجية للعناوين الأساسية
const defaultMainTitles = [
  { id: '10000000-0000-0000-0000-000000000001', name: 'صيدلي' },
  { id: '10000000-0000-0000-0000-000000000002', name: 'مهندس' },
  { id: '10000000-0000-0000-0000-000000000003', name: 'محاسب' },
  { id: '10000000-0000-0000-0000-000000000004', name: 'تقني إداري' },
];

// بيانات نموذجية للعناوين الفرعية حسب الدرجة
const defaultSubTitles = [
  // صيدلي
  { id: '20000000-0000-0000-0000-000000000001', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'معاون صيدلي', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000002', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'صيدلي', grade: 'الدرجة الرابعة' },
  { id: '20000000-0000-0000-0000-000000000003', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'صيدلي ممارس', grade: 'الدرجة الثالثة' },
  { id: '20000000-0000-0000-0000-000000000004', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'صيدلي أقدم', grade: 'الدرجة الثانية' },
  { id: '20000000-0000-0000-0000-000000000005', main_title_id: '10000000-0000-0000-0000-000000000001', title_name: 'رئيس صيادلة', grade: 'الدرجة الأولى' },

  // مهندس
  { id: '20000000-0000-0000-0000-000000000011', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'معاون مهندس', grade: 'الدرجة السابعة' },
  { id: '20000000-0000-0000-0000-000000000012', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'مهندس', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000013', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'مهندس ممارس', grade: 'الدرجة الرابعة' },
  { id: '20000000-0000-0000-0000-000000000014', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'مهندس أقدم', grade: 'الدرجة الثالثة' },
  { id: '20000000-0000-0000-0000-000000000015', main_title_id: '10000000-0000-0000-0000-000000000002', title_name: 'رئيس مهندسين أقدم', grade: 'الدرجة الأولى' },

  // محاسب
  { id: '20000000-0000-0000-0000-000000000021', main_title_id: '10000000-0000-0000-0000-000000000003', title_name: 'معاون محاسب', grade: 'الدرجة السابعة' },
  { id: '20000000-0000-0000-0000-000000000022', main_title_id: '10000000-0000-0000-0000-000000000003', title_name: 'محاسب', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000023', main_title_id: '10000000-0000-0000-0000-000000000003', title_name: 'محاسب رئيسي', grade: 'الدرجة الرابعة' },
  { id: '20000000-0000-0000-0000-000000000024', main_title_id: '10000000-0000-0000-0000-000000000003', title_name: 'مدقق حسابات أقدم', grade: 'الدرجة الثالثة' },

  // تقني إداري
  { id: '20000000-0000-0000-0000-000000000031', main_title_id: '10000000-0000-0000-0000-000000000004', title_name: 'مساعد إداري', grade: 'الدرجة السابعة' },
  { id: '20000000-0000-0000-0000-000000000032', main_title_id: '10000000-0000-0000-0000-000000000004', title_name: 'مسؤول موارد بشرية', grade: 'الدرجة الخامسة' },
  { id: '20000000-0000-0000-0000-000000000033', main_title_id: '10000000-0000-0000-0000-000000000004', title_name: 'مدير إدارة أقدم', grade: 'الدرجة الأولى' },
];

const JobTitles = () => {
  // 1. حالة العناوين الأساسية
  const [mainTitles, setMainTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_main_titles');
    return saved ? JSON.parse(saved) : defaultMainTitles;
  });

  // 2. حالة العناوين الفرعية حسب الدرجة
  const [subTitles, setSubTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_job_titles');
    return saved ? JSON.parse(saved) : defaultSubTitles;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);

  // حالات النوافذ المنبثقة
  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [editingMainTitle, setEditingMainTitle] = useState(null);
  const [mainFormData, setMainFormData] = useState({ name: '' });

  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSubTitle, setEditingSubTitle] = useState(null);
  const [subFormData, setSubFormData] = useState({
    main_title_id: '',
    title_name: '',
    grade: 'الدرجة الخامسة',
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // جلب البيانات من Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      // جلب العناوين الأساسية
      const { data: mains, error: mainErr } = await supabase
        .from('main_job_titles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!mainErr && mains && mains.length > 0) {
        setMainTitles(mains);
        localStorage.setItem('supabase_mock_main_titles', JSON.stringify(mains));
      }

      // جلب العناوين الفرعية حسب الدرجة
      const { data: subs, error: subErr } = await supabase
        .from('job_titles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!subErr && subs && subs.length > 0) {
        setSubTitles(subs);
        localStorage.setItem('supabase_mock_job_titles', JSON.stringify(subs));
      }
    } catch (err) {
      console.warn('تنبيه أثناء الاتصال بـ Supabase:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('supabase_mock_main_titles', JSON.stringify(mainTitles));
  }, [mainTitles]);

  useEffect(() => {
    localStorage.setItem('supabase_mock_job_titles', JSON.stringify(subTitles));
  }, [subTitles]);

  // ==========================================
  // دوال إدارة العناوين الأساسية (main_job_titles)
  // ==========================================
  const handleOpenMainModal = (main = null) => {
    if (main) {
      setEditingMainTitle(main);
      setMainFormData({ name: main.name });
    } else {
      setEditingMainTitle(null);
      setMainFormData({ name: '' });
    }
    setIsMainModalOpen(true);
  };

  const handleSaveMainTitle = async (e) => {
    e.preventDefault();
    if (!mainFormData.name.trim()) {
      notify('يرجى إدخال اسم العنوان الأساسي', 'error');
      return;
    }

    const payload = { name: mainFormData.name.trim() };

    if (isSupabaseConfigured()) {
      try {
        if (editingMainTitle) {
          const { error } = await supabase
            .from('main_job_titles')
            .update(payload)
            .eq('id', editingMainTitle.id);
          if (error) throw error;

          setMainTitles((prev) =>
            prev.map((m) => (m.id === editingMainTitle.id ? { ...m, ...payload } : m))
          );
          notify('تم تعديل العنوان الأساسي بنجاح');
        } else {
          const { data, error } = await supabase
            .from('main_job_titles')
            .insert([payload])
            .select()
            .single();
          if (error) throw error;

          if (data) {
            setMainTitles((prev) => [data, ...prev]);
          }
          notify('تمت إضافة العنوان الأساسي بنجاح');
        }
        setIsMainModalOpen(false);
      } catch (err) {
        notify(`خطأ في Supabase: ${err.message}`, 'error');
      }
    } else {
      // محلي
      if (editingMainTitle) {
        setMainTitles((prev) =>
          prev.map((m) => (m.id === editingMainTitle.id ? { ...m, ...payload } : m))
        );
        notify('تم تعديل العنوان الأساسي (محلياً)');
      } else {
        const newMain = {
          id: 'main_' + Date.now(),
          ...payload,
          created_at: new Date().toISOString(),
        };
        setMainTitles((prev) => [newMain, ...prev]);
        notify('تمت إضافة العنوان الأساسي بنجاح (محلياً)');
      }
      setIsMainModalOpen(false);
    }
  };

  const handleDeleteMainTitle = async (id, name) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف العنوان الأساسي "${name}"؟ سيتم حذف جميع العناوين الفرعية التابعة له!`
      )
    ) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('main_job_titles').delete().eq('id', id);
        if (error) throw error;
        setMainTitles((prev) => prev.filter((m) => m.id !== id));
        setSubTitles((prev) => prev.filter((s) => s.main_title_id !== id));
        notify('تم حذف العنوان الأساسي والعناوين الفرعية التابعة له بنجاح');
      } catch (err) {
        notify(`خطأ أثناء الحذف: ${err.message}`, 'error');
      }
    } else {
      setMainTitles((prev) => prev.filter((m) => m.id !== id));
      setSubTitles((prev) => prev.filter((s) => s.main_title_id !== id));
      notify('تم حذف العنوان الأساسي (محلياً)');
    }
  };

  // ==========================================
  // دوال إدارة العناوين الفرعية حسب الدرجة (job_titles)
  // ==========================================
  const handleOpenSubModal = (mainId = null, sub = null) => {
    if (sub) {
      setEditingSubTitle(sub);
      setSubFormData({
        main_title_id: sub.main_title_id,
        title_name: sub.title_name,
        grade: sub.grade,
      });
    } else {
      setEditingSubTitle(null);
      setSubFormData({
        main_title_id: mainId || (mainTitles[0] ? mainTitles[0].id : ''),
        title_name: '',
        grade: 'الدرجة الخامسة',
      });
    }
    setIsSubModalOpen(true);
  };

  const handleSaveSubTitle = async (e) => {
    e.preventDefault();
    if (!subFormData.main_title_id) {
      notify('يرجى اختيار العنوان الأساسي التابع له', 'error');
      return;
    }
    if (!subFormData.title_name.trim()) {
      notify('يرجى إدخال المسمى الوظيفي للدرجة', 'error');
      return;
    }

    const payload = {
      main_title_id: subFormData.main_title_id,
      title_name: subFormData.title_name.trim(),
      grade: subFormData.grade,
    };

    if (isSupabaseConfigured()) {
      try {
        if (editingSubTitle) {
          const { error } = await supabase
            .from('job_titles')
            .update(payload)
            .eq('id', editingSubTitle.id);
          if (error) throw error;

          setSubTitles((prev) =>
            prev.map((s) => (s.id === editingSubTitle.id ? { ...s, ...payload } : s))
          );
          notify('تم تعديل العنوان الفرعي بنجاح');
        } else {
          const { data, error } = await supabase
            .from('job_titles')
            .insert([payload])
            .select()
            .single();
          if (error) throw error;

          if (data) {
            setSubTitles((prev) => [data, ...prev]);
          }
          notify('تمت إضافة العنوان الفرعي للدرجة بنجاح');
        }
        setIsSubModalOpen(false);
      } catch (err) {
        notify(`خطأ في Supabase: ${err.message}`, 'error');
      }
    } else {
      // محلي
      if (editingSubTitle) {
        setSubTitles((prev) =>
          prev.map((s) => (s.id === editingSubTitle.id ? { ...s, ...payload } : s))
        );
        notify('تم تعديل العنوان الفرعي (محلياً)');
      } else {
        const newSub = {
          id: 'sub_' + Date.now(),
          ...payload,
          created_at: new Date().toISOString(),
        };
        setSubTitles((prev) => [newSub, ...prev]);
        notify('تمت إضافة العنوان الفرعي بنجاح (محلياً)');
      }
      setIsSubModalOpen(false);
    }
  };

  const handleDeleteSubTitle = async (id, titleName) => {
    if (!window.confirm(`هل أنت متأكد من حذف المسمى الفرعي "${titleName}"؟`)) {
      return;
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('job_titles').delete().eq('id', id);
        if (error) throw error;
        setSubTitles((prev) => prev.filter((s) => s.id !== id));
        notify('تم حذف العنوان الفرعي بنجاح');
      } catch (err) {
        notify(`خطأ أثناء الحذف: ${err.message}`, 'error');
      }
    } else {
      setSubTitles((prev) => prev.filter((s) => s.id !== id));
      notify('تم حذف العنوان الفرعي بنجاح (محلياً)');
    }
  };

  // فلترة العناوين الأساسية والفرعية بالبحث
  const filteredMainTitles = useMemo(() => {
    if (!searchQuery.trim()) return mainTitles;
    const q = searchQuery.toLowerCase();

    return mainTitles.filter((main) => {
      const matchMain = main.name && main.name.toLowerCase().includes(q);
      const hasMatchingSub = subTitles.some(
        (s) =>
          s.main_title_id === main.id &&
          ((s.title_name && s.title_name.toLowerCase().includes(q)) ||
            (s.grade && s.grade.toLowerCase().includes(q)))
      );
      return matchMain || hasMatchingSub;
    });
  }, [mainTitles, subTitles, searchQuery]);

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

      {/* الرأس وإجراءات الإضافة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            هيكلية العناوين والدرجات الوظيفية
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة العناوين الأساسية (مثل: صيدلي، مهندس) وربط العناوين الفرعية والمسميات حسب كل درجة وظيفية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleOpenMainModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-600/20 hover:shadow-md transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>إضافة عنوان أساسي</span>
          </button>

          <button
            onClick={() => handleOpenSubModal()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>إضافة مسمى فرعي لدرجة</span>
          </button>
        </div>
      </div>

      {/* شريط الإحصائيات السريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">إجمالي العناوين الأساسية</div>
            <div className="text-lg font-bold text-slate-800">{mainTitles.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">المسميات الفرعية المحددة للدرجات</div>
            <div className="text-lg font-bold text-slate-800">{subTitles.length}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">الربط الآلي</div>
            <div className="text-xs font-bold text-purple-700 mt-0.5">
              مفعّل في نموذج الموظفين وسجل الترفيعات
            </div>
          </div>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالعنوان الأساسي أو المسمى الفرعي أو الدرجة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* كروت العناوين الأساسية ومسميات الدرجات التابعة لها */}
      <div className="space-y-4">
        {filteredMainTitles.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">لا توجد عناوين وظيفية مطابقة للبحث</p>
          </div>
        ) : (
          filteredMainTitles.map((main) => {
            const relatedSubs = subTitles.filter((s) => s.main_title_id === main.id);

            return (
              <div
                key={main.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                {/* رأس الكرت: العنوان الأساسي */}
                <div className="p-4 sm:px-6 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {main.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{main.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800">
                          {relatedSubs.length} مسميات للدرجات
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">عنوان وظيفي أساسي (main_job_title)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenSubModal(main.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إضافة مسمى لدرجة</span>
                    </button>

                    <button
                      onClick={() => handleOpenMainModal(main)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
                      title="تعديل اسم العنوان الأساسي"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteMainTitle(main.id, main.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="حذف العنوان الأساسي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* جدول المسميات الفرعية الخاصة بهذا العنوان الأساسي */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white">
                        <th className="py-3 px-6">الدرجة الوظيفية</th>
                        <th className="py-3 px-6">المسمى الوظيفي المعتمد لهذه الدرجة</th>
                        <th className="py-3 px-6 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {relatedSubs.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-6 text-center text-xs text-slate-400">
                            لم تتم إضافة مسميات فرعية لدرجات هذا العنوان بعد. اضغط على "إضافة مسمى
                            لدرجة" لتحديد مسمى كل درجة.
                          </td>
                        </tr>
                      ) : (
                        relatedSubs.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* الدرجة الوظيفية */}
                            <td className="py-3.5 px-6">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/80">
                                <Award className="w-3.5 h-3.5 text-purple-600" />
                                <span>{sub.grade}</span>
                              </span>
                            </td>

                            {/* المسمى الوظيفي للدرجة */}
                            <td className="py-3.5 px-6">
                              <span className="font-bold text-slate-800">{sub.title_name}</span>
                            </td>

                            {/* الإجراءات */}
                            <td className="py-3.5 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenSubModal(main.id, sub)}
                                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                  title="تعديل المسمى"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubTitle(sub.id, sub.title_name)}
                                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  title="حذف المسمى"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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
            );
          })
        )}
      </div>

      {/* ========================================== */}
      {/* نافذة إضافة / تعديل عنوان أساسي (Modal) */}
      {/* ========================================== */}
      {isMainModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMainModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingMainTitle ? 'تعديل العنوان الأساسي' : 'إضافة عنوان أساسي جديد'}
              </h3>
              <button
                onClick={() => setIsMainModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMainTitle} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  اسم العنوان الأساسي (name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: صيدلي، مهندس، محاسب، باحث قانوني..."
                  value={mainFormData.name}
                  onChange={(e) => setMainFormData({ name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMainModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {editingMainTitle ? 'حفظ التعديلات' : 'إضافة العنوان الأساسي'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* نافذة إضافة / تعديل مسمى فرعي لدرجة (Modal) */}
      {/* ========================================== */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsSubModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingSubTitle ? 'تعديل مسمى الدرجة' : 'إضافة مسمى وظيفي لدرجة'}
              </h3>
              <button
                onClick={() => setIsSubModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubTitle} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  العنوان الأساسي (main_job_title) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={subFormData.main_title_id}
                  onChange={(e) =>
                    setSubFormData({ ...subFormData, main_title_id: e.target.value })
                  }
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
                  الدرجة الوظيفية (grade) <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={subFormData.grade}
                  onChange={(e) => setSubFormData({ ...subFormData, grade: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                >
                  {GRADES_LIST.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  المسمى الوظيفي المعتمد للدرجة (title_name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: معاون صيدلي، صيدلي، مهندس أقدم..."
                  value={subFormData.title_name}
                  onChange={(e) => setSubFormData({ ...subFormData, title_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  هذا المسمى سيتم جلبه واختياره تلقائياً للموظف عند تحديد هذه الدرجة والعنوان الأساسي
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                >
                  {editingSubTitle ? 'حفظ التعديلات' : 'إضافة المسمى'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTitles;
