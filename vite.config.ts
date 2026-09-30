import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, lazyPlugins } from "vite-plus";
import { fileURLToPath } from "node:url";

export default defineConfig({
  fmt: {
    ignorePatterns: ["content/**/*.md", ".agents/skills/**", ".agents/licenses/**"],
  },
  lint: {
    plugins: ["typescript", "unicorn", "oxc", "react"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      {
        name: "vite-plus",
        specifier: "vite-plus/oxlint-plugin",
      },
    ],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },
  plugins: lazyPlugins(() => [tailwindcss(), reactRouter()]),
  server: { open: true },
  resolve: { alias: { "~": fileURLToPath(new URL("./app", import.meta.url)) } },
});
