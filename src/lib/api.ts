// Centralized HTTP client for Analytics API
// Handles timeout, error handling, and type safety

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

// Analytics-specific API paths
export const analyticsApi = {
  registrations: (period?: string) => apiGet('/analytics/registrations', { period }),
  conversion: () => apiGet('/analytics/conversion'),
  sales: (period?: string) => apiGet('/analytics/sales', { period }),
  customers: () => apiGet('/analytics/customers'),
  userStreaks: () => apiGet('/analytics/user-streaks'),
  registers: (limit?: number, skip?: number) => apiGet('/analytics/registers', { limit, skip }),
} as const;