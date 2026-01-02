
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const initialData = {
    nome: '',
    descricao: '',
    status: 'Em Teste',
    tipo: 'Outro',
    multi_publico: false,
};

export default function EstrategiaForm({ isOpen, setIsOpen, onSave, estrategia }) {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        if (estrategia) {
            setFormData({
                nome: estrategia.nome || '',
                descricao: estrategia.descricao || '',
                status: estrategia.status || 'Em Teste',
                tipo: estrategia.tipo || 'Outro',
                multi_publico: estrategia.multi_publico || false,
            });
        } else {
            setFormData(initialData);
        }
    }, [estrategia, isOpen]);

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{estrategia ? 'Editar Estratégia' : 'Criar Nova Estratégia'}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Input placeholder="Nome da Estratégia" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                    <Textarea placeholder="Descrição" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} />
                    <Select value={formData.status} onValueChange={status => setFormData({...formData, status})}>
                        <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Validada">Validada</SelectItem>
                            <SelectItem value="Em Teste">Em Teste</SelectItem>
                            <SelectItem value="Ruim">Ruim</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={formData.tipo} onValueChange={tipo => setFormData({...formData, tipo})}>
                        <SelectTrigger><SelectValue placeholder="Tipo de Estrutura" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Teste de Criativos">Teste de Criativos</SelectItem>
                            <SelectItem value="Teste de Públicos">Teste de Públicos</SelectItem>
                            <SelectItem value="Escala CBO">Escala CBO</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="multi-publico-switch"
                            checked={formData.multi_publico}
                            onCheckedChange={checked => setFormData({ ...formData, multi_publico: checked })}
                        />
                        <Label htmlFor="multi-publico-switch">Permitir múltiplos públicos</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
