import { test, expect } from '@playwright/test';

test.describe('MockupApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Open the home page and clear localStorage to ensure test isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should load page with correct title and elements', async ({ page }) => {
    // 1. Verify page title
    await expect(page).toHaveTitle('MockupApp');

    // 2. Verify header buttons
    const exportBtn = page.locator('button:has-text("导出 ZIP")');
    await expect(exportBtn).toBeVisible();

    // 3. Verify sidebar section titles
    await expect(page.locator('.sidebar-title:has-text("截图素材")')).toBeVisible();
    await expect(page.locator('.sidebar-title:has-text("画布背景")')).toBeVisible();
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

  test('should support saving, applying and deleting custom design presets', async ({ page }) => {
    // 1. Enter custom title
    const titleInput = page.locator('input[placeholder="请输入主标题"]');
    await titleInput.fill('Preset Title Test');

    // 2. Click Save Preset button, opens custom name-input modal
    const savePresetBtn = page.locator('button:has-text("保存当前风格为预设")');
    await expect(savePresetBtn).toBeVisible();
    await savePresetBtn.click();

    const presetNameInput = page.locator('#preset-name-input');
    await expect(presetNameInput).toBeVisible();
    await presetNameInput.fill('E2E Custom Preset');
    await page.locator('button:has-text("保存预设")').click();

    // 3. Check if preset card appears
    const presetCard = page.locator('.custom-preset-card:has-text("E2E Custom Preset")');
    await expect(presetCard).toBeVisible();

    // 4. Modify title input text
    await titleInput.fill('Different Title');
    await expect(titleInput).toHaveValue('Different Title');

    // 5. Click the custom preset card to load settings back
    await presetCard.click();
    await expect(titleInput).toHaveValue('Preset Title Test');

    // 6. Delete the preset, opens custom confirmation modal
    const deleteBtn = presetCard.locator('button[title="删除预设"]');
    await deleteBtn.click();
    await page.locator('button:has-text("确定删除")').click();

    // 7. Verify preset is deleted
    await expect(presetCard).not.toBeVisible();
  });

  test('should support undo/redo via header buttons', async ({ page }) => {
    const titleInput = page.locator('input[placeholder="请输入主标题"]');
    const undoBtn = page.locator('button[aria-label="撤销"]');
    const redoBtn = page.locator('button[aria-label="重做"]');

    // 1. Initially no history to undo/redo
    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();

    // 2. Make a change
    const originalValue = await titleInput.inputValue();
    await titleInput.fill('Undo Test Title');
    await titleInput.blur();

    // 3. Undo should now be enabled
    await expect(undoBtn).toBeEnabled();
    await undoBtn.click();
    await expect(titleInput).toHaveValue(originalValue);

    // 4. Redo should now be enabled
    await expect(redoBtn).toBeEnabled();
    await redoBtn.click();
    await expect(titleInput).toHaveValue('Undo Test Title');
  });

  test('should generate and export app icons in the Icon Generator workspace', async ({ page }) => {
    // 1. Switch to the Icons tool
    await page.locator('button:has-text("图标生成")').click();

    // Debug inputs
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(el => ({
        type: el.type,
        id: el.id,
        className: el.className,
        outerHTML: el.outerHTML
      }));
    });
    console.log('INPUTS FOUND:', inputs);

    // 2. Upload an icon source image via the left sidebar
    const fileInput = page.locator('aside.sidebar input[type="file"]').first();
    await fileInput.setInputFiles('example/09_multi_languages.png');

    // 3. Warning banner should appear (source image is not square/1024px)
    await expect(page.locator('text=建议原图 ≥1024×1024 正方形')).toBeVisible();

    // 4. Platform toggle switches the safe-zone/mask preview
    const androidTab = page.locator('button[role="tab"]:has-text("Android")');
    await androidTab.click();
    await expect(androidTab).toHaveAttribute('aria-selected', 'true');

    // 5. Padding slider is available in the right panel
    const paddingSlider = page.locator('#icon-padding');
    await expect(paddingSlider).toBeVisible();

    // 6. Trigger export and verify ZIP download
    await page.locator('button:has-text("导出 ZIP")').click();
    const modalTitle = page.locator('h3:has-text("导出应用图标包")');
    await expect(modalTitle).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("生成并下载")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('mockup_app_icons.zip');

    // 7. Verify integration guidance is shown on export completion and can be dismissed
    await expect(page.locator('h3:has-text("图标包导出成功")')).toBeVisible();
    await page.locator('button:has-text("关闭指引")').click();
    await expect(page.locator('h3:has-text("图标包导出成功")')).not.toBeVisible();
  });

  test('should support drag-and-zoom positioning, gradient backgrounds, history CRUD, and SVG export in Icon Generator', async ({ page }) => {
    // 1. Switch to Icons tool and upload
    await page.locator('button:has-text("图标生成")').click();
    const fileInput = page.locator('aside.sidebar input[type="file"]').first();
    await fileInput.setInputFiles('example/09_multi_languages.png');

    // 2. Test Canvas Drag interaction
    const canvas = page.locator('canvas').nth(1);
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 + 20);
      await page.mouse.up();
    }

    // Test Canvas Zoom (wheel)
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -100);
    }

    // Reset positioning
    await page.locator('button[aria-label="重置图像位置与缩放"]').click();

    // 3. Test background gradient mode
    await page.locator('button:has-text("135°渐变")').click();
    await expect(page.locator('text=渐变颜色设定')).toBeVisible();

    // 4. Test History saving and drawer list
    await page.locator('button:has-text("保存当前方案到历史")').click();
    
    // Toggle history drawer from header
    const historyBtn = page.locator('button[aria-label="查看历史方案"]');
    await expect(historyBtn).toBeVisible();
    await historyBtn.click();

    const drawerTitle = page.locator('h2:has-text("历史方案")');
    await expect(drawerTitle).toBeVisible();

    // Verify "当前" label exists
    await expect(page.locator('span:has-text("当前")')).toBeVisible();

    // Rename history scheme
    await page.locator('button[title="重命名"]').first().click();
    const renameInput = page.locator('input[value^="方案"]');
    await renameInput.fill('E2E Icon Plan');
    await page.keyboard.press('Enter');
    await expect(page.locator('span:has-text("E2E Icon Plan")')).toBeVisible();

    // Close drawer via Escape
    await page.keyboard.press('Escape');
    await expect(drawerTitle).not.toBeVisible();

    // 5. Test SVG optional export
    await page.locator('button:has-text("导出 ZIP")').click();
    const svgCheckbox = page.locator('label:has-text("附带 SVG 容器版") input[type="checkbox"]');
    await expect(svgCheckbox).toBeVisible();
    await svgCheckbox.check();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("生成并下载")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('mockup_app_icons.zip');
    
    // Close integration guides
    await page.locator('button:has-text("关闭指引")').click();
  });

  test('should walk through the Privacy Policy wizard and generate a document', async ({ page }) => {
    // 1. Switch to the Privacy & Terms tool
    await page.locator('button:has-text("隐私与条款")').click();
    await expect(page.locator('.legal-workspace')).toBeVisible();

    // 2. Step 1: "下一步" stays disabled until required fields are valid
    const nextBtn = page.locator('.legal-workspace button:has-text("下一步")').first();
    await expect(nextBtn).toBeDisabled();

    await page.locator('input[placeholder="例如 MockupApp"]').fill('Test App');
    await page.locator('input[placeholder="例如 John Doe"]').fill('John Test');
    await page.locator('input[placeholder="support@example.com"]').fill('dev@example.com');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // 3. Step 2: select a couple of data types, then continue
    await page.locator('.legal-checkbox-row:has-text("Email address")').click();
    await page.locator('.legal-checkbox-row:has-text("Usage and log data")').click();
    await page.locator('.legal-workspace button:has-text("下一步")').click();

    // 4. Step 3: select a third-party service
    await page.locator('.legal-checkbox-row:has-text("Google Analytics (GA4)")').click();
    await page.locator('.legal-workspace button:has-text("下一步")').click();

    // 5. Step 4: enable GDPR, then generate
    await page.locator('.legal-checkbox-row:has-text("适用 GDPR")').click();
    await page.locator('.legal-workspace button:has-text("生成")').click();

    // 6. Result screen renders the generated document with expected sections
    await expect(page.locator('h2:has-text("Privacy Policy")')).toBeVisible();
    await expect(page.locator('h3:has-text("Third-Party Services")')).toBeVisible();
    await expect(page.locator('h3:has-text("Your GDPR Data Protection Rights")')).toBeVisible();
    await expect(page.locator('h3:has-text("Log Data")')).toBeVisible();
    await expect(page.locator('h3:has-text("International Data Transfers")')).toBeVisible();
    await expect(page.locator('h3:has-text("Account and Data Deletion")')).toBeVisible();

    // 7. Download HTML triggers a file download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("下载 HTML")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('privacy-policy.html');

    // 8. Switching to Terms of Use keeps its own independent, untouched step state
    await page.locator('button[role="tab"]:has-text("使用条款")').click();
    await expect(page.locator('input[placeholder="例如 MockupApp"]')).toHaveValue('');

    // 9. Switching back to Privacy Policy preserves the generated result (per-mode state)
    await page.locator('button[role="tab"]:has-text("隐私政策")').click();
    await expect(page.locator('h2:has-text("Privacy Policy")')).toBeVisible();
  });
});
