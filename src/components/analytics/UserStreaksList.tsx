// User streaks list component
// Displays streak statistics for users

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Users, Trophy, Calendar, XCircle } from "lucide-react";
import { useUserStreaks } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils";

interface UserStreaksListProps {
  className?: string;
}

export function UserStreaksList({ className }: UserStreaksListProps) {
  const { data, isLoading, isError, error } = useUserStreaks();

  const formatLastUpdated = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isError) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-muted-foreground">
              Erro ao carregar streaks: {error?.message}
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
              <Flame className="h-5 w-5 text-warning" />
              Streaks dos Usuários
            </CardTitle>
            <CardDescription>
              {data ? `${data.totalUsers} usuários com streaks` : 'Carregando...'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.streaks?.length ? (
          <div className="space-y-3">
            {data.streaks
              .sort((a, b) => b.currentStreak - a.currentStreak)
              .map((streak, index) => (
                <div
                  key={streak.userId}
                  className={cn(
                    "flex items-center justify-between p-4 border rounded-lg transition-colors",
                    "hover:bg-analytics-card-hover",
                    streak.isOnStreak && "bg-success/5 border-success/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                      streak.isOnStreak 
                        ? "bg-success text-success-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {index < 3 ? (
                        <Trophy className="h-4 w-4" />
                      ) : (
                        <Users className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {streak.userName || `Usuário ${streak.userId.slice(-4)}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {streak.totalDays} dias totais • Máximo: {streak.maxStreak} dias
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Badge
                      variant={streak.isOnStreak ? "default" : "secondary"}
                      className={cn(
                        streak.isOnStreak 
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Flame className="w-3 h-3 mr-1" />
                      {streak.currentStreak}
                    </Badge>
                    
                    {streak.isOnStreak && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <Calendar className="w-3 h-3 mr-1" />
                        Ativo
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum streak encontrado</p>
          </div>
        )}

        {/* Last updated */}
        {data?.lastUpdated && (
          <div className="mt-4 text-xs text-muted-foreground text-center">
            Última atualização: {formatLastUpdated(data.lastUpdated)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}