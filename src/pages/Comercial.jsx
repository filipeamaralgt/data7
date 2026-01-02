
import React, { useState, useMemo } from "react";
import { useAppContext } from "@/components/context/AppContext";
import AtenaHeader from "@/components/comercial/AtenaHeader";
import KpiGrid from "@/components/comercial/KpiGrid";
import MetricasCloser from "@/components/comercial/MetricasCloser";
import RankingClosers from "@/components/comercial/RankingClosers";
import AtenaInsights from "@/components/comercial/AtenaInsights";
import AgendaComercial from "@/components/comercial/AgendaComercial";
import OuvirAtenaDialog from "@/components/comercial/OuvirAtenaDialog";
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";

export default function Comercial() {
  const { theme } = useAppContext();
  const [isAtenaDialogOpen, setIsAtenaDialogOpen] = useState(false);

  const initialDate = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: "Este mês",
  }), []);

  const handleDateChange = (range) => {
    // Lógica para lidar com a mudança de data, como recarregar os dados
    console.log("Período comercial alterado para:", range);
  };
  
  // Dados de exemplo que seriam carregados de uma API
  const kpis = [
    { title: "Agendamentos", value: "456", delta: "+12.5%" },
    { title: "Reuniões Realizadas", value: "298", delta: "+8.2%" },
    { title: "Vendas", value: "85", delta: "+5.8%" },
    { title: "Tx. Comparecimento", value: "65.4%", delta: "-2.1%", invertColors: true },
  ];

  const metricasClosersData = [
    { nome: "Carlos Silva", vendas: 28, ticket: 2850, reunioes: 40, faturamento: 79800 },
    { nome: "Ana Paula", vendas: 24, ticket: 2750, reunioes: 38, faturamento: 66000 },
    { nome: "Mariana Costa", vendas: 18, ticket: 2680, reunioes: 35, faturamento: 48240 },
    { nome: "Rafael Lima", vendas: 15, ticket: 2650, reunioes: 32, faturamento: 39750 },
    { nome: "Julia Santos", vendas: 12, ticket: 2800, reunioes: 25, faturamento: 33600 },
    { nome: "Marcos Andrade", vendas: 9, ticket: 2500, reunioes: 20, faturamento: 22500 },
  ].map(c => ({
      ...c,
      conversaoReunioes: (c.vendas / c.reunioes) * 100
  }));

  const rankingClosers = [
    { ranking: 1, nome: "Carlos Silva", vendas: 28, ticket: 2850, receita: 79800 },
    { ranking: 2, nome: "Ana Paula", vendas: 24, ticket: 2750, receita: 66000 },
    { ranking: 3, nome: "Mariana Costa", vendas: 18, ticket: 2680, receita: 48240 },
    { ranking: 4, nome: "Rafael Lima", vendas: 15, ticket: 2650, receita: 39750 },
  ];

  const insights = [
      {
          icon: 'TrendingUp',
          title: "Oportunidade de Treinamento",
          description: "Rafael Lima e Mariana Costa apresentam uma taxa de conversão 15% abaixo da média. Um treinamento focado em fechamento pode aumentar as vendas em até 8%.",
      },
      {
          icon: 'AlertTriangle',
          title: "Alerta de No-Show",
          description: "A taxa de comparecimento caiu 5% nesta semana. Revise o fluxo de lembretes e considere adicionar uma etapa de confirmação via WhatsApp.",
      },
       {
          icon: 'Award',
          title: "Performance Excepcional",
          description: "Carlos Silva manteve um ticket médio 20% acima dos demais por 3 semanas seguidas. Use suas gravações como material de estudo para a equipe.",
      }
  ];

  const today = new Date();
  const tomorrow = addDays(today, 1);
  const yesterday = addDays(today, -1);

  const agenda = [
      { date: format(today, 'yyyy-MM-dd'), startTime: '10:00', endTime: '11:00', lead: 'Fernanda Rocha', closer: 'Ana Paula', status: 'confirmada' },
      { date: format(today, 'yyyy-MM-dd'), startTime: '11:30', endTime: '12:15', lead: 'Roberto Dias', closer: 'Carlos Silva', status: 'confirmada' },
      { date: format(today, 'yyyy-MM-dd'), startTime: '14:00', endTime: '14:45', lead: 'Lucas Martins', closer: 'Mariana Costa', status: 'pendente' },
      { date: format(today, 'yyyy-MM-dd'), startTime: '16:00', endTime: '16:30', lead: 'Beatriz Almeida', closer: 'Rafael Lima', status: 'remarcada' },
      { date: format(tomorrow, 'yyyy-MM-dd'), startTime: '09:00', endTime: '09:45', lead: 'Novo Lead Amanhã', closer: 'Ana Paula', status: 'confirmada' },
      { date: format(yesterday, 'yyyy-MM-dd'), startTime: '15:00', endTime: '15:30', lead: 'Reunião de Ontem', closer: 'Carlos Silva', status: 'confirmada' },
  ];

  const atenaAnalysisData = {
    kpis,
    metricasClosersData,
    rankingClosers,
    insights,
    agenda,
  };

  return (
    <div className={`space-y-8 transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`}>
      <AtenaHeader onConsultarAtenaClick={() => setIsAtenaDialogOpen(true)}>
        <LocalPeriodPicker
            storageKey="period:comercial"
            initial={initialDate}
            PeriodPicker={CompactDateRangePicker}
            onChange={handleDateChange}
          />
      </AtenaHeader>
      <KpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <MetricasCloser data={metricasClosersData} />
          <RankingClosers data={rankingClosers} />
        </div>

        {/* Coluna Lateral (1/3) */}
        <div className="space-y-8">
          <AtenaInsights insights={insights} />
          <AgendaComercial agenda={agenda} />
        </div>
      </div>
      
      <OuvirAtenaDialog
        open={isAtenaDialogOpen}
        onOpenChange={setIsAtenaDialogOpen}
        data={atenaAnalysisData}
      />
    </div>
  );
}
