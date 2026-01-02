
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Goal,
  Megaphone,
  Target,
  Users,
  Palette,
  Briefcase,
  FileText,
  Settings,
  LifeBuoy,
  User as UserIcon,
  ChevronDown,
  ChevronLeft,
  Brain,
  Filter,
  ClipboardList,
  BrainCircuit, // Import new icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/components/context/AppContext";

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const { theme } = useAppContext();
  const [hovered, setHovered] = useState(false);

  const isActuallyCollapsed = collapsed && !hovered;

  const mainMenuItems = [
    { icon: Home, label: "Início", path: "Home" },
    {
      icon: Filter,
      label: "Funis",
      path: "Funis",
    },
    {
      icon: Goal,
      label: "Metas",
      path: "Metas",
      subItems: [
        { label: "Performance Diária", path: "Metas?tab=diaria" },
        { label: "Performance Semanal", path: "Metas?tab=semanal" },
        { label: "Projetado vs Realizado", path: "Metas?tab=projetado" },
        { label: "Simulador de Metas", path: "Metas?tab=simulador" },
        { label: "Projeção Linear", path: "Metas?tab=projecao" },
      ],
    },
    {
      icon: Megaphone,
      label: "Marketing",
      path: "Marketing",
      subItems: [
        { label: "Relatórios Daily", path: "RelatoriosDaily" },
        // "Estratégias de Funil" moved to 'Estratégias'
        { label: "Leads por dia", path: "LeadsPorDia" },
        { label: "Custos", path: "Custos" },
        { label: "Investimento", path: "Investimento" },
        { label: "Seguidores", path: "Seguidores" },
      ],
    },
    {
      icon: Target,
      label: "Campanhas",
      path: "Campanhas",
      subItems: [
        { label: "Subir Campanhas", path: "Campanhas" }, // Renamed from "Gerenciador"
        { label: "Perpétuo", path: "CampanhasPerpetuo" },
        { label: "Eventos e Lançamentos", path: "CampanhasEventos" },
        // "Estratégias" moved to 'Estratégias' and renamed
        { label: "Nomenclaturas", path: "Nomenclaturas" },
      ],
    },
    {
      icon: BrainCircuit, // New icon for 'Estratégias'
      label: "Estratégias",
      path: "Estrategias",
      subItems: [
        { label: "Estratégias de Funil", path: "EstrategiasFunis" }, // Moved from Marketing
        { label: "Estratégias de Campanhas", path: "EstrategiasTrafego" }, // Moved from Campanhas, renamed
        { label: "Mapas Mentais", path: "MapasMentais" }, // New item
        { label: "Criador de Funis", path: "CriadorFunis" }, // New item
      ],
    },
    {
      icon: Users,
      label: "Públicos",
      path: "Publicos",
      subItems: [
        { label: "Análise de Públicos", path: "Publicos" },
        { label: "Biblioteca de Públicos", path: "BibliotecaPublicos" },
      ],
    },
    {
      icon: Palette,
      label: "Criativos",
      path: "Criativos",
      subItems: [
        { label: "Análise de Criativos", path: "Criativos" },
        { label: "Central de Criativos", path: "CentralCriativos" },
      ],
    },
    { icon: Briefcase, label: "Comercial", path: "Comercial" },
    { icon: ClipboardList, label: "Central de Leads", path: "CentralLeads" },
    { icon: Brain, label: "Agentes de IA", path: "AgentesIA" },
    { icon: Settings, label: "Configuracoes", path: "Configuracoes" },
  ];

  const footerMenuItems = [
    { icon: LifeBuoy, label: "Suporte", path: "Suporte" },
  ];

  const handleSubmenuToggle = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (item) => {
    const pageUrl = createPageUrl(item.path);
    if (location.pathname === pageUrl) return true;
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname === createPageUrl(sub.path.split('?')[0]));
    }
    return false;
  };

  const isSubItemActive = (subItemPath) => {
    const targetUrl = createPageUrl(subItemPath);
    const currentUrl = location.pathname + location.search;

    if (currentUrl === targetUrl) {
      return true;
    }
    // Specific handling for default tabs if no query param is present
    if (
      location.pathname === createPageUrl("Metas") &&
      location.search === "" &&
      subItemPath === "Metas?tab=diaria"
    ) {
      return true;
    }
    if (
      location.pathname === createPageUrl("Funis") &&
      location.search === "" &&
      subItemPath === "Funis"
    ) {
      return true;
    }
    // Added specific check for Estrategias if it's the base path without query
    if (
      location.pathname === createPageUrl("Estrategias") &&
      location.search === "" &&
      subItemPath === "EstrategiasFunis" // Assuming 'Estratégias de Funil' is the default for /Estrategias
    ) {
      return true;
    }

    // New check for Criativos and CentralCriativos
    if (
      location.pathname === createPageUrl("Criativos") &&
      location.search === "" &&
      subItemPath === "Criativos" // Assuming 'Análise de Criativos' is the default for /Criativos
    ) {
      return true;
    }
    return false;
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item);

    if (item.subItems && !isActuallyCollapsed) {
      return (
        <div key={item.path}>
          <button
            onClick={() => handleSubmenuToggle(item.path)}
            className={`group flex items-center justify-between w-full h-10 px-3 rounded-xl transition-colors duration-200 ${
              active
                ? theme === "dark" ? "bg-[#1E293B] text-white" : "bg-[#F9FAFB] text-[#0F172A]"
                : theme === "dark" ? "text-gray-400 hover:bg-[#1E293B] hover:text-white" : "text-gray-600 hover:bg-[#F9FAFB]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm tracking-tight">{item.label}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openMenus[item.path] ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openMenus[item.path] && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-7"
              >
                <div className="pt-2 space-y-1 border-l-2 border-dashed border-gray-700/50 ml-2.5">
                  {item.subItems.map(subItem => (
                     <Link
                      key={subItem.label}
                      to={createPageUrl(subItem.path)}
                      className={`flex items-center h-8 px-3 rounded-xl text-sm transition-colors duration-200 ${
                        isSubItemActive(subItem.path)
                          ? theme === "dark" ? "bg-gradient-to-r from-[#06B6D4]/20 to-[#3B82F6]/20 text-[#06B6D4]" : "bg-gradient-to-r from-[#06B6D4]/10 to-[#3B82F6]/10 text-[#06B6D4]"
                          : theme === "dark" ? "text-gray-500 hover:text-white" : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    const linkContent = (
      <Link
        key={item.path}
        to={createPageUrl(item.path)}
        className={`group flex items-center gap-3 h-10 px-3 rounded-xl transition-colors duration-200 relative ${
          isActuallyCollapsed ? "justify-center" : ""
        } ${
          active
            ? theme === "dark" ? "bg-[#1E293B] text-white" : "bg-gradient-to-r from-[#06B6D4]/10 to-[#3B82F6]/10 text-[#06B6D4]"
            : theme === "dark" ? "text-gray-400 hover:bg-[#1E293B] hover:text-white" : "text-gray-600 hover:bg-[#F9FAFB]"
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isActuallyCollapsed && <span className="font-medium text-sm tracking-tight">{item.label}</span>}
      </Link>
    );

    if (isActuallyCollapsed) {
      return (
        <Tooltip key={item.path}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">{item.label}</TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed left-0 top-0 h-screen ${
          isActuallyCollapsed ? "w-[72px]" : "w-64"
        } ${
          theme === "dark" ? "bg-[#0F172A] border-[#334155]" : "bg-white border-[#E5E7EB]"
        } border-r backdrop-blur-sm transition-all duration-300 ease-out z-40 flex flex-col`}
      >
        <div className={`h-16 flex items-center ${isActuallyCollapsed ? "justify-center px-3" : "justify-between px-5"} border-b ${theme === "dark" ? "border-[#334155]" : "border-[#E5E7EB]"}`}>
          {!isActuallyCollapsed && (
            <div className="flex items-center gap-2.5">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/18587b452_ChatGPTImage11deoutde202510_33_07.png"
                alt="Data7 Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className={`font-semibold text-base tracking-tight ${theme === "dark" ? "text-white" : "text-[#0F172A]"}`}>Data7</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={`h-8 w-8 rounded-xl transition-all duration-200 ${theme === "dark" ? "hover:bg-[#1E293B]" : "hover:bg-[#F9FAFB]"}`}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {mainMenuItems.map(renderMenuItem)}
        </nav>

        <div className="p-3">
          <div className={`my-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
          <div className="space-y-1">
            {footerMenuItems.map(renderMenuItem)}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
