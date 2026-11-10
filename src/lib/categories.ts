import { ExpenseCategory } from "@/types";

export interface CategoryMeta {
  key: ExpenseCategory;
  label: string;
  iconName: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "Groceries", label: "Groceries", iconName: "ShoppingBag" },
  { key: "Rent", label: "Rent", iconName: "Home" },
  { key: "Electricity", label: "Electricity", iconName: "Zap" },
  { key: "Milk", label: "Milk", iconName: "CupSoda" },
  { key: "Vegetables", label: "Vegetables", iconName: "Carrot" },
  { key: "Food", label: "Food & Dining", iconName: "Utensils" },
  { key: "Internet", label: "Internet & WiFi", iconName: "Wifi" },
  { key: "Travel", label: "Travel & Fuel", iconName: "Car" },
  { key: "Other", label: "Other", iconName: "Layers" },
];

export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; border: string }> = {
  Groceries: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20" },
  Rent: { bg: "bg-violet-500/10", text: "text-violet-500", border: "border-violet-500/20" },
  Electricity: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20" },
  Milk: { bg: "bg-sky-500/10", text: "text-sky-500", border: "border-sky-500/20" },
  Vegetables: { bg: "bg-green-500/10", text: "text-green-500", border: "border-green-500/20" },
  Food: { bg: "bg-orange-500/10", text: "text-orange-500", border: "border-orange-500/20" },
  Internet: { bg: "bg-indigo-500/10", text: "text-indigo-500", border: "border-indigo-500/20" },
  Travel: { bg: "bg-cyan-500/10", text: "text-cyan-500", border: "border-cyan-500/20" },
  Other: { bg: "bg-slate-500/10", text: "text-slate-400", border: "border-slate-500/20" },
};

