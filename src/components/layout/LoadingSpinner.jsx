import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div 
        className="w-12 h-12 rounded-full animate-spin border-8 border-solid border-gray-200 border-t-[#3B82F6] dark:border-slate-700 dark:border-t-[#3B82F6]"
      />
    </div>
  );
}