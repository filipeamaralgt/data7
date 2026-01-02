
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppContext } from "@/components/context/AppContext";
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';

const currencyShort = (value) => {
    if (value === null || value === undefined) return ''; // Handle null/undefined values
    if (value >= 1000) {
        // Ensure that it's formatted as 'R$X.Xk' or 'R$Xk'
        const formattedValue = (value / 1000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 });
        // Remove trailing .0 if present
        return `R$${formattedValue.endsWith('.0') ? formattedValue.slice(0, -2) : formattedValue}k`;
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const fullCurrency = (v) => {
    if (v === null || v === undefined) return ''; // Handle null/undefined values
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const metricConfigs = {
    vendas: { 
      key: 'vendas', 
      name: 'Vendas', 
      color: '#f59e0b', 
      format: (v) => v?.toLocaleString() || '', 
      formatFull: (v) => v?.toLocaleString() || '' 
    },
    faturamento: { 
      key: 'faturamento', 
      name: 'Faturamento', 
      color: '#16a34a', 
      format: currencyShort, 
      formatFull: fullCurrency 
    },
    ticket: { 
      key: 'ticket', 
      name: 'Ticket Médio', 
      color: '#2563eb', 
      format: currencyShort, 
      formatFull: fullCurrency 
    },
    reunioes: { 
      key: 'reunioes', 
      name: 'Reuniões', 
      color: '#06b6d4', 
      format: (v) => v?.toLocaleString() || '', 
      formatFull: (v) => v?.toLocaleString() || '' 
    },
    conversaoReunioes: { 
      key: 'conversaoReunioes', 
      name: 'Tx. Conversão', 
      color: '#db2777', 
      format: (v) => v !== null && v !== undefined ? `${v.toFixed(1)}%` : '', 
      formatFull: (v) => v !== null && v !== undefined ? `${v.toFixed(1)}%` : '' 
    },
};

export default function MetricasCloser({ data }) {
  const { theme } = useAppContext();
  const [activeMetric, setActiveMetric] = useState('vendas');

  const currentMetric = metricConfigs[activeMetric];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
          <p style={{ color: currentMetric.color }}>
            {`${currentMetric.name}: ${currentMetric.formatFull(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle className="text-slate-900 dark:text-slate-50">Métricas por Closer</CardTitle>
        <ChipGroup>
            <ChipButton isActive={activeMetric === 'vendas'} onClick={() => setActiveMetric('vendas')}>Vendas</ChipButton>
            <ChipButton isActive={activeMetric === 'faturamento'} onClick={() => setActiveMetric('faturamento')}>Faturamento</ChipButton>
            <ChipButton isActive={activeMetric === 'ticket'} onClick={() => setActiveMetric('ticket')}>Ticket</ChipButton>
            <ChipButton isActive={activeMetric === 'reunioes'} onClick={() => setActiveMetric('reunioes')}>Reuniões</ChipButton>
            <ChipButton isActive={activeMetric === 'conversaoReunioes'} onClick={() => setActiveMetric('conversaoReunioes')}>Conversão</ChipButton>
        </ChipGroup>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id={`color-${currentMetric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={currentMetric.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={currentMetric.color} stopOpacity={0.5}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#374155" : "#E5E7EB"} />
            <XAxis dataKey="nome" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={currentMetric.format} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar 
              dataKey={currentMetric.key} 
              name={currentMetric.name} 
              fill={`url(#color-${currentMetric.key})`} 
              radius={[4, 4, 0, 0]} 
              barSize={40}
              label={{ 
                position: 'insideTop', 
                formatter: (value) => currentMetric.format(value), 
                fill: '#fff', 
                fontSize: 12,
                dy: 5,
                fontWeight: 'bold'
              }} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
