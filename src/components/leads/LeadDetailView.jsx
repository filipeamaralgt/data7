
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, DollarSign, Edit, Trash2, User, Phone, Mail, MessageSquare, Check, Plus, Briefcase, Link as LinkIcon, Building, Activity as ActivityIcon, StickyNote, FileText, CheckCircle, Circle, PhoneCall, Handshake, Mail as MailIcon, Utensils, Star, BellRing, Globe, Instagram as InstagramIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";


const formatCurrency = (value) => {
    if (typeof value !== 'number') return "R$ 0,00";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Activity Timeline Component
const ActivityTimeline = ({ leadId }) => {
    const queryClient = useQueryClient();
    const { data: activities = [], isLoading } = useQuery({
        queryKey: ['activities', leadId],
        queryFn: () => base44.entities.Activity.filter({ lead_id: leadId }, '-due_date'),
        enabled: !!leadId,
    });

    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
    const userMap = users?.reduce((acc, user) => ({ ...acc, [user.id]: user.full_name }), {});

    const updateActivityMutation = useMutation({
        mutationFn: ({ id, ...data }) => base44.entities.Activity.update(id, data),
        onSuccess: () => queryClient.invalidateQueries(['activities', leadId]),
    });

    const handleToggleDone = (activity) => {
        updateActivityMutation.mutate({ id: activity.id, done: !activity.done });
    };
    
    const activityIcons = {
        'Ligação': <PhoneCall className="w-4 h-4" />,
        'Reunião': <Handshake className="w-4 h-4" />,
        'E-mail': <MailIcon className="w-4 h-4" />,
        'Almoço': <Utensils className="w-4 h-4" />,
        'Tarefa': <Star className="w-4 h-4" />,
    };

    if (isLoading) return <div>Carregando atividades...</div>;

    return (
        <div className="space-y-4">
            <NewActivityForm leadId={leadId} />
            <div className="space-y-6">
                {activities.map(activity => (
                    <div key={activity.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <Button size="icon" variant="ghost" className={`w-8 h-8 rounded-full ${activity.done ? 'bg-green-100 dark:bg-green-900/50 text-green-600' : 'bg-slate-100 dark:bg-slate-800'}`} onClick={() => handleToggleDone(activity)}>
                                {activity.done ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 text-slate-400" />}
                            </Button>
                             <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 my-2"></div>
                        </div>
                        <div className={`flex-1 pb-4 ${activity.done ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {activityIcons[activity.type] || <BellRing className="w-4 h-4" />}
                                <span>{activity.subject}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {format(parseISO(activity.due_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                {activity.user_id && userMap?.[activity.user_id] && ` • ${userMap[activity.user_id]}`}
                            </p>
                            {activity.notes && <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{activity.notes}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// New Activity Form Component
const NewActivityForm = ({ leadId }) => {
    const [subject, setSubject] = useState('');
    const [type, setType] = useState('Ligação');
    const [dueDate, setDueDate] = useState('');
    const queryClient = useQueryClient();

    const createActivityMutation = useMutation({
        mutationFn: (newActivity) => base44.entities.Activity.create(newActivity),
        onSuccess: () => {
            queryClient.invalidateQueries(['activities', leadId]);
            setSubject('');
            setDueDate('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject || !dueDate) return;
        createActivityMutation.mutate({ lead_id: leadId, subject, type, due_date: new Date(dueDate).toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="p-3 rounded-lg border dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-2 mb-6">
            <Input placeholder="Nova atividade..." value={subject} onChange={(e) => setSubject(e.target.value)} />
            <div className="flex gap-2">
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Ligação">Ligação</SelectItem>
                        <SelectItem value="Reunião">Reunião</SelectItem>
                        <SelectItem value="E-mail">E-mail</SelectItem>
                        <SelectItem value="Almoço">Almoço</SelectItem>
                        <SelectItem value="Tarefa">Tarefa</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="flex-1" />
                <Button type="submit" size="icon"><Plus className="w-4 h-4" /></Button>
            </div>
        </form>
    );
};

// Notes Component
const NotesSection = ({ leadId }) => {
    const [content, setContent] = useState('');
    const queryClient = useQueryClient();

    const { data: notes = [], isLoading } = useQuery({
        queryKey: ['notes', leadId],
        queryFn: () => base44.entities.Note.filter({ lead_id: leadId }, '-created_date'),
        enabled: !!leadId,
    });
     const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
    const userMap = users?.reduce((acc, user) => ({ ...acc, [user.id]: user.full_name }), {});

    const createNoteMutation = useMutation({
        mutationFn: (newNote) => base44.entities.Note.create(newNote),
        onSuccess: () => {
            queryClient.invalidateQueries(['notes', leadId]);
            setContent('');
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content) return;
        createNoteMutation.mutate({ lead_id: leadId, content });
    };

    if (isLoading) return <div>Carregando notas...</div>;

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea placeholder="Adicionar uma nota..." value={content} onChange={(e) => setContent(e.target.value)} />
                <Button type="submit">Salvar Nota</Button>
            </form>
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-sm text-slate-700 dark:text-slate-200">{note.content}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                            {userMap?.[note.created_by] || note.created_by} • {format(parseISO(note.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Detail View
export default function LeadDetailView({ leadId, onOpenChange, onDelete }) {
    const queryClient = useQueryClient();
    const { data: lead, isLoading } = useQuery({
        queryKey: ['lead', leadId],
        queryFn: () => base44.entities.Lead.get(leadId),
        enabled: !!leadId,
    });
    
    const { data: users } = useQuery({ queryKey: ['users'], queryFn: () => base44.entities.User.list() });
    const userMap = users?.reduce((acc, user) => ({ ...acc, [user.id]: user.full_name }), {});

    const updateLeadMutation = useMutation({
        mutationFn: ({ id, ...data }) => base44.entities.Lead.update(id, data),
        onSuccess: (updatedLead) => {
            queryClient.setQueryData(['lead', leadId], updatedLead);
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    const handleFieldChange = (field, value) => {
        updateLeadMutation.mutate({ id: leadId, [field]: value });
    };
    
    const statusOptions = [ "Oportunidade", "Reunião Agendada", "Negociação", "Follow-up", "Contrato", "Cliente", "No-show na call", "No-show no Whatsapp", "Desistiu antes da reunião", "Desistiu depois da reunião", "Desqualificado" ];
    const funilOptions = [ "Sessão Estratégica", "Turbinados", "Social Selling", "Isca de Baleia", "Webinar", "Saque Dinheiro", "Aplicação", "Youtube", "Indicação", "Infoproduto", "Prospeção Ativa", "Evento Presencial", "Desconhecido" ];
    const servicoOptions = ["Serviço 01", "Serviço 02"];
    const empresaOptions = ["Empresa 01", "Empresa 02"];
    const statusPosVendaOptions = ["Passagem de Bastão 🔥", "Contrato 📄", "Onboarding ⚙️", "Ativo ✅", "Churn ❌", "Não renovou 🤦‍♂️", "Entrega finalizada ✅", "Inadimplente 👀"];

    return (
        <Sheet open={!!leadId} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-y-auto">
                {isLoading && <p>Carregando...</p>}
                {lead && (
                    <>
                        <SheetHeader className="pr-12">
                            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-slate-500" />
                                {lead.nome}
                            </SheetTitle>
                            <SheetDescription className="flex items-center gap-4">
                               <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-green-500" />
                                  <span className="font-semibold text-green-600">{formatCurrency(lead.valor)}</span>
                               </div>
                               <div className="flex items-center gap-2 text-slate-500">
                                   <Building className="w-4 h-4" />
                                   <span>{lead.nome_empresa}</span>
                               </div>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="absolute top-4 right-16 flex items-center gap-2">
                            <Button variant="destructive" size="icon" onClick={() => onDelete(lead.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="py-6">
                            <Tabs defaultValue="activities">
                                <TabsList>
                                    <TabsTrigger value="activities"><ActivityIcon className="w-4 h-4 mr-2" />Atividades</TabsTrigger>
                                    <TabsTrigger value="notes"><StickyNote className="w-4 h-4 mr-2" />Notas</TabsTrigger>
                                    <TabsTrigger value="details"><FileText className="w-4 h-4 mr-2" />Detalhes</TabsTrigger>
                                </TabsList>
                                <TabsContent value="activities" className="pt-4">
                                    <ActivityTimeline leadId={lead.id} />
                                </TabsContent>
                                <TabsContent value="notes" className="pt-4">
                                    <NotesSection leadId={lead.id} />
                                </TabsContent>
                                <TabsContent value="details" className="pt-6 space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        <div>
                                            <Label>Valor do Negócio (R$)</Label>
                                            <Input type="number" step="0.01" defaultValue={lead.valor} onBlur={(e) => handleFieldChange('valor', parseFloat(e.target.value) || 0)} />
                                        </div>
                                        <div>
                                            <Label>Data Prev. Fechamento</Label>
                                              <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {lead.data_fechamento_prevista ? format(parseISO(lead.data_fechamento_prevista), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={lead.data_fechamento_prevista ? parseISO(lead.data_fechamento_prevista) : null}
                                                        onSelect={(date) => handleFieldChange('data_fechamento_prevista', date ? date.toISOString().split('T')[0] : null)}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <Select value={lead.status} onValueChange={(v) => handleFieldChange('status', v)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div>
                                            <Label>Funil</Label>
                                            <Select value={lead.funil} onValueChange={(v) => handleFieldChange('funil', v)}>
                                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                                <SelectContent>
                                                    {funilOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Responsável</Label>
                                            <Select value={lead.responsavel_id} onValueChange={(v) => handleFieldChange('responsavel_id', v)}>
                                                <SelectTrigger><SelectValue placeholder="Sem responsável" /></SelectTrigger>
                                                <SelectContent>
                                                    {users?.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                         <div>
                                            <Label>Serviço Ofertado</Label>
                                            <Select value={lead.servico_ofertado} onValueChange={(v) => handleFieldChange('servico_ofertado', v)}>
                                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                                <SelectContent>{servicoOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                         <div>
                                            <Label>Empresa Contratada</Label>
                                            <Select value={lead.empresa_contratada} onValueChange={(v) => handleFieldChange('empresa_contratada', v)}>
                                                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                                <SelectContent>{empresaOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                         <div>
                                            <Label>Status Pós-Venda</Label>
                                            <Select value={lead.status_pos_venda} onValueChange={(v) => handleFieldChange('status_pos_venda', v)}>
                                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                                <SelectContent>{statusPosVendaOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <Input defaultValue={lead.email} onBlur={(e) => handleFieldChange('email', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Telefone</Label>
                                            <Input defaultValue={lead.telefone} onBlur={(e) => handleFieldChange('telefone', e.target.value)} />
                                        </div>
                                         <div>
                                            <Label>Contato Financeiro</Label>
                                            <Input defaultValue={lead.contato_financeiro} onBlur={(e) => handleFieldChange('contato_financeiro', e.target.value)} />
                                        </div>
                                         <div>
                                            <Label>Site</Label>
                                            <Input defaultValue={lead.site} onBlur={(e) => handleFieldChange('site', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Instagram</Label>
                                            <Input defaultValue={lead.instagram} onBlur={(e) => handleFieldChange('instagram', e.target.value)} />
                                        </div>
                                        <div>
                                            <Label>Link do WhatsApp</Label>
                                            <Input defaultValue={lead.link_whatsapp} onBlur={(e) => handleFieldChange('link_whatsapp', e.target.value)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_mql">É MQL?</Label>
                                            </div>
                                            <Switch
                                                id="is_mql"
                                                checked={lead.is_mql}
                                                onCheckedChange={(v) => handleFieldChange('is_mql', v)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_sql">É SQL?</Label>
                                            </div>
                                            <Switch
                                                id="is_sql"
                                                checked={lead.is_sql}
                                                onCheckedChange={(v) => handleFieldChange('is_sql', v)}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
