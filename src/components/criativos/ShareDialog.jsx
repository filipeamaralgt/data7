import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { Lock, Globe, Link2, Settings, HelpCircle, X, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Link as RouterLink } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { PastaCriativos } from "@/entities/PastaCriativos";

const getInitials = (name = "") => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const ShareDialog = ({ open, setOpen, item, onUpdate }) => {
  const { toast } = useToast();
  const [accessLevel, setAccessLevel] = useState('restrito');
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [sharedWith, setSharedWith] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    if (open && item) {
      const fetchData = async () => {
        try {
          const me = await base44.auth.me();
          setCurrentUser(me);

          const usersList = await base44.entities.User.list();
          setAllUsers(usersList);

          const sharedWithEmails = item.shared_with || [];
          const sharedWithUsers = usersList.filter(u => sharedWithEmails.includes(u.email) && u.email !== me.email);
          setSharedWith(sharedWithUsers);

          setAccessLevel(item.access_level || 'restrito');
        } catch (error) {
          console.error("Erro ao carregar dados de compartilhamento:", error);
          toast({ title: "Erro ao carregar dados", variant: "destructive" });
        }
      };
      fetchData();
    } else {
        setSearchTerm("");
        setSharedWith([]);
    }
  }, [open, item, toast]);

  const handleUserSelect = (user) => {
    if (!sharedWith.some(u => u.id === user.id)) {
      setSharedWith(prev => [...prev, user]);
    }
    setSearchTerm("");
    setIsPopoverOpen(false);
  };

  const handleRemoveUser = (userToRemove) => {
    setSharedWith(prev => prev.filter(u => u.id !== userToRemove.id));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sharedWithEmails = sharedWith.map(u => u.email);
      await PastaCriativos.update(item.id, {
        shared_with: sharedWithEmails,
        access_level: accessLevel,
      });
      toast({ title: "Permissões atualizadas!" });
      onUpdate(); // Chama a função para atualizar a lista de pastas na página principal
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast({ title: "Erro ao salvar", description: "Não foi possível atualizar as permissões.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}${createPageUrl(`CentralCriativos?folderId=${item.id}`)}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link para a pasta foi copiado para a área de transferência.",
    });
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    const lowerCaseSearch = searchTerm.toLowerCase();
    // Filtra usuários que não são o atual e não já foram adicionados
    return allUsers.filter(user =>
      user.id !== currentUser?.id &&
      !sharedWith.some(su => su.id === user.id) &&
      (user.full_name?.toLowerCase().includes(lowerCaseSearch) || user.email.toLowerCase().includes(lowerCaseSearch))
    );
  }, [searchTerm, allUsers, currentUser, sharedWith]);

  if (!item || !currentUser) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center justify-between">
            <span>Compartilhar "{item.nome}"</span>
            <div className="flex items-center gap-2">
              <RouterLink to={createPageUrl('Suporte')}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500">
                      <HelpCircle className="h-5 w-5" />
                  </Button>
              </RouterLink>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500" onClick={() => toast({ title: "Em breve!", description: "Configurações avançadas de compartilhamento."})}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 space-y-4">
            <Popover open={isPopoverOpen && searchTerm} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Input
                  placeholder="Adicionar participantes..."
                  className="h-12 text-base"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value) setIsPopoverOpen(true);
                    else setIsPopoverOpen(false);
                  }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandList>
                    <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                    <CommandGroup>
                      {filteredUsers.map((user) => (
                        <CommandItem key={user.id} onSelect={() => handleUserSelect(user)} className="flex items-center gap-3">
                           <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-medium text-sm">{user.full_name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                           </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

          <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">Pessoas com acesso</h3>
              {/* Current User (Owner) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentUser.avatar_url} alt={currentUser.full_name} />
                    <AvatarFallback>{getInitials(currentUser.full_name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{currentUser.full_name} (you)</p>
                    <p className="text-sm text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Proprietário</p>
              </div>
              {/* Shared With Users */}
              {sharedWith.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <Avatar>
                              <AvatarImage src={user.avatar_url} alt={user.full_name}/>
                              <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-slate-500">{user.email}</p>
                          </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleRemoveUser(user)}>
                          <X className="h-4 w-4" />
                      </Button>
                  </div>
              ))}
          </div>
          
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">Acesso geral</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                 {accessLevel === 'restrito' ? <Lock className="h-6 w-6 text-slate-600 dark:text-slate-300"/> : <Globe className="h-6 w-6 text-slate-600 dark:text-slate-300"/>}
              </div>
              <div>
                <Select value={accessLevel} onValueChange={setAccessLevel}>
                  <SelectTrigger className="font-semibold w-auto border-0 focus:ring-0 p-0 h-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restrito">Restrito</SelectItem>
                    <SelectItem value="publico">Qualquer pessoa com o link</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-slate-500">
                  {accessLevel === 'restrito' 
                    ? 'Apenas pessoas com acesso podem abrir usando o link'
                    : 'Qualquer pessoa na internet com o link pode ver'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50 dark:bg-slate-800/50 p-4 mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            <Link2 className="h-4 w-4" />
            Copiar link
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Concluído
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;