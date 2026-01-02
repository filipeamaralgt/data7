
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';
import { useToast } from "@/components/ui/use-toast";

const meses = [
    { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const tiposDeMeta = [
    { value: 'faturamento', label: 'Faturamento (R$)' },
    { value: 'investimento', label: 'Investimento (R$)' },
    { value: 'cash_collect', label: 'Cash Collect (R$)' },
    { value: 'ticket_medio', label: 'Ticket Médio (R$)' },
    { value: 'cpl', label: 'Custo por Lead (CPL)' },
    { value: 'cpa', label: 'Custo por Aquisição (CPA)' },
    { value: 'custo_agendamento', label: 'Custo por Agendamento' },
    { value: 'leads', label: 'Leads (nº)' },
    { value: 'vendas', label: 'Vendas (nº)' },
    { value: 'roas', label: 'ROAS (x)' },
    { value: 'tx_conversao', label: 'Taxa de Conversão (%)' },
    { value: 'taxa_cash_collect', label: 'Taxa de Cash Collect (%)' },
];

export default function MetaForm({ meta, onSave, onCancel }) {
    const [currentMeta, setCurrentMeta] = useState(meta || {
        nome: '',
        tipo: 'faturamento',
        valor_meta: '',
        valor_realizado: 0,
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setSuggestions([]);

        try {
            const prompt = `
                Baseado em dados históricos de uma empresa de marketing digital (faturamento médio mensal de R$200.000, 1200 leads/mês, ROAS médio de 5x), 
                sugira 3 opções de metas para o próximo mês. As metas devem ser ambiciosas, mas realistas. 
                Para cada sugestão, forneça um nome, o tipo da meta (faturamento, leads ou roas), o valor da meta e uma breve justificativa.
                O JSON de resposta deve seguir estritamente este formato: {"sugestoes": [{"nome": string, "tipo": string, "valor_meta": number, "justificativa": string}]}.
                Não inclua nenhum texto ou formatação fora do objeto JSON.
            `;

            const response = await InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        sugestoes: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    nome: { type: "string" },
                                    tipo: { type: "string" },
                                    valor_meta: { type: "number" },
                                    justificativa: { type: "string" }
                                },
                                required: ["nome", "tipo", "valor_meta", "justificativa"]
                            }
                        }
                    },
                    required: ["sugestoes"]
                }
            });

            if (response && response.sugestoes) {
                setSuggestions(response.sugestoes);
            } else {
                 toast({ title: "Erro de Geração", description: "A IA não retornou sugestões no formato esperado.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Erro ao gerar metas com IA", error);
            toast({ title: "Erro de Geração", description: "Não foi possível se comunicar com a Musa IA.", variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };
    
    const applySuggestion = (suggestion) => {
        setCurrentMeta(prev => ({
            ...prev,
            nome: suggestion.nome,
            tipo: suggestion.tipo,
            valor_meta: suggestion.valor_meta,
        }));
        setSuggestions([]);
        toast({ title: "Sugestão Aplicada!", description: "A meta foi preenchida com os dados da IA.", });
    };

    return (
        <Dialog open={true} onOpenChange={onCancel}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{meta ? 'Editar Meta' : 'Criar Nova Meta'}</DialogTitle>
                    <DialogDescription>
                        Defina um objetivo claro e mensurável para sua equipe. Use a Musa IA para sugestões baseadas em dados.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6 pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="nome">Nome da Meta</label>
                            <Input id="nome" value={currentMeta.nome} onChange={(e) => setCurrentMeta({ ...currentMeta, nome: e.target.value })} placeholder="Ex: Faturamento Q1" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="tipo">Tipo de Métrica</label>
                            <Select value={currentMeta.tipo} onValueChange={(v) => setCurrentMeta({ ...currentMeta, tipo: v })}>
                                <SelectTrigger id="tipo">
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposDeMeta.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="valor_meta">Valor da Meta</label>
                            <Input id="valor_meta" type="number" value={currentMeta.valor_meta} onChange={(e) => setCurrentMeta({ ...currentMeta, valor_meta: parseFloat(e.target.value) || '' })} placeholder="Ex: 50000" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="valor_realizado">Valor Realizado</label>
                            <Input id="valor_realizado" type="number" value={currentMeta.valor_realizado} onChange={(e) => setCurrentMeta({ ...currentMeta, valor_realizado: parseFloat(e.target.value) || '' })} placeholder="Deixe 0 se ainda não começou" />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="mes">Mês</label>
                            <Select value={currentMeta.mes.toString()} onValueChange={(v) => setCurrentMeta({ ...currentMeta, mes: parseInt(v) })}>
                                <SelectTrigger id="mes">
                                    <SelectValue placeholder="Selecione o mês" />
                                </SelectTrigger>
                                <SelectContent>
                                    {meses.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="ano">Ano</label>
                            <Select value={currentMeta.ano.toString()} onValueChange={(v) => setCurrentMeta({ ...currentMeta, ano: parseInt(v) })}>
                                <SelectTrigger id="ano">
                                    <SelectValue placeholder="Selecione o ano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2025">2025</SelectItem>
                                    <SelectItem value="2024">2024</SelectItem>
                                    <SelectItem value="2023">2023</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Suggestions da IA, se houver */}
                    {isGenerating && (
                        <div className="flex justify-center items-center p-8 text-slate-500 dark:text-slate-400">
                           <Loader2 className="w-6 h-6 mr-3 animate-spin"/>
                           <span>Musa está conjurando algumas ideias...</span>
                        </div>
                    )}
                    {suggestions.length > 0 && (
                        <div className="space-y-3 pt-4">
                             <h4 className="text-sm font-medium text-center text-slate-500 dark:text-slate-400">Sugestões da Musa IA</h4>
                            {suggestions.map((s, i) => (
                                <div key={i} className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 space-y-2">
                                    <p className="font-semibold">{s.nome}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">{s.justificativa}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-bold text-pink-600 dark:text-pink-400">
                                            Meta: {s.tipo === 'faturamento' ? s.valor_meta.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : s.valor_meta.toLocaleString('pt-BR')} {s.tipo === 'roas' && 'x'}
                                        </div>
                                        <Button type="button" size="sm" onClick={() => applySuggestion(s)}>Aplicar</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t dark:border-slate-800 flex sm:justify-between flex-col-reverse sm:flex-row gap-2">
                    <Button type="button" variant="outline" className="text-pink-500 border-pink-500/50 hover:bg-pink-500/5 hover:text-pink-600" onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                        Gerar com Musa IA
                    </Button>
                     <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
                        <Button type="submit" onClick={() => onSave(currentMeta)}>{meta ? 'Salvar Alterações' : 'Criar Meta'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
