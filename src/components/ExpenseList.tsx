"use client";

import React, { useState, useMemo } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { CATEGORIES } from "@/lib/categories";
import { ConfirmModal } from "./ConfirmModal";
import { Expense } from "@/types";
import {
  Search,
  Calendar,
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
  Plus,
} from "lucide-react";

export function ExpenseList() {
  const {
    expenses,
    partners,
    deleteExpense,
    setEditingExpense,
    setIsAddExpenseOpen,
  } = useSplit();

  const [searchQuery, setSearchQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Search text match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(query);
        const matchesDesc = (exp.description || "").toLowerCase().includes(query);
        const matchesCategory = exp.category.toLowerCase().includes(query);
        const payerName = getPartnerName(exp.paidById).toLowerCase();
        const matchesPayer = payerName.includes(query);

        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesPayer) {
          return false;
        }
      }

      // Partner filter
      if (partnerFilter !== "ALL") {
        const isPayer = exp.paidById === partnerFilter;
        const isParticipant = exp.splitAmongIds.includes(partnerFilter);
        if (!isPayer && !isParticipant) return false;
      }

      // Category filter
      if (categoryFilter !== "ALL" && exp.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [expenses, searchQuery, partnerFilter, categoryFilter, partners]);

  // Group by month: "November 2026", "October 2026", etc.
  const groupedByMonth = useMemo(() => {
    const groups: { monthKey: string; monthLabel: string; totalPaise: number; items: Expense[] }[] = [];
    const map = new Map<string, { monthLabel: string; totalPaise: number; items: Expense[] }>();

    for (const exp of filteredExpenses) {
      const expDate = new Date(exp.date);
      // Valid date check
      const isValidDate = !isNaN(expDate.getTime());
      const monthKey = isValidDate
        ? `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, "0")}`
        : "Other";
      const monthLabel = isValidDate
        ? expDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "Undated";

      if (!map.has(monthKey)) {
        map.set(monthKey, { monthLabel, totalPaise: 0, items: [] });
      }

      const group = map.get(monthKey)!;
      group.items.push(exp);
      group.totalPaise += exp.amountPaise;
    }

    // Convert map to sorted array (newest month first)
    const sortedKeys = Array.from(map.keys()).sort().reverse();
    for (const key of sortedKeys) {
      const g = map.get(key)!;
      // Ensure items within month are sorted newest date first
      g.items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      groups.push({
        monthKey: key,
        monthLabel: g.monthLabel,
        totalPaise: g.totalPaise,
        items: g.items,
      });
    }

    return groups;
  }, [filteredExpenses]);

  const totalFilteredPaise = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.amountPaise, 0);
  }, [filteredExpenses]);

  return (
    <>
      <div className="space-y-6">
        {/* Passbook Header & Filters */}
        <div className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Expense Passbook
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? "transaction" : "transactions"}
                {filteredExpenses.length > 0 && ` • Total ${formatPaise(totalFilteredPaise)}`}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs bg-[#B8F36B] text-[#17152B] hover:brightness-105 active:scale-95 transition-all shadow-md shadow-[#B8F36B]/15 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Expense</span>
            </button>
          </div>

          {/* Search bar & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search description, category, person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--muted-violet)]"
              />
            </div>

            {/* Filter by Partner */}
            <div>
              <select
                value={partnerFilter}
                onChange={(e) => setPartnerFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--muted-violet)]"
              >
                <option value="ALL">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isArchived ? "(Archived)" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--muted-violet)]"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses List Grouped by Month */}
        {filteredExpenses.length === 0 ? (
          <div className="rounded-3xl p-12 text-center border bg-[var(--bg-surface)] border-[var(--border-subtle)] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <p className="text-base font-bold text-[var(--text-primary)] mb-1">
              {expenses.length === 0
                ? "No expenses yet. Add your first expense to get started."
                : "No matching transactions found."}
            </p>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5">
              {expenses.length === 0
                ? "All shared expenses will appear here chronologically with monthly totals and instant settlement recalculation."
                : "Try adjusting your search terms or filters to locate expenses."}
            </p>
            {expenses.length === 0 && (
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsAddExpenseOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#B8F36B] text-[#17152B] hover:brightness-105 active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedByMonth.map((group) => (
              <div
                key={group.monthKey}
                className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4"
              >
                {/* Month Group Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#8B83F6]" />
                    <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                      {group.monthLabel}
                    </h2>
                  </div>
                  <div className="text-xs font-extrabold text-[#B8F36B] font-tabular">
                    Monthly Total: {formatPaise(group.totalPaise)}
                  </div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-[var(--border-subtle)]">
                  {group.items.map((exp) => {
                    const payer = partners.find((p) => p.id === exp.paidById);
                    const splitCount = exp.splitAmongIds.length;
                    const perHeadPaise = Math.round(exp.amountPaise / (splitCount || 1));

                    return (
                      <div
                        key={exp.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-colors"
                      >
                        {/* Left: icon & details */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--bg-subtle)] text-[#8B83F6] shrink-0 mt-0.5">
                            {getCategoryIcon(exp.category)}
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[var(--text-primary)] truncate">
                                {exp.title}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                {exp.category}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] flex-wrap">
                              <span>{exp.date}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1 font-medium text-[var(--text-primary)]">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: payer?.avatarColor || "#8B83F6" }}
                                />
                                Paid by {payer?.name || "Unknown"}
                              </span>
                              <span>•</span>
                              <span>
                                Split {splitCount} ways ({formatPaise(perHeadPaise)} / person)
                              </span>
                            </div>

                            {exp.description && (
                              <p className="text-xs text-[var(--text-muted)] italic truncate">
                                &ldquo;{exp.description}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0">
                          <span className="text-base font-extrabold text-[var(--text-primary)] font-tabular">
                            {formatPaise(exp.amountPaise)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingExpense(exp)}
                              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
                              title="Edit expense"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTargetId(exp.id)}
                              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[#FF8C72] hover:bg-[var(--bg-subtle)] transition-colors"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This cannot be undone and will immediately update the partner settlement."
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
