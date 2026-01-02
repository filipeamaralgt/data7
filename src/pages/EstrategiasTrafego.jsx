import React, { useState, useEffect, useMemo } from 'react';
import { Estrategia } from '@/entities/Estrategia';
import { EstrategiaOca } from '@/entities/EstrategiaOca';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import EstrategiaForm from '@/components/estrategias/EstrategiaForm';
import EstrategiaCard from '@/components/estrategias/EstrategiaCard';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const EstrategiaOcaCard = ({ estrategia }) => (
    <Card className="flex flex-col dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 h-full">
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-base">{estrategia.estrutura}</CardTitle>
                <Badge>{estrategia.tag}</Badge>
            </div>
            <CardDescription>{estrategia.tipo_de_campanha}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <div>
                <p className="font-semibold text-xs text-slate-500 dark:text-slate-300">Públicos:</p>
                <p>{estrategia.especificacoes_publicos}</p>
            </div>
            <div>
                <p className="font-semibold text-xs text-slate-500 dark:text-slate-300">Criativos:</p>
                <p>{estrategia.especificacoes_criativos}</p>
            </div>
             {estrategia.especificacoes_gerais && (
                 <div>
                    <p className="font-semibold text-xs text-slate-500 dark:text-slate-300">Geral:</p>
                    <p>{estrategia.especificacoes_gerais}</p>
                </div>
             )}
        </CardContent>
        {estrategia.observacoes && (
            <CardFooter>
                 <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/50 p-2 rounded-md w-full"><strong>Obs:</strong> {estrategia.observacoes}</p>
            </CardFooter>
        )}
    </Card>
);

export default function EstrategiasTrafego() {
  const [estrategias, setEstrategias] = useState([]);
  const [estrategiasOca, setEstrategiasOca] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEstrategia, setEditingEstrategia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [data, dataOca] = await Promise.all([
          Estrategia.list(),
          EstrategiaOca.list()
      ]);
      setEstrategias(data);
      setEstrategiasOca(dataOca);
    } catch (error) {
      toast({ title: "Erro ao buscar estratégias", variant: "destructive" });
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

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta estratégia?")) {
      try {
        await Estrategia.delete(id);
        toast({ title: "Estratégia excluída" });
        fetchData();
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };

  const filteredItems = useMemo(() => {
    const allItems = [
      ...estrategias.map(e => ({ ...e, source: 'custom' })),
      ...estrategiasOca.map(e => ({ ...e, source: 'oca' }))
    ];
    
    if (!searchTerm) return allItems;

    return allItems.filter(item => {
      if (item.source === 'custom') {
        return item.nome.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return item.estrutura.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [estrategias, estrategiasOca, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Biblioteca de Estratégias</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Consulte estratégias validadas e gerencie as suas.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
            <Input 
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-64"
            />
            <Button onClick={() => { setEditingEstrategia(null); setIsFormOpen(true); }} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" /> Nova
            </Button>
        </div>
      </div>

       {isLoading ? <p>Carregando...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map(item => (
                item.source === 'custom' ? (
                  <EstrategiaCard 
                      key={item.id} 
                      estrategia={item}
                      onEdit={() => handleEdit(item)}
                      onDelete={() => handleDelete(item.id)}
                  />
                ) : (
                  <EstrategiaOcaCard key={item.id} estrategia={item} />
                )
              ))}
          </div>
       )}
       { !isLoading && filteredItems.length === 0 && (
         <div className="text-center py-16">
            <p className="text-slate-500">Nenhuma estratégia encontrada com o termo "{searchTerm}".</p>
         </div>
       )}

      <EstrategiaForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        estrategia={editingEstrategia}
        onSave={() => {
          setIsFormOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}