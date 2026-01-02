import React from "react";
import { useAppContext } from "@/components/context/AppContext";

export default function HeaderRow({ title, right }) {
    const { theme } = useAppContext();
    return (
      <div className="flex items-center justify-between gap-3">
        <h3 className={`text-[20px] font-semibold whitespace-nowrap leading-tight ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-3">
          {right}
        </div>
      </div>
    );
};