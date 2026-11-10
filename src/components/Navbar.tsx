"use client";

import React from "react";
import { useSplit } from "@/context/SplitContext";
import { ThemeToggle } from "./ThemeToggle";
import {
  Home,
  CircleArrowDown,
  Settings,
  Coins,
} from "lucide-react";

export function Navbar() {
  const { activeTab, setActiveTab } = useSplit();

  return (
    <>
      {/* Sleek Minimal Top Bar */}
      <header className="w-full max-w-md mx-auto px-4 pt-3 pb-1 flex items-center justify-between">
        <div
          onClick={() => setActiveTab("dashboard")}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#B8F36B] text-[#17152B] flex items-center justify-center font-black shadow-md shadow-[#B8F36B]/20">
            <Coins className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-base font-black tracking-tight text-gray-900 dark:text-white">
            Split50
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Exact Mobile/App Bottom Navigation Bar from Image 1 */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl border-t bg-white/95 dark:bg-[#121020]/95 border-gray-200 dark:border-white/10 pb-safe shadow-lg">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
          {/* Home */}
          <button
            type="button"
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "dashboard"
                ? "text-gray-900 dark:text-[#B8F36B] font-bold"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Home</span>
          </button>

          {/* Expenses */}
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "expenses"
                ? "text-gray-900 dark:text-[#B8F36B] font-bold"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <CircleArrowDown className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Expenses</span>
          </button>

          {/* Settings */}
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "settings"
                ? "text-gray-900 dark:text-[#B8F36B] font-bold"
                : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] font-semibold">Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
}
