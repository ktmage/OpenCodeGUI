import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: "webview",
  build: {
    outDir: "../dist/webview",
    emptyOutDir: true,
    // Webview では単一の JS/CSS ファイルにバンドルしたい
    cssCodeSplit: false,
  },
});
