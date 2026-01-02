
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Plus, SlidersHorizontal, Settings2 } from 'lucide-react';
import LeadFilters from '@/components/leads/LeadFilters';
import LeadKanbanView from '@/components/leads/LeadKanbanView';
import LeadTableView from '@/components/leads/LeadTableView';
import LeadForm from '@/components/leads/LeadForm';
import LeadDetailView from '@/components/leads/LeadDetailView'; // Import the new detail view
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const allColumns = [
    { id: 'nome', label: 'Nome' },
    { id: 'nome_empresa', label: 'Empresa' },
    { id: 'status', label: 'Status' },
    { id: 'valor', label: 'Valor' },
    { id: 'funil', label: 'Funil' },
    { id: 'responsavel_id', label: 'Responsável' },
    { id: 'email', label: 'Email' },
    { id: 'telefone', label: 'Telefone' },
    { id: 'data_fechamento_prevista', label: 'Data Prev. Fechamento' },
    { id: 'status_pos_venda', label: 'Status Pós-Venda' },
    { id: 'servico_ofertado', label: 'Serviço Ofertado' },
    { id: 'empresa_contratada', label: 'Empresa Contratada' },
    { id: 'is_mql', label: 'MQL' },
    { id: 'is_sql', label: 'SQL' },
    { id: 'site', label: 'Site' },
    { id: 'instagram', label: 'Instagram' },
    { id: 'link_whatsapp', label: 'Link WhatsApp' },
    { id: 'link_instagram', label: 'Link Instagram' },
    { id: 'contato_financeiro', label: 'Contato Financeiro' },
    { id: 'motivo_loss', label: 'Motivo da Perda' },
    { id: 'preenchido_em', label: 'Data de Preenchimento' },
    { id: 'reuniao.data', label: 'Data da Reunião' },
    { id: 'reuniao.participantes', label: 'Participantes da Reunião' },
    { id: 'venda.data', label: 'Data da Venda' },
    { id: 'venda.utm_source', label: 'UTM Source' },
    { id: 'venda.utm_medium', label: 'UTM Medium' },
    { id: 'venda.utm_campaign', label: 'UTM Campaign' },
    { id: 'venda.utm_content', label: 'UTM Content' },
    { id: 'created_date', label: 'Data de Criação' },
];

const defaultColumnVisibility = {
    nome: true,
    nome_empresa: true,
    status: true,
    valor: false, // Changed to false
    funil: true,
    responsavel_id: true,
    email: false,
    telefone: false,
    data_fechamento_prevista: false,
    status_pos_venda: false,
    servico_ofertado: false,
    empresa_contratada: false,
    is_mql: false,
    is_sql: false,
    site: false,
    instagram: false,
    link_whatsapp: false,
    link_instagram: false,
    contato_financeiro: false,
    motivo_loss: false,
    preenchido_em: false,
    'reuniao.data': false,
    'reuniao.participantes': false,
    'venda.data': false,
    'venda.utm_source': false,
    'venda.utm_medium': false,
    'venda.utm_campaign': false,
    'venda.utm_content': false,
    created_date: false,
};


export default function CentralLeads() {
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
    const [filters, setFilters] = useState({});
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [selectedLeadId, setSelectedLeadId] = useState(null); // To manage the detailed view
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState(() => {
        try {
            const saved = localStorage.getItem('leadColumnVisibility');
            return saved ? JSON.parse(saved) : defaultColumnVisibility;
        } catch {
            return defaultColumnVisibility;
        }
    });

    useEffect(() => {
        localStorage.setItem('leadColumnVisibility', JSON.stringify(columnVisibility));
    }, [columnVisibility]);

    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Fetching leads
    const { data: leads = [], isLoading } = useQuery({
        queryKey: ['leads', filters],
        queryFn: () => base44.entities.Lead.filter(filters),
    });

    // Mutations
    const createLeadMutation = useMutation({
        mutationFn: (leadData) => base44.entities.Lead.create(leadData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsCreateFormOpen(false);
        },
        onError: () => toast({ title: "Erro", description: "Não foi possível criar o lead.", variant: "destructive" }),
    });

    const updateLeadMutation = useMutation({
        mutationFn: ({ id, ...leadData }) => base44.entities.Lead.update(id, leadData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            // Also invalidate the specific lead query for the detail view
            queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
        },
        onError: () => toast({ title: "Erro", description: "Não foi possível atualizar o lead.", variant: "destructive" }),
    });

    const deleteLeadMutation = useMutation({
        mutationFn: (id) => base44.entities.Lead.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
            setIsDeleteDialogOpen(false);
            setLeadToDelete(null);
            setSelectedLeadId(null); // Close detail view if the lead is deleted
        },
        onError: () => toast({ title: "Erro", description: "Não foi possível excluir o lead.", variant: "destructive" }),
    });

    // Handlers
    const handleAddLead = () => {
        setIsCreateFormOpen(true);
    };

    const handleEditLead = (lead) => {
        setSelectedLeadId(lead.id);
    };

    const handleDeleteRequest = (id) => {
        setLeadToDelete(id);
        setIsDeleteDialogOpen(true);
    };
    
    const confirmDelete = () => {
        if(leadToDelete) {
            deleteLeadMutation.mutate(leadToDelete);
        }
    };

    const handleFormSubmit = (data) => {
        createLeadMutation.mutate(data);
    };
    
    const updateLeadStatus = (lead, newStatus) => {
        updateLeadMutation.mutate({ id: lead.id, status: newStatus });
    };
    
    const getButtonClass = (mode) => {
        const baseClass = "h-9 w-9";
        if (viewMode === mode) {
            return cn(baseClass, "bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900");
        }
        return cn(baseClass, "bg-transparent text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700");
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            <Toaster />
            <header className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Central de Leads</h1>
                        <p className="text-slate-500 dark:text-slate-400">Gerencie seu funil de vendas do início ao fim.</p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                            Filtros
                        </Button>
                        
                        {viewMode === 'table' && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Settings2 className="w-4 h-4 mr-2" />
                                        Exibir
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Exibir colunas</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {allColumns.map(column => (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={columnVisibility[column.id]}
                                            onCheckedChange={(checked) =>
                                                setColumnVisibility(prev => ({ ...prev, [column.id]: checked }))
                                            }
                                        >
                                            {column.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        
                        <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center">
                            <Button size="icon" onClick={() => setViewMode('kanban')} className={getButtonClass('kanban')}>
                                <LayoutGrid className="w-5 h-5" />
                            </Button>
                            <Button size="icon" onClick={() => setViewMode('table')} className={getButtonClass('table')}>
                                <List className="w-5 h-5" />
                            </Button>
                        </div>
                        <Button onClick={handleAddLead} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md hover:from-amber-600 hover:to-orange-600">
                            <Plus className="w-5 h-5 mr-2" />
                            Adicionar Lead
                        </Button>
                    </div>
                </div>
                 {showFilters && <LeadFilters onFilter={setFilters} onClear={() => setFilters({})} />}
            </header>
           
            <main className="flex-1 overflow-auto">
                {viewMode === 'kanban' ? (
                    <LeadKanbanView 
                        leads={leads}
                        setLeads={() => queryClient.invalidateQueries(['leads'])}
                        onEdit={handleEditLead} // Now opens detail view
                        isLoading={isLoading}
                        onUpdateLeadStatus={updateLeadStatus}
                    />
                ) : (
                    <LeadTableView 
                        leads={leads}
                        onEdit={handleEditLead} // Now opens detail view
                        onDelete={handleDeleteRequest}
                        isLoading={isLoading}
                        columnConfig={{ allColumns, visibleColumns: columnVisibility }}
                    />
                )}
            </main>

            {/* Form for creating new leads */}
            <LeadForm
                open={isCreateFormOpen}
                onOpenChange={setIsCreateFormOpen}
                onSubmit={handleFormSubmit}
            />

            {/* Detail view for selected lead */}
            <LeadDetailView
                leadId={selectedLeadId}
                onOpenChange={() => setSelectedLeadId(null)}
                onDelete={handleDeleteRequest}
            />
            
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o lead e todas as suas atividades e notas associadas.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
