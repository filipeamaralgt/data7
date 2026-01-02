
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AgendaComercial({ agenda }) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const weekDays = useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 0 }); // Domingo
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, []);

    const filteredAgenda = useMemo(() => {
        return agenda.filter(item => isSameDay(new Date(item.date), selectedDate));
    }, [agenda, selectedDate]);

    const statusConfig = {
        confirmada: "bg-emerald-500",
        pendente: "bg-amber-500",
        remarcada: "bg-rose-500",
    };

  return (
    <Card className="dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-slate-50">Agenda do Dia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto scrollbar-slim pb-2">
            <div className="flex justify-around items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 min-w-[380px]">
                {weekDays.map(day => (
                    <button 
                        key={day.toISOString()} 
                        onClick={() => setSelectedDate(day)}
                        className="flex flex-col items-center gap-2 py-1 px-2 rounded-lg transition-colors duration-200 flex-shrink-0"
                    >
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 capitalize">{format(day, 'EEE', { locale: ptBR }).replace('.', '')}</span>
                        <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                            isSameDay(day, selectedDate)
                            ? 'bg-rose-500 text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                            {format(day, 'd')}
                        </span>
                    </button>
                ))}
            </div>
        </div>

        <div className="h-[240px] overflow-y-auto pr-2 space-y-2 scrollbar-slim">
            {filteredAgenda.length > 0 ? filteredAgenda.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-200">
                <div className={`w-1 h-12 rounded-full ${statusConfig[item.status]}`}></div>
                <div className="flex-grow">
                  <p className="font-bold text-md text-slate-800 dark:text-slate-200">{item.startTime} - {item.endTime}</p>
                  <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{item.lead}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Closer: {item.closer}</p>
                </div>
                 <Button variant="ghost" size="sm">Ver</Button>
              </div>
            )) : (
                <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                    <p>Nenhum compromisso para hoje.</p>
                </div>
            )}
        </div>
        <Button variant="outline" className="w-full">Ver agenda completa</Button>
      </CardContent>
    </Card>
  );
}
