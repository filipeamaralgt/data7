
import React, { useMemo, useState } from "react";
import { MetricCard } from "@/components/metrics-delta";
import { Banknote, TrendingUp, BarChart, RefreshCcw, Coins, Minus, TrendingDown, Eye } from "lucide-react";
import { ChartsBottom } from "@/components/dashboard/ChartsBottom";
import { useAppContext } from "@/components/context/AppContext";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns"; // Corrected this line
import { motion } from "framer-motion";

export default function Home() {
  const { theme } = useAppContext();
  const [activeChart, setActiveChart] = useState('faturamento');
  const [hoveredChart, setHoveredChart] = useState(null);

  // Dados para os cards de métricas (com valores atuais e anteriores para cálculo de delta)
  const metricas = {
    faturamento: { atual: 215000, anterior: 195000 },
    cashCollect: { atual: 198400, anterior: 183200 },
    investimento: { atual: 45600, anterior: 43300 },
    roas: { atual: 4.71, anterior: 4.50 },
  };

  const deltas = {
    faturamento: ((metricas.faturamento.atual - metricas.faturamento.anterior) / metricas.faturamento.anterior) * 100,
    cashCollect: ((metricas.cashCollect.atual - metricas.cashCollect.anterior) / metricas.cashCollect.anterior) * 100,
    investimento: ((metricas.investimento.atual - metricas.investimento.anterior) / metricas.investimento.anterior) * 100,
    roas: metricas.roas.atual - metricas.roas.anterior, // ROAS é uma diferença, não percentual
  };

  const getInvestmentStatus = (delta) => {
    if (delta > 5) {
      return { text: "Escalando", color: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-400", icon: <TrendingUp className="w-3.5 h-3.5" /> };
    }
    if (delta < -30) {
      return { text: "Reduzido", color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", icon: <TrendingDown className="w-3.5 h-3.5" /> };
    }
    return { text: "Estável", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: <Minus className="w-3.5 h-3.5" /> };
  };

  const investmentStatus = getInvestmentStatus(deltas.investimento);

  const initialDate = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: "Este mês",
  }), []);

  const handleDateChange = (range) => {
    console.log("Período da Home alterado para:", range);
  };

  const metricColors = {
    faturamento: 'border-l-green-500',
    cash_collect: 'border-l-amber-500', // Revertido para Âmbar/Ouro
    investimento: 'border-l-cyan-600',
    roas: 'border-l-violet-600',
  };

  const cardContainerClasses = (type) => `
    relative p-4 rounded-2xl transition-all duration-300 group cursor-pointer
    bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm
    border-l-4
    hover:shadow-lg hover:-translate-y-1
    ${(activeChart === type || hoveredChart === type)
      ? metricColors[type]
      : 'border-l-transparent'
    }
  `;
  
  const iconColor = (type, color) => {
    return activeChart === type || hoveredChart === type ? color : "text-slate-500 dark:text-slate-400";
  };
  
  const iconBgColor = (type, color) => {
    return activeChart === type || hoveredChart === type ? color : "bg-slate-100 dark:bg-slate-800";
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-[22px] font-semibold text-slate-900 dark:text-slate-50">Visão Geral</h2>
        <LocalPeriodPicker
          storageKey="period:home-top"
          initial={initialDate}
          PeriodPicker={CompactDateRangePicker}
          onChange={handleDateChange}
          className="ml-auto"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Faturamento Card */}
        <div 
            className={cardContainerClasses('faturamento')} 
            onClick={() => setActiveChart('faturamento')}
            onMouseEnter={() => setHoveredChart('faturamento')}
            onMouseLeave={() => setHoveredChart(null)}
        >
          <MetricCard
            label="FATURAMENTO"
            value={metricas.faturamento.atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            delta={deltas.faturamento}
            icon={<Banknote className={`w-5 h-5 transition-colors ${iconColor('faturamento', 'text-green-600')}`} />}
            iconBg={`${iconBgColor('faturamento', 'bg-green-100 dark:bg-green-900/50')} transition-colors`}
            simple
          />
          {activeChart !== 'faturamento' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={hoveredChart === 'faturamento' ? { opacity: 1, y: 0 } : {}}
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all"
            >
               <div className="h-7 w-7 grid place-items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg">
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               </div>
            </motion.div>
          )}
        </div>

        {/* Cash Collect Card */}
        <div 
            className={cardContainerClasses('cash_collect')} 
            onClick={() => setActiveChart('cash_collect')}
            onMouseEnter={() => setHoveredChart('cash_collect')}
            onMouseLeave={() => setHoveredChart(null)}
        >
          <MetricCard
            label="CASH COLLECT"
            value={metricas.cashCollect.atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            delta={deltas.cashCollect}
            icon={<Coins className={`w-5 h-5 transition-colors ${iconColor('cash_collect', 'text-amber-500')}`} />}
            iconBg={`${iconBgColor('cash_collect', 'bg-amber-100 dark:bg-amber-900/50')} transition-colors`}
            simple
          />
           {activeChart !== 'cash_collect' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={hoveredChart === 'cash_collect' ? { opacity: 1, y: 0 } : {}}
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all"
            >
               <div className="h-7 w-7 grid place-items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg">
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               </div>
            </motion.div>
          )}
        </div>
        
        {/* Investimento Card */}
        <div 
            className={cardContainerClasses('investimento')} 
            onClick={() => setActiveChart('investimento')}
            onMouseEnter={() => setHoveredChart('investimento')}
            onMouseLeave={() => setHoveredChart(null)}
        >
          <div className="flex justify-between items-start mb-3">
              <div className={`w-9 h-9 rounded-lg grid place-items-center transition-colors ${iconBgColor('investimento', 'bg-cyan-100 dark:bg-cyan-900/50')}`}>
                  <BarChart className={`w-5 h-5 transition-colors ${iconColor('investimento', 'text-cyan-600')}`} />
              </div>
              <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${investmentStatus.color}`}>
                  {investmentStatus.icon}
                  <span>{investmentStatus.text}</span>
              </div>
          </div>
          <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">INVESTIMENTO</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1 truncate">
                  {metricas.investimento.atual.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
          </div>
          {activeChart !== 'investimento' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={hoveredChart === 'investimento' ? { opacity: 1, y: 0 } : {}}
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all"
            >
               <div className="h-7 w-7 grid place-items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg">
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               </div>
            </motion.div>
          )}
        </div>

        {/* ROAS Card */}
        <div 
            className={cardContainerClasses('roas')} 
            onClick={() => setActiveChart('roas')}
            onMouseEnter={() => setHoveredChart('roas')}
            onMouseLeave={() => setHoveredChart(null)}
        >
           <MetricCard
            label="ROAS"
            value={`${metricas.roas.atual.toFixed(2)}x`}
            delta={deltas.roas}
            deltaUnit="x"
            icon={<RefreshCcw className={`w-5 h-5 transition-colors ${iconColor('roas', 'text-violet-600')}`} />}
            iconBg={`${iconBgColor('roas', 'bg-violet-100 dark:bg-violet-900/50')} transition-colors`}
            simple
          />
          {activeChart !== 'roas' && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={hoveredChart === 'roas' ? { opacity: 1, y: 0 } : {}}
              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all"
            >
               <div className="h-7 w-7 grid place-items-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg">
                  <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
               </div>
            </motion.div>
          )}
        </div>
      </div>

      <ChartsBottom activeChart={activeChart} />

    </div>
  );
}
