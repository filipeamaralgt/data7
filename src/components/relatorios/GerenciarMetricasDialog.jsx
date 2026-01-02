
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function GerenciarMetricasDialog({ isOpen, onOpenChange, allMetrics, displayedMetrics, onSave }) {
    const [selectedMetrics, setSelectedMetrics] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Initialize the selection based on currently displayed metrics
        setSelectedMetrics(displayedMetrics.map(m => m.label));
        setSearchTerm(''); // Reset search on open
    }, [displayedMetrics, isOpen]); // Rerun when dialog opens

    const handleCheckboxChange = (metricLabel, checked) => {
        setSelectedMetrics(prev => 
            checked ? [...prev, metricLabel] : prev.filter(label => label !== metricLabel)
        );
    };

    const handleSave = () => {
        // Filter the original `allMetrics` array to maintain order and full data
        const newDisplayedMetrics = allMetrics.filter(m => selectedMetrics.includes(m.label));
        onSave(newDisplayedMetrics);
        onOpenChange(false);
    };
    
    const filteredMetrics = allMetrics.filter(metric =>
        metric.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Gerenciar Métricas do Relatório</DialogTitle>
                </DialogHeader>
                <div className="p-4 border-b border-t dark:border-slate-800">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar métrica..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <ScrollArea className="max-h-72">
                    <div className="space-y-4 p-4">
                        {filteredMetrics.length > 0 ? (
                            filteredMetrics.map(metric => (
                                <div key={metric.label} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`metric-${metric.label}`}
                                        checked={selectedMetrics.includes(metric.label)}
                                        onCheckedChange={(checked) => handleCheckboxChange(metric.label, checked)}
                                        className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                    />
                                    <label
                                        htmlFor={`metric-${metric.label}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {metric.label}
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-muted-foreground p-4">Nenhuma métrica encontrada.</p>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
