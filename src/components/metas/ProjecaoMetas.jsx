import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { TrendingUp, UserCheck, ShoppingCart, CalendarCheck, Video } from 'lucide-react';
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';
import { motion } from 'framer-motion';

const ProjectionItem = ({ icon, title, description, value }) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 border border-slate-200/50 dark:border-slate-800"
    >
        <div className="w-10 h-10 rounded-lg grid place-items-center bg-white dark:bg-slate-900/50 shrink-0">
            {icon}
        </div>
        <div className="flex-grow">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="text-right">
            <p className="text-3xl font-black tracking-tighter text-slate-900 dark:text-slate-50">{Math.round(value)}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Projeção</p>
        </div>
    </motion.div>
);

export default function ProjecaoMetas() {
    const [period, setPeriod] = useState(3);

    const projecoes = [
        { 
            icon: <TrendingUp className="w-5 h-5 text-cyan-600" />,
            title: 'Leads',
            description: `Projeção baseada em um CPL de R$ 36,77 e investimento diário de R$ 6.133,00.`,
            dailyValue: 167,
        },
        { 
            icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
            title: 'MQLs',
            description: 'Projeção baseada em um Custo por MQL de R$ 93,30.',
            dailyValue: 66,
        },
        { 
            icon: <CalendarCheck className="w-5 h-5 text-blue-600" />,
            title: 'Agendamentos',
            description: 'Projeção baseada em um Custo por Agendamento de R$ 157,24.',
            dailyValue: 39,
        },
        { 
            icon: <Video className="w-5 h-5 text-teal-600" />,
            title: 'Reuniões',
            description: 'Projeção baseada em um Custo por Reunião de R$ 262,06.',
            dailyValue: 23,
        },
        { 
            icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
            title: 'Vendas',
            description: 'Projeção baseada em um CPA de R$ 1.533,00.',
            dailyValue: 4,
        },
    ];
    
    const periodOptions = [
        { value: 1, label: "Amanhã" },
        { value: 3, label: "3 dias" },
        { value: 7, label: "7 dias" },
        { value: 14, label: "14 dias" },
        { value: 30, label: "30 dias" },
    ];

    const titleText = period === 1 ? "Projeção Linear - Amanhã" : `Projeção Linear - Próximos ${period} Dias`;

    return (
        <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-slate-900 dark:text-slate-50">{titleText}</CardTitle>
                    <CardDescription>A tendência de projeção utiliza a média de performance dos últimos 7 a 14 dias.</CardDescription>
                </div>
                 <ChipGroup>
                    {periodOptions.map(option => (
                        <ChipButton key={option.value} isActive={period === option.value} onClick={() => setPeriod(option.value)}>
                            {option.label}
                        </ChipButton>
                    ))}
                </ChipGroup>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        {projecoes.slice(0, 3).map(proj => (
                            <ProjectionItem 
                                key={proj.title}
                                icon={proj.icon}
                                title={proj.title}
                                description={proj.description}
                                value={proj.dailyValue * period}
                            />
                        ))}
                    </div>
                    <div className="space-y-4">
                         {projecoes.slice(3, 5).map(proj => (
                            <ProjectionItem 
                                key={proj.title}
                                icon={proj.icon}
                                title={proj.title}
                                description={proj.description}
                                value={proj.dailyValue * period}
                            />
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}