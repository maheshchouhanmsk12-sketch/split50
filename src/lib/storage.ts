import { Expense, Partner, Split50StorageState, ThemeMode } from "@/types";

export const STORAGE_KEY = "split50_data_v1";
export const THEME_KEY = "split50_theme";
export const CURRENT_SCHEMA_VERSION = 1;

export const DEFAULT_PARTNERS: Partner[] = [
  {
    id: "partner-mahesh",
    name: "Mahesh",
    avatarColor: "#B8F36B",
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "partner-abadh",
    name: "Abadh",
    avatarColor: "#8B83F6",
    isArchived: false,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

export const DEFAULT_EXPENSES: Expense[] = [
  {
    id: "exp-sample-1",
    title: "Room Rent",
    amountPaise: 500000,
    date: "2026-11-10",
    paidById: "partner-mahesh",
    splitAmongIds: ["partner-mahesh", "partner-abadh"],
    category: "Rent",
    description: "Monthly room rent contribution",
    createdAt: "2026-11-10T10:00:00.000Z",
    updatedAt: "2026-11-10T10:00:00.000Z",
  },
  {
    id: "exp-sample-2",
    title: "Groceries & Supplies",
    amountPaise: 300000,
    date: "2026-11-10",
    paidById: "partner-abadh",
    splitAmongIds: ["partner-mahesh", "partner-abadh"],
    category: "Groceries",
    description: "Weekly room supplies & food",
    createdAt: "2026-11-10T11:00:00.000Z",
    updatedAt: "2026-11-10T11:00:00.000Z",
  },
];

export const INITIAL_STORAGE_STATE: Split50StorageState = {
  version: CURRENT_SCHEMA_VERSION,
  partners: DEFAULT_PARTNERS,
  expenses: DEFAULT_EXPENSES,
  lastUpdated: "2026-01-01T00:00:00.000Z",
};

/**
 * Validates whether an unknown object fits the required Split50StorageState structure.
 */
export function validateStorageState(data: unknown): {
  isValid: boolean;
  state: Split50StorageState;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    errors.push("Invalid JSON: root must be an object");
    return { isValid: false, state: INITIAL_STORAGE_STATE, errors };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== "number") {
    errors.push("Missing or invalid schema version");
  }

  if (!Array.isArray(obj.partners)) {
    errors.push("Partners must be an array");
  }

  if (!Array.isArray(obj.expenses)) {
    errors.push("Expenses must be an array");
  }

  if (errors.length > 0) {
    return { isValid: false, state: INITIAL_STORAGE_STATE, errors };
  }

  // Validate partners
  const validatedPartners: Partner[] = [];
  const partnerIds = new Set<string>();

  for (let i = 0; i < (obj.partners as unknown[]).length; i++) {
    const p = (obj.partners as Record<string, unknown>[])[i];
    if (
      p &&
      typeof p.id === "string" &&
      p.id.trim() &&
      typeof p.name === "string" &&
      p.name.trim()
    ) {
      let partnerName = p.name.trim();
      const partnerId = p.id.trim();

      // Automatically migrate legacy placeholder names to user's partners
      if (partnerName === "Rahul" || partnerId === "partner-rahul") {
        partnerName = "Mahesh";
      } else if (partnerName === "Amit" || partnerId === "partner-amit") {
        partnerName = "Abadh";
      }

      validatedPartners.push({
        id: partnerId,
        name: partnerName,
        avatarColor: typeof p.avatarColor === "string" ? p.avatarColor : undefined,
        isArchived: Boolean(p.isArchived),
        createdAt: typeof p.createdAt === "string" ? p.createdAt : new Date().toISOString(),
      });
      partnerIds.add(partnerId);
    }
  }

  // Ensure minimum 2 active partners exist
  const activePartners = validatedPartners.filter((p) => !p.isArchived);
  if (activePartners.length < 2) {
    errors.push("At least two active partners are required");
  }

  // Validate expenses
  const validatedExpenses: Expense[] = [];
  for (let i = 0; i < (obj.expenses as unknown[]).length; i++) {
    const e = (obj.expenses as Record<string, unknown>[])[i];
    if (
      e &&
      typeof e.id === "string" &&
      typeof e.title === "string" &&
      e.title.trim() &&
      typeof e.amountPaise === "number" &&
      e.amountPaise > 0 &&
      typeof e.paidById === "string" &&
      Array.isArray(e.splitAmongIds) &&
      e.splitAmongIds.length > 0
    ) {
      validatedExpenses.push({
        id: e.id,
        title: e.title.trim(),
        amountPaise: Math.round(e.amountPaise),
        date: typeof e.date === "string" ? e.date : new Date().toISOString().slice(0, 10),
        paidById: e.paidById,
        splitAmongIds: e.splitAmongIds.filter((id): id is string => typeof id === "string"),
        category: (typeof e.category === "string" ? e.category : "Other") as Expense["category"],
        description: typeof e.description === "string" ? e.description : undefined,
        createdAt: typeof e.createdAt === "string" ? e.createdAt : new Date().toISOString(),
        updatedAt: typeof e.updatedAt === "string" ? e.updatedAt : new Date().toISOString(),
      });
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    state: {
      version: CURRENT_SCHEMA_VERSION,
      partners: validatedPartners.length >= 2 ? validatedPartners : DEFAULT_PARTNERS,
      expenses: validatedExpenses,
      lastUpdated: new Date().toISOString(),
    },
    errors,
  };
}

/**
 * Loads data safely from LocalStorage with fallback and error handling.
 */
export function loadFromLocalStorage(): Split50StorageState {
  if (typeof window === "undefined") {
    return INITIAL_STORAGE_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return INITIAL_STORAGE_STATE;
    }

    const parsed = JSON.parse(raw);
    const { isValid, state } = validateStorageState(parsed);

    if (!isValid) {
      console.warn("Storage validation found issues, using sanitized fallback state");
    }

    // If existing storage had no recorded expenses, populate default sample expenses
    if (state.expenses.length === 0) {
      state.expenses = DEFAULT_EXPENSES;
    }

    return state;
  } catch (err) {
    console.error("Failed to load or parse LocalStorage data:", err);
    return INITIAL_STORAGE_STATE;
  }
}

/**
 * Saves data safely to LocalStorage.
 */
export function saveToLocalStorage(state: Split50StorageState): boolean {
  if (typeof window === "undefined") return false;

  try {
    const dataToSave: Split50StorageState = {
      ...state,
      version: CURRENT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    return true;
  } catch (err) {
    console.error("Failed to save data to LocalStorage:", err);
    return false;
  }
}

/**
 * Creates and downloads a JSON backup file.
 */
export function exportBackup(state: Split50StorageState): void {
  const exportData = {
    appName: "Split50",
    exportedAt: new Date().toISOString(),
    ...state,
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;

  const downloadAnchor = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `split50_backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Parses and validates an imported JSON file string.
 */
export function parseImportBackup(jsonText: string): {
  success: boolean;
  state?: Split50StorageState;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonText);
    const { isValid, state, errors } = validateStorageState(parsed);

    if (!isValid) {
      return {
        success: false,
        error: errors.join(", "),
      };
    }

    return {
      success: true,
      state,
    };
  } catch (err) {
    return {
      success: false,
      error: `Invalid JSON format: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Theme persistence helpers.
 */
export function loadThemePreference(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // ignore
  }
  return "system";
}

export function saveThemePreference(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, mode);
  } catch {
    // ignore
  }
}

