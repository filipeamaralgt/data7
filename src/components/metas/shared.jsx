import {
    Coins, TrendingUp, UserCheck, CalendarCheck, Video, Target, BarChart, Percent, CircleDollarSign, UserPlus, CalendarDays
} from 'lucide-react';

export const icons = {
    faturamento: <Coins className="w-5 h-5 text-slate-500" />,
    leads: <TrendingUp className="w-5 h-5 text-slate-500" />,
    mqls: <UserCheck className="w-5 h-5 text-slate-500" />,
    agendamentos: <CalendarCheck className="w-5 h-5 text-slate-500" />,
    reunioes: <Video className="w-5 h-5 text-slate-500" />,
    vendas: <Target className="w-5 h-5 text-slate-500" />,
    roas: <TrendingUp className="w-5 h-5 text-slate-500" />,
    investimento: <BarChart className="w-5 h-5 text-slate-500" />,
    tx_conversao: <Percent className="w-5 h-5 text-slate-500" />,
    ticket_medio: <CircleDollarSign className="w-5 h-5 text-slate-500" />,
    cash_collect: <Coins className="w-5 h-5 text-slate-500" />,
    cpl: <UserPlus className="w-5 h-5 text-slate-500" />,
    cpmql: <UserPlus className="w-5 h-5 text-slate-500" />,
    custo_agendamento: <CalendarDays className="w-5 h-5 text-slate-500" />,
    custo_reuniao: <Video className="w-5 h-5 text-slate-500" />,
    cpa: <CircleDollarSign className="w-5 h-5 text-slate-500" />,
    taxa_cash_collect: <Percent className="w-5 h-5 text-slate-500" />,
};

export const metricTypesConfig = {
    faturamento: { unit: 'currency' },
    investimento: { unit: 'currency' },
    cash_collect: { unit: 'currency' },
    ticket_medio: { unit: 'currency' },
    cpl: { unit: 'currency', smallerIsBetter: true },
    cpa: { unit: 'currency', smallerIsBetter: true },
    custo_agendamento: { unit: 'currency', smallerIsBetter: true },
    custo_reuniao: { unit: 'currency', smallerIsBetter: true },
    cpmql: { unit: 'currency', smallerIsBetter: true },
    leads: { unit: 'number' },
    mqls: { unit: 'number' },
    agendamentos: { unit: 'number' },
    reunioes: { unit: 'number' },
    vendas: { unit: 'number' },
    roas: { unit: 'multiplier' },
    tx_conversao: { unit: 'percentage' },
    taxa_cash_collect: { unit: 'percentage' },
};

export const metricOrder = [ "leads", "mqls", "agendamentos", "reunioes", "vendas", "faturamento", "investimento", "roas", "ticket_medio", "cash_collect", "taxa_cash_collect", "cpl", "cpmql", "custo_agendamento", "custo_reuniao", "cpa"];