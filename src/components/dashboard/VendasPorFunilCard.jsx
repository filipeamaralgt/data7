
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Sector, Tooltip as RechartsTooltip,
} from "recharts";
import React, { useState, useMemo } from "react";
import FunnelCard from "../funis/FunnelCard";
import { useAppContext } from "@/components/context/AppContext";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import { startOfMonth, endOfMonth } from "date-fns";
import HeaderRow from "./HeaderRow";
import { FunnelBreakdownTable } from "./FunnelBreakdownTable";
import { ChipGroup, ChipButton } from "./Chip";
import { DeltaBadge } from "../metrics-delta";

const pieCardSampleData = [
  { funil: "Sessão Estratégica", faturamento: 121000, vendas: 58 },
  { funil: "Social Selling", faturamento: 49000, vendas: 21 },
  { funil: "Webinar", faturamento: 31500, vendas: 14 },
  { funil: "Funil Geral", faturamento: 21000, vendas: 9 },
  { funil: "Indicação", faturamento: 15500, vendas: 7 },
  { funil: "Isca de Baleia", faturamento: 12000, vendas: 6 },
  { funil: "Aplicação", faturamento: 9800, vendas: 5 },
  { funil: "Saque Dinheiro", faturamento: 7600, vendas: 4 },
  { funil: "Infoproduto", faturamento: 7200, vendas: 4 },
  { funil: "Prospecção Ativa", faturamento: 5400, vendas: 3 },
  { funil: "Desconhecido", faturamento: 3000, vendas: 2 },
  { funil: "Evento Presencial", faturamento: 8500, vendas: 3 },
];

const FUNIL_COLORS = {
  "Sessão Estratégica": "bg-blue-600",
  "Social Selling": "bg-orange-500",
  Webinar: "bg-purple-500",
  "Funil Geral": "bg-slate-500",
  Indicação: "bg-emerald-500",
  "Isca de Baleia": "bg-pink-500",
  Aplicação: "bg-sky-500",
  "Saque Dinheiro": "bg-amber-600",
  Infoproduto: "bg-indigo-600",
  "Prospecção Ativa": "bg-lime-600",
  Desconhecido: "bg-slate-400",
  "Evento Presencial": "bg-red-500",
};

const PIECHART_COLORS = {
    "Sessão Estratégica": "#2563EB",
    "Social Selling": "#F97316",
    Webinar: "#A855F7",
    "Funil Geral": "#64748B",
    Indicação: "#10B981",
    "Isca de Baleia": "#EC4899",
    Aplicação: "#0EA5E9",
    "Saque Dinheiro": "#CA8A04",
    Infoproduto: "#4F46E5",
    "Prospecção Ativa": "#65A30D",
    Desconhecido: "#94A3B8",
    "Evento Presencial": "#EF4444",
};

const currency = (v, compact = false) => {
    if (compact) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            notation: 'compact',
            maximumFractionDigits: 1
        }).format(v);
    }
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function lighten(hex, amount = 0.18) {
  const toRgb = h => {
    const m = h.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [23,71,209];
  };
  const [r,g,b] = toRgb(hex).map(v => v/255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b); 
  let h,s,l = (max+min)/2;
  if(max===min){ h=s=0; } else {
    const d = max-min;
    s = l>0.5 ? d/(2-max-min) : d/(max+min);
    switch(max){
      case r: h = (g-b)/d + (g<b?6:0); break;
      case g: h = (b-r)/d + 2; break;
      case b: h = (r-g)/d + 4; break;
    }
    h/=6;
  }
  l = Math.min(1, l + amount);
  function hslToRgb(h,s,l){
    if(s===0){ const v=l*255; return [v,v,v]; }
    const hue2rgb=(p,q,t)=>{ if(t<0)t+=1; if(t>1)t-=1; if(t<1/6)return p+(q-p)*6*t; if(t<1/2)return q; if(t<2/3)return p+(q-p)*(2/3-t)*6; return p; };
    const q = l<0.5 ? l*(1+s) : l+s-l*s;
    const p = 2*l-q;
    const r_val = hue2rgb(p,q,h+1/3), g_val=hue2rgb(p,q,h), b_val=hue2rgb(p,q,h-1/3);
    return [Math.round(r_val*255), Math.round(g_val*255), Math.round(b_val*255)];
  }
  const [R,G,B] = hslToRgb(h,s,l);
  const hex2 = (n)=>('#'+((1<<24)+(n[0]<<16)+(n[1]<<8)+n[2]).toString(16).slice(1));
  return hex2([R,G,B]);
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  const hoverFill = lighten(fill, 0.20);

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={hoverFill}
      />
    </g>
  );
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  // Apenas exibe o rótulo para fatias maiores que 7% para evitar poluição visual
  if (percent * 100 < 7) {
    return null;
  }
  // Ajuste do raio para melhor posicionamento, movendo o rótulo para fora
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="font-bold text-xs pointer-events-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};


export default function VendasPorFunilCard() {
    const [funnelMode, setFunnelMode] = useState('vendas');
    const [activeIndex, setActiveIndex] = useState(null);
    const { theme } = useAppContext();

    const { totalFaturamento, totalVendas, funisAtivos } = useMemo(() => {
        const ativos = pieCardSampleData.filter(f => f.faturamento > 0 || f.vendas > 0);
        const totals = ativos.reduce((acc, item) => {
            acc.totalFaturamento += item.faturamento;
            acc.totalVendas += item.vendas;
            return acc;
        }, { totalFaturamento: 0, totalVendas: 0 });

        return {
            ...totals,
            funisAtivos: ativos.length
        };
    }, []);

    const chartData = useMemo(() => {
        const totalValue = pieCardSampleData.reduce((sum, item) => sum + item[funnelMode === 'faturamento' ? 'faturamento' : 'vendas'], 0);
        return pieCardSampleData.map(f => ({
          name: f.funil,
          value: f[funnelMode === 'faturamento' ? 'faturamento' : 'vendas'],
          pct: totalValue ? (f[funnelMode === 'faturamento' ? 'faturamento' : 'vendas'] / totalValue) : 0,
          color: PIECHART_COLORS[f.funil] ?? "#94A3B8",
        })).sort((a,b) => b.value - a.value);
    }, [funnelMode]);

    const funnelRows = useMemo(() => {
        const total = pieCardSampleData.reduce(
            (acc, r) => acc + (funnelMode === "vendas" ? r.vendas : r.faturamento),
            0
        ) || 1;

        const sorted = [...pieCardSampleData].sort((a, b) => 
            (funnelMode === "vendas" ? b.vendas : b.faturamento) - 
            (funnelMode === "vendas" ? a.vendas : a.faturamento)
        );

        return sorted.map((r, i) => ({
            id: r.funil,
            name: r.funil,
            color: PIECHART_COLORS[r.funil] || "#94A3B8",
            vendas: r.vendas,
            valorFormatado: currency(r.faturamento, true), // ex: R$ 121k
            share: Math.round(((funnelMode === "vendas" ? r.vendas : r.faturamento) / total) * 100),
            delta: i % 3 === 0 ? null : (Math.random() * 20 - 10),
        }));
    }, [funnelMode]);

    const initial = useMemo(
        () => ({
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
          preset: "Este mês",
        }),
        []
    );

    const PieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
          const { name, value, pct } = payload[0].payload;
          const pctFmt = (pct * 100).toFixed(1) + "%";
          const valueFmt = funnelMode === 'faturamento' ? currency(value) : `${value.toLocaleString("pt-BR")} vendas`;
          return (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-xl text-sm dark:bg-slate-900/90 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-slate-200">{`${name}: ${valueFmt} | ${pctFmt}`}</p>
            </div>
          );
        }
        return null;
    };

    const pieChartComponent = (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip content={<PieTooltip />} cursor={false} />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={120}
                paddingAngle={1.5}
                isAnimationActive={true}
                animationDuration={220}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={(_, idx) => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
    );

    const handleFunilDateChange = (newRange) => {
        console.log("Período do Funil (VendasPorFunilCard) alterado para:", newRange);
    };

    // Mock data for deltas. In a real scenario, this would come from a comparison.
    const totalDeltas = {
        faturamento: 8.2,
        vendas: 11.5,
        funis: -5.0,
    };

    return (
        <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm p-6 sm:p-8 flex flex-col">
            <HeaderRow
              title="Vendas por Funil"
              right={
                <div className="flex items-center gap-3">
                  <ChipGroup>
                    <ChipButton
                      isActive={funnelMode === 'vendas'}
                      onClick={() => setFunnelMode("vendas")}
                    >
                      Vendas
                    </ChipButton>
                    <ChipButton
                      isActive={funnelMode === 'faturamento'}
                      onClick={() => setFunnelMode("faturamento")}
                    >
                      Faturamento
                    </ChipButton>
                  </ChipGroup>
                  <LocalPeriodPicker
                    storageKey="period:card-vendas-por-funil"
                    initial={initial}
                    onChange={handleFunilDateChange}
                    PeriodPicker={CompactDateRangePicker}
                  />
                </div>
              }
            />

            {/* Totals & Chart Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center my-4">
                {/* Left Column: Totals */}
                <div className="space-y-3">
                    <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faturamento Total</p>
                            <DeltaBadge deltaPct={totalDeltas.faturamento} />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{currency(totalFaturamento)}</p>
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Vendas Totais</p>
                            <DeltaBadge deltaPct={totalDeltas.vendas} />
                        </div>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{totalVendas.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="rounded-lg p-3 bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Funis Ativos</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-slate-50 mt-1">{funisAtivos}</p>
                    </div>
                </div>

                {/* Right Column: Pie Chart */}
                <div className="flex items-center justify-center">
                    {pieChartComponent}
                </div>
            </div>

            <div className="mt-auto">
              <FunnelBreakdownTable mode={funnelMode} rows={funnelRows} />
            </div>
        </div>
    );
}
