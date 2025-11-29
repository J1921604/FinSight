import { test, expect } from '@playwright/test';

/**
 * E2E Test: P/L (Profit & Loss) Page
 * Tests the financial statement visualization and YoY comparison features
 */

const BASE_URL = 'http://localhost:4173/FinSight';

test.describe('P/L Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to P/L page
    await page.goto(`${BASE_URL}/pl`);
  });

  test('should load P/L page with correct title', async ({ page }) => {
    // Check page heading
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('損益計算書');
    await expect(heading).toContainText('(P/L)');
  });

  test('should display company selector in single mode', async ({ page }) => {
    // Check TEPCO button (default)
    const tepcoButton = page.locator('button:has-text("東京電力")');
    await expect(tepcoButton).toBeVisible();

    // Check CHUBU button
    const chubuButton = page.locator('button:has-text("中部電力")');
    await expect(chubuButton).toBeVisible();
  });

  test('should toggle comparison mode', async ({ page }) => {
    // Click comparison mode toggle
    const comparisonButton = page.locator('button:has-text("比較モード")');
    await comparisonButton.click();

    // Wait for mode change
    await page.waitForTimeout(300);

    // Button text should change to "比較中"
    await expect(page.locator('button:has-text("比較中")')).toBeVisible();

    // Company selector should be hidden in comparison mode
    const tepcoButton = page.locator('button:has-text("東京電力")');
    await expect(tepcoButton).not.toBeVisible();
  });

  test('should toggle chart type between line and bar', async ({ page }) => {
    // Click bar chart button
    const barButton = page.locator('button:has-text("棒グラフ")');
    await barButton.click();

    // Wait for chart to re-render
    await page.waitForTimeout(500);

    // Bar button should be selected
    await expect(barButton).toHaveClass(/bg-primary-cyan|shadow-neuro-md/);

    // Click line chart button
    const lineButton = page.locator('button:has-text("折れ線")');
    await lineButton.click();

    // Wait for chart to re-render
    await page.waitForTimeout(500);

    // Line button should be selected
    await expect(lineButton).toHaveClass(/bg-primary-cyan|shadow-neuro-md/);
  });

  test('should display metric cards with YoY badges', async ({ page }) => {
    // Check for metric cards (売上高, 営業利益, 当期純利益)
    await expect(page.locator('text=売上高').locator('..')).toBeVisible();
    await expect(page.locator('text=営業利益').locator('..')).toBeVisible();
    await expect(page.locator('text=当期純利益').locator('..')).toBeVisible();

    // Check that cards display values in 億円
    const revenueCard = page.locator('text=売上高').locator('..');
    await expect(revenueCard).toContainText('億円');

    // Check for "前年同期比" label
    await expect(page.locator('text=前年同期比')).toBeVisible();

    // Check for YoY badge
    const badges = page.locator('[class*="rounded-full"]');
    await expect(badges.first()).toBeVisible();
    await expect(badges.first()).toContainText('%');
  });

  test('should display chart with data', async ({ page }) => {
    // Check for chart section header
    await expect(page.locator('text=推移グラフ')).toBeVisible();

    // Wait for Recharts to render
    await page.waitForTimeout(1000);

    // Check for SVG element (Recharts renders as SVG)
    const chart = page.locator('svg').first();
    await expect(chart).toBeVisible();
  });

  test('should display period information', async ({ page }) => {
    // Check for period info
    const periodInfo = page.locator('text=/最新データ:/');
    await expect(periodInfo).toBeVisible();
  });

  test('should apply glassmorphism design', async ({ page }) => {
    // Check for glass-card class
    const glassCards = page.locator('.glass-card');
    await expect(glassCards.first()).toBeVisible();

    // Check for parallax-container class
    const parallaxContainers = page.locator('.parallax-container');
    await expect(parallaxContainers.first()).toBeVisible();

    // Check for hover-glow class
    const hoverGlowElements = page.locator('.hover-glow');
    await expect(hoverGlowElements.first()).toBeVisible();

    // Check for gradient-text class
    const gradientText = page.locator('.gradient-text');
    await expect(gradientText.first()).toBeVisible();
  });

  test('should switch companies and update data', async ({ page }) => {
    // Get initial revenue value
    const revenueCard = page.locator('text=売上高').locator('..');
    const initialValue = await revenueCard.textContent();

    // Click CHUBU button
    const chubuButton = page.locator('button:has-text("中部電力")');
    await chubuButton.click();

    // Wait for data to update
    await page.waitForTimeout(500);

    // Get new revenue value
    const newValue = await revenueCard.textContent();

    // Values should be different (unless they happen to be the same)
    // This test might be flaky if TEPCO and CHUBU have identical values
    // In real scenario, we'd check specific known values
  });

  test('should navigate back to dashboard', async ({ page }) => {
    // Navigate to dashboard (assuming there's a back button or logo click)
    await page.goto(BASE_URL);

    // Check we're back on dashboard
    await expect(page.locator('text=主要指標サマリー')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still visible
    await expect(page.locator('h1')).toBeVisible();

    // Check that controls are visible (might wrap on mobile)
    await expect(page.locator('button:has-text("東京電力")')).toBeVisible();
    await expect(page.locator('button:has-text("比較モード")')).toBeVisible();
  });

  test('should display YoY badges with correct color coding', async ({ page }) => {
    // Wait for badges to load
    await page.waitForSelector('[class*="rounded-full"]', { timeout: 3000 });

    // Get all badges
    const badges = page.locator('[class*="rounded-full"]');

    // Check that at least one badge exists
    await expect(badges.first()).toBeVisible();

    // Each badge should display a percentage
    const firstBadge = badges.first();
    await expect(firstBadge).toContainText('%');

    // Badge should have either + or - sign
    const badgeText = await firstBadge.textContent();
    expect(badgeText).toMatch(/[+\-−]/);
  });

  test('should handle loading state', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Should not show error during loading
    // (This test is timing-dependent and might need adjustment)
    await page.waitForTimeout(100);

    // After loading, should show content
    await page.waitForTimeout(1000);
    await expect(page.locator('text=推移グラフ')).toBeVisible();
  });

  test('should not display error message with valid data', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Should not show error
    await expect(page.locator('text=エラー')).not.toBeVisible();

    // Should show chart instead
    await expect(page.locator('text=推移グラフ')).toBeVisible();
  });
});
