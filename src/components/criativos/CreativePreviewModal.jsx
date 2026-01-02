
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Image as ImageIcon, Video, FileText, Link as LinkIcon, ExternalLink, DollarSign, Users, Star, CalendarCheck2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


// Função auxiliar movida para cá para simplificar dependências
const getIcon = (type) => {
  switch (type) {
    case 'Imagem': return <ImageIcon className="h-10 w-10 text-slate-400" />;
    case 'Video': return <Video className="h-10 w-10 text-slate-400" />;
    default: return <FileText className="h-10 w-10 text-slate-400" />;
  }
};

const MetricStat = ({ icon: Icon, value, label }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg overflow-hidden">
                    <Icon className="h-5 w-5 text-pink-500 mt-0.5 shrink-0" />
                    <div className="overflow-hidden">
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">{value}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{value}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
);

const CreativePreviewModal = ({ open, setOpen, creative }) => {
  if (!creative) return null;

  // Dados de performance simulados, associados pelo nome do criativo
  const performanceData = {
    'Teste 02': { vendas: 5, faturamento: 15000, reunioes: 10, agendamentos: 15, mqls: 50, leads: 200 },
    'Teste': { vendas: 1, faturamento: 7500, reunioes: 5, agendamentos: 8, mqls: 30, leads: 150 },
    'AD_05': { vendas: 4, faturamento: 33000, reunioes: 8, agendamentos: 12, mqls: 100, leads: 600 },
    'ad_76_VID_Depoimento': { vendas: 2, faturamento: 9497, reunioes: 4, agendamentos: 7, mqls: 25, leads: 120 },
    'ad_01_video': { vendas: 1, faturamento: 2997, reunioes: 2, agendamentos: 3, mqls: 15, leads: 80 },
    'AD01_VID_Tutorial': { vendas: 0, faturamento: 0, reunioes: 18, agendamentos: 35, mqls: 250, leads: 800 },
  };

  const stats = performanceData[creative.nome] || { vendas: 0, faturamento: 0, reunioes: 0, agendamentos: 0, mqls: 0, leads: 0 };


  const isVideo = creative.arquivo_url && (creative.tipo === 'Video' || creative.arquivo_url?.match(/\.(mp4|webm|ogg)$/i));
  const isImage = creative.arquivo_url && (creative.tipo === 'Imagem' || creative.tipo === 'Carrossel' || creative.arquivo_url?.match(/\.(jpeg|jpg|gif|png|svg)$/i));
  
  // Tratamento para links do Instagram que não podem ser embutidos
  const isInstagramLink = creative.link_externo?.includes('instagram.com');

  const renderContent = () => {
    if (isImage) {
      return <img src={creative.arquivo_url} alt={creative.nome} className="max-w-full max-h-[75vh] mx-auto rounded-lg object-contain" />;
    }
    if (isVideo) {
      return <video src={creative.arquivo_url} controls autoPlay muted className="max-w-full max-h-[75vh] mx-auto rounded-lg" />;
    }
    if (creative.link_externo) {
      if (isInstagramLink) {
        return (
          <div className="h-80 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center rounded-lg text-center p-4">
            <LinkIcon className="h-10 w-10 text-slate-400 mb-4" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">Não é possível embutir este post.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">O Instagram não permite a visualização de posts dentro de outras plataformas.</p>
            <Button asChild>
              <a href={creative.link_externo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver no Instagram
              </a>
            </Button>
          </div>
        );
      }
      return <iframe src={creative.link_externo} className="w-full h-[75vh] border-0 rounded-lg" title={creative.nome}></iframe>;
    }
    // Fallback
    return (
      <div className="h-80 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center rounded-lg">
        {getIcon(creative.tipo)}
        <p className="mt-4 text-slate-500 dark:text-slate-400">Preview não disponível.</p>
        {creative.arquivo_url && <a href={creative.arquivo_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 underline mt-2">Abrir arquivo</a>}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
           <div className="p-6 flex flex-col h-[85vh]">
                <DialogHeader className="pb-4">
                    <DialogTitle>{creative.nome}</DialogTitle>
                    <DialogDescription>{creative.tipo}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 flex-1 overflow-y-auto pr-2 scrollbar-slim">
                    {creative.titulo && <div><strong className="text-slate-900 dark:text-white">Título:</strong> {creative.titulo}</div>}
                    {creative.corpo_texto && <div><strong className="text-slate-900 dark:text-white">Corpo:</strong> <p className="mt-1 whitespace-pre-wrap">{creative.corpo_texto}</p></div>}
                    {creative.cta && <div><strong className="text-slate-900 dark:text-white">CTA:</strong> {creative.cta}</div>}
                    {creative.funil && <div><strong className="text-slate-900 dark:text-white">Funil:</strong> {creative.funil}</div>}

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <h3 className="text-base font-semibold mb-4 text-slate-900 dark:text-white">Performance do Criativo</h3>
                      <div className="grid grid-cols-2 gap-3">
                          <MetricStat icon={ShoppingCart} value={stats.vendas.toLocaleString('pt-BR')} label="Vendas" />
                          <MetricStat icon={DollarSign} value={stats.faturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 })} label="Faturamento" />
                          <MetricStat icon={Video} value={stats.reunioes.toLocaleString('pt-BR')} label="Reuniões" />
                          <MetricStat icon={CalendarCheck2} value={stats.agendamentos.toLocaleString('pt-BR')} label="Agendamentos" />
                          <MetricStat icon={Star} value={stats.mqls.toLocaleString('pt-BR')} label="MQLs" />
                          <MetricStat icon={Users} value={stats.leads.toLocaleString('pt-BR')} label="Leads" />
                      </div>
                    </div>
                </div>
                {creative.link_externo && (
                    <Button asChild variant="outline" className="mt-6">
                        <a href={creative.link_externo} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Post Original
                        </a>
                    </Button>
                )}
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/50 p-6 flex items-center justify-center rounded-r-lg">
              {renderContent()}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreativePreviewModal;
