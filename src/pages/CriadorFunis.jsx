
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function CriadorFunis() {
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              Criador de Funis
            </h1>
            <Badge variant="outline" className="text-sm bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-700">
              Em breve
            </Badge>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
            Desenhe, simule e implemente seus funis de marketing e vendas.
          </p>
        </div>
        <Button className="mt-4 sm:mt-0">
          <Plus className="w-5 h-5 mr-2" />
          Novo Funil
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full h-[60vh] dark:bg-slate-900/70 border-dashed border-2 border-slate-300 dark:border-slate-700">
          <CardContent className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Filter className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
              Construa seu primeiro funil
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
              Use nossa ferramenta visual para arrastar e soltar etapas, definir metas e criar a jornada perfeita para seus clientes.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
