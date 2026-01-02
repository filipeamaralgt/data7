
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAppContext } from "@/components/context/AppContext";

export default function HeaderSearchBar({ value, onChange, placeholder }) {
  const { theme } = useAppContext();

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
        theme === "dark" ? "text-gray-500" : "text-gray-400"
      }`} />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-[320px] h-10 pl-9 pr-3 rounded-2xl border text-sm transition-colors
          ${
            theme === 'dark'
              ? 'border-gray-700 bg-gray-900 hover:bg-gray-800 placeholder:text-gray-500'
              : 'border-gray-200 bg-white hover:bg-gray-50 placeholder:text-gray-500'
          }
        `}
      />
    </div>
  );
}
