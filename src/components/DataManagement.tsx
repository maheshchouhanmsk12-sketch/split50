"use client";

import React, { useState, useRef } from "react";
import { useSplit } from "@/context/SplitContext";
import { useTheme } from "@/context/ThemeContext";
import { exportBackup, parseImportBackup } from "@/lib/storage";
import { ConfirmModal } from "./ConfirmModal";
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  Moon,
  Sun,
  Laptop,
  AlertTriangle,
  Info,
} from "lucide-react";

export function DataManagement() {
  const { partners, expenses, resetExpenses, resetAll, importData, showToast } = useSplit();
  const { theme, setTheme } = useTheme();

  const [confirmResetExpenses, setConfirmResetExpenses] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    exportBackup({
      version: 1,
      partners,
      expenses,
      lastUpdated: new Date().toISOString(),
    });
    showToast("Backup exported successfully!", "success");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) {
        showToast("Empty backup file", "error");
        return;
      }

      const result = parseImportBackup(text);
      if (result.success && result.state) {
        importData(result.state);
      } else {
        showToast(result.error || "Failed to parse backup JSON", "error");
      }
    };
    reader.onerror = () => {
      showToast("Error reading backup file", "error");
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Appearance & Theme Settings */}
        <div className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-[#B8F36B]" />
            <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Appearance & Theme
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Choose your preferred color theme or match your system settings.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                theme === "light"
                  ? "bg-[var(--bg-subtle)] border-[#8B83F6] text-[var(--text-primary)] shadow-sm"
                  : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <Sun className="w-4 h-4 text-[#8B83F6]" />
              <span>Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                theme === "dark"
                  ? "bg-[var(--bg-subtle)] border-[#B8F36B] text-[var(--text-primary)] shadow-sm"
                  : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <Moon className="w-4 h-4 text-[#B8F36B]" />
              <span>Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                theme === "system"
                  ? "bg-[var(--bg-subtle)] border-[#8B83F6] text-[var(--text-primary)] shadow-sm"
                  : "bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
              }`}
            >
              <Laptop className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Local Storage Notice & Backup/Restore */}
        <div className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[var(--border-subtle)] space-y-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#8B83F6]" />
            <h2 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              Backup & Storage
            </h2>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#8B83F6] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Split50 stores your data strictly in your local browser storage for maximum privacy and zero latency. LocalStorage does not automatically sync across separate browsers or devices. Export regular backups to preserve or transfer your data.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 bg-[var(--bg-surface-elevated)] border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] shadow-sm"
            >
              <Download className="w-4 h-4 text-[#B8F36B]" />
              <span>Export Backup (.json)</span>
            </button>

            <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border font-bold text-xs transition-all active:scale-95 bg-[var(--bg-surface-elevated)] border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] shadow-sm cursor-pointer">
              <Upload className="w-4 h-4 text-[#8B83F6]" />
              <span>Import Backup</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-3xl p-6 border shadow-sm bg-[var(--bg-surface)] border-[#FF8C72]/20 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FF8C72]" />
            <h2 className="text-base font-bold tracking-tight text-[#FF8C72]">
              Danger Zone
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Irreversible actions that clear stored financial records. Both actions require explicit confirmation.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => setConfirmResetExpenses(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-[#FF8C72]/30 text-[#FF8C72] bg-[#FF8C72]/10 hover:bg-[#FF8C72]/20 font-bold text-xs transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Expenses Only</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmResetAll(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FF8C72] text-[#17152B] hover:brightness-105 font-bold text-xs transition-all active:scale-95 shadow-md shadow-[#FF8C72]/15"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Entire App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Reset Expenses */}
      <ConfirmModal
        isOpen={confirmResetExpenses}
        title="Reset All Expenses?"
        message="This will permanently delete all recorded expenses. Partner names and settings will remain intact. This action cannot be undone."
        confirmLabel="Reset All Expenses"
        isDestructive={true}
        onConfirm={() => {
          resetExpenses();
          setConfirmResetExpenses(false);
        }}
        onCancel={() => setConfirmResetExpenses(false)}
      />

      {/* Confirm Reset Entire App */}
      <ConfirmModal
        isOpen={confirmResetAll}
        title="Reset Entire Application?"
        message="This will completely reset Split50 to factory settings: clearing all expenses and resetting partners back to Rahul and Amit. Make sure you have exported a backup if needed."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          resetAll();
          setConfirmResetAll(false);
        }}
        onCancel={() => setConfirmResetAll(false)}
      />
    </>
  );
}

