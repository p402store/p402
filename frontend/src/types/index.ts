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
