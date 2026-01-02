
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { ChipGroup, ChipButton } from "@/components/dashboard/Chip";
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { startOfMonth, endOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { BarChart3, PieChart as PieChartIcon, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

// --- Mock Data ---
const dailyPerformanceData = [
  { date: '29 de set', leads: 44, mqls: 20, vendas: 17, tx: 38.64, cpl: 227.73, cpa: 350.1, investimento: 10020 },
  { date: '30 de set', leads: 44, mqls: 25, vendas: 25, tx: 56.82, cpl: 195.8, cpa: 280.5, investimento: 8615 },
  { date: '1 de out', leads: 22, mqls: 10, vendas: 12, tx: 54.55, cpl: 105.32, cpa: 150.2, investimento: 2317 },
  { date: '2 de out', leads: 30, mqls: 15, vendas: 13, tx: 43.33, cpl: 83.35, cpa: 140.0, investimento: 2500 },
  { date: '3 de out', leads: 32, mqls: 18, vendas: 16, tx: 50.0, cpl: 71.72, cpa: 120.3, investimento: 2295 },
  { date: '4 de out', leads: 26, mqls: 12, vendas: 16, tx: 61.54, cpl: 106.63, cpa: 180.9, investimento: 2772 },
  { date: '5 de out', leads: 21, mqls: 9, vendas: 10, tx: 47.62, cpl: 55.13, cpa: 90.7, investimento: 1157 },
  { date: '6 de out', leads: 26, mqls: 14, vendas: 12, tx: 46.15, cpl: 45.6, cpa: 85.1, investimento: 1185 },
  { date: '7 de out', leads: 25, mqls: 11, vendas: 13, tx: 52.78, cpl: 56.48, cpa: 95.4, investimento: 1412 },
  { date: '8 de out', leads: 30, mqls: 16, vendas: 14, tx: 44.83, cpl: 55.22, cpa: 98.2, investimento: 1656 },
  { date: '9 de out', leads: 39, mqls: 22, vendas: 30, tx: 76.92, cpl: 92.95, cpa: 140.6, investimento: 3625 },
  { date: '10 de out', leads: 25, mqls: 15, vendas: 20, tx: 80.0, cpl: 110.0, cpa: 160.0, investimento: 2750 },
];

const creativePerformanceData = [
    { name: 'AD04_IMG...', vendas: 19, cpa: 71.71 },
    { name: 'AD07_IMG...', vendas: 13, cpa: 125.71 },
    { name: 'AD11_RM...', vendas: 12, cpa: 165.90 },
    { name: 'AD05_IMG...', vendas: 12, cpa: 83.17 },
    { name: 'AD06_IMG...', vendas: 12, cpa: 237.93 },
    { name: 'AD01_IMG...', vendas: 10, cpa: 139.65 },
    { name: 'AD10_IMG...', vendas: 10, cpa: 257.55 },
    { name: 'AD09_IMG...', vendas: 6, cpa: 26.63 },
    { name: 'AD08_IMG...', vendas: 3, cpa: 321.63 },
    { name: 'AD03_IMG...', vendas: 2, cpa: 153.02 },
];

const audiencePerformanceData = [
    { name: 'Público Frio 1', vendas: 35, cpa: 95.50 },
    { name: 'Público Quente', vendas: 28, cpa: 82.30 },
    { name: 'Lookalike 1%', vendas: 22, cpa: 110.10 },
    { name: 'Remarketing 7d', vendas: 18, cpa: 65.00 },
    { name: 'Interesses X', vendas: 15, cpa: 130.80 },
];

const salesByChannelData = [
    { name: 'Anúncios', ingressos: 100, percent: 50.76, color: 'bg-purple-100 dark:bg-purple-900/50' },
    { name: 'IG - Automação', ingressos: 13, percent: 6.60, color: 'bg-pink-100 dark:bg-pink-900/50' },
    { name: 'Outros', ingressos: 0, percent: 0, color: 'bg-slate-100 dark:bg-slate-800' },
    { name: 'Grupos WPP', ingressos: 10, percent: 5.08, color: 'bg-green-100 dark:bg-green-900/50' },
    { name: 'E-mail Marketing', ingressos: 12, percent: 6.09, color: 'bg-blue-100 dark:bg-blue-900/50' },
];

const audienceBreakdownData = {
    frias: { ingressos: 100, percent: 'N/A', cip: 9, conversao: '1.70%' },
    quentes: { ingressos: 67, percent: 'N/A', cip: 5, conversao: '1.51%' },
    total: { ingressos: 197, percent: 'N/A', cip: 16, conversao: 'N/A' },
};

const PIE_COLORS = ['#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1', '#F1F5F9'];

const productOptions = [
    { value: 'mentoria_premium', label: 'Mentoria Premium' },
    { value: 'curso_iniciante', label: 'Curso Iniciante' },
    { value: 'ebook_estrategias', label: 'E-book de Estratégias' },
];


// --- Sub-components ---

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const SummaryCard = ({ title, data, className }) => (
    <Card className={`dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800 flex flex-col ${className}`}>
        <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-normal text-slate-700 dark:text-slate-300">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 flex-1 flex flex-col justify-around">
            {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-md">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{key}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{value}</span>
                </div>
            ))}
        </CardContent>
    </Card>
);

const ResultCard = ({ results, className }) => (
     <Card className={`dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800 flex flex-col ${className}`}>
        <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold tracking-normal text-slate-700 dark:text-slate-300">Resultado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 flex-1 flex flex-col justify-around">
            {results.map(item => (
                <div key={item.label} className={`flex justify-between items-center p-2 rounded-md ${item.colorClass}`}>
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                </div>
            ))}
        </CardContent>
    </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isSalesChart = payload.some(p => p.dataKey === 'vendas' || p.dataKey === 'leads');
        const isLeadGenChart = payload.some(p => p.dataKey === 'mqls');

        // Tooltip para Gráfico de Pizza
        const isCostMetricPie = payload[0].dataKey === 'cpl' || payload[0].dataKey === 'cpa';
        const isVolumeMetricPie = payload[0].dataKey === 'vendas' || payload[0].dataKey === 'leads';

        if (payload[0].name && (isVolumeMetricPie || isCostMetricPie) && !label) { // If it's a pie chart and we have a name (not date label)
            const displayValue = (isCostMetricPie)
                ? payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : payload[0].value.toLocaleString('pt-BR');

            const displayLabel = payload[0].dataKey === 'leads' ? 'Leads' :
                                payload[0].dataKey === 'vendas' ? 'Vendas' :
                                payload[0].dataKey === 'cpl' ? 'CPL' :
                                payload[0].dataKey === 'cpa' ? 'CPA' : '';

            return (
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{payload[0].name}</p>
                    <p className="text-sm" style={{ color: payload[0].payload.fill }}>
                        {displayLabel}: {displayValue}
                    </p>
                    {!isCostMetricPie && (data.cpl || data.cpa) && ( // Show CPL/CPA if not the main metric displayed, and if available
                        <p className="text-sm text-slate-500">
                            {data.cpl && `CPL: ${data.cpl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                            {data.cpa && !data.cpl && `CPA: ${data.cpa.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                        </p>
                    )}
                </div>
            );
        }

        // Tooltip para outros gráficos (barras/linhas de tempo)
        return (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-slate-100">{label}</p>
                {payload.map((p, i) => {
                    const formattedValue = (p.dataKey === 'cpl' || p.dataKey === 'cpa' || p.dataKey === 'investimento')
                        ? p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        : p.value.toLocaleString('pt-BR');
                    return (
                        <p key={i} style={{ color: p.color }} className="text-sm">
                            {`${p.name}: ${formattedValue}`}
                        </p>
                    );
                })}
                {(data.tx && isSalesChart && !isLeadGenChart) && <p className="text-sm text-slate-500">{`Tx. Conversão: ${data.tx.toFixed(2)}%`}</p>}
                {(isLeadGenChart && data.leads) && <p className="text-sm text-slate-500">{`Tx. MQL: ${((data.mqls / data.leads) * 100).toFixed(2)}%`}</p>}
            </div>
        );
    }
    return null;
};


export default function CampanhasEventos() {
    const [tipoVenda, setTipoVenda] = useState('ingresso');
    const [performanceMetric, setPerformanceMetric] = useState('vendas');
    const [breakdownMetric, setBreakdownMetric] = useState('criativo');
    const [breakdownView, setBreakdownView] = useState('bar');
    const [breakdownAnalysis, setBreakdownAnalysis] = useState('volume'); // New state for breakdown analysis type
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [periodo, setPeriodo] = useState(() => ({
        start: startOfMonth(new Date()).toISOString(),
        end: endOfMonth(new Date()).toISOString(),
        preset: "Este mês",
    }));
    
    useEffect(() => {
      // Se o tipo de venda mudar para 'gratuito' e a métrica for 'cpa' (que não existe nesse modo),
      // reseta para a métrica de 'vendas' (que será Leads/MQLs).
      if (tipoVenda === 'gratuito' && performanceMetric === 'cpa') {
        setPerformanceMetric('vendas');
      }
      // If tipoVenda is gratuito and breakdownAnalysis is 'custo', and performanceMetric is 'cpa', we also need to adjust.
      // Although breakdownAnalysis is CPL/CPA, if gratuito, CPA is not relevant. The mock data automatically converts it to CPL.
    }, [tipoVenda, performanceMetric]);

    const isGratuito = tipoVenda === 'gratuito';

    const dadosGerais = isGratuito ? {
        Investimento: formatCurrency(15000),
        Leads: 2500,
        'Custo por Lead': formatCurrency(6.00)
    } : {
        Investimento: formatCurrency(21179.99),
        Vendas: 198,
        'Custo por Venda': formatCurrency(106.97)
    };

    const metas = isGratuito ? {
        Investimento: formatCurrency(20000),
        Leads: 3000,
        'Custo por Lead': formatCurrency(6.67)
    } : {
        Investimento: formatCurrency(25000),
        Vendas: 227,
        'Custo por Venda': formatCurrency(110)
    };

    const resultado = isGratuito ? [
        { label: "Investimento Faltante", value: formatCurrency(5000), colorClass: "bg-blue-100/70 dark:bg-blue-900/50" },
        { label: "Leads Faltantes", value: 500, colorClass: "bg-amber-100/70 dark:bg-amber-900/50" },
        { label: "Diferença de CPL", value: formatCurrency(-0.67), colorClass: "bg-green-100/70 dark:bg-green-900/50 text-green-800 dark:text-green-300" }
    ] : [
        { label: "Investimento Faltante", value: formatCurrency(3820.01), colorClass: "bg-blue-100/70 dark:bg-blue-900/50" },
        { label: "Vendas Faltantes", value: 29, colorClass: "bg-amber-100/70 dark:bg-amber-900/50" },
        { label: "Diferença de CPA", value: formatCurrency(-3.03), colorClass: "bg-green-100/70 dark:bg-green-900/50 text-green-800 dark:text-green-300" }
    ];
    
    const breakdownChartData = useMemo(() => {
        const data = breakdownMetric === 'criativo' ? creativePerformanceData : audiencePerformanceData;
        if (isGratuito) {
            // For gratuito mode, mock 'vendas' as 'leads' and 'cpa' as 'cpl'
            // Example transformation: leads = vendas * factor, cpl = cpa / factor
            // Let's assume leads are 3x sales and CPL is 1/3 of CPA for mock
            return data.map(item => ({...item, leads: item.vendas * 3, cpl: item.cpa / 3}));
        }
        return data;
    }, [breakdownMetric, isGratuito]);

    const breakdownChartTitle = useMemo(() => {
        let title = '';
        if (breakdownAnalysis === 'volume') {
            title = isGratuito ? 'Leads' : 'Vendas';
        } else { // custo
            title = isGratuito ? 'CPL' : 'CPA';
        }
        title += ` por ${breakdownMetric === 'criativo' ? 'Criativo' : 'Público'}`;
        return title;
    }, [breakdownAnalysis, isGratuito, breakdownMetric]);

    const performanceTitles = isGratuito ? {
        vendas: 'Performance Diária (Leads vs MQLs)',
        cpl: 'Evolução do Custo por Lead (CPL) e Investimento',
    } : {
        vendas: 'Performance Diária (Leads vs Vendas)',
        cpl: 'Evolução do Custo por Lead (CPL) e Investimento',
        cpa: 'Evolução do Custo por Aquisição (CPA) e Investimento',
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                        Painel de Lançamento
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
                        Análise de performance de eventos e lançamentos.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ChipGroup>
                        <ChipButton isActive={tipoVenda === 'ingresso'} onClick={() => setTipoVenda('ingresso')}>Venda de Ingresso</ChipButton>
                        <ChipButton isActive={tipoVenda === 'mentoria'} onClick={() => setTipoVenda('mentoria')}>Venda de Mentoria</ChipButton>
                        <ChipButton isActive={tipoVenda === 'gratuito'} onClick={() => setTipoVenda('gratuito')}>Ingresso Gratuito</ChipButton>
                    </ChipGroup>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-10 rounded-lg flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4 text-gray-500" />
                                <span className="truncate max-w-[150px] font-medium">
                                    {selectedProducts.length === 0 ? 'Todos os Produtos' : 
                                     selectedProducts.length === 1 ? productOptions.find(p => p.value === selectedProducts[0])?.label :
                                     `${selectedProducts.length} Produtos`}
                                </span>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filtrar por Produto</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {productOptions.map(option => (
                                <DropdownMenuCheckboxItem
                                    key={option.value}
                                    checked={selectedProducts.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedProducts(prev => [...prev, option.value]);
                                        } else {
                                            setSelectedProducts(prev => prev.filter(p => p !== option.value));
                                        }
                                    }}
                                >
                                    {option.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <LocalPeriodPicker
                      storageKey="period:eventos"
                      initial={periodo}
                      PeriodPicker={CompactDateRangePicker}
                      onChange={(r) => setPeriodo(r)}
                    />
                </div>
            </div>

            <div className="space-y-6">
                {/* --- Top Row: General Data & Performance --- */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    <aside className="flex flex-col gap-6">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex-1 flex">
                            <SummaryCard title="DADOS GERAIS" data={dadosGerais} className="w-full" />
                        </motion.div>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex-1 flex">
                            <SummaryCard title="METAS" data={metas} className="w-full" />
                        </motion.div>
                    </aside>
                    <main>
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="h-full">
                            <Card className="dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800 h-full flex flex-col">
                                <CardHeader>
                                   <div className="flex justify-between items-center">
                                     <CardTitle>{performanceTitles[performanceMetric]}</CardTitle>
                                     <ChipGroup>
                                         <ChipButton isActive={performanceMetric === 'vendas'} onClick={() => setPerformanceMetric('vendas')}>{isGratuito ? 'Conversão' : 'Vendas'}</ChipButton>
                                         <ChipButton isActive={performanceMetric === 'cpl'} onClick={() => setPerformanceMetric('cpl')}>CPL</ChipButton>
                                         {!isGratuito && <ChipButton isActive={performanceMetric === 'cpa'} onClick={() => setPerformanceMetric('cpa')}>CPA</ChipButton>}
                                     </ChipGroup>
                                   </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ResponsiveContainer width="100%" height={400}>
                                        {performanceMetric === 'vendas' ? (
                                            <BarChart data={dailyPerformanceData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                                <Bar dataKey="leads" name="Leads" stackId="a" fill="#475569" radius={[4, 4, 0, 0]}>
                                                    <LabelList dataKey="leads" position="top" style={{ fill: '#475569', fontSize: 12 }} />
                                                </Bar>
                                                <Bar dataKey={isGratuito ? "mqls" : "vendas"} name={isGratuito ? "MQLs" : "Vendas"} stackId="a" fill="#F97316">
                                                    <LabelList dataKey={isGratuito ? "mqls" : "vendas"} position="center" style={{ fill: 'white', fontSize: 12 }} />
                                                </Bar>
                                            </BarChart>
                                        ) : (
                                            <LineChart data={dailyPerformanceData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="left" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis yAxisId="right" orientation="right" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{fontSize: "14px"}}/>
                                                
                                                <Line yAxisId="right" type="monotone" dataKey="investimento" name="Investimento" stroke="#94a3b8" strokeDasharray="3 3" />

                                                {performanceMetric === 'cpl' && (
                                                    <Line yAxisId="left" type="monotone" dataKey="cpl" name="CPL" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                                       <LabelList dataKey="cpl" position="top" formatter={(value) => `R$${value.toFixed(2)}`} style={{ fill: '#3b82f6', fontSize: 11, fontWeight: 500 }} dy={-8}/>
                                                    </Line>
                                                )}

                                                {performanceMetric === 'cpa' && (
                                                    <Line yAxisId="left" type="monotone" dataKey="cpa" name="CPA" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}>
                                                      <LabelList dataKey="cpa" position="top" formatter={(value) => `R$${value.toFixed(2)}`} style={{ fill: '#f97316', fontSize: 11, fontWeight: 500 }} dy={-8}/>
                                                    </Line>
                                                )}
                                            </LineChart>
                                        )}
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </main>
                </div>

                {/* --- Bottom Row: Result & Breakdown --- */}
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                     <aside className="h-full">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="h-full flex">
                            <ResultCard results={resultado} className="w-full" />
                        </motion.div>
                    </aside>
                    <main>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="h-full">
                            <Card className="dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800 h-full flex flex-col">
                                 <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{breakdownChartTitle}</CardTitle>
                                        <div className="flex items-center gap-4">
                                          <ChipGroup>
                                            <ChipButton isActive={breakdownMetric === 'criativo'} onClick={() => setBreakdownMetric('criativo')}>Criativos</ChipButton>
                                            <ChipButton isActive={breakdownMetric === 'publico'} onClick={() => setBreakdownMetric('publico')}>Públicos</ChipButton>
                                          </ChipGroup>
                                          <ChipGroup>
                                            <ChipButton isActive={breakdownAnalysis === 'volume'} onClick={() => setBreakdownAnalysis('volume')}>Volume</ChipButton>
                                            <ChipButton isActive={breakdownAnalysis === 'custo'} onClick={() => setBreakdownAnalysis('custo')}>Custo</ChipButton>
                                          </ChipGroup>
                                          <ChipGroup>
                                            <ChipButton isActive={breakdownView === 'bar'} onClick={() => setBreakdownView('bar')}><BarChart3 className="w-4 h-4" /></ChipButton>
                                            <ChipButton isActive={breakdownView === 'pie'} onClick={() => setBreakdownView('pie')}><PieChartIcon className="w-4 h-4" /></ChipButton>
                                          </ChipGroup>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ResponsiveContainer width="100%" height={400}>
                                        {breakdownView === 'bar' ? (
                                            <BarChart data={breakdownChartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar 
                                                    dataKey={
                                                        breakdownAnalysis === 'volume' 
                                                            ? (isGratuito ? "leads" : "vendas")
                                                            : (isGratuito ? "cpl" : "cpa")
                                                    } 
                                                    name={
                                                        breakdownAnalysis === 'volume'
                                                            ? (isGratuito ? "Leads" : "Vendas")
                                                            : (isGratuito ? "CPL" : "CPA")
                                                    }
                                                    fill={breakdownAnalysis === 'volume' ? "#334155" : "#F97316"} 
                                                    radius={[4, 4, 0, 0]}
                                                >
                                                    <LabelList 
                                                        dataKey={
                                                            breakdownAnalysis === 'volume' 
                                                                ? (isGratuito ? "leads" : "vendas") 
                                                                : (isGratuito ? "cpl" : "cpa")
                                                        }
                                                        position="top" 
                                                        style={{ fill: breakdownAnalysis === 'volume' ? '#334155' : "#F97316", fontSize: 12 }} 
                                                        formatter={(value) => breakdownAnalysis === 'custo' ? `R$${value.toFixed(2)}` : value}
                                                    />
                                                </Bar>
                                            </BarChart>
                                        ) : (
                                            <PieChart>
                                                <Pie
                                                    data={breakdownChartData}
                                                    dataKey={
                                                        breakdownAnalysis === 'volume' 
                                                            ? (isGratuito ? "leads" : "vendas")
                                                            : (isGratuito ? "cpl" : "cpa")
                                                    }
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    labelLine={false}
                                                >
                                                    {breakdownChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                            </PieChart>
                                        )}
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </main>
                </div>
            </div>
            
            {/* Bottom Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Vendas por Canal de Origem</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {salesByChannelData.map(channel => (
                            <div key={channel.name} className={`p-4 rounded-lg text-center ${channel.color}`}>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{channel.name}</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{channel.ingressos}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{channel.percent.toFixed(2)}% do total</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                <Card className="dark:bg-slate-900/70 border-slate-200/70 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Detalhamento de Públicos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <div className="grid grid-cols-3 gap-4 text-center border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                            <div>
                                <h4 className="font-semibold p-2 rounded-t-lg bg-blue-100 dark:bg-blue-900/50">Vendas Frias</h4>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><span className="text-lg font-bold">{audienceBreakdownData.frias.ingressos}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">do Total</p><span>{audienceBreakdownData.frias.percent}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">Vendas Cip</p><span>{audienceBreakdownData.frias.cip}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">% Conversão</p><span>{audienceBreakdownData.frias.conversao}</span></div>
                            </div>
                            <div>
                                <h4 className="font-semibold p-2 rounded-t-lg bg-red-100 dark:bg-red-900/50">Vendas Quentes</h4>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><span className="text-lg font-bold">{audienceBreakdownData.quentes.ingressos}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">do Total</p><span>{audienceBreakdownData.quentes.percent}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">Vendas Cip</p><span>{audienceBreakdownData.quentes.cip}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">% Conversão</p><span>{audienceBreakdownData.quentes.conversao}</span></div>
                            </div>
                            <div>
                                <h4 className="font-semibold p-2 rounded-t-lg bg-slate-200 dark:bg-slate-700">Total de Vendas</h4>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><span className="text-lg font-bold">{audienceBreakdownData.total.ingressos}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">do Total</p><span>&nbsp;</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">Vendas Cip</p><span>{audienceBreakdownData.total.cip}</span></div>
                                <div className="p-2 border-t border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500">% Conversão</p><span>&nbsp;</span></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
