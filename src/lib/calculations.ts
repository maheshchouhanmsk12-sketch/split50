import { Expense, Partner, PartnerMetric, SettlementSummary, SettlementTransfer } from "@/types";

/**
 * Converts a rupee input (number or string) into exact integer paise.
 * Avoids IEEE-754 floating point issues by string splitting.
 * e.g., "99.50" -> 9950, 100 -> 10000, "100.05" -> 10005, "0.1" -> 10
 */
export function inrToPaise(input: number | string): number {
  if (typeof input === "number") {
    if (isNaN(input) || !isFinite(input)) return 0;
    // Format to 2 decimal places as string first to avoid float jitter
    input = input.toFixed(2);
  }

  // Clean input string (remove currency symbols, commas, spaces)
  const cleaned = input.replace(/[₹,\s]/g, "").trim();
  if (!cleaned) return 0;

  const parts = cleaned.split(".");
  const rupeesPart = parseInt(parts[0] || "0", 10);
  if (isNaN(rupeesPart)) return 0;

  let paisePart = 0;
  if (parts.length > 1) {
    const rawPaise = parts[1].padEnd(2, "0").slice(0, 2);
    paisePart = parseInt(rawPaise, 10);
    if (isNaN(paisePart)) paisePart = 0;
  }

  const sign = rupeesPart < 0 || cleaned.startsWith("-") ? -1 : 1;
  const absPaise = Math.abs(rupeesPart) * 100 + paisePart;
  return sign * absPaise;
}

/**
 * Formats integer paise into a clean INR string (e.g., ₹1,450 or ₹99.50).
 * Guaranteed to never display "-₹0" or "-₹0.00".
 */
export function formatPaise(
  paise: number,
  options?: {
    alwaysShowDecimals?: boolean;
    showSign?: boolean;
    hideCurrency?: boolean;
  }
): string {
  // Guard against -0
  if (Math.abs(paise) === 0) {
    paise = 0;
  }

  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;

  const showDecimals = options?.alwaysShowDecimals || remainderPaise > 0;
  const formattedNumber = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(absPaise / 100);

  const prefix = options?.hideCurrency ? "" : "₹";
  const sign = isNegative ? "-" : options?.showSign && paise > 0 ? "+" : "";

  return `${sign}${prefix}${formattedNumber}`;
}

/**
 * Splits an expense amount in paise equally among eligible participant IDs,
 * deterministically distributing remainders so the sum of shares is exactly amountPaise.
 */
export function calculateExpenseShares(
  amountPaise: number,
  splitAmongIds: string[]
): Map<string, number> {
  const shares = new Map<string, number>();
  if (!splitAmongIds || splitAmongIds.length === 0 || amountPaise <= 0) {
    return shares;
  }

  const n = splitAmongIds.length;
  const baseShare = Math.floor(amountPaise / n);
  const remainder = amountPaise % n;

  // Stable sort of participant IDs to guarantee deterministic remainder distribution
  const sortedIds = [...splitAmongIds].sort();

  for (let i = 0; i < sortedIds.length; i++) {
    const id = sortedIds[i];
    // First 'remainder' participants get +1 paise
    const share = baseShare + (i < remainder ? 1 : 0);
    shares.set(id, share);
  }

  return shares;
}

/**
 * Core calculation engine.
 * Computes:
 * - Total expenditure
 * - Paid amounts per partner
 * - Owed amounts per partner based on each expense's participant snapshot
 * - Net balance (paid - owed)
 * - Optimal minimal debt settlement transfers
 * - Headline status string
 */
export function calculateSettlementSummary(
  partners: Partner[],
  expenses: Expense[]
): SettlementSummary {
  const partnerMap = new Map<string, Partner>();
  partners.forEach((p) => partnerMap.set(p.id, p));

  const paidMap = new Map<string, number>();
  const owedMap = new Map<string, number>();

  // Initialize for all known partners
  partners.forEach((p) => {
    paidMap.set(p.id, 0);
    owedMap.set(p.id, 0);
  });

  let totalExpenditurePaise = 0;

  // Process each expense using historical snapshot of splitAmongIds
  for (const exp of expenses) {
    if (exp.amountPaise <= 0) continue;
    totalExpenditurePaise += exp.amountPaise;

    // Credit the payer
    const currentPaid = paidMap.get(exp.paidById) ?? 0;
    paidMap.set(exp.paidById, currentPaid + exp.amountPaise);

    // Compute fair shares among participants
    const participants = exp.splitAmongIds && exp.splitAmongIds.length > 0
      ? exp.splitAmongIds
      : [exp.paidById];

    const shares = calculateExpenseShares(exp.amountPaise, participants);
    shares.forEach((share, id) => {
      const currentOwed = owedMap.get(id) ?? 0;
      owedMap.set(id, currentOwed + share);
    });
  }

  // Build Partner Metrics
  // We include all partners (active and archived who have activity)
  const partnerMetrics: PartnerMetric[] = partners.map((p) => {
    const paid = paidMap.get(p.id) || 0;
    const owed = owedMap.get(p.id) || 0;
    let net = paid - owed;
    // Guard against -0
    if (Math.abs(net) === 0) net = 0;

    return {
      partnerId: p.id,
      partnerName: p.name,
      isArchived: p.isArchived,
      paidPaise: paid,
      owedPaise: owed,
      netBalancePaise: net,
    };
  });

  // Calculate Transfers (Greedy debt-settlement algorithm)
  const transfers = computeDebtSettlements(partnerMetrics);

  // Determine settlement status
  const isSettled = transfers.length === 0;
  let headlineStatus = "All settled up!";
  let detailedStatus = "No outstanding balances among partners.";

  if (!isSettled) {
    if (transfers.length === 1) {
      const t = transfers[0];
      headlineStatus = `${t.fromName} owes ${t.toName} ${formatPaise(t.amountPaise)}`;
      detailedStatus = `${t.fromName} needs to pay ${t.toName} ${formatPaise(t.amountPaise)} to settle all accounts.`;
    } else {
      const parts = transfers.map(
        (t) => `${t.fromName} owes ${t.toName} ${formatPaise(t.amountPaise)}`
      );
      headlineStatus = parts.join(", ");
      detailedStatus = `${transfers.length} payments required to settle all debts.`;
    }
  }

  return {
    totalExpenditurePaise,
    partnerCount: partners.filter((p) => !p.isArchived).length,
    partnerMetrics,
    transfers,
    isSettled,
    headlineStatus,
    detailedStatus,
  };
}

/**
 * Greedy Debt Settlement Algorithm
 * Minimizes the number of financial transactions required among participants.
 */
export function computeDebtSettlements(
  metrics: PartnerMetric[]
): SettlementTransfer[] {
  // Debtors: netBalance < 0 (owe money)
  // Creditors: netBalance > 0 (should receive money)
  const debtors: { id: string; name: string; balance: number }[] = [];
  const creditors: { id: string; name: string; balance: number }[] = [];

  metrics.forEach((m) => {
    if (m.netBalancePaise < 0) {
      debtors.push({
        id: m.partnerId,
        name: m.partnerName,
        balance: Math.abs(m.netBalancePaise),
      });
    } else if (m.netBalancePaise > 0) {
      creditors.push({
        id: m.partnerId,
        name: m.partnerName,
        balance: m.netBalancePaise,
      });
    }
  });

  // Sort descending by amount so greedy match resolves largest debts first
  debtors.sort((a, b) => b.balance - a.balance);
  creditors.sort((a, b) => b.balance - a.balance);

  const transfers: SettlementTransfer[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0) {
      transfers.push({
        fromId: debtor.id,
        fromName: debtor.name,
        toId: creditor.id,
        toName: creditor.name,
        amountPaise: amount,
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) {
      dIdx++;
    }
    if (creditor.balance === 0) {
      cIdx++;
    }
  }

  return transfers;
}

