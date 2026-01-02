import React, { useState } from 'react';
import { User2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppContext } from "@/components/context/AppContext";
import PillSelect from './PillSelect';

const closers = ["Todos os Closers", "Carlos Silva", "Ana Paula", "Mariana Costa", "Rafael Lima"];

export default function CloserSelect() {
  const { closer, setCloser, theme } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSelect = (c) => {
    setCloser(c, true);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-haspopup="listbox">
          <PillSelect icon={<User2 className="h-4 w-4" />} label={closer} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={`w-[240px] p-1 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
        <div className="flex flex-col gap-1">
          {closers.map(c => (
            <button
              key={c}
              onClick={() => handleSelect(c)}
              className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                closer === c
                  ? (theme === 'dark' ? 'bg-gray-800 font-semibold' : 'bg-gray-100 font-semibold')
                  : (theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}