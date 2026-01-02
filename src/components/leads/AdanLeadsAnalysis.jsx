
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Play, Loader2, CheckCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const generateAnalysis = (metrics) => {
    const { mqlRate, leadsAvg } = metrics;
    let title = '';
    let suggestions = [];

    if (mqlRate >= 25 && leadsAvg >= 30) {
        title = "Excelente Performance de Leads!";
        suggestions.push("Parabéns! Sua taxa de conversão de MQLs está ótima e a geração diária de leads é robusta.");
        suggestions.push("Sugestão: Considere testar novos criativos ou públicos para escalar ainda mais os resultados, já que a base do funil está saudável.");
    } else if (mqlRate < 15) {
        title = "Atenção à Conversão de MQLs";
        suggestions.push(`Sua taxa de conversão para MQLs está em ${mqlRate.toFixed(1)}%, o que indica uma oportunidade de otimização.`);
        suggestions.push("Sugestão: Revise a qualificação dos leads na origem. A segmentação do público pode não estar alinhada com a oferta.");
        suggestions.push("Sugestão: Analise os criativos com maior Custo por MQL para identificar padrões e pausar os de pior performance.");
    } else if (leadsAvg < 20) {
        title = "Oportunidade na Geração de Leads";
        suggestions.push(`A média de ${Math.round(leadsAvg)} leads por dia pode ser um ponto de atenção.`);
        suggestions.push("Sugestão: Verifique o orçamento das campanhas de topo de funil. Ele pode estar limitando o alcance.");
        suggestions.push("Sugestão: Considere lançar novas campanhas com públicos de interesse mais amplos para aumentar o volume de entrada.");
    } else {
        title = "Performance Estável";
        suggestions.push("Seus resultados de geração de leads estão estáveis. Continue monitorando para identificar novas oportunidades.");
    }
    return { title, suggestions };
};

export default function AdanLeadsAnalysis({ metrics, className }) {
  const [status, setStatus] = useState('idle'); // idle, loading, completed
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = () => {
    setStatus('loading');
    setTimeout(() => {
      const generated = generateAnalysis(metrics);
      setAnalysis(generated);
      setStatus('completed');
    }, 2500); // Simulate analysis time
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[150px]">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <p className="mt-3 font-semibold text-cyan-600 dark:text-cyan-400">Adan está analisando os dados...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Isso pode levar alguns segundos.</p>
          </div>
        );
      case 'completed':
        return (
          <div className="flex flex-col items-center justify-center text-center h-full min-h-[150px]">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="mt-3 font-semibold text-green-600 dark:text-green-400">Análise Concluída!</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Os insights estão prontos para visualização.</p>
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Ver Análise
            </Button>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center h-full flex flex-col justify-center items-center min-h-[150px]">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Adan pode analisar a flutuação de leads e sugerir otimizações de orçamento para os dias de maior potencial.
            </p>
            <Button onClick={handleAnalyze} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Play className="w-4 h-4 mr-2" />
              Analisar Agora
            </Button>
          </div>
        );
    }
  };

  return (
    <>
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-500" />
            <CardTitle className="text-lg">Análise de Leads</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {renderContent()}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{analysis?.title}</DialogTitle>
            <DialogDescription>
              Análise gerada pelo Adan IA com base nos dados do período selecionado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {analysis?.suggestions.map((suggestion, index) => (
              <p key={index} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {suggestion}
              </p>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsDialogOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
