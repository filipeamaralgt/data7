import React, { useState } from "react";
import { Bell, AlertTriangle, Info, XCircle, CheckCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/components/context/AppContext";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Dados mocados
const notifications = [
  {
    id: 1,
    type: "alert",
    title: "Custo por Lead subiu 20%",
    time: "2 min atrás",
    read: false,
  },
  {
    id: 2,
    type: "info",
    title: "Novo relatório semanal disponível",
    time: "1 hora atrás",
    read: false,
  },
  {
    id: 3,
    type: "error",
    title: "Falha na sincronização",
    time: "3 horas atrás",
    read: true,
  },
  {
    id: 4,
    type: "success",
    title: "Meta de MQLs atingida!",
    time: "Ontem",
    read: true,
  },
];

const icons = {
  alert: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-blue-500" />,
  error: <XCircle className="w-4 h-4 text-red-500" />,
  success: <CheckCircle className="w-4 h-4 text-green-500" />,
};

export default function NotificationBell() {
  const { theme } = useAppContext();
  const [notifs, setNotifs] = useState(notifications);
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAsRead = (id) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-80 ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : ''}`}>
        <DropdownMenuLabel className="flex justify-between items-center">
          Notificações
          <Badge variant="secondary">{unreadCount} novas</Badge>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-80 overflow-y-auto">
          {notifs.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className={`flex items-start gap-3 p-3 transition-colors ${!notif.read ? (theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50') : ''}`}
              onSelect={() => markAsRead(notif.id)}
            >
              {icons[notif.type]}
              <div className="flex-1">
                <p className="text-sm font-medium">{notif.title}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full self-center" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link to={createPageUrl('Notificacoes')} className="flex items-center justify-center cursor-pointer text-sm py-2">
                <Eye className="w-4 h-4 mr-2" />
                Ver todas as notificações
            </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}