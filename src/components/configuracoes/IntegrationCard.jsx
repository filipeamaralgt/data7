import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Settings } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function IntegrationCard({ logo, name, description, isConnected, onConnect }) {
  return (
    <Card className="dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 flex flex-col h-full hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6 flex-grow flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 flex-shrink-0 grid place-items-center rounded-lg bg-white p-1.5 shadow-sm border border-slate-100 dark:border-transparent">
            <img src={logo} alt={`${name} logo`} className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-400'
              )}></span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isConnected ? 'Conectado' : 'Não conectado'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full"
          variant={isConnected ? "outline" : "default"}
          onClick={onConnect}
        >
          {isConnected ? (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Gerenciar
            </>
          ) : (
            <>
              Conectar Agora
              <ExternalLink className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}