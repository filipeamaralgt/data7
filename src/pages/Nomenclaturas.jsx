
import React, { useState, useEffect } from 'react';
import { Nomenclatura } from '@/entities/Nomenclatura';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, BookText, Copy, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NomenclaturaForm from '@/components/nomenclaturas/NomenclaturaForm';

export default function Nomenclaturas() {
  const [nomenclaturas, setNomenclaturas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNomenclatura, setEditingNomenclatura] = useState(null);
  const { toast } = useToast();

  const fetchNomenclaturas = async () => {
    setIsLoading(true);
    try {
      const data = await Nomenclatura.list();
      setNomenclaturas(data);
    } catch (error) {
      toast({ title: "Erro ao buscar nomenclaturas", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNomenclaturas();
  }, []);

  const handleEdit = (item) => {
    setEditingNomenclatura(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta nomenclatura?")) {
      try {
        await Nomenclatura.delete(id);
        toast({ title: "Nomenclatura excluída" });
        fetchNomenclaturas();
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Estrutura copiada!" });
  };

  const renderList = (tipo) => {
    const filtered = nomenclaturas.filter(n => n.tipo === tipo);
    if (isLoading) return <p>Carregando...</p>;
    if (filtered.length === 0) return <p className="text-center text-slate-500 py-8">Nenhuma nomenclatura cadastrada para "{tipo}".</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(item => (
          <Card key={item.id} className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {item.nome}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(item.estrutura)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                   <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 text-slate-500 hover:text-red-500" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{item.tipo}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded-md text-sm break-all">{item.estrutura}</p>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">{item.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Central de Nomenclaturas</h1>
        <Button onClick={() => { setEditingNomenclatura(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Nomenclatura
        </Button>
      </div>

      <Tabs defaultValue="Campanha">
        <TabsList>
          <TabsTrigger value="Campanha">Campanhas</TabsTrigger>
          <TabsTrigger value="Público">Públicos</TabsTrigger>
          <TabsTrigger value="Criativo">Criativos</TabsTrigger>
        </TabsList>
        <TabsContent value="Campanha" className="mt-4">
          {renderList('Campanha')}
        </TabsContent>
        <TabsContent value="Público" className="mt-4">
          {renderList('Público')}
        </TabsContent>
        <TabsContent value="Criativo" className="mt-4">
          {renderList('Criativo')}
        </TabsContent>
      </Tabs>
      
      <NomenclaturaForm 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        nomenclatura={editingNomenclatura}
        onSave={() => {
          setIsFormOpen(false);
          fetchNomenclaturas();
        }}
      />
    </div>
  );
}
