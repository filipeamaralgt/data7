
import React, { useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import get from 'lodash/get'; // Import lodash get

const formatCurrency = (value) => {
    if (typeof value !== 'number') return "-";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function LeadTableView({ leads, onEdit, onDelete, isLoading, columnConfig }) {
    
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
    const userMap = useMemo(() => users?.reduce((acc, user) => ({ ...acc, [user.id]: user.full_name }), {}), [users]);
    
    const visibleColumns = useMemo(() => 
        columnConfig.allColumns.filter(c => columnConfig.visibleColumns[c.id]),
        [columnConfig]
    );

     const getStatusColor = (status) => {
        switch (status) {
            case 'Cliente': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-700/60';
            case 'Contrato': return 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border border-sky-200 dark:border-sky-700/60';
            case 'Negociação': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-700/60';
            case 'Reunião Agendada': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/60';
            case 'Oportunidade': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border border-purple-200 dark:border-purple-700/60';
            case 'Follow-up': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-200 dark:border-blue-700/60';
            case 'Desqualificado':
            case 'No-show na call':
            case 'No-show no Whatsapp':
            case 'Desistiu antes da reunião':
            case 'Desistiu depois da reunião':
                 return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-700/60';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600';
        }
    }
    
    const renderCellContent = (lead, columnId) => {
        const value = get(lead, columnId); // Use lodash.get to access nested properties
        switch(columnId) {
            case 'status':
                return <Badge className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(value)}`}>{value || '-'}</Badge>;
            case 'responsavel_id':
                return userMap?.[value] || value || 'N/A';
            case 'valor':
                return formatCurrency(value);
            case 'data_fechamento_prevista':
            case 'created_date':
            case 'preenchido_em':
            case 'reuniao.data':
            case 'venda.data':
                return value ? format(parseISO(value), 'dd/MM/yyyy') : '-';
            case 'is_mql':
            case 'is_sql':
                return value ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-slate-400" />;
            default:
                // This will now correctly handle nested paths like 'venda.utm_source'
                return value || '-';
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando leads...</div>;
    
    if (leads.length === 0) return <div className="p-8 text-center">Nenhum lead encontrado.</div>;

    return (
        <div className="p-4 overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        {visibleColumns.map((column, index) => (
                            <TableHead 
                                key={column.id} 
                                className={`whitespace-nowrap ${index < visibleColumns.length - 1 ? 'border-r border-slate-200 dark:border-slate-800' : ''}`}
                            >
                                {column.label}
                            </TableHead>
                        ))}
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leads.map((lead) => (
                        <TableRow key={lead.id}>
                            {visibleColumns.map((column, index) => (
                                <TableCell 
                                    key={column.id} 
                                    className={`whitespace-nowrap ${index < visibleColumns.length - 1 ? 'border-r border-slate-200 dark:border-slate-800' : ''}`}
                                >
                                    {renderCellContent(lead, column.id)}
                                </TableCell>
                            ))}
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(lead)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600" onClick={() => onDelete(lead.id)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Excluir
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
