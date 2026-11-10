"use client";

import { useEffect } from "react";
import { useSplit } from "@/context/SplitContext";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

export function AndroidBridge() {
  const {
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    editingExpense,
    setEditingExpense,
    activeTab,
    setActiveTab,
  } = useSplit();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // 1. Configure Status Bar on Native Android
    const setupStatusBar = async () => {
      try {
        await StatusBar.setBackgroundColor({ color: "#17152B" });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.warn("StatusBar setup warning:", err);
      }
    };
    setupStatusBar();

    // 2. Hardware Back Button Handling on Android
    const backButtonHandler = App.addListener("backButton", ({ canGoBack }) => {
      // Priority 1: If Add/Edit Expense modal is open, close it
      if (isAddExpenseOpen || editingExpense) {
        setIsAddExpenseOpen(false);
        setEditingExpense(null);
        return;
      }

      // Priority 2: If on non-dashboard tab, navigate back to dashboard
      if (activeTab !== "dashboard") {
        setActiveTab("dashboard");
        return;
      }

      // Priority 3: If on dashboard and root, exit app
      App.exitApp();
    });

    return () => {
      backButtonHandler.then((handle) => handle.remove()).catch(() => {});
    };
  }, [
    isAddExpenseOpen,
    setIsAddExpenseOpen,
    editingExpense,
    setEditingExpense,
    activeTab,
    setActiveTab,
  ]);

  return null;
}

