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
  useSales, 
  useSalesMonthly
} from "@/hooks/use-analytics";
import { Period } from "@/types/analytics";
import RecurringMetrics from "./RecurringMetrics";

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7d');
  const [salesPeriod, setSalesPeriod] = useState<Period>('15d');

  const { data: registrations, isLoading: loadingReg, isError: errorReg } = useRegistrations(selectedPeriod);
  const { data: salesDaily, isLoading: loadingSalesDaily } = useSales(
    salesPeriod.includes('m') ? undefined : salesPeriod
  );
  const { data: salesMonthly, isLoading: loadingSalesMonthly } = useSalesMonthly(
    salesPeriod.includes('m') ? salesPeriod : undefined
  );

  const isMonthlyView = salesPeriod.includes('m');
  const salesData = isMonthlyView ? salesMonthly : salesDaily;
  const loadingSales = isMonthlyView ? loadingSalesMonthly : loadingSalesDaily;

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

        <div className="flex items-baseline gap-2">
          <div className="text-5xl md:text-6xl font-bold text-green-950">
            {loadingReg ? <Skeleton className="h-10 w-48" /> : (registrations?.valor_efetivamente_pago_formatado || 'R$ 0,00')}
          </div>
          <span className="text-sm text-green-800">total</span>
        </div>
      </div>

      {/* Subcards internos */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: "Pedidos", value: registrations?.vendas_confirmadas },
          { label: "Ticket Médio", value: registrations?.ticket_medio_formatado },
          { label: "Conversão", value: registrations?.taxa_conversao_geral + "%" },
          { label: "Cadastros Totais", value: registrations?.total_usuarios  },
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
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.cadastros_hoje || 0)}
          subtitle="Novos usuários hoje"
          icon={<Calendar className="h-4 w-4" />}
        />

        <MetricCard
          title={`Cadastros (${selectedPeriod})`}
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : 
        selectedPeriod === '7d' ? (registrations?.cadastros_7_dias || 0) :
        (registrations?.cadastros_7_dias || 0)
          }
          subtitle={`Novos no período de ${selectedPeriod}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <MetricCard
          title="Vendas Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.vendas_hoje || 0)}
          subtitle="Vendas confirmadas hoje"
          icon={<BarChart3 className="h-4 w-4" />}
        />

        <MetricCard
          title="Valor de Vendas"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.valor_vendas_confirmadas_hoje_formatado || 0)}
          subtitle="Vendas confirmadas hoje"
          icon={<DollarSign className="h-4 w-4" />}
        />

        <MetricCard
          title="Valor Total"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.valor_total_vendas_hoje_formatado || 0)}
          subtitle="Vendas totais de hoje"
          icon={<ShoppingCart className="h-4 w-4" />}
        />

        {/* Card de Conversão Diária */}
       <MetricCard
          title="Taxa de Conversão Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.taxa_conversao_hoje + "%" || '0%')}
          subtitle="Comparado à taxa geral"
          trend={registrations && {
            value: registrations.taxa_conversao_hoje,
            isPositive: registrations.taxa_conversao_hoje > registrations.taxa_conversao_geral,
            label: ""
          }}
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
                    {(['7d','15d','30d','3m','6m'] as Period[]).map((p) => {
                      const active = salesPeriod === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setSalesPeriod(p)}
                          className={"px-3 py-1 text-xs rounded-md font-medium " + (active ? "bg-primary text-white" : "text-muted-foreground")}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <SalesChart 
                  data={salesData}
                  type={isMonthlyView ? 'monthly' : 'daily'}
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
