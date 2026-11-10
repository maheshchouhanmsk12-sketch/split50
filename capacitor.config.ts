import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.split50.app",
  appName: "Split50",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      style: "DARK",
      backgroundColor: "#17152B",
      overlaysWebView: false,
    },
  },
};

export default config;

