# Documentação das rotas /analytics

Este documento descreve as rotas expostas pelo controller `GET /analytics/*` implementado em `src/analytics/analytics.controller.ts`.
Inclui: propósito, parâmetros, DTOs (shapes) e exemplos JSON de resposta. Os endpoints são read-only e usam dados do MongoDB (usuários) e do Postgres (purchases via Prisma).

Configuração relevante
- TIMEZONE: `process.env.SALES_TIMEZONE` (padrão: `America/Sao_Paulo`) — usado para formatação de datas e agrupamentos.
- Cache: `AnalyticsCacheService` com TTL heurístico (60s para janelas curtas, 300s para janelas maiores).

Índice
- GET /analytics/registrations
- GET /analytics/conversion
- GET /analytics/sales (daily | monthly)
- GET /analytics/customers
- GET /analytics/user-streaks
- GET /analytics/registers

---

## GET /analytics/registrations
Descrição
- Retorna métricas de cadastro (contagens e métricas de conversão) calculadas pelo `CadastroMetricsService`.
- Endpoint cacheado com chave `analytics:registrations:{period}`; TTL: 60s para `period` curto (7d/daily) ou 300s caso contrário.

Parâmetros
- period (query, opcional): string que descreve o período (ex.: `7d`, `30d`, `daily`). Atualmente o valor influencia apenas a chave de cache e TTL.

DTO de resposta (CadastroMetricsDto) — fields principais
- total_usuarios: number
- cadastros_hoje: number
- cadastros_7_dias: number
- cadastros_30_dias: number
- vendas_confirmadas: number
- vendas_hoje: number
- valor_efetivamente_pago: number
- valor_efetivamente_pago_formatado: string (R$)
- taxa_conversao_geral: number (percent)
- taxa_conversao_hoje: number (percent)
- ticket_medio: number
- ticket_medio_formatado: string (R$)
- periodo_analise: { data_atual, inicio_7_dias, inicio_30_dias }

Exemplo JSON
{
  "total_usuarios": 12500,
  "cadastros_hoje": 35,
  "cadastros_7_dias": 210,
  "cadastros_30_dias": 900,
  "vendas_confirmadas": 3200,
  "vendas_hoje": 12,
  "valor_efetivamente_pago": 256000.5,
  "valor_efetivamente_pago_formatado": "R$ 256.000,50",
  "taxa_conversao_geral": 25.6,
  "taxa_conversao_hoje": 34.29,
  "ticket_medio": 80.0,
  "ticket_medio_formatado": "R$ 80,00",
  "periodo_analise": { "data_atual": "15/09/2025", "inicio_7_dias": "09/09/2025", "inicio_30_dias": "17/08/2025" }
}

---

## GET /analytics/conversion
Descrição
- Retorna métricas gerais de conversão (usuários, orders, pagamentos) calculadas pelo `ConversionMetricsService`.
- Cache key: `analytics:conversion:default`.

DTO de resposta (ConversionMetricsDto) — fields principais
- users: { total: number, uniqueCustomers: number, conversionRate: number }
- orders: { total: number, payments: number, value: { ordered: number, paid: number } }

Exemplo JSON
{
  "users": { "total": 12500, "uniqueCustomers": 2500, "conversionRate": 20.0 },
  "orders": { "total": 3000, "payments": 2800, "value": { "ordered": 300000, "paid": 280000 } }
}

---

## GET /analytics/sales
Descrição
- Retorna séries temporais de vendas. Pode retornar dados diários (timeseries por dia) ou mensais (agregados por mês), dependendo do parâmetro `period` (ou `interval` como fallback).
- O controller infere a granularidade (daily vs monthly): se `period` contém `m`/`month`/`M` ou termina com `m` (ex: `6m`), usa monthly; caso contrário, usa daily.
- Cache key: `analytics:sales:{granularidade}:{period}`. TTL: 60s para janelas curtas (<=7 dias), 300s para períodos maiores.

Parâmetros
- period (query, opcional): exemplos `7d`, `15d`, `30d`, `6m` (6 meses) ou apenas `15` (será interpretado como dias). Se `period` indicar meses (ex.: `6m`, `3month`) a resposta será mensal.
- interval (query, opcional): fallback para granularidade se `period` não for informativo.

Rota branchings
- Daily path: chama `SalesChartService.getSalesChart(days)` onde `days` é extraído do `period` (ex.: `7d` -> 7, `15d` -> 15). Retorna detalhamento por dia.
- Monthly path: chama `SalesMonthlyChartService.getSalesMonthlyChart(months)` onde `months` vem do `period` (ex.: `6m` -> 6). Retorna detalhamento por mês.

DTO de resposta (Daily) — fields principais (SalesChartDto)
- period: { startDate: string (YYYY-MM-DD), endDate: string (YYYY-MM-DD), days: number }
- summary: { totalSales: number, totalValue: number, averagePerDay: number, averageTicket: number }
- dailyData: Array<{
    date: string (YYYY-MM-DD),
    dateFormatted: string (pt-BR slice),
    dayOfWeek: string (pt-BR),
    sales: number,
    value: number,
    averageTicket: number
  }>
- metadata: { lastUpdated, dataSource, filters }

Exemplo (daily, ?period=15d)
{
  "period": { "startDate": "2025-08-31", "endDate": "2025-09-14", "days": 15 },
  "summary": { "totalSales": 120, "totalValue": 9600.00, "averagePerDay": 8.0, "averageTicket": 80.00 },
  "dailyData": [ { "date": "2025-08-31", "dateFormatted": "31/08", "dayOfWeek": "Domingo", "sales": 5, "value": 400.00, "averageTicket": 80.00 }, ... ],
  "metadata": { "lastUpdated": "2025-09-15T10:00:00.000Z", "dataSource": "postgres_sales_table", "filters": { "status": ["PAID"], "excludeTrials": true, "period": "last_15_days" } }
}

DTO de resposta (Monthly) — fields principais (SalesMonthlyChartDto)
- period: { startMonth: string (YYYY-MM), endMonth: string (YYYY-MM), months: number }
- summary: { totalSales: number, totalValue: number, averagePerMonth: number, averageTicket: number }
- monthlyData: Array<{
    month: string (YYYY-MM),
    monthFormatted: string (e.g. "Agosto/2025"),
    sales: number,
    value: number,
    averageTicket: number
  }>
- metadata similar ao daily

Exemplo (monthly, ?period=6m)
{
  "period": { "startMonth": "2025-04", "endMonth": "2025-09", "months": 6 },
  "summary": { "totalSales": 720, "totalValue": 57600.00, "averagePerMonth": 120.0, "averageTicket": 80.0 },
  "monthlyData": [ { "month": "2025-04", "monthFormatted": "Abril/2025", "sales": 110, "value": 8800.00, "averageTicket": 80.0 }, ... ]
}

---

## GET /analytics/customers
Descrição
- Retorna métricas de clientes (total de usuários, clientes ativos, recorrentes, LTV, ticket médio) calculadas por `CustomerAnalyticsService`.
- Cache key: `analytics:customers:default`.

DTO de resposta (CustomerAnalyticsDto) — fields principais
- totalUsers: number
- activeCustomers: number
- returningCustomers: number
- avgOrderValue: number
- customerLTV: number
- conversionRate: number

Exemplo JSON
{
  "totalUsers": 12500,
  "activeCustomers": 3000,
  "returningCustomers": 450,
  "avgOrderValue": 80.0,
  "customerLTV": 300.0,
  "conversionRate": 24.0
}

---

## GET /analytics/user-streaks
Descrição
- Retorna lista de streaks por usuário a partir da tabela `user_daily_streaks_progress` (Prisma) correlacionando nomes no Mongo (users).
- Usa `UserStreaksService.getUserStreaks()`.
- Cache key: `analytics:user-streaks:default`.

DTO de resposta (UserStreaksListDto)
- streaks: Array<{
    userId: string,
    userName: string,
    totalDays: number,
    maxStreak: number,
    currentStreak: number,
    isOnStreak: boolean,
    streakDays: string[]
  }>
- totalUsers: number
- lastUpdated: string (ISO)

Exemplo JSON
{
  "streaks": [
    { "userId": "64f...", "userName": "João Silva", "totalDays": 45, "maxStreak": 15, "currentStreak": 3, "isOnStreak": true, "streakDays": ["2025-09-13","2025-09-14","2025-09-15"] }
  ],
  "totalUsers": 1,
  "lastUpdated": "2025-09-15T10:05:00.000Z"
}

---

## GET /analytics/registers
Descrição
- Lista registros de usuários (cadastros) com carregamento das compras (paid) mais recentes por usuário e paginação offset-based.
- Usa `RegisterAnalyticsService.getAllRegisters(limit, skip)`.

Parâmetros
- limit (query, opcional): número de itens por página. Se omitido, retorna todos a partir do skip.
- skip (query, opcional): offset (default 0).
- Cache key: `analytics:registers:{limit}:{skip}` com TTL 60s.

DTO de resposta
- total: number (total de registros que satisfazem o filtro)
- rows: Array<{
    name: string | null,
    phone: string | null,
    email: string | null,
    registeredAt: Date | string | null,
    hasPurchase: boolean,
    plan: string | null
  }>

Exemplo JSON
{
  "total": 12500,
  "rows": [
    { "name": "Maria Souza", "phone": "+551199999999", "email": "maria@example.com", "registeredAt": "2025-09-14T08:00:00.000Z", "hasPurchase": true, "plan": "ASSINATURA QUESTOES+ MENSAL" },
    ...
  ]
}

---

Observações finais e boas práticas
- Confirme se deseja manter os controllers administrativos (`/plans`, `/purchase`, `/users`, etc.) em outro módulo para admin/ops; aqui eles foram removidos porque você declarou oficialmente que somente as rotas `/analytics/*` devem permanecer.
- Recomendo adicionar documentação Swagger (decorators `@ApiOperation`, `@ApiResponse`) baseada nos DTOs existentes para gerar UI automática.
- Se desejar, posso:
  - Gerar os decorators Swagger nos controllers;
  - Criar testes unitários de contrato (ex.: snapshot dos JSONs) para cada rota;
  - Rodar uma busca global para garantir que nenhum outro módulo externo usa os controllers removidos (já verifiquei referências internas básicas antes de remover).

---

Arquivo fonte:
- Controller central: `src/analytics/analytics.controller.ts`
- Serviços usados: `src/cadastro-metrics.service.ts`, `src/conversion-metrics.service.ts`, `src/sales-chart.service.ts`, `src/sales-monthly-chart.service.ts`, `src/customer-analytics.service.ts`, `src/user-streaks.service.ts`, `src/register-analytics.service.ts`

FIM
