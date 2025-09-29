import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiGet } from "@/lib/api";
import { ArrowsRightLeftIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { DateTime } from "luxon";

type RecurringMetricsDto = {
  totalActiveSubscriptions: number;
  newSubscriptionsThisMonth: number;
  canceledSubscriptionsThisMonth: number;
  churnRate: number;
  mrr: number;
  arr: number;
};

export default function RecurringMetrics() {
  const lastThreeMonths = getLastThreeMonths().reverse(); // mais antigo -> mais recente
  const [selectedMonth, setSelectedMonth] = useState(lastThreeMonths[lastThreeMonths.length - 1]); // mês mais recente (direita)

  const { data, isLoading, isError, error } = useQuery<RecurringMetricsDto>({
    queryKey: ["analytics", "recurringmetrics", selectedMonth],
    queryFn: () => apiGet<RecurringMetricsDto>("/analytics/subscriptions", { month: selectedMonth }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      {/* Chips de seleção de mês */}
      <div className="flex gap-2">
        {lastThreeMonths.map(month => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-4 py-1 rounded-full border ${
              selectedMonth === month ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {formatMonthLabel(month)}
          </button>
        ))}
      </div>

      {/* Erro */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar métricas de recorrência. {(error as Error)?.message || ""}
          </AlertDescription>
        </Alert>
      )}

      {/* Skeleton */}
      {isLoading || !data ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Primeira linha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Assinaturas Ativas"
              value={data.totalActiveSubscriptions.toLocaleString()}
              variant="primary"
              icon={<UserGroupIcon className="w-5 h-5 text-blue-500" />}
            />
            <MetricCard
              title="Novas Assinaturas (mês)"
              value={data.newSubscriptionsThisMonth.toLocaleString()}
              variant="success"
              icon={<ArrowsRightLeftIcon className="w-5 h-5 text-green-500" />}
            />
            <MetricCard
              title="Cancelamentos (mês)"
              value={data.canceledSubscriptionsThisMonth.toLocaleString()}
              variant="warning"
              icon={<ArrowsRightLeftIcon className="w-5 h-5 text-red-500" />}
            />
          </div>

          {/* Segunda linha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              title="Taxa de Churn"
              value={`${data.churnRate.toFixed(2)}%`}
              variant="warning"
              icon={<ArrowsRightLeftIcon className="w-5 h-5 text-yellow-500" />}
            />
            <MetricCard
              title="MRR (Receita Recorrente Mensal)"
              value={formatCurrency(data.mrr)}
              variant="primary"
              icon={<CurrencyDollarIcon className="w-5 h-5 text-blue-500" />}
            />
            <MetricCard
              title="ARR (Receita Recorrente Anual)"
              value={formatCurrency(data.arr)}
              variant="success"
              subtitle="Quantidade de planos anuais vendidos neste mês com potencial de renovação no próximo ano"
              icon={<CurrencyDollarIcon className="w-5 h-5 text-green-500" />}
            />
          </div>
        </>
      )}
    </div>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatMonthLabel(monthIso: string) {
  // monthIso no formato 'yyyy-MM'
  try {
    const dt = DateTime.fromFormat(monthIso, 'yyyy-MM', { locale: 'pt-BR' });
    // Luxon retorna mês por extenso em minúsculas para 'LLLL', capitalizamos a primeira letra
    const monthName = dt.toFormat('LLLL yyyy', { locale: 'pt-BR' });
    // Capitalizar primeira letra
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  } catch (e) {
    return monthIso;
  }
}

function getLastThreeMonths(): string[] {
  const now = DateTime.now();
  return [0, 1, 2].map(i => now.minus({ months: i }).toFormat("yyyy-MM"));
}
