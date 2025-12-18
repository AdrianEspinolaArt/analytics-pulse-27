// Sales chart component using Recharts
// Displays daily/monthly sales data with responsive design
// Now supports new API structure with billedValue, paidValue, refundedValue

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar, TrendingUp, Filter, Check, BarChart3, LineChartIcon } from "lucide-react";
import { SalesChartDto } from "@/types/analytics";
import type { Period } from "@/types/analytics";
import { cn } from "@/lib/utils";

interface SalesChartProps {
  data: SalesChartDto;
  period?: Period;
  onPeriodChange?: (p: Period) => void;
  className?: string;
}

export function SalesChart({ data, className, period = '365d', onPeriodChange }: SalesChartProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [openMonthFilter, setOpenMonthFilter] = useState(false);
  const [showDailyView, setShowDailyView] = useState(false); // false = mensal (padrão), true = diário
  
  const summary = data.summary;
  
  // SEMPRE mostra dados mensais por padrão (barras por mês)
  // Usuário pode alternar para diário com o toggle
  const rawChartData = showDailyView ? data.dailyData : data.monthlyData;
  
  // Extract available months from the data (sempre do monthlyData)
  const availableMonths = useMemo(() => {
    return data.monthlyData.map(item => ({
      value: item.month,
      label: item.monthName
    }));
  }, [data.monthlyData]);
  
  // Filter chart data by selected months
  const chartData = useMemo(() => {
    if (selectedMonths.length === 0) {
      return rawChartData;
    }
    
    if (showDailyView) {
      return data.dailyData.filter(item => {
        const [day, month, year] = item.date.split('/');
        const monthKey = `${month}/${year}`;
        return selectedMonths.includes(monthKey);
      });
    } else {
      return data.monthlyData.filter(item => selectedMonths.includes(item.month));
    }
  }, [rawChartData, selectedMonths, showDailyView, data]);
  
  // Format data for chart
  const formattedData = chartData.map(item => {
    const isDaily = 'dateFormatted' in item;
    const displayLabel = isDaily 
      ? item.dateFormatted 
      : (item as any).monthName || (item as any).month;
    
    return {
      ...item,
      displayLabel,
      netValue: 'netValue' in item ? item.netValue : item.paidValue - item.refundedValue,
    };
  });

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatCurrencyDetailed = (value: number) => 
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
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

  const periodLabels: Record<Period, string> = {
    '7d': '7 dias',
    '30d': '30 dias',
    '90d': '90 dias',
    '365d': '1 ano',
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">
              Vendas {showDailyView ? 'Diárias' : 'Mensais'} - {periodLabels[period]}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {showDailyView ? `${data.period.startDate} até ${data.period.endDate}` : `${data.monthlyData.length} meses disponíveis`}
              {selectedMonths.length > 0 && (
                <span className="text-xs text-primary ml-2">
                  • Filtrado: {selectedMonths.length} {selectedMonths.length === 1 ? 'mês' : 'meses'}
                </span>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {/* Toggle de visualização */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-muted/5">
              <BarChart3 className={cn("h-4 w-4", !showDailyView && "text-primary")} />
              <Switch
                checked={showDailyView}
                onCheckedChange={setShowDailyView}
                className="data-[state=checked]:bg-primary"
              />
              <LineChartIcon className={cn("h-4 w-4", showDailyView && "text-primary")} />
            </div>
            
            {/* Month filter */}
            <Popover open={openMonthFilter} onOpenChange={setOpenMonthFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-dashed"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Meses
                  {selectedMonths.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 rounded-sm px-1 font-normal"
                    >
                      {selectedMonths.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Buscar mês..." />
                  <CommandEmpty>Nenhum mês encontrado.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {availableMonths.map((month) => {
                      const isSelected = selectedMonths.includes(month.value);
                      return (
                        <CommandItem
                          key={month.value}
                          onSelect={() => {
                            setSelectedMonths(
                              isSelected
                                ? selectedMonths.filter((m) => m !== month.value)
                                : [...selectedMonths, month.value]
                            );
                          }}
                        >
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className={cn("h-4 w-4")} />
                          </div>
                          <span>{month.label}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedMonths.length > 0 && (
                    <>
                      <div className="border-t" />
                      <div className="p-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-xs"
                          onClick={() => setSelectedMonths([])}
                        >
                          Limpar filtros
                        </Button>
                      </div>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>
            
            {/* Period selector */}
            {onPeriodChange && (
              <div className="hidden sm:flex items-center gap-2">
                <div className="inline-flex rounded-md bg-muted/5 p-1">
                  {(['7d', '30d', '90d', '365d'] as Period[]).map((p) => {
                    const active = period === p;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          onPeriodChange(p);
                          setSelectedMonths([]); // Limpar filtros ao mudar período
                        }}
                        className={cn(
                          "px-3 py-1 text-xs rounded-md font-medium transition",
                          active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/10"
                        )}
                      >
                        {periodLabels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {formatCurrency(summary.totalValue)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Summary metrics - expanded with new data */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-primary/5 rounded-lg">
            <div className="text-lg font-semibold text-foreground">
              {summary.totalSales.toLocaleString('pt-BR')}
            </div>
            <div className="text-xs text-muted-foreground">Total de Vendas</div>
          </div>
          
          <div className="text-center p-3 bg-blue-500/5 rounded-lg">
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.totalBilledValue)}
            </div>
            <div className="text-xs text-muted-foreground">Valor Faturado</div>
          </div>
          
          <div className="text-center p-3 bg-green-500/5 rounded-lg">
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalPaidValue)}
            </div>
            <div className="text-xs text-muted-foreground">Valor Pago</div>
          </div>
          
          <div className="text-center p-3 bg-red-500/5 rounded-lg">
            <div className="text-lg font-semibold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalRefundedValue)}
            </div>
            <div className="text-xs text-muted-foreground">Reembolsos</div>
          </div>
        </div>

        {/* Additional metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-base font-semibold text-foreground">
              {formatCurrency(summary.totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">Valor Recebido</div>
          </div>
          
          <div className="text-center">
            <div className="text-base font-semibold text-foreground">
              {summary.averagePerDay.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">Média por Dia</div>
          </div>
          
          <div className="text-center">
            <div className="text-base font-semibold text-foreground">
              {formatCurrency(summary.averageTicket)}
            </div>
            <div className="text-xs text-muted-foreground">Ticket Médio</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {!showDailyView ? (
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayLabel"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  angle={formattedData.length > 6 ? -45 : 0}
                  textAnchor={formattedData.length > 6 ? "end" : "middle"}
                  height={formattedData.length > 6 ? 60 : 30}
                />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                        <p className="font-semibold text-foreground mb-2">{label}</p>
                        {'dayOfWeek' in data && (
                          <p className="text-xs text-muted-foreground mb-2">{data.dayOfWeek}</p>
                        )}
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Vendas:</span>
                            <span className="font-medium">{data.sales}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-blue-600 dark:text-blue-400">Faturado:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrencyDetailed(data.billedValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-green-600 dark:text-green-400">Valor Pago:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrencyDetailed(data.paidValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-red-600 dark:text-red-400">Reembolsos:</span>
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {formatCurrencyDetailed(data.refundedValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 pt-1 border-t">
                            <span className="text-foreground font-medium">Recebido:</span>
                            <span className="font-semibold text-primary">
                              {formatCurrencyDetailed(data.netValue)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">Ticket Médio:</span>
                            <span className="font-medium">{formatCurrencyDetailed(data.averageTicket)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Bar
                  dataKey="billedValue"
                  name="Valor Faturado"
                  fill="hsl(217, 91%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="paidValue"
                  name="Valor Pago"
                  fill="hsl(142, 76%, 36%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="refundedValue"
                  name="Reembolsos"
                  fill="hsl(0, 84%, 60%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayLabel"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
                          <p className="font-semibold text-foreground mb-2">{label}</p>
                          {'dayOfWeek' in data && (
                            <p className="text-xs text-muted-foreground mb-2">{data.dayOfWeek}</p>
                          )}
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Vendas:</span>
                              <span className="font-medium">{data.sales}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-blue-600 dark:text-blue-400">Faturado:</span>
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {formatCurrencyDetailed(data.billedValue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-green-600 dark:text-green-400">Valor Pago:</span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrencyDetailed(data.paidValue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-red-600 dark:text-red-400">Reembolsos:</span>
                              <span className="font-medium text-red-600 dark:text-red-400">
                                {formatCurrencyDetailed(data.refundedValue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 border-t">
                              <span className="text-foreground font-medium">Recebido:</span>
                              <span className="font-semibold text-primary">
                                {formatCurrencyDetailed(data.netValue)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-muted-foreground">Ticket Médio:</span>
                              <span className="font-medium">{formatCurrencyDetailed(data.averageTicket)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="line"
                  wrapperStyle={{ fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="billedValue"
                  name="Valor Faturado"
                  stroke="hsl(217, 91%, 60%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(217, 91%, 60%)", r: 3 }}
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="paidValue"
                  name="Valor Pago"
                  stroke="hsl(142, 76%, 36%)"
                  strokeWidth={2.5}
                  dot={{ fill: "hsl(142, 76%, 36%)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="refundedValue"
                  name="Reembolsos"
                  stroke="hsl(0, 84%, 60%)"
                  strokeWidth={1.5}
                  dot={{ fill: "hsl(0, 84%, 60%)", r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Last updated */}
        {data.metadata && (
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
            Última atualização: {formatLastUpdated(data.metadata.lastUpdated)}
            {' • '}
            Fonte: {data.metadata.dataSource}
          </div>
        )}
      </CardContent>
    </Card>
  );
}