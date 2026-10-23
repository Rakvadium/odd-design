import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    include: ["tests/**/*.fixture.ts"],
    setupFiles: ["./tests/setup.ts"],
    chaiConfig: { truncateThreshold: 0 },
  },
});
