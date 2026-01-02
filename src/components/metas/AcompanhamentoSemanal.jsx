
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, CheckCircle2 } from 'lucide-react';
import ConfiguracaoSemanasDialog from './ConfiguracaoSemanasDialog';
import { Meta } from '@/entities/Meta';
import { format, startOfMonth, endOfMonth, addDays, getMonth, getFullYear, isBefore, isAfter } from 'date-fns';
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { useAppContext } from "@/components/context/AppContext";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';
import AnaliseSemana from './AnaliseSemana';

// Reusing icons and configs from ProjetadoRealizado
import { icons, metricTypesConfig, metricOrder } from './shared';

const mockMonthlyRealizedData = {
    'Semana 1': { faturamento: 150000, vendas: 15, leads: 300, mqls: 90, agendamentos: 70, reunioes: 42, investimento: 11000, cash_collect: 120000 },
    'Semana 2': { faturamento: 165000, vendas: 16, leads: 320, mqls: 95, agendamentos: 75, reunioes: 45, investimento: 11500, cash_collect: 130000 },
    'Semana 3': { faturamento: 145000, vendas: 14, leads: 290, mqls: 85, agendamentos: 68, reunioes: 40, investimento: 10500, cash_collect: 115000 },
    'Semana 4': { faturamento: 254150, vendas: 25, leads: 510, mqls: 152, agendamentos: 117, reunioes: 72, investimento: 20600, cash_collect: 215320 },
};

// A self-contained period picker for this component to avoid context/prop drilling issues
const AcompanhamentoSemanalPeriodPicker = ({ initial, onChange }) => {
    const [value, setValue] = useState(initial);

    const handleChange = (newValue) => {
        setValue(newValue);
        onChange(newValue);
    };

    return <CompactDateRangePicker value={value} onChange={handleChange} />;
};


const generateDefaultWeekConfig = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    let weeks = [];
    let currentDay = start;

    // Generate first 3 weeks (7 days each)
    for (let i = 1; i <= 3; i++) {
        const weekStart = currentDay;
        const weekEnd = addDays(currentDay, 6);
        if (isAfter(weekEnd, end)) break;
        weeks.push({
            week: `Semana ${i}`,
            start: weekStart,
            end: weekEnd,
        });
        currentDay = addDays(weekEnd, 1);
    }

    // The remaining days form the last week.
    // This check ensures we add a final week only if there are days remaining in the month
    // from where currentDay left off, up to the end of the month.
    if (isBefore(currentDay, addDays(end, 1))) { // currentDay <= end
        weeks.push({
            week: `Semana ${weeks.length + 1}`, // This will correctly name it 'Semana X' based on prior weeks
            start: currentDay,
            end: end,
        });
    }
    return weeks;
};

const renderValue = (value, type, showIcon = false) => {
    const config = metricTypesConfig[type] || {};
    
    let displayValue;
    if (value === null || value === undefined || isNaN(value)) {
        displayValue = '-';
    } else {
        switch (config.unit) {
            case 'currency':
                displayValue = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                break;
            case 'multiplier':
                displayValue = `${value.toLocaleString('pt-BR', {maximumFractionDigits: 2})}x`;
                break;
            case 'percentage':
                 displayValue = `${value.toLocaleString('pt-BR', {maximumFractionDigits: 1})}%`;
                 break;
            default:
                displayValue = value.toLocaleString('pt-BR');
                break;
        }
    }
    
    return (
        <div className="flex items-center justify-end gap-1">
            <span>{displayValue}</span>
            {showIcon && displayValue !== '-' && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
        </div>
    );
};

const calculateDerivedMetrics = (data) => {
    return {
        ...data,
        roas: data.investimento > 0 ? data.faturamento / data.investimento : 0,
        ticket_medio: data.vendas > 0 ? data.faturamento / data.vendas : 0,
        cpl: data.leads > 0 ? data.investimento / data.leads : 0,
        cpmql: data.mqls > 0 ? data.investimento / data.mqls : 0,
        custo_agendamento: data.agendamentos > 0 ? data.investimento / data.agendamentos : 0,
        custo_reuniao: data.reunioes > 0 ? data.investimento / data.reunioes : 0,
        cpa: data.vendas > 0 ? data.investimento / data.vendas : 0,
        taxa_cash_collect: data.faturamento > 0 ? (data.cash_collect / data.faturamento) * 100 : 0,
        tx_conversao: data.leads > 0 ? (data.vendas / data.leads) * 100 : 0,
    };
}


export default function AcompanhamentoSemanal() {
    const { funnel, setFunnel } = useAppContext();
    const [monthlyGoals, setMonthlyGoals] = useState([]);
    const [isConfigOpen, setIsConfigOpen] = useState(false);
    const [view, setView] = useState('geral'); // 'geral' or 'semana_1', 'semana_2', etc.

    const initialDateRange = useMemo(() => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        preset: "Este mês",
    }), []);
    const [dateRange, setDateRange] = useState(initialDateRange);
    
    const [weekConfig, setWeekConfig] = useState(() => generateDefaultWeekConfig(new Date(dateRange.start)));
    
    useEffect(() => {
        const fetchAndSetup = async () => {
            const selectedMonthDate = new Date(dateRange.start);
            
            // Fetch ALL goals, then filter on the client.
            const allGoals = await Meta.list('-ano -mes');
            const currentMonthGoals = allGoals.filter(g => 
                g.mes === (getMonth(selectedMonthDate) + 1) && 
                g.ano === getFullYear(selectedMonthDate)
            );
            setMonthlyGoals(currentMonthGoals);
            
            const newWeekConfig = generateDefaultWeekConfig(selectedMonthDate);
            setWeekConfig(newWeekConfig);
            setView('geral'); // Reset view when date changes
        };
        fetchAndSetup();
    }, [dateRange]);

    const processedData = useMemo(() => {
        const numWeeks = weekConfig.length;
        if (numWeeks === 0) return { tableData: [], weeklyData: {} };
        
        // 1. Get weekly realized data and calculate derived metrics
        const weeklyRealized = weekConfig.reduce((acc, week) => {
            const rawData = mockMonthlyRealizedData[week.week] || {};
            acc[week.week] = calculateDerivedMetrics(rawData);
            return acc;
        }, {});
        
        // 2. Calculate totals
        const totalRealizedRaw = metricOrder.reduce((acc, metric) => {
             acc[metric] = weekConfig.reduce((sum, week) => sum + (weeklyRealized[week.week]?.[metric] || 0), 0);
             return acc;
        }, {});
        const totalRealized = calculateDerivedMetrics(totalRealizedRaw);

        // 3. Build the final data structure for the table
        const tableData = metricOrder.map(metricType => {
            const config = metricTypesConfig[metricType] || {};
            const monthlyGoal = monthlyGoals.find(g => g.tipo === metricType)?.valor_meta;
            const weeklyGoal = (monthlyGoal && numWeeks > 0) ? monthlyGoal / numWeeks : null;

            const weeklyValues = weekConfig.map(week => {
                const realized = weeklyRealized[week.week]?.[metricType];
                const achieved = weeklyGoal !== null && realized !== undefined ?
                    (config.smallerIsBetter ? realized <= weeklyGoal : realized >= weeklyGoal)
                    : false;
                return { realized, achieved };
            });

            return {
                icon: icons[metricType],
                name: metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                type: metricType,
                monthlyGoal,
                weeklyGoal,
                weeklyValues,
                total: totalRealized[metricType],
            };
        });

        // 4. Structure data for single-week view
        const weeklyData = weekConfig.reduce((acc, week, index) => {
            acc[`semana_${index + 1}`] = metricOrder.map(metricType => {
                const metricInfo = tableData.find(item => item.type === metricType);
                return {
                    ...metricInfo,
                    realized: metricInfo.weeklyValues[index].realized,
                    achieved: metricInfo.weeklyValues[index].achieved,
                };
            });
            return acc;
        }, {});

        return { tableData, weeklyData };

    }, [monthlyGoals, weekConfig]);
    
    return (
        <>
            <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 shadow-lg">
                <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-slate-900 dark:text-slate-50">Performance Semanal</CardTitle>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <FunnelSelect value={funnel} onChange={setFunnel} />
                        <AcompanhamentoSemanalPeriodPicker
                            initial={initialDateRange}
                            onChange={setDateRange}
                        />
                        <Button variant="outline" size="icon" onClick={() => setIsConfigOpen(true)}>
                            <Settings className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>

                <div className="px-6 pb-4">
                    <ChipGroup>
                        <ChipButton isActive={view === 'geral'} onClick={() => setView('geral')}>Visão Geral</ChipButton>
                        {weekConfig.map((week, index) => (
                             <ChipButton 
                                key={week.week}
                                isActive={view === `semana_${index + 1}`}
                                onClick={() => setView(`semana_${index + 1}`)}
                            >
                                {week.week}
                            </ChipButton>
                        ))}
                    </ChipGroup>
                </div>
                
                <CardContent>
                    {view === 'geral' ? (
                        <div className="border rounded-lg dark:border-slate-800 overflow-x-auto scrollbar-slim">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                                        <TableHead className="sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">Dados</TableHead>
                                        <TableHead className="text-right">Meta Mensal</TableHead>
                                        <TableHead className="text-right">Meta Semanal</TableHead>
                                        {weekConfig.map(week => (
                                            <TableHead key={week.week} className="text-right">{week.week}</TableHead>
                                        ))}
                                        <TableHead className="text-right font-bold">Total (Parcial)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedData.tableData.map(item => (
                                        <TableRow key={item.name} className="dark:border-slate-800">
                                            <TableCell className="sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {item.icon}
                                                    <span>{item.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{renderValue(item.monthlyGoal, item.type)}</TableCell>
                                            <TableCell className="text-right whitespace-nowrap">{renderValue(item.weeklyGoal, item.type)}</TableCell>
                                            {item.weeklyValues.map((weekValue, index) => (
                                                <TableCell key={index} className="text-right whitespace-nowrap">
                                                    {renderValue(weekValue.realized, item.type, weekValue.achieved)}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-right font-bold whitespace-nowrap">{renderValue(item.total, item.type)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                     ) : (
                        <AnaliseSemana data={processedData.weeklyData[view]} />
                     )}
                </CardContent>
            </Card>

            <ConfiguracaoSemanasDialog 
                isOpen={isConfigOpen}
                onClose={() => setIsConfigOpen(false)}
                config={weekConfig}
                onSave={(newConfig) => {
                    setWeekConfig(newConfig);
                    setIsConfigOpen(false);
                }}
            />
        </>
    );
}

