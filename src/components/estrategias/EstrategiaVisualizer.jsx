
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Zap, FileText, Megaphone, Database, MessageCircle, MessageSquare, Briefcase, ArrowRight, Loader2, ServerCrash, Users, MousePointerClick, Filter, CalendarCheck, BrainCircuit, Goal } from 'lucide-react';
import { InvokeLLM } from '@/integrations/Core';

const PilarBadge = ({ pilar }) => {
    let style = {};
    let textColorClass = '';
    switch(pilar) {
        case 'Automação 🤖': 
            style = { backgroundColor: '#CCFBF1' };
            textColorClass = 'text-teal-800';
            break;
        case 'Tráfego Pago 🚀': 
            style = { backgroundColor: '#CFFAFE' };
            textColorClass = 'text-cyan-800';
            break;
        case 'Comercial': 
            style = { backgroundColor: '#FEF3C7' };
            textColorClass = 'text-amber-800';
            break;
        default: 
            textColorClass = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
    return <Badge style={style} className={`font-bold border-none ${textColorClass}`}>{pilar}</Badge>
}

const iconMap = {
    Users, MousePointerClick, Filter, CalendarCheck, BrainCircuit, Goal,
    Zap, FileText, Megaphone, Database, MessageCircle, MessageSquare, Briefcase,
};

const IllustrationPlaceholder = ({ status, error }) => {
    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                <p className="mt-4 text-sm font-medium">Analisando a estratégia...</p>
            </div>
        );
    }
    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-500">
                <ServerCrash className="w-8 h-8 text-red-400" />
                <p className="mt-4 text-sm font-medium">Erro ao gerar visualização.</p>
                <p className="text-xs text-red-400 mt-1">{error}</p>
            </div>
        );
    }
    return null;
};


export default function EstrategiaVisualizer({ isOpen, setIsOpen, estrategia }) {
  const [illustration, setIllustration] = useState(null);
  const [illustrationStatus, setIllustrationStatus] = useState('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && estrategia) {
        if (estrategia.ilustracao_json) {
            // Se já existe, usa a ilustração salva
            setIllustration(estrategia.ilustracao_json);
            setIllustrationStatus('success');
        } else {
            // Se não existe (estratégia antiga), gera como fallback
            generateIllustration();
        }
    } else {
        // Reseta o estado ao fechar
        setIllustration(null);
        setIllustrationStatus('loading');
        setError(''); // Also clear error on close
    }
  }, [isOpen, estrategia]);

  const generateIllustration = async () => {
    setIllustrationStatus('loading');
    setError('');

    const prompt = `
        Você é um estrategista de marketing e designer visual. Sua tarefa é transformar uma estratégia de marketing em um conceito de fluxograma simples e bonito.

        Com base nos detalhes da estratégia fornecidos (nome, objetivo, descrição), gere um objeto JSON que descreva esse fluxo visual.

        A estratégia é:
        - Nome: ${estrategia.nome}
        - Objetivo: ${estrategia.objetivo}
        - Descrição: ${estrategia.descricao}

        Analise o objetivo e a descrição para identificar os principais estágios. O JSON deve seguir estritamente este esquema. Retorne apenas o JSON.
    `;

    const response_json_schema = {
      type: "object",
      properties: {
        title: { type: "string", description: "Um título curto, criativo e inspirador para o fluxo visual. Exemplo: 'A Jornada do Lead Qualificado'." },
        description: { type: "string", description: "Um resumo de uma frase do fluxo visual." },
        steps: {
          type: "array",
          description: "Um array de 2 a 4 etapas representando o fluxo da estratégia.",
          items: {
            type: "object",
            properties: {
              icon: { type: "string", description: "O nome de um ícone lucide-react válido. Escolha entre: 'Users', 'MousePointerClick', 'Filter', 'FileText', 'Zap', 'CalendarCheck', 'BrainCircuit', 'MessageSquare', 'Goal'." },
              label: { type: "string", description: "Um rótulo conciso de uma palavra para esta etapa." },
              color: { type: "string", description: "Um código de cor hexadecimal pastel suave para o fundo do ícone (ex: '#E0F2FE', '#E0E7FF', '#D1FAE5')." }
            },
            required: ["icon", "label", "color"]
          }
        }
      },
      required: ["title", "description", "steps"]
    };

    try {
        const response = await InvokeLLM({ prompt, response_json_schema });
        if (response && response.steps) {
            setIllustration(response);
            setIllustrationStatus('success');
        } else {
            throw new Error("Resposta da IA inválida.");
        }
    } catch (e) {
        console.error("Erro ao gerar ilustração com IA:", e);
        setError(e.message);
        setIllustrationStatus('error');
    }
  }

  if (!estrategia) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.3 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold">{estrategia.nome}</DialogTitle>
                <PilarBadge pilar={estrategia.pilar} />
              </div>
          </div>
          <DialogDescription>
            {illustration && illustrationStatus === 'success' ? illustration.description : 'Visualização do fluxo da estratégia.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Coluna da Animação */}
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 min-h-[250px]">
            {illustrationStatus !== 'success' ? (
                <IllustrationPlaceholder status={illustrationStatus} error={error} />
            ) : (
                <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{illustration.title}</h3>
                    <motion.div
                        className="flex flex-wrap items-center justify-center gap-2 mt-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                    {illustration.steps.map((step, index) => {
                        const Icon = iconMap[step.icon] || Zap;
                        return (
                        <React.Fragment key={index}>
                            <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 text-center w-24">
                                <div 
                                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: step.color }}
                                >
                                    <Icon className="w-6 h-6 text-slate-700" />
                                </div>
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{step.label}</span>
                            </motion.div>
                            {index < illustration.steps.length - 1 && (
                                <motion.div variants={itemVariants}>
                                    <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                                </motion.div>
                            )}
                        </React.Fragment>
                        );
                    })}
                    </motion.div>
                </div>
            )}
          </div>

          {/* Coluna de Detalhes */}
          <div className="space-y-4 text-sm max-h-[50vh] overflow-y-auto pr-2 scrollbar-slim">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Descrição</h3>
              <p className="text-slate-600 dark:text-slate-400">{estrategia.descricao}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Objetivo</h3>
              <p className="text-slate-600 dark:text-slate-400">{estrategia.objetivo}</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Ferramentas</h3>
              <p className="text-slate-600 dark:text-slate-400">{estrategia.ferramentas || "Não especificadas"}</p>
            </div>
            {estrategia.observacao && (
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Observação</h3>
                <p className="text-slate-600 dark:text-slate-400">{estrategia.observacao}</p>
              </div>
            )}
             <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Status</h3>
              <Badge variant="outline">{estrategia.validacao}</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
