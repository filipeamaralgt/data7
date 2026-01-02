
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import FakeLeadsDialog from './FakeLeadsDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';


const mockFakeLeads = [
    { id: '1', name: 'Teste Falso', phone: '11999999999', whatsappLink: 'https://wa.me/11999999999', email: 'teste@falso.com', reason: 'E-mail com domínio inválido' },
    { id: '2', name: 'Joao Ninguem', phone: '21000000000', whatsappLink: 'https://wa.me/21000000000', email: 'joao@dominioinexistente.xyz', reason: 'Domínio de e-mail não responde' },
    { id: '3', name: 'Maria Sem Contato', phone: '31987654321', whatsappLink: 'https://wa.me/31987654321', email: 'maria.contato@valido.com', reason: 'Telefone não registrado no WhatsApp' },
    { id: '4', name: 'Contato Genérico', phone: '41912345678', whatsappLink: 'https://wa.me/41912345678', email: 'contato@gmail.com', reason: 'Nome ou e-mail genérico' },
];

export default function MedusaIA({ period }) {
    const { theme } = useAppContext();
    const { toast } = useToast();
    const [isMedusaActive, setIsMedusaActive] = useState(false); // Medusa agora começa inativa
    const [status, setStatus] = useState('idle'); // idle, searching, fakesFound, noFakes
    const [fakeLeads, setFakeLeads] = useState([]);
    const [lastCleanInfo, setLastCleanInfo] = useState({ count: 0, time: null, reasons: {} });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // Removed: const [scanCycle, setScanCycle] = useState(0);

    const economyValue = (lastCleanInfo.count * 15).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    useEffect(() => {
        if (isMedusaActive) {
            setStatus('searching');
            const timer = setTimeout(() => {
                // Simulate finding fakes only in 'daily' period for demo
                if (period === 'daily') {
                    setFakeLeads(mockFakeLeads);
                    setStatus('fakesFound');
                } else {
                    setFakeLeads([]);
                    setStatus('noFakes');
                }
            }, 2500);
            return () => clearTimeout(timer);
        } else {
            setStatus('idle');
            setFakeLeads([]);
            // Removed: setScanCycle(0);
        }
    }, [isMedusaActive, period]); // Removed scanCycle from dependencies
    
    const handleCleanCrm = (leadsToClean) => {
        const reasonCounts = leadsToClean.reduce((acc, lead) => {
            acc[lead.reason] = (acc[lead.reason] || 0) + 1;
            return acc;
        }, {});

        setLastCleanInfo({ 
            count: leadsToClean.length, 
            time: new Date(),
            reasons: reasonCounts,
        });
        setIsDialogOpen(false);
        // Removed: setIsMedusaActive(false); // Desativa a Medusa após a limpeza
        setFakeLeads([]); // Limpa os leads falsos da tela
        // Removed: setScanCycle(prev => prev + 1);
         toast({
            title: (
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">CRM Limpo!</span>
                </div>
            ),
            description: `${leadsToClean.length} leads falsos foram removidos do CRM.`,
            duration: 5000,
        });
    };

    const renderContent = () => {
        switch (status) {
            case 'searching':
                return (
                    <div className="text-center py-4">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-red-500" />
                        <p className="text-sm font-medium text-red-500 dark:text-red-400 mt-3">
                           Caçando leads fakes...
                        </p>
                         <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                           Transformando contatos inválidos em pedra.
                        </p>
                    </div>
                );
            case 'fakesFound':
                return (
                     <div className="text-center py-4">
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`}>
                            Aniquiladora de Leads Fakes
                        </p>
                        <p className={`text-sm mt-2 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                           A Medusa IA identificou <strong>{fakeLeads.length} leads falsos</strong> que podem ser removidos.
                        </p>
                        <Button onClick={() => setIsDialogOpen(true)} className="mt-4" size="sm">Ver Leads Petrificados</Button>
                    </div>
                );
            case 'noFakes':
                // This case is hit when Medusa is active and found no fakes during a scan
                return (
                     <>
                        <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                            Guardiã da Qualidade
                        </p>
                        <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                            Nenhum lead falso detectado neste período. Sua base de dados está limpa e segura, garantindo máxima eficiência.
                        </p>
                    </>
                );
            case 'idle':
            default:
                if (lastCleanInfo.time && !isMedusaActive && fakeLeads.length === 0) {
                    // Show last clean info if Medusa is inactive AND there was a clean
                    return (
                        <>
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                Limpeza Realizada
                            </p>
                             <p className="text-xs text-slate-400 dark:text-slate-500">
                                {`há ${formatDistanceToNow(lastCleanInfo.time, { locale: ptBR })}`}
                            </p>
                            <p className={`text-sm mt-3 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                A Medusa IA removeu <strong>{lastCleanInfo.count} leads falsos</strong> do CRM.
                            </p>
                            <div className={`p-3 rounded-lg text-sm mt-3 ${theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                                <p className="font-medium text-xs text-slate-500 dark:text-slate-400">Custo operacional evitado com a limpeza:</p>
                                <p className="font-bold text-green-500 text-base">{economyValue}</p>
                            </div>
                        </>
                    );
                } else if (isMedusaActive && status === 'noFakes' && fakeLeads.length === 0) {
                     // If Medusa is active and has just completed a scan with no fakes (status becomes 'noFakes')
                     return (
                        <>
                            <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                                Guardiã da Qualidade
                            </p>
                            <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                                Nenhum lead falso detectado neste período. Sua base de dados está limpa e segura, garantindo máxima eficiência.
                            </p>
                        </>
                    );
                }
                // Default message when active but not actively searching/displaying results, or when inactive without a recent clean
                return (
                    <div className="text-center py-4">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                           A Medusa IA está {isMedusaActive ? 'pronta para agir.' : 'inativa.'}
                        </p>
                         <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                           {isMedusaActive ? 'Aguardando o próximo ciclo de verificação ou varredura manual.' : 'Ative-a para monitorar e limpar sua base de leads.'}
                        </p>
                    </div>
                );
        }
    };

    const generateReport = () => {
        // Report for a completed clean operation
        if (lastCleanInfo.count > 0 && lastCleanInfo.time) {
            const reasonsText = Object.entries(lastCleanInfo.reasons)
                .map(([reason, count]) => `  - ${count} com ${reason.toLowerCase()}`)
                .join('\n');

            return {
                title: '🐍 Relatório da Medusa IA - Limpeza Realizada! 🐍',
                body: `A aniquiladora de leads fakes finalizou a varredura há ${formatDistanceToNow(lastCleanInfo.time, { locale: ptBR, addSuffix: true})}.\n\n🛡️ *${lastCleanInfo.count} leads falsos/inválidos foram removidos.*\n\n*Motivos da remoção:*\n${reasonsText}\n\nSua base está mais qualificada e você evitou um custo operacional de aproximadamente *${economyValue}*.`,
            };
        }
        // Report when Medusa is active and finds no fakes in a scan
        if (isMedusaActive && status === 'noFakes') {
             return {
                title: '✅ Relatório da Medusa IA - Base Limpa! ✅',
                body: `A guardiã da qualidade está vigilante. Nenhuma anomalia foi encontrada no período. Sua base de dados permanece íntegra e otimizada. ✨`,
            };
        }
        return { title: '', body: '' }; // No report to send
    };
    
    const { title: reportTitle, body: reportBody } = generateReport();
    const canSendReport = reportTitle && reportBody; // Condition to display the send report button

    return (
        <>
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md h-full flex flex-col`}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img 
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/218c41d2b_medusa_5271033.png" 
                              alt="Medusa IA" 
                              className="w-10 h-10"
                            />
                            <div>
                                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                                    Medusa IA
                                </CardTitle>
                                 <div className={`
                                    px-2 py-0.5 rounded-full text-xs font-semibold inline-block mt-1
                                    ${isMedusaActive 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                    }
                                    transition-colors hover:ring-2
                                    ${isMedusaActive ? 'hover:ring-green-300' : 'hover:ring-slate-400'}
                                 `}>
                                    {isMedusaActive ? 'Em Ação' : 'Inativa'}
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center space-x-2">
                            <Switch
                                id="medusa-switch"
                                checked={isMedusaActive}
                                onCheckedChange={setIsMedusaActive}
                                className="data-[state=checked]:bg-green-600"
                            />
                            <Label htmlFor="medusa-switch" className="text-xs text-slate-500 dark:text-slate-400">
                               {isMedusaActive ? 'Ativada' : 'Desativada'}
                            </Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 flex flex-col justify-center min-h-[160px]"> {/* Added min-h for layout stability */}
                    {renderContent()}
                </CardContent>
                {canSendReport && ( // Only show footer if a report can be generated based on current status
                    <CardFooter className="pt-4 border-t border-dashed dark:border-slate-800">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Relatório da Medusa
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Enviar Relatório para o Grupo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-left">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">{reportTitle}</p>
                                            <p className="whitespace-pre-wrap mt-2 text-sm text-slate-600 dark:text-slate-300">{reportBody}</p>
                                        </div>
                                         <p className="text-xs text-amber-600 dark:text-amber-500 mt-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Confira se este relatório ainda não foi enviado antes de prosseguir.
                                        </p>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() =>
                                            toast({
                                                title: (
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                                        <span className="font-semibold">Relatório da Medusa Enviado!</span>
                                                    </div>
                                                ),
                                                description: `O relatório sobre a limpeza de leads foi enviado.`,
                                                duration: 5000,
                                            })
                                        }
                                    >
                                        Sim, pode enviar!
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardFooter>
                )}
            </Card>
             <FakeLeadsDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                leads={fakeLeads}
                onClean={handleCleanCrm}
            />
        </>
    );
}
