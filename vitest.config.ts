/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Separate vitest config that omits the @tailwindcss/vite plugin.
// The tailwindcss plugin requires a native binary (@tailwindcss/oxide)
// that is not needed during unit tests (jsdom environment).
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/components/**/*.tsx"],
      exclude: ["src/components/**/*.test.tsx"],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
