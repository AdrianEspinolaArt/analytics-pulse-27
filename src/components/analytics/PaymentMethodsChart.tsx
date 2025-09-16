import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MetricCard } from "./MetricCard";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { apiGet } from "@/lib/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

type MethodEntry = {
  paymentMethod: string;
  totalOrders: number;
  totalValue: number;
  totalPaidOrders: number;
  totalPaidValue: number;
  averagePaidTicket: number;
};

type PaymentMethodsDto = {
  methods: MethodEntry[];
  totalOrders: number;
  totalValue: number;
  totalPaidOrders: number;
  totalPaidValue: number;
};

const COLORS = ["#06b6d4","#7c3aed","#ef4444","#f59e0b","#10b981","#3b82f6"];

// Mapeamento de códigos de método para nomes legíveis
const PAYMENT_LABELS: Record<string, string> = {
  GIFT: "Gratuito",
  PIX: "Pix",
  SUBSCRIPTION: "Assinatura",
  CREDIT_CARD: "Crédito",
  IN_APP: "Apple",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export default function PaymentMethodsChart() {
  const { data, isLoading, isError, error } = useQuery<PaymentMethodsDto>({
    queryKey: ["analytics", "paymentmethods"],
    queryFn: () => apiGet<PaymentMethodsDto>("/analytics/paymentmetrics"),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar métodos de pagamento. {(error as Error)?.message || ""}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading skeleton
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Total de Pedidos" value={<Skeleton className="h-7 w-20" />} variant="primary" />
          <MetricCard title="Pedidos Pagos" value={<Skeleton className="h-7 w-20" />} variant="success" />
          <MetricCard title="Valor Pago" value={<Skeleton className="h-7 w-28" />} variant="warning" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métodos de Pagamento</CardTitle>
            <CardDescription>Carregando dados...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-64 bg-muted/20 animate-pulse" />
              <div className="h-64 bg-muted/20 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const methods = data.methods || [];

  // Data for charts
  const ordersByMethod = methods.map((m) => ({ code: m.paymentMethod, label: PAYMENT_LABELS[m.paymentMethod] || m.paymentMethod, value: m.totalOrders }));
  const paidValueByMethod = methods.map((m) => ({ code: m.paymentMethod, label: PAYMENT_LABELS[m.paymentMethod] || m.paymentMethod, value: m.totalPaidValue }));

  return (
    <div className="space-y-4">

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Distribuição por método</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Pie / orders */}
            <div>
              <div className="text-sm font-medium mb-2">Pedidos por Método</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByMethod}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      label={(entry: any) => `${entry.label} (${entry.value})`}
                    >
                      {ordersByMethod.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar / paid value */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Valor Pago por Método</div>
              </div>
              <div className="h-64 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paidValueByMethod} margin={{ top: 10, right: 16, left: 40, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => formatCurrency(Number(v))} />
                    <ReTooltip formatter={(v: number) => formatCurrency(Number(v))} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                      {paidValueByMethod.map((entry, idx) => (
                        <Cell key={`bar-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary table */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Resumo</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Método de Pagamento</TableHead>
                  <TableHead>Total Pedidos</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Pedidos Pagos</TableHead>
                  <TableHead>Valor Pago</TableHead>
                  <TableHead>Ticket Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {methods.map((m, idx) => (
                  <TableRow key={m.paymentMethod}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          style={{ backgroundColor: COLORS[ordersByMethod.findIndex(o => o.code === m.paymentMethod) % COLORS.length], color: "#fff" }}
                          variant="outline"
                        >
                          {ordersByMethod.find(o => o.code === m.paymentMethod)?.label || m.paymentMethod}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{m.totalOrders.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{formatCurrency(m.totalValue)}</TableCell>
                    <TableCell>{m.totalPaidOrders.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{formatCurrency(m.totalPaidValue)}</TableCell>
                    <TableCell>{formatCurrency(m.averagePaidTicket)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Uso: exemplo de import e uso dentro de AnalyticsDashboard.tsx
        import PaymentMethodsChart from './PaymentMethodsChart';

        // Em um componente React
        <PaymentMethodsChart />
      */}
    </div>
  );
}
