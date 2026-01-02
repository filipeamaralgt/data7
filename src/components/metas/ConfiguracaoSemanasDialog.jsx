import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ConfiguracaoSemanasDialog({ isOpen, onClose, config, onSave, month }) {
    const [draftConfig, setDraftConfig] = useState(config);

    const handleDateChange = (index, field, value) => {
        const newConfig = [...draftConfig];
        // Parse the input value as a date, keeping the timezone offset
        const date = new Date(value + 'T00:00:00');
        newConfig[index][field] = date;
        setDraftConfig(newConfig);
    };

    const addWeek = () => {
        const newWeekNum = draftConfig.length + 1;
        const lastWeek = draftConfig[draftConfig.length - 1];
        const startDate = lastWeek ? new Date(lastWeek.end.getTime() + 24 * 60 * 60 * 1000) : new Date();
        const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);

        setDraftConfig([
            ...draftConfig,
            { week: `Semana ${newWeekNum}`, start: startDate, end: endDate }
        ]);
    };

    const removeWeek = (index) => {
        const newConfig = draftConfig.filter((_, i) => i !== index)
            .map((week, idx) => ({ ...week, week: `Semana ${idx + 1}` }));
        setDraftConfig(newConfig);
    };

    const handleSave = () => {
        onSave(draftConfig);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg dark:bg-slate-900">
                <DialogHeader>
                    <DialogTitle>Configurar Semanas do Mês</DialogTitle>
                    <DialogDescription>
                        Ajuste os períodos de cada semana para o mês de <span className="font-semibold text-slate-800 dark:text-slate-200">{month}</span>.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {draftConfig.map((week, index) => (
                        <div key={index} className="flex items-end gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex-grow">
                                <Label className="font-semibold">{week.week}</Label>
                                <div className="flex gap-3 mt-1">
                                    <div>
                                        <Label htmlFor={`start-${index}`} className="text-xs">Início</Label>
                                        <Input
                                            id={`start-${index}`}
                                            type="date"
                                            value={format(week.start, 'yyyy-MM-dd')}
                                            onChange={(e) => handleDateChange(index, 'start', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor={`end-${index}`} className="text-xs">Fim</Label>
                                        <Input
                                            id={`end-${index}`}
                                            type="date"
                                            value={format(week.end, 'yyyy-MM-dd')}
                                            onChange={(e) => handleDateChange(index, 'end', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-rose-500 hover:text-rose-600" onClick={() => removeWeek(index)}>
                                <XCircle className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={addWeek}>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Adicionar Semana
                    </Button>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSave}>Salvar Configuração</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}