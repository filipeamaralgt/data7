
import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import OverviewChart from '@/components/dashboard/OverviewChart';
import PostPerformanceTable from '@/components/seguidores/PostPerformanceTable';
import { Users, UserPlus, DollarSign, BarChart } from 'lucide-react';
import { useLocalPeriod } from "@/components/dashboard/filters/IndependentPeriod";
import CompactDateRangePicker from "@/components/dashboard/filters/CompactDateRangePicker";
import { subDays } from "date-fns";
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';

const MetricCard = ({ icon, title, value, description }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
};

export default function Seguidores() {
    const initialDate = useMemo(() => ({
        start: subDays(new Date(), 29),
        end: new Date(),
        preset: "Últimos 30 dias",
    }), []);

    const [dateRange, setDateRange] = useLocalPeriod("period:seguidores-main", initialDate);
    const [followerMetric, setFollowerMetric] = useState('geral');

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Crescimento de Seguidores</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Total de Seguidores" 
                    value="125.430" 
                    description="+2.100 no último mês"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard 
                    title="Novos Seguidores (Período)" 
                    value="1.876" 
                    description="Média de 62/dia"
                    icon={<UserPlus className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard 
                    title="Custo por Seguidor (Médio)" 
                    value="R$ 2,15" 
                    description="-5% vs período anterior"
                    icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard 
                    title="Investimento Total (Período)" 
                    value="R$ 4.033" 
                    description="Foco em campanhas de perfil"
                    icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
                />
            </div>
            
            <OverviewChart
                chartType="seguidores"
                externalRange={dateRange}
                metricFilter={followerMetric}
                datePickerComponent={
                    <div className="flex items-center gap-4">
                        <ChipGroup>
                            <ChipButton isActive={followerMetric === 'geral'} onClick={() => setFollowerMetric('geral')}>Geral</ChipButton>
                            <ChipButton isActive={followerMetric === 'novos_seguidores'} onClick={() => setFollowerMetric('novos_seguidores')}>Seguidores</ChipButton>
                            <ChipButton isActive={followerMetric === 'custo_seguidor'} onClick={() => setFollowerMetric('custo_seguidor')}>Custo</ChipButton>
                            <ChipButton isActive={followerMetric === 'investimento_perfil'} onClick={() => setFollowerMetric('investimento_perfil')}>Investimento</ChipButton>
                             <ChipButton isActive={followerMetric === 'conversao_perfil'} onClick={() => setFollowerMetric('conversao_perfil')}>Conversão</ChipButton>
                        </ChipGroup>
                        <CompactDateRangePicker 
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </div>
                }
            />

            <PostPerformanceTable />
        </div>
    );
}
