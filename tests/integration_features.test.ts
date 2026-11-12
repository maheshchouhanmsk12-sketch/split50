import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  validateStorageState,
  parseImportBackup,
  loadThemePreference,
  saveThemePreference,
  CURRENT_SCHEMA_VERSION,
  DEFAULT_PARTNERS,
} from "../src/lib/storage";
import { generateWhatsAppReport } from "../src/lib/whatsapp";
import { calculateSettlementSummary } from "../src/lib/calculations";
import { Partner, Expense, Split50StorageState } from "../src/types";

describe("Storage, Persistence, Backup & WhatsApp Integration Tests", () => {
  const rahul: Partner = {
    id: "p1",
    name: "Rahul",
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  const amit: Partner = {
    id: "p2",
    name: "Amit",
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  };

  // Mock localStorage for node environment
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      clear: () => {
        store = {};
      },
      removeItem: (key: string) => {
        delete store[key];
      },
    };
  })();

  beforeEach(() => {
    localStorageMock.clear();
    vi.stubGlobal("window", {
      localStorage: localStorageMock,
    });
  });

  // Scenario 9: Data persists after refresh & handles corrupted storage gracefully
  it("Scenario 9: Validates stored JSON schema and handles corrupted storage", () => {
    // Valid state
    const validData: Split50StorageState = {
      version: CURRENT_SCHEMA_VERSION,
      partners: [rahul, amit],
      expenses: [
        {
          id: "exp-1",
          title: "Vegetables",
          amountPaise: 45000,
          date: "2026-11-10",
          paidById: rahul.id,
          splitAmongIds: [rahul.id, amit.id],
          category: "Vegetables",
          createdAt: "2026-11-10T00:00:00.000Z",
          updatedAt: "2026-11-10T00:00:00.000Z",
        },
      ],
      lastUpdated: "2026-11-10T10:00:00.000Z",
    };

    const validation = validateStorageState(validData);
    expect(validation.isValid).toBe(true);
    expect(validation.state.expenses).toHaveLength(1);
    expect(validation.state.partners).toHaveLength(2);

    // Corrupted state (null, string, wrong version, malformed expenses)
    const corruptedValidation = validateStorageState("invalid string");
    expect(corruptedValidation.isValid).toBe(false);
    expect(corruptedValidation.state.partners).toEqual(DEFAULT_PARTNERS);

    const badPartners = validateStorageState({
      version: 1,
      partners: [{ id: "only-one", name: "Solo" }],
      expenses: [],
    });
    // Requires minimum 2 active partners
    expect(badPartners.isValid).toBe(false);
    expect(badPartners.errors).toContain("At least two active partners are required");
  });

  // Scenario 10: Dark mode preference persists
  it("Scenario 10: Dark mode and theme preference persist correctly", () => {
    // Initially system
    expect(loadThemePreference()).toBe("system");

    // Save dark
    saveThemePreference("dark");
    expect(localStorageMock.getItem("split50_theme")).toBe("dark");
    expect(loadThemePreference()).toBe("dark");

    // Save light
    saveThemePreference("light");
    expect(localStorageMock.getItem("split50_theme")).toBe("light");
    expect(loadThemePreference()).toBe("light");
  });

  // Scenario 11: WhatsApp summary displays accurate amounts
  it("Scenario 11: WhatsApp summary formats amounts and settlements accurately", () => {
    const expenses: Expense[] = [
      {
        id: "e1",
        title: "Weekly Grocery",
        amountPaise: 600000, // ₹6,000
        date: "2026-11-10",
        paidById: rahul.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Groceries",
        createdAt: "2026-11-10T10:00:00Z",
        updatedAt: "2026-11-10T10:00:00Z",
      },
      {
        id: "e2",
        title: "Snacks",
        amountPaise: 200000, // ₹2,000
        date: "2026-11-10",
        paidById: amit.id,
        splitAmongIds: [rahul.id, amit.id],
        category: "Food",
        createdAt: "2026-11-10T11:00:00Z",
        updatedAt: "2026-11-10T11:00:00Z",
      },
    ];

    const summary = calculateSettlementSummary([rahul, amit], expenses);
    const report = generateWhatsAppReport(summary);

    // Verify key lines in the report
    expect(report).toContain("SPLIT50 — EXPENSE REPORT");
    expect(report).toContain("Total Expenses: ₹8,000");
    expect(report).toContain("Per Person Share: ₹4,000");
    expect(report).toContain("• Rahul Paid: ₹6,000");
    expect(report).toContain("• Amit Paid: ₹2,000");
    expect(report).toContain("FINAL SETTLEMENT:");
    expect(report).toContain("Amit pays Rahul ₹2,000.");
  });

  // Scenario 12: Import/export backup works correctly
  it("Scenario 12: Import and export backup validates structure and rejects invalid payloads", () => {
    const backupJson = JSON.stringify({
      appName: "Split50",
      version: 1,
      partners: [rahul, amit],
      expenses: [
        {
          id: "e-import-1",
          title: "WiFi bill",
          amountPaise: 150000,
          date: "2026-11-05",
          paidById: amit.id,
          splitAmongIds: [rahul.id, amit.id],
          category: "Internet",
          createdAt: "2026-11-05T00:00:00.000Z",
          updatedAt: "2026-11-05T00:00:00.000Z",
        },
      ],
      lastUpdated: "2026-11-10T00:00:00.000Z",
    });

    const parsed = parseImportBackup(backupJson);
    expect(parsed.success).toBe(true);
    expect(parsed.state?.expenses).toHaveLength(1);
    expect(parsed.state?.expenses[0].title).toBe("WiFi bill");

    // Invalid JSON test
    const badJson = parseImportBackup("{ malformed json ... }");
    expect(badJson.success).toBe(false);
    expect(badJson.error).toContain("Invalid JSON format");

    // Incompatible payload (empty object)
    const emptyPayload = parseImportBackup(JSON.stringify({}));
    expect(emptyPayload.success).toBe(false);
    expect(emptyPayload.error).toContain("Missing or invalid schema version");
  });

  // Scenario 13: Multiple member lifecycle — Add, Edit, Delete and LocalStorage persistence across refresh
  it("Scenario 13: Supports multiple members with full Add, Edit, Delete and refresh persistence", () => {
    // 1. Initial state with 3 members
    const member1: Partner = {
      id: "m1",
      name: "Mahesh",
      isArchived: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const member2: Partner = {
      id: "m2",
      name: "Abadh",
      isArchived: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    };
    const member3: Partner = {
      id: "m3",
      name: "Suresh",
      isArchived: false,
      createdAt: "2026-01-01T00:00:00.000Z",
    };

    const initialData: Split50StorageState = {
      version: 1,
      partners: [member1, member2, member3],
      expenses: [
        {
          id: "e-multi-1",
          title: "Dinner",
          amountPaise: 300000, // ₹3,000
          date: "2026-11-12",
          paidById: member1.id,
          splitAmongIds: [member1.id, member2.id, member3.id],
          category: "Food",
          createdAt: "2026-11-12T00:00:00.000Z",
          updatedAt: "2026-11-12T00:00:00.000Z",
        },
      ],
      lastUpdated: "2026-11-12T00:00:00.000Z",
    };

    // Save state to simulated LocalStorage
    localStorageMock.setItem("split50_data_v1", JSON.stringify(initialData));

    // Simulate page reload by validating stored data
    const reloaded = JSON.parse(localStorageMock.getItem("split50_data_v1")!);
    const validation = validateStorageState(reloaded);
    expect(validation.isValid).toBe(true);
    expect(validation.state.partners).toHaveLength(3);
    expect(validation.state.partners.map((p) => p.name)).toEqual(["Mahesh", "Abadh", "Suresh"]);

    // Calculate settlement among 3 members: Mahesh paid ₹3,000, each share is ₹1,000.
    // Suresh owes ₹1,000, Abadh owes ₹1,000 to Mahesh.
    const summary = calculateSettlementSummary(validation.state.partners, validation.state.expenses);
    expect(summary.totalExpenditurePaise).toBe(300000);
    expect(summary.partnerCount).toBe(3);
    const maheshMetric = summary.partnerMetrics.find((m) => m.partnerId === "m1");
    expect(maheshMetric?.netBalancePaise).toBe(200000); // +₹2,000

    // 2. Edit / Rename Member
    const renamedPartners = validation.state.partners.map((p) =>
      p.id === "m3" ? { ...p, name: "Suresh Sharma" } : p
    );
    const updatedState: Split50StorageState = {
      ...validation.state,
      partners: renamedPartners,
    };
    localStorageMock.setItem("split50_data_v1", JSON.stringify(updatedState));

    // Verify rename persists after refresh
    const reloadedAfterRename = JSON.parse(localStorageMock.getItem("split50_data_v1")!);
    const renameValidation = validateStorageState(reloadedAfterRename);
    expect(renameValidation.state.partners.find((p) => p.id === "m3")?.name).toBe("Suresh Sharma");

    // 3. Delete Member (Delete Suresh Sharma)
    const remainingPartners = renameValidation.state.partners.filter((p) => p.id !== "m3");
    // Clean up expenses
    const cleanedExpenses = renameValidation.state.expenses.map((exp) => ({
      ...exp,
      splitAmongIds: exp.splitAmongIds.filter((id) => id !== "m3"),
    }));

    const stateAfterDelete: Split50StorageState = {
      version: 1,
      partners: remainingPartners,
      expenses: cleanedExpenses,
      lastUpdated: new Date().toISOString(),
    };
    localStorageMock.setItem("split50_data_v1", JSON.stringify(stateAfterDelete));

    // Verify delete persists after refresh
    const reloadedAfterDelete = JSON.parse(localStorageMock.getItem("split50_data_v1")!);
    const deleteValidation = validateStorageState(reloadedAfterDelete);
    expect(deleteValidation.state.partners).toHaveLength(2);
    expect(deleteValidation.state.partners.map((p) => p.name)).toEqual(["Mahesh", "Abadh"]);
    expect(deleteValidation.state.expenses[0].splitAmongIds).toEqual(["m1", "m2"]);
  });
});

