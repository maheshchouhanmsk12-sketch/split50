"use client";

import React, { useState, useMemo } from "react";
import { useSplit } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { WhatsAppModal } from "./WhatsAppModal";
import { MessageSquareShare } from "lucide-react";

export function SettlementHero() {
  const { summary, activePartners } = useSplit();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const { isSettled, headlineStatus, transfers, totalExpenditurePaise } = summary;

  // Current month label (e.g. "NOVEMBER 2026")
  const currentMonthYear = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  }, []);

  // Equal share per person
  const activeCount = activePartners.length || 1;
  const equalSharePaise = Math.round(totalExpenditurePaise / activeCount);

  // Top 2 partners for the dual progress bar
  const p1 = summary.partnerMetrics[0];
  const p2 = summary.partnerMetrics[1];

  const p1Paid = p1?.paidPaise || 0;
  const p2Paid = p2?.paidPaise || 0;
  const totalPaid = p1Paid + p2Paid || 1;

  const p1Percent = totalExpenditurePaise > 0 ? Math.max(10, Math.min(90, Math.round((p1Paid / totalPaid) * 100))) : 50;
  const p2Percent = 100 - p1Percent;

  return (
    <>
      {/* Exact Midnight Plum Card from Image 1 */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-2xl bg-[#17152B] border border-white/10 text-white">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isSettled ? "ALL SETTLED" : "SETTLEMENT PENDING"}</span>
          </div>

          {/* Month / Year */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title="Share on WhatsApp"
            >
              <MessageSquareShare className="w-4 h-4 text-[#8B83F6]" />
            </button>
            <span className="text-xs font-bold tracking-wider text-[#A59EBF]">
              {currentMonthYear}
            </span>
          </div>
        </div>

        {/* Settlement Headline & Big Amount */}
        <div className="space-y-1 mb-5">
          <p className="text-sm font-semibold text-white/90">
            {isSettled
              ? "All accounts balanced"
              : transfers.length > 0
              ? `${transfers[0].fromName} owes ${transfers[0].toName}`
              : headlineStatus}
          </p>

          <div className="text-4xl sm:text-5xl font-black tracking-tight text-[#B8F36B] font-tabular">
            {isSettled
              ? "₹0.00"
              : transfers.length > 0
              ? formatPaise(transfers[0].amountPaise, { alwaysShowDecimals: true })
              : formatPaise(0, { alwaysShowDecimals: true })}
          </div>

          <p className="text-xs font-medium text-[#A59EBF] flex items-center gap-1">
            <span>{isSettled ? "Everyone is completely even" : "Time to settle up"}</span>
            <span>✨</span>
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-4" />

        {/* Total Spent & Each Person Columns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
              TOTAL SPENT
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-tabular mt-0.5">
              {formatPaise(totalExpenditurePaise)}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-white/60">
              EACH PERSON
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white font-tabular mt-0.5">
              {formatPaise(equalSharePaise)}
            </div>
          </div>
        </div>

        {/* Dual-color Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/10 my-3">
          <div
            className="h-full bg-[#B8F36B] transition-all duration-500 rounded-l-full"
            style={{ width: `${p1Percent}%` }}
          />
          <div
            className="h-full bg-[#8B83F6] transition-all duration-500 rounded-r-full"
            style={{ width: `${p2Percent}%` }}
          />
        </div>

        {/* Partner contribution legends */}
        <div className="flex items-center justify-between text-xs font-semibold text-white/90 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B8F36B]" />
            <span>
              {p1?.partnerName || "Partner 1"} • {formatPaise(p1Paid)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8B83F6]" />
            <span>
              {p2?.partnerName || "Partner 2"} • {formatPaise(p2Paid)}
            </span>
          </div>
        </div>
      </div>

      <WhatsAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
}
