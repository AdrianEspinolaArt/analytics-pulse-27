import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiGet } from "@/lib/api";
import { ArrowsRightLeftIcon, UserGroupIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

type RecurringMetricsDto = {
  totalActiveSubscriptions: number;
  newSubscriptionsThisMonth: number;
  canceledSubscriptionsThisMonth: number;
  churnRate: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function RecurringMetrics() {
  const { data, isLoading, isError, error } = useQuery<RecurringMetricsDto>({
    queryKey: ["analytics", "recurringmetrics"],
    queryFn: () => apiGet<RecurringMetricsDto>("/analytics/recurringmetrics"),
    staleTime: 5 * 60 * 1000,
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar métricas de recorrência. {(error as Error)?.message || ""}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          subtitle="Quantidade de planos anuais vendidos neste mês com potencial de renovação no próximo mês"
          value={formatCurrency(data.arr)}
          variant="success"
          icon={<CurrencyDollarIcon className="w-5 h-5 text-green-500" />}
        />
      </div>
    </div>
  );
}