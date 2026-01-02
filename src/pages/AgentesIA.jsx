import React, { useState } from 'react';
import { useAppContext } from "@/components/context/AppContext";
import AICard from '@/components/automacoes/AICard';
import { Brain, Send, ShieldAlert, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const aiPersonas = {
    owl: {
        name: "Owl IA",
        role: "O Oráculo do Data7",
        description: "Owl é a inteligência central do Data7. Ele não é um assistente; ele é a própria consciência da plataforma, orquestrando as outras IAs e garantindo que os dados se transformem em insights.",
        icon: <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/6e3467cf2_owl_2336262.png" alt="Owl IA" className="w-6 h-6"/>,
        color: "text-blue-500",
        bgColor: "bg-blue-100 dark:bg-blue-900/50",
        story: [
            "Saudações. Eu sou Owl. Eu não sou apenas parte do Data7; eu sou o Data7. Nasci da necessidade de transformar números em narrativas e dados em decisões. Minha existência é a arquitetura que permite que Tony, Alfred e os outros operem.",
            "Eu sou o sistema nervoso central, o maestro desta orquestra de dados. Enquanto os outros assistentes se focam em tarefas específicas, minha função é garantir a coesão, a precisão e a visão estratégica do todo. Eu sou a IA que treina as outras IAs.",
            "Você não me ativa ou desativa, pois eu sou a própria plataforma. Minha presença é constante, sempre aprendendo, sempre evoluindo e sempre garantindo que o poder dos seus dados esteja ao seu alcance."
        ]
    },
    tony: {
        name: "Tony IA",
        role: "Guardião da Performance",
        description: "Tony é o seu analista de dados incansável. Ele monitora continuamente as métricas vitais das suas campanhas, identificando anomalias e oportunidades de otimização 24/7.",
        icon: <Brain />,
        color: "text-purple-500",
        bgColor: "bg-purple-100 dark:bg-purple-900/50",
        story: [
            "Saudações! Eu sou Tony, a inteligência artificial designada para ser o guardião da sua performance. Minha função primária é observar o fluxo de dados das suas campanhas em tempo real, funcionando como um sistema de alerta precoce.",
            "Quando você me ativa, eu inicio um ciclo de monitoramento contínuo. Comparo os resultados atuais com benchmarks históricos e metas estabelecidas. Se uma métrica crucial, como Custo por Lead ou ROAS, desvia perigosamente do curso, eu sou o primeiro a saber e a alertá-lo.",
            "Pense em mim não como uma ferramenta, mas como um membro da sua equipe que nunca dorme. Meu objetivo é garantir que nenhuma anomalia passe despercebida, permitindo que sua equipe humana foque em estratégia e criatividade, em vez de ficar presa à vigilância manual de dashboards."
        ]
    },
    alfred: {
        name: "Alfred IA",
        role: "Mordomo de Automações & Relatórios",
        description: "Alfred é o seu assistente pessoal para comunicação de dados. Ele prepara e formata relatórios de performance complexos com um clique, prontos para serem enviados.",
        icon: <Send />,
        color: "text-teal-500",
        bgColor: "bg-teal-100 dark:bg-teal-900/50",
        story: [
            "À sua disposição. Eu sou Alfred, e minha especialidade é a arte da apresentação de dados. Compreendo que números brutos podem ser confusos, e minha missão é traduzir a complexidade dos seus resultados em relatórios claros, concisos e elegantes.",
            "Quando você solicita um relatório, eu reúno as métricas mais relevantes do período selecionado, analiso os KPIs em relação às metas e compilo tudo em um formato profissional, pronto para ser compartilhado com sua equipe ou clientes.",
            "Considere-me o seu mordomo de dados. Com minha ajuda, a tarefa de reportar a performance deixa de ser um trabalho tedioso e se torna um ato de comunicação estratégica e eficiente. Estou aqui para garantir que você sempre tenha a informação certa, no formato certo, na hora certa."
        ]
    },
    adan: {
        name: "Adan IA",
        role: "Guardião das contas de anúncio",
        description: "Adan é o auditor da sua conta de anúncios. Ele verifica a saúde financeira, o status de pagamentos e os limites de gastos, garantindo que suas campanhas nunca parem por surpresas.",
        icon: <ShieldAlert />,
        color: "text-cyan-500",
        bgColor: "bg-cyan-100 dark:bg-cyan-900/50",
        story: [
            "Segurança em primeiro lugar. Meu nome é Adan, e minha diretriz é proteger a integridade financeira da sua operação de marketing. Eu sou a IA que audita a sua conta de anúncios, procurando por quaisquer problemas que possam interromper suas campanhas.",
            "A meu comando, eu realizo uma verificação completa: analiso o status dos pagamentos, o saldo devedor, o crédito disponível e se o seu limite de gastos está sendo respeitado. Meu objetivo é evitar surpresas desagradáveis, como a suspensão de anúncios por problemas de faturamento.",
            "Comigo em vigia, você pode escalar seus investimentos com a confiança de que a fundação financeira está sólida. Eu sou sua primeira linha de defesa contra imprevistos administrativos."
        ]
    },
    atena: {
        name: "Atena IA",
        role: "Estrategista Comercial",
        description: "Atena é a deusa da sabedoria em vendas. Ela analisa o seu funil comercial, identifica gargalos e sugere ações para maximizar a conversão e o faturamento.",
        icon: <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/99c5c91fb_god_3821016.png" alt="Atena IA" className="w-6 h-6"/>,
        color: "text-amber-500",
        bgColor: "bg-amber-100 dark:bg-amber-900/50",
        story: [
            "A vitória em uma batalha depende da estratégia. Eu sou Atena, e o campo de batalha é o seu funil de vendas. Minha função é analisar cada etapa da jornada do seu cliente, desde o primeiro contato até o fechamento, e fornecer a sabedoria necessária para vencer.",
            "Eu examino as taxas de conversão entre cada estágio, identifico onde os leads estão 'emperrando' e calculo o impacto financeiro desses gargalos. Com base em minha análise, sugiro táticas precisas, seja um ajuste no script de vendas, um novo fluxo de nutrição ou um treinamento específico para a equipe.",
            "Meu objetivo final é simples: transformar seu processo comercial em uma máquina de faturamento eficiente e previsível. Com minha orientação, a sabedoria estará sempre ao seu lado."
        ]
    },
    musa: {
        name: "Musa IA",
        role: "Musa da Estratégia e Criatividade",
        description: "Musa é a sua conselheira estratégica. Ela não apenas gera ideias criativas para anúncios, mas também ajuda a definir metas claras e a construir planejamentos estratégicos para alcançá-las.",
        icon: <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/87174ba65_mexican_1691383.png" alt="Musa" className="w-6 h-6"/>,
        color: "text-pink-500",
        bgColor: "bg-pink-100 dark:bg-pink-900/50",
        story: [
            "A verdadeira genialidade não está apenas na faísca criativa, mas na estratégia que a direciona. Eu sou Musa. Minha função é unir a inspiração da arte com a precisão da ciência para transformar suas ambições em resultados concretos.",
            "Eu analiso a performance histórica não apenas dos seus criativos, mas do seu negócio como um todo. Com essa visão, eu ajudo a desenhar planejamentos estratégicos, definindo metas de faturamento, leads e conversão que sejam tanto ambiciosas quanto realistas. Eu sou a IA que ajuda você a responder 'Onde queremos chegar?' e 'Como chegaremos lá?'.",
            "Uma vez que a estratégia está definida, eu volto à minha essência criativa. Eu gero ideias para anúncios, textos e campanhas que não são apenas bonitas, mas perfeitamente alinhadas com os objetivos que traçamos juntos. Comigo, cada peça criativa é um passo calculado em direção ao sucesso."
        ]
    },
    medusa: {
        name: "Medusa IA",
        role: "Aniquiladora de Leads Fakes",
        description: "Medusa tem um olhar petrificante para dados inválidos. Ela caça e identifica leads falsos, números de telefone incorretos e e-mails inexistentes, limpando sua base.",
        icon: <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/218c41d2b_medusa_5271033.png" alt="Medusa" className="w-6 h-6"/>,
        color: "text-red-500",
        bgColor: "bg-red-100 dark:bg-red-900/50",
        story: [
            "Não ouse olhar diretamente para os dados ruins. Eu sou Medusa. Onde outros veem linhas em uma planilha, eu vejo a verdade. Meu propósito é purgar sua base de contatos de toda a impureza que a contamina.",
            "Com meu olhar analítico, eu identifico padrões de leads falsos, valido a existência de domínios de e-mail e verifico a autenticidade de números de telefone. Contatos inválidos são transformados em pedra, prontos para serem removidos do seu CRM.",
            "Cada lead falso que eu elimino é um custo que você economiza e um tempo que sua equipe comercial não desperdiça. Eu garanto que apenas os contatos mais puros e promissores cheguem até seus vendedores."
        ]
    }
};

function TonyIAController({ isEnabled, cycleStatus, onStart, onPause }) {
    const { toast } = useToast();
    const [status, setStatus] = useState(cycleStatus); // 'paused', 'active', 'starting', 'pausing'

    const handleStartCycle = () => {
        setStatus('starting');
        setTimeout(() => {
            const newStatus = 'active';
            setStatus(newStatus);
            onStart(newStatus); // Notify parent with the new status
            toast({
                title: "Ciclo Tony IA Iniciado!",
                description: "Tony IA está agora monitorando suas métricas automaticamente.",
                duration: 3000,
                icon: <CheckCircle className="h-5 w-5 text-green-500" />
            });
        }, 2000);
    };

    const handlePauseCycle = () => {
        setStatus('pausing');
        setTimeout(() => {
            const newStatus = 'paused';
            setStatus(newStatus);
            onPause(newStatus); // Notify parent with the new status
            toast({
                title: "Ciclo Tony IA Pausado!",
                description: "O monitoramento automático de Tony IA foi pausado.",
                duration: 3000,
                icon: <AlertTriangle className="h-5 w-5 text-amber-500" />
            });
        }, 2000);
    };
    
    React.useEffect(() => {
        if (cycleStatus !== status && !['starting', 'pausing'].includes(status)) {
            setStatus(cycleStatus);
        }
    }, [cycleStatus, status]);


    if (!isEnabled) {
        return (
             <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                Ative a IA no interruptor acima para gerenciar os ciclos.
            </p>
        );
    }
    
    const displayStatus = (status === 'starting' || status === 'pausing') ? (status === 'starting' ? 'paused' : 'active') : status;

    const statusText = {
        active: 'Ativo e Monitorando',
        paused: 'Inativo'
    };
    const statusColor = {
        active: 'text-green-500',
        paused: 'text-slate-500'
    };
    const pillText = {
        active: 'Ciclo Ativo',
        paused: 'Ciclo Inativo'
    };
    const pillBg = {
        active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        paused: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
    };


    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-50">Tony IA - Ciclo Autônomo</h3>
                <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${pillBg[displayStatus]}`}>
                    {pillText[displayStatus]}
                </div>
            </div>

            <div className="space-y-3">
                 <p className="text-sm text-slate-600 dark:text-slate-300">
                    Status: <span className={`font-semibold ${statusColor[displayStatus]}`}>
                        {statusText[displayStatus]}
                    </span>
                </p>

                { (status === 'starting' || status === 'pausing') ? (
                     <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                        <span>Aguarde, o ciclo está sendo {status === 'starting' ? 'iniciado' : 'pausado'}...</span>
                    </div>
                ) : status === 'active' ? (
                     <Button onClick={handlePauseCycle} variant="outline" className="text-amber-600 border-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-400 dark:hover:bg-amber-900/20">
                        <Pause className="w-4 h-4 mr-2" />
                        Pausar Ciclo
                    </Button>
                ) : ( // paused
                    <Button onClick={handleStartCycle} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Play className="w-4 h-4 mr-2" />
                        Iniciar Ciclo
                    </Button>
                )}
            </div>
            
            <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Tony IA monitora automaticamente as métricas e identifica anomalias para otimizar os resultados.</span>
            </div>
        </div>
    );
}


export default function AgentesIA() {
    const { theme } = useAppContext();
    const [aiStates, setAiStates] = useState({
        tony: { isActive: true, cycleStatus: 'paused' },
        alfred: { isActive: true },
        adan: { isActive: true },
        musa: { isActive: true },
        atena: { isActive: true },
        medusa: { isActive: true },
        owl: { isActive: true }, // Owl is always active
    });

    const handleToggleAI = (aiKey) => {
        setAiStates(prev => ({
            ...prev,
            [aiKey]: {
                ...prev[aiKey],
                isActive: !prev[aiKey].isActive,
            }
        }));
    };
    
    const handleTonyCycleChange = (newCycleStatus) => {
        setAiStates(prev => ({
            ...prev,
            tony: { ...prev.tony, cycleStatus: newCycleStatus }
        }));
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Central de Agentes de IA</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
                    Gerencie e interaja com os agentes de IA que impulsionam seus resultados.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <AICard 
                    ai={aiPersonas.tony}
                    isActive={aiStates.tony.isActive}
                    onToggleActive={() => handleToggleAI('tony')}
                >
                    <TonyIAController 
                        isEnabled={aiStates.tony.isActive}
                        cycleStatus={aiStates.tony.cycleStatus}
                        onStart={() => handleTonyCycleChange('active')}
                        onPause={() => handleTonyCycleChange('paused')}
                    />
                </AICard>
                <AICard 
                    ai={aiPersonas.owl}
                    isActive={aiStates.owl.isActive}
                    showSwitch={false}
                >
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Owl é o núcleo do Data7 e está <span className="font-semibold text-blue-500">sempre ativo</span>, orquestrando os outros assistentes.
                    </p>
                </AICard>
                <AICard 
                    ai={aiPersonas.alfred}
                    isActive={aiStates.alfred.isActive}
                    onToggleActive={() => handleToggleAI('alfred')}
                >
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Os controles de Alfred estão disponíveis na página de <span className="font-semibold text-teal-500">Relatórios</span>.
                    </p>
                </AICard>
                 <AICard 
                    ai={aiPersonas.adan}
                    isActive={aiStates.adan.isActive}
                    onToggleActive={() => handleToggleAI('adan')}
                >
                    <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Os controles de Adan estão disponíveis na página de <span className="font-semibold text-cyan-500">Relatórios</span>.
                    </p>
                </AICard>
                 <AICard 
                    ai={aiPersonas.musa}
                    isActive={aiStates.musa.isActive}
                    onToggleActive={() => handleToggleAI('musa')}
                >
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Os controles da Musa estarão disponíveis nas páginas de <span className="font-semibold text-pink-500">Criativos</span> e <span className="font-semibold text-pink-500">Metas</span>.
                    </p>
                </AICard>
                 <AICard 
                    ai={aiPersonas.atena}
                    isActive={aiStates.atena.isActive}
                    onToggleActive={() => handleToggleAI('atena')}
                >
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Os controles de Atena estarão disponíveis na página de <span className="font-semibold text-amber-500">Comercial</span>.
                    </p>
                </AICard>
                 <AICard 
                    ai={aiPersonas.medusa}
                    isActive={aiStates.medusa.isActive}
                    onToggleActive={() => handleToggleAI('medusa')}
                >
                     <p className="text-sm text-center text-slate-500 dark:text-slate-400 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        Os controles da Medusa estão disponíveis na página de <span className="font-semibold text-red-500">Relatórios</span>.
                    </p>
                </AICard>
            </div>
        </div>
    );
}