
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCw, Bot } from 'lucide-react';
import { Campanha } from '@/entities/Campanha';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignCard from '@/components/campanhas/CampaignCard';
import { useToast } from "@/components/ui/use-toast";
import CampaignWizard from '@/components/campanhas/CampaignWizard';


export default function Campanhas() {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [activeTab, setActiveTab] = useState('ativas');
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    try {
        const campaigns = await Campanha.list('-created_date');
        setAllCampaigns(campaigns);
    } catch (error) {
        toast({ title: "Erro ao buscar campanhas", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }
  
  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setIsWizardOpen(true);
  };

  const handleWizardClose = () => {
    setIsWizardOpen(false);
    setEditingCampaign(null);
  }

  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter(c => {
        const searchTermMatch = c.nome.toLowerCase().includes(searchTerm.toLowerCase());
        const statusFilterMatch = statusFilter === 'todos' || c.status_publicacao === statusFilter;
        return searchTermMatch && statusFilterMatch;
    });
  }, [allCampaigns, searchTerm, statusFilter]);

  const activeCampaigns = useMemo(() => filteredCampaigns.filter(c => c.status === 'Ativa'), [filteredCampaigns]);
  const draftCampaigns = useMemo(() => filteredCampaigns.filter(c => ['Rascunho', 'Publicando', 'Erro'].includes(c.status)), [filteredCampaigns]);
  const inactiveCampaigns = useMemo(() => filteredCampaigns.filter(c => ['Pausada', 'Concluída'].includes(c.status)), [filteredCampaigns]);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Gerenciador de Campanhas</h1>
      </div>
      
       <Card>
        <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4">
                 <Input
                    placeholder="Nome da campanha contém..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filtrar por status da publicação..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os Status</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="sucesso">Sucesso</SelectItem>
                        <SelectItem value="falha">Falha</SelectItem>
                    </SelectContent>
                </Select>
                 <Button variant="outline" onClick={fetchCampaigns} disabled={isLoading} className="w-full md:w-auto">
                    <RotateCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </div>
        </CardContent>
       </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="ativas">Campanhas Ativas ({activeCampaigns.length})</TabsTrigger>
                <TabsTrigger value="rascunhos">Rascunhos ({draftCampaigns.length})</TabsTrigger>
                <TabsTrigger value="inativas">Campanhas Inativas ({inactiveCampaigns.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="ativas" className="mt-4 space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Subir Novas Campanhas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => { setEditingCampaign(null); setIsWizardOpen(true); }}
                            className="bg-gradient-to-br from-[#06B6D4] via-[#3ABEF9] to-[#6366F1] text-white hover:opacity-90 transition-opacity"
                        >
                            <Bot className="mr-2 h-4 w-4" /> Criar com Adan IA
                        </Button>
                    </CardContent>
                 </Card>
                 {isLoading && <p>Carregando...</p>}
                 {!isLoading && activeCampaigns.length === 0 && <p className="text-center text-slate-500 py-8">Nenhuma campanha ativa encontrada.</p>}
                 {activeCampaigns.map(c => <CampaignCard key={c.id} campaign={c} refreshCampaigns={fetchCampaigns} onEdit={handleEdit} />)}
            </TabsContent>
            <TabsContent value="rascunhos" className="mt-4 space-y-4">
                 {isLoading && <p>Carregando...</p>}
                 {!isLoading && draftCampaigns.length === 0 && <p className="text-center text-slate-500 py-8">Nenhum rascunho encontrado.</p>}
                 {draftCampaigns.map(c => <CampaignCard key={c.id} campaign={c} refreshCampaigns={fetchCampaigns} onEdit={handleEdit} />)}
            </TabsContent>
            <TabsContent value="inativas" className="mt-4 space-y-4">
                {isLoading && <p>Carregando...</p>}
                {!isLoading && inactiveCampaigns.length === 0 && <p className="text-center text-slate-500 py-8">Nenhuma campanha inativa encontrada.</p>}
                {inactiveCampaigns.map(c => <CampaignCard key={c.id} campaign={c} refreshCampaigns={fetchCampaigns} onEdit={handleEdit} />)}
            </TabsContent>
        </Tabs>

      <CampaignWizard open={isWizardOpen} setOpen={handleWizardClose} refreshCampaigns={fetchCampaigns} campaignToEdit={editingCampaign} />
    </div>
  );
}
