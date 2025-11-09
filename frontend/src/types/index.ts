export interface Api {
  id: string;
  owner_address: string;
  api_name: string;
  description: string;
  documentation?: string;
  target_url: string;
  price: string;
  network: string;
  is_active: number;
  verified: number;
  headers?: Record<string, string>; // Custom headers for proxy requests
  created_at: number;
  updated_at: number;
}

export interface ApiFormData {
  api_name: string;
  description: string;
  documentation?: string;
  target_url: string;
  price: string;
  network: 'ethereum' | 'polygon' | 'solana' | 'base' | 'arbitrum';
  headers?: Record<string, string>; // Custom headers
}

export interface User {
  address: string;
  network?: string;
}

export interface UsageStats {
  totalRequests: number;
  totalRevenue: string;
  apiCount: number;
  activeApis: number;
}

export interface PaymentHistory {
  id: number;
  endpoint: 'verify' | 'settle';
  network: string;
  payer: string | null;
  amount: string | null;
  token: string | null;
  recipient: string | null;
  success: number;
  error_reason: string | null;
  transaction_hash: string | null;
  created_at: number;
}

export interface PaymentAnalytics {
  date: string;
  endpoint: string;
  network: string;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate: number;
}

export interface PaymentStats {
  total_payments: number;
  successful_payments: number;
  failed_payments: number;
  unique_payers: number;
  networks_used: number;
  recent_payments: number;
  by_network: Array<{
    network: string;
    count: number;
    successful: number;
  }>;
}

export interface PaymentHistoryFilters {
  endpoint?: 'verify' | 'settle';
  network?: string;
  success?: boolean;
  payer?: string;
  limit?: number;
  offset?: number;
}
