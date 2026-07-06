import { test, expect } from '@playwright/test';

test.describe('MockupApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Open the home page
    await page.goto('/');
  });

  test('should load page with correct title and elements', async ({ page }) => {
    // 1. Verify page title
    await expect(page).toHaveTitle('MockupApp');

    // 2. Verify header buttons
    const exportBtn = page.locator('button:has-text("导出 ZIP")');
    await expect(exportBtn).toBeVisible();

    // 3. Verify sidebar section titles
    await expect(page.locator('text=排版模版')).toBeVisible();
    await expect(page.locator('text=画布背景')).toBeVisible();
  });

  test('should toggle sidebar collapse correctly', async ({ page }) => {
    // 1. Target sidebars and check initial state
    const leftSidebar = page.locator('aside.sidebar').first();
    const rightSidebar = page.locator('aside.sidebar').last();

    await expect(leftSidebar).not.toHaveClass(/collapsed/);
    await expect(rightSidebar).not.toHaveClass(/collapsed/);

    // 2. Collapse left sidebar
    await page.locator('button[title="折叠左边栏"]').click();
    await expect(leftSidebar).toHaveClass(/collapsed/);

    // 3. Collapse right sidebar
    await page.locator('button[title="折叠右边栏"]').click();
    await expect(rightSidebar).toHaveClass(/collapsed/);

    // 4. Restore sidebars
    await page.locator('button[title="展开左边栏"]').click();
    await page.locator('button[title="展开右边栏"]').click();
    await expect(leftSidebar).not.toHaveClass(/collapsed/);
    await expect(rightSidebar).not.toHaveClass(/collapsed/);
  });

  test('should support title text editing', async ({ page }) => {
    const titleInput = page.locator('input[placeholder="请输入主标题"]');
    await expect(titleInput).toBeVisible();

    // Clear and type new text
    await titleInput.fill('');
    await titleInput.fill('E2E Dynamic Title');

    // Check if the input value has synced
    await expect(titleInput).toHaveValue('E2E Dynamic Title');
  });

  test('should apply preset layout and manage multiple devices', async ({ page }) => {
    // 1. Select Double Bezel Preset Layout
    const doubleBtn = page.locator('button:has-text("双机左右")');
    await expect(doubleBtn).toBeVisible();
    await doubleBtn.click();

    // 2. Check if two device tabs are created in properties panel
    await expect(page.locator('button:has-text("设备 1")')).toBeVisible();
    await expect(page.locator('button:has-text("设备 2")')).toBeVisible();

    // 3. Add a third device
    const addDeviceBtn = page.locator('button:has-text("+ 新增")');
    await addDeviceBtn.click();
    await expect(page.locator('button:has-text("设备 3")')).toBeVisible();

    // 4. Delete the added device
    await page.locator('button:has-text("删除当前选中的设备")').click();
    await expect(page.locator('button:has-text("设备 3")')).not.toBeVisible();
  });

  test('should trigger multi-size export modal and generate ZIP download', async ({ page }) => {
    // 1. Trigger export config modal
    const exportBtn = page.locator('button:has-text("导出 ZIP")');
    await exportBtn.click();

    const modalTitle = page.locator('h3:has-text("一键多尺寸商店图打包")');
    await expect(modalTitle).toBeVisible();

    // 2. Click start download and intercept the download event
    const startExportBtn = page.locator('button:has-text("开始生成并打包")');
    await expect(startExportBtn).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      startExportBtn.click(),
    ]);

    // 3. Verify the file downloaded correctly
    expect(download.suggestedFilename()).toBe('mockup_app_screenshots.zip');
  });
});
