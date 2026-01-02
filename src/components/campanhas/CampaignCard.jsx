
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, UploadCloud, CheckCircle, AlertCircle, Loader2, Info, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Campanha } from '@/entities/Campanha';
import { useToast } from "@/components/ui/use-toast";

export default function CampaignCard({ campaign, refreshCampaigns, onEdit }) {
    const [isPublishing, setIsPublishing] = useState(false);
    const { toast } = useToast();

    const handlePublish = async () => {
        setIsPublishing(true);
        try {
            // 1. Set status to "Publicando"
            await Campanha.update(campaign.id, { status: 'Publicando', status_publicacao: 'publicando' });
            refreshCampaigns();

            // 2. Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 3. Simulate success/failure
            if (Math.random() > 0.2) {
                await Campanha.update(campaign.id, { status: 'Ativa', status_publicacao: 'sucesso' });
                toast({ title: "Sucesso!", description: `Campanha "${campaign.nome}" foi publicada.` });
            } else {
                const errorMsg = "O público selecionado não é mais válido.";
                await Campanha.update(campaign.id, { status: 'Erro', status_publicacao: 'falha', mensagem_erro: errorMsg });
                toast({ title: "Falha na Publicação", description: errorMsg, variant: "destructive" });
            }

        } catch (error) {
            toast({ title: "Erro", description: "Ocorreu um erro inesperado.", variant: "destructive" });
        } finally {
            setIsPublishing(false);
            refreshCampaigns();
        }
    };
    
    const handleDelete = async () => {
        if (window.confirm(`Tem certeza que deseja excluir a campanha "${campaign.nome}"?`)) {
            try {
                await Campanha.delete(campaign.id);
                toast({ title: "Campanha excluída com sucesso!" });
                refreshCampaigns();
            } catch (error) {
                console.error("Erro ao excluir campanha:", error)
                toast({ title: "Erro ao excluir campanha", description: "Ocorreu um problema ao tentar remover a campanha.", variant: "destructive" });
            }
        }
    };

    const statusConfig = {
        pendente: { text: "Pendente", icon: <Info className="h-4 w-4 text-slate-500" /> },
        publicando: { text: "Publicando...", icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" /> },
        sucesso: { text: "Sucesso", icon: <CheckCircle className="h-4 w-4 text-green-500" /> },
        falha: { text: "Falha", icon: <AlertCircle className="h-4 w-4 text-red-500" /> },
    };

    const currentStatus = statusConfig[campaign.status_publicacao] || statusConfig.pendente;

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Label>Nome da campanha</Label>
                        <h3 className="font-bold text-lg">{campaign.nome}</h3>
                        <p className="text-sm text-slate-500">Status: <span className="font-semibold">{campaign.status}</span> | Objetivo: <span className="font-semibold">{campaign.objetivo}</span></p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onEdit(campaign)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Excluir</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="space-y-1">
                        <Label className="text-xs flex items-center">Custo por Conversão para PAUSAR <Info className="w-3 h-3 ml-1" /></Label>
                        <Input type="text" placeholder="R$ 0,00" disabled />
                    </div>
                     <div className="space-y-1">
                        <Label className="text-xs flex items-center">Orçamento Diário Máximo <Info className="w-3 h-3 ml-1" /></Label>
                        <Input type="text" placeholder="R$ 0,00" disabled />
                    </div>
                    <div className="flex flex-col justify-center items-center h-full space-y-1">
                        <Label className="text-xs">Status da Publicação</Label>
                        <div className="flex items-center justify-center gap-2 font-semibold">
                            {currentStatus.icon}
                            <span>{currentStatus.text}</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        {campaign.status === 'Rascunho' && (
                             <Button 
                                className="bg-green-600 hover:bg-green-700" 
                                onClick={handlePublish}
                                disabled={isPublishing}
                            >
                                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {isPublishing ? 'Subindo...' : 'Subir Campanha'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
