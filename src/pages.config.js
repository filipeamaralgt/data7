import AgentesIA from './pages/AgentesIA';
import BibliotecaPublicos from './pages/BibliotecaPublicos';
import Campanhas from './pages/Campanhas';
import CampanhasEventos from './pages/CampanhasEventos';
import CampanhasPerpetuo from './pages/CampanhasPerpetuo';
import CentralCriativos from './pages/CentralCriativos';
import CentralLeads from './pages/CentralLeads';
import Comercial from './pages/Comercial';
import Configuracoes from './pages/Configuracoes';
import CriadorFunis from './pages/CriadorFunis';
import Criativos from './pages/Criativos';
import Custos from './pages/Custos';
import EstrategiasFunis from './pages/EstrategiasFunis';
import EstrategiasTrafego from './pages/EstrategiasTrafego';
import Funis from './pages/Funis';
import Home from './pages/Home';
import Investimento from './pages/Investimento';
import LeadsPorDia from './pages/LeadsPorDia';
import MapasMentais from './pages/MapasMentais';
import Marketing from './pages/Marketing';
import Metas from './pages/Metas';
import Nomenclaturas from './pages/Nomenclaturas';
import Notificacoes from './pages/Notificacoes';
import Perfil from './pages/Perfil';
import Publicos from './pages/Publicos';
import Relatorios from './pages/Relatorios';
import RelatoriosDaily from './pages/RelatoriosDaily';
import Seguidores from './pages/Seguidores';
import Suporte from './pages/Suporte';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AgentesIA": AgentesIA,
    "BibliotecaPublicos": BibliotecaPublicos,
    "Campanhas": Campanhas,
    "CampanhasEventos": CampanhasEventos,
    "CampanhasPerpetuo": CampanhasPerpetuo,
    "CentralCriativos": CentralCriativos,
    "CentralLeads": CentralLeads,
    "Comercial": Comercial,
    "Configuracoes": Configuracoes,
    "CriadorFunis": CriadorFunis,
    "Criativos": Criativos,
    "Custos": Custos,
    "EstrategiasFunis": EstrategiasFunis,
    "EstrategiasTrafego": EstrategiasTrafego,
    "Funis": Funis,
    "Home": Home,
    "Investimento": Investimento,
    "LeadsPorDia": LeadsPorDia,
    "MapasMentais": MapasMentais,
    "Marketing": Marketing,
    "Metas": Metas,
    "Nomenclaturas": Nomenclaturas,
    "Notificacoes": Notificacoes,
    "Perfil": Perfil,
    "Publicos": Publicos,
    "Relatorios": Relatorios,
    "RelatoriosDaily": RelatoriosDaily,
    "Seguidores": Seguidores,
    "Suporte": Suporte,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};