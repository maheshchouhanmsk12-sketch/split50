"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  LayoutDashboard,
  ReceiptText,
  Settings,
  Plus,
  Coins,
} from "lucide-react";

export function Navbar() {
  const { activeTab, setActiveTab, setIsAddExpenseOpen, setEditingExpense } = useSplit();

  return (
    <>
      {/* Desktop & Tablet Top Navbar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors bg-[var(--bg-surface)]/80 border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab("dashboard")}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-black shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight text-[var(--text-primary)]">
                  Split50
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 uppercase tracking-wider">
                  50/50
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-none">
                Zero-Friction Expense Sharing
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "dashboard"
                  ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("expenses")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "expenses"
                  ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>Passbook</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "settings"
                  ? "bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Controls: Add Expense + Theme Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Expense</span>
            </button>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t bg-[var(--bg-surface)]/95 border-[var(--border-subtle)] pb-safe">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "dashboard"
                ? "text-emerald-500 font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px]">Dashboard</span>
          </button>

          {/* Central Add Button */}
          <button
            type="button"
            onClick={() => {
              setEditingExpense(null);
              setIsAddExpenseOpen(true);
            }}
            className="flex items-center justify-center -mt-5 w-12 h-12 rounded-2xl bg-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/25 active:scale-95 transition-transform"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "expenses"
                ? "text-emerald-500 font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ReceiptText className="w-5 h-5" />
            <span className="text-[10px]">Passbook</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === "settings"
                ? "text-emerald-500 font-bold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
