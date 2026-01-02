import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/components/context/AppContext';

export default function Suporte() {
  const { theme } = useAppContext();

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Suporte
      </h1>
      <Card className={`${theme === 'dark' ? 'bg-[#0F172A] ring-1 ring-[#334155]' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>Página de Suporte</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Chat IA, FAQ e abertura de tickets em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}