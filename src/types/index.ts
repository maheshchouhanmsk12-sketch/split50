export type ExpenseCategory =
  | "Groceries"
  | "Rent"
  | "Electricity"
  | "Milk"
  | "Vegetables"
  | "Food"
  | "Internet"
  | "Travel"
  | "Other";

export interface Partner {
  id: string;
  name: string;
  avatarColor?: string;
  isArchived: boolean;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amountPaise: number; // Stored in integer paise (e.g. ₹100.50 -> 10050)
  date: string; // ISO date string YYYY-MM-DD
  paidById: string;
  splitAmongIds: string[]; // Partner IDs sharing this expense
  category: ExpenseCategory;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementTransfer {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountPaise: number;
}

export interface PartnerMetric {
  partnerId: string;
  partnerName: string;
  isArchived: boolean;
  paidPaise: number;
  owedPaise: number;
  netBalancePaise: number; // positive = should receive; negative = owes
}

export interface SettlementSummary {
  totalExpenditurePaise: number;
  partnerCount: number;
  partnerMetrics: PartnerMetric[];
  transfers: SettlementTransfer[];
  isSettled: boolean;
  headlineStatus: string;
  detailedStatus: string;
}

export interface Split50StorageState {
  version: number;
  partners: Partner[];
  expenses: Expense[];
  lastUpdated: string;
}

export type ThemeMode = "light" | "dark" | "system";

