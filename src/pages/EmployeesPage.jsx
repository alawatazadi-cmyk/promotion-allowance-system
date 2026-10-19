import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/common/StatCard';
import EmployeeModal from '../components/employees/EmployeeModal';
import PromotionModal from '../components/history/PromotionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Calendar,
  Briefcase,
  Download,
  Building2,
  Phone,
} from 'lucide-react';

const EmployeesPage = () => {
  const { employees, jobTitles, deleteEmployee, formatCurrency, formatDate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobTitleFilter, setSelectedJobTitleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
  const [promotionTargetEmpId, setPromotionTargetEmpId] = useState(null);

  // إحصائيات سريعة
  const totalEmployees = employees.length;
  const totalPayroll = useMemo(() => {
    return employees.reduce((sum, emp) => sum + (Number(emp.current_salary) || 0), 0);
  }, [employees]);
  const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

  // فلترة وبحث الموظفين
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        (emp.name && emp.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.job_title && emp.job_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (emp.phone && emp.phone.includes(searchQuery));

      const matchesTitle =
        selectedJobTitleFilter === 'ALL' || emp.job_title_id === selectedJobTitleFilter;

      return matchesSearch && matchesTitle;
    });
  }, [employees, searchQuery, selectedJobTitleFilter]);

  // تصدير بسيط لملف CSV
  const handleExportCSV = () => {
    if (employees.length === 0) return;
    const headers = ['الاسم', 'العنوان الوظيفي', 'الدرجة', 'تاريخ التعيين', 'الراتب الحالي', 'القسم', 'الهاتف'];
    const rows = employees.map((e) => [
      `"${e.name}"`,
      `"${e.job_title}"`,
      `"${e.grade}"`,
      `"${e.hire_date}"`,
      `"${e.current_salary}"`,
      `"${e.department || ''}"`,
      `"${e.phone || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">سجل بيانات الموظفين</h2>
          <p className="text-xs text-slate-500 mt-1">
            إدارة الموظفين والرواتب والعناوين الوظيفية وتوثيق الاستحقاقات السنوية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
            title="تصدير بيانات الموظفين إلى ملف CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير Excel/CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="إجمالي عدد الكادر"
          value={totalEmployees}
          subtitle="موظف مسجل في النظام"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="كتلة الرواتب الإجمالية"
          value={formatCurrency(totalPayroll)}
          subtitle="المخصصات الشهرية المعتمدة"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="متوسط الرواتب"
          value={formatCurrency(avgSalary)}
          subtitle="معدل راتب الموظف الواحد"
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث بالاسم، العنوان الوظيفي، القسم، أو الهاتف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        {/* Filter by Job Title */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedJobTitleFilter}
            onChange={(e) => setSelectedJobTitleFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-200"
          >
            <option value="ALL">جميع العناوين الوظيفية ({employees.length})</option>
            {jobTitles.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">الموظف</th>
                <th className="py-4 px-6">العنوان الوظيفي</th>
                <th className="py-4 px-6 text-center">الدرجة الوظيفية</th>
                <th className="py-4 px-6">تاريخ التعيين</th>
                <th className="py-4 px-6">الراتب الحالي</th>
                <th className="py-4 px-6">القسم / التواصل</th>
                <th className="py-4 px-6 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">لا توجد بيانات مطابقة لخيارات البحث</p>
                      <p className="text-xs text-slate-400 mt-1">جرّب تغيير عبارة البحث أو إضافة موظف جديد</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* الاسم والأفاتار */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-100 to-teal-50 border border-emerald-200/60 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-xs flex-shrink-0">
                          {emp.name ? emp.name.charAt(0) : 'م'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {emp.name}
                          </p>
                          {emp.notes && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{emp.notes}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* العنوان الوظيفي */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800">{emp.job_title || '-'}</span>
                      </div>
                    </td>

                    {/* الدرجة الوظيفية - عمود مستقل */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      {emp.grade ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                          <Award className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>{emp.grade}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-sm">-</span>
                      )}
                    </td>

                    {/* تاريخ التعيين */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{formatDate(emp.hire_date)}</span>
                      </div>
                    </td>

                    {/* الراتب الحالي */}
                    <td className="py-4 px-6">
                      <div className="font-mono font-bold text-slate-900 text-base">
                        {formatCurrency(emp.current_salary)}
                      </div>
                    </td>

                    {/* القسم والتواصل */}
                    <td className="py-4 px-6">
                      <div className="text-xs space-y-1">
                        {emp.department && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{emp.department}</span>
                          </div>
                        )}
                        {emp.phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-mono">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{emp.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* الإجراءات */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* إضافة علاوة / ترفيع مباشر للموظف */}
                        <button
                          onClick={() => setPromotionTargetEmpId(emp.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-colors"
                          title="منح علاوة أو ترفيع لهذا الموظف"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>استحقاق</span>
                        </button>

                        {/* زر التعديل */}
                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="تعديل بيانات الموظف"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* زر الحذف */}
                        <button
                          onClick={() => setDeletingEmployeeId(emp.id)}
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

        {/* Footer / Count */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            عرض <strong className="text-slate-800">{filteredEmployees.length}</strong> من أصل{' '}
            <strong className="text-slate-800">{employees.length}</strong> موظف
          </span>
        </div>
      </div>

      {/* Add Employee Modal */}
      <EmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Employee Modal */}
      <EmployeeModal
        isOpen={Boolean(editingEmployee)}
        employee={editingEmployee}
        onClose={() => setEditingEmployee(null)}
      />

      {/* Entitlement / Promotion Modal for specific employee */}
      <PromotionModal
        isOpen={Boolean(promotionTargetEmpId)}
        preselectedEmployeeId={promotionTargetEmpId}
        onClose={() => setPromotionTargetEmpId(null)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingEmployeeId)}
        onClose={() => setDeletingEmployeeId(null)}
        onConfirm={() => {
          if (deletingEmployeeId) deleteEmployee(deletingEmployeeId);
        }}
        title="تأكيد حذف الموظف"
        message="هل أنت متأكد من رغبتك في حذف هذا الموظف؟ سيتم حذف جميع سجلات العلاوات والترفيعات المرتبطة به نهائياً ولا يمكن التراجع عن هذه الخطوة."
      />
    </div>
  );
};

export default EmployeesPage;
