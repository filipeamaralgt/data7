
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Star, LayoutGrid, Users, Palette, Search, TrendingUp, DollarSign, Edit, BookText, Copy } from 'lucide-react';
import { Publico } from '@/entities/Publico';
import { Criativo } from '@/entities/Criativo';
import { Estrategia } from '@/entities/Estrategia';
import { EstrategiaOca } from '@/entities/EstrategiaOca';
import { Nomenclatura } from '@/entities/Nomenclatura';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { base44 } from "@/api/base44Client";

const NamingConventionHelper = ({ onCopy }) => {
    const [templates, setTemplates] = useState([]);
    const { toast } = useToast();

    useEffect(() => {
        const fetchTemplates = async () => {
            const data = await Nomenclatura.filter({ tipo: 'Campanha' });
            setTemplates(data);
        };
        fetchTemplates();
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Estrutura copiada!" });
        onCopy();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <BookText className="w-4 h-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="space-y-4">
                    <p className="font-semibold text-sm">Nomenclaturas de Campanha</p>
                    {templates.length > 0 ? templates.map(t => (
                        <div key={t.id} className="text-xs">
                            <div className="flex justify-between items-center">
                                <p className="font-medium">{t.nome}</p>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(t.estrutura)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </div>
                            <p className="font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 p-1 rounded mt-1 break-all">{t.estrutura}</p>
                        </div>
                    )) : <p className="text-sm text-slate-500">Nenhuma nomenclatura cadastrada.</p>}
                </div>
            </PopoverContent>
        </Popover>
    );
};


export default function CampaignWizard({ open, setOpen, refreshCampaigns, campaignToEdit }) {
  const [step, setStep] = useState(0); // Renamed activeStep to step
  const [audiences, setAudiences] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [creativeSearchTerm, setCreativeSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added isLoading state
  
  const getInitialCampaignData = () => ({
    nome: '',
    plataforma: 'Meta',
    objetivo: 'Vendas',
    orcamento_diario: 50,
    publico_ids: [],
    criativo_ids: [],
    estrategia_id: '',
    status: 'Rascunho',
    status_publicacao: 'pendente',
    mensagem_erro: '',
    pagina_url: '', // Added pagina_url
  });

  const [formData, setFormData] = useState(getInitialCampaignData()); // Renamed campaignData to formData
  const { toast } = useToast();

  useEffect(() => {
    if(open) {
      // Reset or populate data when wizard opens
      if (campaignToEdit) {
        setFormData({ // Changed setCampaignData to setFormData
            ...getInitialCampaignData(), // Start with defaults to ensure all fields are present
            ...campaignToEdit
        });
      } else {
        setFormData(getInitialCampaignData()); // Changed setCampaignData to setFormData
      }
      setStep(0); // Renamed setActiveStep to setStep
      setCreativeSearchTerm(''); // Reset search term
      setIsLoading(false); // Reset loading state

      const fetchData = async () => {
        const rawAudiences = await Publico.list();
        
        // Simular performance e recomendação
        const audiencesWithPerformance = rawAudiences.map(audience => {
            // Mock performance score - in a real scenario, this would come from analytics data
            let score = 0;
            if (audience.nome.includes('Vendas')) score += 50;
            if (audience.nome.includes('Lookalike')) score += 30;
            if (audience.nome.includes('Remarketing')) score += 40;
            if (audience.nome.includes('Interesses')) score += 10;
            if (audience.plataforma === 'Meta') score += 5;
            
            let reason = 'Bom histórico de engajamento.';
            if (score > 45) reason = 'Melhor performance em vendas diretas.';
            if (score > 35 && score <= 45) reason = 'Alto potencial de conversão em público aquecido.';
            
            return { ...audience, performanceScore: score, recommendationReason: reason };
        });

        // Sort by performance
        const sortedAudiences = audiencesWithPerformance.sort((a, b) => b.performanceScore - a.performanceScore);

        // Add recommendation flag to top 2
        const recommendedAudiences = sortedAudiences.map((audience, index) => ({
            ...audience,
            isRecommended: index < 2,
        }));

        setAudiences(recommendedAudiences);
        
        const rawCreatives = await Criativo.list();
        const creativesWithPerformance = rawCreatives.map(c => {
          const roas = parseFloat(((Math.random() * 5) + 1.5).toFixed(2));
          const cpa = parseFloat(((Math.random() * 45) + 10).toFixed(2));
          const score = roas - (cpa / 20); // Simple mock score

          let performanceTier = 'Atenção';
          let performanceColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
          if (score > 3.5) {
            performanceTier = 'Excelente';
            performanceColor = 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
          } else if (score > 2.5) {
            performanceTier = 'Bom';
            performanceColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
          }
          
          return { ...c, roas, cpa, score, performanceTier, performanceColor };
        });

        const sortedCreatives = creativesWithPerformance.sort((a, b) => b.score - a.score);
        setCreatives(sortedCreatives);

        // Fetch both custom and OCA strategies
        const [customStrategies, ocaStrategies] = await Promise.all([
          Estrategia.list(),
          EstrategiaOca.list()
        ]);
        
        // Unify strategies
        const getTipoFromEstrutura = (estrutura) => {
            const lowerEstrutura = estrutura.toLowerCase();
            if (lowerEstrutura.includes('teste de criativos')) return 'Teste de Criativos';
            if (lowerEstrutura.includes('teste de públicos')) return 'Teste de Públicos';
            if (lowerEstrutura.includes('escala cbo')) return 'Escala CBO';
            if (lowerEstrutura.includes('escala dco')) return 'Escala DCO';
            if (lowerEstrutura.includes('cpa fixo')) return 'CPA Fixo';
            return 'Outro';
        }

        const unifiedStrategies = [
          ...customStrategies.map(s => ({
            id: s.id,
            nome: s.nome,
            tipo: s.tipo,
            status: s.status,
            source: 'custom'
          })),
          ...ocaStrategies.map(s => ({
            id: s.id,
            nome: s.estrutura, // Use estrutura as name for OCA strategies
            tipo: getTipoFromEstrutura(s.estrutura),
            status: 'Validada', // OCA strategies are considered validated
            source: 'oca'
          }))
        ];
        
        setStrategies(unifiedStrategies);
      };
      fetchData();
    }
  }, [open, campaignToEdit]); // Added campaignToEdit to dependency array

  const handleNext = () => setStep((prev) => prev + 1); // Changed setActiveStep to setStep
  const handleBack = () => setStep((prev) => prev - 1); // Changed setActiveStep to setStep

  const handleSave = async () => { // Renamed handleFinish to handleSave
    setIsLoading(true);
    try {
        if (campaignToEdit) {
            // When editing, we update the existing campaign
            await base44.entities.Campanha.update(campaignToEdit.id, formData); // Used base44 and formData
            toast({
                title: "Campanha Atualizada!",
                description: `A campanha "${formData.nome}" foi atualizada.`, // Used formData
            });
        } else {
            // When creating, we create a new campaign with 'Rascunho' status
            await base44.entities.Campanha.create({ ...formData, status: 'Rascunho' }); // Used base44 and formData
            toast({
                title: "Rascunho Salvo!",
                description: `A campanha "${formData.nome}" foi salva como rascunho.`, // Used formData
            });
        }
    } catch(e) {
        console.error("Failed to save campaign", e);
        toast({ title: "Erro Inesperado", description: "Ocorreu um erro ao salvar a campanha.", variant: "destructive" });
    } finally {
        setIsLoading(false);
        setOpen(false); // This will trigger the reset in parent component
        refreshCampaigns();
    }
  };

  const filteredCreatives = useMemo(() => {
    return creatives.filter(c => 
      c.nome.toLowerCase().includes(creativeSearchTerm.toLowerCase())
    );
  }, [creatives, creativeSearchTerm]);

  const handleSelectAllCreatives = (checked) => {
    const filteredIds = new Set(filteredCreatives.map(c => c.id));
    if (checked) {
      setFormData(prev => ({ // Changed setCampaignData to setFormData
        ...prev,
        criativo_ids: [...new Set([...prev.criativo_ids, ...Array.from(filteredIds)])]
      }));
    } else {
      setFormData(prev => ({ // Changed setCampaignData to setFormData
        ...prev,
        criativo_ids: prev.criativo_ids.filter(id => !filteredIds.has(id))
      }));
    }
  };

  const areAllFilteredCreativesSelected = useMemo(() => {
    if (filteredCreatives.length === 0) return false;
    const filteredIdsSet = new Set(filteredCreatives.map(c => c.id));
    return Array.from(filteredIdsSet).every(id => formData.criativo_ids.includes(id)); // Used formData
  }, [filteredCreatives, formData.criativo_ids]); // Used formData

  // Find selected strategy and derive its multi_publico capability
  const selectedStrategy = useMemo(() => {
    const strategy = strategies.find(s => s.id === formData.estrategia_id); // Used formData
    if (!strategy) return null;
    let multi_publico_capable = false;
    // Assume strategies like 'Teste de Públicos' and 'Escala CBO' can handle multiple publics.
    // 'Teste de Criativos' generally implies one audience being tested against different creatives.
    if (strategy.tipo === 'Teste de Públicos' || strategy.tipo === 'Escala CBO' || strategy.tipo === 'Escala DCO' || strategy.tipo === 'CPA Fixo') {
        multi_publico_capable = true;
    }
    return { ...strategy, multi_publico_capable };
  }, [strategies, formData.estrategia_id]); // Used formData

    const CampaignStructurePreview = ({ formData, strategies, publicos, criativos }) => { // Changed campaignData to formData
        const selectedStrategy = strategies.find(s => s.id === formData.estrategia_id); // Used formData
        const selectedAudiences = publicos.filter(p => formData.publico_ids.includes(p.id)); // Used formData
        const selectedCreatives = criativos.filter(c => formData.criativo_ids.includes(c.id)); // Used formData

        if (!selectedStrategy || selectedAudiences.length === 0 || selectedCreatives.length === 0) {
            return <p className="text-center text-sm text-slate-500 mt-4">Selecione uma estratégia, público(s) e criativos para ver a estrutura.</p>;
        }

        const renderAdSets = () => {
            const hasMultipleAudiencesForAdSets = selectedStrategy.tipo === 'Teste de Públicos' || (selectedStrategy.tipo === 'Escala CBO' && selectedAudiences.length > 1);
            const hasMultipleCreativesForAdSets = selectedStrategy.tipo === 'Teste de Criativos' || selectedStrategy.tipo === 'Escala DCO' || selectedStrategy.tipo === 'CPA Fixo';

            // Teste de Públicos, Escala CBO (multi-audience): 1 conjunto por público, cada um com todos os criativos
            if (hasMultipleAudiencesForAdSets && !hasMultipleCreativesForAdSets) {
                return selectedAudiences.map((audience, audIndex) => (
                     <div key={audience.id} className="ml-6 mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Users className="w-4 h-4 text-slate-500" />
                            <span>Conjunto {audIndex + 1}: {audience.nome}</span>
                        </div>
                         <div className="space-y-1 mt-2">
                            {selectedCreatives.map(creative => (
                               <div key={creative.id} className="ml-6 p-2 rounded-lg bg-white dark:bg-slate-700">
                                     <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <Palette className="w-3 h-3" />
                                        <span>Criativo: {creative.nome}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ));
            }
            
            // Teste de Criativos, Escala DCO, CPA Fixo (multi-creative, single audience or per adset audience): 1 conjunto por criativo (usando o primeiro público selecionado)
            if (hasMultipleCreativesForAdSets) {
                 return selectedCreatives.map((creative, creIndex) => (
                    <div key={creative.id} className="ml-6 mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Users className="w-4 h-4 text-slate-500" />
                            {/* For these strategies, we assume one adset per creative or one adset with a specific audience */}
                            <span>Conjunto {creIndex + 1}: {selectedAudiences[0]?.nome || 'N/A'}</span>
                        </div>
                        <div className="ml-6 mt-2 p-2 rounded-lg bg-white dark:bg-slate-700">
                             <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                <Palette className="w-3 h-3" />
                                <span>Criativo: {creative.nome}</span>
                            </div>
                        </div>
                    </div>
                ));
            } 
            
            // Default/Fallback: 1 conjunto com o primeiro público e múltiplos criativos
            return (
                <div className="ml-6 mt-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span>Conjunto: {selectedAudiences[0]?.nome || 'N/A'}</span>
                    </div>
                     <div className="space-y-1 mt-2">
                        {selectedCreatives.map(creative => (
                           <div key={creative.id} className="ml-6 p-2 rounded-lg bg-white dark:bg-slate-700">
                                 <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                    <Palette className="w-3 h-3" />
                                    <span>Criativo: {creative.nome}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        return (
            <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700 max-h-60 overflow-y-auto">
                {/* Campaign Level */}
                <div className="flex items-center gap-3">
                    <LayoutGrid className="w-5 h-5 text-blue-500" />
                    <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{formData.nome}</p> {/* Used formData */}
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {selectedStrategy.tipo} • {formData.objetivo} {/* Used formData */}
                        </p>
                    </div>
                </div>
                {/* AdSet and Ad Level */}
                {renderAdSets()}
            </div>
        );
    };

  const steps = [
    {
      label: 'Configurações Básicas',
      content: (
        <div className="space-y-4">
            <div className="flex items-start gap-2">
                <div className="flex-grow">
                    <Label htmlFor="campaign-name">Nome da Campanha</Label>
                    <Input id="campaign-name" placeholder="Nome da Campanha" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} autoComplete="off" /> {/* Used formData */}
                </div>
                <div className="pt-[25px]">
                    <NamingConventionHelper onCopy={() => {}} />
                </div>
            </div>
          <Select value={formData.plataforma} onValueChange={plataforma => setFormData({...formData, plataforma})}> {/* Used formData */}
            <SelectTrigger><SelectValue placeholder="Plataforma" /></SelectTrigger>
            <SelectContent><SelectItem value="Meta">Meta</SelectItem><SelectItem value="Google">Google</SelectItem></SelectContent>
          </Select>
           <Select value={formData.objetivo} onValueChange={objetivo => setFormData({...formData, objetivo})}> {/* Used formData */}
            <SelectTrigger><SelectValue placeholder="Objetivo" /></SelectTrigger>
            <SelectContent>
                <SelectItem value="Vendas">Vendas</SelectItem>
                <SelectItem value="Leads">Leads</SelectItem>
                <SelectItem value="Tráfego">Tráfego</SelectItem>
                <SelectItem value="Reconhecimento">Reconhecimento</SelectItem>
            </SelectContent>
          </Select>
           <div>
            <Label htmlFor="orcamento_diario">Orçamento Diário (R$)</Label>
            <Input id="orcamento_diario" type="number" value={formData.orcamento_diario} onChange={e => setFormData({...formData, orcamento_diario: parseFloat(e.target.value)})} /> {/* Used formData */}
           </div>
           {/* Added pagina_url input */}
           <div>
            <Label htmlFor="pagina_url">URL da Página de Destino (Opcional)</Label>
            <Input id="pagina_url" type="url" placeholder="https://seudominio.com/pagina" value={formData.pagina_url} onChange={(e) => setFormData(s => ({ ...s, pagina_url: e.target.value }))} />
           </div>
        </div>
      ),
    },
    {
      label: 'Seleção de Estratégia',
      content: (
          <Select value={formData.estrategia_id} onValueChange={estrategia_id => setFormData({...formData, estrategia_id})}> {/* Used formData */}
              <SelectTrigger><SelectValue placeholder="Selecione uma estratégia da sua biblioteca" /></SelectTrigger>
              <SelectContent 
                position="popper" 
                side="bottom" 
                sideOffset={5} 
                className="w-[--radix-select-trigger-width]"
                container={typeof document !== 'undefined' ? document.body : undefined}
              >
                  {strategies.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                          {s.nome} ({s.source === 'oca' ? 'Validada' : s.status})
                      </SelectItem>
                  ))}
              </SelectContent>
          </Select>
      ),
    },
    {
      label: 'Seleção de Público',
      content: (
        <TooltipProvider>
            {selectedStrategy?.multi_publico_capable ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {audiences.map(p => (
                         <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <input 
                                type="checkbox" 
                                id={`audience-${p.id}`} 
                                checked={formData.publico_ids.includes(p.id)} // Used formData
                                onChange={e => {
                                    const newSelection = e.target.checked 
                                        ? [...formData.publico_ids, p.id] // Used formData
                                        : formData.publico_ids.filter(id => id !== p.id); // Used formData
                                    setFormData({...formData, publico_ids: newSelection}); // Used setFormData
                                }} 
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                             <Label htmlFor={`audience-${p.id}`} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between w-full">
                                    <span>{p.nome} ({p.plataforma})</span>
                                    {/* Moved Tooltip around Badge for multi_publico_capable path */}
                                    {p.isRecommended && (
                                        <Tooltip delayDuration={100}>
                                            <TooltipTrigger>
                                                <Badge className="ml-auto bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Recomendado
                                                </Badge>
                                            </TooltipTrigger>
                                            <TooltipContent side="right">
                                                <p>{p.recommendationReason}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </Label>
                        </div>
                    ))}
                </div>
            ) : (
                <Select value={formData.publico_ids[0] || ''} onValueChange={publico_id => setFormData({...formData, publico_ids: [publico_id]})}> {/* Used formData and setFormData */}
                    <SelectTrigger><SelectValue placeholder="Selecione um público da sua biblioteca" /></SelectTrigger>
                    <SelectContent>
                        {audiences.map(p => (
                            <Tooltip key={p.id} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <SelectItem value={p.id}> 
                                        <div className="flex items-center justify-between w-full">
                                            <span>{p.nome} ({p.plataforma})</span>
                                            {p.isRecommended && (
                                                <Badge className="ml-4 bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300">
                                                    <Star className="w-3 h-3 mr-1" />
                                                    Recomendado
                                                </Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                </TooltipTrigger>
                                {p.isRecommended && (
                                    <TooltipContent side="right">
                                        <p>{p.recommendationReason}</p>
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </SelectContent>
                </Select>
            )}
        </TooltipProvider>
      ),
    },
    {
      label: 'Seleção de Criativos',
      content: (
        <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Buscar criativo por nome..."
                value={creativeSearchTerm}
                onChange={e => setCreativeSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center px-1">
              <input 
                type="checkbox" 
                id="select-all-creatives"
                checked={areAllFilteredCreativesSelected}
                onChange={e => handleSelectAllCreatives(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="select-all-creatives" className="text-sm font-medium ml-2 cursor-pointer">
                Selecionar todos ({filteredCreatives.length})
              </Label>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 p-1 -m-1">
                {filteredCreatives.map(c => (
                    <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <input 
                            type="checkbox" 
                            id={`creative-${c.id}`} 
                            checked={formData.criativo_ids.includes(c.id)} // Used formData
                            onChange={e => {
                                const newSelection = e.target.checked 
                                    ? [...formData.criativo_ids, c.id] // Used formData
                                    : formData.criativo_ids.filter(id => id !== c.id); // Used formData
                                setFormData({...formData, criativo_ids: newSelection}); // Used setFormData
                            }} 
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor={`creative-${c.id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">{c.nome}</span>
                            <Badge className={c.performanceColor}>{c.performanceTier}</Badge>
                          </div>
                          <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500"/> ROAS: {c.roas.toFixed(2)}x</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-red-500"/> CPA: R$ {c.cpa.toFixed(2)}</span>
                          </div>
                        </Label>
                    </div>
                ))}
                {filteredCreatives.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-4">Nenhum criativo encontrado.</p>
                )}
            </div>
        </div>
      ),
    },
     {
      label: 'Revisão e Lançamento',
      content: (
        <div className="text-sm space-y-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <p><strong>Campanha:</strong> {formData.nome}</p> {/* Used formData */}
              <p><strong>Públicos:</strong> {formData.publico_ids.length} selecionados</p> {/* Used formData */}
              <p><strong>Estratégia:</strong> {strategies.find(s => s.id === formData.estrategia_id)?.nome || 'N/A'}</p> {/* Used formData */}
              <p><strong>Criativos:</strong> {formData.criativo_ids.length} selecionados</p> {/* Used formData */}
              <p><strong>Plataforma:</strong> {formData.plataforma}</p> {/* Used formData */}
              <p><strong>Orçamento:</strong> R$ {formData.orcamento_diario}/dia</p> {/* Used formData */}
              <p><strong>Objetivo:</strong> {formData.objetivo}</p> {/* Used formData */}
              <p><strong>URL Página:</strong> {formData.pagina_url || 'N/A'}</p> {/* Display pagina_url */}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h3 className="font-semibold mb-2">Estrutura da Campanha:</h3>
                <CampaignStructurePreview 
                    formData={formData} // Changed campaignData to formData
                    strategies={strategies}
                    publicos={audiences}
                    criativos={creatives}
                />
            </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaignToEdit ? <><Edit className="w-5 h-5" /> Editar Campanha</> : <><Bot /> Criador de Campanhas - Adan IA</>}
          </DialogTitle>
          <DialogDescription>
            {campaignToEdit ? "Ajuste os detalhes da sua campanha existente." : "Siga os passos para criar sua nova campanha."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[75vh] overflow-y-auto pr-2">
            {steps.map((stepItem, index) => ( // Changed 'step' to 'stepItem' to avoid conflict with state variable 'step'
              <div key={stepItem.label} className={step === index ? 'block' : 'hidden'}> {/* Used state 'step' here */}
                <h3 className="text-lg font-semibold mb-4">{stepItem.label}</h3>
                {stepItem.content}
              </div>
            ))}
        </div>
        <div className="mt-2 flex gap-2 justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
            {step > 0 && <Button variant="outline" onClick={handleBack} disabled={isLoading}>Voltar</Button>} {/* Used state 'step' here, added disabled */}
            {step < steps.length - 1 
                ? <Button onClick={handleNext} disabled={isLoading}>Próximo</Button> // Added disabled
                : <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave} disabled={isLoading}> {/* Changed handleFinish to handleSave, added disabled */}
                    {isLoading ? "Salvando..." : (campaignToEdit ? "Atualizar Campanha" : "Salvar Rascunho")}
                  </Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
