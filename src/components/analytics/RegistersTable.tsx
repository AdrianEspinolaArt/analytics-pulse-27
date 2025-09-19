import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useRegisters } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";
import { analyticsApi } from "@/lib/api";

interface RegistersTableProps {
  className?: string;
}

const PAGE_SIZE = 10;

// ---------- Formatters ----------

const formatDate = (dateString: string | null) => {
  if (!dateString) return "—";
  // Verifica se a data já está no formato "DD/MM/AAAA - HH:MM:SS"
  if (dateString.includes('/') && dateString.includes(' - ')) {
    return dateString;
  }
  // Caso contrário, formata a partir de uma data ISO
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString));
};

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
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
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
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
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
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
  }
};

const recorrenciaChip = (value: boolean | null) => {
  switch (value) {
    case true:
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Sim</Badge>;
    case false:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-400 border-gray-200">—</Badge>;
  }
};

// ---------- Component ----------

export function RegistersTable({ className }: Readonly<RegistersTableProps>) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const skeletonKeys = useMemo(() => Array.from({ length: PAGE_SIZE }).map(() => Math.random().toString(36).slice(2)), []);
  const { data, isLoading, isError, error } = useRegisters(PAGE_SIZE, currentPage * PAGE_SIZE);

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
              <Button
              size="sm"
              variant="ghost"
              title="Exportar todos os registros para Excel ou CSV"
              onClick={async () => {
                setIsExporting(true);
                try {
                  // Busca todos os registros paginando até obter todos
                  const allRows: Array<Record<string, any>> = [];
                  let skip = 0;
                  const limit = 500; // pega em lotes para reduzir número de requests
                  while (true) {
                    // usa analyticsApi direto para não interpolar formatação
                    // @ts-ignore
                    const res = await analyticsApi.registers(limit, skip);
                    if (!res?.rows) break;
                    // Normaliza os dados e traduz os nomes dos campos para o formato amigável
                    const normalizedRows = res.rows.map(row => {
                      // Traduzir métodos de pagamento
                      let paymentMethodTranslated = "";
                      switch (row.paymentMethod) {
                        case "CREDIT_CARD": paymentMethodTranslated = "Cartão de Crédito"; break;
                        case "SUBSCRIPTION": paymentMethodTranslated = "Assinatura"; break;
                        case "BILLET": paymentMethodTranslated = "Boleto"; break;
                        case "PIX": paymentMethodTranslated = "Pix"; break;
                        case "GIFT": paymentMethodTranslated = "Gratuito"; break;
                        case "IN_APP": paymentMethodTranslated = "Apple/Google"; break;
                        default: paymentMethodTranslated = row.paymentMethod || "";
                      }
                      
                      // Traduzir status
                      let statusTranslated = "";
                      switch (row.status) {
                        case "EXPIRED": statusTranslated = "Expirado"; break;
                        case "PENDING": statusTranslated = "Pendente"; break;
                        case "PAID": statusTranslated = "Pago"; break;
                        case "REFUSED": statusTranslated = "Recusado"; break;
                        case "CANCELED": statusTranslated = "Cancelado"; break;
                        case "REFUNDED": statusTranslated = "Reembolsado"; break;
                        default: statusTranslated = row.status || "";
                      }
                      
                      // Simplificar descrição do plano
                      let planSimplified = row.plan || "";
                      if (row.plan === "ASSINATURA QUESTOES+ MENSAL") {
                        planSimplified = "Assinatura Mensal";
                      } else if (row.plan === "ASSINATURA QUESTOES+ ANUAL") {
                        planSimplified = "Assinatura Anual";
                      } else if (!row.plan || row.plan === "") {
                        planSimplified = "Gratuito";
                      } else if (row.plan === "TRIAL") {
                        planSimplified = "Trial";
                      }

                      // Formatar nome com capitalização correta
                      const formattedName = row.name ? 
                        row.name
                          .split(" ")
                          .map(word => word.length > 0 ? word[0].toLocaleUpperCase() + word.slice(1).toLocaleLowerCase() : "")
                          .join(" ") 
                        : "";
                      
                      // Determinar se é gratuito
                      const isGratuito = row.paymentMethod === "GIFT" || row.plan === "TRIAL";
                      
                      return {
                        "Nome Completo": formattedName,
                        "CPF": row.cpf || "",
                        "Valor": row.value || "",
                        "Método de Pagamento": isGratuito ? "Gratuito" : paymentMethodTranslated,
                        "Plano": isGratuito ? "Gratuito" : planSimplified,
                        "Recorrente": row.recurring ? "Sim" : "Não",
                        "Status": statusTranslated,
                        "Data da Venda": row.saleDate || "",
                        "Telefone": row.phone || "",
                        "Email": row.email || "",
                        "Data de Cadastro": row.registeredAt || "",
                        "Tem Compra": row.hasPurchase ? "Sim" : "Não"
                      };
                    });
                    allRows.push(...normalizedRows);
                    skip += limit;
                    if (allRows.length >= (res.total ?? allRows.length)) break;
                    if (res.rows.length < limit) break;
                  }                  if (allRows.length === 0) {
                    setIsExporting(false);
                    return;
                  }

                  // import xlsx dinamicamente para reduzir bundle e falhar graciosamente
                  // tenta importar xlsx dinamicamente; se não disponível, gera CSV
                  // tentar carregar o módulo XLSX via CDN ESM (evita análise estática do Vite)
                  let xlsxModule: any = null;
                  try {
                    // @ts-ignore
                    xlsxModule = await import(/* @vite-ignore */ 'https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs').catch(() => null);
                  } catch (e) {
                    // registra o erro para ajudar no diagnóstico sem quebrar a execução
                    // eslint-disable-next-line no-console
                    console.debug('xlsx dynamic import failed', e);
                    xlsxModule = null;
                  }

                  if (!xlsxModule) {
                    const headers = Object.keys(allRows[0]);
                    const quotedHeaders = headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',');
                    const csvRows = allRows.map(row =>
                      headers
                        .map(h => {
                          const v = row[h];
                          if (v === null || v === undefined) return '';
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
                <TableHead>Status</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Tem Compra</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {(() => {
                if (isLoading) {
                  return Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <TableRow key={skeletonKeys[i]}>
                      {Array.from({ length: 12 }).map((_, j) => (
                        <TableCell key={`${skeletonKeys[i]}-${j}`}>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ));
                } else if (data?.rows?.length) {
                  return data.rows.map((register) => {
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
                        <TableCell>{register.recurring ? recorrenciaChip(register.recurring) : recorrenciaChip(null)}</TableCell>
                        <TableCell>{statusChip(register.status)}</TableCell>
                        <TableCell>{formatPhone(register.phone)}</TableCell>
                        <TableCell>{formatDate(register.registeredAt)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={register.hasPurchase ? "default" : "secondary"}
                            className={cn(
                              register.hasPurchase
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {register.hasPurchase ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {register.hasPurchase ? "Sim" : "Não"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  });
                } else {
                  return (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center py-8 text-muted-foreground">
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
