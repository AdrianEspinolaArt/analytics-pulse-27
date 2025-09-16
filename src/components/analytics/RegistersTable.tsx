// Registers table with pagination
// Displays user registrations with purchase status

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { useRegisters } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

interface RegistersTableProps {
  className?: string;
}

const PAGE_SIZE = 20;

export function RegistersTable({ className }: RegistersTableProps) {
  const [currentPage, setCurrentPage] = useState(0);
  
  const { data, isLoading, isError, error } = useRegisters(PAGE_SIZE, currentPage * PAGE_SIZE);
  
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPreviousPage = currentPage > 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  if (isError) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              Erro ao carregar registros: {error?.message}
            </p>
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
              {data ? `${data.total.toLocaleString('pt-BR')} usuários cadastrados` : 'Carregando...'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Comprou</TableHead>
                <TableHead>Plano</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                  </TableRow>
                ))
              ) : data?.rows?.length ? (
                data.rows.map((register, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {register.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {register.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatPhone(register.phone)}
                    </TableCell>
                    <TableCell>
                      {formatDate(register.registeredAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={register.hasPurchase ? "default" : "secondary"}
                        className={cn(
                          register.hasPurchase 
                            ? "bg-success/10 text-success border-success/20" 
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {register.hasPurchase ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {register.hasPurchase ? 'Sim' : 'Não'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {register.plan ? (
                        <Badge variant="outline" className="text-xs">
                          {register.plan}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Página {currentPage + 1} de {totalPages} • {data.total.toLocaleString('pt-BR')} registros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={!hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!hasNextPage}
              >
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