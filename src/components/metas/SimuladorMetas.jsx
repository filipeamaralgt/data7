
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sparkles, TrendingUp, DollarSign, Loader2, Lightbulb, UserCheck, CalendarCheck, Video, ShoppingCart, Target, UserPlus, CircleDollarSign } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

const formatCurrency = (value) => {
    if (isNaN(value)) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatNumber = (value) => {
    if (isNaN(value)) return '0';
    return Math.ceil(value).toLocaleString('pt-BR');
}

export default function SimuladorMetas() {
    const [faturamentoMeta, setFaturamentoMeta] = useState(300000);
    const [investimentoMeta, setInvestimentoMeta] = useState(60000);
    const [baseMetric, setBaseMetric] = useState('investimento'); // Changed initial state from 'faturamento' to 'investimento'
    const [ticketMedio, setTicketMedio] = useState(10000);
    const [cpl, setCpl] = useState(40); // Custo por Lead

    // Taxas do Funil
    const [txMql, setTxMql] = useState(30); // % de Leads que viram MQL
    const [txAgendamento, setTxAgendamento] = useState(80); // % de MQLs que agendam
    const [txComparecimento, setTxComparecimento] = useState(70); // % de agendamentos que comparecem
    const [txConversaoReuniao, setTxConversaoReuniao] = useState(20); // % de reuniões que viram venda

    const [isGenerating, setIsGenerating] = useState(false);
    const [aiInsight, setAiInsight] = useState('');

    const { 
        vendasNecessarias, 
        reunioesNecessarias,
        agendamentosNecessarios,
        mqlsNecessarios,
        leadsNecessarios, 
        investimentoFinal,
        faturamentoFinal,
        cpmql,
        custoAgendamento,
        custoReuniao,
        cpa,
    } = useMemo(() => {
        let vendas, reunioes, agendamentos, mqls, leads, investimento, faturamento;

        if (baseMetric === 'faturamento') {
            faturamento = faturamentoMeta;
            vendas = faturamento / (ticketMedio === 0 ? 1 : ticketMedio); // Added ticketMedio === 0 check
            reunioes = vendas / (txConversaoReuniao / 100);
            agendamentos = reunioes / (txAgendamento / 100);
            mqls = agendamentos / (txMql / 100);
            leads = mqls / (txMql / 100);
            
            investimento = leads * cpl;

        } else { // baseMetric === 'investimento'
            investimento = investimentoMeta;
            leads = investimento / (cpl === 0 ? 1 : cpl); // Added cpl === 0 check
            mqls = leads * (txMql / 100);
            agendamentos = mqls * (txAgendamento / 100);
            reunioes = agendamentos * (txComparecimento / 100);
            vendas = reunioes * (txConversaoReuniao / 100);
            faturamento = vendas * ticketMedio;
        }
        
        const calculatedCPMQL = investimento / (mqls === 0 ? 1 : mqls);
        const calculatedCustoAgendamento = investimento / (agendamentos === 0 ? 1 : agendamentos);
        const calculatedCustoReuniao = investimento / (reunioes === 0 ? 1 : reunioes);
        const calculatedCPA = investimento / (vendas === 0 ? 1 : vendas);

        return {
            vendasNecessarias: isNaN(vendas) || !isFinite(vendas) ? 0 : vendas,
            reunioesNecessarias: isNaN(reunioes) || !isFinite(reunioes) ? 0 : reunioes,
            agendamentosNecessarios: isNaN(agendamentos) || !isFinite(agendamentos) ? 0 : agendamentos,
            mqlsNecessarios: isNaN(mqls) || !isFinite(mqls) ? 0 : mqls,
            leadsNecessarios: isNaN(leads) || !isFinite(leads) ? 0 : leads,
            investimentoFinal: isNaN(investimento) || !isFinite(investimento) ? 0 : investimento,
            faturamentoFinal: isNaN(faturamento) || !isFinite(faturamento) ? 0 : faturamento,
            cpmql: isNaN(calculatedCPMQL) || !isFinite(calculatedCPMQL) ? 0 : calculatedCPMQL,
            custoAgendamento: isNaN(calculatedCustoAgendamento) || !isFinite(calculatedCustoAgendamento) ? 0 : calculatedCustoAgendamento,
            custoReuniao: isNaN(calculatedCustoReuniao) || !isFinite(calculatedCustoReuniao) ? 0 : calculatedCustoReuniao,
            cpa: isNaN(calculatedCPA) || !isFinite(calculatedCPA) ? 0 : calculatedCPA,
        };
    }, [baseMetric, faturamentoMeta, investimentoMeta, ticketMedio, txMql, txAgendamento, txComparecimento, txConversaoReuniao, cpl]);

    const handleGenerateInsight = async () => {
        setIsGenerating(true);
        setAiInsight('');

        const prompt = `
            Sou um gestor de marketing e estou simulando um cenário.
            O ponto de partida da simulação é ${baseMetric === 'faturamento' ? 'uma meta de faturamento' : 'um orçamento de investimento'}.

            **Ponto de Partida (${baseMetric === 'faturamento' ? 'Fixo' : 'Projetado'}):**
            - Meta de Faturamento: ${formatCurrency(faturamentoFinal)}
            - Ticket Médio: ${formatCurrency(ticketMedio)}

            **Orçamento (${baseMetric === 'investimento' ? 'Fixo' : 'Projetado'}):**
            - Investimento: ${formatCurrency(investimentoFinal)}
            - Custo por Lead (CPL): ${formatCurrency(cpl)}

            **Taxas de Conversão do Funil:**
            - Leads para MQLs: ${txMql}%
            - MQLs para Agendamentos: ${txAgendamento}%
            - Agendamentos para Reuniões (Comparecimento): ${txComparecimento}%
            - Reuniões para Vendas: ${txConversaoReuniao}%
            
            **Resultados da Simulação (Plano de Ação):**
            - Leads Necessários: ${formatNumber(leadsNecessarios)}
            - MQLs Necessários: ${formatNumber(mqlsNecessarios)}
            - Agendamentos Necessários: ${formatNumber(agendamentosNecessarios)}
            - Reuniões Necessárias: ${formatNumber(reunioesNecessarias)}
            - Vendas Necessárias: ${formatNumber(vendasNecessarias)}

            **Métricas de Custo:**
            - Custo por MQL: ${formatCurrency(cpmql)}
            - Custo por Agendamento: ${formatCurrency(custoAgendamento)}
            - Custo por Reunião: ${formatCurrency(custoReuniao)}
            - Custo por Aquisição (CPA): ${formatCurrency(cpa)}

            Aja como a Musa IA, uma especialista em estratégia criativa e planejamento.
            Forneça um parecer curto e direto sobre este cenário. Com base no ponto de partida (Faturamento ou Investimento), o plano é viável? Quais são os maiores desafios ou pontos de alavancagem neste funil? Quais 2 ou 3 ações práticas você recomendaria para otimizar essas taxas e atingir o objetivo?
            Seja objetiva e inspiradora. A resposta deve ser em um único parágrafo.
        `;

        try {
            const response = await InvokeLLM({ prompt });
            setAiInsight(response);
        } catch (error) {
            console.error("Erro ao gerar insight:", error);
            setAiInsight("Houve um erro ao consultar a Musa IA. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    };

    const isFaturamentoBase = baseMetric === 'faturamento';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna de Simulação */}
            <Card className="dark:bg-slate-900">
                <CardHeader>
                    <CardTitle>Calculadora de Funil Completo</CardTitle>
                    <CardDescription>Ajuste as variáveis para simular cenários e planejar suas metas.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <Label className="font-semibold text-sm">Qual seu ponto de partida?</Label>
                        <RadioGroup value={baseMetric} onValueChange={setBaseMetric} className="flex gap-4">
                             <div className="flex items-center space-x-2">
                                <RadioGroupItem value="investimento" id="r2" />
                                <Label htmlFor="r2">Investimento (Meta)</Label> {/* Changed from "Investimento (Orçamento)" to "Investimento (Meta)" */}
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="faturamento" id="r1" />
                                <Label htmlFor="r1">Faturamento (Meta)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {isFaturamentoBase ? (
                         <div className="space-y-2">
                            <Label htmlFor="faturamento" className="font-semibold text-base">
                                Qual sua meta de faturamento?
                            </Label>
                            <Input
                                id="faturamento"
                                type="text"
                                value={formatCurrency(faturamentoMeta)}
                                onChange={(e) => {
                                    const numericValue = parseFloat(e.target.value.replace(/\D/g, '')) / 100;
                                    setFaturamentoMeta(isNaN(numericValue) ? 0 : numericValue);
                                }}
                                className="text-2xl h-14 font-bold"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="investimento" className="font-semibold text-base">
                                 Qual sua meta de investimento? {/* Changed from "Qual seu orçamento de investimento?" to "Qual sua meta de investimento?" */}
                            </Label>
                            <Input
                                id="investimento"
                                type="text"
                                value={formatCurrency(investimentoMeta)}
                                onChange={(e) => {
                                    const numericValue = parseFloat(e.target.value.replace(/\D/g, '')) / 100;
                                    setInvestimentoMeta(isNaN(numericValue) ? 0 : numericValue);
                                }}
                                className="text-2xl h-14 font-bold"
                            />
                        </div>
                    )}


                    <div className="space-y-2">
                         <div className="flex justify-between mb-2">
                            <Label htmlFor="ticket" className="text-sm">Ticket Médio</Label>
                            <span className="font-semibold text-sm">{formatCurrency(ticketMedio)}</span>
                        </div>
                        <Slider id="ticket" value={[ticketMedio]} onValueChange={([v]) => setTicketMedio(v)} min={1000} max={25000} step={500} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 space-y-4">
                        <h4 className="font-semibold text-sm">Taxas do Funil (%)</h4>
                        <div>
                            <div className="flex justify-between mb-2 text-xs">
                                <Label htmlFor="txMql">Leads para MQLs</Label>
                                <span className="font-medium">{txMql.toFixed(0)}%</span>
                            </div>
                            <Slider id="txMql" value={[txMql]} onValueChange={([v]) => setTxMql(v)} min={1} max={100} step={1} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                        </div>
                         <div>
                            <div className="flex justify-between mb-2 text-xs">
                                <Label htmlFor="txAgendamento">MQLs para Agendamentos</Label>
                                <span className="font-medium">{txAgendamento.toFixed(0)}%</span>
                            </div>
                            <Slider id="txAgendamento" value={[txAgendamento]} onValueChange={([v]) => setTxAgendamento(v)} min={1} max={100} step={1} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                        </div>
                         <div>
                            <div className="flex justify-between mb-2 text-xs">
                                <Label htmlFor="txComparecimento">Taxa de Comparecimento</Label>
                                <span className="font-medium">{txComparecimento.toFixed(0)}%</span>
                            </div>
                            <Slider id="txComparecimento" value={[txComparecimento]} onValueChange={([v]) => setTxComparecimento(v)} min={1} max={100} step={1} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                        </div>
                        <div>
                            <div className="flex justify-between mb-2 text-xs">
                                <Label htmlFor="conversao">Conversão (Reunião para Venda)</Label>
                                <span className="font-medium">{txConversaoReuniao.toFixed(1)}%</span>
                            </div>
                            <Slider id="conversao" value={[txConversaoReuniao]} onValueChange={([v]) => setTxConversaoReuniao(v)} min={1} max={50} step={0.5} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                        </div>
                    </div>
                    
                     <div className="space-y-2">
                         <div className="flex justify-between mb-2">
                            <Label htmlFor="cpl" className="text-sm">Custo por Lead (CPL)</Label>
                            <span className="font-semibold text-sm">{formatCurrency(cpl)}</span>
                        </div>
                        <Slider id="cpl" value={[cpl]} onValueChange={([v]) => setCpl(v)} min={1} max={200} step={1} className="[&>span:first-child]:h-2 [&>span>span]:bg-slate-400 dark:[&>span>span]:bg-slate-600" /> {/* Changed slider style */}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all" onClick={handleGenerateInsight} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Analisar Cenário com Musa IA
                    </Button>
                </CardContent>
            </Card>
            
            {/* Coluna de Resultados */}
            <div className="space-y-6">
                <Card className="dark:bg-slate-900">
                     <CardHeader>
                        <CardTitle>Plano de Ação Detalhado</CardTitle>
                        <CardDescription>Com base na sua simulação, aqui está o que você precisa para atingir a meta.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Target className="w-4 h-4"/>Faturamento</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(faturamentoFinal)}</p>
                        </div>
                         <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4"/>Investimento</p>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(investimentoFinal)}</p>
                        </div>
                    </CardContent>
                    <CardContent className="pt-0 space-y-6">
                        <div>
                            <h4 className="text-md font-semibold mb-3 text-slate-800 dark:text-slate-200">Etapas do Funil</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Leads</p>
                                    <p className="text-2xl font-bold mt-1">{formatNumber(leadsNecessarios)}</p>
                                </div>
                                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><UserCheck className="w-4 h-4"/>MQLs</p>
                                    <p className="text-2xl font-bold mt-1">{formatNumber(mqlsNecessarios)}</p>
                                </div>
                                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><CalendarCheck className="w-4 h-4"/>Agendamentos</p>
                                    <p className="text-2xl font-bold mt-1">{formatNumber(agendamentosNecessarios)}</p>
                                </div>
                                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Video className="w-4 h-4"/>Reuniões</p>
                                    <p className="text-2xl font-bold mt-1">{formatNumber(reunioesNecessarias)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><ShoppingCart className="w-4 h-4"/>Vendas</p>
                                    <p className="text-2xl font-bold mt-1">{formatNumber(vendasNecessarias)}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                             <h4 className="text-md font-semibold mb-3 text-slate-800 dark:text-slate-200">Custos Projetados</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><DollarSign className="w-4 h-4"/>CPL</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(cpl)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><UserPlus className="w-4 h-4"/>Custo por MQL</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(cpmql)}</p>
                                </div>
                                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><CalendarCheck className="w-4 h-4"/>Custo por Agend.</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(custoAgendamento)}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><Video className="w-4 h-4"/>Custo por Reunião</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(custoReuniao)}</p>
                                </div>
                                 <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2"><CircleDollarSign className="w-4 h-4"/>CPA</p>
                                    <p className="text-xl font-bold mt-1">{formatCurrency(cpa)}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(isGenerating || aiInsight) && (
                    <Card className="dark:bg-slate-900">
                         <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-pink-500">
                                <Lightbulb className="w-5 h-5"/>
                                Parecer da Musa IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isGenerating ? (
                                <p className="text-slate-500 dark:text-slate-400 animate-pulse">Analisando as possibilidades...</p>
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{aiInsight}</p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
