import React, { useState } from "react";
import {
  startOfDay, endOfDay, subDays, subMonths, startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter, startOfYear, endOfYear, format, subQuarters, subYears,
} from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Filter, Calendar, ChevronDown, User, Compass } from "lucide-react";

const FUNIS = [
  "Funil Geral","Sessão Estratégica","Social Selling","Isca de Baleia","Webinar",
  "Saque Dinheiro","Aplicação","Indicação","Infoproduto","Prospeção Ativa",
  "Evento Presencial","Desconhecido"
];

const CLOSERS = ["Todos os Closers","Squad A","Squad B","Carlos Silva","Ana Paula","Mariana Costa Fonseca"];

const presets = [
  { id: "today", label: "Hoje", fn: () => [startOfDay(new Date()), endOfDay(new Date())] },
  { id: "yesterday", label: "Ontem", fn: () => {
      const y = subDays(new Date(), 1);
      return [startOfDay(y), endOfDay(y)];
    }
  },
  { id: "last7", label: "Últimos 7 dias", fn: () => [startOfDay(subDays(new Date(), 6)), endOfDay(new Date())] },
  { id: "last30", label: "Últimos 30 dias", fn: () => [startOfDay(subDays(new Date(), 29)), endOfDay(new Date())] },
  { id: "prevMonth", label: "Mês passado", fn: () => {
      const m = subMonths(new Date(), 1);
      return [startOfMonth(m), endOfMonth(m)];
    }
  },
  { id: "lastQuarter", label: "Último trimestre", fn: () => {
      const q = subQuarters(new Date(), 1);
      return [startOfQuarter(q), endOfQuarter(q)];
    }
  },
  { id: "thisYear", label: "Este ano", fn: () => [startOfYear(new Date()), endOfYear(new Date())] },
  { id: "lastYear", label: "Ano passado", fn: () => {
      const y = subYears(new Date(), 1);
      return [startOfYear(y), endOfYear(y)];
    }
  },
];

export default function FilterBar({
  funnel, setFunnel,
  closer, setCloser,
  range, setRange, // range: [startDate, endDate]
}) {
  const [openPreset, setOpenPreset] = useState(false);

  const applyPreset = (p) => {
    const [start, end] = p.fn();
    setRange([start, end]);
    setOpenPreset(false);
  };

  const rangeLabel = `${format(range[0], "d MMM, y", {locale: ptBR})} – ${format(range[1], "d MMM, y", {locale: ptBR})}`;

  return (
    <div
      className="
        w-full flex flex-wrap gap-3 items-center
        rounded-2xl border bg-white px-3 py-2 shadow-sm
        dark:bg-[#0F172A] dark:border-white/10
      "
      role="group"
      aria-label="Filtros"
    >
      {/* Chip: Filtros (estático) */}
      <div className="flex items-center gap-2 rounded-full px-3 py-2.5 text-sm dark:border-neutral-700">
        <Filter className="w-4 h-4 opacity-70" />
        <span className="font-semibold">Filtros</span>
      </div>

      {/* Funil */}
      <div className="relative flex items-center">
        <Compass className="pointer-events-none absolute left-3 h-4 w-4 opacity-70" />
        <select
          className="
            min-w-[180px] appearance-none rounded-full border bg-gray-50
            py-2.5 pl-9 pr-8 text-sm font-medium
            hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300
            dark:bg-[#1E293B] dark:border-white/10 dark:hover:border-white/20
          "
          value={funnel}
          onChange={(e) => setFunnel(e.target.value)}
        >
          {FUNIS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 opacity-60" />
      </div>

      {/* Closers */}
      <div className="relative flex items-center">
        <User className="pointer-events-none absolute left-3 h-4 w-4 opacity-70" />
        <select
          className="
            min-w-[180px] max-w-[180px] xl:max-w-[220px] appearance-none rounded-full border bg-gray-50
            py-2.5 pl-9 pr-8 text-sm font-medium
            hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300
            dark:bg-[#1E293B] dark:border-white/10 dark:hover:border-white/20 truncate
          "
          value={closer}
          onChange={(e) => setCloser(e.target.value)}
        >
          {CLOSERS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 opacity-60" />
      </div>

      {/* Datas */}
      <div className="relative ml-auto">
        <button
          onClick={() => setOpenPreset((v) => !v)}
          className="
            inline-flex items-center gap-2.5 rounded-full border bg-gray-50 px-4 py-2.5 text-sm
            hover:border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-300
            dark:bg-[#1E293B] dark:border-white/10 dark:hover:border-white/20
          "
          aria-haspopup="listbox"
          aria-expanded={openPreset}
        >
          <Calendar className="h-4 w-4 opacity-70" />
          <span className="font-medium">{rangeLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </button>

        {openPreset && (
          <ul
            role="listbox"
            className="
              absolute right-0 z-50 mt-2 max-h-[360px] w-[260px] overflow-auto
              rounded-xl border bg-white p-1 shadow-lg
              dark:bg-neutral-900 dark:border-neutral-700
            "
          >
            {presets.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => applyPreset(p)}
                  className="
                    w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100
                    dark:hover:bg-neutral-800
                  "
                >
                  {p.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}