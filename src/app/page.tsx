"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { SettlementHero } from "@/components/SettlementHero";
import { FinancialMetrics } from "@/components/FinancialMetrics";
import { RecentExpenses } from "@/components/RecentExpenses";
import { ExpenseList } from "@/components/ExpenseList";
import { PartnerManagement } from "@/components/PartnerManagement";
import { DataManagement } from "@/components/DataManagement";
import { ShieldCheck, Phone } from "lucide-react";

export default function HomePage() {
  const { activeTab, isLoaded } = useSplit();

  if (!isLoaded) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
        <div className="h-44 rounded-3xl bg-[var(--bg-subtle)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-28 rounded-3xl bg-[var(--bg-subtle)]" />
          <div className="h-28 rounded-3xl bg-[var(--bg-subtle)]" />
          <div className="h-28 rounded-3xl bg-[var(--bg-subtle)]" />
          <div className="h-28 rounded-3xl bg-[var(--bg-subtle)]" />
        </div>
        <div className="h-64 rounded-3xl bg-[var(--bg-subtle)]" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          <SettlementHero />
          <FinancialMetrics />
          <RecentExpenses />
        </div>
      )}

      {activeTab === "expenses" && (
        <div>
          <ExpenseList />
        </div>
      )}

      {activeTab === "settings" && (
        <div className="space-y-6">
          <PartnerManagement />
          <DataManagement />
        </div>
      )}

      {/* Creator Credit Section */}
      <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Created By
        </span>
        <span className="text-base font-extrabold tracking-wide text-[#B8F36B] mt-1">
          MAHESH KHAROL
        </span>
        <a
          href="tel:9009958903"
          className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-bold text-[#8B83F6] hover:text-[#B8F36B] transition-colors font-tabular active:scale-95"
          aria-label="Call MAHESH KHAROL at 9009958903"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>9009958903</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-6 pt-4 border-t border-[var(--border-subtle)]/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#B8F36B]" />
          <span>Split50 • Client-Side & Private • Exact Integer Precision</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Designed with simplicity</span>
        </div>
      </footer>
    </div>
  );
}
