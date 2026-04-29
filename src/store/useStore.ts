import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  membershipLevel: string;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  icon: string;
  type: 'debit' | 'credit';
  date: string;
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
  initials: string;
  name: string;
  email: string;
  status: string;
  plan: string;
  investment: number;
  colorClass: string;
}

interface AppState {
  // Auth State
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User, isAdmin?: boolean) => void;
  logout: () => void;

  // Dashboard State
  dashboardStats: DashboardStats;
  transactions: Transaction[];
  
  // Admin State
  adminUsers: AdminUser[];

  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateDashboardStats: (stats: Partial<DashboardStats>) => void;
  setAdminUsers: (users: AdminUser[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
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
      login: (user, isAdmin = false) => set({ user, isAuthenticated: true, isAdmin }),
      logout: () => set({ user: null, isAuthenticated: false, isAdmin: false }),

      dashboardStats: initialDashboardStats,
      transactions: [],
      adminUsers: [],

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
      setTransactions: (transactions) => set({ transactions })
    }),
    {
      name: 'caft-storage',
    }
  )
);
