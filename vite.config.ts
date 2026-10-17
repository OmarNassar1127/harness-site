import { resolve } from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/",
  plugins: [tailwindcss()],
  build: {
    target: "es2020",
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        en: resolve(import.meta.dirname, "index.html"),
        nl: resolve(import.meta.dirname, "nl/index.html"),
        agentsEn: resolve(import.meta.dirname, "agents/index.html"),
        agentsNl: resolve(import.meta.dirname, "nl/agents/index.html"),
      },
    },
  },
});
