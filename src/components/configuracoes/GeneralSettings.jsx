import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/components/ui/use-toast";
import { User, Upload, Languages } from 'lucide-react';

export default function GeneralSettings() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [fullName, setFullName] = useState('');
    const [language, setLanguage] = useState('pt-BR');
    const [avatarFile, setAvatarFile] = useState(null);

    const { data: user, isLoading: isLoadingUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: () => base44.auth.me()
    });

    const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['userSettings', user?.email],
        queryFn: () => base44.entities.UserSettings.filter({ created_by: user.email }).then(res => res[0]),
        enabled: !!user
    });

    useEffect(() => {
        if (user) setFullName(user.full_name);
        if (userSettings) setLanguage(userSettings.language);
    }, [user, userSettings]);

    const updateNameMutation = useMutation({
        mutationFn: (newName) => base44.auth.updateMe({ full_name: newName }),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Seu nome foi atualizado.' });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
        onError: () => toast({ variant: "destructive", title: 'Erro', description: 'Não foi possível atualizar seu nome.' })
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (settings) => base44.entities.UserSettings.update(userSettings.id, settings),
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Suas preferências foram salvas.' });
            queryClient.invalidateQueries({ queryKey: ['userSettings', user?.email] });
        },
        onError: () => toast({ variant: "destructive", title: 'Erro', description: 'Não foi possível salvar suas preferências.' })
    });
    
    const uploadAvatarMutation = useMutation({
        mutationFn: async (file) => {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            return base44.auth.updateMe({ avatar_url: file_url });
        },
        onSuccess: () => {
            toast({ title: 'Sucesso', description: 'Sua foto de perfil foi atualizada.' });
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setAvatarFile(null);
        },
        onError: () => toast({ variant: "destructive", title: 'Erro', description: 'Não foi possível fazer o upload da imagem.' })
    });

    const handleNameSave = () => {
        if (fullName !== user.full_name) {
            updateNameMutation.mutate(fullName);
        }
    };
    
    const handleAvatarSave = () => {
        if (avatarFile) {
            uploadAvatarMutation.mutate(avatarFile);
        }
    };

    if (isLoadingUser || isLoadingSettings) {
        return <p>Carregando...</p>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 md:col-span-2">
                <CardHeader>
                    <CardTitle>Perfil de Usuário</CardTitle>
                    <CardDescription>Gerencie suas informações pessoais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Nome Completo</Label>
                        <div className="flex gap-2">
                            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                            <Button onClick={handleNameSave} disabled={updateNameMutation.isPending || fullName === user?.full_name}>Salvar</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <Select value={language} onValueChange={(value) => { setLanguage(value); updateSettingsMutation.mutate({ language: value }); }}>
                            <SelectTrigger id="language">
                                <SelectValue placeholder="Selecione o idioma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                <SelectItem value="en-US">English (US)</SelectItem>
                                <SelectItem value="es-ES">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800">
                <CardHeader>
                    <CardTitle>Foto de Perfil</CardTitle>
                    <CardDescription>Atualize sua imagem de avatar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                     {user?.avatar_url ? (
                        <img src={user.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="w-12 h-12 text-slate-500 dark:text-slate-400" />
                        </div>
                    )}
                    <Input id="picture" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="text-xs"/>
                    <Button onClick={handleAvatarSave} disabled={!avatarFile || uploadAvatarMutation.isPending} className="w-full">
                        <Upload className="w-4 h-4 mr-2"/>
                        {uploadAvatarMutation.isPending ? 'Enviando...' : 'Salvar Foto'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}