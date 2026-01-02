
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Plug, MessageCircle } from 'lucide-react';
import IntegrationCard from '@/components/configuracoes/IntegrationCard';
import GeneralSettings from '@/components/configuracoes/GeneralSettings';
import WhatsappSettings from '@/components/configuracoes/WhatsappSettings';

const integrations = [
    {
        id: 'meta',
        name: 'Meta Ads (Facebook)',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/8f3b5afc1_meta_60337162.png',
        description: 'Importe custos, leads e conversões das suas campanhas do Facebook e Instagram.'
    },
    {
        id: 'google_ads',
        name: 'Google Ads',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/1b99fe1e5_logo_15713432.png',
        description: 'Sincronize dados de performance das suas campanhas de pesquisa, display e Youtube.'
    },
    {
        id: 'google_sheets',
        name: 'Google Sheets',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/4cd163a60_google-sheets_2875413.png',
        description: 'Conecte planilhas para importar ou exportar dados de forma automática e flexível.'
    },
    {
        id: 'clint',
        name: 'Clint CRM',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/bf62c3cc3_image.png',
        description: 'Sincronize contatos, negócios e estágios do seu funil de vendas do Clint.'
    },
    {
        id: 'pipedrive',
        name: 'Pipedrive',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/4789696dd_image.png',
        description: 'Receba atualizações de negócios e contatos diretamente do seu Pipedrive.'
    },
    {
        id: 'rd_station',
        name: 'RD Station CRM',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/2dd5f0bd4_image.png',
        description: 'Conecte seu RD Station para sincronizar leads, oportunidades e vendas.'
    },
    {
        id: 'hotmart',
        name: 'Hotmart',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/037771c4e_image.png',
        description: 'Receba dados de vendas, assinaturas e comissões em tempo real.'
    },
    {
        id: 'kiwify',
        name: 'Kiwify',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/a84266d2a_image.png',
        description: 'Sincronize suas vendas de infoprodutos e carrinhos abandonados.'
    },
    {
        id: 'eduzz',
        name: 'Eduzz',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/ad1f68014_image.png',
        description: 'Integre suas vendas, afiliados e faturas da Eduzz diretamente na plataforma.'
    },
    {
        id: 'greenn',
        name: 'Greenn',
        logo: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68df572b1ddb88e340d9aa6a/299c23726_image.png',
        description: 'Conecte sua conta Greenn para importar dados de vendas e performance.'
    }
];

export default function Configuracoes() {
    const [activeTab, setActiveTab] = useState('geral');
    const [connectionStatus, setConnectionStatus] = useState({
        meta: true,
        google_ads: false,
        hotmart: true,
        pipedrive: false,
        kiwify: true,
    });

    const handleConnect = (id) => {
        setConnectionStatus(prev => ({ ...prev, [id]: !prev[id] }));
        // Em uma aplicação real, aqui seria iniciada a rotina de OAuth
        alert(`Simulando ${connectionStatus[id] ? 'desconexão' : 'conexão'} para ${id}`);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                    Configurações
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
                    Gerencie suas preferências, integrações e dados da conta.
                </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 sm:w-[500px] h-12 p-1">
                    <TabsTrigger value="geral" className="h-full text-sm">
                        <Settings className="w-5 h-5 mr-2" />
                        Geral
                    </TabsTrigger>
                    <TabsTrigger value="integracoes" className="h-full text-sm">
                        <Plug className="w-5 h-5 mr-2" />
                        Integrações
                    </TabsTrigger>
                    <TabsTrigger value="whatsapp" className="h-full text-sm">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="geral" className="mt-6">
                    <GeneralSettings />
                </TabsContent>

                <TabsContent value="integracoes" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {integrations.map(integration => (
                            <IntegrationCard
                                key={integration.id}
                                {...integration}
                                isConnected={!!connectionStatus[integration.id]}
                                onConnect={() => handleConnect(integration.id)}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-6">
                    <WhatsappSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}
