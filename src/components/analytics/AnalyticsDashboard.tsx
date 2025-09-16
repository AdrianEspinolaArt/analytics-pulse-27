import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target, 
  ShoppingCart,
  AlertCircle,
  Calendar,
  RefreshCw
} from "lucide-react";

import { MetricCard } from "./MetricCard";
import { SalesChart } from "./SalesChart";
import { RegistersTable } from "./RegistersTable";
import PlansSection from './PlansSection';
import { UserStreaksList } from "./UserStreaksList";

import { 
  useRegistrations, 
  useConversion, 
  useSales, 
  useSalesMonthly, 
  useCustomers 
} from "@/hooks/use-analytics";
import { Period } from "@/types/analytics";
import PaymentMethodsChart from "./PaymentMethodsChart";

export function AnalyticsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30d');
  const [salesPeriod, setSalesPeriod] = useState<Period>('15d');

  // Data hooks
  const { data: registrations, isLoading: loadingReg, isError: errorReg } = useRegistrations(selectedPeriod);
  const { data: conversion, isLoading: loadingConv, isError: errorConv } = useConversion();
  const { data: customers, isLoading: loadingCust, isError: errorCust } = useCustomers();
  const { data: salesDaily, isLoading: loadingSalesDaily } = useSales(
    salesPeriod.includes('m') ? undefined : salesPeriod
  );
  const { data: salesMonthly, isLoading: loadingSalesMonthly } = useSalesMonthly(
    salesPeriod.includes('m') ? salesPeriod : undefined
  );

  const isMonthlyView = salesPeriod.includes('m');
  const salesData = isMonthlyView ? salesMonthly : salesDaily;
  const loadingSales = isMonthlyView ? loadingSalesMonthly : loadingSalesDaily;

  const hasError = errorReg || errorConv || errorCust;

  if (hasError) {
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
          <h1 className="text-3xl font-bold text-foreground">Relátorio de Vendas</h1>
          <p className="text-muted-foreground">Questões +</p>
        </div>
      </div>

      {/* Key metrics cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Usuários"
          value={loadingReg ? <Skeleton className="h-7 w-16" /> : (registrations?.total_usuarios || 0)}
          subtitle="Usuários cadastrados"
          icon={<Users className="h-4 w-4" />}
          variant="primary"
        />
        
        <MetricCard
          title="Vendas Confirmadas"
          value={loadingReg ? <Skeleton className="h-7 w-16" /> : (registrations?.vendas_confirmadas || 0)}
          subtitle={registrations?.valor_efetivamente_pago_formatado}
          trend={registrations && {
            value: registrations.taxa_conversao_geral,
            isPositive: registrations.taxa_conversao_geral > 20,
            label: "conversão geral"
          }}
          icon={<ShoppingCart className="h-4 w-4" />}
          variant="success"
        />

        <MetricCard
          title="Taxa de Conversão"
          value={loadingConv ? <Skeleton className="h-7 w-16" /> : 
            (conversion ? `${conversion.users.conversionRate.toFixed(1)}%` : 'N/A')
          }
          subtitle="Usuários que compraram"
          trend={conversion && {
            value: conversion.users.conversionRate,
            isPositive: conversion.users.conversionRate > 15,
            label: "média do setor"
          }}
          icon={<Target className="h-4 w-4" />}
          variant="info"
        />

        <MetricCard
          title="Ticket Médio"
          value={loadingReg ? <Skeleton className="h-7 w-16" /> : (registrations?.ticket_medio_formatado || 'N/A')}
          subtitle="Valor médio por venda"
          trend={registrations && {
            value: registrations.ticket_medio > 75 ? 15 : -5,
            isPositive: registrations.ticket_medio > 75,
            label: "vs mês anterior"
          }}
          icon={<DollarSign className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Period specific metrics */}
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
            (registrations?.cadastros_30_dias || 0)
          }
          subtitle={`Novos no período de ${selectedPeriod}`}
          icon={<TrendingUp className="h-4 w-4" />}
        />

        <MetricCard
          title="Vendas Hoje"
          value={loadingReg ? <Skeleton className="h-6 w-12" /> : (registrations?.vendas_hoje || 0)}
          subtitle="Vendas confirmadas hoje"
          trend={registrations && {
            value: registrations.taxa_conversao_hoje,
            isPositive: registrations.taxa_conversao_hoje > registrations.taxa_conversao_geral,
            label: "conversão hoje"
          }}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <PaymentMethodsChart />
      <PlansSection />

      {/* Sales chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Vendas</h2>
          <Select value={salesPeriod} onValueChange={(v) => setSalesPeriod(v as Period)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="15d">Últimos 15 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="3m">Últimos 3 meses</SelectItem>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loadingSales ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ) : salesData ? (
          <SalesChart 
            data={salesData}
            type={isMonthlyView ? 'monthly' : 'daily'}
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Dados de vendas não disponíveis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      
      <div className="space-y-4">
        <RegistersTable />
        
      </div>

    </div>
    
  );
}