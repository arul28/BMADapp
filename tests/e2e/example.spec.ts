import { test, expect } from '../support/fixtures';

test.describe('Example Test Suite', () => {
  test('home responds (network-first)', async ({ page }) => {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      test.skip(true, 'Set BASE_URL to run network homepage check');
      return;
    }

    const navigationResponse = page.waitForResponse(
      (response) => response.url().startsWith(baseUrl) && response.status() < 500,
    );

    await page.goto(baseUrl);
    const response = await navigationResponse;

    expect(response.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/?/);
  });

  test('creates user via factory (skips when API_URL is not set)', async ({ userFactory }) => {
    test.skip(!process.env.API_URL, 'Set API_URL to run factory-backed tests');

    const user = await userFactory.createUser();

    expect(user.email).toBeTruthy();
    expect(user.name).toBeTruthy();
  });
});
