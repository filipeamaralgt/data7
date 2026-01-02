import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';

const statusOptions = [ "Oportunidade", "Reunião Agendada", "Negociação", "Follow-up", "Contrato", "Cliente", "No-show na call", "No-show no Whatsapp", "Desistiu antes da reunião", "Desistiu depois da reunião", "Desqualificado" ];
const funilOptions = [ "Sessão Estratégica", "Turbinados", "Social Selling", "Isca de Baleia", "Webinar", "Saque Dinheiro", "Aplicação", "Youtube", "Indicação", "Infoproduto", "Prospeção Ativa", "Evento Presencial", "Desconhecido" ];

export default function LeadFilters({ onFilter, onClear }) {
    const [filters, setFilters] = useState({
        nome: '',
        status: '',
        funil: '',
        responsavel: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
        }, {});
        onFilter(activeFilters);
    };

    const handleClear = () => {
        setFilters({ nome: '', status: '', funil: '', responsavel: '' });
        onClear();
    };

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4">
            <h3 className="text-lg font-semibold mr-4">Filtros</h3>
            <Input
                name="nome"
                placeholder="Nome do Lead..."
                value={filters.nome}
                onChange={handleInputChange}
                className="max-w-xs"
            />
             <Select value={filters.status} onValueChange={(v) => handleSelectChange('status', v)}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={filters.funil} onValueChange={(v) => handleSelectChange('funil', v)}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Funil" />
                </SelectTrigger>
                <SelectContent>
                    {funilOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
            </Select>
            <Input
                name="responsavel"
                placeholder="Responsável..."
                value={filters.responsavel}
                onChange={handleInputChange}
                className="max-w-xs"
            />
            <Button onClick={handleApply}><Filter className="w-4 h-4 mr-2" />Aplicar</Button>
            <Button variant="ghost" onClick={handleClear}><X className="w-4 h-4 mr-2" />Limpar</Button>
        </div>
    )
}