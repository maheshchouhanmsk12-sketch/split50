# Split50 — Premium, Minimal & Fully Functional Expense Sharing App

Split50 is a modern, high-precision expense sharing web application built primarily for partners, couples, roommates, and friends.

> **Product Philosophy:** *Simple outside, powerful inside.*  
> No unnecessary menus, cluttered dashboards, or multi-step configuration. A new user can understand the settlement status in 2 seconds and record an expense in under 10 seconds.

---

## 🎨 Color Palette & Design System

Split50 is built on a custom fintech design system:

| Color Name | Hex Code | Role |
| :--- | :--- | :--- |
| **Midnight Plum** | `#17152B` | Dark theme surface & deep accent |
| **Electric Lime** | `#B8F36B` | Primary call-to-action & positive balances |
| **Warm Ivory** | `#F6F5F1` | Light theme comfortable background |
| **Soft Coral** | `#FF8C72` | Negative balances, alerts & destructive actions |
| **Muted Violet** | `#8B83F6` | Category pills, icons & secondary accents |

Both light and dark themes are built with high contrast and accessibility in mind, supporting instant toggling and matching system preferences.

---

## 🚀 Key Features

### 1. Main Settlement Dashboard
- **Instant Settlement Banner:** Impossible to miss hero status displaying exact settlement (e.g. `Rahul owes Amit ₹1,450` or `All settled up!`).
- **4 Key Financial Metric Cards:**
  1. Total expenses spent
  2. Equal share per person
  3. Amount paid by each partner
  4. Current net balance (who receives vs who owes)
- **Primary Quick Action:** One-click `+ Add Expense` button.
- **Recent Expenses:** Clean compact preview of recent transactions with direct passbook link.

### 2. Fast Expense Management
- Large INR amount input with real-time equal share calculation.
- Date input defaulting to current date.
- Payer selector with active member avatars.
- Customizable equal split selection among eligible partners.
- 9 Default categories: *Groceries, Rent, Electricity, Milk, Vegetables, Food, Internet, Travel, Other*.
- Optional notes/descriptions.
- Form validation and duplicate submission protection.
- Support for editing existing transactions.

### 3. Expense Passbook (History)
- Chronological timeline with newest transactions first.
- **Grouped by month and year** with monthly totals (e.g. `November 2026 • Monthly Total: ₹12,450`).
- Real-time search by title, description, category, or partner name.
- Partner and Category filter dropdowns.
- Transaction counter and filtered sum.
- Edit and delete actions with confirmation dialogs.

### 4. Partner Management
- Default 50/50 partners: Rahul & Amit.
- Add partner, rename partner, and archive partner.
- Minimum 2 active partners enforced.
- **Historical Record Integrity:** Archiving a partner excludes them from new expenses while permanently preserving historical records and past settlement calculations.

### 5. Accurate Financial Calculation Engine
- **Integer Paise Arithmetic:** All internal computations use integer paise (`amountPaise`). Never suffers from floating-point rounding issues (e.g., `0.1 + 0.2 != 0.3`).
- **Exact Remainder Distribution:** When an amount cannot be divided evenly (e.g., ₹100 split 3 ways), remainder paise are distributed deterministically so the sum of individual shares equals the exact total expenditure.
- **Zero-Sum Reconciliation:** $\sum \text{netBalance} = 0$ is mathematically guaranteed.
- **Multi-partner Debt Settlement:** Employs a greedy debt minimization algorithm that resolves net debtors and creditors in the minimal practical number of transfers.
- **Negative-Zero Guard:** Prevents `-₹0` or `-₹0.00` from ever appearing.

### 6. WhatsApp Sharing & Clipboard Integration
- Formatted text report generation matching the official standard:
  ```
  SPLIT50 — EXPENSE REPORT
  
  Total Expenses: ₹8,000
  Per Person Share: ₹4,000
  
  Contributions:
  • Rahul Paid: ₹6,000
  • Amit Paid: ₹2,000
  
  FINAL SETTLEMENT:
  Amit pays Rahul ₹2,000.
  ```
- Direct click-to-chat WhatsApp link (`https://wa.me/?text=...`).
- Copy Summary button with modern Clipboard API and fallback textarea support.

### 7. LocalStorage Persistence & Versioning
- Versioned storage schema (`split50_data_v1`).
- Survives browser restarts and page refreshes.
- Zero server database or login required.
- Full backup export (`.json`) and import with structure validation.
- Destructive actions (Reset Expenses, Reset Everything) protected with confirmation dialogs.

---

## 🛠️ Technology Stack

- **Framework:** Next.js App Router (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Storage:** LocalStorage (versioned & validated)
- **Testing:** Vitest

---

## 📦 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node v22.15.1)
- npm 9+

### Installation
```bash
# Clone or navigate to the project directory
cd room

# Install dependencies
npm install

# Run automated tests
npm test

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

Split50 includes automated unit and integration tests covering all 13 core financial and feature scenarios:

```bash
npm test
```

### Verified Scenarios:
1. Rahul pays ₹5,000 and Amit pays ₹3,000 $\rightarrow$ Amit owes Rahul ₹1,000.
2. Rahul pays ₹2,000 and Amit pays ₹2,000 $\rightarrow$ All settled up.
3. 3 partners: Rahul pays ₹6,000, Amit & Rohit pay 0 $\rightarrow$ Each owes Rahul ₹2,000.
4. Decimal parsing: ₹99.50 handled without floating-point error.
5. Deleting an expense updates calculations immediately.
6. Editing an expense updates calculations immediately.
7. Adding a partner updates future equal splits while preserving historical records.
8. Archiving a partner preserves historical calculations.
9. LocalStorage schema validation and graceful fallback for corrupted data.
10. Dark and light mode preference persistence.
11. WhatsApp report generation with accurate figures.
12. JSON backup export and import validation.
13. Deterministic remainder distribution with zero financial leakage.

---

## 🚀 Production Build & Deployment

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Push this repository to GitHub/GitLab.
2. Import the repository into [Vercel](https://vercel.com).
3. The default Next.js build settings (`next build`) will automatically compile and deploy the app.

---

## 📄 License
MIT License. Built for simplicity, accuracy, and ease of use.
