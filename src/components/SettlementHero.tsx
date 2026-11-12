"use client";

import React, { useState, useMemo } from "react";
import { useSplit, PARTNER_AVATAR_COLORS } from "@/context/SplitContext";
import { formatPaise } from "@/lib/calculations";
import { WhatsAppModal } from "./WhatsAppModal";
import { MessageSquareShare, Users, UserPlus } from "lucide-react";

export function SettlementHero() {
  const { summary, activePartners, setIsMemberModalOpen } = useSplit();
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

          {/* Month / Year & Member Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/10 active:scale-95"
              title="Manage Dashboard Members"
            >
              <Users className="w-3.5 h-3.5 text-[#B8F36B]" />
              <span>{activePartners.length} {activePartners.length === 1 ? "Member" : "Members"}</span>
            </button>
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

        {/* Dual or Multi-color Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/10 my-3">
          {activePartners.length === 2 ? (
            <>
              <div
                className="h-full bg-[#B8F36B] transition-all duration-500 rounded-l-full"
                style={{ width: `${p1Percent}%` }}
              />
              <div
                className="h-full bg-[#8B83F6] transition-all duration-500 rounded-r-full"
                style={{ width: `${p2Percent}%` }}
              />
            </>
          ) : (
            activePartners.map((partner, idx) => {
              const metric = summary.partnerMetrics.find((m) => m.partnerId === partner.id);
              const paid = metric?.paidPaise || 0;
              const total = summary.partnerMetrics.reduce((sum, m) => sum + m.paidPaise, 0);
              const percent = total > 0 ? (paid / total) * 100 : 100 / activePartners.length;
              const color = partner.avatarColor || PARTNER_AVATAR_COLORS[idx % PARTNER_AVATAR_COLORS.length];

              return (
                <div
                  key={partner.id}
                  className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: color,
                  }}
                  title={`${partner.name}: ${formatPaise(paid)}`}
                />
              );
            })
          )}
        </div>

        {/* Partner contribution legends & Net Pending Balances */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
              MEMBER BALANCES
            </span>
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(true)}
              className="text-[11px] font-bold text-[#B8F36B] hover:underline flex items-center gap-1 active:scale-95"
            >
              <UserPlus className="w-3 h-3" />
              <span>+ Add / Manage</span>
            </button>
          </div>

          <div
            className={`grid ${
              activePartners.length > 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2"
            } gap-2 text-xs font-semibold text-white/90`}
          >
            {activePartners.map((partner, index) => {
              const metric = summary.partnerMetrics.find((m) => m.partnerId === partner.id);
              const paidPaise = metric?.paidPaise || 0;
              const netBalancePaise = metric?.netBalancePaise || 0;
              const dotColor =
                activePartners.length === 2 && index === 0
                  ? "#B8F36B"
                  : activePartners.length === 2 && index === 1
                  ? "#8B83F6"
                  : partner.avatarColor || PARTNER_AVATAR_COLORS[index % PARTNER_AVATAR_COLORS.length];

              return (
                <div
                  key={partner.id}
                  className="flex items-center justify-between gap-1.5 min-w-0 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="truncate">
                      {partner.name} • {formatPaise(paidPaise)}
                    </span>
                  </div>
                  {netBalancePaise !== 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold font-tabular shrink-0 ${
                        netBalancePaise > 0
                          ? "bg-[#B8F36B]/20 text-[#B8F36B]"
                          : "bg-[#FF8C72]/20 text-[#FF8C72]"
                      }`}
                      title={`${partner.name}: ${
                        netBalancePaise > 0 ? "Receives" : "Owes"
                      } ${formatPaise(Math.abs(netBalancePaise))}`}
                    >
                      {netBalancePaise > 0
                        ? `+${formatPaise(netBalancePaise)}`
                        : formatPaise(netBalancePaise)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Clear Settlement Instruction (Naam sahit kiska kitna baki hai) */}
          {!isSettled && transfers.length > 0 && (
            <div className="pt-2 border-t border-white/10 space-y-1">
              {transfers.slice(0, 3).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] text-[#A59EBF]">
                  <span>{transfers.length === 1 ? "Settlement:" : `Transfer ${idx + 1}:`}</span>
                  <span className="font-bold text-[#B8F36B] truncate ml-2">
                    {t.fromName} needs to pay {t.toName} {formatPaise(t.amountPaise)}
                  </span>
                </div>
              ))}
              {transfers.length > 3 && (
                <p className="text-[10px] text-right text-[#A59EBF]">
                  +{transfers.length - 3} more settlement payments
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <WhatsAppModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
    </>
  );
}
