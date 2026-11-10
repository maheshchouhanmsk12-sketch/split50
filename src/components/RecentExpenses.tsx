"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { CATEGORIES } from "@/lib/categories";
import { ConfirmModal } from "./ConfirmModal";
import {
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

function formatDisplayDate(dateStr: string): string {
  try {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    if (dateStr === todayStr) return "Today";

    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (dateStr === yesterdayStr) return "Yesterday";

    const [year, month, day] = dateStr.split("-").map(Number);
    if (year && month && day) {
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

export function RecentExpenses() {
  const { expenses, partners, setActiveTab, setEditingExpense, deleteExpense } = useSplit();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const recent = expenses.slice(0, 5);

  const getPartnerName = (id: string) => {
    return partners.find((p) => p.id === id)?.name || "Unknown";
  };

  const getCategoryTheme = (categoryName: string) => {
    switch (categoryName) {
      case "Groceries":
        return {
          icon: <ShoppingBag className="w-5 h-5" />,
          boxClass: "bg-[#8B83F6]/15 text-[#8B83F6]",
        };
      case "Rent":
        return {
          icon: <Home className="w-5 h-5" />,
          boxClass: "bg-[#FF8C72]/15 text-[#FF8C72]",
        };
      case "Food":
        return {
          icon: <Utensils className="w-5 h-5" />,
          boxClass: "bg-[#B8F36B]/25 text-[#4D7C0F] dark:text-[#B8F36B]",
        };
      case "Electricity":
        return {
          icon: <Zap className="w-5 h-5" />,
          boxClass: "bg-amber-500/15 text-amber-500",
        };
      case "Milk":
        return {
          icon: <CupSoda className="w-5 h-5" />,
          boxClass: "bg-sky-500/15 text-sky-500",
        };
      case "Vegetables":
        return {
          icon: <Carrot className="w-5 h-5" />,
          boxClass: "bg-emerald-500/15 text-emerald-500",
        };
      case "Internet":
        return {
          icon: <Wifi className="w-5 h-5" />,
          boxClass: "bg-indigo-500/15 text-indigo-500",
        };
      case "Travel":
        return {
          icon: <Car className="w-5 h-5" />,
          boxClass: "bg-cyan-500/15 text-cyan-500",
        };
      default:
        return {
          icon: <Layers className="w-5 h-5" />,
          boxClass: "bg-purple-500/15 text-purple-500",
        };
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Recent Activity
          </h2>

          <button
            onClick={() => setActiveTab("expenses")}
            className="text-xs font-bold text-[#8B83F6] hover:underline uppercase tracking-wide cursor-pointer"
          >
            VIEW ALL →
          </button>
        </div>

        {/* Card List from Image 1 */}
        {recent.length === 0 ? (
          <div className="bg-white dark:bg-[#17152B] rounded-3xl p-8 text-center border border-gray-100 dark:border-white/5 shadow-sm text-gray-500 dark:text-gray-400 text-sm">
            No expenses recorded yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#17152B] rounded-3xl p-3 sm:p-4 shadow-sm border border-gray-100 dark:border-white/5 divide-y divide-gray-100 dark:divide-white/5">
            {recent.map((exp) => {
              const theme = getCategoryTheme(exp.category);

              return (
                <div
                  key={exp.id}
                  className="py-3 px-2 flex items-center justify-between gap-3 group transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Category Icon Box */}
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${theme.boxClass}`}
                    >
                      {theme.icon}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate mt-0.5">
                        {formatDisplayDate(exp.date)} • Paid by {getPartnerName(exp.paidById)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white font-tabular">
                      {formatPaise(exp.amountPaise)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingExpense(exp)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(exp.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This will immediately update all balances."
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
