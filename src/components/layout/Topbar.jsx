
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, MessageCircle, Sun, Moon, Search, GalleryVertical, ChevronDown, User as UserIcon, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAppContext } from "@/components/context/AppContext";
import { User } from "@/entities/User";
import NotificationBell from "./NotificationBell";

const workspaces = [
  { value: "ws-1", label: "Workspace ACME" },
  { value: "ws-2", label: "Workspace Beta" },
  { value: "ws-3", label: "Workspace Brasil" },
];
const accounts = [
  { value: "acc-1", label: "Conta Ads #001" },
  { value: "acc-2", label: "Conta Ads #002" },
  { value: "acc-3", label: "Conta Ads #003" },
];

export default function Topbar({ onThemeToggle, collapsed, user }) {
  const { theme } = useAppContext();
  const [currentUser, setCurrentUser] = useState(user);
  
  const [workspace, setWorkspace] = useState("ws-1");
  const [account, setAccount] = useState("acc-1");

  useEffect(() => {
    // A Topbar agora recebe o usuário como prop,
    // então não precisa mais fazer sua própria chamada User.me().
    // Isso centraliza o fetch de dados no Layout principal.
    setCurrentUser(user);
  }, [user]);

  return (
    <header
      className={`fixed top-0 right-0 ${
        collapsed ? "left-[72px]" : "left-64"
      } h-16 ${
        theme === "dark" ? "bg-[#0F172A]/80 border-[#334155]" : "bg-white/80 border-[#E5E7EB]"
      } border-b backdrop-blur-md transition-all duration-300 z-30 flex items-center px-6 gap-3`}
    >
      {/* ESQUERDA: workspace + ad account */}
      <div className="flex items-center gap-3 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className={`h-9 rounded-xl flex items-center gap-2 ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-white'}`}>
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/18587b452_ChatGPTImage11deoutde202510_33_07.png" 
                alt="Data7 Logo" 
                className="w-6 h-6 rounded-lg"
              />
              <span className="truncate max-w-[150px] font-semibold">Data7</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`rounded-xl ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : ''}`}>
             <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
             <DropdownMenuSeparator />
            {workspaces.map(ws => (
              <DropdownMenuCheckboxItem key={ws.value} checked={workspace === ws.value} onSelect={() => setWorkspace(ws.value)} className="rounded-md">
                {ws.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <Button variant="outline" className={`h-9 rounded-xl flex items-center gap-2 ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : 'bg-white'}`}>
              <GalleryVertical className="w-4 h-4 text-gray-500" />
              <span className="truncate max-w-[150px]">{accounts.find(a => a.value === account)?.label}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={`rounded-xl ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : ''}`}>
            <DropdownMenuLabel>Contas de Anúncios</DropdownMenuLabel>
             <DropdownMenuSeparator />
            {accounts.map(acc => (
              <DropdownMenuCheckboxItem key={acc.value} checked={account === acc.value} onSelect={() => setAccount(acc.value)} className="rounded-md">
                {acc.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* CENTRO: busca */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-[720px] relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
            theme === "dark" ? "text-gray-500" : "text-gray-400"
          }`} />
          <Input
            type="search"
            placeholder="Buscar métricas, campanhas..."
            className={`w-full h-9 pl-10 pr-3 rounded-full border-none text-sm ${
              theme === "dark"
                ? "bg-[#334155]/50 text-white placeholder:text-gray-500 focus:bg-[#334155]"
                : "bg-[#F9FAFB] placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-gray-200"
            }`}
          />
        </div>
      </div>

      {/* DIREITA: ícones + perfil */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell />
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <HelpCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
          <MessageCircle className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onThemeToggle} className="h-9 w-9 rounded-full">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <div className={`w-px h-6 mx-2 ${theme === "dark" ? "bg-[#334155]" : "bg-[#E5E7EB]"}`} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
              {currentUser?.avatar_url ? (
                <img src={currentUser.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                 <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                 </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`w-60 rounded-xl ${theme === 'dark' ? 'bg-[#0F172A] border-[#334155]' : ''}`}>
             <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{currentUser?.full_name || "Usuário"}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-md">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => User.logout()} className="rounded-md">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
