import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, FileWarning, TrendingUp, Calendar } from "lucide-react";
import { useLessonReports } from "@/hooks/use-analytics";
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

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

export function LessonReportsSection() {
  const { data, isLoading, isError, error } = useLessonReports(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
          Erro ao carregar relatórios de lições: {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // Prepare data for charts
  const reportsTimelineData = data.reportsByPeriod.map(item => ({
    date: item.date,
    reports: item.count,
  }));

  const topReasonsData = data.topReasons.map(item => ({
    name: item.reason,
    value: item.count,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FileWarning className="h-6 w-6" />
          Relatórios de Lições
        </h2>
        <p className="text-muted-foreground">
          Análise de problemas reportados pelos usuários nas últimas aulas
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Relatórios
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lições Afetadas
            </CardTitle>
            <FileWarning className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.topReportedLessons.length}</div>
            <p className="text-xs text-muted-foreground">
              Com problemas reportados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Principal Motivo
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold line-clamp-1">
              {data.topReasons[0]?.reason || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.topReasons[0]?.percentage.toFixed(1)}% dos casos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Timeline Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Relatórios por Período
            </CardTitle>
            <CardDescription>
              Evolução diária de relatórios recebidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportsTimelineData}>
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
                  dataKey="reports" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Relatórios"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Reasons Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Motivos Principais</CardTitle>
            <CardDescription>
              Distribuição dos tipos de problemas reportados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topReasonsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topReasonsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} relatórios`, 'Total']}
                />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => {
                    const item = topReasonsData.find(d => d.name === value);
                    return `${value} (${item?.value})`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Reported Lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Lições Mais Reportadas</CardTitle>
          <CardDescription>
            Aulas com maior número de problemas identificados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={data.topReportedLessons}
              layout="vertical"
              margin={{ left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis 
                dataKey="lesson_name" 
                type="category"
                tick={{ fontSize: 12 }}
                width={140}
              />
              <Tooltip />
              <Bar 
                dataKey="report_count" 
                fill="#ef4444"
                name="Relatórios"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-right">
        Última atualização: {new Date(data.metadata.lastUpdated).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
