import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Users, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useRegisters } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { analyticsApi } from "@/lib/api";
import type { RegistersOrderBy } from "@/types/analytics";

interface RegistersTableProps {
  className?: string;
}

const PAGE_SIZE = 10;

// ---------- Formatters ----------

const formatPhone = (phone: string | null) => {
  if (!phone) return "—";
  // Verificar se já está formatado como (XX) XXXXX-XXXX ou (XX) X XXXX-XXXX
  if (phone.match(/\(\d{2}\)\s+\d.*\-\d+/)) {
    return phone;
  }
  return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
};

// ---------- Chips (badges) ----------

const gratuitoChip = () => (
  <Badge className="bg-pink-100 text-pink-700 border-pink-200">Gratuito</Badge>
);

const paymentMethodChip = (value: string | null) => {
  switch (value) {
    case "CREDIT_CARD":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Crédito</Badge>;
    case "SUBSCRIPTION":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Assinatura</Badge>;
    case "BILLET":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Boleto</Badge>;
    case "PIX":
      return <Badge className="bg-green-100 text-green-700 border-green-200">Pix</Badge>;
    case "GIFT":
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200">Gratuito</Badge>;
    case "IN_APP":
      return <Badge className="bg-yellow-200 text-yellow-600 border-yellow-300">Apple</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">Sem Pedido</Badge>;
  }
};

const planChip = (value: string | null) => {
  switch (value) {
    case "":
      return <Badge className="bg-pink-100 text-pink-700 border-pink-200">Gratuito</Badge>;
    case "ASSINATURA QUESTOES+ MENSAL":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Mensal</Badge>;
    case "ASSINATURA QUESTOES+ ANUAL":
      return <Badge className="bg-green-100 text-green-700 border-green-200">Anual</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">Sem Pedido</Badge>;
  }
};

const statusChip = (value: string | null) => {
  switch (value) {
    case "EXPIRED":
      return <Badge className="bg-gray-200 text-gray-600 border-gray-300">Expirado</Badge>;
    case "PENDING":
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pendente</Badge>;
    case "PAID":
      return <Badge className="bg-green-100 text-green-700 border-green-200">Pago</Badge>;
    case "REFUSED":
      return <Badge className="bg-red-100 text-red-700 border-red-200">Recusado</Badge>;
    case "CANCELED":
      return <Badge className="bg-gray-400 text-gray-100 border-gray-500">Cancelado</Badge>;
    case "REFUNDED":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Reembolsado</Badge>;
    case "PROCESSING":
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Processando</Badge>;
    case "FAILED":
      return <Badge className="bg-red-200 text-red-800 border-red-300">Falhou</Badge>;
    case "AUTHORIZED":
      return <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">Autorizado</Badge>;
    case "CHARGEBACK":
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Chargeback</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">{value || "Sem Pedido"}</Badge>;
  }
};

const paymentProcessedChip = (value: boolean | null) => {
  switch (value) {
    case true:
      return <Badge className="bg-green-100 text-green-700 border-green-200">Sim</Badge>;
    case false:
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Não</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
  }
};

const recorrenciaChip = (value: boolean | null) => {
  switch (value) {
    case true:
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Sim</Badge>;
    case false:
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Não</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
  }
};

// ---------- Ordering helpers ----------

const parsePtBrDate = (value: string | null) => {
  if (!value) return null;

  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})(?:\D+(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
    const parsedDate = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
};

const sortBySaleDateDesc = <T extends { saleDate: string | null }>(rows: ReadonlyArray<T>) => {
  return [...rows].sort((a, b) => {
    const dateA = parsePtBrDate(a.saleDate);
    const dateB = parsePtBrDate(b.saleDate);

    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.getTime() - dateA.getTime();
  });
};

// ---------- Component ----------

export function RegistersTable({ className }: Readonly<RegistersTableProps>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [orderBy, setOrderBy] = useState<RegistersOrderBy>('registration');
  const [isExporting, setIsExporting] = useState(false);
  const skeletonKeys = useMemo(() => Array.from({ length: PAGE_SIZE }).map(() => Math.random().toString(36).slice(2)), []);
  const { data, isLoading, isError, error } = useRegisters(PAGE_SIZE, currentPage * PAGE_SIZE, orderBy);

  const rows = useMemo(() => {
    const currentRows = data?.rows ?? [];
    if (orderBy === 'purchase') {
      return sortBySaleDateDesc(currentRows);
    }
    return currentRows;
  }, [data?.rows, orderBy]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  if (isError) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">Erro ao carregar registros: {error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Registros de Usuários
          </CardTitle>
          <CardDescription>
            {data ? `${data.total.toLocaleString("pt-BR")} usuários cadastrados` : "Carregando..."}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Ordenar por:</span>
          <ToggleGroup
            type="single"
            value={orderBy}
            onValueChange={(value) => {
              if (!value) return;
              setOrderBy(value as RegistersOrderBy);
              setCurrentPage(0);
            }}
            className="border rounded-md p-1"
            aria-label="Ordenar registros"
          >
            <ToggleGroupItem value="registration" className="text-xs sm:text-sm">
              Cadastros
            </ToggleGroupItem>
            <ToggleGroupItem value="purchase" className="text-xs sm:text-sm">
              Compras
            </ToggleGroupItem>
          </ToggleGroup>
          <Button
            size="sm"
            variant="ghost"
            title="Exportar todos os registros para Excel ou CSV"
            onClick={async () => {
              setIsExporting(true);
              try {
                // Helpers ----------------------
                function normalizeValue(v: any) {
                  return v === null || v === undefined ? null : v;
                }

function formatName(name: string): string | null {
  if (!name) return null;
  return name
    .split(" ")
    .map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : "")
    .join(" ");
}

function translatePaymentMethod(method: string): string | null {
  if (!method) return null;
  switch (method) {
    case "CREDIT_CARD": return "Cartão de Crédito";
    case "SUBSCRIPTION": return "Assinatura";
    case "BILLET": return "Boleto";
    case "PIX": return "Pix";
    case "GIFT": return "Gratuito";
    case "IN_APP": return "Apple/Google";
    default: return method;
  }
}

function translateStatus(status: string): string | null {
  if (!status) return null;
  switch (status) {
    case "EXPIRED": return "Expirado";
    case "PENDING": return "Pendente";
    case "PAID": return "Pago";
    case "REFUSED": return "Recusado";
    case "CANCELED": return "Cancelado";
    case "REFUNDED": return "Reembolsado";
    case "PROCESSING": return "Processando";
    case "FAILED": return "Falhou";
    case "AUTHORIZED": return "Autorizado";
    case "CHARGEBACK": return "Chargeback";
    default: return status;
  }
}

function simplifyPlan(plan: string): string | null {
  if (!plan) return null;
  if (plan === "ASSINATURA QUESTOES+ MENSAL") return "Assinatura Mensal";
  if (plan === "ASSINATURA QUESTOES+ ANUAL") return "Assinatura Anual";
  if (plan === "TRIAL") return "Trial";
  return plan;
}

                // Busca todos os registros paginando até obter todos
                const res = await analyticsApi.fetchAllRegisters(orderBy);
                const rawRows = res.rows ?? [];

                if (rawRows.length === 0) {
                  setIsExporting(false);
                  return;
                }

                const orderedRows = orderBy === 'purchase' ? sortBySaleDateDesc(rawRows) : rawRows;

                const allRows = orderedRows.map(row => {
                  const isGratuito = row.paymentMethod === "GIFT" || row.plan === "TRIAL";

                  return {
                    "Nome Completo": normalizeValue(formatName(row.name)),
                    "CPF": normalizeValue(row.cpf),
                    "Valor": normalizeValue(row.value),
                    "Método de Pagamento": isGratuito ? "Gratuito" : normalizeValue(translatePaymentMethod(row.paymentMethod)),
                    "Plano": isGratuito ? "Gratuito" : normalizeValue(simplifyPlan(row.plan)),
                    "Recorrente": row.recurring ? "Sim" : "Não",
                    "Status": normalizeValue(translateStatus(row.status)),
                    "Pagamento Processado": row.paymentProcessed ? "Processado" : "Pendente",
                    "Data da Venda": normalizeValue(row.saleDate),
                    "Telefone": normalizeValue(row.phone),
                    "Email": normalizeValue(row.email),
                    "Data de Cadastro": normalizeValue(row.registeredAt),
                    "Tem Compra": row.hasPurchase ? "Sim" : "Não"
                  };
                });

                // import xlsx dinamicamente
                let xlsxModule: any = null;
                try {
                  // @ts-ignore
                  xlsxModule = await import(/* @vite-ignore */ 'https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs').catch(() => null);
                } catch (e) {
                  console.debug('xlsx dynamic import failed', e);
                  xlsxModule = null;
                }

                if (!xlsxModule) {
                  // Gera CSV fallback
                  const headers = Object.keys(allRows[0]);
                  const quotedHeaders = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
                  const csvRows = allRows.map(row =>
                    headers
                      .map(h => {
                        const v = row[h];
                        if (v === null || v === undefined) return ""; // mantém vazio
                        return String(v).replace(/"/g, '""');
                      })
                      .map(cell => `"${cell}"`)
                      .join(',')
                  );
                  const csv = [quotedHeaders].concat(csvRows).join('\n');

                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'registros.csv';
                  a.click();
                  URL.revokeObjectURL(url);
                  setIsExporting(false);
                  return;
                }

                // Exporta Excel
                const XLSX: any = xlsxModule;
                const worksheet = XLSX.utils.json_to_sheet(allRows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
                const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([wbout], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'registros.xlsx';
                a.click();
                URL.revokeObjectURL(url);
              } finally {
                setIsExporting(false);
              }
            }}
            disabled={isExporting}
          >
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </div>
      </div>
    </CardHeader>


      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome Completo</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Plano Venda</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Status da Compra</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Data da Compra</TableHead>
                <TableHead>Data Cadastro</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(() => {
                if (isLoading) {
                  return Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <TableRow key={skeletonKeys[i]}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={`${skeletonKeys[i]}-${j}`}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ));
                } else if (rows.length) {
                  return rows.map((register) => {
                    const key =
                      [register.email, register.name, register.cpf, register.phone].filter(Boolean).join("-") ||
                      Math.random().toString();

                    const isGratuito = register.paymentMethod === "GIFT" || register.plan === "TRIAL";

                    return (
                      <TableRow key={key}>
                        <TableCell>
                          {register.name
                            ? register.name
                                .split(" ")
                                .map((word) =>
                                  word.length > 0
                                    ? word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase()
                                    : ""
                                )
                                .join(" ")
                            : "—"}
                        </TableCell>
                        
                        <TableCell>{isGratuito ? gratuitoChip() : paymentMethodChip(register.paymentMethod)}</TableCell>
                        <TableCell>{isGratuito ? gratuitoChip() : planChip(register.plan)}</TableCell>
                        <TableCell>{recorrenciaChip(register.recurring)}</TableCell>
                        <TableCell>{statusChip(register.status)}</TableCell>
                        <TableCell>{paymentProcessedChip(register.paymentProcessed)}</TableCell>
                        <TableCell>{register.saleDate || "—"}</TableCell>
                        <TableCell>{register.registeredAt || "—"}</TableCell>
                      </TableRow>
                    );
                  });
                } else {
                  return (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  );
                }
              })()}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages} • {data.total.toLocaleString("pt-BR")} registros
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev - 1)} disabled={!hasPreviousPage}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((prev) => prev + 1)} disabled={!hasNextPage}>
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RegistersTable;
