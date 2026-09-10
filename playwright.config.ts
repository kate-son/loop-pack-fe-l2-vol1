import { defineConfig, devices } from '@playwright/test';

const E2E_PORT = 3100;
const E2E_HOST = '127.0.0.1';
const E2E_BASE_URL = `http://${E2E_HOST}:${E2E_PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // list는 실행 중 사람이 읽는 용도, json은 재시도로 통과한 테스트를 CI에서 집계하는 용도다.
  // json에는 trace가 들어가지 않으므로 CI에서는 test-results/도 함께 보관한다.
  reporter: [['list'], ['json', { outputFile: 'playwright-report/results.json' }]],
  use: {
    baseURL: E2E_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `./node_modules/.bin/next build && ./node_modules/.bin/next start --hostname ${E2E_HOST} --port ${E2E_PORT}`,
    env: { APP_ORIGIN: E2E_BASE_URL },
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
