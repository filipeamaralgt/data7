
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function LeadsMetricCard({
  icon,
  title,
  value,
  goal,
  unit = '',
  mediaDia,
  metaDia
}) {
  const hasGoal = goal !== undefined;
  const progress = hasGoal && goal > 0 ? (parseFloat(value) / goal) * 100 : 0;
  const progressValue = Math.min(progress, 100);

  const isPercentageMetric = unit === '%';
  const displayValue = isPercentageMetric ? `${parseFloat(value).toFixed(1)}${unit}` : parseFloat(value).toLocaleString('pt-BR');
  
  return (
    <Card className="p-4 flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm">
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Header */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
          </div>
          {hasGoal && (
            <span className="text-xs font-bold text-green-600 whitespace-nowrap">{progress.toFixed(0)}%</span>
          )}
        </div>

        {/* Main Value */}
        <div className="flex-1 my-1 text-center">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{displayValue}</p>
        </div>

        {/* Progress Bar with Labels */}
        {hasGoal && !isPercentageMetric && (
          <div className="mb-1">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{parseFloat(value).toLocaleString('pt-BR')}</span>
              <span className="font-medium">Meta: {parseFloat(goal).toLocaleString('pt-BR')}</span>
            </div>
            <Progress value={progressValue} className="h-1.5 [&>div]:bg-green-500" />
          </div>
        )}
        
        {/* Progress Bar for Percentage without labels */}
         {hasGoal && isPercentageMetric && (
          <div className="mb-1">
            <Progress value={progressValue} className="h-1.5 [&>div]:bg-green-500" />
          </div>
        )}

        {/* Daily Avg vs. Goal */}
        {(mediaDia !== undefined && metaDia !== undefined) && (
            <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-auto">
                <div className='text-center'>
                    <p className='text-slate-500 dark:text-slate-400 font-medium text-xs'>Média/dia</p>
                    <p className='font-bold text-slate-800 dark:text-slate-200 mt-0.5'>{Math.round(mediaDia).toLocaleString('pt-BR')}</p>
                </div>
                <div className='text-center'>
                    <p className='text-slate-500 dark:text-slate-400 font-medium text-xs'>Meta/dia</p>
                    <p className='font-bold text-slate-800 dark:text-slate-200 mt-0.5'>{Math.round(metaDia).toLocaleString('pt-BR')}</p>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
