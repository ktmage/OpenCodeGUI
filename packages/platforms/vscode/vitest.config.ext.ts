import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@opencodegui/agent-opencode": path.resolve(__dirname, "../../agents/opencode/src/index.ts"),
      "@opencodegui/core": path.resolve(__dirname, "../../core/src/index.ts"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/__tests__/**/*.test.ts"],
    setupFiles: ["src/__tests__/setup.ts"],
  },
});
