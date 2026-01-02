
import React, { useState, useMemo } from 'react';
import PerformanceBreakdownChart from '@/components/dashboard/PerformanceBreakdownChart';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedCreativeAnalysis from '@/components/criativos/AdvancedCreativeAnalysis';
import { useAppContext } from "@/components/context/AppContext";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns";
import { ChipGroup, ChipButton } from "@/components/dashboard/Chip";

const creativePerformanceData = [
    { name: 'AD04_IMG_Carrossel', leads: 450, mqls: 90 },
    { name: 'AD07_VID_Depoimento', leads: 320, mqls: 110 },
    { name: 'AD11_RM_Oferta', leads: 150, mqls: 80 },
    { name: 'AD05_IMG_Frase', leads: 600, mqls: 100 },
    { name: 'AD01_VID_Tutorial', leads: 800, mqls: 250 },
    { name: 'AD10_IMG_Meme', leads: 750, mqls: 50 },
    { name: 'AD09_VID_Bastidores', leads: 400, mqls: 120 },
];

export default function Criativos() {
  const { funnel, setFunnel } = useAppContext();
  const [activeView, setActiveView] = useState('ranking'); // 'ranking' or 'performance'

  const initialDate = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: "Este mês",
  }), []);

  const handleDateChange = (range) => {
    console.log("Período da Análise de Criativos alterado para:", range);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Análise de Criativos</h1>
        <div className="flex items-center gap-3">
          <FunnelSelect value={funnel} onChange={(f) => setFunnel(f, true)} />
          <LocalPeriodPicker
            storageKey="period:criativos"
            initial={initialDate}
            PeriodPicker={CompactDateRangePicker}
            onChange={handleDateChange}
          />
        </div>
      </div>

      <ChipGroup>
        <ChipButton isActive={activeView === 'ranking'} onClick={() => setActiveView('ranking')}>
          Ranking de Criativos
        </ChipButton>
        <ChipButton isActive={activeView === 'performance'} onClick={() => setActiveView('performance')}>
          Performance de Criativos
        </ChipButton>
      </ChipGroup>
      
      <AnimatePresence mode="wait">
        <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
        >
            {activeView === 'ranking' && <AdvancedCreativeAnalysis />}
            {activeView === 'performance' && (
                <PerformanceBreakdownChart 
                    title="Performance de Criativos (Leads vs MQLs)"
                    data={creativePerformanceData}
                    barColor1="#e2e8f0" // slate-200
                    barColor2="#ec4899" // pink-500
                />
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
