
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { useAppContext } from '@/components/context/AppContext';
import { ChipGroup, ChipButton } from '@/components/dashboard/Chip';
import MetricRow from '@/components/relatorios/MetricRow';
import { pctDelta } from '@/components/metrics-delta';
import {
    Flame, Lightbulb, Rocket, BarChart, Users, CalendarCheck, Target, TrendingUp, AlertTriangle,
    CheckCircle, XCircle, CircleDollarSign, UserCheck, CalendarClock, Percent, MousePointerClick,
    Eye, UserPlus, DatabaseZap, ChevronLeft, ChevronRight, Brain, Video, MessageSquare, Fish,
    PlaySquare, DollarSign, FileCheck2, Share2, BookOpen, Phone, Building, HelpCircle, Calendar,
    Settings2, RotateCcw, Trash2, Layers, Gauge, Repeat, Hand, ShoppingCart, PlayCircle, Wallet, Info,
    MessageCircleMore, Share, BarChart2, RadioTower, Link, Users2, Activity, VideoIcon
} from 'lucide-react';
import FunnelSelect from '@/components/dashboard/filters/FunnelSelect';
import { motion, AnimatePresence } from 'framer-motion';
import CompactDateRangePicker from '@/components/dashboard/filters/CompactDateRangePicker';
import { subDays, startOfToday, format } from 'date-fns';
import GerenciarMetricasDialog from '@/components/relatorios/GerenciarMetricasDialog';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import AnaliseMetas from '@/components/relatorios/AnaliseMetas';
import MedusaIA from '@/components/relatorios/MedusaIA';
import AcoesRapidas from '@/components/relatorios/AcoesRapidas';
import AdanIA from '@/components/relatorios/AdanIA';

const funnelIcons = {
  "Sessão Estratégica": <Brain className="w-6 h-6 text-sky-500" />,
  "Turbinados": <Rocket className="w-6 h-6 text-violet-500" />,
  "Webinar": <Video className="w-6 h-6 text-red-500" />,
  "Social Selling": <MessageSquare className="w-6 h-6 text-yellow-500" />,
  "Isca de Baleia": <Fish className="w-6 h-6 text-pink-500" />,
  "Youtube": <PlaySquare className="w-6 h-6 text-red-600" />,
  "Saque Dinheiro": <DollarSign className="w-6 h-6 text-green-500" />,
  "Aplicação": <FileCheck2 className="w-6 h-6 text-indigo-500" />,
  "Indicação": <Share2 className="w-6 h-6 text-teal-500" />,
  "Infoproduto": <BookOpen className="w-6 h-6 text-orange-500" />,
  "Prospeção Ativa": <Phone className="w-6 h-6 text-blue-500" />,
  "Evento Presencial": <Building className="w-6 h-6 text-gray-500" />,
  "Desconhecido": <HelpCircle className="w-6 h-6 text-slate-400" />,
  "Funil Geral": <BarChart className="w-6 h-6 text-slate-500" />,
};

const masterMetricList = [
    { label: "Alcance", icon: <Gauge className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Impressões", icon: <Layers className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Frequência", icon: <Repeat className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'number' },
    { label: "Cliques (todos)", icon: <Hand className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Cliques no link", icon: <Link className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "CTR (todos)", icon: <MousePointerClick className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "CPC (todos)", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Resultados", icon: <CheckCircle className="w-4 h-4 text-green-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Valor Investido", icon: <Wallet className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Veiculação", icon: <RadioTower className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "CPM (custo por 1.000 impressões)", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Custo por resultado", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Comentários no post", icon: <MessageCircleMore className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Compartilhamentos do post", icon: <Share className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Engajamentos com o post", icon: <Activity className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Engajamento com a Página", icon: <BarChart2 className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Conversas por mensagem iniciadas", icon: <MessageSquare className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por conversa por mensagem iniciada", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Custo por ThruPlay", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "ThruPlays", icon: <PlayCircle className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Cliques no link únicos", icon: <Link className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Cliques únicos (todos)", icon: <Hand className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "CTR (taxa de cliques no link)", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "CPC (custo por clique no link)", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "CTR único (taxa de cliques no link)", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "CTR único (todos)", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Visitas ao Perfil", icon: <UserCheck className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por Visita", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Adição ao Carrinho", icon: <ShoppingCart className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Finalizações de compras iniciadas", icon: <Wallet className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Compras", icon: <CircleDollarSign className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Leads", icon: <Users className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por Lead", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "MQLs", icon: <UserCheck className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por MQL", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Proporção de MQLs", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Registros concluídos", icon: <FileCheck2 className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "ROAS", icon: <TrendingUp className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'number' },
    { label: "Visualizações da página de Destino", icon: <Eye className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Reproduções de 25% do vídeo", icon: <VideoIcon className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Reproduções de 50% do vídeo", icon: <VideoIcon className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Reproduções de 75% do vídeo", icon: <VideoIcon className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Reproduções de 95% do vídeo", icon: <VideoIcon className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por Reproduções de 25% do vídeo", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Custo por Reproduções de 50% do vídeo", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Custo por Reproduções de 75% do vídeo", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Custo por Reproduções de 95% do vídeo", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Taxa de reproduções do vídeo por no mínimo 3 segundos por impressões", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Seguidores", icon: <UserPlus className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Taxa de seguidores", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Custo por seguidor", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
    { label: "Tax. Conversão LP", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Hook Rate (view 3s/impressões)", icon: <PlayCircle className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Evento: Typeform submit", icon: <Info className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Conect Rate", icon: <Phone className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'percent' },
    { label: "Agendamentos", icon: <CalendarCheck className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0 },
    { label: "Custo por Agendamento", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0, previousValue: 0, format: 'currency', invert: true },
];

const allData = {
  "Sessão Estratégica": {
    funnelIcon: funnelIcons["Sessão Estratégica"],
    funnels: [
      {
        name: "Sessão Estratégica",
        metrics: [
          { label: "Valor Investido", icon: <Wallet className="w-4 h-4 text-slate-500"/>, currentValue: 847.36, previousValue: 830.50, format: 'currency', invert: true },
          { label: "Leads", icon: <Users className="w-4 h-4 text-slate-500"/>, currentValue: 41, previousValue: 38 },
          { label: "Custo por Lead", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 20.67, previousValue: 21.85, format: 'currency', invert: true },
          { label: "MQLs", icon: <UserCheck className="w-4 h-4 text-slate-500"/>, currentValue: 6, previousValue: 9 },
          { label: "Custo por MQL", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 141.23, previousValue: 92.27, format: 'currency', invert: true },
          { label: "Agendamentos", icon: <CalendarCheck className="w-4 h-4 text-slate-500"/>, currentValue: 11, previousValue: 9 },
          { label: "Custo por Agendamento", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 77.03, previousValue: 92.27, format: 'currency', invert: true },
          { label: "Proporção de MQLs", icon: <Percent className="w-4 h-4 text-slate-500"/>, currentValue: 14.6, previousValue: 23.7, format: 'percent' },
          { label: "CTR (todos)", icon: <MousePointerClick className="w-4 h-4 text-slate-500"/>, currentValue: 0.8, previousValue: 0.85, format: 'percent' },
        ],
      },
    ],
    metas: [
      { label: "Meta de 12 MQLs", actual: 6, goal: 12, unit: 'MQLs' },
      { label: "Meta de 30% proporção de MQLs", actual: 14.6, goal: 30, unit: '%' },
      { label: "Meta de 9 agendamentos", actual: 11, goal: 9, unit: 'agendamentos' },
      { label: "Meta de custo R$82 por agendamento", actual: 77.03, goal: 82, unit: 'R$/agendamento' },
    ],
    insights: [
      { type: 'critical', text: "A proporção de MQLs (14.6%) e o número total de MQLs (6) caíram drasticamente. Revisar a qualidade dos leads e o alinhamento dos criativos é urgente." },
      { type: 'positive', text: "Excelente Custo por Agendamento (R$ 77,03), superando a meta de R$ 82. O funil está eficiente na etapa final." },
      { type: 'warning', text: "O CTR (0.8%) teve uma leve caída. Monitore os criativos com menor performance para possível pausa." },
      { type: 'suggestion', text: "Considere testar novos criativos com foco em MQLs para reverter a queda."}
    ]
  },
  "Turbinados": {
    funnelIcon: funnelIcons["Turbinados"],
    funnels: [
       {
        name: "Turbinados",
        metrics: [
          { label: "Valor Investido", icon: <Wallet className="w-4 h-4 text-slate-500"/>, currentValue: 49.49, previousValue: 55.20, format: 'currency', invert: true },
          { label: "Visitas ao Perfil", icon: <UserCheck className="w-4 h-4 text-slate-500"/>, currentValue: 94, previousValue: 85 },
          { label: "Custo por Visita", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 0.53, previousValue: 0.65, format: 'currency', invert: true },
          { label: "Seguidores", icon: <UserPlus className="w-4 h-4 text-slate-500"/>, currentValue: 31, previousValue: 25 },
          { label: "Custo por Seguidor", icon: <Target className="w-4 h-4 text-slate-500"/>, currentValue: 1.60, previousValue: 2.20, format: 'currency', invert: true },
        ],
      },
    ],
    metas: [
       { label: "Meta de 100 visitas ao perfil", actual: 94, goal: 100, unit: 'visitas' },
       { label: "Meta de 40 seguidores", actual: 31, goal: 40, unit: 'seguidores' },
    ],
    insights: [
       { type: 'positive', text: "O Custo por Visita (R$ 0.53) está muito eficiente e abaixo da média histórica." },
       { type: 'suggestion', text: "A campanha de turbinados está gerando seguidores a um custo baixo. Considere aumentar o investimento para acelerar o crescimento." },
    ]
  }
};

const funnelOptionsForReport = [
  "Sessão Estratégica",
  "Turbinados",
  "Social Selling",
  "Isca de Baleia",
  "Webinar",
  "Saque Dinheiro",
  "Aplicação",
  "Indicação",
  "Infoproduto",
  "Prospeção Ativa",
  "Evento Presencial",
  "Desconhecido",
];


const multiplyData = (data, factor) => ({
  ...data,
  funnels: data.funnels.map(f => ({
    ...f,
    metrics: f.metrics.map(m => ({
      ...m,
      currentValue: m.label.includes('Custo') || m.label.includes('Proporção') || m.label.includes('CTR') || m.label.includes('Taxa') || m.label.includes('Frequência') || m.label.includes('ROAS') ? m.currentValue : m.currentValue * factor,
      previousValue: m.label.includes('Custo') || m.label.includes('Proporção') || m.label.includes('CTR') || m.label.includes('Taxa') || m.label.includes('Frequência') || m.label.includes('ROAS') ? m.previousValue : m.previousValue * factor,
    }))
  })),
  metas: data.metas.map(meta => {
    // Determine if the metric is a rate/percentage/cost and should not be multiplied
    const isRateOrCost = meta.label.toLowerCase().includes('%') ||
                         meta.label.toLowerCase().includes('custo') ||
                         meta.label.toLowerCase().includes('proporção') ||
                         (meta.unit && (meta.unit.toLowerCase().includes('%') || meta.unit.toLowerCase().includes('r$/')));

    if (isRateOrCost) {
      return meta; // Return the original meta for rates and costs
    }

    const newGoal = meta.goal * factor;
    const newActual = meta.actual * factor;
    
    // Dynamically update the label by replacing the number in it
    // The regex /\d+(\.\d+)?/g matches integers and floating-point numbers.
    // The replacement uses toLocaleString('pt-BR') for correct decimal/thousand separators.
    const newLabel = meta.label.replace(/\d+(\.\d+)?/g, newGoal.toLocaleString('pt-BR'));

    return {
      ...meta,
      actual: newActual,
      goal: newGoal,
      label: newLabel,
    };
  }),
});


const formatValue = (value, format) => {
  if (format === 'currency') {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  if (format === 'percent') {
    return `${value.toFixed(2)}%`;
  }
  if (format === 'number') {
    return value.toLocaleString('pt-BR');
  }
  return value.toLocaleString('pt-BR');
};


export default function RelatoriosDaily() {
  const [period, setPeriod] = useState('daily');
  const [currentPage, setCurrentPage] = useState(0);
  const { theme, funnel, setFunnel } = useAppContext();
  const [isInsightHovered, setIsInsightHovered] = useState(false);
  const insightTimerRef = useRef(null);
  const [displayedMetrics, setDisplayedMetrics] = useState([]);
  const [isManageMetricsOpen, setIsManageMetrics] = useState(false);
  const { toast } = useToast();

  const [dateRange, setDateRange] = useState(() => {
    const yesterday = subDays(startOfToday(), 1);
    return { start: yesterday, end: yesterday, preset: 'Ontem' };
  });

  // Atualiza o dateRange quando o período (Daily, Weekly, Month) é alterado
  useEffect(() => {
    const today = startOfToday();
    const yesterday = subDays(today, 1);
    let newRange;

    if (period === 'daily') {
      newRange = { start: yesterday, end: yesterday, preset: 'Ontem' };
    } else if (period === 'weekly') {
      newRange = { start: subDays(today, 7), end: today, preset: 'Últimos 7 dias' };
    } else if (period === 'monthly') {
      newRange = { start: subDays(today, 30), end: today, preset: 'Últimos 30 dias' };
    }
    setDateRange(newRange);
  }, [period]);

  const funnelOptionsWithData = Object.keys(allData);
  const hasDataForSelectedFunnel = funnelOptionsWithData.includes(funnel);

  const reportTitle = useMemo(() => {
    const titles = {
      daily: "Relatório Diário",
      weekly: "Relatório Semanal",
      monthly: "Relatório Mensal",
    };
    return titles[period];
  }, [period]);

  const data = useMemo(() => {
    if (!hasDataForSelectedFunnel) {
      // Return a default structure that indicates no data for the *selected* funnel
      // This ensures other components (insights, metas) don't try to access undefined properties.
      return {
        funnelIcon: funnelIcons[funnel] || funnelIcons["Desconhecido"],
        funnels: [{ name: funnel, metrics: [] }], // Empty metrics to trigger the "no data" message inside the CardContent
        metas: [], // Empty metas
        insights: [{ type: 'suggestion', text: `Não há insights ou metas para o funil "${funnel}", pois ele não possui investimento em anúncios.` }], // Default insight
      };
    }

    const baseData = allData[funnel];

    if (period === 'weekly') return multiplyData(baseData, 7);
    if (period === 'monthly') return multiplyData(baseData, 30);
    return baseData;
  }, [period, funnel, hasDataForSelectedFunnel]);

  // Effect to reset displayed metrics when the core data changes
  useEffect(() => {
    if (data?.funnels?.[0]?.metrics) {
      setDisplayedMetrics(data.funnels[0].metrics);
    } else {
      setDisplayedMetrics([]);
    }
  }, [data]);


  useEffect(() => {
    const startTimer = () => {
      if (insightTimerRef.current) clearInterval(insightTimerRef.current);
      insightTimerRef.current = setInterval(() => {
        setCurrentPage(prev => (prev + 1) % (data.insights?.length || 1));
      }, 7000);
    };

    if (data.insights && data.insights.length > 1 && !isInsightHovered) {
      startTimer();
    } else {
      if (insightTimerRef.current) clearInterval(insightTimerRef.current);
    }
    
    return () => {
      if (insightTimerRef.current) clearInterval(insightTimerRef.current);
    };
  }, [data.insights, isInsightHovered]);

  // Reset page and timer when data changes
  useEffect(() => {
      setCurrentPage(0);
  }, [period, funnel]);

  const handleResetMetrics = () => {
    if (data?.funnels?.[0]?.metrics) {
      setDisplayedMetrics(data.funnels[0].metrics);
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Relatório Restaurado!</span>
          </div>
        ),
        description: 'As métricas foram restauradas para o padrão.',
        duration: 3000,
      });
    }
  };

  const handleSaveMetrics = (newMetrics) => {
    setDisplayedMetrics(newMetrics);
    toast({
        title: (
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Relatório Atualizado!</span>
            </div>
        ),
        description: 'As métricas do relatório foram salvas com sucesso.',
        duration: 3000,
    });
  };

  const nextInsight = () => {
    if (data.insights && data.insights.length > 1) {
      setCurrentPage(prev => (prev + 1) % data.insights.length);
    }
  };
  const prevInsight = () => {
    if (data.insights && data.insights.length > 1) {
      setCurrentPage(prev => (prev - 1 + data.insights.length) % data.insights.length);
    }
  };

  const GoalStatusIcon = ({ isMet }) => isMet
      ? <CheckCircle className="w-5 h-5 text-green-500" />
      : <XCircle className="w-5 h-5 text-red-500" />;

  const InsightIcon = ({type}) => {
      if(type === 'critical') return <AlertTriangle className="w-5 h-5 text-red-500" />;
      if(type === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      if(type === 'positive') return <TrendingUp className="w-5 h-5 text-green-500" />;
      return <Lightbulb className="w-5 h-5 text-blue-500" />;
  }

  const insightColors = {
      critical: 'border-red-500',
      warning: 'border-amber-500',
      positive: 'border-green-500',
      suggestion: 'border-blue-500',
  }

  const allPossibleMetrics = useMemo(() => {
    const defaultMetricsForFunnel = data?.funnels?.[0]?.metrics || [];
    const defaultMetricLabels = new Set(defaultMetricsForFunnel.map(m => m.label));

    // Filter master list to exclude metrics that are already in the default set for the funnel
    const additionalMetrics = masterMetricList.filter(
      masterMetric => !defaultMetricLabels.has(masterMetric.label)
    );

    // Combine the data-rich default metrics with the placeholder additional metrics
    // This ensures specific metrics for the funnel appear first and with their correct data
    return [...defaultMetricsForFunnel, ...additionalMetrics];
  }, [funnel, data]);


  return (
    <>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="text-[22px] font-semibold text-slate-900 dark:text-slate-50">Relatórios</h2>
          <div className="flex items-center gap-2 flex-wrap justify-end">
              <CompactDateRangePicker
                  dateRange={dateRange}
                  setDateRange={setDateRange}
                  align="end"
              />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] gap-6">
          {/* Main Report Card (Left Column) */}
          <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md p-2 flex flex-col`}>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  {funnelIcons[funnel] || <BarChart className="w-6 h-6 text-slate-500" />}
                </div>
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>{reportTitle}</CardTitle>
              </div>
              <div className="flex items-center gap-4 flex-wrap justify-start md:justify-end w-full md:w-auto">
                 <FunnelSelect
                    value={funnel}
                    onChange={setFunnel}
                    options={funnelOptionsForReport}
                 />
                <ChipGroup>
                  <ChipButton isActive={period === 'daily'} onClick={() => setPeriod('daily')}>Daily</ChipButton>
                  <ChipButton isActive={period === 'weekly'} onClick={() => setPeriod('weekly')}>Weekly</ChipButton>
                  <ChipButton isActive={period === 'monthly'} onClick={() => setPeriod('monthly')}>Month</ChipButton>
                </ChipGroup>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
             {hasDataForSelectedFunnel ? (
                <>
                  {/* Period Info */}
                  <div className="flex justify-end gap-4 px-4 py-3 border-b border-dashed dark:border-slate-800">
                    <div className="text-right shrink-0">
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">Data do período</p>
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className={`font-semibold text-left ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                                {dateRange.start.getTime() === dateRange.end.getTime() 
                                 ? format(dateRange.start, 'dd/MM/yy')
                                 : `${format(dateRange.start, 'dd/MM/yy')} - ${format(dateRange.end, 'dd/MM/yy')}`}
                            </span>
                        </div>
                    </div>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto scrollbar-slim">
                    <div className="space-y-1 py-1.5 px-5">
                      {displayedMetrics.map(metric => {
                        const delta = pctDelta(metric.currentValue, metric.previousValue);
                        return (
                          <MetricRow
                            key={metric.label}
                            theme={theme}
                            icon={metric.icon}
                            label={metric.label}
                            value={formatValue(metric.currentValue, metric.format)}
                            delta={delta}
                            invertGood={metric.invert}
                          />
                        );
                      })}
                    </div>
                  </div>
                </>
             ) : (
                <div className="text-center py-12 px-6 border-t border-dashed dark:border-slate-800 m-4 rounded-lg bg-slate-50/50 dark:bg-slate-800/20">
                    <DatabaseZap className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Sem dados para este funil</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Não há relatórios de performance para "{funnel}", pois ele não possui investimento em anúncios.
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                        Selecione um funil com anúncios ativos, como "Sessão Estratégica" ou "Turbinados".
                    </p>
                </div>
             )}
            </CardContent>
            {hasDataForSelectedFunnel && (
              <CardFooter className="p-4 border-t border-dashed dark:border-slate-800 mt-auto">
                <div className="flex items-center justify-end w-full gap-2">
                   <Button variant="outline" size="sm" onClick={handleResetMetrics}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resetar
                  </Button>
                  <Button size="sm" onClick={() => setIsManageMetrics(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Settings2 className="w-4 h-4 mr-2" />
                    Gerenciar Métricas
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* AI Insights Carousel */}
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md overflow-hidden flex flex-col p-2 min-h-[12.5rem]`}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-500" />
                    <CardTitle className={`text-base font-semibold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Insights de IA</CardTitle>
                </div>
              </CardHeader>
              <CardContent
                className="relative min-h-[8rem] flex-grow"
                onMouseEnter={() => setIsInsightHovered(true)}
                onMouseLeave={() => setIsInsightHovered(false)}
              >
                <AnimatePresence mode="popLayout">
                  {data.insights && data.insights.length > 0 && data.insights[currentPage] && (
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 grid grid-cols-1 gap-4 px-4 items-center"
                    >
                      <div 
                        className={`
                          p-4 rounded-xl shadow-sm border-l-4 flex items-center gap-4 
                          ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/70'}
                          ${insightColors[data.insights[currentPage].type] || 'border-slate-500'}
                        `}
                      >
                         <InsightIcon type={data.insights[currentPage].type} />
                         <p className={`text-sm flex-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                           {data.insights[currentPage].text}
                         </p>
                      </div>
                    </motion.div>
                  )}
                  {(!data.insights || data.insights.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center text-center px-6"
                    >
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                        <Lightbulb className="w-8 h-8 text-blue-500 mx-auto" />
                        <p className={`text-sm mt-2 font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                          Nenhum insight disponível para este funil e período.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
              <div className="flex items-center justify-between p-3 border-t dark:border-slate-800 mt-auto">
                <div className="flex gap-1.5">
                  {data.insights && data.insights.length > 1 && data.insights.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentPage ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-600'
                      }`}
                      aria-label={`Go to insight ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={prevInsight}
                    className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    aria-label="Previous insight"
                    disabled={!data.insights || data.insights.length <= 1}
                  >
                    <ChevronLeft className={`w-5 h-5 ${!data.insights || data.insights.length <= 1 ? 'text-gray-400' : (theme === 'dark' ? 'text-white' : 'text-gray-700')}`} />
                  </button>
                  <button
                    onClick={nextInsight}
                    className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                    aria-label="Next insight"
                    disabled={!data.insights || data.insights.length <= 1}
                  >
                    <ChevronRight className={`w-5 h-5 ${!data.insights || data.insights.length <= 1 ? 'text-gray-400' : (theme === 'dark' ? 'text-white' : 'text-gray-700')}`} />
                  </button>
                </div>
              </div>
            </Card>
            
            <Card className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'} shadow-md flex-1 flex flex-col`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-500"/>
                  <CardTitle className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>Metas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  {data.metas && data.metas.length > 0 ? (
                    data.metas.map(meta => {
                      const isMet = meta.label.includes('custo') ? meta.actual <= meta.goal : meta.actual >= meta.goal;
                      const value = meta.label.includes('%') ? `${meta.actual.toFixed(1)}%` : formatValue(meta.actual, meta.label.includes('custo') ? 'currency' : undefined);
                      return (
                        <div key={meta.label} className={`p-3 rounded-lg flex items-center justify-between text-sm ${theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                          <div className="flex items-center gap-2">
                              <GoalStatusIcon isMet={isMet} />
                              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                                {meta.label}
                              </span>
                          </div>
                          <span className={`font-bold ${isMet ? 'text-green-500' : 'text-red-500'}`}>
                            {value}
                            <span className={`text-xs ml-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>/ {meta.goal}</span>
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className={`h-full flex items-center justify-center p-3 rounded-lg text-center text-sm ${theme === 'dark' ? 'bg-slate-800/70' : 'bg-slate-50'}`}>
                      <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>Nenhuma meta definida para este funil.</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {data.metas && data.metas.length > 0 && (
                <AnaliseMetas metas={data.metas} theme={theme} />
              )}
            </Card>
          </div>
        </div>
        
        {/* --- Ações Rápidas & IAs --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1.5fr)] gap-6 items-start">
          {/* Coluna Esquerda: Adan & Medusa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
             <AdanIA 
                funnelData={{...data, funnels: [{ name: funnel, metrics: displayedMetrics }] }}
                period={period}
              />
              <MedusaIA period={period} />
          </div>

          {/* Coluna Direita: Ações Rápidas / Envio de Relatórios */}
          <div>
            <AcoesRapidas 
              period={period} 
              setPeriod={setPeriod}
              funnelData={data}
              funnelOptions={funnelOptionsWithData}
            />
          </div>
        </div>

        <div className="pb-6" />
      </div>
      <GerenciarMetricasDialog
          isOpen={isManageMetricsOpen}
          onOpenChange={setIsManageMetrics}
          allMetrics={allPossibleMetrics}
          displayedMetrics={displayedMetrics}
          onSave={handleSaveMetrics}
      />
    </>
  );
}
