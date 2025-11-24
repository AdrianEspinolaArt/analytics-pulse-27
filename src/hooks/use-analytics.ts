// React Query hooks for Analytics API
// Handles caching, loading states, and error handling

import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api';
import type {
  CadastroMetricsDto,
  ConversionMetricsDto,
  SalesChartDto,
  SalesMonthlyChartDto,
  CustomerAnalyticsDto,
  UserStreaksListDto,
  RegistersResponse,
  RegistersOrderBy,
  PlanSummary,
} from '@/types/analytics';

// Cache keys
const QUERY_KEYS = {
  registrations: (period?: string) => ['analytics', 'registrations', period] as const,
  conversion: () => ['analytics', 'conversion'] as const,
  sales: (period?: string) => ['analytics', 'sales', period] as const,
  customers: () => ['analytics', 'customers'] as const,
  userStreaks: () => ['analytics', 'user-streaks'] as const,
  registers: (limit?: number, skip?: number, orderBy?: RegistersOrderBy) => ['analytics', 'registers', limit, skip, orderBy] as const,
  plans: () => ['analytics', 'plans'] as const,
};

// Hook for registration metrics
export function useRegistrations(period?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.registrations(period),
    queryFn: () => analyticsApi.registrations(period) as Promise<CadastroMetricsDto>,
    staleTime: period && ['7d', 'daily'].includes(period) ? 60 * 1000 : 5 * 60 * 1000, // 1min for short periods, 5min for longer
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Hook for conversion metrics
export function useConversion() {
  return useQuery({
    queryKey: QUERY_KEYS.conversion(),
    queryFn: () => analyticsApi.conversion() as Promise<ConversionMetricsDto>,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for sales data (daily)
export function useSales(period?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sales(period),
    queryFn: () => analyticsApi.sales(period) as Promise<SalesChartDto>,
    staleTime: period && period.endsWith('d') && parseInt(period) <= 7 ? 60 * 1000 : 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: !period?.includes('m'), // Only for daily data
  });
}

// Hook for monthly sales data  
export function useSalesMonthly(period?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sales(period),
    queryFn: () => analyticsApi.sales(period) as Promise<SalesMonthlyChartDto>,
    staleTime: 10 * 60 * 1000, // 10 minutes for monthly data
    refetchInterval: 10 * 60 * 1000,
    enabled: Boolean(period?.includes('m')), // Only for monthly data (6m, 3m, etc)
  });
}

// Hook for customer analytics
export function useCustomers() {
  return useQuery({
    queryKey: QUERY_KEYS.customers(),
    queryFn: () => analyticsApi.customers() as Promise<CustomerAnalyticsDto>,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for user streaks
export function useUserStreaks() {
  return useQuery({
    queryKey: QUERY_KEYS.userStreaks(),
    queryFn: () => analyticsApi.userStreaks() as Promise<UserStreaksListDto>,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

// Hook for registers with pagination
export function useRegisters(limit?: number, skip?: number, orderBy: RegistersOrderBy = 'registration') {
  return useQuery({
    queryKey: QUERY_KEYS.registers(limit, skip, orderBy),
    queryFn: () => {
      console.log('🎣 useRegisters queryFn called:', { limit, skip, orderBy });
      return analyticsApi.registers(limit, skip, orderBy) as Promise<RegistersResponse>;
    },
    staleTime: 0, // No cache - always fresh data
    gcTime: 0, // Garbage collect immediately
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Hook for plans summary
export function usePlans() {
  return useQuery({
    queryKey: QUERY_KEYS.plans(),
    queryFn: () => analyticsApi.plans() as Promise<PlanSummary[]>,
    staleTime: 10 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}