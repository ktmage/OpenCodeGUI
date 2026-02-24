import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    root: "webview",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["./__tests__/**/*.test.tsx"],
    globals: true,
  },
});
