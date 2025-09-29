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
} from "recharts";
import { CurrencyDollarIcon, CheckCircleIcon, ClipboardIcon } from "@heroicons/react/24/outline";

type MethodEntry = {
  paymentMethod: string;
  pedidos: {
    total: number;
    pagos: number;
    reembolsados: number;
  };
  valores: {
    totalPedidos: string;
    pago: string;
    recebidos: string;
    reembolsado: string;
  };
  ticketMedio: string;
};

type PaymentMethodsDto = {
  metodos: MethodEntry[];
  somaGeral?: {
    totalPedidos: number;
    pedidosPagos: number;
    pedidosReembolsados: number;
    valorTotalPedidos: string;
    valorPago: string;
    valorRecebidos: string;
    valorReembolsado: string;
    ticketMedio: string;
  };
};

const COLORS = ["#06b6d4", "#7c3aed", "#ef4444", "#f59e0b", "#10b981", "#3b82f6"];

const PAYMENT_LABELS: Record<string, string> = {
  GIFT: "Gratuito",
  PIX: "PIX",
  SUBSCRIPTION: "Assinatura",
  CREDIT_CARD: "Crédito",
  IN_APP: "In App",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function parseCurrency(value?: string) {
  if (!value) return 0;
  // Remove currency symbol and spaces
  let v = String(value).replace(/\s/g, '').replace('R$', '').trim();
  // Remove thousand separators (dots) and replace decimal comma with dot
  v = v.replace(/\./g, '').replace(/,/g, '.');
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export default function PaymentMethodsChart() {
  const { data, isLoading, isError, error } = useQuery<PaymentMethodsDto>({
    queryKey: ["analytics", "paymentmethods"],
    queryFn: () => apiGet<PaymentMethodsDto>("/analytics/payments"),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar métodos de pagamento. {(error as Error)?.message || ""}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Total de Pedidos" value={<Skeleton className="h-7 w-20" />} variant="primary" icon={<ClipboardIcon className="w-5 h-5 text-blue-500" />} />
          <MetricCard title="Pedidos Pagos" value={<Skeleton className="h-7 w-20" />} variant="success" icon={<CheckCircleIcon className="w-5 h-5 text-green-500" />} />
          <MetricCard title="Valor Pago" value={<Skeleton className="h-7 w-28" />} variant="warning" icon={<CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const methods = (data as PaymentMethodsDto).metodos || [];

  const ordersByMethod = methods.map((m) => ({
    code: m.paymentMethod,
    label: PAYMENT_LABELS[m.paymentMethod] || m.paymentMethod,
    value: m.pedidos?.total ?? 0,
  }));

  const paidValueByMethod = methods.map((m) => ({
    code: m.paymentMethod,
    label: PAYMENT_LABELS[m.paymentMethod] || m.paymentMethod,
    value: parseCurrency(m.valores?.pago),
  }));

  return (
    <div className="space-y-6">
      {/* Charts */}
      

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo por Método</CardTitle>
          <CardDescription>Detalhes completos de pedidos e valores</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Método de Pagamento</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Pd.Pagos</TableHead>
                <TableHead>Pd. Reembolsados</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Valor Pago</TableHead>
                <TableHead>Valor Reembolsado</TableHead>
                <TableHead>Valor Recebido</TableHead>
                <TableHead>Ticket Médio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods.map((m, idx) => (
                <TableRow key={m.paymentMethod} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                  <TableCell>
                    <Badge
                      style={{ backgroundColor: COLORS[ordersByMethod.findIndex(o => o.code === m.paymentMethod) % COLORS.length], color: "#fff" }}
                      variant="outline"
                    >
                      {ordersByMethod.find(o => o.code === m.paymentMethod)?.label || m.paymentMethod}
                    </Badge>
                  </TableCell>
                  <TableCell>{(m.pedidos?.total ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{(m.pedidos?.pagos ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{(m.pedidos?.reembolsados ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{m.valores?.totalPedidos ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{m.valores?.pago ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{m.valores?.reembolsado ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{m.valores?.recebidos ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{m.ticketMedio ?? 'R$ 0,00'}</TableCell>
                </TableRow>
              ))}

              {/* Linha de totais agregados, se disponível */}
              {((data as PaymentMethodsDto).somaGeral) && (
                <TableRow className="font-semibold bg-gray-100">
                  <TableCell>Totais</TableCell>
                  <TableCell>{((data as PaymentMethodsDto).somaGeral!.totalPedidos ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{((data as PaymentMethodsDto).somaGeral!.pedidosPagos ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{((data as PaymentMethodsDto).somaGeral!.pedidosReembolsados ?? 0).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{(data as PaymentMethodsDto).somaGeral!.valorTotalPedidos ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{(data as PaymentMethodsDto).somaGeral!.valorPago ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{(data as PaymentMethodsDto).somaGeral!.valorReembolsado ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{(data as PaymentMethodsDto).somaGeral!.valorRecebidos ?? 'R$ 0,00'}</TableCell>
                  <TableCell>{(data as PaymentMethodsDto).somaGeral!.ticketMedio ?? 'R$ 0,00'}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Método</CardTitle>
            <CardDescription>Distribuição de pedidos por método de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
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
                    cornerRadius={8}
                    label={({ percent, name }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {ordersByMethod.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(v: number) => v.toLocaleString('pt-BR')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center mt-4 gap-4 flex-wrap">
              {ordersByMethod.map((entry, idx) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-sm text-gray-700">{entry.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Valor Pago por Método</CardTitle>
            <CardDescription>Distribuição de valores pagos por método</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={paidValueByMethod}
                  margin={{ top: 10, right: 16, left: 40, bottom: 20 }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" opacity={0.3} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(Number(v))}
                    tick={{ fontSize: 12, fill: '#4b5563' }}
                    axisLine={{ stroke: '#d1d5db' }}
                    tickLine={false}
                  />
                  <ReTooltip
                    formatter={(v: number) => formatCurrency(Number(v))}
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#f9fafb' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {paidValueByMethod.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
    