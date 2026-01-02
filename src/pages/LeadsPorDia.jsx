
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import LeadsMetricCard from '@/components/leads/LeadsMetricCard';
import FunilDiarioChart from '@/components/leads/FunilDiarioChart';
import AdanLeadsAnalysis from '@/components/leads/AdanLeadsAnalysis';
import { Users, Target, CalendarCheck, Percent } from 'lucide-react';

// Mock data generation for a full month
const generateMockDataForMonth = (date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  return days.map(day => {
    const leads = Math.floor(Math.random() * 40) + 10;
    const mqls = Math.floor(leads * (Math.random() * 0.2 + 0.15)); // 15% to 35% conversion
    const agendamentos = Math.floor(mqls * (Math.random() * 0.2 + 0.6)); // 60% to 80% conversion
    return {
      date: format(day, 'yyyy-MM-dd'),
      leads,
      mqls,
      agendamentos,
    };
  });
};


export default function LeadsPorDia() {
  const [currentMonthData] = useState(() => generateMockDataForMonth(new Date()));
  
  const initialDateRange = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return { start: start.toISOString(), end: end.toISOString(), preset: "Este mês" };
  }, []);

  const [dateRange, setDateRange] = useState(initialDateRange);
  const [filteredData, setFilteredData] = useState([]);
  const [funnel, setFunnel] = useState("Funil Geral");

  useEffect(() => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(23, 59, 59, 999);

    const dataInPeriod = currentMonthData.filter(d => {
        const day = new Date(d.date);
        day.setUTCHours(12,0,0,0); // Avoid timezone issues
        return day >= start && day <= end;
    });

    setFilteredData(dataInPeriod);
  }, [dateRange, currentMonthData]);

  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => {
      acc.leads += curr.leads;
      acc.mqls += curr.mqls;
      acc.agendamentos += curr.agendamentos;
      return acc;
    }, { leads: 0, mqls: 0, agendamentos: 0 });
  }, [filteredData]);

  const daysInMonth = useMemo(() => getDaysInMonth(new Date(dateRange.start)), [dateRange.start]);

  const metas = useMemo(() => ({
    leads: 1429,
    mqls: 429,
    agendamentos: 343,
    mqlRate: 30, // Meta de 30% de MQLs
  }), []);

  const mqlRate = totals.leads > 0 ? (totals.mqls / totals.leads) * 100 : 0;
  
  const medias = useMemo(() => {
    const periodDays = filteredData.length > 0 ? filteredData.length : 1;
    return {
        leads: totals.leads / periodDays,
        mqls: totals.mqls / periodDays,
        agendamentos: totals.agendamentos / periodDays,
    }
  }, [filteredData, totals]);

  const metasDiarias = useMemo(() => ({
      leads: metas.leads / daysInMonth,
      mqls: metas.mqls / daysInMonth,
      agendamentos: metas.agendamentos / daysInMonth,
  }), [metas, daysInMonth]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Leads por Dia</h1>
        <div className="flex items-center gap-2">
            <FunnelSelect value={funnel} onChange={setFunnel} />
            <CompactDateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <LeadsMetricCard 
          icon={<Users className="w-5 h-5 text-blue-500" />}
          title="Leads"
          value={totals.leads}
          goal={metas.leads}
          mediaDia={medias.leads}
          metaDia={metasDiarias.leads}
        />
        <LeadsMetricCard 
          icon={<Target className="w-5 h-5 text-orange-500" />}
          title="MQLs"
          value={totals.mqls}
          goal={metas.mqls}
          mediaDia={medias.mqls}
          metaDia={metasDiarias.mqls}
        />
        <LeadsMetricCard 
            icon={<Percent className="w-5 h-5 text-indigo-500" />}
            title="% de MQLs" 
            value={mqlRate} 
            goal={metas.mqlRate} 
            unit="%" 
        />
        <LeadsMetricCard 
          icon={<CalendarCheck className="w-5 h-5 text-fuchsia-500" />}
          title="Agendamentos"
          value={totals.agendamentos}
          goal={metas.agendamentos}
          mediaDia={medias.agendamentos}
          metaDia={metasDiarias.agendamentos}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Análise Diária do Funil</CardTitle>
            <CardDescription>Performance de Leads, MQLs e Agendamentos no período selecionado.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 p-4 pt-0">
            <FunilDiarioChart data={filteredData} />
          </CardContent>
        </Card>
        
        <AdanLeadsAnalysis metrics={{ mqlRate, leadsAvg: medias.leads, totalLeads: totals.leads }} className="h-full" />
      </div>
    </div>
  );
}
