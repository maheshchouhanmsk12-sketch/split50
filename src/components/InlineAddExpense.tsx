"use client";

import React, { useState, useMemo } from "react";
import { useSplit } from "@/context/SplitContext";
import { CATEGORIES } from "@/lib/categories";
import { inrToPaise, formatPaise } from "@/lib/calculations";
import { ExpenseCategory } from "@/types";
import {
  Plus,
  Check,
  ShoppingBag,
  Home,
  Zap,
  CupSoda,
  Carrot,
  Utensils,
  Wifi,
  Car,
  Layers,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export function InlineAddExpense() {
  const { activePartners, addExpense } = useSplit();

  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paidById, setPaidById] = useState(() => activePartners[0]?.id || "");
  const [splitAmongIds, setSplitAmongIds] = useState<string[]>(() =>
    activePartners.map((p) => p.id)
  );
  const [category, setCategory] = useState<ExpenseCategory>("Groceries");
  const [description, setDescription] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep paidById and splitAmongIds in sync with activePartners
  React.useEffect(() => {
    if (activePartners.length > 0) {
      if (!activePartners.some((p) => p.id === paidById)) {
        setPaidById(activePartners[0].id);
      }
      setSplitAmongIds((prev) => {
        const valid = prev.filter((id) => activePartners.some((p) => p.id === id));
        return valid.length > 0 ? valid : activePartners.map((p) => p.id);
      });
    }
  }, [activePartners, paidById]);

  // Live per-person equal share
  const liveShare = useMemo(() => {
    const paise = inrToPaise(amountStr);
    if (paise <= 0 || splitAmongIds.length === 0) return 0;
    return Math.round(paise / splitAmongIds.length);
  }, [amountStr, splitAmongIds]);

  const handleToggleSplit = (id: string) => {
    setSplitAmongIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((pId) => pId !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter what was purchased");
      return;
    }

    const amountPaise = inrToPaise(amountStr);
    if (amountPaise <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!paidById) {
      setError("Please select who paid for this expense");
      return;
    }

    if (splitAmongIds.length === 0) {
      setError("Please select at least one partner to split this expense with");
      return;
    }

    setIsSubmitting(true);
    try {
      addExpense({
        title: title.trim(),
        amountPaise,
        date: date || new Date().toISOString().slice(0, 10),
        paidById,
        splitAmongIds,
        category,
        description: description.trim() || undefined,
      });

      // Reset form
      setTitle("");
      setAmountStr("");
      setDescription("");
      setShowMore(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case "Groceries": return <ShoppingBag className="w-3.5 h-3.5" />;
      case "Rent": return <Home className="w-3.5 h-3.5" />;
      case "Electricity": return <Zap className="w-3.5 h-3.5" />;
      case "Milk": return <CupSoda className="w-3.5 h-3.5" />;
      case "Vegetables": return <Carrot className="w-3.5 h-3.5" />;
      case "Food": return <Utensils className="w-3.5 h-3.5" />;
      case "Internet": return <Wifi className="w-3.5 h-3.5" />;
      case "Travel": return <Car className="w-3.5 h-3.5" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="rounded-3xl p-6 sm:p-7 border shadow-md bg-[var(--bg-surface)] border-[var(--border-subtle)] transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[var(--text-primary)]">
              Quick Add Expense
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Record a 50/50 expense in seconds
            </p>
          </div>
        </div>

        {liveShare > 0 && (
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-tabular">
            Each owes: {formatPaise(liveShare)}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title & Amount Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7">
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              What was purchased?
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner, Groceries, Room Rent..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-sm font-semibold text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-base text-[var(--text-muted)]">
                ₹
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(val) || val === "") {
                    setAmountStr(val);
                    if (error) setError(null);
                  }
                }}
                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-base font-extrabold text-[var(--text-primary)] font-tabular placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div>
          <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
            Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-emerald-500 text-zinc-950 font-extrabold shadow-sm"
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                  }`}
                >
                  {getCategoryIcon(cat.key)}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Paid By & Split Between */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Paid By */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Who Paid?
            </label>
            <div className="flex flex-wrap gap-2">
              {activePartners.map((p) => {
                const isSelected = paidById === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaidById(p.id)}
                    className={`flex-1 min-w-[100px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: p.avatarColor || "#10B981" }}
                    />
                    <span>{p.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Among */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Split Among (Equal)
            </label>
            <div className="flex flex-wrap gap-2">
              {activePartners.map((p) => {
                const isChecked = splitAmongIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleToggleSplit(p.id)}
                    className={`flex-1 min-w-[100px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      isChecked
                        ? "bg-[var(--bg-subtle)] border-emerald-500/40 text-[var(--text-primary)]"
                        : "bg-[var(--bg-subtle)]/50 border-[var(--border-subtle)] text-[var(--text-muted)] line-through"
                    }`}
                  >
                    <span>{p.name}</span>
                    {isChecked ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center text-[10px] font-black">
                        ✓
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[var(--border-strong)]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* More options toggle (Date & Description) */}
        <div>
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            <span>{showMore ? "Hide details" : "Change date or add note"}</span>
          </button>

          {showMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-secondary)] mb-1">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid online via UPI"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-[0.99] transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Save Expense</span>
          </button>
        </div>
      </form>
    </div>
  );
}
