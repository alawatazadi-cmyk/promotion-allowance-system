import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, Award, Sparkles, Database, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
  const { employees, jobTitles, history, isLiveConnected, isConfigured, fetchData, loading } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'بيانات الموظفين',
      icon: Users,
      badge: employees.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      to: '/job-titles',
      label: 'العناوين والدرجات',
      icon: Briefcase,
      badge: jobTitles.length,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      to: '/history',
      label: 'سجل العلاوات والترفيعات',
      icon: Award,
      badge: history.length,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-l border-slate-800 select-none flex-shrink-0 transition-all duration-300">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">علاوات وترفيعات</h1>
            <p className="text-xs text-slate-400">إدارة الاستحقاقات الوظيفية</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          القوائم الرئيسية
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-full transition-colors ${
                      isActive ? 'bg-emerald-700 text-emerald-100' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Database Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">اتصال Supabase</span>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            title="تحديث البيانات"
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isLiveConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                : isConfigured
                ? 'bg-amber-400'
                : 'bg-sky-400'
            }`}
          />
          <span className="text-slate-400 font-medium">
            {isLiveConnected
              ? 'متصل بقاعدة البيانات الحية'
              : isConfigured
              ? 'جاري التحقق من الاتصال...'
              : 'وضع المعاينة المحلي (تفاعلي)'}
          </span>
        </div>

        {!isLiveConnected && (
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed border-t border-slate-700/50 pt-2">
            يمكنك إدخال مفاتيح Supabase في ملف <code className="text-emerald-400">.env</code> للربط السحابي المباشر.
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
