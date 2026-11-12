"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSplit } from "@/context/SplitContext";
import { CATEGORIES } from "@/lib/categories";
import { inrToPaise, formatPaise } from "@/lib/calculations";
import { ExpenseCategory } from "@/types";
import {
  X,
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
  FileText,
  User,
  Users,
} from "lucide-react";

export function AddExpenseModal() {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    setIsMemberModalOpen,
    editingExpense,
    setEditingExpense,
    activePartners,
    partners,
    addExpense,
    updateExpense,
  } = useSplit();

  const [title, setTitle] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [date, setDate] = useState("");
  const [paidById, setPaidById] = useState("");
  const [splitAmongIds, setSplitAmongIds] = useState<string[]>([]);
  const [category, setCategory] = useState<ExpenseCategory>("Groceries");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens or editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      const rupees = editingExpense.amountPaise / 100;
      setAmountStr(editingExpense.amountPaise % 100 === 0 ? rupees.toString() : rupees.toFixed(2));
      setDate(editingExpense.date);
      setPaidById(editingExpense.paidById);
      setSplitAmongIds(editingExpense.splitAmongIds);
      setCategory(editingExpense.category);
      setDescription(editingExpense.description || "");
      setError(null);
    } else {
      setTitle("");
      setAmountStr("");
      setDate(new Date().toISOString().slice(0, 10));
      if (activePartners.length > 0) {
        setPaidById(activePartners[0].id);
        setSplitAmongIds(activePartners.map((p) => p.id));
      }
      setCategory("Groceries");
      setDescription("");
      setError(null);
    }
  }, [editingExpense, isAddExpenseOpen, activePartners]);

  // Compute live per-person share preview
  const liveShare = useMemo(() => {
    const paise = inrToPaise(amountStr);
    if (paise <= 0 || splitAmongIds.length === 0) return 0;
    return Math.round(paise / splitAmongIds.length);
  }, [amountStr, splitAmongIds]);

  if (!isAddExpenseOpen && !editingExpense) return null;

  const handleClose = () => {
    setIsAddExpenseOpen(false);
    setEditingExpense(null);
    setError(null);
  };

  const handleToggleSplitPartner = (partnerId: string) => {
    setSplitAmongIds((prev) => {
      if (prev.includes(partnerId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== partnerId);
      } else {
        return [...prev, partnerId];
      }
    });
  };

  const handleSelectAllPartners = () => {
    setSplitAmongIds(activePartners.map((p) => p.id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter an expense title");
      return;
    }

    const amountPaise = inrToPaise(amountStr);
    if (amountPaise <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!paidById) {
      setError("Please select who paid");
      return;
    }

    if (splitAmongIds.length === 0) {
      setError("Please select at least one person to split with");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingExpense) {
        updateExpense(editingExpense.id, {
          title: title.trim(),
          amountPaise,
          date,
          paidById,
          splitAmongIds,
          category,
          description: description.trim() || undefined,
        });
      } else {
        addExpense({
          title: title.trim(),
          amountPaise,
          date,
          paidById,
          splitAmongIds,
          category,
          description: description.trim() || undefined,
        });
      }

      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)] transition-all my-auto max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#B8F36B] text-[#17152B] font-bold">
              {editingExpense ? <FileText className="w-5 h-5" /> : <Plus className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {editingExpense ? "Edit Expense" : "Add Expense"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {editingExpense ? "Update expense details & split" : "Split cleanly in seconds"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Amount Input with big numbers */}
          <div className="rounded-2xl p-4 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] focus-within:border-emerald-500 transition-colors">
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Amount (INR)
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[var(--text-muted)]">₹</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full bg-transparent text-3xl font-extrabold tracking-tight text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-tabular"
                autoFocus={!editingExpense}
                required
              />
            </div>
            {liveShare > 0 && splitAmongIds.length > 0 && (
              <p className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
                Equal share: <span className="text-emerald-500 font-bold">{formatPaise(liveShare)}</span> each
                ({splitAmongIds.length} {splitAmongIds.length === 1 ? "person" : "people"})
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Expense Title
            </label>
            <input
              type="text"
              placeholder="e.g., Grocery run, WiFi Bill, Dinner"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500 text-sm font-medium transition-colors"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? "bg-[#B8F36B] text-[#17152B] font-bold border-[#B8F36B] shadow-sm"
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]"
                    }`}
                  >
                    {getCategoryIcon(cat.iconName)}
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid By Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                Paid By
              </label>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(true)}
                className="text-xs font-bold text-emerald-600 dark:text-[#B8F36B] hover:underline"
              >
                + Add Member
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePartners.map((partner) => {
                const isSelected = paidById === partner.id;
                return (
                  <button
                    key={partner.id}
                    type="button"
                    onClick={() => setPaidById(partner.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-sm"
                        : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: partner.avatarColor || "#10B981" }}
                    />
                    {partner.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Among */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                Split Equally Among
              </label>
              <button
                type="button"
                onClick={handleSelectAllPartners}
                className="text-xs font-medium text-emerald-500 hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {partners
                .filter((p) => !p.isArchived || splitAmongIds.includes(p.id))
                .map((partner) => {
                  const isChecked = splitAmongIds.includes(partner.id);
                  return (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => handleToggleSplitPartner(partner.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                        isChecked
                          ? "bg-[var(--bg-surface-elevated)] border-emerald-500 text-[var(--text-primary)]"
                          : "bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60"
                      }`}
                    >
                      <span className="truncate flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: partner.avatarColor || "#10B981" }}
                        />
                        {partner.name}
                        {partner.isArchived && " (Past)"}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                          isChecked
                            ? "bg-emerald-500 border-emerald-500 text-zinc-950"
                            : "border-[var(--border-strong)]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Date and Optional Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via UPI"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#B8F36B] hover:brightness-105 text-[#17152B] active:scale-95 transition-all shadow-md shadow-[#B8F36B]/20"
            >
              {editingExpense ? "Save Changes" : "+ Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
