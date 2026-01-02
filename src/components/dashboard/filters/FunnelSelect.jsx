
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppContext } from "@/components/context/AppContext";
import PillSelect from './PillSelect';

const defaultOptions = [
  "Sessão Estratégica",
  "Turbinados", // Added "Turbinados"
  "Social Selling",
  "Isca de Baleia",
  "Webinar",
  "Saque Dinheiro",
  "Aplicação",
  "Youtube",
  "Indicação",
  "Infoproduto",
  "Prospeção Ativa",
  "Evento Presencial",
  "Desconhecido",
];

export default function FunnelSelect({ value, onChange, options = defaultOptions }) {
  const { theme } = useAppContext();
  const [open, setOpen] = useState(false);

  const handleSelect = (f) => {
    onChange(f);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-haspopup="listbox">
          <PillSelect icon={<Filter className="h-4 w-4" />} label={value} />
        </button>
      </PopoverTrigger>
      <PopoverContent className={`w-[240px] p-1 pb-2 rounded-xl shadow-lg border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white'}`}> {/* Added pb-2 here */}
        <div className="flex flex-col gap-1">
          {options.length > 0 ? (
            options.map(f => (
              <button
                key={f}
                onClick={() => handleSelect(f)}
                className={`text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                  value === f
                    ? (theme === 'dark' ? 'bg-gray-800 font-semibold' : 'bg-gray-100 font-semibold')
                    : (theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100')
                }`}
              >
                {f}
              </button>
            ))
          ) : (
            <div className={`px-3 py-2 text-sm text-gray-500 ${theme === 'dark' ? 'text-gray-400' : ''}`}>
              Nenhum funil disponível.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
