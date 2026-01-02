
import React, { useState, useEffect, useMemo } from 'react';
import { Meta } from '@/entities/Meta';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Plus, Edit, Trash2, TrendingUp, Target, Coins, BarChart, Percent, CircleDollarSign, CalendarDays, Video, UserPlus, UserCheck, CalendarCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import MetaForm from './MetaForm';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from '@/components/ui/badge';
// ProjecaoMetas is no longer rendered directly here, assuming it's moved to a separate tab/route.
// import ProjecaoMetas from './ProjecaoMetas'; // This import might become unnecessary depending on full app structure
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const mockRealizedData = {
    'Este mês': {
        faturamento: 619150, vendas: 61, investimento: 45600, cash_collect: 495320, leads: 1240, mqls: 372, agendamentos: 290, reunioes: 174,
        get roas() { return this.faturamento / this.investimento },
        get ticket_medio() { return this.faturamento / this.vendas },
        get taxa_cash_collect() { return (this.cash_collect / this.faturamento) * 100 },
        get cpl() { return this.investimento / this.leads },
        get cpmql() { return this.investimento / this.mqls },
        get custo_agendamento() { return this.investimento / this.agendamentos },
        get custo_reuniao() { return this.investimento / this.reunioes },
        get cpa() { return this.investimento / this.vendas },
        get tx_conversao() { return (this.vendas / this.leads) * 100 }
    },
    'Mês passado': {
        faturamento: 585200, vendas: 55, investimento: 42100, cash_collect: 450000, leads: 1150, mqls: 345, agendamentos: 270, reunioes: 160,
        get roas() { return this.faturamento / this.investimento },
        get ticket_medio() { return this.faturamento / this.vendas },
        get taxa_cash_collect() { return (this.cash_collect / this.faturamento) * 100 },
        get cpl() { return this.investimento / this.leads },
        get cpmql() { return this.investimento / this.mqls },
        get custo_agendamento() { return this.investimento / this.agendamentos },
        get custo_reuniao() { return this.investimento / this.reunioes },
        get cpa() { return this.investimento / this.vendas },
        get tx_conversao() { return (this.vendas / this.leads) * 100 }
    },
    'default': { // Fallback data
        faturamento: 0, vendas: 0, investimento: 0, cash_collect: 0, leads: 0, mqls: 0, agendamentos: 0, reunioes: 0, roas: 0, ticket_medio: 0, taxa_cash_collect: 0, cpl: 0, cpmql: 0, custo_agendamento: 0, custo_reuniao: 0, cpa: 0, tx_conversao: 0
    }
};

const icons = {
    faturamento: <Coins className="w-5 h-5 text-slate-500" />,
    leads: <TrendingUp className="w-5 h-5 text-slate-500" />,
    mqls: <UserCheck className="w-5 h-5 text-slate-500" />,
    agendamentos: <CalendarCheck className="w-5 h-5 text-slate-500" />,
    reunioes: <Video className="w-5 h-5 text-slate-500" />,
    vendas: <Target className="w-5 h-5 text-slate-500" />,
    roas: <TrendingUp className="w-5 h-5 text-slate-500" />,
    investimento: <BarChart className="w-5 h-5 text-slate-500" />,
    tx_conversao: <Percent className="w-5 h-5 text-slate-500" />,
    ticket_medio: <CircleDollarSign className="w-5 h-5 text-slate-500" />,
    cash_collect: <Coins className="w-5 h-5 text-slate-500" />,
    cpl: <UserPlus className="w-5 h-5 text-slate-500" />,
    cpmql: <UserPlus className="w-5 h-5 text-slate-500" />,
    custo_agendamento: <CalendarDays className="w-5 h-5 text-slate-500" />,
    custo_reuniao: <Video className="w-5 h-5 text-slate-500" />,
    cpa: <CircleDollarSign className="w-5 h-5 text-slate-500" />,
    taxa_cash_collect: <Percent className="w-5 h-5 text-slate-500" />,
};

const metricTypesConfig = {
    faturamento: { unit: 'currency' },
    investimento: { unit: 'currency' },
    cash_collect: { unit: 'currency' },
    ticket_medio: { unit: 'currency' },
    cpl: { unit: 'currency', smallerIsBetter: true },
    cpa: { unit: 'currency', smallerIsBetter: true },
    custo_agendamento: { unit: 'currency', smallerIsBetter: true },
    custo_reuniao: { unit: 'currency', smallerIsBetter: true },
    cpmql: { unit: 'currency', smallerIsBetter: true },
    leads: { unit: 'number' },
    mqls: { unit: 'number' },
    agendamentos: { unit: 'number' },
    reunioes: { unit: 'number' },
    vendas: { unit: 'number' },
    roas: { unit: 'multiplier' },
    tx_conversao: { unit: 'percentage' },
    taxa_cash_collect: { unit: 'percentage' },
};

const metricOrder = [ "leads", "mqls", "agendamentos", "reunioes", "vendas", "faturamento", "investimento", "roas", "ticket_medio", "cash_collect", "taxa_cash_collect", "cpl", "cpmql", "custo_agendamento", "custo_reuniao", "cpa"];

const getStatus = (percentual, smallerIsBetter = false, valorRealizado) => {
    if (valorRealizado === 0 && percentual < 100) {
        return { text: "Sem Dados", variant: "neutral" };
    }
    if (smallerIsBetter) {
        if (percentual <= 100) return { text: "Excelente", variant: "success" };
        if (percentual <= 115) return { text: "Atenção", variant: "warning" };
        return { text: "Crítico", variant: "destructive" };
    }
    if (percentual >= 100) return { text: "Superada", variant: "success" };
    if (percentual >= 85) return { text: "Em Dia", variant: "default" };
    return { text: "Atenção", variant: "warning" };
};


export default function ProjetadoRealizado() {
    const [allMetas, setAllMetas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingMeta, setEditingMeta] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { toast } = useToast();

    const initialDate = useMemo(() => ({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        preset: "Este mês",
      }), []);
    
    const [dateRange, setDateRange] = useState(initialDate);

    useEffect(() => {
        fetchMetas();
    }, [dateRange]);

    const fetchMetas = async () => {
        setIsLoading(true);
        
        // Seleciona os dados realizados com base no preset de data
        const periodKey = mockRealizedData[dateRange.preset] ? dateRange.preset : 'default';
        const realizedData = mockRealizedData[periodKey];

        try {
            // Fetch all metas with correct sorting
            const fetchedMetas = await Meta.list('-ano -mes');
            
            // Atualiza o valor realizado de cada meta com os dados 'reais' do período
            const updatedMetas = fetchedMetas.map(meta => ({
                ...meta,
                valor_realizado: realizedData[meta.tipo] !== undefined ? realizedData[meta.tipo] : meta.valor_realizado,
            }));

            setAllMetas(updatedMetas);
        } catch (error) {
            console.error("Erro ao buscar metas:", error);
            toast({ title: "Erro ao buscar dados", description: "Não foi possível carregar as metas.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const filteredMetas = useMemo(() => {
        if (!dateRange.start || !dateRange.end) return [];
        
        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        return allMetas.filter(meta => {
            // Create a date object for the meta. The day doesn't matter for month-based filtering.
            const metaDate = new Date(meta.ano, meta.mes - 1, 15);
            return isWithinInterval(metaDate, { start, end });
        }).sort((a, b) => {
            const indexA = metricOrder.indexOf(a.tipo);
            const indexB = metricOrder.indexOf(b.tipo);
            // Handle cases where a metric might not be in the order array
            if (indexA === -1 && indexB === -1) return 0; // Both not found, maintain original relative order
            if (indexA === -1) return 1; // a not found, b found, b comes first
            if (indexB === -1) return -1; // b not found, a found, a comes first
            return indexA - indexB; // Sort based on the defined order
        });
    }, [allMetas, dateRange]);


    const handleSaveMeta = async (metaData) => {
        try {
            if (editingMeta) {
                await Meta.update(editingMeta.id, metaData);
                toast({ title: "Meta Atualizada!", description: "Sua meta foi atualizada com sucesso." });
            } else {
                await Meta.create(metaData);
                toast({ title: "Meta Criada!", description: "Sua nova meta foi salva." });
            }
            setIsFormOpen(false);
            setEditingMeta(null);
            fetchMetas();
        } catch (error) {
            console.error("Erro ao salvar meta:", error);
            toast({ title: "Erro ao salvar", description: "Não foi possível salvar a meta.", variant: "destructive" });
        }
    };

    const handleDeleteMeta = async (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta meta?")) {
            try {
                await Meta.delete(id);
                toast({ title: "Meta Excluída!", description: "A meta foi removida.", variant: "secondary" });
                fetchMetas();
            } catch (error) {
                console.error("Erro ao excluir meta:", error);
                toast({ title: "Erro ao excluir", description: "Não foi possível remover a meta.", variant: "destructive" });
            }
        }
    };
    
    const startEditing = (meta) => {
        setEditingMeta(meta);
        setIsFormOpen(true);
    };

    const startCreating = () => {
        setEditingMeta(null);
        setIsFormOpen(true);
    };

    const renderValue = (value, type) => {
        const config = metricTypesConfig[type] || {};
        switch (config.unit) {
            case 'currency':
                return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            case 'multiplier':
                return `${value.toLocaleString('pt-BR')}x`;
            case 'percentage':
                 return `${value.toLocaleString('pt-BR')}%`;
            default:
                return value.toLocaleString('pt-BR');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Metas</h3>
                <div className="flex items-center gap-4">
                     <LocalPeriodPicker
                        storageKey="period:metas"
                        initial={initialDate}
                        PeriodPicker={CompactDateRangePicker}
                        onChange={setDateRange}
                     />
                    <Button onClick={startCreating} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Meta
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <p>Carregando metas...</p>
            ) : filteredMetas.length === 0 ? (
                <Card className="text-center py-12 dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
                    <CardHeader>
                        <CardTitle>Nenhuma meta encontrada para este período</CardTitle>
                        <CardDescription>Ajuste o filtro de período ou clique em "Nova Meta" para começar.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMetas.map(meta => {
                        const config = metricTypesConfig[meta.tipo] || {};
                        const rawPercentual = meta.valor_meta > 0 ? (meta.valor_realizado / meta.valor_meta) * 100 : 0;
                        const percentual = rawPercentual < 1 && rawPercentual > 0 ? parseFloat(rawPercentual.toFixed(2)) : Math.round(rawPercentual);
                        const icon = icons[meta.tipo];
                        const status = getStatus(rawPercentual, config.smallerIsBetter, meta.valor_realizado);

                        const statusBadgeVariant = {
                            success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                            warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
                            destructive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                            default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
                            neutral: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        }[status.variant];

                        return (
                            <Card key={meta.id} className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 flex flex-col relative group">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 pr-2">
                                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-50 text-base">
                                                {icon}
                                                {meta.nome}
                                            </CardTitle>
                                            <CardDescription className="mt-1">
                                                {new Date(meta.ano, meta.mes - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className={`font-bold text-[11px] px-2 py-0.5 h-auto ${statusBadgeVariant}`}>{status.text}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col justify-end">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Realizado</span>
                                            <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{renderValue(meta.valor_realizado, meta.tipo)}</span>
                                        </div>
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Meta</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{renderValue(meta.valor_meta, meta.tipo)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 flex flex-col items-start">
                                    <div className="w-full">
                                        <div className="flex justify-between text-sm mb-1 text-slate-500 dark:text-slate-400">
                                            <span>Progresso</span>
                                            <span className="font-bold">{percentual}%</span>
                                        </div>
                                        <Progress value={rawPercentual} className="h-2 [&>div]:bg-green-500" />
                                    </div>
                                    <div className="flex justify-end gap-1 w-full mt-1 h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => startEditing(meta)}>
                                            <Edit className="w-4 h-4 text-slate-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-red-500/10 text-slate-500 hover:text-red-500" onClick={() => handleDeleteMeta(meta.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
             {isFormOpen && (
                <MetaForm
                    meta={editingMeta}
                    onSave={handleSaveMeta}
                    onCancel={() => { setIsFormOpen(false); setEditingMeta(null); }}
                />
            )}
        </div>
    );
}
