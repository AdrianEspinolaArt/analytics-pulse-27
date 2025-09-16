import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Package, Clock, DollarSign, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Plan {
  id?: string | number;
  name?: string;
  duration_days?: number;
  total_usuarios?: number;
  valor_arrecadado_formatado?: string;
  ticket_medio?: number;
}

export const PlansSection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiGet("/analytics/plans")
      .then((res) => {
        if (!mounted) return;
        if (!Array.isArray(res)) {
          setPlans([]);
          return;
        }

        const mapped = res.map((item: any) => {
          const name = item.name ?? item.plan ?? "—";
          const total_usuarios =
            item.total_usuarios ?? item.quantidade_usuarios ?? 0;
          const valor_arrecadado_formatado =
            item.valor_arrecadado_formatado ??
            item.valor_arrecadado_formatted ??
            (item.valor_arrecadado != null
              ? new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.valor_arrecadado)
              : "R$ 0,00");
          const ticket_medio = item.ticket_medio ?? item.ticket ?? 0;
          const duration_days =
            item.duration_days ??
            (typeof name === "string" && name.toUpperCase().includes("ANUAL")
              ? 360
              : typeof name === "string" &&
                name.toUpperCase().includes("MENSAL")
              ? 30
              : 0);

          return {
            id: item.id ?? name,
            name,
            duration_days,
            total_usuarios,
            valor_arrecadado_formatado,
            ticket_medio,
          } as Plan;
        });

        setPlans(mapped);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Resumo de Planos</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar planos: {String(error)}
        </AlertDescription>
      </Alert>
    );
  }

  const activePlans = plans.filter((plan) => (plan?.total_usuarios ?? 0) > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Resumo de Planos</h3>
      </div>

      {activePlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlans.map((plan) => (
            <Card
              key={plan.id ?? plan.name}
              className="relative overflow-hidden border border-muted shadow-sm hover:shadow-md transition"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold">
                  {plan.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {plan.duration_days ?? 0} dias
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-blue-700 dark:text-blue-300">
                      {(plan.total_usuarios ?? 0).toLocaleString("pt-BR")}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      Usuários
                    </div>
                  </div>

                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-xl">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-1" />
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {plan.valor_arrecadado_formatado}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Arrecadado
                    </div>
                  </div>
                </div>

                <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Ticket Médio
                  </div>
                  <div className="text-lg font-bold text-purple-700 dark:text-purple-300">
                    R$ {(Number(plan.ticket_medio) || 0).toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum plano com usuários ativos encontrado</p>
        </div>
      )}
    </div>
  );
};

export default PlansSection;
