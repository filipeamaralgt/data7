
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Button } from '@/components/ui/button';
import { useAppContext } from "@/components/context/AppContext";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import { startOfMonth, endOfMonth, getDaysInMonth, format } from 'date-fns';
import { DollarSign, Target, PiggyBank, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdanOptimizationDialog from '@/components/investimento/AdanOptimizationDialog';

const formatCurrency = (value) => {
    if (value === null || value === undefined) return "R$ 0,00";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatCurrencyForLabel = (value) => {
    if (value === null || value === undefined) return "";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Dados simulados para o mês atual
const generateDailyData = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const metaMensal = 75000;
    const metaDiariaInicial = metaMensal / daysInMonth;

    return Array.from({ length: daysInMonth }, (_, i) => {
        const dia = i + 1;
        const variacao = (Math.random() - 0.5) * 800; // Variação de -400 a +400
        return {
            dia: format(new Date(date.getFullYear(), date.getMonth(), dia), 'dd/MM'),
            dateObj: new Date(date.getFullYear(), date.getMonth(), dia),
            gasto: Math.max(0, metaDiariaInicial + variacao),
            meta: metaDiariaInicial
        };
    });
};

const CustomizedLabel = (props) => {
    const { x, y, value, index, dataLength } = props;
    if (value === null || value === undefined) return null;

    let displayInterval = 1;
    if (dataLength > 15) {
      displayInterval = Math.floor(dataLength / 7); // Show ~7 labels for long ranges
    } else if (dataLength > 7) {
      displayInterval = 2; // Show every other label for mid ranges
    }

    // Always show first and last, and others based on interval
    if (index !== 0 && index !== dataLength - 1 && index % displayInterval !== 0) {
        return null;
    }

    return (
        <text x={x} y={y} dy={-12} fill="#8c5c00" fontSize={12} fontWeight="bold" textAnchor="middle">
            {formatCurrencyForLabel(value)}
        </text>
    );
};

export default function Investimento() {
    const { theme, funnel, setFunnel } = useAppContext();
    const [dateRange, setDateRange] = useState({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date())
    });

    const [originalData] = useState(() => generateDailyData(new Date()));
    const [investmentData, setInvestmentData] = useState(originalData);
    const [metaMensal] = useState(75000);
    const [autoRedistribute, setAutoRedistribute] = useState(false);
    const [isAdanDialogOpen, setIsAdanDialogOpen] = useState(false);

    const handleRedistribute = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const gastoRealizado = investmentData
            .filter(d => d.dateObj < today)
            .reduce((sum, day) => sum + day.gasto, 0);

        const orcamentoRestante = metaMensal - gastoRealizado;
        const diasRestantes = investmentData.filter(d => d.dateObj >= today).length;

        if (diasRestantes > 0) {
            const novaMetaDiaria = Math.max(0, orcamentoRestante / diasRestantes);
            const updatedData = investmentData.map(day => {
                if (day.dateObj >= today) {
                    return { ...day, meta: novaMetaDiaria };
                }
                return day;
            });
            setInvestmentData(updatedData);
        }
    };

    // Efeito para ligar/desligar a redistribuição
    useEffect(() => {
        if (autoRedistribute) {
            handleRedistribute();
        } else {
            // Volta para os dados originais se a redistribuição for desligada
            setInvestmentData(originalData);
        }
    }, [autoRedistribute, originalData, metaMensal]);

    const handleConfirmOptimization = (newBudgets) => {
        // Aqui, você aplicaria a lógica de redistribuição baseada nos orçamentos confirmados.
        // Por agora, vamos apenas ativar a flag.
        setAutoRedistribute(true);
        setIsAdanDialogOpen(false);
    };
    
    const filteredData = useMemo(() => {
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999); 
        return investmentData.filter(d => {
            const dayDate = d.dateObj;
            return dayDate >= start && dayDate <= end;
        });
    }, [investmentData, dateRange]);

    const summary = useMemo(() => {
        const investidoPeriodo = filteredData.reduce((sum, day) => sum + day.gasto, 0);
        const investidoMes = investmentData.reduce((sum, day) => sum + day.gasto, 0);
        const faltaInvestir = metaMensal - investidoMes;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const metaDiariaAtual = autoRedistribute 
            ? (investmentData.find(d => d.dateObj >= today)?.meta || 0)
            : (originalData.find(d => d.dateObj >= today)?.meta || 0); 

        return { investidoPeriodo, investidoMes, faltaInvestir, metaDiariaAtual };
    }, [filteredData, investmentData, metaMensal, autoRedistribute, originalData]);
    
    const CustomTooltipContent = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
                    <p className="text-sm" style={{ color: '#a1883c' }}>Gasto: {formatCurrency(payload.find(p => p.dataKey === 'gasto')?.value || 0)}</p>
                    <p className="text-sm" style={{ color: '#a0d2eb' }}>Meta: {formatCurrency(payload.find(p => p.dataKey === 'meta')?.value || 0)}</p>
                </div>
            );
        }
        return null;
    };

    const adanDialogData = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const gastoRealizado = investmentData.filter(d => d.dateObj < today).reduce((sum, day) => sum + day.gasto, 0);
        const orcamentoRestante = metaMensal - gastoRealizado;
        const diasRestantes = investmentData.filter(d => d.dateObj >= today).length;
        return {
            orcamentoRestante,
            diasRestantes
        }
    }, [investmentData, metaMensal]);


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Controle de Investimento</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Acompanhe e gerencie seu orçamento de marketing.</p>
                </div>
                <div className="flex items-center gap-4">
                    <FunnelSelect value={funnel} onChange={setFunnel} />
                    <CompactDateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Investido no Período</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.investidoPeriodo)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Investimento Total (Mês)</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.investidoMes)}</div>
                        <p className="text-xs text-muted-foreground">Meta de {formatCurrency(metaMensal)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Falta Investir (Mês)</CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.faltaInvestir)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Meta Diária Atual</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.metaDiariaAtual)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Investimento Diário vs. Meta</CardTitle>
                            <CardDescription>Comparativo do valor gasto por dia contra a meta diária planejada.</CardDescription>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                onClick={() => setIsAdanDialogOpen(true)}
                                size="sm"
                                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/60"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Otimização IA
                            </Button>

                            <div className="flex items-center space-x-2">
                                <Label
                                    htmlFor="redistribute-switch"
                                    className="font-medium text-slate-700 dark:text-slate-300"
                                >
                                    Redistribuição Manual
                                </Label>
                                <Switch
                                    id="redistribute-switch"
                                    checked={autoRedistribute}
                                    onCheckedChange={setAutoRedistribute}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={filteredData} margin={{ top: 30, right: 20, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorGasto" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a1883c" stopOpacity={0.7}/>
                                    <stop offset="95%" stopColor="#a1883c" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorMeta" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a0d2eb" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#a0d2eb" stopOpacity={0.05}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}/>
                            <XAxis dataKey="dia" stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis 
                              stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} 
                              fontSize={12} 
                              tickLine={false} 
                              axisLine={false} 
                              tickFormatter={(value) => value.toLocaleString('pt-BR')}
                              width={80}
                            />
                            <Tooltip content={<CustomTooltipContent />} cursor={{ fill: theme === 'dark' ? 'rgba(128, 128, 128, 0.1)' : 'rgba(200, 200, 200, 0.1)' }} />
                            <Legend 
                              payload={[
                                { value: 'Valor Investido', type: 'line', id: 'gasto', color: '#a1883c' },
                                { value: 'Investimento/dia', type: 'line', id: 'meta', color: '#a0d2eb' }
                              ]}
                              wrapperStyle={{ paddingTop: '20px' }}
                            />
                            <Area type="monotone" dataKey="meta" stroke="none" fill="url(#colorMeta)" />
                            <Area type="monotone" dataKey="gasto" stroke="none" fill="url(#colorGasto)" />
                            <Line 
                                type="monotone" 
                                dataKey="meta" 
                                name="Investimento/dia" 
                                stroke="#a0d2eb" 
                                strokeWidth={2} 
                                dot={false}
                                activeDot={false}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="gasto" 
                                name="Valor Investido" 
                                stroke="#a1883c" 
                                strokeWidth={2} 
                                strokeDasharray="3 3"
                                dot={{ r: 5, fill: '#a1883c' }}
                                activeDot={{ r: 7 }}
                            >
                                <LabelList dataKey="gasto" content={(props) => <CustomizedLabel {...props} dataLength={filteredData.length} />} />
                            </Line>
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <AdanOptimizationDialog
              open={isAdanDialogOpen}
              onOpenChange={setIsAdanDialogOpen}
              onConfirm={handleConfirmOptimization}
              data={adanDialogData}
            />
        </div>
    );
}
