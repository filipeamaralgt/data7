import React from 'react';

export function ChipGroup({ children, className }) {
  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-xl ring-1 ring-slate-200 bg-slate-100 self-center dark:ring-slate-700 dark:bg-slate-800 ${className || ''}`}>
      {children}
    </div>
  );
}

export function ChipButton({ children, isActive, ...props }) {
  const baseClasses = "h-[26px] px-3 rounded-lg text-xs font-semibold leading-none transition-all";
  const activeClasses = "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white";
  const inactiveClasses = "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white";

  return (
    <button
      {...props}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {children}
    </button>
  );
}