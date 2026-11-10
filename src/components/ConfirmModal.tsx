"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl p-6 shadow-2xl border transition-all transform scale-100 bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isDestructive
                  ? "bg-[#FF8C72]/15 text-[#FF8C72]"
                  : "bg-[#8B83F6]/15 text-[#8B83F6]"
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl font-medium text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md active:scale-95 ${
              isDestructive
                ? "bg-[#FF8C72] text-[#17152B] hover:brightness-105"
                : "bg-[#B8F36B] text-[#17152B] hover:brightness-105"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

