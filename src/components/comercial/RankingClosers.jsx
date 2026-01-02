import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal } from 'lucide-react';

export default function RankingClosers({ data }) {
  const getPodiumStyle = (ranking) => {
    switch(ranking) {
      case 1:
        return {
          icon: <Medal className="w-5 h-5 text-amber-500" />,
          row: "bg-amber-50 dark:bg-amber-900/20",
        };
      case 2:
        return {
          icon: <Medal className="w-5 h-5 text-slate-400" />,
          row: "bg-slate-100 dark:bg-slate-800/20",
        };
      case 3:
        return {
          icon: <Medal className="w-5 h-5 text-orange-600" />,
          row: "bg-orange-50 dark:bg-orange-900/20",
        };
      default:
        return {
          icon: <span className="font-bold text-slate-500">{ranking}</span>,
          row: "hover:bg-slate-50/50 dark:hover:bg-slate-800/20",
        };
    }
  };

  return (
    <Card className="dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50">Ranking de Closers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">#</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Nome</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Vendas</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Ticket Médio</th>
                <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Receita Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((closer) => {
                const style = getPodiumStyle(closer.ranking);
                return (
                  <tr key={closer.ranking} className={`border-b border-slate-200 dark:border-slate-700/50 last:border-none transition-colors ${style.row}`}>
                    <td className="p-4">
                      <div className="w-8 h-8 grid place-items-center">
                        {style.icon}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200">{closer.nome}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{closer.vendas}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">R$ {closer.ticket.toLocaleString()}</td>
                    <td className="p-4 font-bold text-amber-600 dark:text-amber-400">R$ {closer.receita.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}