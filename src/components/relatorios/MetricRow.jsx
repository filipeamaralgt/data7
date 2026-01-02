import React from 'react';
import { DeltaBadge } from '@/components/metrics-delta';

export default function MetricRow({ icon, label, value, delta, invertGood = false, theme, isPeriodRow = false }) {
  const themeClasses = {
    container: theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-50',
    label: theme === 'dark' ? 'text-slate-300' : 'text-slate-600',
    value: theme === 'dark' ? 'text-slate-50' : 'text-slate-900',
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 ${themeClasses.container}`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${theme === 'dark' ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
          {icon}
        </div>
        <span className={`font-medium text-sm ${themeClasses.label}`}>{label}</span>
      </div>
      <div className="flex items-center gap-8">
        <span className={`font-bold text-base text-right ${isPeriodRow ? 'w-auto' : 'w-28'} ${themeClasses.value}`}>{value}</span>
        <div className="w-32 flex justify-end">
          {!isPeriodRow && <DeltaBadge delta={delta} invertColor={invertGood} />}
        </div>
      </div>
    </div>
  );
}