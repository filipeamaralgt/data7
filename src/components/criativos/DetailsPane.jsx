import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Folder as FolderIcon, FileText, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { ActivityLog } from '@/entities/ActivityLog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const getInitials = (name = "") => {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

const DetailsTab = ({ item }) => {
    if (!item) return null;
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Quem pode acessar</h3>
                {/* Placeholder para lógica de compartilhamento */}
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {/* Map over shared users here */}
                    </div>
                    <Button variant="ghost" size="sm">Gerenciar acesso</Button>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Limitações de segurança</h3>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <Shield className="h-5 w-5 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">Nenhuma limitação foi aplicada.</p>
                </div>
            </div>
            <div>
                <h3 className="text-sm font-medium text-slate-500 mb-2">Detalhes</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Tipo</span><span className="font-medium text-slate-800 dark:text-slate-200">{item.itemType === 'PastaCriativos' ? 'Pasta' : item.tipo}</span></div>
                    <div className="flex justify-between"><span>Criador</span><span className="font-medium text-slate-800 dark:text-slate-200">{item.created_by}</span></div>
                    <div className="flex justify-between"><span>Modificado</span><span className="font-medium text-slate-800 dark:text-slate-200">{new Date(item.updated_date).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span>Criado em</span><span className="font-medium text-slate-800 dark:text-slate-200">{new Date(item.created_date).toLocaleString()}</span></div>
                </div>
            </div>
        </div>
    );
};

const ActivityTab = ({ item }) => {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        if (item) {
            const fetchActivities = async () => {
                const logs = await ActivityLog.filter({ item_id: item.id }, '-created_date');
                setActivities(logs);
            };
            fetchActivities();
        }
    }, [item]);

    if (!item) return null;

    return (
        <div className="space-y-4">
            {activities.length > 0 ? activities.map(log => (
                <div key={log.id} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{getInitials(log.user_email)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm">
                            <span className="font-semibold">{log.user_email}</span>{' '}
                            {log.action === 'create' && 'criou o item'}
                            {log.action === 'update' && 'atualizou o item'}
                            {log.action === 'delete' && 'excluiu o item'}
                            {log.action === 'rename' && `renomeou o item para "${log.item_name}"`}
                            {log.action === 'move' && 'moveu o item'}
                        </p>
                        <p className="text-xs text-slate-500">{new Date(log.created_date).toLocaleString()}</p>
                        <div className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                             {item.itemType === 'PastaCriativos' ? <FolderIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                             <span className="text-sm font-medium">{log.item_name}</span>
                        </div>
                    </div>
                </div>
            )) : (
                <p className="text-sm text-slate-500">Nenhuma atividade registrada para este item.</p>
            )}
        </div>
    );
};

export default function DetailsPane({ isOpen, item, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 right-0 h-full w-[360px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-lg z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 font-semibold truncate">
                {item?.itemType === 'PastaCriativos' ? <FolderIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                <span className="truncate">{item?.nome}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <Tabs defaultValue="details" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-4 mt-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="activities">Atividades</TabsTrigger>
            </TabsList>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
                <TabsContent value="details">
                    <DetailsTab item={item} />
                </TabsContent>
                <TabsContent value="activities">
                    <ActivityTab item={item} />
                </TabsContent>
            </div>
          </Tabs>
        </motion.div>
      )}
    </AnimatePresence>
  );
}