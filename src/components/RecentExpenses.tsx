"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { CATEGORIES } from "@/lib/categories";
import { ConfirmModal } from "./ConfirmModal";
import {
  ArrowRight,
  Plus,
  ShoppingBag,
  Home,
  Zap,
  CupSoda,
  Carrot,
  Utensils,
  Wifi,
  Car,
  Layers,
  Edit2,
  Trash2,
} from "lucide-react";

export function RecentExpenses() {
  const { expenses, partners, setActiveTab, setIsAddExpenseOpen, setEditingExpense, deleteExpense } = useSplit();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const recent = expenses.slice(0, 5);

  const getPartnerName = (id: string) => {
    return partners.find((p) => p.id === id)?.name || "Unknown";
  };

  const getCategoryIcon = (categoryName: string) => {
    const meta = CATEGORIES.find((c) => c.key === categoryName);
    switch (meta?.iconName) {
      case "ShoppingBag": return <ShoppingBag className="w-4 h-4" />;
      case "Home": return <Home className="w-4 h-4" />;
      case "Zap": return <Zap className="w-4 h-4" />;
      case "CupSoda": return <CupSoda className="w-4 h-4" />;
      case "Carrot": return <Carrot className="w-4 h-4" />;
      case "Utensils": return <Utensils className="w-4 h-4" />;
      case "Wifi": return <Wifi className="w-4 h-4" />;
      case "Car": return <Car className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="rounded-3xl p-6 sm:p-7 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Recent Expenses
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">Latest recorded transactions</p>
          </div>

          {expenses.length > 0 && (
            <button
              onClick={() => setActiveTab("expenses")}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
            >
              <span>View Passbook</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="py-10 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">
              No expenses yet
            </p>
            <p className="text-xs text-[var(--text-secondary)] max-w-xs mb-4">
              Add your first expense to get started and see settlements calculated instantly.
            </p>
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Add First Expense
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {recent.map((exp) => (
              <div
                key={exp.id}
                className="py-3.5 flex items-center justify-between gap-3 group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--bg-subtle)] text-emerald-600 dark:text-emerald-400 shrink-0">
                    {getCategoryIcon(exp.category)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                      {exp.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span>{exp.date}</span>
                      <span>•</span>
                      <span className="truncate">Paid by {getPartnerName(exp.paidById)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-extrabold text-[var(--text-primary)] font-tabular">
                    {formatPaise(exp.amountPaise)}
                  </span>

                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingExpense(exp)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
                      title="Edit expense"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(exp.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-subtle)]"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This will immediately recalculate all partners' balances."
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTargetId) {
            deleteExpense(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}
