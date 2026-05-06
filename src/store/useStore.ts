import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  membershipLevel?: string;
  role: 'USER' | 'ADMIN';
  isSuperAdmin?: boolean;
  googleId?: string;
  verifiedBy?: 'OTP' | 'Google';
}

export interface Transaction {
  id: string;
  title: string;
  subtitle?: string;
  amount: number;
  status: string;
  icon?: string;
  type: 'debit' | 'credit';
  date?: string;
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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isSuperAdmin: boolean;
  kycVerified: boolean;
  plan?: string;
  createdAt?: string;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (user: User) => void;
  logout: () => void;

  // Dashboard State
  dashboardStats: DashboardStats;
  transactions: Transaction[];

  // Admin State
  adminUsers: AdminUser[];

  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateDashboardStats: (stats: Partial<DashboardStats>) => void;
  setAdminUsers: (users: AdminUser[]) => void;
  setTransactions: (transactions: Transaction[]) => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const initialDashboardStats: DashboardStats = {
  totalValue: 0,
  profitLoss: 0,
  allocation: {
    domesticEquity: 0,
    foreignAssets: 0,
    digitalGold: 0
  }
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isSuperAdmin: false,
      login: (user) => set({
        user,
        isAuthenticated: true,
        isAdmin: user.role === 'ADMIN',
        isSuperAdmin: user.isSuperAdmin ?? false,
      }),
      logout: () => {
        // Clear tokens from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('caft_access_token');
          localStorage.removeItem('caft_refresh_token');
          // Clear the auth cookie used by Next.js middleware
          document.cookie = 'caft_auth=; path=/; max-age=0';
          // Clear any session storage items
          sessionStorage.removeItem('caft_login_email');
          sessionStorage.removeItem('caft_post_login_redirect');
        }
        // Set state — Zustand persist will auto-save the logged-out state
        set({ user: null, isAuthenticated: false, isAdmin: false, isSuperAdmin: false });
      },

      dashboardStats: initialDashboardStats,
      transactions: [],
      adminUsers: [],

      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
          dashboardStats: {
            ...state.dashboardStats,
            totalValue: transaction.type === 'credit'
              ? state.dashboardStats.totalValue + transaction.amount
              : state.dashboardStats.totalValue - transaction.amount
          }
        })),

      updateDashboardStats: (stats) =>
        set((state) => ({
          dashboardStats: { ...state.dashboardStats, ...stats }
        })),

      setAdminUsers: (users) => set({ adminUsers: users }),
      setTransactions: (transactions) => set({ transactions }),

      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open })
    }),
    {
      name: 'caft-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isSuperAdmin: state.isSuperAdmin,
      }),
    }
  )
);
