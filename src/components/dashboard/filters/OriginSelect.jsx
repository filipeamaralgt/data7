import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppContext } from "@/components/context/AppContext";
import PillSelect from './PillSelect';

const origins = [
  "Todas as Origens",
  "Meta Ads",
  "Google Ads",
  "Tik Tok Ads",
  "Instagram Orgânico",
  "Youtube Orgânico",
  "Whatsapp",
  "E-mail",
  "Lista de Leads",
  "Null"
];

export default function OriginSelect() {
  const { origin, setOrigin, theme } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSelect = (o) => {
    setOrigin(o, true);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-haspopup="listbox">
          <PillSelect icon={<Share2 className="h-4 w-4" />} label={origin} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={`w-[240px] p-1 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}>
        <div className="flex flex-col gap-1">
          {origins.map(o => (
            <button
              key={o}
              onClick={() => handleSelect(o)}
              className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                origin === o
                  ? (theme === 'dark' ? 'bg-gray-800 font-semibold' : 'bg-gray-100 font-semibold')
                  : (theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}