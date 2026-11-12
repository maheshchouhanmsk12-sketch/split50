"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { Expense, Partner, SettlementSummary, Split50StorageState } from "@/types";
import {
  DEFAULT_PARTNERS,
  DEFAULT_EXPENSES,
  INITIAL_STORAGE_STATE,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "@/lib/storage";
import { calculateSettlementSummary } from "@/lib/calculations";

interface ToastInfo {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface SplitContextValue {
  isLoaded: boolean;
  partners: Partner[];
  activePartners: Partner[];
  expenses: Expense[];
  summary: SettlementSummary;
  activeTab: "dashboard" | "expenses" | "settings";
  setActiveTab: (tab: "dashboard" | "expenses" | "settings") => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isMemberModalOpen: boolean;
  setIsMemberModalOpen: (open: boolean) => void;
  editingExpense: Expense | null;
  setEditingExpense: (exp: Expense | null) => void;

  // Actions
  addExpense: (expense: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void;
  updateExpense: (id: string, updates: Partial<Omit<Expense, "id">>) => void;
  deleteExpense: (id: string) => void;

  addPartner: (name: string) => { success: boolean; error?: string };
  renamePartner: (id: string, name: string) => { success: boolean; error?: string };
  deletePartner: (id: string) => { success: boolean; error?: string };
  archivePartner: (id: string) => { success: boolean; error?: string };
  unarchivePartner: (id: string) => { success: boolean; error?: string };

  resetExpenses: () => void;
  resetAll: () => void;
  importData: (newState: Split50StorageState) => void;

  toasts: ToastInfo[];
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const SplitContext = createContext<SplitContextValue | null>(null);

export const PARTNER_AVATAR_COLORS = [
  "#B8F36B", // Electric Lime
  "#8B83F6", // Muted Violet
  "#FF8C72", // Soft Coral
  "#38BDF8", // Sky Blue
  "#FBBF24", // Amber
  "#34D399", // Emerald
  "#F472B6", // Pink
];

export function SplitProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [partners, setPartners] = useState<Partner[]>(DEFAULT_PARTNERS);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "expenses" | "settings">("dashboard");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Hydrate from localStorage once on client
  useEffect(() => {
    const loaded = loadFromLocalStorage();
    setPartners(loaded.partners);
    setExpenses(loaded.expenses);
    setIsLoaded(true);
  }, []);

  // Persist to localStorage whenever partners or expenses change, but ONLY after initial load
  useEffect(() => {
    if (!isLoaded) return;

    saveToLocalStorage({
      version: 1,
      partners,
      expenses,
      lastUpdated: new Date().toISOString(),
    });
  }, [isLoaded, partners, expenses]);

  const activePartners = useMemo(
    () => partners.filter((p) => !p.isArchived),
    [partners]
  );

  const summary = useMemo(
    () => calculateSettlementSummary(partners, expenses),
    [partners, expenses]
  );

  const addExpense = useCallback(
    (exp: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
      const newExpense: Expense = {
        ...exp,
        id: `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setExpenses((prev) => {
        const next = [newExpense, ...prev];
        saveToLocalStorage({
          version: 1,
          partners,
          expenses: next,
          lastUpdated: new Date().toISOString(),
        });
        return next;
      });
      showToast("Expense added successfully!", "success");
    },
    [partners, showToast]
  );

  const updateExpense = useCallback(
    (id: string, updates: Partial<Omit<Expense, "id">>) => {
      setExpenses((prev) => {
        const next = prev.map((e) =>
          e.id === id
            ? { ...e, ...updates, updatedAt: new Date().toISOString() }
            : e
        );
        saveToLocalStorage({
          version: 1,
          partners,
          expenses: next,
          lastUpdated: new Date().toISOString(),
        });
        return next;
      });
      showToast("Expense updated successfully!", "success");
    },
    [partners, showToast]
  );

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => {
        const next = prev.filter((e) => e.id !== id);
        saveToLocalStorage({
          version: 1,
          partners,
          expenses: next,
          lastUpdated: new Date().toISOString(),
        });
        return next;
      });
      showToast("Expense removed.", "info");
    },
    [partners, showToast]
  );

  const addPartner = useCallback(
    (name: string): { success: boolean; error?: string } => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { success: false, error: "Member name cannot be empty" };
      }

      if (partners.some((p) => p.name.toLowerCase() === trimmed.toLowerCase() && !p.isArchived)) {
        return { success: false, error: "An active member with this name already exists" };
      }

      const colorIndex = partners.length % PARTNER_AVATAR_COLORS.length;
      const newPartner: Partner = {
        id: `partner-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: trimmed,
        avatarColor: PARTNER_AVATAR_COLORS[colorIndex],
        isArchived: false,
        createdAt: new Date().toISOString(),
      };

      const updatedPartners = [...partners, newPartner];
      setPartners(updatedPartners);

      // Save immediately to localStorage for guaranteed persistence
      saveToLocalStorage({
        version: 1,
        partners: updatedPartners,
        expenses,
        lastUpdated: new Date().toISOString(),
      });

      showToast(`Member "${trimmed}" added!`, "success");
      return { success: true };
    },
    [partners, expenses, showToast]
  );

  const renamePartner = useCallback(
    (id: string, name: string): { success: boolean; error?: string } => {
      const trimmed = name.trim();
      if (!trimmed) {
        return { success: false, error: "Name cannot be empty" };
      }

      const updatedPartners = partners.map((p) =>
        p.id === id ? { ...p, name: trimmed } : p
      );
      setPartners(updatedPartners);

      // Save immediately to localStorage
      saveToLocalStorage({
        version: 1,
        partners: updatedPartners,
        expenses,
        lastUpdated: new Date().toISOString(),
      });

      showToast("Member renamed successfully", "success");
      return { success: true };
    },
    [partners, expenses, showToast]
  );

  const deletePartner = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const remainingPartners = partners.filter((p) => p.id !== id);
      if (remainingPartners.length === 0) {
        return {
          success: false,
          error: "At least one member is required in Split50.",
        };
      }

      const fallbackPartnerId = remainingPartners.find((p) => !p.isArchived)?.id || remainingPartners[0].id;

      // Clean up expenses referencing the deleted partner
      const updatedExpenses = expenses.map((exp) => {
        const newSplit = exp.splitAmongIds.filter((pId) => pId !== id);
        const finalSplit = newSplit.length > 0 ? newSplit : [fallbackPartnerId];
        const newPaidBy = exp.paidById === id ? fallbackPartnerId : exp.paidById;
        return {
          ...exp,
          paidById: newPaidBy,
          splitAmongIds: finalSplit,
          updatedAt: new Date().toISOString(),
        };
      });

      setPartners(remainingPartners);
      setExpenses(updatedExpenses);

      // Save immediately to localStorage
      saveToLocalStorage({
        version: 1,
        partners: remainingPartners,
        expenses: updatedExpenses,
        lastUpdated: new Date().toISOString(),
      });

      showToast("Member deleted successfully.", "info");
      return { success: true };
    },
    [partners, expenses, showToast]
  );

  const archivePartner = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const active = partners.filter((p) => !p.isArchived);
      if (active.length <= 1) {
        return {
          success: false,
          error: "At least one active member is required.",
        };
      }

      const updatedPartners = partners.map((p) =>
        p.id === id ? { ...p, isArchived: true } : p
      );
      setPartners(updatedPartners);

      saveToLocalStorage({
        version: 1,
        partners: updatedPartners,
        expenses,
        lastUpdated: new Date().toISOString(),
      });

      showToast("Member archived. Past records preserved.", "info");
      return { success: true };
    },
    [partners, expenses, showToast]
  );

  const unarchivePartner = useCallback(
    (id: string): { success: boolean; error?: string } => {
      const updatedPartners = partners.map((p) =>
        p.id === id ? { ...p, isArchived: false } : p
      );
      setPartners(updatedPartners);

      saveToLocalStorage({
        version: 1,
        partners: updatedPartners,
        expenses,
        lastUpdated: new Date().toISOString(),
      });

      showToast("Member restored to active list.", "success");
      return { success: true };
    },
    [partners, expenses, showToast]
  );

  const resetExpenses = useCallback(() => {
    setExpenses([]);
    saveToLocalStorage({
      version: 1,
      partners,
      expenses: [],
      lastUpdated: new Date().toISOString(),
    });
    showToast("All expenses have been reset.", "info");
  }, [partners, showToast]);

  const resetAll = useCallback(() => {
    setPartners(DEFAULT_PARTNERS);
    setExpenses(DEFAULT_EXPENSES);
    saveToLocalStorage({
      version: 1,
      partners: DEFAULT_PARTNERS,
      expenses: DEFAULT_EXPENSES,
      lastUpdated: new Date().toISOString(),
    });
    showToast("Application reset to default state.", "info");
  }, [showToast]);

  const importData = useCallback(
    (newState: Split50StorageState) => {
      setPartners(newState.partners);
      setExpenses(newState.expenses);
      saveToLocalStorage(newState);
      showToast("Backup restored successfully!", "success");
    },
    [showToast]
  );

  return (
    <SplitContext.Provider
      value={{
        isLoaded,
        partners,
        activePartners,
        expenses,
        summary,
        activeTab,
        setActiveTab,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isMemberModalOpen,
        setIsMemberModalOpen,
        editingExpense,
        setEditingExpense,
        addExpense,
        updateExpense,
        deleteExpense,
        addPartner,
        renamePartner,
        deletePartner,
        archivePartner,
        unarchivePartner,
        resetExpenses,
        resetAll,
        importData,
        toasts,
        showToast,
      }}
    >
      {children}
    </SplitContext.Provider>
  );
}

export function useSplit() {
  const context = useContext(SplitContext);
  if (!context) {
    throw new Error("useSplit must be used within a SplitProvider");
  }
  return context;
}
