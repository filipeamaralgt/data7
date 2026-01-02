
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChipGroup, ChipButton } from "@/components/dashboard/Chip";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';

const CustomTooltip = ({ active, payload, label, barColor2 }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const totalLeads = data.leads;
        const mqls = data.mqls;
        const mqlRate = totalLeads > 0 ? (mqls / totalLeads) * 100 : 0;

        return (
            <div className="bg-white dark:bg-slate-950 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Leads: {totalLeads.toLocaleString('pt-BR')}</p>
                <p className="text-sm" style={{ color: barColor2 || '#06b6d4' }}>MQLs: {mqls.toLocaleString('pt-BR')}</p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tx. MQL: {mqlRate.toFixed(2)}%</p>
            </div>
        );
    }
    return null;
};

export default function PerformanceBreakdownChart({ title, data, dataKey = "name", barColor1 = '#3b82f6', barColor2 = '#06b6d4' }) {
    const [sortBy, setSortBy] = useState('mqlVolume');

    const processedData = useMemo(() => {
        const calculated = data.map(item => ({
            ...item,
            mqlRate: item.leads > 0 ? (item.mqls / item.leads) : 0,
            nonMqls: item.leads - item.mqls,
        }));

        if (sortBy === 'mqlVolume') {
            return calculated.sort((a, b) => b.mqls - a.mqls);
        }
        if (sortBy === 'mqlRate') {
            return calculated.sort((a, b) => b.mqlRate - a.mqlRate);
        }
        return calculated;
    }, [data, sortBy]);

    return (
        <Card className="dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800 h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>{title}</CardTitle>
                    <ChipGroup>
                        <ChipButton isActive={sortBy === 'mqlVolume'} onClick={() => setSortBy('mqlVolume')}>Volume de MQL</ChipButton>
                        <ChipButton isActive={sortBy === 'mqlRate'} onClick={() => setSortBy('mqlRate')}>Taxa de MQL</ChipButton>
                    </ChipGroup>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={processedData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                        <XAxis dataKey={dataKey} fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={80} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip barColor2={barColor2} />} />
                        <Legend wrapperStyle={{ fontSize: "14px", paddingTop: '20px' }}/>
                        <Bar dataKey="nonMqls" name="Leads (Não qualificados)" stackId="a" fill={barColor1} radius={[0, 0, 0, 0]} barSize={40} />
                        <Bar dataKey="mqls" name="MQLs" stackId="a" fill={barColor2} radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="mqls" position="center" style={{ fill: 'white', fontSize: 12, fontWeight: 'bold' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
