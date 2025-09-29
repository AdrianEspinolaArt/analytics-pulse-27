// Analytics API DTOs - Complete TypeScript definitions
// Based on /analytics API documentation

export interface CadastroMetricsDto {
  total_usuarios: number;
  cadastros_hoje: number;
  cadastros_7_dias: number;
  cadastros_30_dias: number;
  vendas_confirmadas: number;
  vendas_hoje: number;
  valor_vendas_confirmadas_hoje: number;
  valor_vendas_confirmadas_hoje_formatado: string;
  valor_total_vendas_hoje_formatado: string;
  valor_efetivamente_pago: number;
  valor_efetivamente_pago_formatado: string;
  // novos campos (camelCase) esperados na nova rota
  totalUsuarios?: number;
  cadastros?: {
    hoje?: number;
    ultimos7dias?: number;
    ultimos30dias?: number;
  };
  vendas?: {
    totalConfirmadas?: number;
    hoje?: number;
    valorHoje?: string;
    valorTotal?: string;
    valorReembolsos?: string; // campo de reembolsos solicitado
    valorPedidosHoje?: string;
  };
  conversao?: {
    taxaGeral?: string;
    taxaHoje?: string;
  };
  ticketMedio?: string;
  periodoAnalise?: {
    dataAtual?: string;
    inicio7dias?: string;
    inicio30dias?: string;
  };
  taxa_conversao_geral: number;
  taxa_conversao_hoje: number;
  ticket_medio: number;
  ticket_medio_formatado: string;
  periodo_analise: {
    data_atual: string;
    inicio_7_dias: string;
    inicio_30_dias: string;
  };
}

export interface ConversionMetricsDto {
  users: {
    total: number;
    uniqueCustomers: number;
    conversionRate: number;
  };
  orders: {
    total: number;
    payments: number;
    value: {
      ordered: number;
      paid: number;
    };
  };
}

export interface SalesChartDto {
  period: {
    startDate: string;
    endDate: string;
    days: number;
  };
  summary: {
    totalSales: number;
    totalValue: number;
    averagePerDay: number;
    averageTicket: number;
  };
  dailyData: Array<{
    date: string;
    dateFormatted: string;
    dayOfWeek: string;
    sales: number;
    value: number;
    averageTicket: number;
  }>;
  metadata: {
    lastUpdated: string;
    dataSource: string;
    filters: {
      status: string[];
      excludeTrials: boolean;
      period: string;
    };
  };
}

export interface SalesMonthlyChartDto {
  period: {
    startMonth: string;
    endMonth: string;
    months: number;
  };
  summary: {
    totalSales: number;
    totalValue: number;
    averagePerMonth: number;
    averageTicket: number;
  };
  monthlyData: Array<{
    month: string;
    monthFormatted: string;
    sales: number;
    value: number;
    averageTicket: number;
  }>;
  metadata: {
    lastUpdated: string;
    dataSource: string;
    filters: Record<string, any>;
  };
}

export interface CustomerAnalyticsDto {
  totalUsers: number;
  activeCustomers: number;
  returningCustomers: number;
  avgOrderValue: number;
  customerLTV: number;
  conversionRate: number;
}

export interface UserStreaksListDto {
  streaks: Array<{
    userId: string;
    userName: string;
    totalDays: number;
    maxStreak: number;
    currentStreak: number;
    isOnStreak: boolean;
    streakDays: string[];
  }>;
  totalUsers: number;
  lastUpdated: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  durationDays: number;
  totalUsers: number;
  totalValue: number;
  totalValueFormatted: string;
  averageTicket: number;
  averageTicketFormatted: string;
}

export interface RegistersResponse {
  total: number;
  rows: Array<{
    name: string | null;
    cpf: string | null;
    value: string | number | null;
    paymentMethod: string | null;
    plan: string | null;
    recurring: boolean | null;
    status: string | null;
    paymentProcessed: boolean | null;
    saleDate: string | null;
    phone: string | null;
    email: string | null;
    registeredAt: string | null;
    hasPurchase: boolean;
  }>;
}

// Status possíveis para os registros
export type PaymentStatus = 
  | 'PAID'
  | 'PENDING' 
  | 'EXPIRED'
  | 'REFUSED'
  | 'CANCELED'
  | 'REFUNDED'
  | string; // Permite outros status que possam ser adicionados

// Métodos de pagamento possíveis
export type PaymentMethod =
  | 'CREDIT_CARD'
  | 'SUBSCRIPTION'
  | 'BILLET'
  | 'PIX'
  | 'GIFT'
  | 'IN_APP'
  | string; // Permite outros métodos que possam ser adicionados

export type RegistersOrderBy = 'registration' | 'purchase';

// Helper types for periods
export type Period = '7d' | '15d' | '30d' | '6m' | '3m' | 'daily';
export type SalesGranularity = 'daily' | 'monthly';