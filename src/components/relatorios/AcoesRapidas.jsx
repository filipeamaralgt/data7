
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, AlertTriangle, CheckCircle, Rocket, Send, Info, Brain, Loader2, RotateCcw } from 'lucide-react';
import { useAppContext } from "@/components/context/AppContext";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { MultiSelectPopover } from '@/components/ui/multi-select-popover';

const formatValue = (value, format) => {
  if (!value) return 'N/A';
  if (format === 'currency') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  if (format === 'percent') {
    return `${value.toFixed(2)}%`;
  }
  return value.toLocaleString('pt-BR');
};


export default function AcoesRapidas({ period, setPeriod, funnelData, funnelOptions }) {
    const { theme } = useAppContext();
    const [selectedFunnels, setSelectedFunnels] = useState([]);
    const { toast } = useToast();
    const [alfredStatus, setAlfredStatus] = useState('idle'); // idle, loading, ready
    const [isReportOpen, setIsReportOpen] = useState(false);
    // adanStatus state removed as per changes

    const reportTypeLabels = {
        daily: 'diário',
        weekly: 'semanal',
        monthly: 'mensal'
    }

    const handlePrepareReport = () => {
        if (selectedFunnels.length === 0) {
            toast({
                variant: "destructive",
                title: "Nenhum Funil Selecionado",
                description: "Por favor, selecione pelo menos um funil para preparar o relatório.",
            });
            return;
        }
        setAlfredStatus('loading');
        setTimeout(() => {
            setAlfredStatus('ready');
        }, 5000);
    };
    
    const handleSendReport = () => {
        setIsReportOpen(false);
        setAlfredStatus('idle');
        toast({
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Relatório(s) Enviado(s)!</span>
                </div>
            ),
            description: `O(s) relatório(s) para ${selectedFunnels.join(', ')} foi/foram enviado(s) com sucesso.`,
            duration: 5000,
        });
    };

    const handleRedo = () => {
        setIsReportOpen(false);
        handlePrepareReport();
    }

    const handleCancel = () => {
        setIsReportOpen(false);
        setAlfredStatus('idle');
    }

    // handleStartAdanCycle removed as per changes
    // handlePauseAdanCycle removed as per changes
    
    const generateReportBody = () => {
        if (selectedFunnels.length === 0) return "Selecione um funil para ver a prévia.";

        const funnelName = selectedFunnels[0]; // Preview uses the first selected funnel
        const metrics = funnelData.funnels.find(f => f.name === funnelName)?.metrics || [];
        const metas = funnelData.metas || [];

        if(metrics.length === 0) return `Não há dados de performance para o funil "${funnelName}".`

        const investido = metrics.find(m => m.label === "Valor Investido")?.currentValue || 0;
        const leads = metrics.find(m => m.label === "Leads")?.currentValue || 0;
        const cpl = metrics.find(m => m.label === "Custo por Lead")?.currentValue || 0;
        const agendamentos = metrics.find(m => m.label === "Agendamentos")?.currentValue || 0;

        let body = `📊 *Funil: ${funnelName}*\n\n`;
        body += `💰 *Valor Investido:* ${formatValue(investido, 'currency')}\n`;
        if (leads > 0) body += `👥 *Leads Gerados:* ${leads}\n`;
        if (cpl > 0) body += `🎯 *Custo por Lead (CPL):* ${formatValue(cpl, 'currency')}\n`;
        if (agendamentos > 0) body += `🗓️ *Agendamentos:* ${agendamentos}\n\n`;

        if (metas.length > 0) {
            body += `*Análise de Metas:*\n`;
            metas.forEach(meta => {
                const isMet = meta.label.includes('custo') ? meta.actual <= meta.goal : meta.actual >= meta.goal;
                body += `${isMet ? '✅' : '❌'} ${meta.label}: ${formatValue(meta.actual, meta.unit === '%' ? 'percent' : undefined)} / ${meta.goal}\n`;
            });
        }

        return body;
    };

    const reportTitle = `🤵 Relatório de Performance ${reportTypeLabels[period]}`;
    const reportBody = generateReportBody();

    const renderContent = () => {
        if (alfredStatus === 'loading') {
            return (
                <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-teal-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        <span className="font-semibold text-teal-500 dark:text-teal-400">O Alfred IA</span> está consultando os dados e preparando o relatório com precisão 🔥
                    </p>
                </div>
            );
        }

        if (alfredStatus === 'ready') {
            return (
                 <div className="text-center py-6 space-y-3">
                    <p className="text-sm font-semibold text-teal-500 dark:text-teal-400">Dados Confirmados!</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        O Alfred IA está pronto para enviar o relatório <span className="font-bold">{reportTypeLabels[period]}</span>.
                    </p>
                    <Button onClick={() => setIsReportOpen(true)} size="sm" className="bg-teal-500 hover:bg-teal-600 text-white dark:text-teal-950">Ver Relatório</Button>
                </div>
            );
        }

        return (
            <>
                <div className="flex items-start gap-2 text-xs text-teal-600 dark:text-teal-500 p-2 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Confira se o relatório ainda não foi enviado no grupo antes de prosseguir.</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <MultiSelectPopover
                        options={funnelOptions || []}
                        selected={selectedFunnels}
                        onChange={setSelectedFunnels}
                        placeholder="Selecione os funis"
                        triggerIcon={<Rocket className="w-4 h-4 text-slate-500" />}
                    />
                    <div className="grid grid-cols-2 gap-2">
                            <Select value={period} onValueChange={setPeriod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Month</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handlePrepareReport} className="bg-teal-500 hover:bg-teal-600 text-white dark:text-teal-950">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Preparar relatório
                        </Button>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md h-full flex flex-col`}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <Send className="w-6 h-6 text-teal-500" />
                        <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Envio de Relatórios</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-center min-h-[240px]">
                    {/* Alfred IA / Report Generation Section */}
                    {renderContent()}

                    {/* Separator for Notification Section */}
                    <div className="border-t border-dashed my-2 dark:border-slate-800" />
                    
                    {/* Notification Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notificar responsável</label>
                        <div className="flex items-center gap-2">
                            <Select defaultValue="julia">
                                <SelectTrigger>
                                    <SelectValue>
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-teal-500" />
                                            <span>Julia Estrategista</span>
                                        </div>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="julia">
                                        <div className="flex items-center gap-2">
                                            <Brain className="w-4 h-4 text-teal-500" />
                                            <span>Julia Estrategista</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>Cadastre gestores e estrategistas para enviar mensagens de alerta direto no WhatsApp.</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <AlertDialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Prévia do Relatório</AlertDialogTitle>
                        <AlertDialogDescription as="div" className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-slim">
                            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left space-y-2">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{reportTitle}</p>
                                <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{reportBody}</p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-between gap-2">
                        <Button variant="ghost" onClick={handleRedo}>
                            <RotateCcw className="w-4 h-4 mr-2"/>
                            Refazer Consulta
                        </Button>
                        <div className="flex gap-2">
                            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                                className="bg-teal-500 hover:bg-teal-600 text-white dark:text-teal-950"
                                onClick={handleSendReport}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Enviar
                            </AlertDialogAction>
                        </div>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
