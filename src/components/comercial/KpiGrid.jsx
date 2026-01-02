import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, CheckSquare, DollarSign, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';

const iconStyles = {
  "Agendamentos": { icon: <Calendar className="w-6 h-6 text-amber-600" />, bg: "bg-amber-100 dark:bg-amber-900/50" },
  "Reuniões Realizadas": { icon: <CheckSquare className="w-6 h-6 text-sky-600" />, bg: "bg-sky-100 dark:bg-sky-900/50" },
  "Vendas": { icon: <DollarSign className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-100 dark:bg-emerald-900/50" },
  "Tx. Comparecimento": { icon: <UserCheck className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-100 dark:bg-indigo-900/50" },
};


export default function KpiGrid({ kpis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi) => {
        const styles = iconStyles[kpi.title] || { icon: null, bg: 'bg-slate-100' };
        return (
          <Card key={kpi.title} className="dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${styles.bg}`}>
                   {styles.icon}
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                    kpi.delta.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600' : 'bg-rose-50 dark:bg-rose-950 text-rose-600'
                }`}>
                  {kpi.delta.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.delta}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}