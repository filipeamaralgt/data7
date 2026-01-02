import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Link, Instagram, Bot } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from "@/components/ui/switch";


const statusOptions = [ "Oportunidade", "Reunião Agendada", "Negociação", "Follow-up", "Contrato", "Cliente", "No-show na call", "No-show no Whatsapp", "Desistiu antes da reunião", "Desistiu depois da reunião", "Desqualificado" ];
const funilOptions = [ "Sessão Estratégica", "Turbinados", "Social Selling", "Isca de Baleia", "Webinar", "Saque Dinheiro", "Aplicação", "Youtube", "Indicação", "Infoproduto", "Prospeção Ativa", "Evento Presencial", "Desconhecido" ];
const servicoOptions = ["Serviço 01", "Serviço 02"];
const empresaOptions = ["Empresa 01", "Empresa 02"];
const statusPosVendaOptions = ["Passagem de Bastão 🔥", "Contrato 📄", "Onboarding ⚙️", "Ativo ✅", "Churn ❌", "Não renovou 🤦‍♂️", "Entrega finalizada ✅", "Inadimplente 👀"];


export default function LeadForm({ open, onOpenChange, lead, onSubmit }) {
    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm();
    const watchedDate = watch("data_fechamento_prevista");

    const { data: users } = useQuery({
        queryKey: ['users'],
        queryFn: () => base44.entities.User.list(),
        enabled: open,
    });

    useEffect(() => {
        if (open) {
            const defaultValues = {
                nome: '', email: '', telefone: '', nome_empresa: '', 
                status: 'Oportunidade', funil: '', responsavel_id: '',
                valor: 0, data_fechamento_prevista: null,
                site: '', instagram: '', link_whatsapp: '',
                servico_ofertado: '', empresa_contratada: '',
                link_instagram: '', contato_financeiro: '', status_pos_venda: null,
                is_mql: false, is_sql: false,
            };
            reset(lead || defaultValues);
        }
    }, [lead, reset, open]);
    
    const isEditMode = !!lead;

    const handleFormSubmit = (data) => {
        data.valor = parseFloat(data.valor) || 0;
        onSubmit(data);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Lead' : 'Adicionar Novo Lead'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                    <div className="max-h-[70vh] overflow-y-auto px-1 py-4">
                        <Tabs defaultValue="geral" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="geral">Geral</TabsTrigger>
                                <TabsTrigger value="contato">Contato</TabsTrigger>
                                <TabsTrigger value="origem">Origem</TabsTrigger>
                            </TabsList>
                            <TabsContent value="geral" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nome">Nome do Lead</Label>
                                        <Input id="nome" {...register('nome', { required: 'Nome é obrigatório' })} />
                                        {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                                        <Input id="nome_empresa" {...register('nome_empresa')} />
                                    </div>
                                     <div>
                                        <Label htmlFor="valor">Valor do Negócio (R$)</Label>
                                        <Input id="valor" type="number" step="0.01" {...register('valor')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="data_fechamento_prevista">Data Prev. Fechamento</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {watchedDate ? format(new Date(watchedDate), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={watchedDate ? new Date(watchedDate) : null}
                                                    onSelect={(date) => setValue('data_fechamento_prevista', date.toISOString().split('T')[0])}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="contato" className="pt-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...register('email')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input id="telefone" {...register('telefone')} />
                                    </div>
                                    <div>
                                        <Label htmlFor="link_whatsapp">Link do WhatsApp</Label>
                                        <Input id="link_whatsapp" {...register('link_whatsapp')} placeholder="https://wa.me/..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="site">Site</Label>
                                        <Input id="site" {...register('site')} placeholder="https://..." />
                                    </div>
                                    <div>
                                        <Label htmlFor="instagram">Instagram</Label>
                                        <Input id="instagram" {...register('instagram')} placeholder="@usuario" />
                                    </div>
                                     <div>
                                        <Label htmlFor="link_instagram">Link do Instagram</Label>
                                        <Input id="link_instagram" {...register('link_instagram')} placeholder="https://instagram.com/..." />
                                    </div>
                                     <div>
                                        <Label htmlFor="contato_financeiro">Contato Financeiro</Label>
                                        <Input id="contato_financeiro" {...register('contato_financeiro')} />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="origem" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="status">Status</Label>
                                        <Controller name="status" control={control} defaultValue="Oportunidade" render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
                                                <SelectContent>{statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div>
                                        <Label htmlFor="funil">Funil</Label>
                                         <Controller name="funil" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Selecione o funil" /></SelectTrigger>
                                                <SelectContent>{funilOptions.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div>
                                        <Label htmlFor="responsavel_id">Responsável</Label>
                                         <Controller name="responsavel_id" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
                                                <SelectContent>
                                                    {users?.map(u => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                     <div>
                                        <Label htmlFor="servico_ofertado">Serviço Ofertado</Label>
                                         <Controller name="servico_ofertado" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                                <SelectContent>{servicoOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div>
                                        <Label htmlFor="empresa_contratada">Empresa Contratada</Label>
                                         <Controller name="empresa_contratada" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                                <SelectContent>{empresaOptions.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                    <div>
                                        <Label htmlFor="status_pos_venda">Status Pós-Venda</Label>
                                         <Controller name="status_pos_venda" control={control} render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                                                <SelectContent>{statusPosVendaOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                            </Select>
                                        )} />
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Controller name="is_mql" control={control} render={({ field }) => (<Switch id="is_mql" checked={field.value} onCheckedChange={field.onChange} />)} />
                                        <Label htmlFor="is_mql">É MQL?</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Controller name="is_sql" control={control} render={({ field }) => (<Switch id="is_sql" checked={field.value} onCheckedChange={field.onChange} />)} />
                                        <Label htmlFor="is_sql">É SQL?</Label>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    <DialogFooter className="mt-4 pt-4 border-t">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">{isEditMode ? 'Salvar Alterações' : 'Criar Lead'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}