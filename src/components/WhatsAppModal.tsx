"use client";

import React, { useState } from "react";
import { useSplit } from "@/context/SplitContext";
import { generateWhatsAppReport, getWhatsAppShareUrl, copyToClipboard } from "@/lib/whatsapp";
import { MessageSquareShare, Copy, Check, ExternalLink, X } from "lucide-react";

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WhatsAppModal({ isOpen, onClose }: WhatsAppModalProps) {
  const { summary, showToast } = useSplit();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = generateWhatsAppReport(summary);
  const shareUrl = getWhatsAppShareUrl(summary);

  const handleCopy = async () => {
    const ok = await copyToClipboard(reportText);
    if (ok) {
      setCopied(true);
      showToast("Report copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast("Unable to copy to clipboard", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl p-6 shadow-2xl border bg-[var(--bg-surface)] border-[var(--border-strong)] text-[var(--text-primary)] transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <MessageSquareShare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Share on WhatsApp</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Instant formatted breakdown ready to share
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Preview */}
        <div className="my-5 p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto text-[var(--text-primary)] select-all">
          {reportText}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border font-semibold text-sm transition-all duration-150 active:scale-95 bg-[var(--bg-surface-elevated)] border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
                Copy Summary
              </>
            )}
          </button>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full sm:flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-150 active:scale-95 bg-[#B8F36B] hover:brightness-105 text-[#17152B] shadow-md shadow-[#B8F36B]/20"
          >
            <ExternalLink className="w-4 h-4" />
            Open WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
