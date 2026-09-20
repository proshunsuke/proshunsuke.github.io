import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["app/**/*.test.ts", "scripts/**/*.test.mjs"],
          exclude: ["app/**/*.browser.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [react(), tailwindcss()],
        test: {
          name: "browser",
          include: ["app/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ contextOptions: { colorScheme: "light" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
