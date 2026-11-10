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
});

