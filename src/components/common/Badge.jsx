import React from 'react';

const Badge = ({ type, text, size = 'md' }) => {
  const isPromotion = type === 'ترفيع وظيفي' || text === 'ترفيع وظيفي';
  const isAllowance = type === 'علاوة سنوية' || text === 'علاوة سنوية';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (isPromotion) {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200/80 font-semibold';
  } else if (isAllowance) {
    colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200/80 font-semibold';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-xs ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isPromotion ? 'bg-amber-500 animate-pulse' : isAllowance ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      />
      {text || type}
    </span>
  );
};

export default Badge;
