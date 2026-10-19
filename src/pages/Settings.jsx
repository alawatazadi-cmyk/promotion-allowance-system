import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import {
  Settings as SettingsIcon,
  Award,
  Building,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
  Search,
  X,
  FileCheck2,
  Layers,
  ArrowRight,
  Database,
  Calendar,
  Hash,
  ShieldCheck,
} from 'lucide-react';

// الجهات المصدرة الافتراضية وفق القوانين والتعليمات الإدارية المعتمدة
export const DEFAULT_APPRECIATION_SETTINGS = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    issuer_name: 'مكتب رئيس الوزراء',
    reduction_months: 6,
    max_allowed_letters: 1,
    validity_months: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    issuer_name: 'مكتب الوزير',
    reduction_months: 6,
    max_allowed_letters: 1,
    validity_months: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000003',
    issuer_name: 'وكيل الوزارة',
    reduction_months: 3,
    max_allowed_letters: 2,
    validity_months: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000004',
    issuer_name: 'المحافظ',
    reduction_months: 3,
    max_allowed_letters: 2,
    validity_months: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '50000000-0000-0000-0000-000000000005',
    issuer_name: 'المدير العام',
    reduction_months: 1,
    max_allowed_letters: 2,
    validity_months: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const Settings = () => {
  const isConnected = isSupabaseConfigured();

  // خيار وضع الاحتساب: 'unified' (الاعتماد الموحد) أو 'custom' (التخصيص حسب الجهة المصدرة)
  const [calculationMode, setCalculationMode] = useState(() => {
    return localStorage.getItem('alawat_appreciation_mode') || 'custom';
  });

  // عدد أشهر القدَم في الاعتماد الموحد
  const [unifiedMonths, setUnifiedMonths] = useState(() => {
    const saved = localStorage.getItem('alawat_unified_months');
    return saved ? Number(saved) : 1;
  });

  // الحد الأقصى العام للكتب في الاعتماد الموحد (اختياري)
  const [unifiedMaxAllowedLetters, setUnifiedMaxAllowedLetters] = useState(() => {
    const saved = localStorage.getItem('alawat_unified_max_letters');
    return saved !== null && saved !== undefined ? saved : '';
  });

  // المدة المقبولة / صلاحية الكتاب العامة بالأشهر (اختياري)
  const [unifiedValidityMonths, setUnifiedValidityMonths] = useState(() => {
    const saved = localStorage.getItem('alawat_unified_validity_months');
    return saved !== null && saved !== undefined ? saved : '';
  });

  // قائمة الجهات المصدرة المخصصة
  const [settingsList, setSettingsList] = useState(() => {
    const saved = localStorage.getItem('alawat_appreciation_settings');
    return saved ? JSON.parse(saved) : DEFAULT_APPRECIATION_SETTINGS;
  });

  // مؤشرات التحميل والرسائل المنبثقة
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // حالات النوافذ المنبثقة (إضافة / تعديل / حذف)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  // حقول نموذج الإضافة والتعديل
  const [formData, setFormData] = useState({
    issuer_name: '',
    reduction_months: 1,
    max_allowed_letters: '',
    validity_months: '',
  });

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // 1. جلب الإعدادات من Supabase عند التحميل
  const fetchSettings = async () => {
    if (!isConnected) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('appreciation_settings')
        .select('*')
        .order('reduction_months', { ascending: false });

      if (error) {
        console.warn('تنبيه أثناء قراءة جدول appreciation_settings:', error.message);
        return;
      }

      if (data && data.length > 0) {
        // فحص وجود سجل التهيئة العامة والوضع المعتمد
        const modeRow = data.find((item) => item.issuer_name === '__CALC_MODE__');
        const configRow = data.find((item) => item.issuer_name === '__APP_CONFIG__');
        const customIssuers = data.filter(
          (item) => item.issuer_name !== '__APP_CONFIG__' && item.issuer_name !== '__CALC_MODE__'
        );

        if (modeRow) {
          const loadedMode = modeRow.reduction_months === 1 ? 'custom' : 'unified';
          setCalculationMode(loadedMode);
          localStorage.setItem('alawat_appreciation_mode', loadedMode);
        } else if (localStorage.getItem('alawat_appreciation_mode')) {
          setCalculationMode(localStorage.getItem('alawat_appreciation_mode'));
        } else if (configRow && configRow.max_allowed_letters === 1) {
          setCalculationMode('custom');
        }

        if (configRow) {
          setUnifiedMonths(configRow.reduction_months || 1);
          localStorage.setItem('alawat_unified_months', String(configRow.reduction_months || 1));

          if (configRow.validity_months !== undefined && configRow.validity_months !== null) {
            setUnifiedValidityMonths(String(configRow.validity_months));
            localStorage.setItem('alawat_unified_validity_months', String(configRow.validity_months));
          } else {
            setUnifiedValidityMonths('');
            localStorage.removeItem('alawat_unified_validity_months');
          }

          if (configRow.max_allowed_letters !== undefined && configRow.max_allowed_letters !== null) {
            setUnifiedMaxAllowedLetters(String(configRow.max_allowed_letters));
            localStorage.setItem('alawat_unified_max_letters', String(configRow.max_allowed_letters));
          } else {
            setUnifiedMaxAllowedLetters('');
            localStorage.removeItem('alawat_unified_max_letters');
          }
        }

        if (customIssuers.length > 0) {
          setSettingsList(customIssuers);
          localStorage.setItem('alawat_appreciation_settings', JSON.stringify(customIssuers));
        }
      }
    } catch (err) {
      console.error('خطأ غير متوقع أثناء جلب الإعدادات:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [isConnected]);

  // حفظ التغييرات في localStorage بشكل فوري لضمان الاستمرارية
  useEffect(() => {
    localStorage.setItem('alawat_appreciation_mode', calculationMode);
  }, [calculationMode]);

  useEffect(() => {
    localStorage.setItem('alawat_unified_months', String(unifiedMonths));
  }, [unifiedMonths]);

  useEffect(() => {
    localStorage.setItem('alawat_unified_max_letters', String(unifiedMaxAllowedLetters || ''));
  }, [unifiedMaxAllowedLetters]);

  useEffect(() => {
    localStorage.setItem('alawat_unified_validity_months', String(unifiedValidityMonths || ''));
  }, [unifiedValidityMonths]);

  useEffect(() => {
    localStorage.setItem('alawat_appreciation_settings', JSON.stringify(settingsList));
  }, [settingsList]);

  // 2. حفظ خيار وضع الاحتساب العام (الاعتماد الموحد مقابل التخصيص)
  const handleSaveMode = async (
    newMode,
    newUnifiedMonths = unifiedMonths,
    newMaxLetters = unifiedMaxAllowedLetters,
    newValidity = unifiedValidityMonths
  ) => {
    setCalculationMode(newMode);
    setUnifiedMonths(newUnifiedMonths);
    setUnifiedMaxAllowedLetters(newMaxLetters);
    setUnifiedValidityMonths(newValidity);

    localStorage.setItem('alawat_appreciation_mode', newMode);
    localStorage.setItem('alawat_unified_months', String(newUnifiedMonths));
    localStorage.setItem('alawat_unified_max_letters', String(newMaxLetters || ''));
    localStorage.setItem('alawat_unified_validity_months', String(newValidity || ''));

    if (isConnected) {
      try {
        await supabase.from('appreciation_settings').upsert(
          {
            issuer_name: '__CALC_MODE__',
            reduction_months: newMode === 'custom' ? 1 : 0,
            max_allowed_letters: null,
            validity_months: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'issuer_name' }
        );

        await supabase.from('appreciation_settings').upsert(
          {
            issuer_name: '__APP_CONFIG__',
            reduction_months: Number(newUnifiedMonths) || 1,
            max_allowed_letters: newMaxLetters ? Number(newMaxLetters) : null,
            validity_months: newValidity ? Number(newValidity) : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'issuer_name' }
        );
      } catch (err) {
        console.warn('تعذر حفظ وضع التهيئة العامة في Supabase:', err.message);
      }
    }

    notify(
      newMode === 'unified'
        ? `تم حفظ وتفعيل خيار الاعتماد الموحد (${newUnifiedMonths} شهر لكل كتاب شكر)`
        : 'تم تفعيل خيار التخصيص حسب الجهة المصدرة بناءً على جدول القواعد',
      'success'
    );
  };

  // 3. فتح نافذة الإضافة
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      issuer_name: '',
      reduction_months: 1,
      max_allowed_letters: '',
      validity_months: '',
    });
    setIsModalOpen(true);
  };

  // 4. فتح نافذة التعديل
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      issuer_name: item.issuer_name,
      reduction_months: item.reduction_months,
      max_allowed_letters:
        item.max_allowed_letters !== null && item.max_allowed_letters !== undefined
          ? String(item.max_allowed_letters)
          : '',
      validity_months:
        item.validity_months !== null && item.validity_months !== undefined
          ? String(item.validity_months)
          : '',
    });
    setIsModalOpen(true);
  };

  // 5. حفظ أو تحديث جهة مصدرة
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.issuer_name.trim()) {
      notify('يرجى إدخال اسم الجهة المصدرة', 'error');
      return;
    }

    const trimmedName = formData.issuer_name.trim();
    const months = Math.max(1, parseInt(formData.reduction_months, 10) || 1);
    const maxLetters = formData.max_allowed_letters ? parseInt(formData.max_allowed_letters, 10) : null;
    const validityMonths = formData.validity_months ? parseInt(formData.validity_months, 10) : null;

    // التحقق من تكرار الاسم في حال الإضافة
    const isDuplicate = settingsList.some(
      (item) =>
        item.issuer_name.toLowerCase() === trimmedName.toLowerCase() &&
        (!editingItem || item.id !== editingItem.id)
    );

    if (isDuplicate) {
      notify(`الجهة المصدرة "${trimmedName}" مضافة مسبقاً في الجدول`, 'error');
      return;
    }

    setIsSubmitting(true);
    const now = new Date().toISOString();

    if (editingItem) {
      // تعديل جهة قائمة
      const updatedItem = {
        ...editingItem,
        issuer_name: trimmedName,
        reduction_months: months,
        max_allowed_letters: maxLetters,
        validity_months: validityMonths,
        updated_at: now,
      };

      if (isConnected) {
        try {
          const { error } = await supabase
            .from('appreciation_settings')
            .update({
              issuer_name: trimmedName,
              reduction_months: months,
              max_allowed_letters: maxLetters,
              validity_months: validityMonths,
              updated_at: now,
            })
            .eq('id', editingItem.id);

          if (error) throw error;
        } catch (err) {
          notify(`حدث خطأ أثناء التحديث في Supabase: ${err.message}`, 'error');
          setIsSubmitting(false);
          return;
        }
      }

      setSettingsList((prev) =>
        prev.map((item) => (item.id === editingItem.id ? updatedItem : item))
      );
      notify(`تم تحديث إعدادات قدَم "${trimmedName}" بنجاح!`);
    } else {
      // إضافة جهة جديدة
      const newItem = {
        id: isConnected ? undefined : 'sett_' + Date.now(),
        issuer_name: trimmedName,
        reduction_months: months,
        max_allowed_letters: maxLetters,
        validity_months: validityMonths,
        created_at: now,
        updated_at: now,
      };

      if (isConnected) {
        try {
          const { data, error } = await supabase
            .from('appreciation_settings')
            .insert([
              {
                issuer_name: trimmedName,
                reduction_months: months,
                max_allowed_letters: maxLetters,
                validity_months: validityMonths,
              },
            ])
            .select();

          if (error) throw error;
          if (data && data[0]) {
            newItem.id = data[0].id;
          }
        } catch (err) {
          notify(`حدث خطأ أثناء الإضافة في Supabase: ${err.message}`, 'error');
          setIsSubmitting(false);
          return;
        }
      }

      setSettingsList((prev) => [newItem, ...prev]);
      notify(`تمت إضافة الجهة المصدرة "${trimmedName}" بنجاح!`);
    }

    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  // 6. حذف جهة مصدرة
  const handleDeleteItem = async (item) => {
    setIsSubmitting(true);

    if (isConnected) {
      try {
        const { error } = await supabase
          .from('appreciation_settings')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      } catch (err) {
        notify(`خطأ أثناء الحذف في Supabase: ${err.message}`, 'error');
        setIsSubmitting(false);
        setDeleteConfirmation(null);
        return;
      }
    }

    setSettingsList((prev) => prev.filter((i) => i.id !== item.id));
    notify(`تم حذف الجهة المصدرة "${item.issuer_name}" بنجاح`);
    setIsSubmitting(false);
    setDeleteConfirmation(null);
  };

  // 7. استعادة الجهات الافتراضية النموذجية
  const handleResetToDefaults = async () => {
    if (!window.confirm('هل أنت متأكد من رغبتك في استعادة الجهات المصدرة الافتراضية الموصى بها؟')) {
      return;
    }

    setIsSubmitting(true);

    if (isConnected) {
      try {
        for (const def of DEFAULT_APPRECIATION_SETTINGS) {
          await supabase.from('appreciation_settings').upsert(
            {
              issuer_name: def.issuer_name,
              reduction_months: def.reduction_months,
              max_allowed_letters: def.max_allowed_letters,
              validity_months: def.validity_months || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'issuer_name' }
          );
        }
        await fetchSettings();
      } catch (err) {
        console.warn('خطأ أثناء مزامنة القواعد الافتراضية مع Supabase:', err.message);
      }
    } else {
      setSettingsList(DEFAULT_APPRECIATION_SETTINGS);
    }

    notify('تمت استعادة الجهات المصدرة الافتراضية بنجاح!');
    setIsSubmitting(false);
  };

  // تصفية الجهات بحسب نص البحث
  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) return settingsList;
    const query = searchQuery.toLowerCase();
    return settingsList.filter((item) =>
      item.issuer_name.toLowerCase().includes(query)
    );
  }, [settingsList, searchQuery]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-sm font-semibold text-slate-800">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              إعدادات النظام والتعليمات الإدارية
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة قواعد وقوانين احتساب مدد القدَم لكتب الشكر والتقدير وربطها التلقائي بمحرك الترفيعات
            </p>
          </div>
        </div>

        {/* Database Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isConnected ? 'Supabase متصل ومتزامن' : 'وضع الحفظ المحلي (Local)'}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* القسم الرئيسي: تعليمات كتب الشكر والقدَم */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Section Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-slate-50/70 to-white border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200/60">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                تعليمات كتب الشكر والقدَم (Appreciation & Acceleration Rules)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                حدد طريقة احتساب مدد القُدم الممنوحة للموظفين الحاصلين على كتب شكر وتقدير لتقليص مدة الترفيع
              </p>
            </div>
          </div>

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* خيار 1: الاعتماد الموحد */}
            <div
              onClick={() => handleSaveMode('unified', unifiedMonths)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative select-none ${
                calculationMode === 'unified'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-600/5'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="calculation_mode"
                    checked={calculationMode === 'unified'}
                    onChange={() => handleSaveMode('unified', unifiedMonths)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">الاعتماد الموحد لجميع الجهات</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تحديد عدد أشهر قدَم ثابت وموحد لكل كتاب شكر بصرف النظر عن الجهة المصدرة
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  وضع عام
                </span>
              </div>

              {/* مدخل عدد الأشهر الموحدة والخيارات الاختيارية */}
              <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                    عدد أشهر القدَم لكل كتاب:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={unifiedMonths}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setUnifiedMonths(val);
                        if (calculationMode === 'unified') {
                          handleSaveMode('unified', val, unifiedMaxAllowedLetters, unifiedValidityMonths);
                        }
                      }}
                      className="w-20 px-3 py-1.5 rounded-xl border border-slate-300 text-center font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <span className="text-xs font-medium text-slate-500">شهر / لكل كتاب</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      الحد الأقصى للكتب (اختياري):
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="افتراضي: بدون سقف"
                      value={unifiedMaxAllowedLetters}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUnifiedMaxAllowedLetters(val);
                        if (calculationMode === 'unified') {
                          handleSaveMode('unified', unifiedMonths, val, unifiedValidityMonths);
                        }
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      صلاحية الكتاب بالأشهر (اختياري):
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="افتراضي: دائمة الصلاحية"
                      value={unifiedValidityMonths}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUnifiedValidityMonths(val);
                        if (calculationMode === 'unified') {
                          handleSaveMode('unified', unifiedMonths, unifiedMaxAllowedLetters, val);
                        }
                      }}
                      onBlur={() => {
                        handleSaveMode(calculationMode, unifiedMonths, unifiedMaxAllowedLetters, unifiedValidityMonths);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200/50">
                  <span className="text-[10px] text-slate-500">
                    يتم الحفظ تلقائياً عند تغيير القيم
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveMode(calculationMode, unifiedMonths, unifiedMaxAllowedLetters, unifiedValidityMonths);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>حفظ التعليمات العامة</span>
                  </button>
                </div>
              </div>
            </div>

            {/* خيار 2: التخصيص حسب الجهة المصدرة */}
            <div
              onClick={() => handleSaveMode('custom', unifiedMonths)}
              className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative select-none ${
                calculationMode === 'custom'
                  ? 'border-emerald-600 bg-emerald-50/40 shadow-md shadow-emerald-600/5'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="calculation_mode"
                    checked={calculationMode === 'custom'}
                    onChange={() => handleSaveMode('custom', unifiedMonths)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        التخصيص حسب الجهة المصدرة
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        المعتمد نظاماً
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      منح مدد قدَم متفاوتة بحسب صلاحية الجهة (مثال: الوزير 6 أشهر، المدير العام شهر واحد)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>عدد الجهات المعرفة حالياً:</span>
                  <strong className="text-slate-900 font-bold">{settingsList.length} جهات</strong>
                </span>
                <span className="text-emerald-700 font-semibold">يتم الحفظ في appreciation_settings</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* جدول الجهات المصدرة المخصصة (Custom Issuers Table) */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>جدول الجهات المصدرة ومدد القدَم الممنوحة</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تطبق هذه القواعد في محرك المعالجة عند فحص جهة إصدار كل كتاب شكر مسجل للموظف
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* زر استعادة الافتراضي */}
              <button
                type="button"
                onClick={handleResetToDefaults}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors"
                title="استعادة القواعد النموذجية للوزارات والمدراء العامين"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>استعادة الافتراضي</span>
              </button>

              {/* زر إضافة جهة جديدة */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md shadow-emerald-600/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>إضافة جهة مصدرة جديدة</span>
              </button>
            </div>
          </div>

          {/* شريط البحث وتنبيه الوضع */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ابحث عن جهة مصدرة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {calculationMode === 'unified' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>ملاحظة: النظام يعمل حالياً بـ "الاعتماد الموحد"، الجدول أدناه مرجعي عند تفعيل التخصيص.</span>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5">#</th>
                    <th className="py-3.5 px-5">الجهة المصدرة للكتاب (issuer_name)</th>
                    <th className="py-3.5 px-5 text-center">أشهر القدَم الممنوحة (reduction_months)</th>
                    <th className="py-3.5 px-5 text-center">الحد الأقصى للكتب (max_allowed_letters)</th>
                    <th className="py-3.5 px-5 text-center">صلاحية الكتاب (validity_months)</th>
                    <th className="py-3.5 px-5 text-center">الحالة الإدارية</th>
                    <th className="py-3.5 px-5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSettings.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        {searchQuery ? (
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-600">لا توجد جهات مطابقة للبحث</p>
                            <p className="text-xs">جرب البحث بكلمة أخرى أو أضف الجهة يدوياً</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Building className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="font-semibold text-slate-600">لم يتم تعريف جهات مصدرة بعد</p>
                            <button
                              onClick={handleResetToDefaults}
                              className="text-xs text-emerald-600 font-bold hover:underline"
                            >
                              استعادة الجهات الافتراضية
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredSettings.map((item, index) => {
                      const isHighTier = item.reduction_months >= 6;
                      const isMidTier = item.reduction_months >= 3 && item.reduction_months < 6;

                      return (
                        <tr
                          key={item.id || item.issuer_name}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-4 px-5 text-xs font-mono text-slate-400">
                            {index + 1}
                          </td>

                          {/* اسم الجهة */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                  isHighTier
                                    ? 'bg-purple-100 text-purple-700'
                                    : isMidTier
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                <Building className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block">
                                  {item.issuer_name}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {item.id ? `ID: ${item.id.slice(0, 8)}...` : 'محلي'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* أشهر القدم */}
                          <td className="py-4 px-5 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                                isHighTier
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : isMidTier
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{item.reduction_months} {item.reduction_months === 1 ? 'شهر قدَم' : item.reduction_months === 2 ? 'شهران قدَم' : 'أشهر قدَم'}</span>
                            </span>
                          </td>

                          {/* الحد الأقصى للكتب */}
                          <td className="py-4 px-5 text-center">
                            {item.max_allowed_letters ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                <Hash className="w-3 h-3 text-slate-500" />
                                <span>بحد أقصى {item.max_allowed_letters} كتب</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">غير محدد (مفتوح)</span>
                            )}
                          </td>

                          {/* مدة الصلاحية */}
                          <td className="py-4 px-5 text-center">
                            {item.validity_months ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                                <Calendar className="w-3 h-3 text-amber-600" />
                                <span>خلال آخر {item.validity_months} شهر</span>
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400 font-medium">دائمة الصلاحية</span>
                            )}
                          </td>

                          {/* الحالة الإدارية */}
                          <td className="py-4 px-5 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>معتمد في المحرك</span>
                            </span>
                          </td>

                          {/* الإجراءات */}
                          <td className="py-4 px-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                                title="تعديل بيانات الجهة والقدَم"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmation(item)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="حذف الجهة من الإعدادات"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
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

        {/* معلومات توضيحية ختامية */}
        <div className="p-6 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>قاعدة الربط مع محرك الترفيعات:</strong> إذا ورد كتاب شكر من جهة غير معرفة في الجدول أعلاه، يقوم النظام تلقائياً باعتماد قيمة القدَم الافتراضية ({unifiedMonths} شهر) دون إيقاف المعالجة.
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* نافذة منبثقة لإضافة / تعديل جهة مصدرة (Modal) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingItem ? 'تعديل جهة مصدرة' : 'إضافة جهة مصدرة جديدة'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    حدد اسم الجهة وعدد أشهر القدَم الممنوحة لكتبها
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اسم الجهة المصدرة (issuer_name) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مكتب الوزير، المدير العام، وكيل الوزارة"
                  value={formData.issuer_name}
                  onChange={(e) => setFormData({ ...formData, issuer_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  يجب أن يطابق الاسم المدخل في كتب الشكر والتقدير
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  عدد أشهر القدَم الممنوحة (reduction_months) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={formData.reduction_months}
                    onChange={(e) =>
                      setFormData({ ...formData, reduction_months: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    شهر قدَم
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  المدة التي تخصم من المدة القانونية للترفيع (48 شهراً)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>الحد الأقصى لعدد كتب الشكر المسموحة للاحتساب (اختياري)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  placeholder="اتركه فارغاً إذا كان بدون سقف (غير محدد)"
                  value={formData.max_allowed_letters}
                  onChange={(e) =>
                    setFormData({ ...formData, max_allowed_letters: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  مثلاً: 3 كتب كحد أقصى؛ وما زاد عنها يتم تجاهله في احتساب القدَم
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>المدة المقبولة / صلاحية الكتاب بالأشهر (اختياري)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="اتركه فارغاً لاعتماد الكتاب بأي تاريخ (مفتوح)"
                  value={formData.validity_months}
                  onChange={(e) =>
                    setFormData({ ...formData, validity_months: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  مثلاً: احتساب الكتب الصادرة خلال آخر 12 أو 6 أشهر فقط مقارنة بتاريخ اليوم
                </p>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingItem ? 'حفظ التعديلات' : 'إضافة الجهة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* نافذة تأكيد الحذف */}
      {/* ========================================================================= */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-bold text-slate-900">تأكيد حذف الجهة</h4>
              <p className="text-xs text-slate-500 mt-1">
                هل أنت متأكد من رغبتك في حذف قاعدة قدَم الجهة المصدرة:{' '}
                <strong className="text-slate-800">"{deleteConfirmation.issuer_name}"</strong>؟
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => handleDeleteItem(deleteConfirmation)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm shadow-rose-600/20"
              >
                {isSubmitting ? 'جاري الحذف...' : 'نعم، احذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
