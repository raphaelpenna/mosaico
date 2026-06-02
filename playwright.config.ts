import { defineConfig, devices } from "@playwright/test";

/**
 * E2E do Mosaico. O store mock vive EM MEMÓRIA no servidor de dev (compartilhado
 * entre testes), então rodamos em série (workers: 1) para evitar corrida de
 * estado. Reusa um `pnpm dev` já rodando, ou sobe um.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/tasks",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
