import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, DollarSign, TrendingUp, Users } from 'lucide-react';

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
    apiGet('/analytics/plans')
      .then((res) => {
        if (!mounted) return;
        // Map API response fields to our internal shape.
        if (!Array.isArray(res)) {
          setPlans([]);
          return;
        }

        const mapped = (res as any[]).map((item) => {
          const name = item.name ?? item.plan ?? '—';
          const total_usuarios = item.total_usuarios ?? item.quantidade_usuarios ?? 0;
          const valor_arrecadado_formatado = item.valor_arrecadado_formatado ?? item.valor_arrecadado_formatted ?? (item.valor_arrecadado != null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_arrecadado) : 'R$ 0,00');
          const ticket_medio = item.ticket_medio ?? item.ticket ?? 0;
          // derive duration from plan name if not provided
          const duration_days = item.duration_days ?? (typeof name === 'string' && name.toUpperCase().includes('ANUAL') ? 360 : (typeof name === 'string' && name.toUpperCase().includes('MENSAL') ? 30 : 0));

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
          <h3 className="text-lg font-semibold">Planos Disponíveis</h3>
        </div>
        <div className="text-center">Carregando planos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Planos Disponíveis</h3>
        </div>
        <div className="text-red-500">Erro ao carregar planos: {String(error)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Resumo de Planos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans
          .filter((plan) => (plan?.total_usuarios ?? 0) > 0)
          .map((plan) => (
            <Card key={plan.id ?? plan.name} className={`relative overflow-hidden`}>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold leading-tight pr-8">{plan.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {plan.duration_days ?? 0} dias
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{(plan.total_usuarios ?? 0).toLocaleString('pt-BR')}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Usuários</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">{plan.valor_arrecadado_formatado}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">Arrecadado</div>
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Ticket Médio</span>
                  </div>
                  <div className="text-xl font-bold text-purple-700 dark:text-purple-300">R$ {(Number(plan.ticket_medio) || 0).toFixed(2)}</div>
                </div>

              </CardContent>
            </Card>
          ))}
      </div>

      {plans.filter((plan) => (plan?.total_usuarios ?? 0) > 0).length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum plano com usuários ativos encontrado</p>
        </div>
      )}
    </div>
  );
};

export default PlansSection;
