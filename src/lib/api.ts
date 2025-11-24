import type { PlanSummary, RegistersOrderBy, RegistersResponse } from '@/types/analytics';

// Centralized HTTP client for Analytics API
// Handles timeout, error handling, and type safety

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export async function apiGet<T = any>(
  path: string,
  params?: Record<string, any>
): Promise<T> {
  // Use environment variable or fallback to empty string
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const url = new URL(path, baseUrl);
  
  // Add query parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  console.log('🌐 API Request:', url.toString());

  // Setup abort controller with 15s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeout);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
}

type PlanApiRecord = {
  id?: string | number;
  name?: string;
  plan?: string;
  duration_days?: number;
  durationDays?: number;
  total_usuarios?: number;
  quantidade_usuarios?: number;
  totalUsers?: number;
  valor_arrecadado?: number | string;
  valorArrecadado?: number | string;
  valor_arrecadado_formatado?: string;
  valor_arrecadado_formatted?: string;
  totalValueFormatted?: string;
  ticket_medio?: number | string;
  ticketMedio?: number | string;
  ticket?: number | string;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const normalized = value
      .replace(/[^0-9,.-]/g, '')
      .replace(/^(-?)[^0-9]+/, '$1')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function inferDurationDays(name: string, explicit?: number): number {
  if (typeof explicit === 'number' && Number.isFinite(explicit) && explicit > 0) {
    return explicit;
  }

  const upper = name.toUpperCase();

  if (upper.includes('ANUAL')) {
    return 360;
  }

  if (upper.includes('MENSAL')) {
    return 30;
  }

  return 0;
}

function normalizePlanRecord(raw: PlanApiRecord): PlanSummary {
  const name = typeof raw.name === 'string' && raw.name.trim().length > 0
    ? raw.name.trim()
    : typeof raw.plan === 'string' && raw.plan.trim().length > 0
      ? raw.plan.trim()
      : '—';

  const idSource = raw.id ?? raw.plan ?? raw.name ?? name;
  const id = typeof idSource === 'string' || typeof idSource === 'number'
    ? String(idSource)
    : name;

  const totalUsers = toNumber(raw.total_usuarios ?? raw.quantidade_usuarios ?? raw.totalUsers, 0);
  const totalValue = toNumber(raw.valor_arrecadado ?? raw.valorArrecadado, 0);
  const totalValueFormatted = raw.valor_arrecadado_formatado
    ?? raw.valor_arrecadado_formatted
    ?? raw.totalValueFormatted
    ?? currencyFormatter.format(totalValue);

  const averageTicket = toNumber(raw.ticket_medio ?? raw.ticketMedio ?? raw.ticket, 0);
  const averageTicketFormatted = currencyFormatter.format(averageTicket);

  const durationDays = inferDurationDays(
    name,
    typeof raw.duration_days === 'number' ? raw.duration_days : raw.durationDays,
  );

  return {
    id,
    name,
    durationDays,
    totalUsers,
    totalValue,
    totalValueFormatted,
    averageTicket,
    averageTicketFormatted,
  };
}

async function fetchRegistersPage(limit?: number, skip?: number, orderBy?: RegistersOrderBy) {
  console.log('🔍 API Call - fetchRegistersPage:', { limit, skip, orderBy });
  const result = await apiGet<RegistersResponse>('/analytics/registrations/records', { limit, skip, orderBy });
  console.log('✅ API Response - fetchRegistersPage:', {
    total: result.total,
    rowsCount: result.rows?.length,
    firstEmail: result.rows?.[0]?.email,
    lastEmail: result.rows?.[result.rows?.length - 1]?.email,
  });
  return result;
}

// Analytics-specific API paths
export const analyticsApi = {
  registrations: (period?: string) => apiGet('/analytics/registrations', { period }),
  conversion: () => apiGet('/analytics/conversion'),
  sales: (period?: string) => apiGet('/analytics/sales', { period }),
  customers: () => apiGet('/analytics/customers'),
  userStreaks: () => apiGet('/analytics/user-streaks'),
  registers: fetchRegistersPage,
  fetchAllRegisters: async (
    orderBy: RegistersOrderBy = 'registration',
    chunkSize = 500,
  ): Promise<RegistersResponse> => {
    const limit = Math.max(1, chunkSize);
    let skip = 0;
    let expectedTotal: number | null = null;
    const rows: RegistersResponse['rows'] = [];

    while (true) {
      const page = await fetchRegistersPage(limit, skip, orderBy);
      const pageRows = page?.rows ?? [];

      if (expectedTotal === null && typeof page?.total === 'number') {
        expectedTotal = page.total;
      }

      if (!pageRows.length) {
        break;
      }

      rows.push(...pageRows);
      skip += limit;

      if ((expectedTotal !== null && rows.length >= expectedTotal) || pageRows.length < limit) {
        break;
      }
    }

    return {
      total: expectedTotal ?? rows.length,
      rows,
    };
  },
  plans: async (): Promise<PlanSummary[]> => {
    const response = await apiGet<unknown>('/analytics/plans');

    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((item) => normalizePlanRecord(item as PlanApiRecord));
  },
} as const;