
import React, { useMemo } from 'react';
import PerformanceBreakdownChart from '@/components/dashboard/PerformanceBreakdownChart';
import { motion } from 'framer-motion';
import { useAppContext } from "@/components/context/AppContext";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns";

const publicPerformanceData = [
  { name: 'Público Frio - Interesses', leads: 1200, mqls: 150 },
  { name: 'Lookalike 1% - Compras', leads: 950, mqls: 220 },
  { name: 'Remarketing 7d - View', leads: 400, mqls: 180 },
  { name: 'Lookalike 3% - Leads', leads: 1500, mqls: 180 },
  { name: 'Remarketing 30d - Geral', leads: 650, mqls: 250 },
];

export default function Publicos() {
  const { funnel, setFunnel } = useAppContext();

  const initialDate = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: "Este mês",
  }), []);

  const handleDateChange = (range) => {
    console.log("Período da Análise de Públicos alterado para:", range);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Análise de Públicos</h1>
        <div className="flex items-center gap-3">
          <FunnelSelect value={funnel} onChange={(f) => setFunnel(f, true)} />
          <LocalPeriodPicker
            storageKey="period:publicos"
            initial={initialDate}
            PeriodPicker={CompactDateRangePicker}
            onChange={handleDateChange}
          />
        </div>
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <PerformanceBreakdownChart 
          title="Performance de Públicos (Leads vs MQLs)"
          data={publicPerformanceData}
          barColor1="#93c5fd" // blue-300
          barColor2="#3b82f6" // blue-600
        />
      </motion.div>
    </div>
  );
}
