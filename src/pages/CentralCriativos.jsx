
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image as ImageIcon, Video, FileText, Loader2, MoreHorizontal, Edit, Trash2, Eye, Filter, Folder as FolderIcon, ArrowDownUp, Check, UploadCloud, Computer, CornerDownLeft, Search, ChevronLeft, ChevronRight, Download, Share2, Link as LinkIcon, Star, Palette, Info, LayoutGrid, List } from 'lucide-react';
import { Criativo } from '@/entities/Criativo';
import { PastaCriativos } from '@/entities/PastaCriativos';
import { ActivityLog } from '@/entities/ActivityLog'; // Import new entity
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AnimatePresence } from 'framer-motion'; // Added AnimatePresence
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { base44 } from "@/api/base44Client";
import FunnelSelect from "@/components/dashboard/filters/FunnelSelect";
import CreativePreviewModal from '@/components/criativos/CreativePreviewModal';
import ShareDialog from '@/components/criativos/ShareDialog';
import DetailsPane from '@/components/criativos/DetailsPane'; // Import new component
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const initialFormData = { nome: '', tipo: 'Imagem', titulo: '', corpo_texto: '', cta: 'Saiba Mais', link_externo: '', funil: '' };
const ITEMS_PER_PAGE = 48;

const CreativeForm = ({ open, setOpen, refreshCreatives, creativeToEdit, currentUserEmail }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (creativeToEdit) {
        setFormData({
          nome: creativeToEdit.nome || '',
          tipo: creativeToEdit.tipo || 'Imagem',
          funil: creativeToEdit.funil || '',
          titulo: creativeToEdit.titulo || '',
          corpo_texto: creativeToEdit.corpo_texto || '',
          cta: creativeToEdit.cta || 'Saiba Mais',
          link_externo: creativeToEdit.link_externo || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setFile(null);
    }
  }, [open, creativeToEdit]);

  const handleSubmit = async () => {
    if (!formData.nome) {
        toast({ title: "Campo obrigatório", description: "Por favor, preencha o nome do criativo.", variant: "destructive" });
        return;
    }

    setIsLoading(true);
    try {
      let fileUrl = '';
      if (file) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        fileUrl = file_url;
      }
      
      if (creativeToEdit) {
        const finalFileUrl = fileUrl || creativeToEdit.arquivo_url;
        await Criativo.update(creativeToEdit.id, { ...formData, arquivo_url: finalFileUrl });
        await ActivityLog.create({
            action: 'update',
            item_type: 'Criativo',
            item_id: creativeToEdit.id,
            item_name: formData.nome,
            details: { previous_state: creativeToEdit, new_state: formData }, // More detailed logging
            user_email: currentUserEmail
        });
        toast({ title: "Criativo Atualizado!", description: "As informações do seu criativo foram salvas." });
      } else {
        const newCreative = await Criativo.create({ ...formData, arquivo_url: fileUrl });
        await ActivityLog.create({
            action: 'create',
            item_type: 'Criativo',
            item_id: newCreative.id,
            item_name: newCreative.nome,
            details: formData,
            user_email: currentUserEmail
        });
        toast({ title: "Criativo Salvo!", description: "Seu novo criativo foi adicionado à biblioteca." });
      }

      refreshCreatives();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao salvar criativo:", error);
      toast({ title: "Erro ao Salvar", description: "Não foi possível salvar o criativo. Tente novamente.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!creativeToEdit;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Criativo' : 'Adicionar Novo Criativo'}</DialogTitle>
          <DialogDescription>{isEditing ? 'Altere os detalhes do seu criativo.' : 'Preencha os detalhes para criar um novo criativo.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Nome do Criativo" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
          
          <Select onValueChange={(value) => setFormData({...formData, tipo: value})} value={formData.tipo}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de Criativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Imagem">Imagem</SelectItem>
              <SelectItem value="Video">Vídeo</SelectItem>
              <SelectItem value="Carrossel">Carrossel</SelectItem>
              <SelectItem value="Texto">Texto</SelectItem>
            </SelectContent>
          </Select>

          <FunnelSelect value={formData.funil || ""} onChange={(funnelValue) => setFormData({...formData, funil: funnelValue})} />
          <Input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} key={file ? file.name : 'no-file-selected'} />
           {isEditing && creativeToEdit.arquivo_url && !file && (
             <p className="text-xs text-slate-500">Arquivo atual: <a href={creativeToEdit.arquivo_url} target="_blank" rel="noopener noreferrer" className="underline">ver arquivo</a>. Para substituir, selecione um novo.</p>
           )}
          <Input placeholder="Link Externo (Instagram, Facebook, etc.)" value={formData.link_externo} onChange={e => setFormData({...formData, link: e.target.value})} />
          <Input placeholder="Título (Headline)" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} />
          <Textarea placeholder="Texto do anúncio" value={formData.corpo_texto} onChange={e => setFormData({...formData, corpo_texto: e.target.value})} />
          <Input placeholder="Call to Action (Ex: Saiba Mais)" value={formData.cta} onChange={e => setFormData({...formData, cta: e.target.value})} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!formData.nome || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Atualizar Criativo' : 'Salvar Criativo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getIcon = (type) => {
    switch (type) {
      case 'Imagem': return <ImageIcon className="h-8 w-8 text-pink-500" />;
      case 'Video': return <Video className="h-8 w-8 text-pink-500" />;
      case 'Carrossel': return <ImageIcon className="h-8 w-8 text-purple-500" />;
      default: return <FileText className="h-8 w-8 text-slate-500" />;
    }
};

const CreateOrRenameFolderDialog = ({ open, setOpen, onAction, folderToRename, parentId, actionType, currentUserEmail }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      if (actionType === 'rename' && folderToRename) {
        setName(folderToRename.nome);
      } else {
        setName('');
      }
    }
  }, [open, actionType, folderToRename]);

  const handleConfirm = async () => {
    if (!name.trim()) {
      toast({ title: 'Nome inválido', description: 'Por favor, insira um nome para a pasta.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      if (actionType === 'rename') {
        await onAction(folderToRename.id, name);
        await ActivityLog.create({
            action: 'rename',
            item_type: 'PastaCriativos',
            item_id: folderToRename.id,
            item_name: name,
            details: { from: folderToRename.nome, to: name },
            user_email: currentUserEmail
        });
        toast({ title: 'Pasta Renomeada!', description: `A pasta foi renomeada para "${name}".` });
      } else {
        const newFolder = await onAction(name, parentId); // Assuming onAction returns the created folder
        await ActivityLog.create({
            action: 'create',
            item_type: 'PastaCriativos',
            item_id: newFolder.id,
            item_name: newFolder.nome,
            details: { parent_id: parentId },
            user_email: currentUserEmail
        });
        toast({ title: 'Pasta Criada!', description: `A pasta "${name}" foi criada.` });
      }
      setOpen(false);
    } catch (error) {
      console.error(`Erro ao ${actionType === 'rename' ? 'renomear' : 'criar'} pasta:`, error);
      toast({ title: 'Erro', description: 'Não foi possível completar a operação. Tente novamente.', variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const title = actionType === 'rename' ? 'Renomear Pasta' : 'Criar Nova Pasta';
  const buttonText = actionType === 'rename' ? 'Renomear' : 'Criar Pasta';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input 
            placeholder="Nome da Pasta" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const CreativeThumbnail = ({ creative }) => {
  const [hasError, setHasError] = useState(false);

  const isImage = creative.arquivo_url && (creative.tipo === 'Imagem' || creative.tipo === 'Carrossel');
  const isVideo = creative.arquivo_url && creative.tipo === 'Video';
  
  const renderMedia = () => {
    if (hasError) {
      return getIcon(creative.tipo);
    }
    if (isImage) {
      return (
        <img 
          src={creative.arquivo_url} 
          alt={creative.nome} 
          className="h-full w-full object-cover" 
          onError={() => setHasError(true)}
        />
      );
    }
    if (isVideo) {
      return (
        <video 
          src={`${creative.arquivo_url}#t=0.1`} // #t=0.1 helps browsers show the first frame
          className="h-full w-full object-cover"
          preload="metadata"
          muted
          onError={() => setHasError(true)}
        />
      );
    }
    return getIcon(creative.tipo);
  };


  return (
    <div className="h-32 bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
      {renderMedia()}
      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Eye className="h-8 w-8 text-white" />
      </div>
    </div>
  );
};

// Helper function placeholder for creating page URLs, assuming it's part of the routing setup
const createPageUrl = (path) => {
  // This function would typically interact with your routing library (e.g., Next.js Router, React Router)
  // For a basic setup, it might just return the path directly or append a base path.
  // Example for simple pathing:
  return `/${path.replace(/^\//, '')}`;
};

export default function CentralCriativos() {
  const [creatives, setCreatives] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // New state for current user
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
  const [editingCreative, setEditingCreative] = useState(null);
  const [previewCreative, setPreviewCreative] = useState(null);
  const [filterFormat, setFilterFormat] = useState('Todos');
  const [filterFunnel, setFilterFunnel] = useState('Funil Geral');
  const [sortConfig, setSortConfig] = useState({ key: 'created_date', direction: 'desc' });
  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderToRename, setFolderToRename] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, item: null, type: '' });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isDetailsPaneOpen, setIsDetailsPaneOpen] = useState(false); // State for details pane
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null); // Item to display in details pane
  const { toast } = useToast();
  
  // Define fetchData using useCallback to make it stable
  const fetchData = useCallback(async () => {
    try {
      const [creativesData, foldersData, userData] = await Promise.all([
        Criativo.list(),
        PastaCriativos.list(),
        base44.auth.me() // Fetch current user info
      ]);
      setCreatives(creativesData);
      setFolders(foldersData);
      setCurrentUser(userData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({ title: "Erro de Carregamento", description: "Não foi possível carregar criativos ou pastas.", variant: "destructive" });
    }
  }, [toast]); // Depend on toast

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Depend on fetchData

  // New useEffect to handle URL parameter for folderId
  useEffect(() => {
    // Only process if folders are loaded and currentFolder is not already set by URL to prevent infinite loops or premature processing
    if (folders.length > 0 && !currentFolder) { 
      const params = new URLSearchParams(window.location.search);
      const folderId = params.get('folderId');
      if (folderId) {
        const foundFolder = folders.find(f => f.id === folderId);
        if (foundFolder) {
          setCurrentFolder(foundFolder);
          setSelectedItemForDetails({ ...foundFolder, itemType: 'PastaCriativos' });
        }
      }
    }
  }, [folders, currentFolder]); // Kept currentFolder dependency for correct re-evaluation

  // This useEffect ensures currentFolder object is up-to-date in case of renames/deletions,
  // but it no longer forces setSelectedItemForDetails to currentFolder.
  useEffect(() => {
    if (currentFolder) {
      const updatedCurrentFolder = folders.find(f => f.id === currentFolder.id);
      setCurrentFolder(updatedCurrentFolder || null); // Fallback to root if folder is deleted
    }
    // setSelectedItemForDetails is managed by direct user interaction (clicks)
    // or by explicit navigation actions (e.g., handleGoBack, breadcrumbs).
  }, [folders, currentFolder]);
  
  useEffect(() => {
    setCurrentPage(1);
  }, [currentFolder, filterFormat, filterFunnel, searchQuery]);


  const handleAddNew = () => {
    setEditingCreative(null);
    setIsFormOpen(true);
  };

  const handleEdit = (creative) => {
    setEditingCreative(creative);
    setIsFormOpen(true);
  };

  const handleDelete = (creative) => {
    setDeleteConfirmation({ isOpen: true, item: creative, type: 'creative' });
  };
  
  const handleMoveToFolder = async (creativeId, targetFolderId) => {
    let updatedFoldersState = [...folders]; 
  
    // Remove creative from its current folder, if any
    const creativeCurrentFolder = updatedFoldersState.find(folder => folder.criativo_ids && folder.criativo_ids.includes(creativeId));
    if (creativeCurrentFolder) {
      updatedFoldersState = updatedFoldersState.map(folder => {
        if (folder.id === creativeCurrentFolder.id) {
          return { ...folder, criativo_ids: folder.criativo_ids.filter(id => id !== creativeId) };
        }
        return folder;
      });
    }
  
    // Add creative to the target folder
    const targetFolder = updatedFoldersState.find(f => f.id === targetFolderId);
    if (targetFolder) {
      if (targetFolder.criativo_ids && targetFolder.criativo_ids.includes(creativeId)) {
        toast({ title: 'Criativo já na pasta', description: 'Este criativo já está na pasta de destino.', variant: "info" });
        return; 
      }
      updatedFoldersState = updatedFoldersState.map(f => 
        f.id === targetFolderId ? { ...f, criativo_ids: Array.from(new Set([...(f.criativo_ids || []), creativeId])) } : f
      );
    }
  
    try {
      const updatePromises = updatedFoldersState
        .filter(f => {
          const originalFolder = folders.find(orig => orig.id === f.id);
          return JSON.stringify(originalFolder?.criativo_ids || []) !== JSON.stringify(f.criativo_ids || []);
        })
        .map(folder => PastaCriativos.update(folder.id, { criativo_ids: folder.criativo_ids }));
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        await ActivityLog.create({
            action: 'move',
            item_type: 'Criativo',
            item_id: creativeId,
            item_name: creatives.find(c => c.id === creativeId)?.nome,
            details: { from_folder_id: creativeCurrentFolder?.id || null, to_folder_id: targetFolderId },
            user_email: currentUser?.email
        });
        toast({ title: 'Criativo Movido!', description: 'O criativo foi movido para a pasta.' });
        fetchData(); 
      } else {
        toast({ title: 'Nenhuma alteração', description: 'O criativo já estava na pasta ou não houve mudança.' });
      }
    } catch (error) {
      console.error("Erro ao mover criativo:", error);
      toast({ title: "Erro ao Mover", description: "Não foi possível mover o criativo. Tente novamente.", variant: "destructive" });
    }
  };

  const handleRemoveFromFolder = async (creativeId) => {
    const sourceFolder = folders.find(f => f.criativo_ids && f.criativo_ids.includes(creativeId));
    
    if (!sourceFolder) {
      toast({ title: 'Erro', description: 'Criativo não encontrado em nenhuma pasta.', variant: "destructive" });
      return;
    }

    const updatedCriativoIds = (sourceFolder.criativo_ids || []).filter(id => id !== creativeId);
    
    try {
        await PastaCriativos.update(sourceFolder.id, { criativo_ids: updatedCriativoIds });
        await ActivityLog.create({
            action: 'move',
            item_type: 'Criativo',
            item_id: creativeId,
            item_name: creatives.find(c => c.id === creativeId)?.nome,
            details: { from_folder_id: sourceFolder.id, to_folder_id: null },
            user_email: currentUser?.email
        });
        toast({ title: 'Criativo Removido!', description: 'O criativo foi movido para a raiz.' });
        fetchData();
    } catch (error) {
        console.error("Erro ao remover criativo da pasta:", error);
        toast({ title: "Erro ao Remover", description: "Não foi possível remover o criativo da pasta.", variant: "destructive" });
    }
  };

  const handleCreateFolder = async (name, parentId) => {
    const newFolder = await PastaCriativos.create({ nome: name, parent_id: parentId });
    fetchData();
    return newFolder;
  };

  const handleRenameFolder = async (folderId, newName) => {
    await PastaCriativos.update(folderId, { nome: newName });
    fetchData();
    setFolderToRename(null);
  };

  const handleDeleteFolder = (folder) => {
    const isFolderEmpty = !(folder.criativo_ids && folder.criativo_ids.length > 0);
    const hasSubfolders = folders.some(f => f.parent_id === folder.id);

    if (!isFolderEmpty || hasSubfolders) {
      toast({
        title: "A pasta não está vazia",
        description: "Mova ou exclua todos os criativos e subpastas antes de excluir.",
        variant: "destructive",
      });
      return;
    }
    setDeleteConfirmation({ isOpen: true, item: folder, type: 'folder' });
  };

  const executeDelete = async () => {
    if (!deleteConfirmation.item) return;

    try {
      const { item, type } = deleteConfirmation;
      const action = 'delete';
      const item_type = type === 'creative' ? 'Criativo' : 'PastaCriativos';
      
      if (type === 'creative') {
        await Criativo.delete(item.id);
        toast({ title: 'Criativo Excluído!', description: 'O criativo foi removido da sua biblioteca.' });
      } else if (type === 'folder') {
        await PastaCriativos.delete(item.id);
        toast({ title: "Pasta Excluída!" });
        if (currentFolder && currentFolder.id === item.id) {
            setCurrentFolder(null); // Go to root if current folder was deleted
            setSelectedItemForDetails(null); // Clear selection as well
        }
        if (selectedItemForDetails && selectedItemForDetails.id === item.id) {
            setSelectedItemForDetails(null); // Clear details if selected item was deleted
        }
      }
      
      await ActivityLog.create({
          action,
          item_type,
          item_id: item.id,
          item_name: item.nome,
          user_email: currentUser?.email
      });

      fetchData();
    } catch (error) {
      const itemType = deleteConfirmation.type === 'creative' ? 'criativo' : 'pasta';
      console.error(`Erro ao excluir ${itemType}:`, error);
      toast({ title: `Erro ao Excluir`, description: `Não foi possível remover o ${itemType}. Tente novamente.`, variant: "destructive" });
    } finally {
      setDeleteConfirmation({ isOpen: false, item: null, type: '' });
    }
  };

  const handleMoveFolder = async (folderId, targetParentId) => {
    if (folderId === targetParentId) {
      toast({ title: 'Movimento Inválido', description: 'Não é possível mover uma pasta para dentro dela mesma.', variant: 'destructive' });
      return;
    }

    // Check for circular dependencies
    let current = folders.find(f => f.id === targetParentId);
    while (current) {
        if (current.id === folderId) {
            toast({ title: 'Movimento Inválido', description: 'Não é possível mover uma pasta para uma de suas subpastas.', variant: 'destructive' });
            return;
        }
        current = folders.find(f => f.id === current.parent_id);
    }
    
    try {
        await PastaCriativos.update(folderId, { parent_id: targetParentId });
        await ActivityLog.create({
            action: 'move',
            item_type: 'PastaCriativos',
            item_id: folderId,
            item_name: folders.find(f => f.id === folderId)?.nome,
            details: { to_parent_id: targetParentId },
            user_email: currentUser?.email
        });
        toast({ title: 'Pasta Movida!', description: 'A pasta foi movida para o novo local.' });
        fetchData();
    } catch (error) {
        console.error("Erro ao mover pasta:", error);
        toast({ title: 'Erro ao Mover', description: 'Não foi possível mover a pasta. Tente novamente.', variant: 'destructive' });
    }
  };

  const handleOnDragEnd = async (result) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;
    
    const actualId = draggableId.substring(draggableId.indexOf('-') + 1);

    // Logic for dropping a FOLDER
    if (type === 'FOLDER') {
      const draggedFolderId = actualId;
      const folderToMove = folders.find(f => f.id === draggedFolderId);

      let targetParentId = null; // Default: move to root

      if (destination.droppableId.startsWith('folder-drop-') && destination.droppableId.endsWith('-folder')) {
        targetParentId = destination.droppableId.replace('folder-drop-', '').replace('-folder', ''); // Dropped onto a specific folder card
      } else if (destination.droppableId === "root-drop-zone-folder") {
        targetParentId = null; // Dropped onto the general root area for folders
      } else if (destination.droppableId === (currentFolder ? `folder-content-${currentFolder.id}-folders` : "root-content-zone-folders")) {
        // Dropped into the current folder list (to rearrange or place at this level)
        targetParentId = currentFolder?.id || null;
      }

      // --- Validation ---
      // Prevent dropping a folder into itself
      if (targetParentId === draggedFolderId) {
          toast({ title: 'Movimento Inválido', description: 'Não é possível mover uma pasta para dentro dela mesma.', variant: 'destructive' });
          return;
      }
      // Prevent dropping a folder into one of its descendants
      const getDescendants = (folderId, allFolders) => {
          const descendants = [];
          const children = allFolders.filter(f => f.parent_id === folderId);
          for (const child of children) {
              descendants.push(child.id);
              descendants.push(...getDescendants(child.id, allFolders));
          }
          return descendants;
      };
      const descendants = getDescendants(draggedFolderId, folders);
      if (targetParentId && descendants.includes(targetParentId)) {
          toast({ title: 'Movimento Inválido', description: 'Não é possível mover uma pasta para dentro de uma de suas subpastas.', variant: 'destructive' });
          return;
      }

      // --- Execution ---
      // If the folder's parent is already the targetParentId, do nothing.
      if (folderToMove && folderToMove.parent_id === targetParentId) {
          toast({ title: 'Nenhuma alteração', description: 'A pasta já está no local de destino.', variant: 'info' });
          return;
      }
      
      if (folderToMove) { // Ensure folder exists before attempting move
          await handleMoveFolder(draggedFolderId, targetParentId);
      }
    }

    // Logic for dropping a CREATIVE
    else if (type === 'CREATIVE') {
      const creativeId = actualId;
      const creativeParentFolder = folders.find(f => f.criativo_ids && f.criativo_ids.includes(creativeId));
      
      let targetFolderId = null; // Default: move to root (remove from any folder)

      if (destination.droppableId.startsWith('folder-drop-') && destination.droppableId.endsWith('-creative')) {
        targetFolderId = destination.droppableId.replace('folder-drop-', '').replace('-creative', ''); // Dropped onto a specific folder card
      } else if (destination.droppableId === "root-drop-zone-creative") {
        targetFolderId = null; // Dropped onto the general root area for creatives
      } else if (destination.droppableId === (currentFolder ? `folder-content-${currentFolder.id}-creatives` : "root-content-zone-creatives")) {
        // Dropped into the current creative list (to rearrange or place at this level)
        targetFolderId = currentFolder?.id || null;
      }

      // --- Validation & Execution ---
      // If creative is already in the target folder, do nothing.
      if ((creativeParentFolder?.id || null) === targetFolderId) {
          toast({ title: 'Nenhuma alteração', description: 'O criativo já está no local de destino.', variant: 'info' });
          return;
      }

      // If creative was in a folder, remove it first
      if (creativeParentFolder && creativeParentFolder.id !== targetFolderId) {
          await handleRemoveFromFolder(creativeId); // Remove from old folder
      }
      
      // If there's a new target folder (not null), move it there
      if (targetFolderId) {
          await handleMoveToFolder(creativeId, targetFolderId);
      } else if (!creativeParentFolder && targetFolderId === null) {
          // If it was already in root and dropped in root again, do nothing (handled by early return, but good to re-check)
          toast({ title: 'Nenhuma alteração', description: 'O criativo já está na raiz.', variant: 'info' });
      }
    }
  };

  const handleFutureFeature = () => {
    toast({
      title: "Em breve!",
      description: "Esta funcionalidade estará disponível em breve.",
    });
  };
  
  const handleCopyLink = (itemId) => {
    const url = `${window.location.origin}${createPageUrl(`CentralCriativos?folderId=${itemId}`)}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copiado!",
      description: "O link para a pasta foi copiado para a área de transferência.",
    });
  };

  const handleGoBack = () => {
    if (!currentFolder) return;

    if (currentFolder.parent_id) {
      const parentFolder = folders.find(f => f.id === currentFolder.parent_id);
      setCurrentFolder(parentFolder || null);
    } else {
      setCurrentFolder(null); // Go to root
    }
    setSelectedItemForDetails(null); // Clear selection when going back
  };

  const breadcrumbPath = useMemo(() => {
    if (!currentFolder) return [];
    const path = [];
    let current = currentFolder;
    while (current) {
        path.unshift(current);
        current = folders.find(f => f.id === current.parent_id);
    }
    return path;
  }, [currentFolder, folders]);

  const filteredItems = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    const filteredCreatives = creatives.filter(c => 
      c.nome.toLowerCase().includes(lowerCaseQuery) &&
      (filterFormat === 'Todos' || c.tipo === filterFormat) &&
      (filterFunnel === 'Funil Geral' || c.funil === filterFunnel)
    );

    const filteredFolders = folders.filter(f => 
      f.nome.toLowerCase().includes(lowerCaseQuery)
    );

    return { filteredCreatives, filteredFolders };
  }, [searchQuery, creatives, folders, filterFormat, filterFunnel]);

  const displayedFolders = useMemo(() => {
    if (currentFolder) {
      return filteredItems.filteredFolders.filter(f => f.parent_id === currentFolder.id);
    }
    return filteredItems.filteredFolders.filter(f => !f.parent_id);
  }, [filteredItems.filteredFolders, currentFolder]);

  const filteredAndSortedCreatives = useMemo(() => {
    let displayedCreatives = [];
    const allCreativeIdsInFolders = new Set(folders.flatMap(f => f.criativo_ids || []));

    if (currentFolder) {
      const creativeIdsInFolder = currentFolder.criativo_ids || [];
      displayedCreatives = filteredItems.filteredCreatives.filter(c => creativeIdsInFolder.includes(c.id));
    } else {
      displayedCreatives = filteredItems.filteredCreatives.filter(c => !allCreativeIdsInFolders.has(c.id));
    }

    return displayedCreatives.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
  }, [filteredItems.filteredCreatives, folders, currentFolder, sortConfig]);

  const formatOptions = ['Todos', 'Imagem', 'Video', 'Carrossel', 'Texto'];
  
  const totalPages = Math.ceil(filteredAndSortedCreatives.length / ITEMS_PER_PAGE);
  const paginatedCreatives = filteredAndSortedCreatives.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleItemClick = (item, type) => {
      setSelectedItemForDetails({ ...item, itemType: type });
  };
  
  const handleFolderClick = (folder) => {
    // Set the folder as the selected item for the details pane
    setSelectedItemForDetails({ ...folder, itemType: 'PastaCriativos' });
    // Navigate into the folder
    setCurrentFolder(folder);
  };

  const renderGrid = () => (
    <>
      {displayedFolders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Pastas</h2>
          <Droppable droppableId={currentFolder ? `folder-content-${currentFolder.id}-folders` : "root-content-zone-folders"} direction="horizontal" isDropDisabled={searchQuery !== ''} type="FOLDER">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {displayedFolders.map((folder, index) => {
                  const getDescendants = (folderId, allFolders) => {
                      const descendants = [];
                      const children = allFolders.filter(f => f.parent_id === folderId);
                      for (const child of children) {
                          descendants.push(child.id);
                          descendants.push(...getDescendants(child.id, allFolders));
                      }
                      return descendants;
                  };
                  const descendantIds = getDescendants(folder.id, folders);
                  const possibleParentFolders = folders.filter(f => f.id !== folder.id && f.id !== folder.parent_id && !descendantIds.includes(f.id));
                  const canMoveToRoot = !!folder.parent_id;
                  const hasMoveOptions = canMoveToRoot || possibleParentFolders.length > 0;
                  return (
                    <Draggable key={'folder-' + folder.id} draggableId={'folder-' + folder.id} index={index} isDragDisabled={searchQuery !== ''} type="FOLDER">
                      {(providedDraggable, snapshotDraggable) => (
                          <div
                            ref={providedDraggable.innerRef}
                            {...providedDraggable.draggableProps}
                            {...providedDraggable.dragHandleProps}
                            className={`outline-none ring-0 focus:ring-0 rounded-lg ${snapshotDraggable.isDragging ? 'shadow-2xl' : ''}`}
                          >
                          <Droppable droppableId={`folder-drop-${folder.id}-folder`} type="FOLDER">
                            {(providedDroppableFolder, snapshotDroppableFolder) => (
                              <Droppable droppableId={`folder-drop-${folder.id}-creative`} type="CREATIVE">
                                {(providedDroppableCreative, snapshotDroppableCreative) => (
                                <div 
                                    ref={(el) => { providedDroppableFolder.innerRef(el); providedDroppableCreative.innerRef(el); }} 
                                    {...providedDroppableFolder.droppableProps}
                                    {...providedDroppableCreative.droppableProps}
                                    className={`relative rounded-lg group transition-all duration-200 border-2 
                                      ${(snapshotDroppableFolder.isDraggingOver || snapshotDroppableCreative.isDraggingOver) ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 border-dashed' : 'border-transparent'}
                                      ${selectedItemForDetails?.id === folder.id && selectedItemForDetails?.itemType === 'PastaCriativos' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800'}
                                    `}
                                >
                                  <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => handleFolderClick(folder)}>
                                    <div className="flex items-center gap-3">
                                      <FolderIcon className="h-5 w-5 text-slate-500" />
                                      <span className="font-medium text-sm text-slate-800 dark:text-slate-100 truncate">{folder.nome}</span>
                                    </div>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100" onClick={(e) => e.stopPropagation()}>
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                          <Download className="mr-2 h-4 w-4" />
                                          <span>Baixar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setFolderToRename(folder); setIsFolderFormOpen(true); }}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          <span>Renomear</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                          <DropdownMenuSubTrigger>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>Compartilhar</span>
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setItemToShare(folder); setIsShareDialogOpen(true); }}>
                                              <Share2 className="mr-2 h-4 w-4" />
                                              <span>Compartilhar Link</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleCopyLink(folder.id);}}>
                                              <LinkIcon className="mr-2 h-4 w-4" />
                                              <span>Copiar link da pasta</span>
                                            </DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                         <DropdownMenuSub>
                                          <DropdownMenuSubTrigger>
                                            <FolderIcon className="mr-2 h-4 w-4" />
                                            <span>Organizar</span>
                                          </DropdownMenuSubTrigger>
                                          <DropdownMenuSubContent>
                                              <DropdownMenuSub>
                                                <DropdownMenuSubTrigger disabled={!hasMoveOptions}>
                                                  <FolderIcon className="mr-2 h-4 w-4" />
                                                  <span>Mover para</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                  {canMoveToRoot && (
                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleMoveFolder(folder.id, null);}}>
                                                      <CornerDownLeft className="mr-2 h-4 w-4" />
                                                      <span>Raiz</span>
                                                    </DropdownMenuItem>
                                                  )}
                                                  {possibleParentFolders.map(parent => (
                                                    <DropdownMenuItem key={parent.id} onClick={(e) => {e.stopPropagation(); handleMoveFolder(folder.id, parent.id);}}>
                                                      <FolderIcon className="mr-2 h-4 w-4" />
                                                      <span>{parent.nome}</span>
                                                    </DropdownMenuItem>
                                                  ))}
                                                  {!hasMoveOptions && <DropdownMenuItem disabled>Nenhuma outra pasta</DropdownMenuItem>}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                                <Star className="mr-2 h-4 w-4" />
                                                <span>Adicionar com estrela</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                                <Palette className="mr-2 h-4 w-4" />
                                                <span>Cor da pasta</span>
                                            </DropdownMenuItem>
                                          </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleItemClick(folder, 'PastaCriativos');}}>
                                          <Info className="mr-2 h-4 w-4" />
                                          <span>Informações da pasta</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder);}} className="text-red-500 focus:text-red-500">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Mover para a lixeira</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <div style={{display: 'none'}}>{providedDroppableFolder.placeholder}{providedDroppableCreative.placeholder}</div>
                                </div>
                                )}
                              </Droppable>
                            )}
                          </Droppable>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}

      {paginatedCreatives.length > 0 && (
         <div className="space-y-4">
           <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Criativos</h2>
            <Droppable droppableId={currentFolder ? `folder-content-${currentFolder.id}-creatives` : "root-content-zone-creatives"} isDropDisabled={searchQuery !== ''} type="CREATIVE"> 
            {(provided) => (
              <div 
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
              >
              {paginatedCreatives.map((creative, index) => {
                const creativeParentFolder = folders.find(f => f.criativo_ids && f.criativo_ids.includes(creative.id));
                const otherFolders = folders.filter(f => f.id !== creativeParentFolder?.id && (!currentFolder || f.id !== currentFolder.id));

                return (
                  <Draggable key={'creative-' + creative.id} draggableId={'creative-' + creative.id} index={index} isDragDisabled={searchQuery !== ''} type="CREATIVE">
                  {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${snapshot.isDragging ? 'shadow-xl rounded-lg' : ''}`}
                    >
                    <Card 
                        className={`overflow-hidden group relative cursor-pointer shadow-sm hover:shadow-lg transition-shadow isolate border-2 ${selectedItemForDetails?.id === creative.id && selectedItemForDetails?.itemType === 'Criativo' ? 'border-blue-500' : 'border-transparent'}`}
                        onClick={() => {
                            handleItemClick(creative, 'Criativo');
                            setPreviewCreative(creative);
                        }}
                    >
                        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu> {/* Removed onOpenChange, selection is persistent */}
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setPreviewCreative(creative);}}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    <span>Visualizar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleEdit(creative);}}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger>
                                    <Share2 className="mr-2 h-4 w-4" />
                                    <span>Compartilhar</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setItemToShare(creative); setIsShareDialogOpen(true); }}>
                                      <Share2 className="mr-2 h-4 w-4" />
                                      <span>Compartilhar Link</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger disabled={otherFolders.length === 0 && !creativeParentFolder}>
                                        <FolderIcon className="mr-2 h-4 w-4" />
                                        <span>Mover para</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {creativeParentFolder && (
                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleRemoveFromFolder(creative.id);}}>
                                                <CornerDownLeft className="mr-2 h-4 w-4" />
                                                <span>Raiz</span>
                                            </DropdownMenuItem>
                                        )}
                                        {otherFolders.length === 0 && !creativeParentFolder ? (
                                            <DropdownMenuItem disabled>Nenhuma outra pasta disponível</DropdownMenuItem>
                                        ) : (
                                            otherFolders.map(folder => (
                                            <DropdownMenuItem key={folder.id} onClick={(e) => {e.stopPropagation(); handleMoveToFolder(creative.id, folder.id);}}>
                                                {folder.nome}
                                            </DropdownMenuItem>
                                            ))
                                        )}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                {creativeParentFolder && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleRemoveFromFolder(creative.id);}}>
                                            <CornerDownLeft className="mr-2 h-4 w-4" />
                                            <span>Remover da pasta</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleItemClick(creative, 'Criativo');}}>
                                    <Info className="mr-2 h-4 w-4" />
                                    <span>Informações do criativo</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDelete(creative);}} className="text-red-500 focus:text-red-500">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>Excluir</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <CreativeThumbnail creative={creative} />
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm truncate">{creative.nome}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{creative.tipo} • {creative.funil || 'N/A'}</p>
                        </CardContent>
                    </Card>
                    </div>
                  )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              </div>
            )}
            </Droppable>
         </div>
      )}
    </>
  );
  
  const renderList = () => (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                    <th className="text-left font-semibold p-3 pl-4">Nome</th>
                    <th className="text-left font-semibold p-3">Proprietário</th>
                    <th className="text-left font-semibold p-3">Última modificação</th>
                    <th className="text-left font-semibold p-3"></th>
                </tr>
            </thead>
            <tbody>
                {displayedFolders.map(folder => {
                    const getDescendants = (folderId, allFolders) => {
                        const descendants = [];
                        const children = allFolders.filter(f => f.parent_id === folderId);
                        for (const child of children) {
                            descendants.push(child.id);
                            descendants.push(...getDescendants(child.id, allFolders));
                        }
                        return descendants;
                    };
                    const descendantIds = getDescendants(folder.id, folders);
                    const possibleParentFolders = folders.filter(f => f.id !== folder.id && f.id !== folder.parent_id && !descendantIds.includes(f.id));
                    const canMoveToRoot = !!folder.parent_id;
                    const hasMoveOptions = canMoveToRoot || possibleParentFolders.length > 0;
                    return (
                        <tr 
                            key={folder.id} 
                            className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${selectedItemForDetails?.id === folder.id && selectedItemForDetails?.itemType === 'PastaCriativos' ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`} 
                            onClick={() => handleFolderClick(folder)}
                        >
                            <td className="p-3 pl-4 flex items-center gap-2 font-medium"><FolderIcon className="h-5 w-5 text-slate-500" />{folder.nome}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{folder.created_by?.split('@')[0] || 'N/A'}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(folder.updated_date).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                            <Download className="mr-2 h-4 w-4" />
                                            <span>Baixar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setFolderToRename(folder); setIsFolderFormOpen(true); }}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Renomear</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Share2 className="mr-2 h-4 w-4" />
                                                <span>Compartilhar</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setItemToShare(folder); setIsShareDialogOpen(true); }}>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    <span>Compartilhar Link</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleCopyLink(folder.id);}}>
                                                    <LinkIcon className="mr-2 h-4 w-4" />
                                                    <span>Copiar link da pasta</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <FolderIcon className="mr-2 h-4 w-4" />
                                                <span>Organizar</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger disabled={!hasMoveOptions}>
                                                        <FolderIcon className="mr-2 h-4 w-4" />
                                                        <span>Mover para</span>
                                                    </DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        {canMoveToRoot && (
                                                            <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleMoveFolder(folder.id, null);}}>
                                                                <CornerDownLeft className="mr-2 h-4 w-4" />
                                                                <span>Raiz</span>
                                                            </DropdownMenuItem>
                                                        )}
                                                        {possibleParentFolders.map(parent => (
                                                            <DropdownMenuItem key={parent.id} onClick={(e) => {e.stopPropagation(); handleMoveFolder(folder.id, parent.id);}}>
                                                                <FolderIcon className="mr-2 h-4 w-4" />
                                                                <span>{parent.nome}</span>
                                                            </DropdownMenuItem>
                                                        ))}
                                                        {!hasMoveOptions && <DropdownMenuItem disabled>Nenhuma outra pasta</DropdownMenuItem>}
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                                    <Star className="mr-2 h-4 w-4" />
                                                    <span>Adicionar com estrela</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleFutureFeature();}}>
                                                    <Palette className="mr-2 h-4 w-4" />
                                                    <span>Cor da pasta</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleItemClick(folder, 'PastaCriativos');}}>
                                            <Info className="mr-2 h-4 w-4" />
                                            <span>Informações da pasta</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDeleteFolder(folder);}} className="text-red-500 focus:text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Mover para a lixeira</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    );
                })}
                {paginatedCreatives.map(creative => {
                    const creativeParentFolder = folders.find(f => f.criativo_ids && f.criativo_ids.includes(creative.id));
                    const otherFolders = folders.filter(f => f.id !== creativeParentFolder?.id && (!currentFolder || f.id !== currentFolder.id));
                    return (
                        <tr 
                            key={creative.id} 
                            className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${selectedItemForDetails?.id === creative.id && selectedItemForDetails?.itemType === 'Criativo' ? 'bg-blue-50 dark:bg-blue-900/50' : ''}`} 
                            onClick={() => {
                                handleItemClick(creative, 'Criativo');
                            }}
                            onDoubleClick={() => setPreviewCreative(creative)}
                        >
                            <td className="p-3 pl-4 flex items-center gap-2 font-medium">{getIcon(creative.tipo)} {creative.nome}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{creative.created_by?.split('@')[0] || 'N/A'}</td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">{new Date(creative.updated_date).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setPreviewCreative(creative);}}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            <span>Visualizar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleEdit(creative);}}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Editar</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Share2 className="mr-2 h-4 w-4" />
                                                <span>Compartilhar</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setItemToShare(creative); setIsShareDialogOpen(true); }}>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    <span>Compartilhar Link</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger disabled={otherFolders.length === 0 && !creativeParentFolder}>
                                                <FolderIcon className="mr-2 h-4 w-4" />
                                                <span>Mover para</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {creativeParentFolder && (
                                                    <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleRemoveFromFolder(creative.id);}}>
                                                        <CornerDownLeft className="mr-2 h-4 w-4" />
                                                        <span>Raiz</span>
                                                    </DropdownMenuItem>
                                                )}
                                                {otherFolders.length === 0 && !creativeParentFolder ? (
                                                    <DropdownMenuItem disabled>Nenhuma outra pasta disponível</DropdownMenuItem>
                                                ) : (
                                                    otherFolders.map(folder => (
                                                    <DropdownMenuItem key={folder.id} onClick={(e) => {e.stopPropagation(); handleMoveToFolder(creative.id, folder.id);}}>
                                                        {folder.nome}
                                                    </DropdownMenuItem>
                                                    ))
                                                )}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        {creativeParentFolder && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleRemoveFromFolder(creative.id);}}>
                                                    <CornerDownLeft className="mr-2 h-4 w-4" />
                                                    <span>Remover da pasta</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleItemClick(creative, 'Criativo');}}>
                                            <Info className="mr-2 h-4 w-4" />
                                            <span>Informações do criativo</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleDelete(creative);}} className="text-red-500 focus:text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Excluir</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
    <div className={`flex transition-all duration-300 ${isDetailsPaneOpen ? 'pr-[360px]' : 'pr-0'}`}>
        <div className="w-full space-y-6">
            <Droppable droppableId="root-drop-zone-folder" type="FOLDER">
              {(providedFolder, snapshotFolder) => (
                <Droppable droppableId="root-drop-zone-creative" type="CREATIVE">
                  {(providedCreative, snapshotCreative) => (
                    <div 
                      ref={(el) => { providedFolder.innerRef(el); providedCreative.innerRef(el); }} 
                      {...providedFolder.droppableProps}
                      {...providedCreative.droppableProps}
                      className={`transition-all duration-300 rounded-lg ${(snapshotFolder.isDraggingOver || snapshotCreative.isDraggingOver) ? 'bg-blue-100 dark:bg-blue-900/50 pt-4' : ''}`
                    }>
                        <div className="flex justify-between items-center flex-wrap">
                        <div className="flex items-center gap-1 text-2xl font-bold text-slate-900 dark:text-slate-50 flex-wrap">
                            <Button variant="ghost" className="px-2 text-2xl h-auto" onClick={() => { setCurrentFolder(null); setSelectedItemForDetails(null); }}>Central de Criativos</Button>
                            {breadcrumbPath.map((folder, index) => (
                            <React.Fragment key={folder.id}>
                                <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
                                <Button variant="ghost" className="px-2 text-2xl h-auto" onClick={() => { setCurrentFolder(folder); setSelectedItemForDetails({ ...folder, itemType: 'PastaCriativos' }); }} disabled={index === breadcrumbPath.length - 1}>{folder.nome}</Button>
                            </React.Fragment>
                            ))}
                        </div>
                        {(snapshotFolder.isDraggingOver || snapshotCreative.isDraggingOver) ? (
                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300 font-semibold animate-pulse mr-4"><CornerDownLeft className="h-5 w-5" /><span>Mover para a raiz</span></div>
                        ) : (
                            <div className="flex items-center gap-2 mt-4 sm:mt-0">
                            <Button variant="outline" className="gap-2" onClick={() => { setIsFolderFormOpen(true); setFolderToRename(null); }}><FolderIcon className="h-4 w-4" /> Criar Pasta</Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white"><Plus className="mr-2 h-4 w-4" /> Adicionar Criativo</Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={handleAddNew}><Computer className="mr-2 h-4 w-4" /><span>Adicionar do Computador</span></DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => toast({ title: "Em Breve!", description: "A importação de outras fontes estará disponível em breve."})}><UploadCloud className="mr-2 h-4 w-4" /><span>Importar</span></DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                        )}
                        </div>
                        <div style={{display: 'none'}}>{providedFolder.placeholder}{providedCreative.placeholder}</div>
                    </div>
                  )}
                </Droppable>
              )}
            </Droppable>
            
            <div className="flex justify-between items-center gap-2 flex-wrap">
                <div className="relative flex-grow min-w-[200px] sm:min-w-0 flex-shrink-0 mb-2 sm:mb-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input placeholder="Buscar por nome do criativo ou pasta..." className="pl-10 w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Formato: {filterFormat}</Button></DropdownMenuTrigger>
                        <DropdownMenuContent><DropdownMenuRadioGroup value={filterFormat} onValueChange={setFilterFormat}>{formatOptions.map(opt => <DropdownMenuRadioItem key={opt} value={opt}>{opt}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
                    </DropdownMenu>
                    <FunnelSelect value={filterFunnel} onChange={setFilterFunnel} />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="outline" className="gap-2"><ArrowDownUp className="h-4 w-4" /> Ordenar por</Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setSortConfig({ key: 'created_date', direction: 'desc' })}><Check className={`mr-2 h-4 w-4 ${sortConfig.key === 'created_date' && sortConfig.direction === 'desc' ? 'opacity-100' : 'opacity-0'}`} />Mais Recentes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortConfig({ key: 'nome', direction: 'asc' })}><Check className={`mr-2 h-4 w-4 ${sortConfig.key === 'nome' && sortConfig.direction === 'asc' ? 'opacity-100' : 'opacity-0'}`} />Nome (A-Z)</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                    <div className="inline-flex items-center gap-1 p-1 rounded-lg ring-1 ring-slate-200 bg-slate-100 self-center dark:ring-slate-700 dark:bg-slate-800">
                        <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                        <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setIsDetailsPaneOpen(!isDetailsPaneOpen)} disabled={!selectedItemForDetails}><Info className="h-5 w-5" /></Button>
                </div>
            </div>
            
            {viewMode === 'grid' ? renderGrid() : renderList()}

            {totalPages > 1 && ( 
              <div className="flex items-center justify-center gap-4 mt-6"> 
                <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Página {currentPage} de {totalPages}
                </span>
                <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="gap-2">
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div> 
            )}
        </div>
        <AnimatePresence>
            {isDetailsPaneOpen && selectedItemForDetails && (
                <DetailsPane 
                    isOpen={isDetailsPaneOpen} 
                    item={selectedItemForDetails} 
                    onClose={() => setIsDetailsPaneOpen(false)} 
                />
            )}
        </AnimatePresence>
        <CreativeForm open={isFormOpen} setOpen={setIsFormOpen} refreshCreatives={fetchData} creativeToEdit={editingCreative} currentUserEmail={currentUser?.email} />
        <CreateOrRenameFolderDialog open={isFolderFormOpen} setOpen={setIsFolderFormOpen} onAction={handleCreateFolder} parentId={currentFolder?.id} actionType={'create'} currentUserEmail={currentUser?.email} folderToRename={null}/>
        <CreateOrRenameFolderDialog open={!!folderToRename} setOpen={(open) => { if (!open) setFolderToRename(null); }} onAction={handleRenameFolder} folderToRename={folderToRename} actionType={'rename'} currentUserEmail={currentUser?.email} parentId={null}/>
        {previewCreative && <CreativePreviewModal open={!!previewCreative} setOpen={() => setPreviewCreative(null)} creative={previewCreative} />}
        <ShareDialog open={isShareDialogOpen} setOpen={setIsShareDialogOpen} item={itemToShare} onUpdate={fetchData} />
        <Dialog open={deleteConfirmation.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmation({ isOpen: false, item: null, type: '' })}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Confirmar Exclusão</DialogTitle>
                    <DialogDescription>
                        Você tem certeza que deseja excluir "{deleteConfirmation.item?.nome}"? Esta ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteConfirmation({ isOpen: false, item: null, type: '' })}>
                        Cancelar
                    </Button>
                    <Button variant="destructive" onClick={executeDelete}>
                        Excluir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
    </DragDropContext>
  );
}
