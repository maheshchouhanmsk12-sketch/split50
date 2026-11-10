"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { SettlementHero } from "@/components/SettlementHero";
import { RecentExpenses } from "@/components/RecentExpenses";
import { ExpenseList } from "@/components/ExpenseList";
import { PartnerManagement } from "@/components/PartnerManagement";
import { DataManagement } from "@/components/DataManagement";
import { PlusCircle, ShieldCheck } from "lucide-react";

export default function HomePage() {
  const { activeTab, isLoaded, setIsAddExpenseOpen, setEditingExpense } = useSplit();

  if (!isLoaded) {
    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-64 rounded-3xl bg-gray-200 dark:bg-white/5" />
        <div className="h-48 rounded-3xl bg-gray-200 dark:bg-white/5" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-5 pb-24">
      {/* 1. Main Dashboard View (Exact Image 1 Layout) */}
      {activeTab === "dashboard" && (
        <div className="space-y-5">
          {/* Top Purple Hero Settlement Card */}
          <SettlementHero />

          {/* Recent Activity Card List */}
          <RecentExpenses />

          {/* Big Electric Lime Add Expense Button from Image 1 */}
          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="w-full py-4 rounded-2xl bg-[#B8F36B] hover:brightness-105 active:scale-[0.98] transition-all text-[#17152B] font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-[#B8F36B]/20"
          >
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            <span>Add Expense</span>
          </button>
        </div>
      )}

      {/* 2. Passbook Ledger View */}
      {activeTab === "expenses" && (
        <div>
          <ExpenseList />
        </div>
      )}

      {/* 3. Settings View */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          <PartnerManagement />
          <DataManagement />
        </div>
      )}

      {/* Elegant Creator Credit Footer */}
      <footer className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#B8F36B]" />
          <span>Split50 • Client-Side & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-[#B8F36B] tracking-wide">
            MAHESH KHAROL
          </span>
          <span>•</span>
          <a
            href="tel:9009958903"
            className="hover:text-[#B8F36B] transition-colors font-bold font-tabular"
            aria-label="Call 9009958903"
          >
            9009958903
          </a>
        </div>
      </footer>
    </div>
  );
}
