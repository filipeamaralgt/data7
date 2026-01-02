import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, Line } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Prioritize bar data (type 'rect') if available, otherwise take the first payload item
    const data = payload.find(p => p.type === 'rect')?.payload || payload[0]?.payload; 
    
    // Find line data for mqlRate if it exists in the payload
    const lineData = payload.find(p => p.dataKey === 'mqlRate');
    // Use the line's value if found, otherwise calculate from bar data
    const mqlRate = lineData ? lineData.value : (data.leads > 0 ? (data.mqls / data.leads) * 100 : 0);
    
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-lg text-sm min-w-[200px]">
        <p className="font-bold text-slate-800 dark:text-slate-200 mb-3">{format(new Date(label), "d 'de' LLL, yyyy", { locale: ptBR })}</p>
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#0F172A]"></div>
                    <span className="text-slate-600 dark:text-slate-400">Leads:</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.leads}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#47a3ab]"></div>
                    <span className="text-slate-600 dark:text-slate-400">MQL:</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.mqls}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                    <span className="text-slate-600 dark:text-slate-400">% MQLs:</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{mqlRate.toFixed(2)}%</span>
            </div>
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                    <span className="text-slate-600 dark:text-slate-400">Agendamentos:</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{data.agendamentos}</span>
            </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderTotalLeadsLabel = (props) => {
    const { x, y, width, value } = props;
    if (!value || y < 20) return null;
    return (
        <text x={x + width / 2} y={y - 5} fill="#334155" textAnchor="middle" fontSize={11} fontWeight="bold" className="dark:fill-slate-300">
            {value}
        </text>
    );
};

export default function FunilDiarioChart({ data }) {
  const chartData = data.map(item => {
    const { date, leads, mqls, agendamentos } = item;
    // For stacking, we need segments. Let's assume MQLs are part of Leads, and Agendamentos are part of MQLs.
    const mqlsSegment = mqls - agendamentos;
    const leadsSegment = leads - mqls;

    return {
      dateLabel: date,
      leads: leads, // Keep original total for labels
      mqls: mqls, // Keep original for tooltip
      agendamentos,
      leadsSegment,
      mqlsSegment,
      mqlRate: leads > 0 ? (mqls / leads) * 100 : 0
    };
  });


  return (
    <div className="h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 5, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128, 128, 128, 0.1)" />
          <XAxis 
            dataKey="dateLabel" 
            tickFormatter={(dateStr) => format(new Date(dateStr), 'd/MM')}
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            tickFormatter={(value) => `${value.toFixed(0)}%`}
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
          <Legend wrapperStyle={{ fontSize: '14px' }}/>
          
          <Bar yAxisId="left" dataKey="leadsSegment" name="Leads" stackId="a" fill="#0F172A" >
            <LabelList dataKey="leads" content={renderTotalLeadsLabel} />
          </Bar>
          <Bar yAxisId="left" dataKey="mqlsSegment" name="MQL" stackId="a" fill="#47a3ab" />
          <Bar yAxisId="left" dataKey="agendamentos" name="Agendamentos" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />

          <Line 
            yAxisId="right"
            type="monotone"
            dataKey="mqlRate"
            name="% MQLs"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}