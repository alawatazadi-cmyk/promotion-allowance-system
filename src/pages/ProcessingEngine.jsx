import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  Cpu,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Users,
  Briefcase,
  FileText,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  X,
  Layers,
  ChevronRight,
  Filter,
  CheckCheck,
  Building2,
  Hash,
  ShieldCheck,
} from 'lucide-react';
import { GRADES_LIST } from './JobTitles';

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

// دالة مساعدة لحساب المرحلة التالية
const getNextStage = (currentStage) => {
  if (!currentStage) return 'المرحلة 2';
  const idx = STAGES.indexOf(currentStage);
  if (idx !== -1 && idx < STAGES.length - 1) {
    return STAGES[idx + 1];
  }
  return currentStage;
};

// دالة لحساب الفرق بالشهور والأيام بين تاريخين
const getDateDifference = (fromDateStr, toDateStr) => {
  if (!fromDateStr) return { months: 0, days: 0, totalDays: 0 };
  const from = new Date(fromDateStr);
  const to = new Date(toDateStr);
  const diffTime = to - from;
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(totalDays / 30.4375);
  return { months, days: totalDays % 30, totalDays };
};

// دالة لإضافة شهور إلى تاريخ معين
const addMonthsToDate = (dateStr, monthsToAdd) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split('T')[0];
};

const ProcessingEngine = () => {
  const [activeTab, setActiveTab] = useState('ALLOWANCES'); // 'ALLOWANCES' | 'PROMOTIONS'

  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_employees');
    return saved ? JSON.parse(saved) : [];
  });

  const [mainTitles, setMainTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_main_titles');
    return saved ? JSON.parse(saved) : [];
  });

  const [subTitles, setSubTitles] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_job_titles');
    return saved ? JSON.parse(saved) : [];
  });

  const [letters, setLetters] = useState(() => {
    const saved = localStorage.getItem('supabase_mock_letters');
    return saved ? JSON.parse(saved) : [];
  });

  const [notification, setNotification] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // حالات النوافذ المنبثقة
  const [singleAllowanceModal, setSingleAllowanceModal] = useState(null);
  const [batchAllowanceModalOpen, setBatchAllowanceModalOpen] = useState(false);
  const [singlePromotionModal, setSinglePromotionModal] = useState(null);

  // حقول نموذج تنفيذ العلاوة الفردية
  const [allowanceForm, setAllowanceForm] = useState({
    increaseAmount: 35000,
    nextStage: 'المرحلة 2',
    decisionDate: new Date().toISOString().split('T')[0],
    orderNumber: '',
  });

  // حقول نموذج تنفيذ الترفيع الفردي
  const [promotionForm, setPromotionForm] = useState({
    targetGrade: 'الدرجة الرابعة',
    targetJobTitleId: '',
    targetStage: 'المرحلة 1',
    increaseAmount: 70000,
    decisionDate: new Date().toISOString().split('T')[0],
    orderNumber: '',
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // جلب البيانات من Supabase
  const fetchData = async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const { data: mains } = await supabase.from('main_job_titles').select('*');
      if (mains) setMainTitles(mains);

      const { data: subs } = await supabase.from('job_titles').select('*');
      if (subs) setSubTitles(subs);

      const { data: emps } = await supabase
        .from('employees')
        .select(`
          id, employee_number, full_name, main_job_title_id, job_title_id, job_stage, hire_date,
          last_promotion_date, last_allowance_date, current_salary, department, created_at,
          main_job_titles ( id, name ),
          job_titles ( id, title_name, grade )
        `)
        .order('full_name');

      if (emps) {
        setEmployees(emps);
        localStorage.setItem('supabase_mock_employees', JSON.stringify(emps));
      }

      // جلب كتب الشكر المربوطة بالموظفين لحساب القُدم
      const { data: lettersData } = await supabase
        .from('appreciation_letters')
        .select(`
          id, letter_number, letter_date, issuer, notes,
          letter_employees ( employee_id )
        `);

      if (lettersData) {
        setLetters(lettersData);
        localStorage.setItem('supabase_mock_letters', JSON.stringify(lettersData));
      }
    } catch (err) {
      console.warn('تنبيه أثناء الاتصال بـ Supabase:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // عدد كتب الشكر لكل موظف لحساب القُدم
  const employeeLettersCountMap = useMemo(() => {
    const map = {};
    letters.forEach((letter) => {
      if (letter.letter_employees && Array.isArray(letter.letter_employees)) {
        letter.letter_employees.forEach((le) => {
          if (le.employee_id) {
            map[le.employee_id] = (map[le.employee_id] || 0) + 1;
          }
        });
      } else if (letter.selected_employees && Array.isArray(letter.selected_employees)) {
        // للمحاكاة المحلية
        letter.selected_employees.forEach((emp) => {
          if (emp.id) {
            map[emp.id] = (map[emp.id] || 0) + 1;
          }
        });
      }
    });
    return map;
  }, [letters]);

  // =========================================================================
  // 1. حساب وتحليل استحقاق العلاوات السنوية
  // قانون الخدمة: العلاوة كل سنة واحدة (12 شهراً) من تاريخ آخر علاوة أو التعيين
  // =========================================================================
  const today = new Date().toISOString().split('T')[0];

  const allowancesAnalysis = useMemo(() => {
    return employees.map((emp) => {
      const baseDate = emp.last_allowance_date || emp.hire_date || today;
      // استحقاق العلاوة = تاريخ الأساس + 12 شهر
      const expectedDueDate = addMonthsToDate(baseDate, 12);
      const diff = getDateDifference(expectedDueDate, today);
      const isEligible = diff.totalDays >= 0; // حان موعدها أو فات موعدها

      return {
        employee: emp,
        baseDate,
        expectedDueDate,
        daysOverdue: diff.totalDays,
        isEligible,
        suggestedNextStage: getNextStage(emp.job_stage),
      };
    });
  }, [employees, today]);

  // الموظفون المستحقون للعلاوة الآن
  const eligibleForAllowance = useMemo(() => {
    return allowancesAnalysis
      .filter((item) => item.isEligible)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [allowancesAnalysis]);

  // =========================================================================
  // 2. حساب وتحليل استحقاق الترفيعات الوظيفية
  // الترفيع كل 4 سنوات (48 شهراً) مع خصم شهور القُدم الناتجة عن كتب الشكر
  // =========================================================================
  const promotionsAnalysis = useMemo(() => {
    return employees.map((emp) => {
      const baseDate = emp.last_promotion_date || emp.hire_date || today;
      const lettersCount = employeeLettersCountMap[emp.id] || 0;
      // كل كتاب شكر يمنح شهر قُدم يقلص المدة القانونية المطلوبة
      const acceleratedMonths = lettersCount * 1;
      const standardMonths = 48; // 4 سنوات
      const requiredMonths = Math.max(12, standardMonths - acceleratedMonths);

      const expectedDueDate = addMonthsToDate(baseDate, requiredMonths);
      const diff = getDateDifference(expectedDueDate, today);
      const isEligible = diff.totalDays >= 0;

      // حساب نسبة اكتمال المدة (Progress percentage)
      const daysElapsed = getDateDifference(baseDate, today).totalDays;
      const totalDaysRequired = requiredMonths * 30.4375;
      const progressPercent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDaysRequired) * 100)));

      // اقتراح الدرجة الأعلى تلقائياً
      const curGrade = emp.job_titles?.grade || 'الدرجة الخامسة';
      const curGradeIdx = GRADES_LIST.indexOf(curGrade);
      const targetGrade = curGradeIdx > 0 ? GRADES_LIST[curGradeIdx - 1] : curGrade;

      // المسمى الفرعي الآلي المقابل في العنوان الأساسي
      const matchedSub = subTitles.find(
        (s) => s.main_title_id === emp.main_job_title_id && s.grade === targetGrade
      );

      return {
        employee: emp,
        baseDate,
        lettersCount,
        acceleratedMonths,
        requiredMonths,
        expectedDueDate,
        daysOverdue: diff.totalDays,
        isEligible,
        progressPercent,
        currentGrade: curGrade,
        targetGrade,
        matchedSubTitle: matchedSub,
      };
    });
  }, [employees, employeeLettersCountMap, subTitles, today]);

  const eligibleForPromotion = useMemo(() => {
    return promotionsAnalysis
      .filter((item) => item.isEligible)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [promotionsAnalysis]);

  // =========================================================================
  // تنفيذ العلاوة الفردية
  // =========================================================================
  const handleOpenSingleAllowance = (item) => {
    setSingleAllowanceModal(item);
    setAllowanceForm({
      increaseAmount: 35000,
      nextStage: item.suggestedNextStage,
      decisionDate: today,
      orderNumber: `أمر إداري رقم ${Math.floor(100 + Math.random() * 900)} / استحقاق علاوة سنوية`,
    });
  };

  const handleExecuteSingleAllowance = async (e) => {
    e.preventDefault();
    if (!singleAllowanceModal) return;

    const emp = singleAllowanceModal.employee;
    const prevSalary = Number(emp.current_salary || 0);
    const newSalary = prevSalary + Number(allowanceForm.increaseAmount);

    setIsSubmitting(true);

    const historyPayload = {
      employee_id: emp.id,
      type: 'علاوة',
      decision_date: allowanceForm.decisionDate,
      previous_salary: prevSalary,
      new_salary: newSalary,
      notes: allowanceForm.orderNumber.trim(),
    };

    const updatePayload = {
      current_salary: newSalary,
      last_allowance_date: allowanceForm.decisionDate,
      job_stage: allowanceForm.nextStage,
    };

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('allowances_promotions_history').insert([historyPayload]);
        const { error } = await supabase.from('employees').update(updatePayload).eq('id', emp.id);
        if (error) throw error;

        setEmployees((prev) =>
          prev.map((item) => (item.id === emp.id ? { ...item, ...updatePayload } : item))
        );
        notify(`تم تنفيذ العلاوة بنجاح للموظف "${emp.full_name}" وتحديث الراتب والمرحلة!`);
        setSingleAllowanceModal(null);
      } catch (err) {
        notify(`خطأ أثناء التنفيذ: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // محلي
      const updated = employees.map((item) =>
        item.id === emp.id ? { ...item, ...updatePayload } : item
      );
      setEmployees(updated);
      localStorage.setItem('supabase_mock_employees', JSON.stringify(updated));
      notify(`تم تنفيذ العلاوة محلياً للموظف "${emp.full_name}" بنجاح!`);
      setSingleAllowanceModal(null);
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // تنفيذ العلاوات الجماعي لكافة المستحقين دفعة واحدة
  // =========================================================================
  const handleExecuteBatchAllowances = async () => {
    if (eligibleForAllowance.length === 0) return;
    setIsSubmitting(true);

    const orderNum = `أمر إداري جماعي رقم ${Math.floor(200 + Math.random() * 800)} / منح علاوة سنوية للمستحقين`;

    if (isSupabaseConfigured()) {
      try {
        for (const item of eligibleForAllowance) {
          const emp = item.employee;
          const prevSalary = Number(emp.current_salary || 0);
          const newSalary = prevSalary + 35000;
          const nextStage = item.suggestedNextStage;

          await supabase.from('allowances_promotions_history').insert([
            {
              employee_id: emp.id,
              type: 'علاوة',
              decision_date: today,
              previous_salary: prevSalary,
              new_salary: newSalary,
              notes: orderNum,
            },
          ]);

          await supabase
            .from('employees')
            .update({
              current_salary: newSalary,
              last_allowance_date: today,
              job_stage: nextStage,
            })
            .eq('id', emp.id);
        }

        await fetchData();
        notify(`تم تنفيذ العلاوة بنجاح لجميع الموظفين المستحقين (${eligibleForAllowance.length} موظف)!`);
        setBatchAllowanceModalOpen(false);
      } catch (err) {
        notify(`خطأ في المعالجة الجماعية: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // محلي
      const updated = employees.map((emp) => {
        const eligibleItem = eligibleForAllowance.find((it) => it.employee.id === emp.id);
        if (eligibleItem) {
          return {
            ...emp,
            current_salary: Number(emp.current_salary || 0) + 35000,
            last_allowance_date: today,
            job_stage: eligibleItem.suggestedNextStage,
          };
        }
        return emp;
      });

      setEmployees(updated);
      localStorage.setItem('supabase_mock_employees', JSON.stringify(updated));
      notify(`تم تنفيذ العلاوة الجماعية محلياً لـ (${eligibleForAllowance.length}) موظف!`);
      setBatchAllowanceModalOpen(false);
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // تنفيذ الترفيع الفردي
  // =========================================================================
  const handleOpenSinglePromotion = (item) => {
    setSinglePromotionModal(item);
    setPromotionForm({
      targetGrade: item.targetGrade,
      targetJobTitleId: item.matchedSubTitle ? item.matchedSubTitle.id : '',
      targetStage: 'المرحلة 1',
      increaseAmount: 70000,
      decisionDate: today,
      orderNumber: `أمر إداري رقم ${Math.floor(300 + Math.random() * 600)} / ترفيع إلى ${item.targetGrade}`,
    });
  };

  // عند تغيير الدرجة في نافذة الترفيع
  const handlePromotionGradeChange = (newGrade) => {
    const emp = singlePromotionModal?.employee;
    const matched = subTitles.find(
      (s) => s.main_title_id === emp?.main_job_title_id && s.grade === newGrade
    );
    setPromotionForm((prev) => ({
      ...prev,
      targetGrade: newGrade,
      targetJobTitleId: matched ? matched.id : '',
      orderNumber: `أمر إداري / ترفيع إلى ${newGrade}`,
    }));
  };

  const handleExecuteSinglePromotion = async (e) => {
    e.preventDefault();
    if (!singlePromotionModal) return;

    if (!promotionForm.targetJobTitleId) {
      notify('لا يوجد مسمى فرعي محدد لهذه الدرجة في عنوان الموظف!', 'error');
      return;
    }

    const emp = singlePromotionModal.employee;
    const prevSalary = Number(emp.current_salary || 0);
    const newSalary = prevSalary + Number(promotionForm.increaseAmount);

    setIsSubmitting(true);

    const historyPayload = {
      employee_id: emp.id,
      type: 'ترفيع',
      decision_date: promotionForm.decisionDate,
      previous_salary: prevSalary,
      new_salary: newSalary,
      notes: promotionForm.orderNumber.trim(),
    };

    const updatePayload = {
      current_salary: newSalary,
      last_promotion_date: promotionForm.decisionDate,
      job_title_id: promotionForm.targetJobTitleId,
      job_stage: promotionForm.targetStage,
    };

    const matchedSub = subTitles.find((s) => s.id === promotionForm.targetJobTitleId);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('allowances_promotions_history').insert([historyPayload]);
        const { error } = await supabase.from('employees').update(updatePayload).eq('id', emp.id);
        if (error) throw error;

        setEmployees((prev) =>
          prev.map((item) =>
            item.id === emp.id ? { ...item, ...updatePayload, job_titles: matchedSub } : item
          )
        );
        notify(`تم تنفيذ الترفيع بنجاح للموظف "${emp.full_name}" وترقيته إلى (${promotionForm.targetGrade})!`);
        setSinglePromotionModal(null);
      } catch (err) {
        notify(`خطأ أثناء الحفظ: ${err.message}`, 'error');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const updated = employees.map((item) =>
        item.id === emp.id ? { ...item, ...updatePayload, job_titles: matchedSub } : item
      );
      setEmployees(updated);
      localStorage.setItem('supabase_mock_employees', JSON.stringify(updated));
      notify(`تم تنفيذ الترفيع محلياً بنجاح!`);
      setSinglePromotionModal(null);
      setIsSubmitting(false);
    }
  };

  const formatMoney = (val) => Number(val || 0).toLocaleString('ar-IQ') + ' د.ع';

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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                محرك معالجة واحتساب الاستحقاقات
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                الكشف التلقائي عن الموظفين المستحقين للعلاوات والترفيعات، واحتساب القُدم وتنفيذ الترقية آلياً
              </p>
            </div>
          </div>
        </div>

        {/* أزرار الإجراء السريع */}
        {activeTab === 'ALLOWANCES' && eligibleForAllowance.length > 0 && (
          <button
            onClick={() => setBatchAllowanceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all"
          >
            <CheckCheck className="w-4 h-4" />
            <span>تنفيذ العلاوة للكل الجماعي ({eligibleForAllowance.length} مستحق)</span>
          </button>
        )}
      </div>

      {/* شريط المؤشرات الإحصائية العامة */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">المستحقون للعلاوة حالياً</div>
            <div className="text-lg font-bold text-slate-800">{eligibleForAllowance.length} موظف</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">المستحقون للترفيع حالياً</div>
            <div className="text-lg font-bold text-slate-800">{eligibleForPromotion.length} موظف</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">مستفيدون من قُدم كتب الشكر</div>
            <div className="text-lg font-bold text-slate-800">
              {Object.keys(employeeLettersCountMap).length} موظف
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">إجمالي كادر الموظفين</div>
            <div className="text-lg font-bold text-slate-800">{employees.length} موظف</div>
          </div>
        </div>
      </div>

      {/* أزرار التبويب (Tabs Navigation) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALLOWANCES')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'ALLOWANCES'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>تبويب معالجة العلاوات السنوية</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'ALLOWANCES'
                ? 'bg-white text-emerald-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {eligibleForAllowance.length} مستحق
          </span>
        </button>

        <button
          onClick={() => setActiveTab('PROMOTIONS')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'PROMOTIONS'
              ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>تبويب معالجة الترفيعات والدرجات</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'PROMOTIONS'
                ? 'bg-white text-purple-800'
                : 'bg-purple-100 text-purple-800'
            }`}
          >
            {eligibleForPromotion.length} مستحق
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. تبويب معالجة العلاوات (Allowances Processing Tab) */}
      {/* ========================================================================= */}
      {activeTab === 'ALLOWANCES' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                <strong>قاعدة الاحتساب الآلي:</strong> تُستحق العلاوة السنوية بعد مضي سنة واحدة (12 شهراً) من تاريخ آخر علاوة أو تاريخ التعيين، وتنقل الموظف إلى المرحلة التالية مع زيادة الراتب.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">الموظف والرقم الوظيفي</th>
                    <th className="py-4 px-5">العنوان والدرجة</th>
                    <th className="py-4 px-4">المرحلة الحالية</th>
                    <th className="py-4 px-5">الراتب الحالي</th>
                    <th className="py-4 px-5">تاريخ آخر علاوة / تعيين</th>
                    <th className="py-4 px-5">تاريخ الاستحقاق المتوقع</th>
                    <th className="py-4 px-4 text-center">حالة الاستحقاق</th>
                    <th className="py-4 px-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {allowancesAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        لا يوجد موظفون في النظام
                      </td>
                    </tr>
                  ) : (
                    allowancesAnalysis.map((item) => {
                      const emp = item.employee;

                      return (
                        <tr
                          key={emp.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            item.isEligible ? 'bg-emerald-50/20' : ''
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{emp.full_name}</div>
                            <span className="font-mono text-xs text-slate-500">
                              {emp.employee_number || '-'}
                            </span>
                          </td>

                          <td className="py-4 px-5">
                            <div className="text-xs font-semibold text-slate-800">
                              {emp.main_job_titles?.name || 'عام'} /{' '}
                              {emp.job_titles?.title_name || 'بدون مسمى'}
                            </div>
                            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              {emp.job_titles?.grade || '-'}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                              {emp.job_stage || 'المرحلة 1'}
                            </span>
                          </td>

                          <td className="py-4 px-5 font-mono font-bold text-slate-800 text-xs">
                            {formatMoney(emp.current_salary)}
                          </td>

                          <td className="py-4 px-5 font-mono text-xs text-slate-600">
                            {emp.last_allowance_date || emp.hire_date}
                          </td>

                          <td className="py-4 px-5 font-mono text-xs font-bold text-slate-800">
                            {item.expectedDueDate}
                          </td>

                          <td className="py-4 px-4 text-center">
                            {item.isEligible ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>مستحق الآن ({item.daysOverdue} يوم مضت)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>متبقي {Math.abs(item.daysOverdue)} يوم</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => handleOpenSingleAllowance(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 mx-auto ${
                                item.isEligible
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>تنفيذ العلاوة</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. تبويب معالجة الترفيعات (Promotions Processing Tab) */}
      {/* ========================================================================= */}
      {activeTab === 'PROMOTIONS' && (
        <div className="space-y-4">
          <div className="bg-purple-50/70 border border-purple-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <span>
                <strong>قاعدة الاحتساب الآلي للترفيع والقُدم:</strong> المدة القانونية القياسية للترفيع 4 سنوات (48 شهراً). يقوم النظام تلقائياً بفحص كتب الشكر المسجلة للموظف وخصم شهر قُدم عن كل كتاب لتقريب تاريخ الاستحقاق وترقية درجته ومسماه الوظيفي.
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-5">الموظف</th>
                    <th className="py-4 px-5">الدرجة والمسمى الحالي</th>
                    <th className="py-4 px-5">الدرجة والمسمى المستهدف</th>
                    <th className="py-4 px-4 text-center">كتب الشكر والقُدم</th>
                    <th className="py-4 px-5">تاريخ الاستحقاق المحسوب</th>
                    <th className="py-4 px-5 text-center">اكتمال المدة</th>
                    <th className="py-4 px-4 text-center">الحالة</th>
                    <th className="py-4 px-5 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {promotionsAnalysis.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center text-slate-400">
                        لا يوجد موظفون
                      </td>
                    </tr>
                  ) : (
                    promotionsAnalysis.map((item) => {
                      const emp = item.employee;

                      return (
                        <tr
                          key={emp.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            item.isEligible ? 'bg-purple-50/20' : ''
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{emp.full_name}</div>
                            <span className="font-mono text-xs text-slate-500">
                              {emp.employee_number}
                            </span>
                          </td>

                          {/* الدرجة والمسمى الحالي */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-800 text-xs">
                              {emp.job_titles?.title_name || 'غير محدد'}
                            </div>
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                              {item.currentGrade}
                            </span>
                          </td>

                          {/* الدرجة والمسمى المستهدف */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-purple-900 text-xs">
                              {item.matchedSubTitle?.title_name || 'مسمى غير معرف'}
                            </div>
                            <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full font-semibold inline-block mt-0.5">
                              {item.targetGrade}
                            </span>
                          </td>

                          {/* كتب الشكر والقُدم */}
                          <td className="py-4 px-4 text-center">
                            {item.lettersCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                <span>{item.lettersCount} كتب (قُدم {item.acceleratedMonths} شهر)</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">بدون قُدم</span>
                            )}
                          </td>

                          {/* تاريخ الاستحقاق المحسوب */}
                          <td className="py-4 px-5 font-mono text-xs font-bold text-slate-800">
                            {item.expectedDueDate}
                          </td>

                          {/* شريط نسبة اكتمال المدة القانونية */}
                          <td className="py-4 px-5 text-center min-w-[120px]">
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.isEligible ? 'bg-purple-600' : 'bg-blue-500'
                                }`}
                                style={{ width: `${item.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                              {item.progressPercent}%
                            </span>
                          </td>

                          {/* الحالة */}
                          <td className="py-4 px-4 text-center">
                            {item.isEligible ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                <span>مستحق للترفيع</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 font-medium">قيد المدة</span>
                            )}
                          </td>

                          {/* زر الإجراء */}
                          <td className="py-4 px-5 text-center">
                            <button
                              onClick={() => handleOpenSinglePromotion(item)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 mx-auto ${
                                item.isEligible
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              }`}
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              <span>تنفيذ الترفيع</span>
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal تنفيذ العلاوة الفردية */}
      {/* ========================================================================= */}
      {singleAllowanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSingleAllowanceModal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  تنفيذ العلاوة السنوية للموظف: {singleAllowanceModal.employee.full_name}
                </h3>
              </div>
              <button onClick={() => setSingleAllowanceModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSingleAllowance} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <div>الراتب الحالي: <strong>{formatMoney(singleAllowanceModal.employee.current_salary)}</strong></div>
                <div>المرحلة الحالية: <strong>{singleAllowanceModal.employee.job_stage}</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المرحلة الجديدة المستحقة</label>
                  <select
                    value={allowanceForm.nextStage}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, nextStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-bold text-emerald-800"
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">مقدار زيادة الراتب (د.ع)</label>
                  <input
                    type="number"
                    step="5000"
                    value={allowanceForm.increaseAmount}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, increaseAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-xl text-xs flex justify-between font-bold text-emerald-900">
                <span>الراتب الجديد بعد العلاوة:</span>
                <span className="font-mono">
                  {formatMoney(Number(singleAllowanceModal.employee.current_salary || 0) + Number(allowanceForm.increaseAmount))}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ القرار (تاريخ الاستحقاق)</label>
                  <input
                    type="date"
                    required
                    value={allowanceForm.decisionDate}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, decisionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الأمر الإداري</label>
                  <input
                    type="text"
                    value={allowanceForm.orderNumber}
                    onChange={(e) => setAllowanceForm({ ...allowanceForm, orderNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSingleAllowanceModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  تأكيد وتنفيذ العلاوة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal تنفيذ العلاوة الجماعي لكافة المستحقين */}
      {/* ========================================================================= */}
      {batchAllowanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setBatchAllowanceModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  تأكيد المعالجة والتنفيذ الجماعي للعلاوات ({eligibleForAllowance.length} موظف)
                </h3>
              </div>
              <button onClick={() => setBatchAllowanceModalOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                سيقوم النظام تلقائياً بتنفيذ العلاوة السنوية لجميع الموظفين المستحقين دفعة واحدة (+35,000 د.ع لكل موظف)، وترقيتهم إلى المرحلة التالية وتحديث تاريخ آخر علاوة والراتب فوراً في Supabase.
              </p>

              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {eligibleForAllowance.map((item, idx) => (
                  <div key={item.employee.id} className="p-2.5 text-xs flex justify-between items-center bg-slate-50/50">
                    <div>
                      <span className="font-bold text-slate-800">{item.employee.full_name}</span>
                      <span className="text-slate-400 mx-1.5">•</span>
                      <span className="text-slate-500">{item.employee.job_stage} &larr; {item.suggestedNextStage}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">
                      {formatMoney(Number(item.employee.current_salary || 0) + 35000)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBatchAllowanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs"
                >
                  تراجع
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleExecuteBatchAllowances}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  {isSubmitting ? 'جاري المعالجة...' : 'تأكيد التنفيذ الجماعي الآن'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* Modal تنفيذ الترفيع الفردي */}
      {/* ========================================================================= */}
      {singlePromotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSinglePromotionModal(null)} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">
                  تنفيذ الترفيع للموظف: {singlePromotionModal.employee.full_name}
                </h3>
              </div>
              <button onClick={() => setSinglePromotionModal(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSinglePromotion} className="mt-4 space-y-4">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
                <div>الدرجة والمسمى الحالي: <strong>{singlePromotionModal.employee.job_titles?.title_name} ({singlePromotionModal.currentGrade})</strong></div>
                <div>كتب الشكر الحاصل عليها: <strong>{singlePromotionModal.lettersCount} كتب (قُدم {singlePromotionModal.acceleratedMonths} شهر)</strong></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">الدرجة الوظيفية الجديدة</label>
                  <select
                    value={promotionForm.targetGrade}
                    onChange={(e) => handlePromotionGradeChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 text-xs bg-white font-bold text-purple-900"
                  >
                    {GRADES_LIST.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">المرحلة بعد الترفيع</label>
                  <select
                    value={promotionForm.targetStage}
                    onChange={(e) => setPromotionForm({ ...promotionForm, targetStage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="المرحلة 1">المرحلة 1 (استحقاق الترفيع)</option>
                    <option value="المرحلة 2">المرحلة 2</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="text-slate-500 block mb-1">المسمى الفرعي الآلي المعتمد للدرجة الجديدة:</span>
                {singlePromotionModal.matchedSubTitle ? (
                  <div className="text-sm font-bold text-purple-900">
                    {singlePromotionModal.matchedSubTitle.title_name} ({singlePromotionModal.matchedSubTitle.grade})
                  </div>
                ) : (
                  <span className="text-amber-700 font-semibold">لم يعرف مسمى لهذه الدرجة في عنوان الموظف!</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">مقدار الزيادة المقررة (د.ع)</label>
                  <input
                    type="number"
                    step="5000"
                    value={promotionForm.increaseAmount}
                    onChange={(e) => setPromotionForm({ ...promotionForm, increaseAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">تاريخ القرار</label>
                  <input
                    type="date"
                    required
                    value={promotionForm.decisionDate}
                    onChange={(e) => setPromotionForm({ ...promotionForm, decisionDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">رقم الأمر الإداري</label>
                <input
                  type="text"
                  value={promotionForm.orderNumber}
                  onChange={(e) => setPromotionForm({ ...promotionForm, orderNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSinglePromotionModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                >
                  تأكيد وتنفيذ الترفيع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingEngine;
