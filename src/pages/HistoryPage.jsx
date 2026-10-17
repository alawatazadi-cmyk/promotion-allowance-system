import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import PromotionModal from '../components/history/PromotionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import {
  Award,
  TrendingUp,
  PlusCircle,
  Search,
  Filter,
  Calendar,
  FileText,
  DollarSign,
  ArrowUpRight,
  Trash2,
  Download,
  User,
} from 'lucide-react';

const HistoryPage = () => {
  const { history, employees, deleteHistoryItem, formatCurrency, formatDate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'علاوة سنوية' | 'ترفيع وظيفي'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState(null);

  // إحصائيات السجل
  const totalRecords = history.length;
  const allowancesCount = useMemo(() => {
    return history.filter((h) => h.type === 'علاوة سنوية').length;
  }, [history]);

  const promotionsCount = useMemo(() => {
    return history.filter((h) => h.type === 'ترفيع وظيفي').length;
  }, [history]);

  const totalIncreaseSum = useMemo(() => {
    return history.reduce((sum, h) => sum + (Number(h.amount_increase) || 0), 0);
  }, [history]);

  // تصفية السجل
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        (item.employee_name && item.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.order_number && item.order_number.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [history, searchQuery, typeFilter]);

  // تصدير السجل CSV
  const handleExportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      'اسم الموظف',
      'نوع الاستحقاق',
      'تاريخ السريان',
      'الراتب السابق',
      'الراتب الجديد',
      'مقدار الزيادة',
      'رقم الأمر الإداري',
      'الملاحظات',
    ];
    const rows = history.map((h) => [
      `"${h.employee_name}"`,
      `"${h.type}"`,
      `"${h.effective_date}"`,
      `"${h.old_salary}"`,
      `"${h.new_salary}"`,
      `"${h.amount_increase}"`,
      `"${h.order_number || ''}"`,
      `"${h.notes || ''}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `allowances_promotions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">سجل العلاوات والترفيعات</h2>
          <p className="text-xs text-slate-500 mt-1">
            الأرشيف المالي والإداري الشامل لجميع قرارات العلاوات السنوية والترفيعات الوظيفية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>تصدير السجل CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm shadow-emerald-500/20 hover:shadow-md hover:shadow-emerald-500/30 transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة استحقاق جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي القرارات الصادرة"
          value={totalRecords}
          subtitle="علاوة وترفيع موثق"
          icon={Award}
          color="emerald"
        />
        <StatCard
          title="العلاوات السنوية"
          value={allowancesCount}
          subtitle="استحقاق دوري سنوي"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="الترفيعات والترقيات"
          value={promotionsCount}
          subtitle="ترفيع لدرجة أعلى"
          icon={Award}
          color="amber"
        />
        <StatCard
          title="إجمالي مبالغ الزيادات"
          value={formatCurrency(totalIncreaseSum)}
          subtitle="تراكم مبالغ الاستحقاقات"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="البحث باسم الموظف، رقم الأمر الإداري، أو الملاحظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
          />
        </div>

        {/* Filter by Type */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({history.length})
            </button>
            <button
              onClick={() => setTypeFilter('علاوة سنوية')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'علاوة سنوية'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              علاوة سنوية ({allowancesCount})
            </button>
            <button
              onClick={() => setTypeFilter('ترفيع وظيفي')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'ترفيع وظيفي'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              ترفيع وظيفي ({promotionsCount})
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">الموظف</th>
                <th className="py-4 px-6">نوع الاستحقاق</th>
                <th className="py-4 px-6">تاريخ السريان</th>
                <th className="py-4 px-6">الراتب السابق والجديد</th>
                <th className="py-4 px-6">مقدار الزيادة</th>
                <th className="py-4 px-6">الأمر الإداري والملاحظات</th>
                <th className="py-4 px-6 text-center">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Award className="w-10 h-10 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-medium text-slate-600">لا توجد سجلات مطابقة</p>
                      <p className="text-xs text-slate-400 mt-1">
                        يمكنك إضافة علاوة سنوية أو ترفيع جديد بالضغط على الزر أعلاه
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    {/* اسم الموظف */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs flex-shrink-0">
                          {item.employee_name ? item.employee_name.charAt(0) : 'م'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {item.employee_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* نوع الاستحقاق */}
                    <td className="py-4 px-6">
                      <Badge type={item.type} />
                    </td>

                    {/* تاريخ الاستحقاق */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span>{formatDate(item.effective_date)}</span>
                      </div>
                    </td>

                    {/* الراتب السابق والجديد */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5 font-mono text-xs">
                        <div className="text-slate-400 line-through">
                          {formatCurrency(item.old_salary)}
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {formatCurrency(item.new_salary)}
                        </div>
                      </div>
                    </td>

                    {/* مقدار الزيادة */}
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200/80">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+{formatCurrency(item.amount_increase || item.new_salary - item.old_salary)}</span>
                      </div>
                    </td>

                    {/* الأمر الإداري والملاحظات */}
                    <td className="py-4 px-6 max-w-xs">
                      <div>
                        {item.order_number && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 font-mono mb-1">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.order_number}</span>
                          </div>
                        )}
                        {item.notes ? (
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {item.notes}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    {/* حذف القيد */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => setDeletingHistoryId(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="حذف هذا القيد من السجل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            إجمالي السجلات المعروضة: <strong className="text-slate-800">{filteredHistory.length}</strong> قيد
          </span>
        </div>
      </div>

      {/* Add Entitlement Modal */}
      <PromotionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingHistoryId)}
        onClose={() => setDeletingHistoryId(null)}
        onConfirm={() => {
          if (deletingHistoryId) deleteHistoryItem(deletingHistoryId);
        }}
        title="تأكيد حذف القيد"
        message="هل أنت متأكد من رغبتك في حذف هذا القيد من سجل العلاوات والترفيعات؟ لن يؤثر حذف القيد على الراتب الحالي المسجل في بطاقة الموظف."
      />
    </div>
  );
};

export default HistoryPage;
