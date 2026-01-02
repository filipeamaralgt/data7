
import React, { useState, useMemo } from "react";
import { useAppContext } from "@/components/context/AppContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  Line,
  LineChart,
  LabelList,
} from "recharts";
import { startOfDay, endOfDay, subMonths, startOfYear, endOfYear, subYears, differenceInDays } from "date-fns";
import HeaderRow from "./HeaderRow";


// --- Paleta de Cores ---
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const AMBER = "#D97706"; // Cor de "Ouro" para Cash Collect (original, now for other uses if any)
const TEAL = "#14B8A6"; // Nova cor para o valor de Cash Collect e Taxa de Cash Collect
const CYAN = "#06B6D4"; // Cor para Investimento
const VIOLET = "#7C3AED";

// --- Dados de Exemplo ---
// Dados mensais para os gráficos legados
const monthlySampleData = [
  { date: '2025-01-15', label: "jan/25", faturamento: 148000, cash: 68000, investimento: 28000, roas: 8.5, cpl: 35, cpmql: 120, custo_agendamento: 180 },
  { date: '2025-02-15', label: "fev/25", faturamento: 152000, cash: 72000, investimento: 29000, roas: 9.2, cpl: 38, cpmql: 125, custo_agendamento: 190 },
  { date: '2025-03-15', label: "mar/25", faturamento: 160000, cash: 74000, investimento: 31000, roas: 16.1, cpl: 32, cpmql: 110, custo_agendamento: 170 },
  { date: '2025-04-15', label: "abr/25", faturamento: 155000, cash: 70000, investimento: 30000, roas: 12.5, cpl: 34, cpmql: 115, custo_agendamento: 175 },
  { date: '2025-05-15', label: "mai/25", faturamento: 171000, cash: 88000, investimento: 35000, roas: 6.8, cpl: 40, cpmql: 140, custo_agendamento: 210 },
  { date: '2025-06-15', label: "jun/25", faturamento: 168000, cash: 86000, investimento: 34000, roas: 7.4, cpl: 39, cpmql: 135, custo_agendamento: 200 },
  { date: '2025-07-15', label: "jul/25", faturamento: 165000, cash: 64000, investimento: 33000, roas: 7.0, cpl: 36, cpmql: 130, custo_agendamento: 195 },
  { date: '2025-08-15', label: "ago/25", faturamento: 178000, cash: 70000, investimento: 38000, roas: 9.8, cpl: 42, cpmql: 150, custo_agendamento: 220 },
  { date: '2025-09-15', label: "set/25", faturamento: 185000, cash: 74000, investimento: 40000, roas: 11.2, cpl: 45, cpmql: 160, custo_agendamento: 230 },
  { date: '2025-10-15', label: "out/25", faturamento: 179000, cash: 72000, investimento: 39000, roas: 10.9, cpl: 43, cpmql: 155, custo_agendamento: 225 },
  { date: '2025-11-15', label: "nov/25", faturamento: 190000, cash: 110000, investimento: 42000, roas: 8.5, cpl: 48, cpmql: 170, custo_agendamento: 250 },
  { date: '2025-12-15', label: "dez/25", faturamento: 210000, cash: 78000, investimento: 45000, roas: 9.8, cpl: 50, cpmql: 180, custo_agendamento: 260 },
].map(item => ({
    ...item,
    taxaCash: item.faturamento > 0 ? (item.cash / item.faturamento) * 100 : 0,
}));

// Dados diários para o gráfico de custos e seguidores
const dailySampleData = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const novos_seguidores = 50 + Math.floor(Math.random() * 100);
    const investimento_perfil = 100 + Math.floor(Math.random() * 50);
    const visitas_perfil = novos_seguidores * (Math.random() * 8 + 6); // Ex: entre 6 e 14 visitas por seguidor
    return {
        date: `2025-10-${String(day).padStart(2, '0')}`,
        label: `${String(day).padStart(2, '0')}/10`,
        faturamento: 0, cash: 0, investimento: 0, roas: 0,
        cpl: 30 + (i % 7) * 2 + Math.random() * 4,
        cpmql: 110 + (i % 10) * 3 + Math.random() * 10,
        custo_agendamento: 170 + (i % 5) * 7 + Math.random() * 20,
        novos_seguidores: novos_seguidores,
        investimento_perfil: investimento_perfil,
        custo_seguidor: novos_seguidores > 0 ? investimento_perfil / novos_seguidores : 0,
        visitas_perfil: visitas_perfil,
        conversao_perfil: visitas_perfil > 0 ? (novos_seguidores / visitas_perfil) * 100 : 0,
    };
});

// --- Utils ---
const formatMoeda = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatPct = (v) => `${v.toFixed(2)}%`;
const formatRoas = (v) => `${v.toFixed(1)}x`;
const currencyShort = (v) => {
    if (v >= 1_000_000) return "R$ " + (v / 1_000_000).toFixed(1) + " mi";
    if (v >= 1000) return "R$ " + (v / 1000).toFixed(0) + " mil";
    return "R$ " + v;
};

// --- Tooltip Personalizado ---
const CustomTooltip = ({ active, payload, label, theme, chartType }) => {
  if (active && payload && payload.length) {
    return (
      <div className={`rounded-xl border shadow-lg text-sm transition-all ${theme === 'dark' ? 'bg-slate-900/80 border-slate-700 backdrop-blur-sm' : 'bg-white/80 border-slate-200 backdrop-blur-sm'}`}>
        <div className="p-3">
            <p className={`font-bold mb-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{label}</p>
            {payload.map(p => {
              let formattedValue;
              switch (p.dataKey) {
                case 'taxaCash':
                case 'conversao_perfil': formattedValue = formatPct(p.value); break;
                case 'roas': formattedValue = formatRoas(p.value); break;
                case 'novos_seguidores':
                case 'visitas_perfil': formattedValue = p.value.toLocaleString(); break;
                case 'custo_seguidor':
                case 'investimento_perfil': formattedValue = formatMoeda(p.value); break;
                default: formattedValue = formatMoeda(p.value); break;
              }
              return (
                <div key={p.dataKey} style={{ color: p.stroke }} className="flex items-center mt-1.5">
                  <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.color || p.stroke }}></span>
                  <span className={`font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{p.name}:</span>
                  <b className={`ml-2 font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>{formattedValue}</b>
                </div>
              )
            })}
        </div>
      </div>
    );
  }
  return null;
};

// --- Legenda Personalizada ---
const CustomLegend = ({ payload, theme }) => {
  return (
    <div className="flex justify-center items-center gap-6 pt-4">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 cursor-pointer">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// This function is no longer directly used for filtering in `useMemo` as `item.date` is preferred.
// Keeping it for potential other uses where label parsing might be needed.
const parseLabelToDate = (label) => {
    const monthMap = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
    const [monthStr, yearStr] = label.split('/');
    const month = monthMap[monthStr];
    const year = parseInt(yearStr, 10) + 2000;
    return new Date(year, month, 1);
};

// --- Configurações do Gráfico ---
const chartConfigs = {
  faturamento: {
    title: "Faturamento vs Cash Collect",
    yAxisFormat: currencyShort,
    components: [
      { key: 'faturamento', name: 'Faturamento', type: 'Area', color: GREEN, yAxisId: 'left', dot: true },
      { key: 'cash', name: 'Cash Collect', type: 'Area', color: TEAL, yAxisId: 'left', dot: false }
    ]
  },
  roas: {
    title: "ROAS por Período",
    yAxisFormat: formatRoas,
    components: [
      { key: 'roas', name: 'ROAS', type: 'Area', color: VIOLET, yAxisId: 'left', dot: true }
    ]
  },
  investimento: {
    title: "Investimento por Período",
    yAxisFormat: currencyShort,
    components: [
      { key: 'investimento', name: 'Investimento', type: 'Area', color: CYAN, yAxisId: 'left', dot: true }
    ]
  },
  cash_collect: {
    title: "% Cash Collect por Período",
    yAxisFormat: formatPct,
    components: [
      { key: 'taxaCash', name: '% Cash Collect', type: 'Area', color: AMBER, yAxisId: 'left', dot: true }
    ]
  },
  seguidores: {
    title: "Evolução da Aquisição de Seguidores",
    yAxisFormat: (v) => v.toLocaleString(), // Left axis (count)
    yAxis2Format: formatMoeda, // Right axis (currency)
    yAxis3Format: formatPct, // Right % axis
    components: [
      { key: 'novos_seguidores', name: 'Novos Seguidores', type: 'Area', color: BLUE, yAxisId: 'left', dot: false },
      { key: 'custo_seguidor', name: 'Custo por Seguidor', type: 'Line', color: VIOLET, yAxisId: 'right', dot: true },
      { key: 'investimento_perfil', name: 'Investimento no Perfil', type: 'Line', color: GREEN, yAxisId: 'right', dot: false },
      { key: 'conversao_perfil', name: 'Conversão de Perfil', type: 'Line', color: AMBER, yAxisId: 'right_pct', dot: true },
    ]
  },
  custos_funil: {
    title: "Evolução dos Custos de Funil",
    yAxisFormat: formatMoeda,
    components: [
      { key: 'cpl', name: 'CPL', type: 'Area', color: CYAN, yAxisId: 'left', dot: true },
      { key: 'cpmql', name: 'Custo por MQL', type: 'Area', color: VIOLET, yAxisId: 'left', dot: true },
      { key: 'custo_agendamento', name: 'Custo por Agendamento', type: 'Area', color: TEAL, yAxisId: 'left', dot: true }
    ]
  }
};


// --- Componente Principal ---
export default function OverviewChart({ chartType = 'faturamento', externalRange, datePickerComponent, metricFilter = 'geral', showDataLabels = true }) {
  const { theme } = useAppContext();

  // Determine if the chart should use daily data
  const isDailyChart = chartType === 'custos_funil' || chartType === 'seguidores';
  const sourceData = isDailyChart ? dailySampleData : monthlySampleData;

  // Se um range externo é fornecido, ele tem precedência. Caso contrário, usa um estado interno com default.
  // Default para 6 meses atrás até hoje
  const [internalRange, setInternalRange] = useState({ start: startOfDay(subMonths(new Date(), 6)), end: endOfDay(new Date()) });
  const range = externalRange || internalRange;

  const dayDifference = useMemo(() => {
    if (!range || !range.start || !range.end) return 0;
    // Ensure dates are valid before calculating difference
    try {
        const start = new Date(range.start);
        const end = new Date(range.end);
        // Check for valid Date objects before calculating difference
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return 0;
        }
        return differenceInDays(end, start);
    } catch {
        return 0;
    }
  }, [range]);

  const displayInterval = (chartType === 'custos_funil' && dayDifference > 15) ? 2 : 1;

  const filteredData = useMemo(() => {
    // Retorna todos os dados se o range for inválido ou não definido
    if (!range || !range.start || !range.end) {
        return sourceData;
    }

    const rangeStart = new Date(range.start);
    const rangeEnd = new Date(range.end);

    return sourceData.filter(item => {
        // Assume all items in sourceData now have a 'date' property parseable by new Date()
        const itemDate = new Date(item.date);
        // Ensure that the comparison is made with valid Date objects
        return itemDate >= rangeStart && itemDate <= rangeEnd;
    });
  }, [range, sourceData]); // Depende do range e da fonte de dados (que pode mudar com chartType)

  const config = chartConfigs[chartType];
  const hasRightAxis = config.components.some(c => c.yAxisId === 'right');
  const hasRightPctAxis = config.components.some(c => c.yAxisId === 'right_pct');

  const displayedComponents = useMemo(() => {
    if ((chartType !== 'custos_funil' && chartType !== 'seguidores') || !metricFilter || metricFilter === 'geral') {
      return config.components;
    }
    return config.components.filter(c => c.key === metricFilter);
  }, [config.components, metricFilter, chartType]);

  const ChartContainer = displayedComponents.length > 0 && displayedComponents.some(c => c.type === 'Area') ? AreaChart : LineChart;

  const renderCustomLabel = (props) => {
    const { x, y, value, index, dataKey } = props; // Add dataKey to props

    // Previne renderização se não houver valor ou se o índice não corresponder ao intervalo de exibição
    if (value === null || value === undefined || index % displayInterval !== 0) return null;

    const textProps = {
      x: x,
      y: y,
      dy: -15, // Aumentado para mais espaço
      fill: theme === 'dark' ? '#E2E8F0' : '#334155', // Cor mais forte
      fontSize: 12,
      fontWeight: '600',
      textAnchor: 'middle', // Padrão: centralizado
    };

    // Para o primeiro rótulo, alinha o texto para começar no ponto (não centralizar)
    if (index === 0) {
      textProps.textAnchor = 'start';
    }
    // Para o último rótulo, alinha o texto para terminar no ponto
    if (index === filteredData.length - 1) {
      textProps.textAnchor = 'end';
    }

    // Determine the formatter based on the dataKey's yAxisId
    const componentConfig = config.components.find(c => c.key === dataKey);
    let formatter = config.yAxisFormat;
    if (componentConfig) {
      if (componentConfig.yAxisId === 'right' && config.yAxis2Format) {
        formatter = config.yAxis2Format;
      } else if (componentConfig.yAxisId === 'right_pct' && config.yAxis3Format) {
          formatter = config.yAxis3Format;
      }
    }

    const formattedValue = formatter(value);

    return (
      <text {...textProps}>
        {formattedValue}
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
      <style>{`
        .recharts-surface { border-radius: 0.75rem; }
        .recharts-brush-background { rx: 8px; ry: 8px; }
        .recharts-brush-traveller rect { rx: 4px; ry: 4px; }
      `}</style>
      <HeaderRow
        title={config.title}
        right={datePickerComponent} // Renderiza o componente de seleção de data passado como prop
      />
      <div className="mt-4 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <ChartContainer data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            {displayedComponents.map(c => (
              <defs key={`def-${c.key}`}>
                <linearGradient id={`${c.key}Fill`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c.color} stopOpacity={chartType === 'faturamento' ? 0.08 : 0.15}/>
                  <stop offset="95%" stopColor={c.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
            ))}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
            <XAxis dataKey="label" tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 13 }} axisLine={false} tickLine={false} />

            <YAxis yAxisId="left" tickFormatter={config.yAxisFormat} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />

            {hasRightAxis && (
                <YAxis yAxisId="right" orientation="right" tickFormatter={config.yAxis2Format || config.yAxisFormat} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
            )}

             {hasRightPctAxis && (
                <YAxis yAxisId="right_pct" orientation="right" tickFormatter={config.yAxis3Format || formatPct} tick={{ fill: theme === 'dark' ? '#94a3b8' : '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} width={80} domain={[0, 'dataMax + 5']} />
            )}

            <Tooltip content={<CustomTooltip theme={theme} chartType={chartType} />} />
            <Legend content={<CustomLegend theme={theme} />} />

            {displayedComponents.map(c => {
              const ChartComponent = c.type === 'Line' ? Line : Area;
              return (
                <ChartComponent
                  key={c.key}
                  yAxisId={c.yAxisId}
                  type="monotone"
                  dataKey={c.key}
                  name={c.name}
                  stroke={c.color}
                  fill={c.type === 'Area' ? `url(#${c.key}Fill)` : 'none'}
                  strokeWidth={2.5}
                  dot={c.dot && showDataLabels ? (props) => {
                      if (props.index % displayInterval !== 0) return null;
                      return <circle cx={props.cx} cy={props.cy} r={5} strokeWidth={2.5} stroke={c.color} fill={theme === 'dark' ? '#0F172A' : '#FFFFFF'} />;
                  } : false}
                  activeDot={{ r: 7, stroke: theme === 'dark' ? '#0F172A' : '#FFFFFF', strokeWidth: 3, fill: c.color }}
                >
                   {c.dot && showDataLabels && <LabelList dataKey={c.key} content={renderCustomLabel} />}
                </ChartComponent>
              )
            })}

            {/* Renderiza o Brush apenas se houver mais de 12 pontos de dados */}
            { filteredData.length > 12 && (
              <Brush
                  dataKey="label"
                  height={20}
                  stroke={theme === 'dark' ? '#475569' : '#e2e8f0'}
                  fill={theme === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.6)'}
                  travellerWidth={10}
              />
            )}
          </ChartContainer>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
