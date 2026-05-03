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
    bundles: () => apiFetch<PlanBundleItem[]>('/plans/bundles'),
  },

  // ── Subscriptions ───────────────────────────────────
  subscriptions: {
    active: () => apiFetch<SubscriptionInfo | null>('/subscriptions/active'),
    create: (planId: string, billingCycle: BillingCycleType) =>
      apiFetch<{ subscriptionId: string; shortUrl: string }>('/subscriptions/create', {
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

    // ── Reviews (Admin) ────────────────────────────────
    reviews: {
      all: () => apiFetch<ReviewItem[]>('/reviews/admin'),
      update: (id: string, data: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; comment?: string; rating?: number }) =>
        apiFetch<ReviewItem>(`/reviews/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => apiFetch(`/reviews/admin/${id}`, { method: 'DELETE' }),
    },
    
    // ── Uploads (Admin) ────────────────────────────────
    getUploadPresignedUrl: (filename: string, contentType: string) =>
      apiFetch<{ uploadUrl: string; publicUrl: string; fileKey: string }>('/upload/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      }),

    // ── Plans/Products (Admin) ─────────────────────────
    plans: {
      all: () => apiFetch<PlanItem[]>('/plans/admin'),
      get: (id: string) => apiFetch<PlanItem>(`/plans/admin/${id}`),
      create: (data: CreatePlanData) =>
        apiFetch<PlanItem>('/plans/admin', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<CreatePlanData>) =>
        apiFetch<PlanItem>(`/plans/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      duplicate: (id: string) =>
        apiFetch<PlanItem>(`/plans/admin/${id}/duplicate`, { method: 'POST' }),
      delete: (id: string) =>
        apiFetch(`/plans/admin/${id}`, { method: 'DELETE' }),
      bulkDiscount: (planIds: string[], discountPercent: number, discountLabel?: string) =>
        apiFetch('/plans/admin/bulk-discount', {
          method: 'POST',
          body: JSON.stringify({ planIds, discountPercent, discountLabel }),
        }),
      bulkRemoveDiscount: (planIds: string[]) =>
        apiFetch('/plans/admin/bulk-discount', {
          method: 'DELETE',
          body: JSON.stringify({ planIds }),
        }),
    },

    // ── Bundles (Admin) ──────────────────────────────────
    bundles: {
      all: () => apiFetch<PlanBundleItem[]>('/plans/admin/bundles'),
      create: (data: CreateBundleData) =>
        apiFetch<PlanBundleItem>('/plans/admin/bundles', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: Partial<CreateBundleData>) =>
        apiFetch<PlanBundleItem>(`/plans/admin/bundles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) =>
        apiFetch(`/plans/admin/bundles/${id}`, { method: 'DELETE' }),
    },

    // ── Analytics (Admin) ──────────────────────────────────
    analytics: {
      subscriptions: () => apiFetch<SubscriptionAnalytics>('/admin/analytics/subscriptions'),
      revenue: () => apiFetch<RevenueAnalytics>('/admin/analytics/revenue'),
      churn: () => apiFetch<ChurnAnalytics>('/admin/analytics/churn'),
      growth: () => apiFetch<GrowthAnalytics>('/admin/analytics/growth'),
      rates: () => apiFetch<SubscriptionRate[]>('/admin/analytics/rates'),
    },

    // ── Campaigns ──────────────────────────────────────
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

  // ── Uploads (Admin) ──────────────────────────────────
  upload: {
    getPresignedUrl: (filename: string, contentType: string) =>
      apiFetch<{ uploadUrl: string; publicUrl: string; fileKey: string }>('/upload/presigned-url', {
        method: 'POST',
        body: JSON.stringify({ filename, contentType }),
      }),
  },

  // ── Reviews ──────────────────────────────────────────
  reviews: {
    getForPlan: (planId: string) => 
      apiFetch<{ reviews: ReviewItem[]; averageRating: number; totalReviews: number }>(`/reviews/plan/${planId}`),
    create: (planId: string, rating: number, comment?: string) =>
      apiFetch<ReviewItem>('/reviews', { method: 'POST', body: JSON.stringify({ planId, rating, comment }) }),
    admin: {
      all: () => apiFetch<ReviewItem[]>('/reviews/admin'),
      update: (id: string, data: { status?: 'PENDING' | 'APPROVED' | 'REJECTED'; comment?: string; rating?: number }) =>
        apiFetch<ReviewItem>(`/reviews/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: string) => apiFetch(`/reviews/admin/${id}`, { method: 'DELETE' }),
    },
  },

  // ── Public (no auth) ─────────────────────────────────
  public: {
    settings: () => apiFetch<Record<string, string>>('/settings/public'),
  },
};

// ── Shared Types ──────────────────────────────────────

export type BillingCycleType =
  | 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'
  | 'QUARTERLY' | 'HALFYEARLY' | 'ANNUALLY' | 'ONETIME';

export const BILLING_CYCLE_LABELS: Record<BillingCycleType, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALFYEARLY: 'Half-yearly',
  ANNUALLY: 'Annually',
  ONETIME: 'One-time',
};

export const BILLING_CYCLE_SHORT: Record<BillingCycleType, string> = {
  DAILY: '/day',
  WEEKLY: '/wk',
  BIWEEKLY: '/2wk',
  MONTHLY: '/mo',
  QUARTERLY: '/qtr',
  HALFYEARLY: '/6mo',
  ANNUALLY: '/yr',
  ONETIME: '',
};

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

// ── Plan Types ────────────────────────────────────────

export interface PlanPricingItem {
  id?: string;
  billingCycle: BillingCycleType;
  price: number; // in paise
  razorpayPlanId?: string;
  isActive?: boolean;
}

export interface PlanFeatureItem {
  id?: string;
  name: string;
  included: boolean;
  value?: string;
  icon?: string;
  sortOrder?: number;
}

export interface PlanItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  planType: 'FREE' | 'PAID';
  itemCategory: 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE';
  currency: string;
  bannerBadge?: string | null;
  images: string[];
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  stockLimit?: number | null;
  taxPercentage?: number | null;
  isOneTime: boolean;
  oneTimePrice?: number | null;
  freeTrialEnabled: boolean;
  freeTrialDays?: number | null;
  discountPercent?: number | null;
  discountLabel?: string | null;
  features: PlanFeatureItem[];
  pricing: PlanPricingItem[];
  _count?: { subscriptions: number };
}

export interface CreatePlanData {
  name: string;
  slug: string;
  description: string;
  planType: 'FREE' | 'PAID';
  itemCategory?: 'SUBSCRIPTION' | 'DIGITAL_PRODUCT' | 'PHYSICAL_PRODUCT' | 'SERVICE';
  currency?: string;
  bannerBadge?: string;
  images?: string[];
  isPopular?: boolean;
  sortOrder?: number;
  stockLimit?: number;
  taxPercentage?: number;
  isOneTime?: boolean;
  oneTimePrice?: number;
  freeTrialEnabled?: boolean;
  freeTrialDays?: number;
  discountPercent?: number;
  discountLabel?: string;
  pricing: { billingCycle: BillingCycleType; price: number }[];
  features: { name: string; included: boolean; value?: string; icon?: string; sortOrder?: number }[];
}

// ── Bundle Types ──────────────────────────────────────

export interface PlanBundleItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency: string;
  isActive: boolean;
  plans: { plan: PlanItem }[];
  _count?: { subscriptions: number };
}

export interface CreateBundleData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  planIds: string[];
}

// ── Subscription Types ────────────────────────────────

export interface SubscriptionInfo {
  id: string;
  planId: string;
  status: string;
  billingCycle: BillingCycleType;
  isOneTime: boolean;
  discountApplied?: number;
  trialEndsAt?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  plan: PlanItem;
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

// ── Admin Types ───────────────────────────────────────

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

// ── Analytics Types ───────────────────────────────────

export interface SubscriptionAnalytics {
  totalSubscribers: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  cancelledSubscriptions: number;
  expiredSubscriptions: number;
  haltedSubscriptions: number;
  pendingSubscriptions: number;
  perPlanBreakdown: { planId: string; planName: string; activeSubscribers: number }[];
  perCycleBreakdown: { billingCycle: string; count: number }[];
}

export interface RevenueAnalytics {
  totalRevenue: number;
  totalPayments: number;
  mrr: number;
  arr: number;
  revenueByPlan: { planId: string; planName: string; revenue: number; count: number }[];
  monthlyRevenue: { period: string; revenue: number; count: number }[];
}

export interface ChurnAnalytics {
  totalCancelled: number;
  cancelledLast30Days: number;
  cancelledLast90Days: number;
  churnRate30Day: number;
  failedPayments: number;
  haltedSubscriptions: number;
  cancelReasons: { reason: string; count: number }[];
  recentCancellations: {
    id: string;
    userName: string;
    userEmail: string;
    planName: string;
    cancelledAt: string | null;
    cancelReason: string | null;
  }[];
}

export interface GrowthAnalytics {
  newSubscriptionsMonthly: { month: string; count: number }[];
  cancellationsMonthly: { month: string; count: number }[];
  trialConversionRate: number;
  totalTrials: number;
  convertedTrials: number;
  abandonedSubscriptions: number;
  typeBreakdown: { oneTime: number; recurring: number };
}

export interface SubscriptionRate {
  period: string;
  newSubscriptions: number;
  cancellations: number;
  netGrowth: number;
}

// ── Campaign Types ────────────────────────────────────

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

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  userId: string;
  planId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user?: { id: string; name: string; avatarUrl?: string; email?: string };
  plan?: { id: string; name: string };
}
