
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BrainCircuit, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-48 gap-4">
    <div className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 animate-pulse">
        <BrainCircuit className="w-8 h-8" />
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-medium">Atena está analisando os dados...</p>
  </div>
);

const AnalysisSection = ({ title, items, icon, colorClass }) => {
  const Icon = icon;
  return (
    <div className="space-y-3">
      <h3 className={`flex items-center gap-2 font-bold text-lg ${colorClass.text}`}>
        <Icon className="w-5 h-5" />
        {title}
      </h3>
      <div className="space-y-3 pl-4 border-l-2" style={{ borderColor: colorClass.border }}>
        {items.map((item, index) => (
          <div key={index} className="pl-3">
            <p className="font-semibold text-slate-800 dark:text-slate-100">{item.titulo}</p>
            <p className="text-slate-600 dark:text-slate-400">{item.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OuvirAtenaDialog({ open, onOpenChange, data }) {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      generateSummary();
    } else {
      // Reset state when closing
      setSummary(null);
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const generateSummary = async () => {
    setIsLoading(true);
    setSummary(null);
    setError(null);

    const jsonSchema = {
        type: "object",
        properties: {
            destaques_positivos: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" }
                    },
                    required: ["titulo", "descricao"]
                }
            },
            pontos_atencao: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" }
                    },
                    required: ["titulo", "descricao"]
                }
            },
            recomendacoes: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        titulo: { type: "string" },
                        descricao: { type: "string" }
                    },
                    required: ["titulo", "descricao"]
                }
            }
        },
        required: ["destaques_positivos", "pontos_atencao", "recomendacoes"]
    };

    try {
      const prompt = `
        Você é Atena, uma especialista em análise de dados comerciais. Sua tarefa é analisar os seguintes dados de um painel de vendas e fornecer um resumo conciso e acionável.

        **Instruções:**
        1.  **Tom de Voz:** Seja profissional, direta e insightful.
        2.  **Análise:** Baseie-se APENAS nos dados fornecidos. Cite nomes e números específicos para embasar suas conclusões. Compare a performance dos closers.
        3.  **Formato de Saída:** Sua resposta DEVE ser um objeto JSON válido que corresponda ao schema fornecido. Organize os insights em três arrays: 'destaques_positivos', 'pontos_atencao', e 'recomendacoes'. Cada item deve ter 'titulo' e 'descricao'.

        **Dados para Análise:**
        - KPIs Gerais: ${JSON.stringify(data.kpis, null, 2)}
        - Métricas por Closer: ${JSON.stringify(data.metricasClosersData, null, 2)}
        - Ranking de Closers: ${JSON.stringify(data.rankingClosers, null, 2)}

        Gere o relatório em formato JSON.
      `;

      const result = await InvokeLLM({ prompt, response_json_schema: jsonSchema });
      setSummary(result);
    } catch (e) {
      console.error("Erro ao gerar resumo da Atena:", e);
      setError("Desculpe, não foi possível gerar a análise neste momento. Por favor, tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <BrainCircuit className="w-6 h-6 text-amber-500" />
            Análise da Atena
          </DialogTitle>
          <DialogDescription>
            Um resumo do desempenho comercial gerado por inteligência artificial.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto pr-4 space-y-6 scrollbar-slim">
          {isLoading && <LoadingState />}
          {error && <p className="text-red-500">{error}</p>}
          {summary && (
            <>
              {summary.destaques_positivos && summary.destaques_positivos.length > 0 && (
                <AnalysisSection 
                  title="Destaques Positivos" 
                  items={summary.destaques_positivos} 
                  icon={TrendingUp}
                  colorClass={{ text: "text-emerald-500", border: "#10B981" }}
                />
              )}
              {summary.pontos_atencao && summary.pontos_atencao.length > 0 && (
                <AnalysisSection 
                  title="Pontos de Atenção" 
                  items={summary.pontos_atencao} 
                  icon={AlertTriangle}
                  colorClass={{ text: "text-amber-500", border: "#F59E0B" }}
                />
              )}
              {summary.recomendacoes && summary.recomendacoes.length > 0 && (
                <AnalysisSection 
                  title="Recomendações" 
                  items={summary.recomendacoes} 
                  icon={Lightbulb}
                  colorClass={{ text: "text-sky-500", border: "#0EA5E9" }}
                />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
