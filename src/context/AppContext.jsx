import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { initialEmployees, initialJobTitles, initialHistory } from '../data/initialData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // الحالات الأساسية للبيانات
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('alawat_employees');
    return saved ? JSON.parse(saved) : initialEmployees;
  });

  const [jobTitles, setJobTitles] = useState(() => {
    const saved = localStorage.getItem('alawat_job_titles');
    return saved ? JSON.parse(saved) : initialJobTitles;
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('alawat_history');
    return saved ? JSON.parse(saved) : initialHistory;
  });

  const [loading, setLoading] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [toast, setToast] = useState(null);

  // عرض إشعار للمستخدم
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  // جلب البيانات من Supabase عند التحميل
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLiveConnected(false);
      return;
    }

    setLoading(true);
    try {
      // 1. جلب العناوين الوظيفية
      const { data: titlesData, error: titlesError } = await supabase
        .from('job_titles')
        .select('*')
        .order('created_at', { ascending: false });

      if (titlesError) throw titlesError;

      // 2. جلب الموظفين
      const { data: empsData, error: empsError } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (empsError) throw empsError;

      // 3. جلب سجل العلاوات والترفيعات
      const { data: histData, error: histError } = await supabase
        .from('allowances_promotions')
        .select('*')
        .order('effective_date', { ascending: false });

      if (histError) throw histError;

      if (titlesData) setJobTitles(titlesData);
      if (empsData) setEmployees(empsData);
      if (histData) setHistory(histData);

      setIsLiveConnected(true);
      showToast('تمت المزامنة بنجاح مع قاعدة بيانات Supabase', 'success');
    } catch (err) {
      console.warn('تعذر الاتصال المباشر بـ Supabase، يتم استخدام وضع المعاينة المحلي:', err.message);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // حفظ التعديلات في LocalStorage لضمان استمرارية التجربة المحلية
  useEffect(() => {
    localStorage.setItem('alawat_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('alawat_job_titles', JSON.stringify(jobTitles));
  }, [jobTitles]);

  useEffect(() => {
    localStorage.setItem('alawat_history', JSON.stringify(history));
  }, [history]);

  // =========================================================================
  // عمليات الموظفين (Employees Operations)
  // =========================================================================

  const addEmployee = async (employeeData) => {
    const selectedTitle = jobTitles.find((t) => t.id === employeeData.job_title_id);
    const newRecord = {
      ...employeeData,
      job_title: selectedTitle ? selectedTitle.title : employeeData.job_title || 'غير محدد',
      grade: selectedTitle ? selectedTitle.grade : employeeData.grade || 'غير محدد',
      current_salary: Number(employeeData.current_salary) || 0,
    };

    if (isLiveConnected) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .insert([newRecord])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setEmployees((prev) => [data[0], ...prev]);
        }
        showToast('تمت إضافة الموظف بنجاح إلى قاعدة البيانات', 'success');
        return { success: true };
      } catch (err) {
        showToast(`خطأ أثناء الإضافة في Supabase: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      const fallbackRecord = {
        ...newRecord,
        id: 'emp_' + Date.now(),
        created_at: new Date().toISOString(),
      };
      setEmployees((prev) => [fallbackRecord, ...prev]);
      showToast('تمت إضافة الموظف بنجاح (وضع الحفظ المحلي)', 'success');
      return { success: true };
    }
  };

  const updateEmployee = async (id, updatedFields) => {
    const selectedTitle = jobTitles.find((t) => t.id === updatedFields.job_title_id);
    const updatedData = {
      ...updatedFields,
      job_title: selectedTitle ? selectedTitle.title : updatedFields.job_title,
      grade: selectedTitle ? selectedTitle.grade : updatedFields.grade,
      current_salary: Number(updatedFields.current_salary) || 0,
    };

    if (isLiveConnected) {
      try {
        const { error } = await supabase
          .from('employees')
          .update(updatedData)
          .eq('id', id);

        if (error) throw error;
        setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp)));
        showToast('تم تحديث بيانات الموظف بنجاح', 'success');
        return { success: true };
      } catch (err) {
        showToast(`خطأ أثناء التحديث: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, ...updatedData } : emp)));
      showToast('تم تحديث بيانات الموظف بنجاح', 'success');
      return { success: true };
    }
  };

  const deleteEmployee = async (id) => {
    if (isLiveConnected) {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) throw error;
        setEmployees((prev) => prev.filter((emp) => emp.id !== id));
        setHistory((prev) => prev.filter((item) => item.employee_id !== id));
        showToast('تم حذف الموظف بنجاح', 'info');
        return { success: true };
      } catch (err) {
        showToast(`خطأ أثناء الحذف: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
      setHistory((prev) => prev.filter((item) => item.employee_id !== id));
      showToast('تم حذف الموظف بنجاح', 'info');
      return { success: true };
    }
  };

  // =========================================================================
  // عمليات العناوين الوظيفية (Job Titles Operations)
  // =========================================================================

  const addJobTitle = async (titleData) => {
    const newRecord = {
      main_title_id: titleData.main_title_id,
      title_name: titleData.title_name || titleData.title,
      grade: titleData.grade,
    };

    if (isLiveConnected) {
      try {
        const { data, error } = await supabase.from('job_titles').insert([newRecord]).select();
        if (error) throw error;
        if (data && data[0]) {
          setJobTitles((prev) => [data[0], ...prev]);
        }
        showToast('تمت إضافة العنوان الوظيفي بنجاح', 'success');
        return { success: true };
      } catch (err) {
        let msg = `خطأ أثناء الإضافة: ${err.message}`;
        if (err.message?.includes('foreign key constraint') || err.code === '23503') {
          msg = 'فشل الإضافة: العنوان الأساسي المختار غير موجود في جدول العناوين الأساسية (main_job_titles).';
        }
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    } else {
      const fallbackRecord = {
        ...newRecord,
        id: 'jt_' + Date.now(),
        created_at: new Date().toISOString(),
      };
      setJobTitles((prev) => [fallbackRecord, ...prev]);
      showToast('تمت إضافة العنوان الوظيفي بنجاح', 'success');
      return { success: true };
    }
  };

  const updateJobTitle = async (id, updatedFields) => {
    const formatted = {
      main_title_id: updatedFields.main_title_id,
      title_name: updatedFields.title_name || updatedFields.title,
      grade: updatedFields.grade,
    };

    if (isLiveConnected) {
      try {
        const { error } = await supabase.from('job_titles').update(formatted).eq('id', id);
        if (error) throw error;
        setJobTitles((prev) => prev.map((item) => (item.id === id ? { ...item, ...formatted } : item)));
        showToast('تم تعديل العنوان الوظيفي بنجاح', 'success');
        return { success: true };
      } catch (err) {
        let msg = `خطأ أثناء التعديل: ${err.message}`;
        if (err.message?.includes('foreign key constraint') || err.code === '23503') {
          msg = 'فشل التعديل: العنوان الأساسي المختار غير موجود في جدول العناوين الأساسية (main_job_titles).';
        }
        showToast(msg, 'error');
        return { success: false, error: msg };
      }
    } else {
      setJobTitles((prev) => prev.map((item) => (item.id === id ? { ...item, ...formatted } : item)));
      showToast('تم تعديل العنوان الوظيفي بنجاح', 'success');
      return { success: true };
    }
  };

  const deleteJobTitle = async (id) => {
    // التحقق مما إذا كان هناك موظفون مرتبطون بهذا العنوان الوظيفي
    const hasEmployees = employees.some((e) => e.job_title_id === id);
    if (hasEmployees) {
      showToast('لا يمكن حذف هذا العنوان الوظيفي لوجود موظفين مرتبطين به حالياً', 'error');
      return { success: false, error: 'مرتبط بموظفين' };
    }

    if (isLiveConnected) {
      try {
        const { error } = await supabase.from('job_titles').delete().eq('id', id);
        if (error) throw error;
        setJobTitles((prev) => prev.filter((item) => item.id !== id));
        showToast('تم حذف العنوان الوظيفي بنجاح', 'info');
        return { success: true };
      } catch (err) {
        showToast(`خطأ أثناء الحذف: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      setJobTitles((prev) => prev.filter((item) => item.id !== id));
      showToast('تم حذف العنوان الوظيفي بنجاح', 'info');
      return { success: true };
    }
  };

  // =========================================================================
  // عمليات سجل العلاوات والترفيعات (Allowances & Promotions)
  // وتحديث الراتب بشكل آلي في جدول الموظفين
  // =========================================================================

  const addPromotionOrAllowance = async (payload) => {
    const employee = employees.find((e) => e.id === payload.employee_id);
    if (!employee) {
      showToast('الموظف المحدد غير موجود', 'error');
      return { success: false, error: 'Employee not found' };
    }

    const oldSalary = Number(payload.old_salary) || Number(employee.current_salary) || 0;
    const newSalary = Number(payload.new_salary) || 0;
    const amountIncrease = newSalary - oldSalary;

    const historyRecord = {
      employee_id: payload.employee_id,
      employee_name: employee.name,
      type: payload.type, // 'علاوة سنوية' أو 'ترفيع وظيفي'
      effective_date: payload.effective_date,
      old_salary: oldSalary,
      new_salary: newSalary,
      amount_increase: amountIncrease,
      order_number: payload.order_number || '',
      notes: payload.notes || '',
    };

    // البيانات المطلوب تحديثها في جدول الموظفين
    const employeeUpdates = {
      current_salary: newSalary,
    };

    // إذا كان ترفيعاً وظيفياً وتغير العنوان الوظيفي
    if (payload.type === 'ترفيع وظيفي' && payload.new_job_title_id) {
      const newJobTitleObj = jobTitles.find((t) => t.id === payload.new_job_title_id);
      if (newJobTitleObj) {
        employeeUpdates.job_title_id = newJobTitleObj.id;
        employeeUpdates.job_title = newJobTitleObj.title;
        employeeUpdates.grade = newJobTitleObj.grade;
      }
    }

    if (isLiveConnected) {
      try {
        // 1. إدراج القيد في جدول سجل العلاوات والترفيعات
        const { data: insertedHistory, error: historyError } = await supabase
          .from('allowances_promotions')
          .insert([historyRecord])
          .select();

        if (historyError) throw historyError;

        // 2. تحديث الراتب والعنوان الوظيفي آلياً في جدول الموظفين (Supabase)
        const { error: empUpdateError } = await supabase
          .from('employees')
          .update(employeeUpdates)
          .eq('id', payload.employee_id);

        if (empUpdateError) throw empUpdateError;

        // تحديث الحالات المحلية
        if (insertedHistory && insertedHistory[0]) {
          setHistory((prev) => [insertedHistory[0], ...prev]);
        }
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === payload.employee_id ? { ...emp, ...employeeUpdates } : emp))
        );

        showToast(
          `تم تسجيل ${payload.type} بنجاح، وتحديث الراتب الحالي للموظف إلى ${formatCurrency(newSalary)}`,
          'success'
        );
        return { success: true };
      } catch (err) {
        showToast(`خطأ في تنفيذ العملية: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      // وضع العمل المحلي
      const fallbackHistoryItem = {
        ...historyRecord,
        id: 'hist_' + Date.now(),
        created_at: new Date().toISOString(),
      };

      setHistory((prev) => [fallbackHistoryItem, ...prev]);
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === payload.employee_id ? { ...emp, ...employeeUpdates } : emp))
      );

      showToast(
        `تم تسجيل ${payload.type} بنجاح، وتحديث راتب ${employee.name} آلياً إلى ${formatCurrency(newSalary)}`,
        'success'
      );
      return { success: true };
    }
  };

  const deleteHistoryItem = async (id) => {
    if (isLiveConnected) {
      try {
        const { error } = await supabase.from('allowances_promotions').delete().eq('id', id);
        if (error) throw error;
        setHistory((prev) => prev.filter((item) => item.id !== id));
        showToast('تم حذف القيد من السجل بنجاح', 'info');
        return { success: true };
      } catch (err) {
        showToast(`خطأ أثناء الحذف: ${err.message}`, 'error');
        return { success: false, error: err.message };
      }
    } else {
      setHistory((prev) => prev.filter((item) => item.id !== id));
      showToast('تم حذف القيد من السجل بنجاح', 'info');
      return { success: true };
    }
  };

  // أدوات مساعدة لتنسيق الأرقام والعملات والتواريخ
  const formatCurrency = (val) => {
    if (val === null || val === undefined || isNaN(val)) return '0 د.ع';
    return Number(val).toLocaleString('ar-IQ') + ' د.ع';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AppContext.Provider
      value={{
        employees,
        jobTitles,
        history,
        loading,
        isLiveConnected,
        isConfigured: isSupabaseConfigured(),
        toast,
        showToast,
        hideToast,
        fetchData,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addJobTitle,
        updateJobTitle,
        deleteJobTitle,
        addPromotionOrAllowance,
        deleteHistoryItem,
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
