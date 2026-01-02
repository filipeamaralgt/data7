import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/entities/UserSettings';
import { User } from '@/entities/User';

export default function Perfil() {
  const [theme, setTheme] = useState('light');

  React.useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const user = await User.me();
      const settings = await UserSettings.filter({ created_by: user.email });
      if (settings.length > 0) {
        setTheme(settings[0].theme || 'light');
      }
    } catch (error) {
      console.error("Erro ao carregar tema", error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Perfil & Conta
      </h1>
      <Card className={`${theme === 'dark' ? 'bg-[#0F172A] ring-1 ring-[#334155]' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle>Página de Perfil e Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Gerenciamento de dados pessoais, workspaces e assinaturas em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}