"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { Receipt, Users, Wallet, Scale, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function FinancialMetrics() {
  const { summary, activePartners } = useSplit();

  const activeCount = activePartners.length || 1;
  const equalSharePaise = Math.round(summary.totalExpenditurePaise / activeCount);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Expenses */}
      <div className="rounded-3xl p-5 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Total Spent
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-tabular">
          {formatPaise(summary.totalExpenditurePaise)}
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Across all registered expenses
        </p>
      </div>

      {/* 2. Equal Share Per Person */}
      <div className="rounded-3xl p-5 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Equal Share / Person
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)] font-tabular">
          {formatPaise(equalSharePaise)}
        </div>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">
          Split among {activeCount} active {activeCount === 1 ? "partner" : "partners"}
        </p>
      </div>

      {/* 3. Amount Paid By Each Partner */}
      <div className="rounded-3xl p-5 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Paid by Partners
          </span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
          {summary.partnerMetrics.map((p) => (
            <div key={p.partnerId} className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[var(--text-secondary)] truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {p.partnerName}
              </span>
              <span className="text-[var(--text-primary)] font-tabular font-bold">
                {formatPaise(p.paidPaise)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Current Net Balance */}
      <div className="rounded-3xl p-5 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Net Balances
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto pr-1">
          {summary.partnerMetrics.map((p) => {
            const isReceiving = p.netBalancePaise > 0;
            const isOwing = p.netBalancePaise < 0;
            return (
              <div key={p.partnerId} className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text-secondary)] truncate flex items-center gap-1">
                  {p.partnerName}:
                </span>
                <span
                  className={`font-tabular font-bold flex items-center gap-0.5 ${
                    isReceiving
                      ? "text-emerald-500"
                      : isOwing
                      ? "text-rose-500"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  {isReceiving && <ArrowUpRight className="w-3 h-3 shrink-0" />}
                  {isOwing && <ArrowDownLeft className="w-3 h-3 shrink-0" />}
                  {formatPaise(p.netBalancePaise, { showSign: true })}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
