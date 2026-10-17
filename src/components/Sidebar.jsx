import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Briefcase, Award, FileCheck2, Cpu, Sparkles, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured } from '../supabaseClient';

const Sidebar = () => {
  const isConnected = isSupabaseConfigured();

  const menuItems = [
    {
      name: 'بيانات الموظفين',
      path: '/',
      icon: Users,
    },
    {
      name: 'محرك العلاوات والترفيعات',
      path: '/processing-engine',
      icon: Cpu,
    },
    {
      name: 'العناوين الوظيفية',
      path: '/job-titles',
      icon: Briefcase,
    },
    {
      name: 'سجل العلاوات والترفيعات',
      path: '/history',
      icon: Award,
    },
    {
      name: 'كتب الشكر والتقدير',
      path: '/appreciation-letters',
      icon: FileCheck2,
    },
  ];

  return (
    <aside className="w-64 sm:w-72 bg-slate-900 text-slate-200 min-h-screen flex flex-col border-l border-slate-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">العلاوات والترفيعات</h1>
            <p className="text-xs text-slate-400">إدارة الاستحقاقات الوظيفية</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          القوائم الرئيسية
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Supabase Connection Status Card */}
      <div className="p-4 m-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 mb-2 font-semibold text-slate-300">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>حالة قاعدة البيانات</span>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="text-emerald-300 font-medium">Supabase متصل</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-amber-300 font-medium">وضع المعاينة المحلي (Local)</span>
            </>
          )}
        </div>

        {!isConnected && (
          <p className="text-[11px] text-slate-400 mt-2 border-t border-slate-700/50 pt-2 leading-relaxed">
            لربط Supabase الحي، أضف المفاتيح في ملف <code className="text-emerald-400">.env</code>.
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
