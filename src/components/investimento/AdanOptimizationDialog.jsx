import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Loader2, TrendingUp, TrendingDown, Minus, Pencil, Check } from 'lucide-react';
import { DeltaBadge } from '@/components/metrics-delta';

const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const mockCampaigns = [
    { id: 'c1', name: 'Campanha de Vendas - Q4', budget: 1100, roas: 5.2 },
    { id: 'c2', name: 'Remarketing - Novos Leads', budget: 650, roas: 4.1 },
    { id: 'c3', name: 'Topo de Funil - Institucional', budget: 400, roas: 2.5 },
];

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-16 h-16 rounded-full grid place-items-center bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30 animate-pulse">
            <Sparkles className="w-8 h-8" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium">Adan está calculando a otimização...</p>
    </div>
);

export default function AdanOptimizationDialog({ open, onOpenChange, onConfirm, data }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [campaigns, setCampaigns] = useState([]);

    const newDailyBudget = useMemo(() => {
        if (!data || data.diasRestantes <= 0) return 0;
        return data.orcamentoRestante / data.diasRestantes;
    }, [data]);

    useEffect(() => {
        if (open) {
            setIsLoading(true);
            setIsEditing(false);
            
            // Simula a IA "pensando" e distribuindo o orçamento
            const timer = setTimeout(() => {
                const totalRoas = mockCampaigns.reduce((sum, c) => sum + c.roas, 0);
                
                const optimized = mockCampaigns.map(c => {
                    const weight = c.roas / totalRoas;
                    const newBudget = newDailyBudget * weight;
                    return { ...c, newBudget };
                });

                setCampaigns(optimized);
                setIsLoading(false);
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [open, newDailyBudget]);

    const handleBudgetChange = (id, value) => {
        const newValue = parseFloat(value) || 0;
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, newBudget: newValue } : c));
    };
    
    const totalNewBudget = useMemo(() => campaigns.reduce((sum, c) => sum + c.newBudget, 0), [campaigns]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle>Otimização de Orçamento por Adan IA</DialogTitle>
                            <DialogDescription>
                                Com base no saldo de {formatCurrency(data?.orcamentoRestante || 0)}, a IA sugere a seguinte redistribuição diária.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {isLoading ? <LoadingState /> : (
                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campanha/Conjunto</TableHead>
                                    <TableHead className="text-right">Orçamento Atual</TableHead>
                                    <TableHead className="text-right">Novo Orçamento (sugerido)</TableHead>
                                    <TableHead className="text-center">Ajuste</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(c.budget)}</TableCell>
                                        <TableCell className="text-right">
                                            {isEditing ? (
                                                <Input 
                                                    type="number" 
                                                    value={c.newBudget.toFixed(0)} 
                                                    onChange={(e) => handleBudgetChange(c.id, e.target.value)}
                                                    className="w-28 ml-auto text-right h-8"
                                                />
                                            ) : formatCurrency(c.newBudget)}
                                        </TableCell>
                                        <TableCell className="flex justify-center">
                                            <DeltaBadge delta={((c.newBudget - c.budget) / c.budget) * 100} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <TableRow className="bg-slate-50 dark:bg-slate-800/50 font-bold">
                            <TableCell>Total Diário</TableCell>
                            <TableCell className="text-right">{formatCurrency(mockCampaigns.reduce((s, c) => s + c.budget, 0))}</TableCell>
                            <TableCell className={`text-right ${totalNewBudget.toFixed(2) !== newDailyBudget.toFixed(2) && isEditing ? 'text-red-500' : ''}`}>
                                {formatCurrency(totalNewBudget)}
                            </TableCell>
                            <TableCell className="text-center">-</TableCell>
                        </TableRow>
                    </div>
                )}
                
                <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? <Check className="w-4 h-4 mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
                        {isEditing ? 'Salvar Edição' : 'Editar'}
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white"
                      onClick={() => onConfirm(campaigns)}
                      disabled={isLoading}
                    >
                        Confirmar e Aplicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}