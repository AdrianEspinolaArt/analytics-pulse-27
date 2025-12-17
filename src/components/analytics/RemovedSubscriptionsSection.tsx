import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserMinus, TrendingDown, AlertCircle, Users } from "lucide-react";
import { useRemovedSubscriptions } from "@/hooks/use-analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6'];

export function RemovedSubscriptionsSection() {
  const { data, isLoading, isError, error } = useRemovedSubscriptions(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados de cancelamentos: {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for charts
  const cancellationTrendData = data.cancellationTrend.map(item => ({
    date: item.date,
    cancelamentos: item.count,
  }));

  const reasonsData = data.cancellationReasons.map(item => ({
    name: item.reason,
    value: item.count,
    percentage: item.percentage,
  }));

  const topPlansData = data.topCancelledPlans.map(item => ({
    name: item.plan_name || `Plano ${item.plan_id.substring(0, 8)}...`,
    count: item.cancellation_count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserMinus className="h-6 w-6" />
          Cancelamentos de Assinaturas
        </h2>
        <p className="text-muted-foreground">
          Análise de churn e motivos de cancelamento dos últimos 30 dias
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Cancelado
            </CardTitle>
            <UserMinus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRemoved}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Churn
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.churnRate.rate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              {data.churnRate.period.replace('_', ' ')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assinaturas Ativas
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.churnRate.total_active_subscriptions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Base atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Principal Motivo
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold line-clamp-2">
              {data.cancellationReasons[0]?.reason || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.cancellationReasons[0]?.percentage.toFixed(1)}% dos casos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cancellation Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Cancelamentos</CardTitle>
            <CardDescription>
              Evolução diária de cancelamentos no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cancellationTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="cancelamentos" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Cancelamentos"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cancellation Reasons Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Motivos de Cancelamento</CardTitle>
            <CardDescription>
              Distribuição dos motivos reportados pelos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} cancelamentos`, 'Total']}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Cancelled Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Mais Cancelados</CardTitle>
          <CardDescription>
            Ranking dos planos com maior número de cancelamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={topPlansData}
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="name" 
                type="category"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="#ef4444"
                name="Cancelamentos"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Reasons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento dos Motivos</CardTitle>
          <CardDescription>
            Análise completa dos motivos de cancelamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.cancellationReasons.map((reason, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <p className="font-medium">{reason.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {reason.percentage.toFixed(2)}% do total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{reason.count}</p>
                  <p className="text-xs text-muted-foreground">cancelamentos</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-right">
        Última atualização: {new Date(data.metadata.lastUpdated).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
