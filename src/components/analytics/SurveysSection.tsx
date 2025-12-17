import { useSurveys } from '@/hooks/use-analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, MessageSquare, Smartphone, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function SurveysSection() {
  const { data, isLoading, error } = useSurveys(30);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Erro ao carregar dados de feedback de telas: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>
          Nenhum dado disponível para feedback de telas.
        </AlertDescription>
      </Alert>
    );
  }

  // Prepare chart data
  const ratingData = data.ratingDistribution.map(item => ({
    rating: `${item.rating} estrela${item.rating > 1 ? 's' : ''}`,
    count: item.count,
    percentage: item.percentage,
  }));

  const platformData = data.responsesByPlatform.map(item => ({
    name: item.platform,
    value: item.count,
    percentage: (item.count / data.totalResponses) * 100,
  }));

  const trendData = data.responseTrend.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    responses: item.count,
  }));

  // Find predominant platform
  const predominantPlatform = data.responsesByPlatform.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pesquisas Ativas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalActiveSurveys}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Formulários disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalResponses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Feedbacks coletados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De 5.0 estrelas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plataforma Predominante</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predominantPlatform.platform}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((predominantPlatform.count / data.totalResponses) * 100).toFixed(1)}% das respostas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Avaliações</CardTitle>
            <CardDescription>Quantidade de respostas por nota</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    if (name === 'count') return [value, 'Respostas'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend formatter={(value) => value === 'count' ? 'Respostas' : value} />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Respostas por Plataforma</CardTitle>
            <CardDescription>Distribuição entre Android e iOS</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {platformData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} respostas`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Surveys */}
        
      </div>
      <Card>
          <CardHeader>
            <CardTitle>Pesquisas Principais</CardTitle>
            <CardDescription>Formulários com mais engajamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topSurveys.map((survey, index) => (
                <div key={index} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{survey.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {survey.response_count} respostas
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{survey.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      {/* Recent Comments */}
      {data.recentComments && data.recentComments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Comentários Recentes</CardTitle>
            <CardDescription>Feedbacks mais recentes dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentComments.map((comment, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < comment.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {comment.platform}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.responded_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm italic text-gray-700">"{comment.comment}"</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pergunta: {comment.question}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
