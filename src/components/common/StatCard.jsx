import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'emerald' }) => {
  const colorSchemes = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-emerald-100 hover:border-emerald-300',
      glow: 'group-hover:shadow-emerald-50',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      border: 'border-blue-100 hover:border-blue-300',
      glow: 'group-hover:shadow-blue-50',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100 hover:border-amber-300',
      glow: 'group-hover:shadow-amber-50',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100 hover:border-purple-300',
      glow: 'group-hover:shadow-purple-50',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.emerald;

  return (
    <div
      className={`group relative bg-white p-5 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${scheme.border} ${scheme.glow}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-2 font-mono tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl ${scheme.bg} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
