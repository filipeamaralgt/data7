import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricCard({ title, value, change, status, icon: Icon, theme }) {
  const getStatusColors = () => {
    if (status === "positive") {
      return {
        gradient: "from-[#22C55E]/10 to-[#10B981]/5",
        iconBg: "bg-[#22C55E]/10",
        iconColor: "text-[#22C55E]",
        badgeGradient: "from-[#22C55E] to-[#10B981]",
        shadow: "shadow-green-500/20"
      };
    }
    if (status === "negative") {
      return {
        gradient: "from-[#EF4444]/10 to-[#F87171]/5",
        iconBg: "bg-[#EF4444]/10",
        iconColor: "text-[#EF4444]",
        badgeGradient: "from-[#EF4444] to-[#F87171]",
        shadow: "shadow-red-500/20"
      };
    }
    return {
      gradient: "from-[#FACC15]/10 to-[#FDE047]/5",
      iconBg: "bg-[#FACC15]/10",
      iconColor: "text-[#FACC15]",
      badgeGradient: "from-[#FACC15] to-[#FDE047]",
      shadow: "shadow-yellow-500/20"
    };
  };

  const getTrendIcon = () => {
    if (status === "positive") return <TrendingUp className="w-3 h-3" />;
    if (status === "negative") return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const colors = getStatusColors();

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`group relative overflow-hidden border-none ${
        theme === "dark" 
          ? "bg-[#0F172A] ring-1 ring-[#334155] hover:ring-[#06B6D4]/50" 
          : "bg-white hover:shadow-xl"
      } transition-all duration-300`}>
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${colors.iconBg} backdrop-blur-sm transition-all duration-300 group-hover:scale-110`}>
              <Icon className={`w-5 h-5 ${colors.iconColor}`} />
            </div>
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r ${colors.badgeGradient} text-white text-xs font-semibold ${colors.shadow} shadow-lg`}>
              {getTrendIcon()}
              {change}
            </div>
          </div>
          
          <h3 className={`text-xs font-medium mb-2 uppercase tracking-wider ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}>
            {title}
          </h3>
          
          <p className={`text-3xl font-bold tracking-tight ${
            theme === "dark" ? "text-white" : "text-[#0F172A]"
          }`}>
            {value}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}