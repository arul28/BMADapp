import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { config as loadEnv } from 'dotenv';

// Load environment variables from .env if present
loadEnv({ path: path.resolve(__dirname, '.env') });

type EnvConfig = {
  baseURL: string;
  apiUrl: string;
};

const envConfigMap: Record<string, EnvConfig> = {
  local: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    apiUrl: process.env.API_URL ?? 'http://localhost:3001/api',
  },
  staging: {
    baseURL: process.env.BASE_URL ?? 'https://staging.example.com',
    apiUrl: process.env.API_URL ?? 'https://staging.example.com/api',
  },
  production: {
    baseURL: process.env.BASE_URL ?? 'https://example.com',
    apiUrl: process.env.API_URL ?? 'https://example.com/api',
  },
};

const environment = (process.env.TEST_ENV ?? 'local').toLowerCase();
const envConfig = envConfigMap[environment];

if (!envConfig) {
  const supportedEnvs = Object.keys(envConfigMap).join(', ');
  throw new Error(`Unsupported TEST_ENV "${environment}". Supported: ${supportedEnvs}.`);
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test-results-html', open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: envConfig.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    extraHTTPHeaders: {
      'x-test-env': environment,
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  outputDir: 'test-results',
  metadata: {
    environment,
  },
});
