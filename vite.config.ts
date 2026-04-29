/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isTesting = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

export default defineConfig(async () => {
  const plugins = isTesting
    ? [react()]
    : [react(), (await import("@tailwindcss/vite")).default()];

  return {
    plugins,
    server: { port: 5173 },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.ts",
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/components/**/*.tsx", "src/pages/**/*.tsx"],
        exclude: ["src/components/**/*.test.tsx", "src/pages/**/*.test.tsx"],
        thresholds: {
          lines: 95,
          functions: 95,
          branches: 95,
          statements: 95,
        },
      },
    },
  };
});
