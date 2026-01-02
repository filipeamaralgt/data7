import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function CampanhasPerpetuo() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Campanhas de Perpétuo
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
          Gerencie e analise suas campanhas de vendas contínuas.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral do Perpétuo</CardTitle>
          <CardDescription>
            Acompanhe a performance das suas campanhas evergreen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 dark:text-slate-400 py-12">
            <p>Conteúdo da página de Campanhas de Perpétuo em breve.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}