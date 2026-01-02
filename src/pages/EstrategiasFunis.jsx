
import React, { useState, useEffect, useMemo } from 'react';
import { EstrategiaFunil } from '@/entities/EstrategiaFunil';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import EstrategiaFunilCard from '@/components/estrategias/EstrategiaFunilCard';
import EstrategiaFunilForm from '@/components/estrategias/EstrategiaFunilForm';
import EstrategiaVisualizer from '@/components/estrategias/EstrategiaVisualizer';

const TABS = ["Todas", "Topo de Funil", "Meio de Funil", "Fundo de Funil", "Recuperação", "Conversão"];

export default function EstrategiasFunis() {
  const [estrategias, setEstrategias] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEstrategia, setEditingEstrategia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Todas');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingEstrategia, setViewingEstrategia] = useState(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await EstrategiaFunil.list();
      setEstrategias(data);
    } catch (error) {
      toast({ title: "Erro ao buscar estratégias de funil", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (estrategia) => {
    setEditingEstrategia(estrategia);
    setIsFormOpen(true);
  };
  
  const handleView = (estrategia) => {
    setViewingEstrategia(estrategia);
    setIsViewOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta estratégia?")) {
      try {
        await EstrategiaFunil.delete(id);
        toast({ title: "Estratégia excluída" });
        fetchData();
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };
  
  const handleSave = async () => {
      fetchData();
      setIsFormOpen(false);
      setEditingEstrategia(null);
  }

  const filteredItems = useMemo(() => {
    return estrategias.filter(item => {
      const tabMatch = activeTab === 'Todas' || item.etapa_funil === activeTab;
      const searchMatch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
      return tabMatch && searchMatch;
    });
  }, [estrategias, activeTab, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Estratégias de Funil</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
            Consulte, crie e gerencie as táticas de marketing para cada etapa do funil.
          </p>
        </div>
        <Button 
          onClick={() => { setEditingEstrategia(null); setIsFormOpen(true); }} 
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Nova Estratégia
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar estratégia pelo nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
            {TABS.map(tab => <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>)}
        </TabsList>

        {TABS.map(tab => (
            <TabsContent key={tab} value={tab} className="mt-6">
                 {isLoading ? (
                    <p>Carregando...</p>
                 ) : filteredItems.filter(item => activeTab === 'Todas' || item.etapa_funil === tab).length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>Nenhuma estratégia encontrada para esta visualização.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredItems.filter(item => activeTab === 'Todas' || item.etapa_funil === tab).map(estrategia => (
                           <EstrategiaFunilCard key={estrategia.id} estrategia={estrategia} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
                        ))}
                    </div>
                 )}
            </TabsContent>
        ))}
      </Tabs>

      {isFormOpen && (
        <EstrategiaFunilForm
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
          onSave={handleSave}
          estrategiaToEdit={editingEstrategia}
        />
      )}

      {isViewOpen && viewingEstrategia && (
        <EstrategiaVisualizer
            isOpen={isViewOpen}
            setIsOpen={setIsViewOpen}
            estrategia={viewingEstrategia}
        />
      )}
    </div>
  );
}
