import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-white shadow-emerald-100',
    error: 'border-rose-200 bg-white shadow-rose-100',
    info: 'border-sky-200 bg-white shadow-sky-100',
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 animate-bounce-in max-w-md">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${borders[type] || borders.info}`}
      >
        {icons[type] || icons.info}
        <p className="text-sm font-medium text-slate-800 leading-normal">{message}</p>
        <button
          onClick={onClose}
          className="mr-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
