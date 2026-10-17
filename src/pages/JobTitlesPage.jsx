import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/common/StatCard';
import JobTitleModal from '../components/jobTitles/JobTitleModal';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  Briefcase,
  PlusCircle,
  Search,
  Award,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';

const JobTitlesPage = () => {
  const { jobTitles, employees, deleteJobTitle, formatCurrency } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [deletingTitleId, setDeletingTitleId] = useState(null);

  // إحصائيات سريعة
  const totalTitles = jobTitles.length;
  const uniqueGrades = useMemo(() => {
    return new Set(jobTitles.map((t) => t.grade)).size;
  }, [jobTitles]);

  const avgAllowance = useMemo(() => {
    if (totalTitles === 0) return 0;
    const sum = jobTitles.reduce((acc, t) => acc + (Number(t.allowance_rate) || 0), 0);
    return Math.round(sum / totalTitles);
  }, [jobTitles, totalTitles]);

  // حساب عدد الموظفين لكل عنوان وظيفي
  const employeeCountByTitle = useMemo(() => {
    const map = {};
    employees.forEach((emp) => {
      const tid = emp.job_title_id;
      if (tid) {
        map[tid] = (map[tid] || 0) + 1;
      }
    });
    return map;
  }, [employees]);

  // التصفية والبحث
  const filteredTitles = useMemo(() => {
    return jobTitles.filter((item) => {
      return (
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.grade && item.grade.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });
  }, [jobTitles, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">العناوين والدرجات الوظيفية</h2>
          <p className="text-xs text-slate-500 mt-1">
            تحديد العناوين وسلم الرواتب والدرجات ومعدل العلاوة السنوية لكل درجة
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200"
        >
          <PlusCircle className="w-4 h-4" />
          <span>إضافة عنوان وظيفي</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="إجمالي العناوين المعتمدة"
          value={totalTitles}
          subtitle="مسمى وظيفي في الهيكل التنظيمي"
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="الدرجات الوظيفية النشطة"
          value={uniqueGrades}
          subtitle="درجة وظيفية مفعلة"
          icon={Award}
          color="purple"
        />
        <StatCard
          title="متوسط العلاوة السنوية"
          value={formatCurrency(avgAllowance)}
          subtitle="معدل الزيادة المقررة بالسلم"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم العنوان أو الدرجة الوظيفية..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Job Titles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">العنوان الوظيفي</th>
                <th className="py-4 px-6">الدرجة الوظيفية</th>
                <th className="py-4 px-6">سلم الرواتب (الحد الأدنى - الأعلى)</th>
                <th className="py-4 px-6">العلاوة السنوية المقررة</th>
                <th className="py-4 px-6 text-center">الموظفون المسجلون</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredTitles.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Briefcase className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">لا توجد عناوين وظيفية مطابقة</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTitles.map((item) => {
                  const empCount = employeeCountByTitle[item.id] || 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* العنوان الوظيفي */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-700 flex-shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {item.title}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* الدرجة الوظيفية */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200/70">
                          {item.grade}
                        </span>
                      </td>

                      {/* سلم الرواتب */}
                      <td className="py-4 px-6">
                        <div className="font-mono text-xs">
                          <span className="text-slate-600">{formatCurrency(item.min_salary)}</span>
                          <span className="mx-2 text-slate-300">إلى</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(item.max_salary)}</span>
                        </div>
                      </td>

                      {/* العلاوة السنوية المقررة */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-mono font-bold text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span>+{formatCurrency(item.allowance_rate)}</span>
                        </div>
                      </td>

                      {/* عدد الموظفين الفعليين */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                            empCount > 0
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-slate-50 text-slate-400 border border-dashed border-slate-200'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{empCount} موظف</span>
                        </span>
                      </td>

                      {/* الإجراءات */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingTitle(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="تعديل العنوان الوظيفي"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeletingTitleId(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="حذف العنوان الوظيفي"
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            إجمالي العناوين الوظيفية المسجلة: <strong className="text-slate-800">{filteredTitles.length}</strong>
          </span>
        </div>
      </div>

      {/* Add Modal */}
      <JobTitleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Modal */}
      <JobTitleModal
        isOpen={Boolean(editingTitle)}
        jobTitle={editingTitle}
        onClose={() => setEditingTitle(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingTitleId)}
        onClose={() => setDeletingTitleId(null)}
        onConfirm={() => {
          if (deletingTitleId) deleteJobTitle(deletingTitleId);
        }}
        title="تأكيد حذف العنوان الوظيفي"
        message="هل أنت متأكد من رغبتك في حذف هذا العنوان الوظيفي؟ لن يمكن الحذف إذا كان هناك موظفون مرتبطون به حالياً."
      />
    </div>
  );
};

export default JobTitlesPage;
