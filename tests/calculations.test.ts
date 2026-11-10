import { describe, it, expect } from "vitest";
import {
  inrToPaise,
  formatPaise,
  calculateExpenseShares,
  calculateSettlementSummary,
} from "../src/lib/calculations";
import { Partner, Expense } from "../src/types";

describe("Financial Precision & Calculation Engine", () => {
  const rahul: Partner = {
    id: "p1",
    name: "Rahul",
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  const amit: Partner = {
    id: "p2",
    name: "Amit",
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  const rohit: Partner = {
    id: "p3",
    name: "Rohit",
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  // Scenario 1: Rahul pays ₹5,000 and Amit pays ₹3,000. Amit owes Rahul ₹1,000.
  it("Scenario 1: Rahul pays ₹5,000 and Amit pays ₹3,000 -> Amit owes Rahul ₹1,000", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        title: "Groceries",
        amountPaise: 500000, // ₹5,000
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Groceries",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
      {
        id: "e2",
        title: "Dinner",
        amountPaise: 300000, // ₹3,000
        date: "2026-11-10",
        paidById: amit.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Food",
        createdAt: "2026-11-10T11:00:00Z",
        updatedAt: "2026-11-10T11:00:00Z",
      },
    ];

    const summary = calculateSettlementSummary([rahul, amit], expenses);

    expect(summary.totalExpenditurePaise).toBe(800000); // ₹8,000 total

    const rahulMetric = summary.partnerMetrics.find((m) => m.partnerId === rahul.id);
    const amitMetric = summary.partnerMetrics.find((m) => m.partnerId === amit.id);

    expect(rahulMetric?.paidPaise).toBe(500000);
    expect(rahulMetric?.owedPaise).toBe(400000);
    expect(rahulMetric?.netBalancePaise).toBe(100000); // Rahul should receive ₹1,000

    expect(amitMetric?.paidPaise).toBe(300000);
    expect(amitMetric?.owedPaise).toBe(400000);
    expect(amitMetric?.netBalancePaise).toBe(-100000); // Amit owes ₹1,000

    expect(summary.transfers).toHaveLength(1);
    expect(summary.transfers[0]).toEqual({
      fromId: amit.id,
      fromName: "Amit",
      toId: rahul.id,
      toName: "Rahul",
      amountPaise: 100000,
    });
    expect(summary.headlineStatus).toBe("Amit owes Rahul ₹1,000");
  });

  // Scenario 2: Rahul pays ₹2,000 and Amit pays ₹2,000. Everyone is settled.
  it("Scenario 2: Rahul pays ₹2,000 and Amit pays ₹2,000 -> All settled up", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        title: "Internet",
        amountPaise: 200000,
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Internet",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
      {
        id: "e2",
        title: "Electricity",
        amountPaise: 200000,
        date: "2026-11-10",
        paidById: amit.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Electricity",
        createdAt: "2026-11-10T11:00:00Z",
        updatedAt: "2026-11-10T11:00:00Z",
      },
    ];

    const summary = calculateSettlementSummary([rahul, amit], expenses);

    expect(summary.totalExpenditurePaise).toBe(400000);
    expect(summary.isSettled).toBe(true);
    expect(summary.transfers).toHaveLength(0);
    expect(summary.headlineStatus).toBe("All settled up!");

    const rahulMetric = summary.partnerMetrics.find((m) => m.partnerId === rahul.id);
    const amitMetric = summary.partnerMetrics.find((m) => m.partnerId === amit.id);
    expect(rahulMetric?.netBalancePaise).toBe(0);
    expect(amitMetric?.netBalancePaise).toBe(0);
  });

  // Scenario 3: Three partners: Rahul pays ₹6,000, Amit and Rohit pay nothing. Each owes Rahul ₹2,000.
  it("Scenario 3: Three partners: Rahul pays ₹6,000, Amit and Rohit pay 0 -> Each owes Rahul ₹2,000", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        title: "Home Decor",
        amountPaise: 600000,
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id, rohit.id],
        category: "Other",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
    ];

    const summary = calculateSettlementSummary([rahul, amit, rohit], expenses);

    expect(summary.totalExpenditurePaise).toBe(600000);
    expect(summary.transfers).toHaveLength(2);

    const amitTransfer = summary.transfers.find((t) => t.fromId === amit.id);
    const rohitTransfer = summary.transfers.find((t) => t.fromId === rohit.id);

    expect(amitTransfer?.toId).toBe(rahul.id);
    expect(amitTransfer?.amountPaise).toBe(200000);

    expect(rohitTransfer?.toId).toBe(rahul.id);
    expect(rohitTransfer?.amountPaise).toBe(200000);
  });

  // Scenario 4: Decimal amount: ₹99.50.
  it("Scenario 4: Handles exact decimal amounts (₹99.50) without float errors", () => {
    const paise = inrToPaise("99.50");
    expect(paise).toBe(9950);
    expect(formatPaise(paise)).toBe("₹99.50");

    const expenses: Expense[] = [
      {
        id: "e1",
        title: "Milk & Bread",
        amountPaise: 9950,
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Milk",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
    ];

    const summary = calculateSettlementSummary([rahul, amit], expenses);
    expect(summary.transfers).toHaveLength(1);
    expect(summary.transfers[0].amountPaise).toBe(4975); // ₹49.75
    expect(formatPaise(summary.transfers[0].amountPaise)).toBe("₹49.75");
  });

  // Scenario 5 & 6: Editing and Deleting an expense updates calculations
  it("Scenario 5 & 6: Deleting and editing expenses updates calculations immediately", () => {
    let expenses: Expense[] = [
      {
        id: "e1",
        title: "Electricity",
        amountPaise: 400000, // ₹4,000
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Electricity",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
    ];

    // Initial check
    let summary = calculateSettlementSummary([rahul, amit], expenses);
    expect(summary.transfers[0].amountPaise).toBe(200000);

    // Edit expense to ₹6,000
    expenses = [
      {
        ...expenses[0],
        amountPaise: 600000,
        updatedAt: "2026-11-10T12:00:00Z",
      },
    ];
    summary = calculateSettlementSummary([rahul, amit], expenses);
    expect(summary.transfers[0].amountPaise).toBe(300000);

    // Delete expense
    expenses = [];
    summary = calculateSettlementSummary([rahul, amit], expenses);
    expect(summary.totalExpenditurePaise).toBe(0);
    expect(summary.transfers).toHaveLength(0);
    expect(summary.isSettled).toBe(true);
  });

  // Scenario 7: Adding a partner updates future equal splits
  it("Scenario 7: Adding a partner updates future splits while preserving historical", () => {
    // Historical expense when it was just Rahul & Amit
    const exp1: Expense = {
      id: "e1",
      title: "Rent Month 1",
      amountPaise: 2000000, // ₹20,000
      date: "2026-10-01",
      paidById: rahul.id,
      splitAmongIds: [rahul.id, amit.id], // 2 people
      category: "Rent",
      createdAt: "2026-10-01T10:00:00Z",
      updatedAt: "2026-10-01T10:00:00Z",
    };

    // Rohit joins later, new expense shared among 3
    const exp2: Expense = {
      id: "e2",
      title: "Rent Month 2",
      amountPaise: 3000000, // ₹30,000
      date: "2026-11-01",
      paidById: rahul.id,
      splitAmongIds: [rahul.id, amit.id, rohit.id], // 3 people
      category: "Rent",
      createdAt: "2026-11-01T10:00:00Z",
      updatedAt: "2026-11-01T10:00:00Z",
    };

    const summary = calculateSettlementSummary([rahul, amit, rohit], [exp1, exp2]);

    const amitMetric = summary.partnerMetrics.find((m) => m.partnerId === amit.id);
    const rohitMetric = summary.partnerMetrics.find((m) => m.partnerId === rohit.id);

    // Amit owed 10,000 on exp1 + 10,000 on exp2 = 20,000
    expect(amitMetric?.owedPaise).toBe(2000000);

    // Rohit only owed on exp2 = 10,000
    expect(rohitMetric?.owedPaise).toBe(1000000);
  });

  // Scenario 8: Archiving a partner preserves historical records
  it("Scenario 8: Archiving a partner preserves historical balances and accounting", () => {
    const archivedRohit: Partner = {
      ...rohit,
      isArchived: true,
    };

    const exp: Expense = {
      id: "e1",
      title: "Shared Sofa",
      amountPaise: 900000, // ₹9,000
      date: "2026-09-01",
      paidById: rahul.id,
      splitAmongIds: [rahul.id, amit.id, archivedRohit.id],
      category: "Other",
      createdAt: "2026-09-01T10:00:00Z",
      updatedAt: "2026-09-01T10:00:00Z",
    };

    const summary = calculateSettlementSummary([rahul, amit, archivedRohit], [exp]);

    const rohitMetric = summary.partnerMetrics.find((m) => m.partnerId === archivedRohit.id);
    expect(rohitMetric?.isArchived).toBe(true);
    expect(rohitMetric?.owedPaise).toBe(300000); // Still owed ₹3,000 historically

    const rohitTransfer = summary.transfers.find((t) => t.fromId === archivedRohit.id);
    expect(rohitTransfer?.amountPaise).toBe(300000);
  });

  // Scenario 13: Rounding and remainder distribution reconcile exactly
  it("Scenario 13: Exact remainder distribution prevents 1-paise leaks", () => {
    // ₹100 split 3 ways: 10000 / 3 = 3333 with remainder 1
    const shares3 = calculateExpenseShares(10000, ["a", "b", "c"]);
    let sum = 0;
    shares3.forEach((val) => (sum += val));
    expect(sum).toBe(10000);
    expect(shares3.get("a")).toBe(3334);
    expect(shares3.get("b")).toBe(3333);
    expect(shares3.get("c")).toBe(3333);

    // ₹10 split 7 ways: 1000 / 7 = 142 remainder 6
    const shares7 = calculateExpenseShares(1000, ["1", "2", "3", "4", "5", "6", "7"]);
    let sum7 = 0;
    shares7.forEach((val) => (sum7 += val));
    expect(sum7).toBe(1000);

    // Total net balance across all partners must sum to 0
    const exp: Expense = {
      id: "e1",
      title: "Odd split",
      amountPaise: 10000,
      date: "2026-11-10",
      paidById: rahul.id,
      splitAmongIds: [rahul.id, amit.id, rohit.id],
      category: "Food",
      createdAt: "2026-11-10T10:00:00Z",
      updatedAt: "2026-11-10T10:00:00Z",
    };

    const summary = calculateSettlementSummary([rahul, amit, rohit], [exp]);
    const netSum = summary.partnerMetrics.reduce((acc, m) => acc + m.netBalancePaise, 0);
    expect(netSum).toBe(0);

    // Verify formatPaise never displays negative zero
    expect(formatPaise(-0)).toBe("₹0");
    expect(formatPaise(0)).toBe("₹0");
  });
});

