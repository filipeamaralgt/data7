
import React, { useState, useEffect } from 'react';
import { Notificacao } from '@/entities/Notificacao';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAppContext } from '@/components/context/AppContext';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Info, AlertTriangle, XCircle, Trophy, CheckCheck } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const notificationIcons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    alerta: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    sucesso: <Trophy className="w-5 h-5 text-green-500" />,
    erro: <XCircle className="w-5 h-5 text-red-500" />,
    meta: <Trophy className="w-5 h-5 text-indigo-500" />,
};

const notificationColors = {
    info: 'border-blue-500/50',
    alerta: 'border-amber-500/50',
    sucesso: 'border-green-500/50',
    erro: 'border-red-500/50',
    meta: 'border-indigo-500/50',
};

export default function NotificacoesPage() {
    const { theme } = useAppContext();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        setLoading(true);
        const data = await Notificacao.list('-created_date', 50);
        setNotifications(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkAsRead = async (id) => {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.is_read) {
            await Notificacao.update(id, { is_read: true });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length > 0) {
            // This is a simplified approach. In a real scenario, you might need to batch updates.
            await Promise.all(unreadIds.map(id => Notificacao.update(id, { is_read: true })));
            fetchNotifications(); // Refetch to ensure state is consistent
        }
    };

    const NotificationItem = ({ notif }) => {
        const cardContent = (
            <CardContent className={`relative p-4 flex items-start gap-4 transition-all duration-300 ${!notif.is_read ? (theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50/80') : ''}`}>
                {!notif.is_read && <div className="absolute top-4 left-1 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>}
                <div className="pt-1">{notificationIcons[notif.type]}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>{notif.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap ml-4">
                            {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true, locale: ptBR })}
                        </p>
                    </div>
                    <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{notif.description}</p>
                </div>
                {!notif.is_read && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleMarkAsRead(notif.id)}>
                                    <Check className="w-4 h-4 text-slate-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Marcar como lida</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </CardContent>
        );
        
        return (
            <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
            >
                <Card className={`overflow-hidden border-l-4 ${notificationColors[notif.type]} ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white'}`}>
                    {notif.link ? (
                        <Link to={createPageUrl(notif.link)} onClick={() => handleMarkAsRead(notif.id)}>
                            {cardContent}
                        </Link>
                    ) : (
                        <div onClick={() => handleMarkAsRead(notif.id)} className="cursor-pointer">
                           {cardContent}
                        </div>
                    )}
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Bell className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Notificações</h1>
                </div>
                <Button onClick={handleMarkAllAsRead} disabled={!notifications.some(n => !n.is_read)}>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Marcar todas como lidas
                </Button>
            </div>

            {loading ? (
                <p className="text-center text-slate-500">Carregando notificações...</p>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {notifications.length > 0 ? (
                            notifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)
                        ) : (
                            <div className="text-center py-16 border border-dashed rounded-lg">
                                <Bell className="mx-auto h-12 w-12 text-slate-400" />
                                <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Nenhuma notificação por aqui</h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                                    Quando algo importante acontecer, você será notificado aqui.
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
