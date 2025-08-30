import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    // Ensure consistent React version resolution
    server: {
      deps: {
        external: ["react", "react-dom"],
      },
    },
  },
});
