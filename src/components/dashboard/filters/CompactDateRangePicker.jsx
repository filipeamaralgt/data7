
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppContext } from "@/components/context/AppContext";

function fmt(d, f = "d 'de' LLL, yyyy") {
  if (!d) return "";
  return format(new Date(d), f, { locale: ptBR });
}

export default function CompactDateRangePicker({ value, onChange }) {
  const context = useAppContext();

  // Determine se o componente é controlado ou usa o contexto global
  const isControlled = value && onChange;

  // Seleciona a fonte da verdade
  const dateRange = isControlled ? value : context.dateRange;
  const applyDatePreset = isControlled ? (preset) => {
    const p = context.datePresets.find((x) => x.key === preset);
    if(p) {
        const r = p.get();
        onChange({ start: r.start.toISOString(), end: r.end.toISOString(), preset });
    }
  } : context.applyDatePreset;
  
  const applyManualDateRange = isControlled ? (range) => {
    onChange({ start: range.start.toISOString(), end: range.end.toISOString(), preset: 'Personalizado' });
  } : context.applyManualDateRange;

  const theme = context.theme; // Theme é sempre do contexto

  const [open, setOpen] = useState(false);
  const [draftRange, setDraftRange] = useState({
    from: dateRange?.start ? new Date(dateRange.start) : new Date(),
    to: dateRange?.end ? new Date(dateRange.end) : new Date(),
  });
  
  const [months, setMonths] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2);

  useEffect(() => {
    const handleResize = () => {
      setMonths(window.innerWidth < 768 ? 1 : 2);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (dateRange?.start && dateRange?.end) {
      setDraftRange({ from: new Date(dateRange.start), to: new Date(dateRange.end) });
    }
  }, [dateRange?.start, dateRange?.end]);

  const label =
    dateRange.preset && dateRange.preset !== "Personalizado"
      ? dateRange.preset
      : `${fmt(dateRange.start, "d/MM/yy")} - ${fmt(dateRange.end, "d/MM/yy")}`;

  const handleApply = () => {
    if (draftRange.from && draftRange.to) {
      applyManualDateRange({ start: draftRange.from, end: draftRange.to });
      setOpen(false);
    }
  };

  const handlePresetClick = (key) => {
      applyDatePreset(key);
      setOpen(false);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`
              w-[184px] min-w-[184px] max-w-[184px] h-[40px]
              inline-flex items-center gap-2
              px-3
              rounded-xl border shadow-sm cursor-pointer
              transition-colors
              ${
              theme === 'dark' 
                ? 'border-gray-700 bg-gray-900 hover:bg-gray-800' 
                : 'border-slate-200 bg-white hover:bg-gray-50'
            }`}
          >
            <CalendarIcon className="w-4 h-4 stroke-slate-400 shrink-0" />
            <span className={`
              flex-1 min-w-0 whitespace-nowrap overflow-hidden truncate
              text-left font-semibold text-sm
              ${theme === 'dark' ? 'text-slate-50' : 'text-slate-900'}`
            }>
              {label}
            </span>
            <ChevronDown className="w-4 h-4 stroke-slate-400 shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className={`w-auto p-0 max-w-[min(92vw,820px)] rounded-2xl border shadow-2xl ${
            theme === 'dark' ? 'bg-[#0F172A] border-gray-700' : 'bg-white border-gray-200'
          }`}
          align="end"
        >
          <div className="grid gap-4 p-4 md:grid-cols-[220px,1fr]">
            {/* Presets */}
            <div className="max-h-[360px] overflow-auto pr-1 md:border-r md:pr-4">
              <div className={`mb-2 text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Rápido
              </div>
              <div className="flex flex-col">
                {context.datePresets.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePresetClick(p.key)}
                    className={`text-left rounded-xl px-3 py-2 text-sm ${
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                  >
                    {p.key}
                  </button>
                ))}
              </div>
            </div>

            {/* Calendário */}
            <div className="min-w-[280px]">
              <div className={`mb-2 text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Personalizado
              </div>
              <div className={`rounded-2xl border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <Calendar
                  locale={ptBR}
                  mode="range"
                  numberOfMonths={months}
                  selected={draftRange}
                  onSelect={(r) => setDraftRange(r ?? { from: undefined, to: undefined })}
                  weekStartsOn={1}
                  showOutsideDays
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {draftRange.from && draftRange.to
                    ? `${fmt(draftRange.from, "d 'de' LLLL")} – ${fmt(draftRange.to, "d 'de' LLLL")}`
                    : "Selecione início e fim"}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button
                    disabled={!draftRange.from || !draftRange.to}
                    onClick={handleApply}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
