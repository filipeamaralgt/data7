
import React, { useState, useRef, useLayoutEffect, useMemo } from "react";
import {
  BarChart,
  Banknote,
  RefreshCcw,
  PieChart,
  CreditCard,
  Coins,
  Users,
  UserPlus,
  CalendarDays,
  Video,
  CircleDollarSign, // Trocado Coin por CircleDollarSign
  Percent,
} from "lucide-react";
import KpiCard from '../components/funis/KpiCard';
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/components/context/AppContext";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import CloserSelect from "@/components/dashboard/filters/CloserSelect";
import OriginSelect from "@/components/dashboard/filters/OriginSelect";
import HeaderSearchBar from "@/components/dashboard/filters/HeaderSearchBar";
import { LocalPeriodPicker } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth } from "date-fns";


const FunnelStage = ({ name, value, colorClass, width, height }) => {
  // Inverted trapezoid clip-path: wider at the top, narrower at the bottom
  const dynamicClipPath = `polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)`;

  return (
    <motion.div
      className="relative"
      style={{
        width: `${width}%`,
        height: `${height}px`,
      }}
      whileHover={{ scale: 1.03, y: -5, zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      <div className="relative w-full h-full">
        {/* The trapezoid shape */}
        <div
          className={`absolute inset-0 rounded-xl opacity-95 ${colorClass}`}
          style={{ clipPath: dynamicClipPath }}
        />
        {/* The text label, overlaid on top */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-2">
          <div>
            <strong className="funnel__value block font-black text-2xl md:text-3xl tracking-tighter">
              {value.toLocaleString()}
            </strong>
            <span className="funnel__label font-bold text-[10px] md:text-xs uppercase tracking-widest">
              {name}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


export default function Funis() {
  const { theme, funnel, setFunnel, closer, setCloser, origin, setOrigin } = useAppContext();
  const [stageHeight, setStageHeight] = useState(62); // Default height
  const leftColumnRef = useRef(null);
  const funnelContainerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  useLayoutEffect(() => {
    const element = leftColumnRef.current;
    if (!element) return;

    const calculateHeight = () => {
        const totalHeight = element.offsetHeight;
        const numberOfStages = 5;
        const gap = 12; // 12px gap
        const totalGaps = (numberOfStages - 1) * gap;
        const availableHeight = totalHeight - totalGaps;
        const calculatedHeight = Math.floor(availableHeight / numberOfStages);
        setStageHeight(calculatedHeight > 62 ? calculatedHeight : 62);
    };
    
    // Initial calculation
    calculateHeight();

    // Use ResizeObserver for more reliable recalculations
    const resizeObserver = new ResizeObserver(calculateHeight);
    resizeObserver.observe(element);
    
    // Recalculate after a short delay to account for initial render and animations
    const timeoutId = setTimeout(calculateHeight, 350);

    return () => {
        resizeObserver.unobserve(element);
        clearTimeout(timeoutId);
    };
  }, []);

  // --- Start of New Values ---
  const faturamentoTotal = 619150;
  const novasVendas = 61;
  const novoTicketMedio = faturamentoTotal / novasVendas; // Should be ~10150
  const investimentoValue = 45600;
  const cashCollectValue = 495320;

  const formatCurrency = (value) => value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const formatCurrencyWithCents = (value) => value.toLocaleString("pt-BR", { style: 'currency', currency: 'BRL' });


  const marketingKpis = [
    { icon: BarChart, title: "Investimento", value: formatCurrency(investimentoValue), iconBgColor: "#06B6D4" },
    { icon: Banknote, title: "Faturamento Total", value: formatCurrency(faturamentoTotal), iconBgColor: "#16A34A" },
    { icon: RefreshCcw, title: "ROAS", value: "13.58x", iconBgColor: "#7C3AED" },
    { icon: PieChart, title: "Tx. Conversão", value: "4.9%", iconBgColor: "#EAB308" }, // 61 vendas / 1240 leads
    { icon: CreditCard, title: "Ticket Médio", value: formatCurrency(novoTicketMedio), iconBgColor: "#EC4899" },
    { icon: Coins, title: "Cash Collect", value: formatCurrency(cashCollectValue), iconBgColor: "#14B8A6" },
  ];

  const funnelData = [
    { name: "Leads", value: 1240, colorClass: "funnel--leads", width: 82 },
    { name: "MQLs", value: 372, colorClass: "funnel--mqls", width: 62 },
    { name: "Agendamentos", value: 290, colorClass: "funnel--agendamentos", width: 50 },
    { name: "Reuniões", value: 174, colorClass: "funnel--reunioes", width: 38 },
    { name: "Vendas", value: novasVendas, colorClass: "funnel--vendas", width: 28 },
  ];
  
  const commercialKpis = [
    { icon: Users, title: "Custo por Lead", value: formatCurrencyWithCents(36.77), iconBgColor: "#2563EB" },
    { icon: UserPlus, title: "Custo por MQL", value: formatCurrencyWithCents(investimentoValue / 372), iconBgColor: "#A855F7" },
    { icon: CalendarDays, title: "Custo por Agend.", value: formatCurrencyWithCents(investimentoValue / 290), iconBgColor: "#6366F1" },
    { icon: Video, title: "Custo por Reunião", value: formatCurrencyWithCents(investimentoValue / 174), iconBgColor: "#10B981" },
    { icon: CircleDollarSign, title: "CPA", value: formatCurrencyWithCents(investimentoValue / novasVendas), iconBgColor: "#F59E0B" },
    { icon: Percent, title: "Taxa Cash Collect", value: "80.0%", iconBgColor: "#D97706" },
  ];
  // --- End of New Values ---


  const initialDate = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
    preset: "Este mês",
  }), []);

  const handleDateChange = (range) => {
    console.log("Período dos Funis alterado para:", range);
  };

  return (
    <>
      <style>{`
        :root {
          /* Texto */
          --txt-strong: #FFFFFF;
          --txt-soft:   #F2F6FA;

          /* Borda/hairline em Light */
          --hairline: rgba(0,0,0,0.04);
          --halo: 0 8px 24px rgba(0,0,0,0.18);

          /* Funil (LIGHT) */
          --funnel-leads: #0E1A2B;
          --funnel-mqls: #1F2A44;
          --funnel-schedules: #236AA7;
          --funnel-meetings: #B7892E;
          --funnel-sales: #2E8B57;

          /* Pills (%) */
          --pill-bg: #E9EEF5; --pill-txt: #0C1521;
        }

        .dark:root, [data-theme="dark"] {
          --hairline: rgba(255,255,255,0.07);
          --halo: 0 10px 28px rgba(0,0,0,0.28);

          /* Funil (DARK) */
          --funnel-leads: #132337;
          --funnel-mqls: #243255;
          --funnel-schedules: #2C7BBE;
          --funnel-meetings: #C59A3E;
          --funnel-sales: #35A36A;

          --pill-bg: #1D2733; --pill-txt: #E6EDF6;
        }
        
        .funnel--leads, .funnel--mqls, .funnel--agendamentos, .funnel--reunioes, .funnel--vendas {
            color: var(--txt-strong);
            box-shadow: var(--halo);
        }
        
        .funnel--leads         { background: var(--funnel-leads); }
        .funnel--mqls          { background: var(--funnel-mqls); }
        .funnel--agendamentos  { background: var(--funnel-schedules); }
        .funnel--reunioes      { background: var(--funnel-meetings); }
        .funnel--vendas        { background: var(--funnel-sales); }
        
        .funnel__label { color: var(--txt-soft); }
        .funnel__value { color: var(--txt-soft); }

        .funnel__pill  {
          background: var(--pill-bg);
          color: var(--pill-txt);
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 9999px;
        }
      `}</style>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[22px] font-semibold text-slate-900 dark:text-slate-50">Funis</h2>
          <div className="flex items-center gap-3">
            <HeaderSearchBar 
              className="w-64" // Added for width increase
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Buscar campanha, público, criativo..." // Placeholder updated
            />
            <FunnelSelect value={funnel} onChange={setFunnel} />
            <OriginSelect />
            <CloserSelect value={closer} onChange={setCloser} />
            <LocalPeriodPicker
              storageKey="period:funis-top"
              initial={initialDate}
              PeriodPicker={CompactDateRangePicker}
              onChange={handleDateChange}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[clamp(312px,23vw,348px)_1fr_clamp(312px,23vw,348px)] gap-6">
          
          {/* Coluna Esquerda: KPIs de Marketing */}
          <div ref={leftColumnRef} className="space-y-4">
            <AnimatePresence>
              {marketingKpis.map((kpi, i) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <KpiCard {...kpi} theme={theme} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Coluna Central: Funil Visual */}
          <div className="flex flex-col items-center justify-between" style={{ overflow: 'visible' }}>
            <div 
              ref={funnelContainerRef} 
              className="w-[66%] max-w-[720px] min-w-[600px] mx-auto relative h-full flex flex-col justify-between"
              style={{
                transform: 'scale(0.95)',
                transformOrigin: 'center top',
                marginTop: '8px'
              }}
            >
              {funnelData.map((stage, index) => (
                <motion.div
                  key={stage.name}
                  className="w-full flex justify-center bg-transparent"
                  style={{ border: 0, padding: 0 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <FunnelStage {...stage} height={stageHeight} />
                </motion.div>
              ))}

              {funnelData.map((stage, index) => {
                const nextStage = funnelData[index + 1];
                if (!nextStage) return null;
                
                const conversionRate = (nextStage.value / stage.value) * 100;

                return (
                  <motion.div
                    key={`conv-${index}`}
                    className="absolute"
                    style={{
                      top: `${index * (stageHeight + 12) + stageHeight + 6}px`,
                      left: `calc(50% + ${nextStage.width / 2}%)`,
                      transform: 'translateY(-50%)',
                    }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.15 + 0.2 }}
                  >
                    <span className="funnel__pill text-base ml-3 md:ml-4 lg:ml-6">
                      {conversionRate.toFixed(1)}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
          
          {/* Coluna Direita: KPIs Comerciais */}
          <div className="space-y-4">
             <AnimatePresence>
              {commercialKpis.map((kpi, i) => (
                <motion.div
                  key={kpi.title}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <KpiCard {...kpi} theme={theme} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
