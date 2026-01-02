
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

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
            style = { backgroundColor: '#FEF3C7' }; // amber-100
            textColorClass = 'text-amber-800';
            break;
        default:
            textColorClass = 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
    return <Badge style={style} className={`font-bold border-none ${textColorClass}`}>{pilar}</Badge>
}

const ValidacaoBadge = ({ validacao }) => {
    let colorClass = '';
    switch(validacao) {
        case 'Validada': colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'; break;
        case 'Em teste': colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'; break;
        case 'Ruim': colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'; break;
        default: colorClass = 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    }
     return <Badge variant="outline" className={`${colorClass} border-none`}>{validacao}</Badge>
}

export default function EstrategiaFunilCard({ estrategia, onEdit, onDelete, onView }) {
  return (
    <Card className="flex flex-col dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 h-full">
        <CardHeader>
            <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base flex-1">{estrategia.nome}</CardTitle>
                <PilarBadge pilar={estrategia.pilar} />
            </div>
            <CardDescription className="flex items-center gap-2">
                <span>{estrategia.etapa_funil}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <ValidacaoBadge validacao={estrategia.validacao} />
            </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
                <p className="font-semibold text-xs text-slate-500 dark:text-slate-300">Objetivo:</p>
                <p className="line-clamp-2">{estrategia.objetivo}</p>
            </div>
            <div>
                <p className="font-semibold text-xs text-slate-500 dark:text-slate-300">Ferramentas:</p>
                <p className="line-clamp-1">{estrategia.ferramentas}</p>
            </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
             {estrategia.observacao && (
                 <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md w-full"><strong>Obs:</strong> {estrategia.observacao}</p>
            )}
             <div className="flex justify-between items-center w-full">
                <Button variant="outline" onClick={() => onView(estrategia)}>Ver Detalhes</Button>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => onEdit(estrategia)}>
                        <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-red-500/10 text-slate-500 hover:text-red-500" onClick={() => onDelete(estrategia.id)}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </CardFooter>
    </Card>
  );
}
