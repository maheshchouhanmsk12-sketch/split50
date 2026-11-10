"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

export function ToastContainer() {
  const { toasts } = useSplit();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-strong)]"
        >
          {toast.type === "success" && (
            <CheckCircle2 className="w-5 h-5 text-[#B8F36B] shrink-0" />
          )}
          {toast.type === "error" && (
            <AlertCircle className="w-5 h-5 text-[#FF8C72] shrink-0" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-[#8B83F6] shrink-0" />
          )}
          <p className="text-sm font-medium tracking-tight leading-snug">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

