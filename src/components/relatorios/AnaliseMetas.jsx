
import React from 'react';
import { Award, Target, MessageSquare, AlertTriangle } from 'lucide-react';

const AnaliseMetas = ({ metas, theme }) => {
    if (!metas || metas.length === 0) {
        return null;
    }

    const isMetaMet = (meta) => meta.label.includes('custo') ? meta.actual <= meta.goal : meta.actual >= meta.goal;

    const metasAtingidas = metas.filter(isMetaMet).length;
    const totalMetas = metas.length;
    const proporcaoAtingida = totalMetas > 0 ? (metasAtingidas / totalMetas) : 0;

    const metasNaoAtingidas = metas.filter(meta => !isMetaMet(meta));
    const nomesMetasNaoAtingidas = metasNaoAtingidas.map(m => m.label.replace('Meta de ', '')).join(', ');

    let analise;

    if (proporcaoAtingida === 1) {
        analise = {
            icone: <Award className="w-5 h-5 text-amber-500" />,
            texto: "Parabéns! Todas as metas foram atingidas. Um resultado fantástico que demonstra o sucesso da estratégia."
        };
    } else if (proporcaoAtingida > 0.5) {
        analise = {
            icone: <Target className="w-5 h-5 text-green-500" />,
            texto: `Excelente progresso! A maioria das metas foi superada. O ponto de atenção fica para: ${nomesMetasNaoAtingidas}.`
        };
    } else if (proporcaoAtingida === 0.5) {
         analise = {
            icone: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            texto: `Atenção ao desempenho. Atingimos metade das metas, mas os objetivos de ${nomesMetasNaoAtingidas} ficaram abaixo do esperado. Recomenda-se revisar as campanhas relacionadas para encontrar pontos de otimização.`
        };
    } else if (proporcaoAtingida > 0) {
        analise = {
            icone: <MessageSquare className="w-5 h-5 text-blue-500" />,
            texto: "Atingimos algumas metas importantes, mas a maioria ficou abaixo do esperado. É um ponto de atenção para ajustarmos a rota."
        };
    } else {
        analise = {
            icone: <AlertTriangle className="w-5 h-5 text-red-500" />,
            texto: "Alerta crítico! Nenhuma meta foi atingida neste período. É crucial uma revisão completa da estratégia e da execução das campanhas para reverter o cenário."
        };
    }

    return (
        <div className={`p-4 border-t border-dashed ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`flex items-start gap-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="shrink-0 mt-0.5">
                    {analise.icone}
                </div>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {analise.texto}
                </p>
            </div>
        </div>
    );
};

export default AnaliseMetas;
