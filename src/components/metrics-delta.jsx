
import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/** ===== Utils ===== */
export function previousRangeOf(currentStart, currentEnd) {
  const ms = currentEnd.getTime() - currentStart.getTime();
  const prevEnd = new Date(currentStart.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - ms);
  return { prevStart, prevEnd };
}

export function pctDelta(current, previous) {
  if (previous == null || previous === 0) return null; // evita divisão por 0
  return ((current - previous) / previous) * 100;
}

/** ===== Badge de Variação ===== */
export function DeltaBadge({ delta, unit = "%", invertColor = false }) {
  if (delta == null || isNaN(delta)) return null;

  const isUp = delta > 0.01;
  const isDown = delta < -0.01;
  
  const isCritical = Math.abs(delta) > 10;

  // Determine color based on performance (good, warning, bad, neutral)
  let performance;
  if (isUp) {
    performance = invertColor ? (isCritical ? 'bad' : 'warning') : 'good';
  } else if (isDown) {
    performance = invertColor ? 'good' : (isCritical ? 'bad' : 'warning');
  } else {
    performance = 'neutral';
  }

  const colorConfig = {
    good: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    bad: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
    neutral: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  };

  const color = colorConfig[performance];
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const value = Math.abs(delta).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  const sign = isUp ? "+" : isDown ? "−" : "";

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{`${sign}${value}${unit}`}</span>
    </div>
  );
}


/** ===== Card de Métrica com Delta ===== */
export function MetricCard({
  icon,
  iconBg,
  label,
  value,
  delta,
  deltaUnit = "%",
  invertGood = false,
  simple = false,
}) {
  const containerClasses = simple ? '' : `
    p-4 rounded-xl transition-all duration-300
    bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm
    hover:bg-slate-50/30 dark:hover:bg-slate-800/20 hover:shadow-lg hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-700
  `;
  
  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-start mb-3">
        <div className={`w-9 h-9 rounded-lg grid place-items-center ${iconBg}`}>
          {icon}
        </div>
        <DeltaBadge delta={delta} unit={deltaUnit} invertColor={invertGood} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1 truncate">
          {value}
        </p>
      </div>
    </div>
  );
}

/** ===== Exemplo de uso rápido =====
 * Importe onde renderiza seus cards:
 *
 * import { MetricCard, pctDelta } from "@/components/metrics-delta";
 * import { Banknote, ShoppingCart } from "lucide-react";
 *
 * const atual = 45_600;  // vindo do backend (ex.: investimento atual)
 * const anterior = 40_600; // mesmo período anterior
 * const delta = pctDelta(atual, anterior); // -> +12,3%
 *
 * <MetricCard
 *   icon={<Banknote className="w-5 h-5 text-slate-700" />}
 *   iconBg="bg-slate-100"
 *   label="Investimento"
 *   value="R$ 45.6k"
 * />
 *
 * // Para métricas onde "menor é melhor" (ex.: CPA):
 * const cpaAtual = 536.47;
 * const cpaAnterior = 582.10;
 * const deltaCPA = pctDelta(cpaAtual, cpaAnterior); // negativo se caiu
 *
 * <MetricCard
 *   icon={<ShoppingCart className="w-5 h-5 text-purple-700" />}
 *   iconBg="bg-purple-100"
 *   label="CPA"
 *   value={`R$ ${cpaAtual.toLocaleString("pt-BR")}`}
 *   delta={deltaCPA}
 *   invertGood
 * />
 */
