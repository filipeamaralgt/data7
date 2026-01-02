import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAppContext } from "@/components/context/AppContext";

export default function PillSelect({ icon, label }) {
  const { theme } = useAppContext();

  return (
    <div
      className={`
        min-w-[184px] h-10
        inline-flex items-center justify-between gap-2 rounded-2xl border px-3 py-2 shadow-sm transition-colors
        ${
          theme === 'dark'
            ? 'border-gray-700 bg-gray-900 hover:bg-gray-800'
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <div className="flex items-center gap-2">
        <span className={`shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{icon}</span>
        <span className={`font-medium text-sm whitespace-nowrap ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{label}</span>
      </div>
      <ChevronDown className={`h-4 w-4 shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
    </div>
  );
}