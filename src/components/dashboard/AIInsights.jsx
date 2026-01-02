
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X, ChevronRight, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/components/context/AppContext";

export default function AIInsights() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useAppContext();

  const insights = [
    {
      title: "Oportunidade de Otimização",
      description: "O custo por lead aumentou 15% nos últimos 7 dias. Considere ajustar os lances das campanhas de maior volume.",
      status: "warning",
      impact: "Economia estimada: R$ 2.400/mês",
      icon: AlertCircle
    },
    {
      title: "Performance Excepcional",
      description: "A campanha 'Webinar Janeiro' está com ROAS 3.2x acima da média. Considere aumentar o orçamento.",
      status: "positive",
      impact: "Potencial de receita adicional: R$ 18.500",
      icon: TrendingUp
    },
    {
      title: "Alerta de Conversão",
      description: "Taxa de comparecimento caiu de 65% para 52%. Revisar processo de confirmação e lembretes.",
      status: "negative",
      impact: "Impacto: -8 vendas/semana",
      icon: AlertCircle
    }
  ];

  const getStatusConfig = (status) => {
    if (status === "positive") {
      return {
        border: "border-l-[#22C55E]",
        bg: theme === "dark" ? "bg-[#22C55E]/5" : "bg-[#22C55E]/5",
        iconBg: "bg-[#22C55E]/10",
        iconColor: "text-[#22C55E]"
      };
    }
    if (status === "negative") {
      return {
        border: "border-l-[#EF4444]",
        bg: theme === "dark" ? "bg-[#EF4444]/5" : "bg-[#EF4444]/5",
        iconBg: "bg-[#EF4444]/10",
        iconColor: "text-[#EF4444]"
      };
    }
    return {
      border: "border-l-[#FACC15]",
      bg: theme === "dark" ? "bg-[#FACC15]/5" : "bg-[#FACC15]/5",
      iconBg: "bg-[#FACC15]/10",
      iconColor: "text-[#FACC15]"
    };
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#06B6D4] via-[#3ABEF9] to-[#6366F1] shadow-2xl shadow-cyan-500/30 flex items-center justify-center hover:shadow-cyan-500/40 transition-all duration-300 group"
      >
        <div className="relative">
          <Sparkles className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-12" />
          <motion.div 
            className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </div>
      </motion.button>

      {/* Side Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed right-0 top-0 h-full w-[420px] ${
                theme === "dark" ? "bg-[#0F172A]" : "bg-white"
              } shadow-2xl z-50 overflow-y-auto border-l ${
                theme === "dark" ? "border-[#334155]" : "border-[#E5E7EB]"
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#06B6D4] via-[#3ABEF9] to-[#6366F1] flex items-center justify-center shadow-lg shadow-cyan-500/30">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`font-bold text-lg tracking-tight ${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>
                        IA Insights
                      </h2>
                      <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Análises em tempo real
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className={`rounded-xl h-9 w-9 ${
                      theme === "dark" ? "hover:bg-[#334155]" : "hover:bg-[#F9FAFB]"
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Insights List */}
                <div className="space-y-3">
                  {insights.map((insight, index) => {
                    const config = getStatusConfig(insight.status);
                    const InsightIcon = insight.icon;
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`${
                            theme === "dark" ? "bg-[#334155]/30 border-[#334155]" : "bg-[#F9FAFB]"
                          } border-l-4 ${config.border} hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden group`}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-xl ${config.iconBg}`}>
                                <InsightIcon className={`w-4 h-4 ${config.iconColor}`} />
                              </div>
                              <div className="flex-1">
                                <CardTitle className={`text-sm font-semibold tracking-tight ${
                                  theme === "dark" ? "text-white" : "text-[#0F172A]"
                                }`}>
                                  {insight.title}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className={`text-sm leading-relaxed mb-3 ${
                              theme === "dark" ? "text-gray-300" : "text-gray-600"
                            }`}>
                              {insight.description}
                            </p>
                            <div className={`text-xs font-medium px-3 py-2 rounded-lg ${config.bg} ${
                              theme === "dark" ? "text-gray-300" : "text-gray-700"
                            }`}>
                              {insight.impact}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`mt-3 w-full justify-between h-8 rounded-lg ${
                                theme === "dark" 
                                  ? "text-[#06B6D4] hover:bg-[#06B6D4]/10" 
                                  : "text-[#06B6D4] hover:bg-[#06B6D4]/5"
                              } group-hover:translate-x-1 transition-transform duration-200`}
                            >
                              Ver detalhes
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Stats Summary */}
                <div className={`mt-6 p-4 rounded-2xl ${
                  theme === "dark" ? "bg-gradient-to-br from-[#334155]/50 to-[#334155]/30" : "bg-gradient-to-br from-[#F9FAFB] to-white"
                } border ${theme === "dark" ? "border-[#334155]" : "border-[#E5E7EB]"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                    <span className={`text-xs font-semibold ${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>
                      Análise Completa
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Oportunidades
                      </p>
                      <p className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>
                        3
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        Potencial
                      </p>
                      <p className="text-lg font-bold text-[#22C55E]">
                        R$ 20.9k
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
