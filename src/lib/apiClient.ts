// ─────────────────────────────────────────────────────────
// CAFT Financial — Centralized API Client
// ─────────────────────────────────────────────────────────

const API_BASE = '/api'; // Proxied to backend via next.config rewrites

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
}

interface PaginatedApiResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/** Get stored tokens */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('caft_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('caft_refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('caft_access_token', access);
  localStorage.setItem('caft_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('caft_access_token');
  localStorage.removeItem('caft_refresh_token');
}

/** Attempt to refresh the access token */
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const json: ApiResponse<{ accessToken: string }> = await res.json();
    const newToken = json.data.accessToken;
    localStorage.setItem('caft_access_token', newToken);
    return newToken;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * Core fetch wrapper with:
 * - Auto-attaches Authorization header
 * - Auto-refreshes token on 401
 * - Typed response
 */
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  // If 401 and we haven't retried, try refreshing the token
  if (res.status === 401 && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, options, false);
    }
    // Redirect to login if refresh failed
    if (typeof window !== 'undefined') {
      clearTokens();
      window.location.href = '/login';
    }
  }

  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json.message || 'Request failed', res.status, json);
  }

  return json as ApiResponse<T>;
}

/** Paginated fetch wrapper */
async function apiFetchPaginated<T>(
  path: string,
  options: RequestInit = {},
): Promise<PaginatedApiResponse<T>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw new ApiError(json.message || 'Request failed', res.status, json);
  return json as PaginatedApiResponse<T>;
}

// ── Custom API Error Class ────────────────────────────

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ── API Methods ───────────────────────────────────────

export const api = {
  // ── Auth ────────────────────────────────────────────
  auth: {
    login: (email: string) =>
      apiFetch<{ message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email: string, otpCode: string) =>
      apiFetch<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp: otpCode }),
      }),
    adminLogin: (email: string, password: string) =>
      apiFetch<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    refresh: () => refreshAccessToken(),
    logout: async () => {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
      clearTokens();
    },
  },

  // ── User (self) ─────────────────────────────────────
  user: {
    me: () => apiFetch<UserProfile>('/users/me'),
    update: (data: Partial<UserProfile>) =>
      apiFetch<UserProfile>('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    linkedAccounts: () => apiFetch<LinkedAccount[]>('/users/me/linked-accounts'),
    removeLinkedAccount: (id: string) =>
      apiFetch(`/users/me/linked-accounts/${id}`, { method: 'DELETE' }),
    notifications: () => apiFetch<NotificationPrefs>('/users/me/notifications'),
    updateNotifications: (data: Partial<NotificationPrefs>) =>
      apiFetch<NotificationPrefs>('/users/me/notifications', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    security: (data: { twoFactorEnabled?: boolean; biometricEnabled?: boolean }) =>
      apiFetch('/users/me/security', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    transactions: (limit = 10) =>
      apiFetch<TransactionItem[]>(`/users/me/transactions?limit=${limit}`),
  },

  // ── Plans (Public) ──────────────────────────────────
  plans: {
    list: () => apiFetch<PlanItem[]>('/plans'),
  },

  // ── Subscriptions ───────────────────────────────────
  subscriptions: {
    active: () => apiFetch<SubscriptionInfo | null>('/subscriptions/active'),
    create: (planId: string, billingCycle: 'MONTHLY' | 'YEARLY') =>
      apiFetch<{ subscriptionId: string; shortUrl: string }>('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planId, billingCycle }),
      }),
    cancel: (reason?: string) =>
      apiFetch('/subscriptions/cancel', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },

  // ── Payments ────────────────────────────────────────
  payments: {
    history: (page = 1, limit = 10) =>
      apiFetchPaginated<PaymentItem>(`/payments?page=${page}&limit=${limit}`),
  },

  // ── Stats ───────────────────────────────────────────
  stats: {
    dashboard: () => apiFetch<DashboardStats>('/stats'),
  },

  // ── Admin ───────────────────────────────────────────
  admin: {
    statsOverview: () => apiFetch<AdminStatsOverview>('/admin/stats/overview'),
    revenue: () => apiFetch('/admin/stats/revenue'),
    users: (params?: string) =>
      apiFetchPaginated<AdminUserItem>(`/admin/users${params ? `?${params}` : ''}`),
    createUser: (data: { email: string; name: string; phone?: string }) =>
      apiFetch('/admin/users', { method: 'POST', body: JSON.stringify(data) }),
    createAdmin: (data: { email: string; name: string; password: string }) =>
      apiFetch('/admin/admins', { method: 'POST', body: JSON.stringify(data) }),
    updateUser: (id: string, data: { role?: string; isActive?: boolean }) =>
      apiFetch(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
      apiFetch(`/admin/users/${id}`, { method: 'DELETE' }),
    settings: () => apiFetch<Record<string, string>>('/admin/settings'),
    updateSettings: (data: Record<string, string | boolean>) =>
      apiFetch('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
    plans: {
      all: () => apiFetch<PlanItem[]>('/plans/admin'),
      get: (id: string) => apiFetch<PlanItem>(`/plans/admin/${id}`),
      create: (data: CreatePlanData) =>
        apiFetch('/plans/admin', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<CreatePlanData>) =>
        apiFetch(`/plans/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      updatePricing: (id: string, priceMonthly: number, priceYearly: number) =>
        apiFetch(`/plans/admin/${id}/pricing`, {
          method: 'PATCH',
          body: JSON.stringify({ priceMonthly, priceYearly }),
        }),
      delete: (id: string) =>
        apiFetch(`/plans/admin/${id}`, { method: 'DELETE' }),
    },
    campaigns: {
      list: () => apiFetch<CampaignItem[]>('/emails/campaigns'),
      create: (data: CreateCampaignData) =>
        apiFetch('/emails/campaigns', { method: 'POST', body: JSON.stringify(data) }),
      send: (id: string) =>
        apiFetch(`/emails/campaigns/${id}/send`, { method: 'POST' }),
      stats: (id: string) => apiFetch(`/emails/campaigns/${id}/stats`),
    },
    templates: {
      list: () => apiFetch<EmailTemplate[]>('/emails/templates'),
      create: (data: { name: string; subject: string; htmlContent: string }) =>
        apiFetch('/emails/templates', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<{ name: string; subject: string; htmlContent: string }>) =>
        apiFetch(`/emails/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        apiFetch(`/emails/templates/${id}`, { method: 'DELETE' }),
    },
    // Danger Zone (Superadmin only)
    danger: {
      tables: () => apiFetch<DangerTableInfo[]>('/admin/danger/tables'),
      records: (table: string, page = 1, limit = 100) =>
        apiFetchPaginated<Record<string, unknown>>(`/admin/danger/tables/${table}?page=${page}&limit=${limit}`),
      deleteRecord: (table: string, id: string) =>
        apiFetch(`/admin/danger/tables/${table}/${id}`, { method: 'DELETE' }),
    },
  },
};

// ── Shared Types ──────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: 'USER' | 'ADMIN';
  isSuperAdmin?: boolean;
  membershipLevel?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  kycVerified: boolean;
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  referralCode?: string;
  membershipLevel?: string;
}

export interface LinkedAccount {
  id: string;
  bankName: string;
  bankAbbr: string;
  accountName: string;
  last4: string;
  accountType?: string;
  colorClass?: string;
}

export interface NotificationPrefs {
  monthlyStatements: boolean;
  transactionAlerts: boolean;
  promotionalOffers: boolean;
  immediatePaymentAlerts: boolean;
  securityLogins: boolean;
  billReminders: boolean;
}

export interface TransactionItem {
  id: string;
  title: string;
  subtitle?: string;
  amount: number;
  type: 'debit' | 'credit';
  status: string;
  icon?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalValue: number;
  profitLoss: number;
  allocation: {
    domesticEquity: number;
    foreignAssets: number;
    digitalGold: number;
  };
}

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  features: { id?: string; name: string; included: boolean; value?: string }[];
}

export interface SubscriptionInfo {
  id: string;
  planId: string;
  status: string;
  billingCycle: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  plan: { name: string; priceMonthly: number; priceYearly: number };
}

export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  description?: string;
  createdAt: string;
}

export interface AdminStatsOverview {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  securityScore: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  kycVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  subscriptions: { plan: { name: string } }[];
}

export interface CreatePlanData {
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isPopular?: boolean;
  sortOrder?: number;
  features: { name: string; included: boolean; value?: string }[];
}

export interface CampaignItem {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalFailed: number;
  createdAt: string;
  _count?: { recipients: number };
}

export interface CreateCampaignData {
  name: string;
  subject: string;
  templateId?: string;
  htmlContent?: string;
  scheduledAt?: string;
  recipientFilter?: { roles?: string[]; isActive?: boolean };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  updatedAt: string;
}

export interface DangerTableInfo {
  name: string;
  dbTable: string;
}
