import { test, expect } from '@playwright/test';

/**
 * E2E Test: Dashboard Page
 * Tests the main dashboard functionality with real data
 */

const BASE_URL = 'http://localhost:4173/FinSight';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto(BASE_URL);
  });

  test('should load dashboard with correct title', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/FinSight/);

    // Check main heading with gradient text
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('FinSight');
  });

  test('should display company selector with default selection', async ({ page }) => {
    // Check company selector exists
    const companySelector = page.locator('text=企業選択:').locator('..');
    await expect(companySelector).toBeVisible();

    // Check TEPCO button (default selected)
    const tepcoButton = page.locator('button:has-text("東京電力")');
    await expect(tepcoButton).toBeVisible();
    await expect(tepcoButton).toHaveClass(/bg-primary-cyan|scale-105/);

    // Check CHUBU button
    const chubuButton = page.locator('button:has-text("中部電力")');
    await expect(chubuButton).toBeVisible();
  });

  test('should switch between companies', async ({ page }) => {
    // Click CHUBU button
    const chubuButton = page.locator('button:has-text("中部電力")');
    await chubuButton.click();

    // Wait for data to update
    await page.waitForTimeout(500);

    // Check CHUBU button is now selected
    await expect(chubuButton).toHaveClass(/bg-primary-magenta|scale-105/);

    // Click TEPCO button
    const tepcoButton = page.locator('button:has-text("東京電力")');
    await tepcoButton.click();

    // Wait for data to update
    await page.waitForTimeout(500);

    // Check TEPCO button is selected again
    await expect(tepcoButton).toHaveClass(/bg-primary-cyan|scale-105/);
  });

  test('should display key metrics summary', async ({ page }) => {
    // Check metrics section header
    await expect(page.locator('text=主要指標サマリー')).toBeVisible();

    // Check all 4 metric cards exist
    await expect(page.locator('text=売上高').locator('..')).toBeVisible();
    await expect(page.locator('text=当期純利益').locator('..')).toBeVisible();
    await expect(page.locator('text=総資産').locator('..')).toBeVisible();
    await expect(page.locator('text=営業CF').locator('..')).toBeVisible();

    // Check that metrics display values in 億円
    const revenueCard = page.locator('text=売上高').locator('..');
    await expect(revenueCard).toContainText('億円');
  });

  test('should display YoY badges with color coding', async ({ page }) => {
    // Wait for YoY badges to load
    await page.waitForSelector('[class*="rounded-full"]', { timeout: 3000 });

    // Check that at least one badge is present
    const badges = page.locator('[class*="rounded-full"]');
    await expect(badges.first()).toBeVisible();

    // Badges should show percentage values
    const firstBadge = badges.first();
    await expect(firstBadge).toContainText('%');
  });

  test('should display financial ratios section', async ({ page }) => {
    // Check ratios section header
    await expect(page.locator('text=財務比率')).toBeVisible();

    // Check all 3 ratio cards
    await expect(page.locator('text=自己資本比率').locator('..')).toBeVisible();
    await expect(page.locator('text=営業利益率').locator('..')).toBeVisible();
    await expect(page.locator('text=フリーCF').locator('..')).toBeVisible();

    // Check that ratios display percentage or values
    const equityRatioCard = page.locator('text=自己資本比率').locator('..');
    await expect(equityRatioCard).toContainText('%');
  });

  test('should display navigation cards to detail pages', async ({ page }) => {
    // Check navigation section header
    await expect(page.locator('text=詳細分析')).toBeVisible();

    // Check all 3 navigation cards
    const plCard = page.locator('text=損益計算書').locator('..');
    const bsCard = page.locator('text=貸借対照表').locator('..');
    const cfCard = page.locator('text=CF計算書').locator('..');

    await expect(plCard).toBeVisible();
    await expect(bsCard).toBeVisible();
    await expect(cfCard).toBeVisible();

    // Check that cards have "詳細を見る →" links
    await expect(plCard).toContainText('詳細を見る →');
    await expect(bsCard).toContainText('詳細を見る →');
    await expect(cfCard).toContainText('詳細を見る →');
  });

  test('should navigate to PL page when clicking PL card', async ({ page }) => {
    // Click on PL navigation card
    const plCard = page.locator('text=損益計算書').locator('..');
    await plCard.click();

    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/pl`);

    // Check we're on PL page
    await expect(page.locator('text=損益計算書 (P/L)')).toBeVisible();
  });

  test('should navigate to BS page when clicking BS card', async ({ page }) => {
    // Click on BS navigation card
    const bsCard = page.locator('text=貸借対照表').locator('..');
    await bsCard.click();

    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/bs`);

    // Check we're on BS page
    await expect(page.locator('text=貸借対照表 (B/S)')).toBeVisible();
  });

  test('should navigate to CF page when clicking CF card', async ({ page }) => {
    // Click on CF navigation card
    const cfCard = page.locator('text=CF計算書').locator('..');
    await cfCard.click();

    // Wait for navigation
    await page.waitForURL(`${BASE_URL}/cf`);

    // Check we're on CF page
    await expect(page.locator('text=キャッシュフロー計算書 (C/F)')).toBeVisible();
  });

  test('should display glassmorphism and animation effects', async ({ page }) => {
    // Check for glass-card class (glassmorphism)
    const glassCards = page.locator('.glass-card');
    await expect(glassCards.first()).toBeVisible();

    // Check for gradient-text class (animated gradient)
    const gradientText = page.locator('.gradient-text');
    await expect(gradientText.first()).toBeVisible();

    // Check for parallax-container class
    const parallaxContainers = page.locator('.parallax-container');
    await expect(parallaxContainers.first()).toBeVisible();

    // Check for hover-glow class
    const hoverGlowElements = page.locator('.hover-glow');
    await expect(hoverGlowElements.first()).toBeVisible();
  });

  test('should display period information', async ({ page }) => {
    // Check for period info at bottom
    const periodInfo = page.locator('text=/最終更新:|最新データ:/');
    await expect(periodInfo).toBeVisible();

    // Check for data source info
    await expect(page.locator('text=データソース: EDINET API (金融庁)')).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that page is still visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=企業選択:')).toBeVisible();

    // Check that metrics cards stack vertically (grid-cols-1 on mobile)
    const metricsGrid = page.locator('text=主要指標サマリー').locator('..').locator('div').nth(1);
    await expect(metricsGrid).toBeVisible();
  });

  test('should handle missing data gracefully', async ({ page }) => {
    // This test assumes that if data is missing, the app shows 0 or "-"
    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Page should not show error message if data loads successfully
    await expect(page.locator('text=エラー')).not.toBeVisible();

    // Or if data is truly missing, should show fallback values
    // This depends on implementation - adjust as needed
  });
});
