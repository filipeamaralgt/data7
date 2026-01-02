import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, ShieldCheck } from 'lucide-react';

export default function CadastrarResponsavelDialog({ open, onOpenChange, onSave }) {
    const [nome, setNome] = useState('');
    const [fone, setFone] = useState('');
    const [role, setRole] = useState('Estrategista');

    const handleSave = () => {
        if (nome && fone && role) {
            onSave({ nome, fone, role });
            // Reset fields
            setNome('');
            setFone('');
            setRole('Estrategista');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Responsável</DialogTitle>
                    <DialogDescription>
                        Preencha os dados do novo contato para receber notificações.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nome
                        </Label>
                        <Input id="name" value={nome} onChange={(e) => setNome(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Telefone
                        </Label>
                        <Input id="phone" placeholder="5511999998888" value={fone} onChange={(e) => setFone(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">
                            Cargo
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Estrategista">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-purple-500" />
                                        <span>Estrategista</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="Gestor">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                                        <span>Gestor</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Contato</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}