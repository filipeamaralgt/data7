import Home from './pages/Home';
import Funis from './pages/Funis';
import Marketing from './pages/Marketing';
import Campanhas from './pages/Campanhas';
import Publicos from './pages/Publicos';
import Criativos from './pages/Criativos';
import Comercial from './pages/Comercial';
import Configuracoes from './pages/Configuracoes';
import Metas from './pages/Metas';
import Relatorios from './pages/Relatorios';
import Suporte from './pages/Suporte';
import Perfil from './pages/Perfil';
import RelatoriosDaily from './pages/RelatoriosDaily';
import Notificacoes from './pages/Notificacoes';
import LeadsPorDia from './pages/LeadsPorDia';
import Custos from './pages/Custos';
import Investimento from './pages/Investimento';
import Seguidores from './pages/Seguidores';
import AgentesIA from './pages/AgentesIA';
import EstrategiasTrafego from './pages/EstrategiasTrafego';
import Nomenclaturas from './pages/Nomenclaturas';
import EstrategiasFunis from './pages/EstrategiasFunis';
import CentralLeads from './pages/CentralLeads';
import CampanhasPerpetuo from './pages/CampanhasPerpetuo';
import CampanhasEventos from './pages/CampanhasEventos';
import MapasMentais from './pages/MapasMentais';
import CriadorFunis from './pages/CriadorFunis';
import CentralCriativos from './pages/CentralCriativos';
import BibliotecaPublicos from './pages/BibliotecaPublicos';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Funis": Funis,
    "Marketing": Marketing,
    "Campanhas": Campanhas,
    "Publicos": Publicos,
    "Criativos": Criativos,
    "Comercial": Comercial,
    "Configuracoes": Configuracoes,
    "Metas": Metas,
    "Relatorios": Relatorios,
    "Suporte": Suporte,
    "Perfil": Perfil,
    "RelatoriosDaily": RelatoriosDaily,
    "Notificacoes": Notificacoes,
    "LeadsPorDia": LeadsPorDia,
    "Custos": Custos,
    "Investimento": Investimento,
    "Seguidores": Seguidores,
    "AgentesIA": AgentesIA,
    "EstrategiasTrafego": EstrategiasTrafego,
    "Nomenclaturas": Nomenclaturas,
    "EstrategiasFunis": EstrategiasFunis,
    "CentralLeads": CentralLeads,
    "CampanhasPerpetuo": CampanhasPerpetuo,
    "CampanhasEventos": CampanhasEventos,
    "MapasMentais": MapasMentais,
    "CriadorFunis": CriadorFunis,
    "CentralCriativos": CentralCriativos,
    "BibliotecaPublicos": BibliotecaPublicos,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};