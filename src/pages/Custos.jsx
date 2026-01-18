import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import OverviewChart from '@/components/dashboard/OverviewChart';
import AdanIA from '@/components/relatorios/AdanIA';
import { DollarSign, MousePointerClick, Users } from 'lucide-react';
import { useLocalPeriod } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { startOfMonth, endOfMonth, subDays } from "date-fns";
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Custos() {
    const initialDate = useMemo(() => ({
        start: subDays(new Date(), 6), // Changed to set start date 6 days ago (for "last 7 days" including today)
        end: new Date(),               // Changed to set end date as today
        preset: "Últimos 7 dias",      // Changed preset label
    }), []);

    const [dateRange, setDateRange] = useLocalPeriod("period:custos-main", initialDate);
    const [costView, setCostView] = useState('geral');
    const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Análise de Custos</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPL (Custo por Lead)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 12,50</div>
            <p className="text-xs text-muted-foreground">-3.2% vs semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPC (Custo por Clique)</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1,80</div>
            <p className="text-xs text-muted-foreground">+1.5% vs semana passada</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPM (Custo por Mil Impressões)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 25,40</div>
            <p className="text-xs text-muted-foreground">-0.8% vs semana passada</p>
          </CardContent>
        </Card>
      </div>
      
      <OverviewChart 
        chartType="custos_funil" 
        externalRange={dateRange}
        metricFilter={costView}
        showDataLabels={showLabels}
        datePickerComponent={
          <div className="flex items-center gap-4">
            <ChipGroup>
                <ChipButton isActive={costView === 'geral'} onClick={() => setCostView('geral')}>Geral</ChipButton>
                <ChipButton isActive={costView === 'cpl'} onClick={() => setCostView('cpl')}>CPL</ChipButton>
                <ChipButton isActive={costView === 'cpmql'} onClick={() => setCostView('cpmql')}>MQL</ChipButton>
                <ChipButton isActive={costView === 'custo_agendamento'} onClick={() => setCostView('custo_agendamento')}>Agendamento</ChipButton>
            </ChipGroup>
             <div className="flex items-center space-x-2">
              <Switch id="show-labels-toggle" checked={showLabels} onCheckedChange={setShowLabels} />
              <Label htmlFor="show-labels-toggle" className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Valores
              </Label>
            </div>
            <CompactDateRangePicker 
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        }
      />
      
      <AdanIA 
        title="Otimização de Custos"
        description="Adan pode analisar as campanhas com CPL mais alto e sugerir pausas ou ajustes nos públicos e criativos para reduzir custos."
      />
    </div>
  );
}