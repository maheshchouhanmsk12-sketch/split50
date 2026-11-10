import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SplitProvider } from "@/context/SplitContext";
import { ToastContainer } from "@/components/Toast";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { Navbar } from "@/components/Navbar";
import { AndroidBridge } from "@/components/AndroidBridge";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#17152B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Split50 — Premium & Minimal Expense Sharing",
  description: "Accurate, beautiful and fast 50/50 expense sharing for couples, partners, and roommates.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <SplitProvider>
            <AndroidBridge />
            <Navbar />
            <main className="flex-1 pb-24 md:pb-12">{children}</main>
            <AddExpenseModal />
            <ToastContainer />
          </SplitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
