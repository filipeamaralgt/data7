import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, UploadCloud, Search, MoreHorizontal, Edit, Trash2, Eye, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const getPlatformIcon = (platform) => {
    if (platform === 'Meta') {
        return <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: '<path d="M22.09,11.56C22.09,5.63,17.1,0.5,11.23,0.5C5.35,0.5,0.36,5.63,0.36,11.56c0,4.86,3.2,9.02,7.57,10.45v-7.4h-2.5v-3.05h2.5V9.43c0-2.48,1.47-3.86,3.75-3.86c1.09,0,2.21,0.19,2.21,0.19v2.6h-1.31c-1.23,0-1.61,0.76-1.61,1.54v1.85h2.92l-0.47,3.05h-2.45v7.4C18.89,20.58,22.09,16.42,22.09,11.56Z"/>' }} />;
    }
    if (platform === 'Google') {
        return <svg className="w-5 h-5" style={{ color: '#EA4335' }} viewBox="0 0 24 24" fill="currentColor" dangerouslySetInnerHTML={{ __html: '<path d="M12.0001 10.5199L12 10.52C14.49,10.52,16.5,8.51,16.5,6C16.5,3.49,14.49,1.5,12,1.5C9.51,1.5,7.5,3.49,7.5,6C7.5,8.51,9.51,10.52,12.0001,10.5199Z"/><path d="M12.02,12.01c-4.42,0-8,1.79-8,4v3h16v-3c0-2.21-3.58-4-8-4Z"/>' }} />;
    }
    return <Info className="w-5 h-5 text-slate-400" />;
};

const initialFormData = { nome: '', plataforma: 'Meta', tipo: 'Interesses', descricao: '', detalhes: {} };

const PublicoForm = ({ open, setOpen, publico, onSave }) => {
    const [formData, setFormData] = useState(initialFormData);
    const [jsonError, setJsonError] = useState('');

    useEffect(() => {
        if (publico) {
            setFormData({
                ...publico,
                detalhes: JSON.stringify(publico.detalhes || {}, null, 2)
            });
        } else {
            setFormData({ ...initialFormData, detalhes: '{}' });
        }
    }, [publico, open]);

    const handleJsonChange = (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, detalhes: val }));
        try {
            JSON.parse(val);
            setJsonError('');
        } catch (error) {
            setJsonError('JSON inválido.');
        }
    };

    const handleSubmit = () => {
        if (jsonError) return;
        let finalData = { ...formData };
        try {
            finalData.detalhes = JSON.parse(formData.detalhes);
        } catch {
            finalData.detalhes = {};
        }
        onSave(finalData);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{publico ? 'Editar Público' : 'Criar Novo Público'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Nome do Público" value={formData.nome} onChange={e => setFormData(f => ({ ...f, nome: e.target.value }))} />
                    <div className="grid grid-cols-2 gap-4">
                        <Select value={formData.plataforma} onValueChange={v => setFormData(f => ({ ...f, plataforma: v }))}>
                            <SelectTrigger><SelectValue placeholder="Plataforma" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Meta">Meta</SelectItem>
                                <SelectItem value="Google">Google</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={formData.tipo} onValueChange={v => setFormData(f => ({ ...f, tipo: v }))}>
                            <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Interesses">Interesses</SelectItem>
                                <SelectItem value="Lookalike">Lookalike</SelectItem>
                                <SelectItem value="Remarketing">Remarketing</SelectItem>
                                <SelectItem value="Personalizado">Personalizado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Textarea placeholder="Descrição do público..." value={formData.descricao} onChange={e => setFormData(f => ({ ...f, descricao: e.target.value }))} />
                    <div>
                        <Textarea
                            placeholder='Detalhes do público (em formato JSON)'
                            value={formData.detalhes}
                            onChange={handleJsonChange}
                            rows={6}
                            className={`font-mono text-xs ${jsonError ? 'border-red-500' : ''}`}
                        />
                        {jsonError && <p className="text-red-500 text-xs mt-1">{jsonError}</p>}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={!!jsonError || !formData.nome}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const PublicoDetailModal = ({ publico, open, setOpen }) => (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{publico?.nome}</DialogTitle>
                <DialogDescription>{publico?.plataforma} • {publico?.tipo}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <p><strong className="font-semibold">Descrição:</strong> {publico?.descricao || 'N/A'}</p>
                <div>
                    <strong className="font-semibold">Detalhes (JSON):</strong>
                    <pre className="mt-2 w-full bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs whitespace-pre-wrap">
                        {JSON.stringify(publico?.detalhes || {}, null, 2)}
                    </pre>
                </div>
            </div>
        </DialogContent>
    </Dialog>
);


const PublicoCard = ({ publico, onEdit, onDelete, onView }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="h-full flex flex-col group">
            <CardHeader className="flex-row items-start justify-between pb-2">
                <CardTitle className="text-base font-bold flex-1 mr-2">{publico.nome}</CardTitle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={onView}><Eye className="mr-2 h-4 w-4" /> Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onSelect={onEdit}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={onDelete} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                 <div className="flex items-center gap-2 mb-2">
                    {getPlatformIcon(publico.plataforma)}
                    <p className="text-xs text-slate-500 dark:text-slate-400">{publico.tipo}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 flex-grow">{publico.descricao || 'Sem descrição.'}</p>
                <Button variant="link" className="p-0 h-auto self-start mt-2" onClick={onView}>Ver Detalhes</Button>
            </CardContent>
        </Card>
    </motion.div>
);

export default function BibliotecaPublicos() {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPublico, setEditingPublico] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [detailPublico, setDetailPublico] = useState(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: publicos, isLoading } = useQuery({
        queryKey: ['publicos'],
        queryFn: () => base44.entities.Publico.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Publico.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['publicos']);
            toast({ title: 'Sucesso!', description: 'Público criado.' });
            setIsFormOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Não foi possível criar o público.', variant: 'destructive' }),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Publico.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['publicos']);
            toast({ title: 'Sucesso!', description: 'Público atualizado.' });
            setIsFormOpen(false);
        },
        onError: () => toast({ title: 'Erro', description: 'Não foi possível atualizar o público.', variant: 'destructive' }),
    });
    
    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Publico.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['publicos']);
            toast({ title: 'Sucesso!', description: 'Público excluído.' });
        },
        onError: () => toast({ title: 'Erro', description: 'Não foi possível excluir o público.', variant: 'destructive' }),
    });

    const handleSave = (data) => {
        if (data.id) {
            const { id, ...updateData } = data;
            updateMutation.mutate({ id, data: updateData });
        } else {
            createMutation.mutate(data);
        }
    };
    
    const handleDelete = (publico) => {
        if (window.confirm(`Tem certeza que deseja excluir o público "${publico.nome}"?`)) {
            deleteMutation.mutate(publico.id);
        }
    };

    const handleCreate = () => {
        setEditingPublico(null);
        setIsFormOpen(true);
    };

    const handleEdit = (publico) => {
        setEditingPublico(publico);
        setIsFormOpen(true);
    };
    
    const handleView = (publico) => {
        setDetailPublico(publico);
    };

    const filteredPublicos = (publicos || []).filter(p =>
        (p.nome?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Biblioteca de Públicos</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => toast({ title: "Em breve!", description: "A importação de públicos estará disponível em futuras atualizações." })}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Importar Públicos
                    </Button>
                    <Button onClick={handleCreate}><Plus className="mr-2 h-4 w-4" /> Criar Público</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                    placeholder="Buscar por nome ou descrição do público..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            {isLoading && <div className="text-center py-16"><p className="text-slate-500">Carregando públicos...</p></div>}

            {!isLoading && filteredPublicos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredPublicos.map(publico => (
                        <PublicoCard 
                            key={publico.id} 
                            publico={publico} 
                            onEdit={() => handleEdit(publico)}
                            onDelete={() => handleDelete(publico)}
                            onView={() => handleView(publico)}
                        />
                    ))}
                </div>
            ) : (
                !isLoading && <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-slate-500">Nenhum público encontrado.</p>
                </div>
            )}

            <PublicoForm 
                open={isFormOpen} 
                setOpen={setIsFormOpen} 
                publico={editingPublico} 
                onSave={handleSave} 
            />

            <PublicoDetailModal
                open={!!detailPublico}
                setOpen={() => setDetailPublico(null)}
                publico={detailPublico}
            />
        </div>
    );
}