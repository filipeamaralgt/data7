import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Nomenclatura } from '@/entities/Nomenclatura';
import { useToast } from '@/components/ui/use-toast';

export default function NomenclaturaForm({ isOpen, setIsOpen, nomenclatura, onSave }) {
  const [formData, setFormData] = useState({
    tipo: 'Campanha',
    nome: '',
    estrutura: '',
    descricao: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (nomenclatura) {
      setFormData(nomenclatura);
    } else {
      setFormData({ tipo: 'Campanha', nome: '', estrutura: '', descricao: '' });
    }
  }, [nomenclatura, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (nomenclatura) {
        await Nomenclatura.update(nomenclatura.id, formData);
        toast({ title: 'Nomenclatura atualizada!' });
      } else {
        await Nomenclatura.create(formData);
        toast({ title: 'Nomenclatura criada com sucesso!' });
      }
      onSave();
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{nomenclatura ? 'Editar' : 'Criar'} Nomenclatura</DialogTitle>
          <DialogDescription>Defina uma regra de nomenclatura para padronizar suas campanhas, públicos e criativos.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
              <SelectTrigger id="tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Campanha">Campanha</SelectItem>
                <SelectItem value="Público">Público</SelectItem>
                <SelectItem value="Criativo">Criativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="nome">Nome da Regra</Label>
            <Input id="nome" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} placeholder="Ex: Padrão de Data"/>
          </div>
          <div>
            <Label htmlFor="estrutura">Estrutura</Label>
            <Input id="estrutura" value={formData.estrutura} onChange={(e) => setFormData(prev => ({ ...prev, estrutura: e.target.value }))} placeholder="Ex: {YYYYMMDD}_{TIPO}" />
          </div>
          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={formData.descricao} onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))} placeholder="Explique os placeholders. Ex: {YYYYMMDD} = AnoMêsDia" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}