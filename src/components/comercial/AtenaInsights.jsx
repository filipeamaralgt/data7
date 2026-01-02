import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Lightbulb, TrendingUp, AlertTriangle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const iconMap = {
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    Award,
};

export default function AtenaInsights({ insights }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear any existing intervals/timeouts to prevent race conditions
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (!isPaused) {
            // Set up the interval
            intervalRef.current = setInterval(() => {
                setActiveIndex((prevIndex) => (prevIndex + 1) % insights.length);
            }, 5000); // Change insight every 5 seconds
        }

        // Cleanup function to clear interval on component unmount or when dependencies change
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, insights.length]);

    const handleDotClick = (index) => {
        setActiveIndex(index);
        // When user clicks, pause for a bit to let them read, then resume
        setIsPaused(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsPaused(false), 7000); // Resume after 7s of inactivity
    };

    const activeInsight = insights[activeIndex];
    const Icon = iconMap[activeInsight.icon];

  return (
    <Card 
        className="dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800/40 overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
    >
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="w-11 h-11 rounded-lg grid place-items-center bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <CardTitle className="text-slate-900 dark:text-slate-50">Insights da Atena</CardTitle>
           <p className="text-sm text-slate-500 dark:text-slate-400">Análises e ações recomendadas.</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative h-28">
            <AnimatePresence initial={false}>
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, x: 50, position: 'absolute', width: '100%' }}
                    animate={{ opacity: 1, x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.2 } }}
                >
                    <div className="flex items-start gap-4 p-1">
                        <div className="w-8 h-8 mt-1 flex-shrink-0 rounded-full grid place-items-center bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                            {Icon && <Icon className="w-4 h-4" />}
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{activeInsight.title}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{activeInsight.description}</p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2.5">
            {insights.map((_, index) => (
                <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-2 rounded-full transition-all duration-300 ease-out ${
                        activeIndex === index ? 'w-5 bg-amber-500' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to insight ${index + 1}`}
                />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}