export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  subscriptionStatus: 'pending' | 'active' | 'expired';
  subscriptionStartDate: string | null;
  subscriptionExpiryDate: string | null;
  isActive?: boolean;
  renewalRequested?: boolean;
  createdAt?: string;
}

export interface Stream {
  _id: string;
  title: string;
  description?: string;
  streamUrl: string;
  thumbnailUrl?: string;
  isLive: boolean;
  category: string;
  viewerCount: number;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  expiredUsers: number;
  renewalRequests: number;
}
