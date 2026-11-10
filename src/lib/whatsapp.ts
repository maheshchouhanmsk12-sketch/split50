import { SettlementSummary } from "@/types";
import { formatPaise } from "./calculations";

/**
 * Generates the clean, beautifully formatted WhatsApp expense report string.
 */
export function generateWhatsAppReport(summary: SettlementSummary): string {
  const lines: string[] = [];

  lines.push("SPLIT50 — EXPENSE REPORT");
  lines.push("");
  lines.push(`Total Expenses: ${formatPaise(summary.totalExpenditurePaise)}`);

  const activeCount = summary.partnerMetrics.filter((m) => !m.isArchived).length || 1;
  const equalSharePaise = Math.round(summary.totalExpenditurePaise / activeCount);
  lines.push(`Per Person Share: ${formatPaise(equalSharePaise)}`);
  lines.push("");

  lines.push("Contributions:");
  for (const p of summary.partnerMetrics) {
    const archiveTag = p.isArchived ? " (Archived)" : "";
    lines.push(`• ${p.partnerName}${archiveTag} Paid: ${formatPaise(p.paidPaise)}`);
  }

  lines.push("");
  lines.push("FINAL SETTLEMENT:");

  if (summary.isSettled) {
    lines.push("All settled up! No outstanding payments.");
  } else {
    for (const t of summary.transfers) {
      lines.push(`${t.fromName} pays ${t.toName} ${formatPaise(t.amountPaise)}.`);
    }
  }

  return lines.join("\n");
}

/**
 * Generates official click-to-chat WhatsApp URL.
 */
export function getWhatsAppShareUrl(summary: SettlementSummary): string {
  const text = generateWhatsAppReport(summary);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Copies text to clipboard with fallback for older browsers or non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Try modern navigator.clipboard
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback using textarea element
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    textArea.remove();
    return successful;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    return false;
  }
}

