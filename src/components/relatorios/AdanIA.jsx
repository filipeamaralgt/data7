
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle, AlertTriangle, Send, Calendar, DollarSign, BarChart2, TrendingDown, TrendingUp, History, ShieldAlert, RotateCcw, Brain, Info } from 'lucide-react';
import { useAppContext } from "@/components/context/AppContext";
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import HistoricoPagamentoDialog from './HistoricoPagamentoDialog';

const mockAccountData = {
    status: 'Ativa',
    pagamentos: 'Em dia',
    saldoDevedor: 0,
    saldoCredito: 150.75,
    limiteMeta: 2500,
    proximaFatura: '28/10/2024',
};

const formatValue = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const initialReportOptions = {
    status: true,
    pagamentos: true,
    limite: true,
    fatura: true,
    analise: true,
    group: 'Grupo Interno', // Added group for report sending
};

export default function AdanIA({ funnelData, period, title, description }) {
    const { theme } = useAppContext();
    const { toast } = useToast();
    const [isActive, setIsActive] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, loading, summary, sent, allClear
    const [lastCheck, setLastCheck] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false); // New state for details dialog
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false); // New state for report dialog
    const [reportOptions, setReportOptions] = useState(initialReportOptions);
    const [consultationResult, setConsultationResult] = useState(null);
    const timerRef = useRef(null);
    const recheckTimerRef = useRef(null);

    const investedValue = funnelData?.funnels?.[0]?.metrics.find(m => m.label === "Valor Investido")?.currentValue || 0;
    const goalMapping = { daily: 100, weekly: 700, monthly: 3000 };
    const investmentGoal = period ? goalMapping[period] : 0;
    
    const runConsultation = useCallback(() => {
        if (!funnelData) return;
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        setStatus('loading');
        timerRef.current = setTimeout(() => {
            const isOver = investedValue > investmentGoal;
            const problemsCount = isOver ? 1 : 0;
            
            const newConsultationResult = {
                problems: problemsCount,
                isOverSpending: isOver,
                accountData: mockAccountData
            };
            setConsultationResult(newConsultationResult);

            setStatus(newConsultationResult.problems > 0 ? 'summary' : 'allClear');
            setLastCheck(new Date());
            setIsActive(false); // Desativa a IA após a consulta
        }, 5000); // 5 seconds
    }, [funnelData, investedValue, investmentGoal, setIsActive]);

    useEffect(() => {
        if (isActive && funnelData) {
            runConsultation();
        } else if (!isActive && status === 'loading') {
            // Se for desativado manualmente durante o carregamento, volta ao idle
            setStatus('idle');
            if (timerRef.current) clearTimeout(timerRef.current);
        } else {
            // Reset other states if AdanIA is deactivated and not in loading state
            setConsultationResult(null);
            setIsDetailsOpen(false); // Close details dialog if Adan IA is deactivated
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (recheckTimerRef.current) clearTimeout(recheckTimerRef.current);
        };
    }, [isActive, runConsultation, funnelData, status]); // Added status to dependencies to react to it

    useEffect(() => {
        if (status === 'sent' && funnelData) {
            recheckTimerRef.current = setTimeout(() => {
                if (isActive) { // Only run if still active
                    runConsultation();
                }
            }, 30 * 60 * 1000); // 30 minutes
        }
        return () => {
            if (recheckTimerRef.current) {
                clearTimeout(recheckTimerRef.current);
            }
        };
    }, [status, isActive, runConsultation, funnelData]);
    
    // Generic mode for pages without funnelData
    if (!funnelData) {
        return (
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md h-full flex flex-col`}>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 grid place-items-center rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                            <Brain className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                            <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{title || 'Adan IA'}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center min-h-[240px]">
                    <div className="text-center space-y-4">
                         <p className="text-sm text-slate-500 dark:text-slate-400 px-4">
                            {description || 'O Adan IA pode analisar esses dados para fornecer insights.'}
                        </p>
                        <Button disabled className="bg-cyan-500/50 text-white dark:text-cyan-950 cursor-not-allowed">
                            <Info className="w-4 h-4 mr-2" />
                            Em Breve
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    const handleSendReport = (group) => {
        toast({ 
            title: "Relatório Financeiro Enviado!",
            description: `O relatório foi enviado para o ${group}.`,
            duration: 4000 
        });
        setIsReportDialogOpen(false);
        setIsDetailsOpen(false);
        setStatus('sent');
        // A desativação já ocorre após a consulta, não precisa aqui
    };

    const generateReport = () => {
        const title = "🛡️ Relatório do Adan IA - Guardião Financeiro 🛡️";
        let body = `Verificação realizada ${lastCheck ? `há ${formatDistanceToNow(lastCheck, { locale: ptBR })}` : 'agora'}.\n\n`;
        const currentIsOverSpending = investedValue > investmentGoal; 

        if(reportOptions.status) body += `✅ *Status da Conta:* ${mockAccountData.status}\n`;
        if(reportOptions.pagamentos) body += `💳 *Situação dos Pagamentos:* ${mockAccountData.pagamentos}\n`;
        if(reportOptions.limite) body += `💰 *Limite de Gastos (Meta):* ${formatValue(mockAccountData.limiteMeta)}\n`;
        if(reportOptions.fatura) body += `🗓️ *Próxima Fatura:* ${mockAccountData.proximaFatura}\n\n`;
        if(reportOptions.analise) {
            if (currentIsOverSpending) {
                body += `⚠️ *Alerta:* O investimento de ${formatValue(investedValue)} está *acima* da meta de ${formatValue(investmentGoal)} para o período.`;
            } else {
                body += `📈 *Análise:* O investimento de ${formatValue(investedValue)} está *dentro* da meta de ${formatValue(investmentGoal)} para o período.`;
            }
        }
        return { title, body: body.trim() };
    };

    const { title: reportTitle, body: reportBody } = generateReport();

    const renderContent = () => {
        if (status === 'loading') {
            return (
                <div className="text-center py-6">
                    <Loader2 className="h-6 w-6 mx-auto animate-spin text-cyan-500" />
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        <span className="font-semibold text-cyan-500 dark:text-cyan-400">Adan IA</span> está conferindo a saúde da sua conta...
                    </p>
                </div>
            );
        }

        if (status === 'summary') {
            if (!consultationResult) return null; // Should not happen if status is summary

            return (
                <div className="text-center py-6 space-y-3">
                    <AlertTriangle className="h-8 w-8 mx-auto text-amber-500" />
                    <p className="text-base font-semibold text-amber-500 dark:text-amber-400">
                        {consultationResult.problems} {consultationResult.problems > 1 ? 'Problemas Encontrados' : 'Problema Encontrado'}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Clique para ver os detalhes e tomar uma ação.
                    </p>
                    <Button onClick={() => setIsDetailsOpen(true)} size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-white dark:text-cyan-950">Ver Detalhes</Button>
                </div>
            );
        }

        if (status === 'sent') {
            return (
                <div className="text-center py-6 space-y-3">
                    <CheckCircle className="h-8 w-8 mx-auto text-cyan-500" />
                    <p className="text-base font-semibold text-cyan-500 dark:text-cyan-400">
                        Consulta Realizada
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        O Adan IA conferiu a saúde da conta e notificou no grupo.
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        {`verificado ${lastCheck ? formatDistanceToNow(lastCheck, { addSuffix: true, locale: ptBR }) : ''}`}
                    </p>
                </div>
            );
        }

        if (status === 'allClear') {
            return (
                <div className="text-center py-6 space-y-3">
                    <CheckCircle className="h-8 w-8 mx-auto text-cyan-500" />
                    <p className="text-base font-semibold text-cyan-500 dark:text-cyan-400">Conta com saúde em dia</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Nenhum problema encontrado na última verificação.</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        {`verificado ${lastCheck ? formatDistanceToNow(lastCheck, { addSuffix: true, locale: ptBR }) : ''}`}
                    </p>
                </div>
            );
        }

        return (
            <div className="text-center py-6 space-y-3">
                <Button onClick={() => setIsActive(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white dark:text-cyan-950">
                    <ShieldAlert className="w-4 h-4 mr-2" />
                    Verificar Saúde da Conta
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-4">
                    Adan IA irá conferir os status da conta de anúncios e os pagamentos.
                </p>
            </div>
        );
    };

    const ReportOptionCheckbox = ({ id, label, checked, onCheckedChange }) => (
        <div className="flex items-center space-x-2">
            <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
            <label htmlFor={id} className="text-sm font-medium leading-none text-slate-600 dark:text-slate-300">{label}</label>
        </div>
    );

    return (
        <div className="flex flex-col gap-4">
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md h-full flex flex-col`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 grid place-items-center rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                                <ShieldAlert className="w-6 h-6 text-cyan-500" />
                            </div>
                            <div>
                                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Status da Conta</CardTitle>
                                <div className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block mt-1 ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'} transition-colors hover:ring-2 ${isActive ? 'hover:ring-green-300' : 'hover:ring-slate-400'}`}>
                                    {isActive ? 'Ativo' : 'Inativo'}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isActive && (status === 'idle' || status === 'allClear' || status === 'summary') && ( // Show recheck button only if active and not loading/sent
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={runConsultation} disabled={status === 'loading'}>
                                    <RotateCcw className="w-4 h-4 text-slate-500" />
                                </Button>
                            )}
                            <Switch id="adan-switch" checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-green-600"/>
                            <Label htmlFor="adan-switch" className="text-xs text-slate-500 dark:text-slate-400">{isActive ? 'Ativado' : 'Desativado'}</Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col justify-center min-h-[240px]">
                    {renderContent()}
                </CardContent>
            </Card>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Consulta Detalhada da Conta</DialogTitle>
                    </DialogHeader>
                    {consultationResult && (
                        <>
                            <div className="space-y-2 py-4">
                                <div className='text-center'>
                                  <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">Conferência Realizada!</p>
                                </div>
                                <InfoItem icon={<CheckCircle className="text-green-500"/>} label="Status da Conta" value={consultationResult.accountData.status} />
                                <InfoItem icon={<DollarSign />} label="Pagamentos" value={consultationResult.accountData.pagamentos} />
                                <InfoItem icon={<BarChart2 />} label="Limite (Meta Ads)" value={formatValue(mockAccountData.limiteMeta)} />
                                <InfoItem icon={<Calendar />} label="Próxima Fatura" value={mockAccountData.proximaFatura} />
                                <div className={`p-3 rounded-lg flex flex-col gap-1 text-sm ${consultationResult.isOverSpending ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {consultationResult.isOverSpending ? <TrendingUp className="text-amber-500 h-4 w-4"/> : <TrendingDown className="text-green-500 h-4 w-4"/>}
                                            <span className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{consultationResult.isOverSpending ? 'Acima da Meta' : 'Dentro da Meta'}</span>
                                        </div>
                                        <span className={`font-bold ${consultationResult.isOverSpending ? 'text-amber-500' : 'text-green-500'}`}>{formatValue(investedValue)}</span>
                                    </div>
                                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                        O investimento está {consultationResult.isOverSpending ? 'acima' : 'abaixo'} da meta de {formatValue(investmentGoal)} para o período.
                                    </p>
                                </div>
                            </div>
                            <CardFooter className="pt-4 border-t border-dashed dark:border-slate-800 flex-col items-stretch gap-2 -mx-6 -mb-6 px-6 pb-6">
                                <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-2">
                                   Verificado {lastCheck ? `há ${formatDistanceToNow(lastCheck, { locale: ptBR })}` : 'agora'}
                                </p>
                                <Button variant="outline" size="sm" onClick={() => { setIsDetailsOpen(false); setIsHistoryOpen(true); }}>
                                    <History className="w-4 h-4 mr-2" />
                                    Ver Histórico de Pagamentos
                                </Button>
                                <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white dark:text-cyan-950">
                                            <Send className="w-4 h-4 mr-2" />
                                            Enviar Relatório Financeiro
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Confirme o Envio do Relatório</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Você está prestes a enviar o relatório financeiro. Por favor, selecione para qual grupo deseja enviá-lo.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Selecione as informações para incluir no relatório:</p>
                                                <div className="mt-2 grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                                    <ReportOptionCheckbox id="rep-status" label="Status da Conta" checked={reportOptions.status} onCheckedChange={(c) => setReportOptions(s => ({...s, status: c}))} />
                                                    <ReportOptionCheckbox id="rep-pagamentos" label="Pagamentos" checked={reportOptions.pagamentos} onCheckedChange={(c) => setReportOptions(s => ({...s, pagamentos: c}))} />
                                                    <ReportOptionCheckbox id="rep-limite" label="Limite da Conta" checked={reportOptions.limite} onCheckedChange={(c) => setReportOptions(s => ({...s, limite: c}))} />
                                                    <ReportOptionCheckbox id="rep-fatura" label="Próxima Fatura" checked={reportOptions.fatura} onCheckedChange={(c) => setReportOptions(s => ({...s, fatura: c}))} />
                                                    <ReportOptionCheckbox id="rep-analise" label="Análise de Gastos" checked={reportOptions.analise} onCheckedChange={(c) => setReportOptions(s => ({...s, analise: c}))} />
                                                </div>
                                            </div>
                                            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left space-y-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{reportTitle}</p>
                                                <p className="whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{reportBody || "Nenhuma opção selecionada para o relatório."}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="report-group-select" className="text-sm text-slate-700 dark:text-slate-300">Enviar para:</Label>
                                                <select
                                                    id="report-group-select"
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100"
                                                    value={reportOptions.group}
                                                    onChange={(e) => setReportOptions(s => ({...s, group: e.target.value}))}
                                                >
                                                    <option value="Grupo Interno">Grupo Interno</option>
                                                    <option value="Grupo do Cliente">Grupo do Cliente</option>
                                                </select>
                                            </div>
                                            <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-500">
                                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>Confira se este relatório ainda não foi enviado no grupo antes de prosseguir.</span>
                                            </div>
                                        </div>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                className="bg-cyan-500 hover:bg-cyan-600 text-white dark:text-cyan-950"
                                                onClick={() => handleSendReport(reportOptions.group)}
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Enviar para {reportOptions.group}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <HistoricoPagamentoDialog isOpen={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
        </div>
    );
}

const InfoItem = ({ icon, label, value }) => (
    <div className="p-2 rounded-lg flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/70">
        <div className="flex items-center gap-1.5">
            {React.cloneElement(icon, { className: `${icon.props.className} h-4 w-4`})}
            <span className="text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="font-bold text-slate-900 dark:text-slate-200">{value}</span>
    </div>
);
