import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AtenaHeader({ onConsultarAtenaClick, children }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Painel Comercial
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Desempenho da equipe de vendas e pré-vendas com a curadoria da Atena IA.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/50 transition-all duration-300"
          onClick={onConsultarAtenaClick}
        >
          <BrainCircuit className="w-5 h-5 mr-2" />
          Consultar Atena
        </Button>
        {children}
      </div>
    </div>
  );
}