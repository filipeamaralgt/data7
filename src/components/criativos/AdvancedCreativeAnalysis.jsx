
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DollarSign, CalendarCheck2, Star, Search, Eye } from 'lucide-react';
import CreativePreviewModal from './CreativePreviewModal';
import { Criativo } from '@/entities/Criativo';

const championsData = {
  vendas: [
    { id: 1, anuncio: 'AD05_IMG_Frase', data: 4, faturado: 33000, link: 'https://www.instagram.com/p/C_12345/' },
    { id: 2, anuncio: 'ad_76_VID_Depoimento', data: 2, faturado: 9497, link: 'https://www.instagram.com/p/C_67890/' },
    { id: 3, anuncio: 'ad_02_video', data: 1, faturado: 7500, link: 'https://www.instagram.com/p/C_11111/' },
    { id: 4, anuncio: 'ad_87_SE', data: 1, faturado: 2997, link: 'https://www.instagram.com/p/C_22222/' },
    { id: 5, anuncio: 'ad_01_video', data: 1, faturado: 2997, link: 'https://www.instagram.com/p/C_33333/' },
  ],
  agendamentos: [
    { id: 6, anuncio: 'AD01_VID_Tutorial', data: 35, faturado: null, link: 'https://www.instagram.com/p/C_44444/' },
    { id: 7, anuncio: 'AD09_VID_Bastidores', data: 28, faturado: null, link: 'https://www.instagram.com/p/C_55555/' },
    { id: 8, anuncio: 'AD07_VID_Depoimento', data: 25, faturado: null, link: 'https://www.instagram.com/p/C_67890/' },
  ],
  mqls: [
    { id: 1, anuncio: 'AD01_VID_Tutorial', data: 250, faturado: null, link: 'https://www.instagram.com/p/C_44444/' },
    { id: 9, anuncio: 'AD09_VID_Bastidores', data: 120, faturado: null, link: 'https://www.instagram.com/p/C_55555/' },
    { id: 7, anuncio: 'AD07_VID_Depoimento', data: 110, faturado: null, link: 'https://www.instagram.com/p/C_67890/' },
    { id: 5, anuncio: 'AD05_IMG_Frase', data: 100, faturado: null, link: 'https://www.instagram.com/p/C_12345/' },
  ],
};

const ChampionsTable = ({ data, metric }) => {
  const isVendas = metric === 'vendas';
  const metricLabel = isVendas ? "Vendas" : metric === 'agendamentos' ? 'Agend.' : 'MQLs';

  // Find max value for bar width calculation
  const maxData = Math.max(...data.map(item => item.data));
  const maxFaturado = isVendas ? Math.max(...data.map(item => item.faturado || 0)) : 0; // Added || 0 for safety

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            <th className="text-left font-semibold p-3">Anúncio</th>
            <th className="text-center font-semibold p-3">{metricLabel}</th>
            {isVendas && <th className="text-right font-semibold p-3">Faturado</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-b border-slate-200/50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
              <td className="p-3 font-medium whitespace-nowrap">{item.anuncio}</td>
              <td className="p-3 w-32">
                <div className="flex items-center justify-end gap-2">
                  <span className="font-bold">{item.data}</span>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div 
                      className="bg-pink-500 h-2.5 rounded-full" 
                      style={{ width: `${(item.data / maxData) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              {isVendas && (
                <td className="p-3 w-40">
                   <div className="flex items-center justify-end gap-2">
                    <span className="font-bold whitespace-nowrap">{item.faturado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                      <div 
                        className="bg-rose-500 h-2.5 rounded-full" 
                        style={{ width: `${((item.faturado || 0) / maxFaturado) * 100}%` }} // Added || 0 for safety
                      ></div>
                    </div>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


const AdvancedCreativeAnalysis = () => {
  const [metric, setMetric] = useState('vendas');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewCreative, setPreviewCreative] = useState(null);
  const [allCreatives, setAllCreatives] = useState([]);

  useEffect(() => {
      const fetchCreatives = async () => {
          try {
              const creativesData = await Criativo.list();
              setAllCreatives(creativesData);
          } catch (error) {
              console.error("Error fetching creatives:", error);
              // Fallback to hardcoded creatives if fetching fails
              const hardcodedCreatives = [
                  ...championsData.vendas,
                  ...championsData.agendamentos,
                  ...championsData.mqls
              ].reduce((acc, creative) => {
                  // Ensure uniqueness by creative name if fetching from local data
                  if (!acc.some(c => c.nome === creative.anuncio)) {
                      acc.push({ id: creative.id, nome: creative.anuncio, link_externo: creative.link, tipo: 'Imagem' });
                  }
                  return acc;
              }, []);
              setAllCreatives(hardcodedCreatives);
          }
      };
      fetchCreatives();
  }, []); // Empty dependency array means this runs once on mount

  const filteredCreatives = useMemo(() => {
    return allCreatives.filter(c => c.nome.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, allCreatives]);

  const metricConfig = {
    vendas: { title: 'Vendas', icon: DollarSign, data: championsData.vendas },
    agendamentos: { title: 'Agendamentos', icon: CalendarCheck2, data: championsData.agendamentos },
    mqls: { title: 'MQLs', icon: Star, data: championsData.mqls },
  };

  const handlePreview = (creativeName) => {
      // First, try to find in the fetched `allCreatives`
      const creativeData = allCreatives.find(c => c.nome === creativeName);
      if (creativeData) {
          setPreviewCreative(creativeData);
      } else {
          // Fallback for hardcoded data if not found in fetched creatives
          const champData = [
              ...championsData.vendas, 
              ...championsData.agendamentos, 
              ...championsData.mqls
          ].find(c => c.anuncio === creativeName);
          if (champData) {
              setPreviewCreative({ id: champData.id, nome: champData.anuncio, link_externo: champData.link, tipo: 'Imagem' });
          } else {
              console.warn(`Creative with name "${creativeName}" not found for preview.`);
          }
      }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {Object.keys(metricConfig).map(key => {
          const Icon = metricConfig[key].icon;
          return (
            <Button
              key={key}
              variant={metric === key ? 'default' : 'outline'}
              onClick={() => setMetric(key)}
              className={`
                ${metric === key 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900'}
              `}
            >
              <Icon className="mr-2 h-4 w-4" />
              {metricConfig[key].title}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-slate-500"/>
              Anúncios Campeões em {metricConfig[metric].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChampionsTable data={metricConfig[metric].data} metric={metric} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-slate-500"/>
              Pesquisar Criativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar pelo nome do criativo..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-80 overflow-y-auto pr-2">
              <ul className="space-y-1">
                {filteredCreatives.map(creative => (
                  <li 
                    key={creative.id}
                    className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <span className="font-medium text-sm truncate">{creative.nome}</span>
                    <Button variant="ghost" size="sm" onClick={() => handlePreview(creative.nome)}>
                        <Eye className="mr-2 h-4 w-4"/>
                        Ver
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      <CreativePreviewModal open={!!previewCreative} setOpen={() => setPreviewCreative(null)} creative={previewCreative} />
    </>
  );
};

export default AdvancedCreativeAnalysis;
