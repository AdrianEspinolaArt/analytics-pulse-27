// Sales chart component using Recharts
// Displays daily/monthly sales data with responsive design

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Calendar, TrendingUp } from "lucide-react";
import { SalesChartDto, SalesMonthlyChartDto } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: SalesChartDto | SalesMonthlyChartDto;
  type: 'daily' | 'monthly';
  className?: string;
}

export function SalesChart({ data, type, className }: SalesChartProps) {
  const chartData = 'dailyData' in data ? data.dailyData : data.monthlyData;
  const period = data.period;
  const summary = data.summary;
  
  // Format data for chart
  const formattedData = chartData.map(item => ({
    ...item,
    displayLabel: 'dateFormatted' in item ? item.dateFormatted : item.monthFormatted,
    formattedValue: new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(item.value),
    formattedTicket: new Intl.NumberFormat('pt-BR', {
      style: 'currency', 
      currency: 'BRL',
    }).format(item.averageTicket),
  }));

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatLastUpdated = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Vendas {type === 'daily' ? 'Diárias' : 'Mensais'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {type === 'daily' 
                ? `${'days' in period ? period.days : 0} dias` 
                : `${'months' in period ? period.months : 0} meses`
              }
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            {formatCurrency(summary.totalValue)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {summary.totalSales.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground">Total de Vendas</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(summary.totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">Valor Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {type === 'daily' 
                ? ('averagePerDay' in summary ? summary.averagePerDay.toFixed(0) : '0')
                : ('averagePerMonth' in summary ? summary.averagePerMonth.toFixed(0) : '0')
              }
            </div>
            <div className="text-xs text-muted-foreground">
              Média por {type === 'daily' ? 'Dia' : 'Mês'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-foreground">
              {formatCurrency(summary.averageTicket)}
            </div>
            <div className="text-xs text-muted-foreground">Ticket Médio</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'daily' ? (
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayLabel"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-primary">
                            Vendas: {payload[0].payload.sales}
                          </p>
                          <p className="text-success">
                            Valor: {payload[0].payload.formattedValue}
                          </p>
                          <p className="text-info">
                            Ticket: {payload[0].payload.formattedTicket}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayLabel"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-primary">
                            Vendas: {payload[0].payload.sales}
                          </p>
                          <p className="text-success">
                            Valor: {payload[0].payload.formattedValue}
                          </p>
                          <p className="text-info">
                            Ticket: {payload[0].payload.formattedTicket}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Last updated */}
        {data.metadata && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Última atualização: {formatLastUpdated(data.metadata.lastUpdated)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}