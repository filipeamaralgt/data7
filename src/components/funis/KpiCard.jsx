import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function KpiCard({ icon: Icon, title, value, iconBgColor, theme }) {
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className={`overflow-hidden border-none shadow-lg ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-[#1E293B] to-[#0F172A]' 
          : 'bg-gradient-to-br from-white to-gray-50'
      } ring-1 ${theme === 'dark' ? 'ring-[#334155]' : 'ring-gray-200'}`}>
        <CardContent className="p-4 flex items-center gap-4">
          <div 
            className={`w-12 h-12 rounded-xl flex items-center justify-center`}
            style={{ backgroundColor: iconBgColor }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className={`text-xs font-medium uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {title}
            </p>
            <p className={`text-xl font-bold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-[#0F172A]'
            }`}>
              {value}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}