import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { metricTypesConfig } from './shared';

const renderValue = (value, type) => {
    const config = metricTypesConfig[type] || {};
    if (value === null || value === undefined || isNaN(value)) return '-';
    
    switch (config.unit) {
        case 'currency':
            return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        case 'multiplier':
            return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x`;
        case 'percentage':
            return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
        default:
            return value.toLocaleString('pt-BR');
    }
};

const getStatus = (percentual, smallerIsBetter = false) => {
    if (percentual === null) return { text: "Sem Dados", variant: "neutral" };
    
    if (smallerIsBetter) {
        if (percentual <= 100) return { text: "Excelente", variant: "success" };
        if (percentual <= 115) return { text: "Atenção", variant: "warning" };
        return { text: "Crítico", variant: "destructive" };
    }
    
    if (percentual >= 100) return { text: "Superada", variant: "success" };
    if (percentual >= 85) return { text: "Em Dia", variant: "default" };
    return { text: "Atenção", variant: "warning" };
};

export default function AnaliseSemana({ data }) {
    if (!data) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">Selecione uma semana para ver a análise detalhada.</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg dark:border-slate-800 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <TableHead className="w-[250px] sticky left-0 bg-slate-50 dark:bg-slate-800/50 z-10">Métrica</TableHead>
                        <TableHead className="text-right">Meta Semanal</TableHead>
                        <TableHead className="text-right">Realizado</TableHead>
                        <TableHead className="w-[200px]">Progresso</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map(item => {
                        const config = metricTypesConfig[item.type] || {};
                        const percentual = item.weeklyGoal > 0 ? (item.realized / item.weeklyGoal) * 100 : (item.realized > 0 ? 100 : 0);
                        const status = getStatus(item.weeklyGoal !== null ? percentual : null, config.smallerIsBetter);

                        const statusBadgeVariant = {
                            success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
                            warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
                            destructive: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
                            default: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
                            neutral: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                        }[status.variant];

                        return (
                            <TableRow key={item.name} className="dark:border-slate-800">
                                <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 z-10">
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right whitespace-nowrap">
                                    {renderValue(item.weeklyGoal, item.type)}
                                </TableCell>
                                <TableCell className="text-right font-bold whitespace-nowrap">
                                    {renderValue(item.realized, item.type)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Progress value={percentual} className="h-2 flex-1" />
                                        <span className="text-xs font-semibold w-12 text-right">
                                            {item.weeklyGoal !== null ? `${Math.round(percentual)}%` : '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant="outline" className={`font-bold text-[11px] px-2.5 py-1 h-auto border-none ${statusBadgeVariant}`}>{status.text}</Badge>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}