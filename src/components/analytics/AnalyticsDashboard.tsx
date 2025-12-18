import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  Calendar,
  AlertCircle
} from "lucide-react";

import { MetricCard } from "./MetricCard";
import { SalesChart } from "./SalesChart";
import { RegistersTable } from "./RegistersTable";
import PlansSection from './PlansSection';
import PaymentMethodsChart from "./PaymentMethodsChart";

import { 
  useRegistrations, 
  useSales
} from "@/hooks/use-analytics";
import { Period } from "@/types/analytics";
import RecurringMetrics from "./RecurringMetrics";

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [salesPeriod, setSalesPeriod] = useState<Period>('365d');

  const { data: registrations, isLoading: loadingReg, isError: errorReg } = useRegistrations(selectedPeriod);
  const { data: salesData, isLoading: loadingSales } = useSales(salesPeriod);

  if (errorReg) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do analytics. Verifique a conexão com a API.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Normalizar dados para suportar estrutura antiga (snake_case) e nova (camelCase)
  const regNorm = {
    totalUsuarios: registrations?.totalUsuarios ?? registrations?.total_usuarios ?? 0,
    cadastros: {
      hoje: registrations?.cadastros?.hoje ?? registrations?.cadastros_hoje ?? 0,
      ultimos7dias: registrations?.cadastros?.ultimos7dias ?? registrations?.cadastros_7_dias ?? 0,
      ultimos30dias: registrations?.cadastros?.ultimos30dias ?? registrations?.cadastros_30_dias ?? 0,
    },
    vendas: {
      totalConfirmadas: registrations?.vendas?.totalConfirmadas ?? registrations?.vendas_confirmadas ?? 0,
      hoje: registrations?.vendas?.hoje ?? registrations?.vendas_hoje ?? 0,
      valorHoje: registrations?.vendas?.valorHoje ?? registrations?.valor_vendas_confirmadas_hoje_formatado ?? 'R$ 0,00',
      valorTotal: registrations?.vendas?.valorTotal ?? registrations?.valor_total_vendas_hoje_formatado ?? 'R$ 0,00',
      valorReembolsos: registrations?.vendas?.valorReembolsos ?? (registrations as any)?.valor_reembolsos_formatado ?? null,
      valorPedidosHoje: registrations?.vendas?.valorPedidosHoje ?? (registrations as any)?.valor_pedidos_hoje_formatado ?? null,
    },
    conversao: {
      taxaGeral: registrations?.conversao?.taxaGeral ?? (registrations?.taxa_conversao_geral ? String(registrations.taxa_conversao_geral) + '%' : undefined),
      taxaHoje: registrations?.conversao?.taxaHoje ?? (registrations?.taxa_conversao_hoje ? String(registrations.taxa_conversao_hoje) + '%' : undefined),
    },
    ticketMedio: registrations?.ticketMedio ?? registrations?.ticket_medio_formatado ?? 'R$ 0,00',
    periodoAnalise: registrations?.periodoAnalise ?? registrations?.periodo_analise ?? null,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatório de Vendas</h1>
          <p className="text-muted-foreground">Questões +</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Card principal */}
        <div className="lg:col-span-2">
  <Card className="relative overflow-hidden  rounded-3xl bg-gradient-to-r from-green-50 to-green-100">
    {/* Ícone de fundo suavizado */}
    <div className="absolute -right-16 -top-16 opacity-10 scale-110">
      <ShoppingCart className="w-56 h-56 text-green-400" />
    </div>

    <CardContent className="p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
        <div>
          <h3 className="text-xl font-semibold text-green-900">Valor Efetivamente Pago</h3>
          <p className="text-sm text-green-700 mt-1">Desde o Lançamento</p>
        </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-baseline gap-2">
              <div className="text-5xl md:text-6xl font-bold text-green-950">
                {loadingReg ? <Skeleton className="h-10 w-48" /> : (
                  regNorm.vendas.valorTotal || registrations?.valor_efetivamente_pago_formatado || 'R$ 0,00'
                )}
              </div>
              <span className="text-sm text-green-800">total</span>
            </div>

            {/* Mostrar valor de reembolsos abaixo do valor total se disponível */}
            {(!loadingReg && regNorm.vendas.valorReembolsos) && (
              <div className="text-sm text-green-800">
                *Valor de {regNorm.vendas.valorReembolsos} em Rembolsos
              </div>
            )}
          </div>
      </div>

      {/* Subcards internos */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Pedidos", value: regNorm.vendas.totalConfirmadas },
          { label: "Ticket Médio", value: regNorm.ticketMedio },
          { label: "Conversão", value: regNorm.conversao.taxaGeral || (registrations?.taxa_conversao_geral ? String(registrations.taxa_conversao_geral) + '%' : '0%') },
          { label: "Cadastros Totais", value: regNorm.totalUsuarios  },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center p-5 bg-white/90 backdrop-blur-sm rounded-2xl shadow hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-sm font-medium text-green-700">{item.label}</div>
            <div className="text-lg md:text-xl font-semibold text-green-900 mt-1">
              {loadingReg ? <Skeleton className="h-6 w-20" /> : item.value || 0}
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
</div>

     
        
      </div>

      {/* Period-specific metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Cadastros Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (regNorm.cadastros.hoje || 0)}
          subtitle="Novos usuários hoje"
          icon={<Calendar className="h-4 w-4" />}
        />

        <MetricCard
          title={`Cadastros (${selectedPeriod})`}
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : 
        selectedPeriod === '7d' ? (regNorm.cadastros.ultimos7dias || 0) :
        (regNorm.cadastros.ultimos30dias || 0)
          }
          subtitle={`Novos no período de ${selectedPeriod}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <MetricCard
          title="Vendas Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (regNorm.vendas.hoje || 0)}
          subtitle="Vendas confirmadas hoje"
          icon={<BarChart3 className="h-4 w-4" />}
        />

        <MetricCard
          title="Valor de Vendas"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (regNorm.vendas.valorHoje || 'R$ 0,00')}
          subtitle="Vendas confirmadas hoje"
          icon={<DollarSign className="h-4 w-4" />}
        />

        <MetricCard
          title="Valor Total"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (regNorm.vendas.valorPedidosHoje || 'R$ 0,00')}
          subtitle="Vendas totais de hoje"
          icon={<ShoppingCart className="h-4 w-4" />}
        />

        {/* Card de Conversão Diária */}
       <MetricCard
          title="Taxa de Conversão Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (regNorm.conversao.taxaHoje || '0%')}
          subtitle="Comparado à taxa geral"
          trend={(() => {
            if (!registrations) return undefined as any;
            // prefer número original se disponível
            const hojeNum = typeof registrations.taxa_conversao_hoje === 'number' ? registrations.taxa_conversao_hoje : (regNorm.conversao.taxaHoje ? parseFloat(String(regNorm.conversao.taxaHoje).replace('%','').replace(',','.')) : 0);
            const geralNum = typeof registrations.taxa_conversao_geral === 'number' ? registrations.taxa_conversao_geral : (regNorm.conversao.taxaGeral ? parseFloat(String(regNorm.conversao.taxaGeral).replace('%','').replace(',','.')) : 0);
            return {
              value: hojeNum,
              isPositive: hojeNum > geralNum,
              label: ""
            };
          })()}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <PaymentMethodsChart />
      <PlansSection />
      <RecurringMetrics />

      {/* Sales chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Vendas</h2>

        {(() => {
          if (loadingSales) {
            return (
              <Card>
                <CardContent>
                  <Skeleton className="h-[300px] w-full" />
                </CardContent>
              </Card>
            );
          } else if (salesData) {
            return (
              <div>
                {/* Mobile / small viewport period selector (since SalesChart hides buttons on xs) */}
                <div className="flex items-center gap-2 mb-3 sm:hidden">
                  <label
                    className="text-sm text-muted-foreground"
                    htmlFor="sales-period-selector"
                  >
                    Período:
                  </label>
                  <div className="inline-flex rounded-md bg-muted/5 p-1" id="sales-period-selector">
                    {(['7d', '30d', '90d', '365d'] as Period[]).map((p) => {
                      const active = salesPeriod === p;
                      const labels = { '7d': '7d', '30d': '30d', '90d': '90d', '365d': '1a' };
                      return (
                        <button
                          key={p}
                          onClick={() => setSalesPeriod(p)}
                          className={"px-3 py-1 text-xs rounded-md font-medium " + (active ? "bg-primary text-white" : "text-muted-foreground")}
                        >
                          {labels[p]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <SalesChart 
                  data={salesData}
                  period={salesPeriod}
                  onPeriodChange={(p) => setSalesPeriod(p)}
                />
              </div>
            );
          } else {
            return (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">Dados de vendas não disponíveis</p>
                </CardContent>
              </Card>
            );
          }
        })()}
      </div>

      {/* Registers Table */}
      <div className="space-y-4">
        <RegistersTable />
      </div>
    </div>
  );
}
