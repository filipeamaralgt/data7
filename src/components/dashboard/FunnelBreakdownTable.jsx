
import React from "react";
import { DeltaBadge } from "../metrics-delta";
import { Trophy } from "lucide-react";

function HeaderCell({ children, className = "" }) {
  return (
    <th
      className={`
        px-6 py-3 sticky top-0
        text-xs font-semibold uppercase tracking-wider text-left
        bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm
        text-slate-500 dark:text-slate-400
        ${className}
      `}
    >
      {children}
    </th>
  );
}

function DataCell({ children, className = "" }) {
  return (
    <td
      className={`
      px-6 py-4
      text-sm font-medium
      text-slate-800 dark:text-slate-200
      whitespace-nowrap
      ${className}
    `}
    >
      {children}
    </td>
  );
}

function RankMedal({ rank }) {
    const goldTrophyUrl = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/95f18c3b1_image.png";

    if (rank === 1) {
        return (
            <div className="ml-auto shrink-0 flex items-center justify-center h-7 w-7">
                <img 
                    src={goldTrophyUrl} 
                    alt="Troféu de Ouro (1º lugar)"
                    className="h-full w-full object-contain"
                />
            </div>
        );
    }

    const styles = {
      2: { iconColor: 'text-slate-400', bgColor: 'bg-slate-400/10' },
      3: { iconColor: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    };
  
    if (rank > 3 || rank < 2) return null;
    const { iconColor, bgColor } = styles[rank];
  
    return (
      <div className={`ml-auto shrink-0 flex items-center justify-center rounded-full h-6 w-6 ${bgColor}`}>
        <Trophy className={`h-4 w-4 ${iconColor}`} fill="currentColor" />
      </div>
    );
}

export function FunnelBreakdownTable({ mode, rows }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-64 overflow-y-auto scrollbar-slim relative">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <HeaderCell>Funil</HeaderCell>
            <HeaderCell className="text-center">
              {mode === 'faturamento' ? 'Faturamento' : 'Vendas'}
            </HeaderCell>
            <HeaderCell className="text-right">% do total</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {rows
            .filter(r => r.name.toLowerCase() !== 'funil geral')
            .map((r, index) => (
              <tr
                key={r.id}
                className="border-t border-slate-100 dark:border-slate-800"
              >
                <DataCell className="!whitespace-normal break-words">
                  <div className="flex items-center gap-3 w-full">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ background: r.color }}
                    />
                    <span className="text-slate-900 dark:text-slate-100">
                      {r.name}
                    </span>
                    {r.delta != null && (
                      <DeltaBadge deltaPct={r.delta} className="ml-2 shrink-0" />
                    )}
                    <RankMedal rank={index + 1} />
                  </div>
                </DataCell>

                <DataCell className="text-center tabular-nums text-slate-900 dark:text-slate-100">
                  {mode === "faturamento" ? r.valorFormatado : r.vendas.toLocaleString('pt-BR')}
                </DataCell>

                <DataCell className="text-right tabular-nums text-slate-600 dark:text-slate-400">{r.share}%</DataCell>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
