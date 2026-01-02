
import React, { useState, useMemo } from "react";
import OverviewChart from "./OverviewChart";
import { useAppContext } from "@/components/context/AppContext";
import VendasBarChart from "./VendasBarChart";
import HeaderRow from "./HeaderRow";
import VendasPorFunilCard from "./VendasPorFunilCard";
import { ChipGroup, ChipButton } from "./Chip";
import { Lightbulb } from "lucide-react";

/* ===================== DADOS (exemplo) ===================== */
const vendasDia = [
  { label:'seg', data:'06/10/2025', vendas:12 },
  { label:'ter', data:'07/10/2025', vendas:14 },
  { label:'qua', data:'08/10/2025', vendas:18 },
  { label:'qui', data:'09/10/2025', vendas:13 },
  { label:'sex', data:'10/10/2025', vendas:21 },
  { label:'sáb', data:'11/10/2025', vendas:6  },
  { label:'dom', data:'12/10/2025', vendas:5  },
];
const vendasSemana = [
  { label:'Semana 1', intervalo:'30/09–06/10/2025', vendas:44 },
  { label:'Semana 2', intervalo:'07/10–13/10/2025', vendas:52 },
  { label:'Semana 3', intervalo:'14/10–20/10/2025', vendas:36 },
  { label:'Semana 4', intervalo:'21/10–27/10/2025', vendas:41 },
];
const vendasMes = [
    { label: 'Out/24', vendas: 210 },
    { label: 'Nov/24', vendas: 245 },
    { label: 'Dez/24', vendas: 310 },
    { label: 'Jan/25', vendas: 290 },
    { label: 'Fev/25', vendas: 260 },
    { label: 'Mar/25', vendas: 320 },
];
const vendasAno = [
    { label: '2022', vendas: 1850 },
    { label: '2023', vendas: 2500 },
    { label: '2024', vendas: 3120 },
    { label: '2025', vendas: 2400 },
];


/* ===================== Componente ===================== */
export function ChartsBottom({ activeChart }) {
  const [tempoMode, setTempoMode] = useState('dia');
  const { theme } = useAppContext();

  const barData = useMemo(() => {
    switch(tempoMode) {
      case 'dia': return vendasDia;
      case 'semana': return vendasSemana;
      case 'mes': return vendasMes;
      case 'ano': return vendasAno;
      default: return vendasDia;
    }
  }, [tempoMode]);

  const summaryStats = useMemo(() => {
    if (!barData || barData.length === 0) {
      return { total: 0, media: 0, mediana: 0, acimaDaMedia: 0 };
    }

    const total = barData.reduce((sum, item) => sum + item.vendas, 0);
    const media = total / barData.length;
    
    // Kept for insight generation, but not displayed directly
    const acimaDaMedia = barData.filter(item => item.vendas > media).length;

    // Calculate Median (Kept for insight generation)
    const sortedVendas = [...barData].map(item => item.vendas).sort((a, b) => a - b);
    const mid = Math.floor(sortedVendas.length / 2);
    const mediana = sortedVendas.length % 2 !== 0 
      ? sortedVendas[mid] 
      : (sortedVendas[mid - 1] + sortedVendas[mid]) / 2;

    return {
      total,
      media: Math.round(media),
      mediana: Math.round(mediana), // Still computed for insight logic
      acimaDaMedia, // Still computed for insight logic
    };
  }, [barData]);

  const generatedInsight = useMemo(() => {
    const { media, mediana, acimaDaMedia, total } = summaryStats;
    if (total === 0) return "Não há dados de vendas para gerar um insight.";

    if (media > mediana * 1.2) {
        return `O resultado foi impulsionado por picos de vendas, com ${acimaDaMedia} períodos se destacando acima da média de ${media} vendas.`;
    }

    if (tempoMode === 'dia' && barData.length === 7) {
        const weekdaySales = barData.slice(0, 5).reduce((s, d) => s + d.vendas, 0) / 5;
        const weekendSales = barData.slice(5, 7).reduce((s, d) => s + d.vendas, 0) / 2;
        if (weekdaySales > weekendSales * 1.5) {
            return "As vendas mostram uma queda característica durante o fim de semana, uma oportunidade para campanhas específicas.";
        }
    }
    
    const tempoLabel = tempoMode === 'mes' ? 'mês' : tempoMode;
    return `O desempenho de vendas foi estável, com uma média de ${media} vendas por ${tempoLabel}.`;
  }, [summaryStats, tempoMode, barData]);
  
  const VENDAS_MODES = [
    { value: 'dia', label: 'Dia' },
    { value: 'semana', label: 'Semana' },
    { value: 'mes', label: 'Mês' },
    { value: 'ano', label: 'Ano' },
  ];

  return (
    <>
      <div className="space-y-6">
        <OverviewChart chartType={activeChart} />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="
              rounded-2xl border border-slate-200/70 bg-white
              dark:bg-slate-900 dark:border-slate-800 shadow-sm
              p-6 sm:p-8
            ">
            <HeaderRow
              title="Vendas"
              right={
                <ChipGroup>
                  {VENDAS_MODES.map(mode => (
                    <ChipButton
                      key={mode.value}
                      isActive={tempoMode === mode.value}
                      onClick={() => setTempoMode(mode.value)}
                    >
                      {mode.label}
                    </ChipButton>
                  ))}
                </ChipGroup>
              }
            />
            <div className="mt-4">
              <VendasBarChart data={barData} />
            </div>

            <div className="mt-6 border-t border-slate-200/70 dark:border-slate-800 pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Vendas</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{summaryStats.total}</p>
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Média de Vendas</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{summaryStats.media}</p>
                    </div>
                </div>

                <div className="rounded-xl bg-blue-50 dark:bg-blue-900/50 p-4 text-blue-900 dark:text-blue-200 flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                    <p className="font-medium text-sm">
                        {generatedInsight}
                    </p>
                </div>
            </div>
          </div>

          <VendasPorFunilCard />
        </div>
      </div>
    </>
  );
}
