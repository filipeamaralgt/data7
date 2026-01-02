
import React, { useState, useEffect, useMemo } from 'react';
import { PerformanceDiaria as PerformanceDiariaEntity } from '@/entities/PerformanceDiaria';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, XCircle, ChevronDown, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth } from 'date-fns';
import { useAppContext } from "@/components/context/AppContext";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import { ChipGroup, ChipButton } from "@/components/dashboard/Chip";

const funnelColors = {
    "Sessão Estratégica": "bg-sky-500",
    "Turbinados": "bg-blue-500",
    "Social Selling": "bg-indigo-500",
    "Isca de Baleia": "bg-rose-500",
    "Webinar": "bg-fuchsia-500",
    "Saque Dinheiro": "bg-amber-500",
    "Aplicação": "bg-emerald-500",
    "Youtube": "bg-red-500",
    "Indicação": "bg-purple-500",
    "Infoproduto": "bg-lime-500",
    "Prospeção Ativa": "bg-orange-500",
    "Evento Presencial": "bg-teal-500",
    "Desconhecido": "bg-slate-400",
    "default": "bg-slate-400"
};

const GoalStatus = ({ achieved, small = false }) => {
  if (achieved === null || achieved === undefined) return null;
  const Icon = achieved ? CheckCircle2 : XCircle;
  const color = achieved ? 'text-green-500' : 'text-red-500';
  const size = small ? 'w-4 h-4' : 'w-5 h-5';
  return <Icon className={`${size} ${color}`} />;
};

const formatCurrency = (value) => {
    if (value === null || isNaN(value)) return '-';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export default function PerformanceDiaria() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openMonths, setOpenMonths] = useState({});
    const [view, setView] = useState('marketing');
    
    const { funnel, setFunnel } = useAppContext();

    const initialDate = useMemo(() => ({
        start: startOfMonth(new Date('2025-09-01T00:00:00')),
        end: endOfMonth(new Date('2025-09-01T00:00:00')),
        preset: "Setembro 2025",
    }), []);
    const [dateRange, setDateRange] = useState(initialDate);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const records = await PerformanceDiariaEntity.list('-data');
                
                const uniqueRecords = [];
                const seen = new Set();
                for (const record of records) {
                    // Create a unique key using funnel and data to identify duplicates
                    const key = `${record.funil}-${record.data}`;
                    if (!seen.has(key)) {
                        uniqueRecords.push(record);
                        seen.add(key);
                    }
                }

                const processedData = uniqueRecords.map(item => ({
                    ...item,
                    atingiu_mql: item.mqls_realizado >= item.meta_mql,
                    atingiu_percentual_mql: item.percentual_mql_realizado >= item.meta_percentual_mql,
                    atingiu_agendamentos: item.agendamentos_realizado >= item.meta_agendamentos,
                    atingiu_custo: item.custo_agendamento_realizado <= item.meta_custo_agendamento,
                    atingiu_reunioes: item.reunioes_realizado >= item.meta_reunioes,
                    atingiu_percentual_comparecimento: item.percentual_comparecimento_realizado >= item.meta_percentual_comparecimento,
                    atingiu_custo_reuniao: item.custo_reuniao_realizado <= item.meta_custo_reuniao,
                    atingiu_vendas: item.vendas_realizado >= item.meta_vendas,
                    atingiu_ticket_medio: item.ticket_medio_realizado >= item.meta_ticket_medio,
                    atingiu_cpa: item.cpa_realizado <= item.meta_cpa,
                }));
                setData(processedData);
                
                // Auto-open current month
                const currentMonthKey = format(new Date(), 'MMMM-yyyy');
                setOpenMonths(prev => ({ ...prev, [currentMonthKey]: true }));

            } catch (error) {
                console.error("Erro ao buscar dados de performance diária:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const groupedData = useMemo(() => {
        const filtered = data.filter(item => {
            // Fix timezone issue by treating dates as local
            const itemDate = new Date(item.data.replace(/-/g, '/'));
            const isFunnelMatch = funnel === 'Funil Geral' || item.funil === funnel;
            const isDateMatch = itemDate >= new Date(dateRange.start) && itemDate <= new Date(dateRange.end);
            return isFunnelMatch && isDateMatch;
        });

        return filtered.reduce((acc, item) => {
            const monthYear = format(new Date(item.data.replace(/-/g, '/')), 'MMMM-yyyy', { locale: ptBR });
            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(item);
            return acc;
        }, {});
    }, [data, dateRange, funnel]);

    const toggleMonth = (month) => {
        setOpenMonths(prev => ({ ...prev, [month]: !prev[month] }));
    };

    const marketingCols = 14;
    const comercialCols = 17;
    const colSpan = view === 'marketing' ? marketingCols : comercialCols;

    return (
        <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">Performance Diária</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                    <ChipGroup>
                        <ChipButton isActive={view === 'marketing'} onClick={() => setView('marketing')}>Marketing</ChipButton>
                        <ChipButton isActive={view === 'comercial'} onClick={() => setView('comercial')}>Comercial</ChipButton>
                    </ChipGroup>
                    <FunnelSelect value={funnel} onChange={setFunnel} />
                    <CompactDateRangePicker value={dateRange} onChange={setDateRange} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg dark:border-slate-800 overflow-x-auto scrollbar-slim">
                    <Table className="min-w-full">
                        {view === 'marketing' ? (
                            <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-xs">
                                    <TableHead className="whitespace-nowrap px-3">Funil</TableHead>
                                    <TableHead className="whitespace-nowrap px-3">Data</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta MQL</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">MQLs</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta %</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">% MQLs</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Ag.</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Agends.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Custo</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Custo Ag.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead> {/* FIX: Changed GoalStatus with item.atingiu_custo to Target icon */}
                                </TableRow>
                            </TableHeader>
                        ) : (
                             <TableHeader>
                                <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 text-xs">
                                    <TableHead className="whitespace-nowrap px-3">Funil</TableHead>
                                    <TableHead className="whitespace-nowrap px-3">Data</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Ag.</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Agends.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Custo</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Custo Ag.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Reu.</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Reuniões</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta % Comp.</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">% Comp.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Meta Custo Reu.</TableHead>
                                    <TableHead className="text-center whitespace-nowrap px-3">Custo Reu.</TableHead>
                                    <TableHead className="text-center px-3"><Target className="w-4 h-4 inline-block" /></TableHead>
                                </TableRow>
                            </TableHeader>
                        )}
                        
                        {Object.entries(groupedData).length > 0 ? (
                             Object.entries(groupedData).map(([month, items]) => (
                                <Collapsible key={month} asChild open={openMonths[month]} onOpenChange={() => toggleMonth(month)}>
                                    <>
                                        <TableBody>
                                            <TableRow className="bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                                                <TableCell colSpan={colSpan} className="px-3">
                                                    <CollapsibleTrigger asChild>
                                                        <div className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-300">
                                                            <ChevronDown className={`w-5 h-5 transition-transform ${openMonths[month] ? 'rotate-180' : ''}`} />
                                                            <span className="capitalize">{month.replace('-', ' de ')}</span>
                                                        </div>
                                                    </CollapsibleTrigger>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                        <CollapsibleContent asChild>
                                            <TableBody>
                                                {items.map(item => (
                                                    <TableRow key={item.id} className="dark:border-slate-800 text-sm">
                                                        {view === 'marketing' ? (
                                                            <>
                                                                <TableCell className="font-medium whitespace-nowrap px-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${funnelColors[item.funil] || funnelColors.default}`} />
                                                                        <span>{item.funil}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="whitespace-nowrap px-3">{format(new Date(item.data.replace(/-/g, '/')), 'dd/MM/yyyy')}</TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_mql}</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.mqls_realizado}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_mql} /></TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_percentual_mql}%</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.percentual_mql_realizado}%</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_percentual_mql} /></TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_agendamentos}</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.agendamentos_realizado}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_agendamentos} /></TableCell>
                                                                <TableCell className="text-center whitespace-nowrap px-3">{formatCurrency(item.meta_custo_agendamento)}</TableCell>
                                                                <TableCell className="text-center font-bold whitespace-nowrap px-3">{formatCurrency(item.custo_agendamento_realizado)}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_custo} /></TableCell>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <TableCell className="font-medium whitespace-nowrap px-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-2 h-2 rounded-full ${funnelColors[item.funil] || funnelColors.default}`} />
                                                                        <span>{item.funil}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="whitespace-nowrap px-3">{format(new Date(item.data.replace(/-/g, '/')), 'dd/MM/yyyy')}</TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_agendamentos}</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.agendamentos_realizado}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_agendamentos} /></TableCell>
                                                                <TableCell className="text-center whitespace-nowrap px-3">{formatCurrency(item.meta_custo_agendamento)}</TableCell>
                                                                <TableCell className="text-center font-bold whitespace-nowrap px-3">{formatCurrency(item.custo_agendamento_realizado)}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_custo} /></TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_reunioes}</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.reunioes_realizado}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_reunioes} /></TableCell>
                                                                <TableCell className="text-center px-3">{item.meta_percentual_comparecimento}%</TableCell>
                                                                <TableCell className="text-center font-bold px-3">{item.percentual_comparecimento_realizado}%</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_percentual_comparecimento} /></TableCell>
                                                                <TableCell className="text-center whitespace-nowrap px-3">{formatCurrency(item.meta_custo_reuniao)}</TableCell>
                                                                <TableCell className="text-center font-bold whitespace-nowrap px-3">{formatCurrency(item.custo_reuniao_realizado)}</TableCell>
                                                                <TableCell className="text-center px-3"><GoalStatus achieved={item.atingiu_custo_reuniao} /></TableCell>
                                                            </>
                                                        )}
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </CollapsibleContent>
                                    </>
                                </Collapsible>
                             ))
                        ) : (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={colSpan} className="h-24 text-center text-slate-500 dark:text-slate-400">
                                        {isLoading ? "Carregando dados..." : "Nenhum dado encontrado para o período e funil selecionados."}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
