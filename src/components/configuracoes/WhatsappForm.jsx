
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";

export default function WhatsappForm({ isOpen, onOpenChange, contact, onSuccess }) {
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const isEditMode = !!contact;

    useEffect(() => {
        if (isOpen) {
            reset(contact || { name: '', type: 'numero', identifier: '', description: '' });
        }
    }, [isOpen, contact, reset]);

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.WhatsappConfig.create(data),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Contato adicionado.' });
            queryClient.invalidateQueries({ queryKey: ['whatsappConfigs'] });
            onSuccess();
        },
        onError: () => toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível adicionar o contato.' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => base44.entities.WhatsappConfig.update(id, data),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Contato atualizado.' });
            queryClient.invalidateQueries({ queryKey: ['whatsappConfigs'] });
            onSuccess();
        },
        onError: () => toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível atualizar o contato.' }),
    });

    const onSubmit = (data) => {
        if (isEditMode) {
            updateMutation.mutate({ id: contact.id, ...data });
        } else {
            createMutation.mutate(data);
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Editar Contato' : 'Adicionar Contato WhatsApp'}</DialogTitle>
                    <DialogDescription>
                        Preencha as informações para cadastrar um novo número ou grupo.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="name">Nome de Identificação</Label>
                        <Input id="name" {...register('name', { required: true })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório.</p>}
                    </div>
                    <div>
                        <Label htmlFor="type">Tipo</Label>
                        <Controller
                            name="type"
                            control={control}
                            defaultValue="numero"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="numero">Número</SelectItem>
                                        <SelectItem value="grupo">Grupo</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div>
                        <Label htmlFor="identifier">Número ou ID do Grupo</Label>
                        <Input id="identifier" {...register('identifier', { required: true })} placeholder="Ex: 5511999998888 ou ...@g.us"/>
                        {errors.identifier && <p className="text-red-500 text-xs mt-1">Este campo é obrigatório.</p>}
                    </div>
                    <div>
                        <Label htmlFor="description">Descrição (Opcional)</Label>
                        <Textarea id="description" {...register('description')} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={isLoading}>{isLoading ? 'Salvando...' : 'Salvar'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
