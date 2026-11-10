# Split50 — Premium, Zero-Friction Expense Sharing App

Split50 is a modern, high-precision expense sharing web and mobile application inspired by Apple Pay, Linear, and CRED. Designed primarily for partners, couples, roommates, and friends with an exact 50/50 equal-split philosophy.

> **Product Philosophy:** *Simple outside, powerful inside.*  
> No unnecessary menus, cluttered dashboards, or multi-step configuration. A user understands their settlement status in 2 seconds and can record an expense in under 5 seconds.

---

## 🎨 Fintech Design System

Split50 uses a minimalist, fintech-grade design system:

| Role | Light Theme | Dark Theme | Purpose |
| :--- | :--- | :--- | :--- |
| **Background** | `#FAFAFA` (Pristine Zinc) | `#09090B` (OLED Deep Zinc) | Core surface contrast |
| **Cards & Surfaces** | `#FFFFFF` | `#121215` / `#18181B` | Elevated rounded-3xl cards |
| **Primary Accent** | `#059669` (Emerald) | `#10B981` (Vibrant Emerald) | Positive balances, CTA buttons |
| **Debt / Alert** | `#E11D48` (Rose) | `#FB7185` (Soft Rose) | Negative balances, dues, delete |
| **Secondary Accent**| `#4F46E5` (Indigo) | `#818CF8` (Soft Indigo) | Categories, icons, chips |

---

## 🚀 Complete Feature Set

### 1. Hero Settlement Dashboard
- **Instant Settlement Banner:** Displays current settlement status prominently (e.g., `Abadh owes Mahesh ₹1,000` or `All settled up! Everyone is even.`).
- **4 Real-time Metric Cards:**
  1. Total Spent (across all expenses)
  2. Equal Share Per Person
  3. Amount Paid By Each Member
  4. Net Balances (who owes vs who receives with directional indicators)
- **WhatsApp Share:** 1-click formatted expense report generator with WhatsApp click-to-chat and copy-to-clipboard functionality.

### 2. Inline Quick Add Expense Form
- **Directly on the Main Dashboard:** No modals or multi-click navigation required to add expenses.
- **Large INR Amount Input:** Automatic tabular formatting.
- **Instant Per-Person Calculation:** Live preview showing each person's exact share.
- **1-Click Quick Category Chips:** *Groceries, Room Rent, Electricity, Milk, Vegetables, Food, Internet, Travel, Other*.
- **Payer Selector Pills & Equal Split Toggle:** Seamlessly pick who paid and who shares.
- **Duplicate Prevention:** Form disables during submission and automatically resets.

### 3. Expense Passbook (Ledger)
- Chronological timeline with newest transactions first.
- **Grouped by Month & Year:** With monthly expense totals.
- **Real-Time Search:** Search by title, notes, category, or payer name.
- **Filters:** Filter by member and category.
- **Edit & Delete:** Full transaction modification with confirmation modals.

### 4. Partner Management
- Default members: **Mahesh** and **Abadh**.
- Add partner, rename partner, and archive partner.
- Minimum 2 active partners enforced.
- **Historical Integrity:** Archiving a partner excludes them from new expenses while permanently preserving historical records and past settlement calculations.

### 5. Financial Calculation Engine
- **Integer Paise Arithmetic:** Computes all transactions in integer paise (`amountPaise`) to eliminate floating-point math errors.
- **Fair Remainder Distribution:** Divides indivisible sums (e.g. ₹100 split 3 ways) deterministically so the sum of individual shares equals the exact total.
- **Zero-Sum Guarantee:** $\sum \text{netBalance} = 0$ is strictly verified.
- **Greedy Debt Minimizer:** For 3+ partners, computes the minimum required settlement transfers.
- **Negative-Zero Guard:** Prevents `-₹0` from ever rendering.

### 6. Local Data Persistence & Backup
- Versioned LocalStorage schema (`split50_data_v1`).
- Completely private and offline-first — no server database or login required.
- JSON backup export and import with structure validation.
- Reset expenses and reset application controls with confirmation protection.

### 7. Android App (Capacitor & Codemagic)
- Packaged as an installable Android APK (`com.split50.app`).
- Fully local asset bundling (`out/`) for 100% offline startup.
- Automated Codemagic CI/CD build configuration (`codemagic.yaml`) on free-tier macOS M2 instances.

---

## 🛠️ Technology Stack

- **Framework:** Next.js App Router (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Mobile Engine:** Capacitor v8 (Android)
- **Icons:** Lucide React
- **Storage:** LocalStorage (versioned)
- **Testing:** Vitest

---

## 🧪 Automated Testing Suite

All 12 core financial and feature scenarios are covered by automated unit and integration tests:

```bash
npm test
```

### Verified Scenarios:
1. Rahul pays ₹5,000 and Amit pays ₹3,000 $\rightarrow$ Amit owes Rahul ₹1,000.
2. Rahul pays ₹2,000 and Amit pays ₹2,000 $\rightarrow$ All settled up.
3. 3 partners: Rahul pays ₹6,000, Amit & Rohit pay 0 $\rightarrow$ Each owes Rahul ₹2,000.
4. Decimal parsing: ₹99.50 handled with exact integer paise precision.
5. Deleting an expense updates calculations immediately.
6. Editing an expense updates calculations immediately.
7. Adding a partner updates future equal splits while preserving historical records.
8. Archiving a partner preserves historical calculations.
9. LocalStorage schema validation and graceful fallback for corrupted data.
10. Dark and light mode preference persistence.
11. WhatsApp report generation with accurate figures.
12. Deterministic remainder distribution with zero financial leakage.

---

## 📦 Getting Started Locally

```bash
# Install dependencies
npm install

# Run automated tests
npm test

# Run development server
npm run dev

# Build static output and sync with Android Capacitor
npm run build:android
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👑 Creator Credit

- **Creator:** MAHESH KHAROL
- **Contact:** [9009958903](tel:9009958903)
