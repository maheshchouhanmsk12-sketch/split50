"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { WhatsAppModal } from "./WhatsAppModal";
import { CheckCircle2, ArrowRightLeft, Plus, MessageSquareShare } from "lucide-react";

export function SettlementHero() {
  const { summary, setIsAddExpenseOpen, setEditingExpense } = useSplit();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { isSettled, headlineStatus, transfers } = summary;

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-xl transition-all duration-300 bg-[var(--bg-surface)] border-[var(--border-strong)]">
        {/* Subtle background glow effect using emerald / rose */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isSettled ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-[var(--bg-subtle)] border-[var(--border-subtle)]">
              {isSettled ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-extrabold">All Settled</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-3.5 h-3.5 text-rose-500" />
                  <span className="text-rose-500 font-extrabold">Payment Needed</span>
                </>
              )}
            </div>

            {/* Prominent Headline Settlement */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-[var(--text-primary)]">
              {headlineStatus}
            </h1>

            {/* Subtitle / Transfers explanation */}
            {isSettled ? (
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                Every eligible expense is balanced equally. No transfers required.
              </p>
            ) : transfers.length > 1 ? (
              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  Minimized Settlement Transfers:
                </p>
                <div className="flex flex-wrap gap-2">
                  {transfers.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    >
                      <span className="text-[var(--text-secondary)]">{t.fromName}</span>
                      <ArrowRightLeft className="w-3 h-3 text-rose-500" />
                      <span className="text-[var(--text-secondary)]">{t.toName}:</span>
                      <span className="font-bold text-emerald-500 font-tabular">
                        {formatPaise(t.amountPaise)}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)] font-medium">
                {summary.detailedStatus}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all duration-150 active:scale-95 bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] shadow-sm"
              title="Share report on WhatsApp"
            >
              <MessageSquareShare className="w-4 h-4 text-emerald-500" />
              <span>Share Report</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-extrabold text-xs transition-all duration-150 active:scale-95 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </div>
      </div>

      <WhatsAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
}
