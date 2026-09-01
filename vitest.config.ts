import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "next/image": fileURLToPath(new URL("./src/test/next-image.tsx", import.meta.url)),
      "next/link": fileURLToPath(new URL("./src/test/next-link.tsx", import.meta.url)),
    },
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
