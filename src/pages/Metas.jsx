
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Goal, Wand2, ListChecks, Lightbulb, LayoutGrid } from 'lucide-react';
import ProjetadoRealizado from '@/components/metas/ProjetadoRealizado';
import SimuladorMetas from '@/components/metas/SimuladorMetas';
import AcompanhamentoSemanal from '@/components/metas/AcompanhamentoSemanal';
import ProjecaoMetas from '@/components/metas/ProjecaoMetas';
import PerformanceDiaria from '@/components/metas/PerformanceDiaria';

export default function Metas() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('diaria');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('diaria'); // Default tab
    }
  }, [location.search]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Planejamento de Metas
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
            Defina, acompanhe e simule seus objetivos estratégicos.
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 sm:w-[1200px] h-12 p-1">
           <TabsTrigger value="diaria" className="h-full text-sm">
            <LayoutGrid className="w-5 h-5 mr-2" />
            Performance Diária
          </TabsTrigger>
          <TabsTrigger value="semanal" className="h-full text-sm">
            <ListChecks className="w-5 h-5 mr-2" />
            Performance Semanal
          </TabsTrigger>
          <TabsTrigger value="projetado" className="h-full text-sm">
            <Goal className="w-5 h-5 mr-2" />
            Projetado vs. Realizado
          </TabsTrigger>
          <TabsTrigger value="simulador" className="h-full text-sm">
            <Wand2 className="w-5 h-5 mr-2" />
            Simulador de Metas
          </TabsTrigger>
          <TabsTrigger value="projecao" className="h-full text-sm">
            <Lightbulb className="w-5 h-5 mr-2" />
            Projeção Linear
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diaria" className="mt-6">
            <PerformanceDiaria />
        </TabsContent>

        <TabsContent value="semanal" className="mt-6">
            <AcompanhamentoSemanal />
        </TabsContent>

        <TabsContent value="projetado" className="mt-6">
          <ProjetadoRealizado />
        </TabsContent>

        <TabsContent value="simulador" className="mt-6">
          <SimuladorMetas />
        </TabsContent>
        
        <TabsContent value="projecao" className="mt-6">
            <ProjecaoMetas />
        </TabsContent>
      </Tabs>
    </div>
  );
}
