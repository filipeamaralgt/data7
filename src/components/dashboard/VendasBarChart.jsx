
import React from "react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from "recharts";
import { useAppContext } from "@/components/context/AppContext";


const VENDAS_LEGENDA_PX = 14;

const BarTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const p = payload[0].payload;
    const title = p.label || p.data || p.intervalo;
    const value = p.vendas;
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 shadow-lg text-sm dark:bg-slate-900/90 dark:border-slate-700">
        <p className="font-bold text-slate-800 dark:text-slate-200">{title}</p>
        <p className="text-slate-600 dark:text-slate-400">Vendas: {value}</p>
      </div>
    );
  }
  return null;
};

const renderVendasLabel = ({ x = 0, y = 0, width = 0, height = 0, value }) => {
  if (!value || height < 20) return null;
  const cx = x + width / 2;
  const cy = y + 16; // Adjusted for better positioning with new font size
  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="middle"
      fill="#FFFFFF"
      fontWeight={600}
      fontSize={VENDAS_LEGENDA_PX}
    >
      {value}
    </text>
  );
};

export default function VendasBarChart({ data }) {
  const { theme } = useAppContext();

  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={24}>
          <CartesianGrid vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "#E9EEF5"} />
          <XAxis
            dataKey='label'
            tick={{ fontSize: VENDAS_LEGENDA_PX, fill: theme === 'dark' ? '#94a3b8' : '#0f172a', fontWeight: 700 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: VENDAS_LEGENDA_PX, fill: theme === 'dark' ? '#94a3b8' : '#64748B' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip 
            content={<BarTooltip />} 
            cursor={{ fill: theme === 'dark' ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
            wrapperStyle={{ fontSize: VENDAS_LEGENDA_PX }}
          />
          <Bar
            dataKey="vendas"
            fill="#22C55E"
            radius={[10, 10, 4, 4]}
            maxBarSize={54}
          >
            <LabelList dataKey="vendas" content={renderVendasLabel} position="top" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
