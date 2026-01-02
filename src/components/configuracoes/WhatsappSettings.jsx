import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, MessageSquare, Smartphone } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import WhatsappForm from './WhatsappForm';

export default function WhatsappSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContact, setEditingContact] = useState(null);

    const { data: contacts = [], isLoading } = useQuery({
        queryKey: ['whatsappConfigs'],
        queryFn: () => base44.entities.WhatsappConfig.list(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.WhatsappConfig.delete(id),
        onSuccess: () => {
            toast({ title: "Sucesso", description: "Contato removido." });
            queryClient.invalidateQueries({ queryKey: ['whatsappConfigs'] });
        },
        onError: () => {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível remover o contato." });
        },
    });

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingContact(null);
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setEditingContact(null);
    };

    return (
        <>
            <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Contatos do WhatsApp</CardTitle>
                        <CardDescription>Gerencie números e grupos para receber notificações e relatórios.</CardDescription>
                    </div>
                    <Button onClick={handleAddNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Contato
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Carregando contatos...</p>
                    ) : contacts.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">Nenhum contato do WhatsApp cadastrado.</p>
                    ) : (
                        <div className="space-y-4">
                            {contacts.map(contact => (
                                <div key={contact.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <div className="flex items-center gap-4">
                                        {contact.type === 'grupo' ? <MessageSquare className="w-6 h-6 text-green-500" /> : <Smartphone className="w-6 h-6 text-blue-500" />}
                                        <div>
                                            <p className="font-semibold">{contact.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{contact.identifier}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(contact.id)} disabled={deleteMutation.isPending}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
            <WhatsappForm 
                isOpen={isFormOpen} 
                onOpenChange={setIsFormOpen} 
                contact={editingContact} 
                onSuccess={handleFormClose}
            />
        </>
    );
}