import { test, expect } from '@playwright/test';
import fs from 'fs';
import JSZip from 'jszip';

test.describe('MockupApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    // Open the home page and clear localStorage to ensure test isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/');
  });

  test('should load page with correct title and elements', async ({ page }) => {
    // 1. Verify page title
    await expect(page).toHaveTitle('极简造物');

    // 2. Verify header buttons
    const exportBtn = page.locator('button:has-text("导出压缩包")');
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
    await doubleBtn.click({ force: true });

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
    const exportBtn = page.locator('button:has-text("导出压缩包")');
    await exportBtn.click();

    const modalTitle = page.locator('h3:has-text("一键多尺寸商店图打包")');
    await expect(modalTitle).toBeVisible();

    // 2. Click start download and intercept the download event
    const startExportBtn = page.locator('button:has-text("开始生成并打包")');
    await expect(startExportBtn).toBeVisible();

    const downloadPromise = page.waitForEvent('download', { timeout: 25000 });
    await startExportBtn.click();
    const download = await downloadPromise;

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

    // 2. Upload an icon source image via the left sidebar
    const fileInput = page.locator('aside.sidebar input[type="file"]').first();
    await fileInput.setInputFiles('example/09_multi_languages.png');

    // 3. Warning banner should appear (source image is not square/1024px)
    await expect(page.locator('text=建议原图 ≥1024×1024 正方形')).toBeVisible();

    // 4. Platform toggle switches the safe-zone/mask preview
    const androidTab = page.locator('button[role="tab"]:has-text("安卓平台")');
    await androidTab.click();
    await expect(androidTab).toHaveAttribute('aria-selected', 'true');

    // 5. Padding slider is available in the right panel
    const paddingSlider = page.locator('#icon-padding');
    await expect(paddingSlider).toBeVisible();

    // 6. Trigger export and verify ZIP download
    await page.locator('button:has-text("导出压缩包")').click();
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

  test('should support independent horizontal/vertical icon padding and export a correctly-mapped iOS Contents.json', async ({ page }) => {
    // 1. Switch to Icons tool and upload
    await page.locator('button:has-text("图标生成")').click();
    const fileInput = page.locator('aside.sidebar input[type="file"]').first();
    await fileInput.setInputFiles('example/09_multi_languages.png');

    // 2. Horizontal and vertical padding sliders are independently adjustable
    const paddingXSlider = page.locator('#icon-padding');
    const paddingYSlider = page.locator('#icon-padding-y');
    await expect(paddingXSlider).toBeVisible();
    await expect(paddingYSlider).toBeVisible();

    await paddingXSlider.fill('5');
    await paddingYSlider.fill('30');
    await expect(paddingXSlider).toHaveValue('5');
    await expect(paddingYSlider).toHaveValue('30');

    // 3. Export both platforms and verify the ZIP's iOS Contents.json mapping
    await page.locator('button:has-text("导出压缩包")').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("生成并下载")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('mockup_app_icons.zip');

    const zipPath = await download.path();
    expect(zipPath).toBeTruthy();

    const fs = await import('fs');
    const JSZip = (await import('jszip')).default;
    const zipBuffer = fs.readFileSync(zipPath!);
    const zip = await JSZip.loadAsync(zipBuffer);

    const contentsFile = zip.file('ios/AppIcon.appiconset/Contents.json');
    expect(contentsFile).toBeTruthy();
    const contentsJson = JSON.parse(await contentsFile!.async('string'));

    expect(Array.isArray(contentsJson.images)).toBe(true);
    expect(contentsJson.images.length).toBeGreaterThan(0);

    // Every manifest entry must correspond to an actual PNG file in the same folder
    for (const entry of contentsJson.images) {
      expect(entry.filename).toBeTruthy();
      expect(entry.idiom).toBeTruthy();
      expect(entry.size).toMatch(/^[\d.]+x[\d.]+$/);
      expect(entry.scale).toMatch(/^\dx$/);
      const pngFile = zip.file(`ios/AppIcon.appiconset/${entry.filename}`);
      expect(pngFile, `Contents.json references missing file: ${entry.filename}`).toBeTruthy();
    }

    // Every rendered PNG in the appiconset folder must be referenced by the manifest
    const manifestFilenames = new Set(contentsJson.images.map((e: { filename: string }) => e.filename));
    const pngFilesInFolder = Object.keys(zip.files).filter(
      (name) => name.startsWith('ios/AppIcon.appiconset/') && name.endsWith('.png')
    );
    expect(pngFilesInFolder.length).toBe(manifestFilenames.size);
  });

  test('should preview multiple Android OEM mask shapes without altering the exported pixels', async ({ page }) => {
    // 1. Switch to Icons tool, upload, and switch to Android platform preview
    await page.locator('button:has-text("图标生成")').click();
    const fileInput = page.locator('aside.sidebar input[type="file"]').first();
    await fileInput.setInputFiles('example/09_multi_languages.png');
    await page.locator('button[role="tab"]:has-text("安卓平台")').click();

    // 2. The mask shape selector should offer 4 real OEM-referenced shapes
    const shapeTabs = page.locator('div[role="tablist"][aria-label="安卓厂商遮罩形状预览"] button[role="tab"]');
    await expect(shapeTabs).toHaveCount(4);

    // 3. Default shape is the official safe-zone circle
    await expect(shapeTabs.first()).toHaveAttribute('aria-selected', 'true');

    // 4. Switching shapes updates the selected tab without touching the underlying canvas
    const squircleTab = page.locator('button[role="tab"]:has-text("圆润方形")');
    await squircleTab.click();
    await expect(squircleTab).toHaveAttribute('aria-selected', 'true');
    await expect(shapeTabs.first()).toHaveAttribute('aria-selected', 'false');

    // 5. Export still succeeds — the mask preview is a non-destructive overlay only
    await page.locator('button:has-text("导出压缩包")').click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('button:has-text("生成并下载")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('mockup_app_icons.zip');
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

    // 4. Test History saving via custom naming modal and drawer list
    await page.locator('button:has-text("保存当前方案到历史")').click();
    const historyNameInput = page.locator('#icon-history-name-input');
    await expect(historyNameInput).toBeVisible();
    await historyNameInput.fill('测试方案一');
    await page.locator('button:has-text("保存方案")').click();
    
    // Toggle history drawer from header
    const historyBtn = page.locator('button[aria-label="查看历史方案"]');
    await expect(historyBtn).toBeVisible();
    await historyBtn.click();

    const drawerTitle = page.locator('h2:has-text("历史方案")');
    await expect(drawerTitle).toBeVisible();

    // Verify "当前" label exists
    await expect(page.locator('span:text-is("当前")')).toBeVisible();

    // Rename history scheme
    await page.locator('button[title="重命名"]').first().click();
    const renameInput = page.locator('input[value="测试方案一"]');
    await renameInput.fill('测试图标方案');
    await page.keyboard.press('Enter');
    await expect(page.locator('span:has-text("测试图标方案")')).toBeVisible();

    // Close drawer via clicking the Close button
    await page.locator('button[title="关闭抽屉"]').click();
    await expect(drawerTitle).not.toBeVisible();

    // 5. Test SVG optional export
    await page.locator('button:has-text("导出压缩包")').click();
    const svgCheckbox = page.locator('label:has-text("附带矢量容器版") input[type="checkbox"]');
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

  test('should walk through the Compliance Toolkit privacy policy questionnaire and generate a document', async ({ page }) => {
    // 1. Switch to the Privacy & Terms tool
    await page.locator('button:has-text("隐私与条款")').click();
    await expect(page.locator('.compliance-toolkit')).toBeVisible();

    // 2. Privacy policy is checked by default; fill questionnaire fields
    await expect(page.locator('.compliance-checklist-row').first().locator('input[type="checkbox"]')).toBeChecked();

    await page.locator('input[placeholder="例如 极简造物"]').fill('测试应用');
    await page.locator('input[placeholder="例如 张三"]').fill('张测试');
    await page.locator('input[placeholder="例如 support@example.com"]').fill('dev@example.com');

    // 3. Select data types and third-party services
    await page.locator('.legal-checkbox-row:has-text("电子邮箱地址")').click();
    await page.locator('.legal-checkbox-row:has-text("使用行为与诊断日志数据")').click();
    await page.locator('.legal-checkbox-row:has-text("谷歌分析第四代服务")').click();
    await page.locator('.legal-checkbox-row:has-text("适用欧盟通用数据保护条例")').click();

    // 4. Live preview renders the generated document with expected sections
    await expect(page.locator('.compliance-output-title:has-text("隐私政策")')).toBeVisible();
    await expect(page.locator('h4:has-text("第三方服务与开发工具包")')).toBeVisible();
    await expect(page.locator('h4:has-text("欧盟与英国用户的数据保护权利")')).toBeVisible();
    await expect(page.locator('h4:has-text("日志与诊断数据")')).toBeVisible();
    await expect(page.locator('h4:has-text("跨境数据传输说明")')).toBeVisible();

    // 5. Download HTML triggers a file download
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('.compliance-output-section:has-text("隐私政策") button:has-text("下载网页文件")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('privacy-policy.html');
  });

  test('Compliance Toolkit hides questionnaire when all checklist items are unchecked', async ({ page }) => {
    await page.locator('button:has-text("隐私与条款")').click();
    await expect(page.locator('.compliance-toolkit')).toBeVisible();

    const checkboxes = page.locator('.compliance-checklist-header input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(7);

    // Uncheck default privacy policy item -> questionnaire hides
    await page.locator('.compliance-checklist-row').first().locator('input[type="checkbox"]').uncheck();
    await expect(page.locator('.compliance-questionnaire')).not.toBeVisible();

    // Checking a row reveals the shared questionnaire and output section
    await page.locator('.compliance-checklist-row:has-text("账号与数据注销独立页") input[type="checkbox"]').check();
    await expect(page.locator('.compliance-questionnaire')).toBeVisible();
    await expect(page.locator('.compliance-output-section:has-text("账号与数据注销独立页") button:has-text("下载网页文件")')).toBeVisible();
  });

  test('Compliance Toolkit reuses shared questionnaire data for ATT, Nutrition Label, and Custom EULA', async ({ page }) => {
    await page.locator('button:has-text("隐私与条款")').click();
    await page.locator('input[placeholder="例如 极简造物"]').fill('测试应用');
    await page.locator('input[placeholder="例如 张三"]').fill('张测试');
    await page.locator('input[placeholder="例如 support@example.com"]').fill('dev@example.com');

    await page.locator('.legal-checkbox-row:has-text("设备标识符与广告标识")').click();
    await page.locator('.legal-checkbox-row:has-text("谷歌移动广告联盟")').click();

    // 1. ATT row: applicable because device_id + AdMob were selected
    await page.locator('.compliance-checklist-row:has-text("追踪授权与系统权限话术矩阵") input[type="checkbox"]').check();
    await expect(page.locator('.compliance-output-section:has-text("个性化广告体验")')).toBeVisible();

    // 2. Nutrition Label row: the selected data type is classified as "tracking" because an ad SDK is present
    await page.locator('.compliance-checklist-row:has-text("隐私营养标签填表对照表") input[type="checkbox"]').check();
    await expect(page.locator('.compliance-output-section:has-text("用于追踪您的数据")')).toBeVisible();

    // 3. Custom EULA row: default high-risk type is "无特殊高风险属性", switching to UGC injects the zero-tolerance clause
    await page.locator('.compliance-checklist-row:has-text("自定义最终用户许可协议") input[type="checkbox"]').check();
    await expect(page.locator('.compliance-output-section:has-text("不良内容零容忍与社区治理政策")')).not.toBeVisible();
    await page.locator('.compliance-fieldset label:has-text("用户生成内容与社区类")').click();
    await expect(page.locator('.compliance-output-section:has-text("不良内容零容忍与社区治理政策")')).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.locator('.compliance-output-section:has-text("自定义最终用户许可协议") button:has-text("下载网页文件")').click(),
    ]);
    expect(download.suggestedFilename()).toBe('custom-eula.html');
  });

  test('Compliance Toolkit shows a bundled ZIP download only once 2+ rows are checked, and persists state on reload', async ({ page }) => {
    await page.locator('button:has-text("隐私与条款")').click();
    // Uncheck default privacy policy first so 0 rows are checked
    await page.locator('.compliance-checklist-row').first().locator('input[type="checkbox"]').uncheck();

    const zipButton = page.locator('button:has-text("打包下载压缩包")');
    await expect(zipButton).not.toBeVisible();

    await page.locator('.compliance-checklist-row:has-text("自定义最终用户许可协议") input[type="checkbox"]').check();
    await page.locator('input[placeholder="例如 极简造物"]').fill('测试应用');
    await page.locator('input[placeholder="例如 张三"]').fill('张测试');
    await page.locator('input[placeholder="例如 support@example.com"]').fill('dev@example.com');
    await expect(zipButton).not.toBeVisible();

    await page.locator('.compliance-checklist-row:has-text("账号与数据注销独立页") input[type="checkbox"]').check();
    await expect(zipButton).toBeVisible();
    await expect(zipButton).toContainText('已选 2 项');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      zipButton.click(),
    ]);
    expect(download.suggestedFilename()).toBe('compliance-toolkit.zip');

    // Verify the ZIP actually bundles both checked rows' files
    const zipPath = await download.path();
    expect(zipPath).toBeTruthy();
    const zip = await JSZip.loadAsync(fs.readFileSync(zipPath!));
    expect(Object.keys(zip.files)).toEqual(expect.arrayContaining(['custom-eula.html', 'account-deletion.html']));

    // Give the 300ms debounced localStorage write time to settle before reloading
    await page.waitForTimeout(500);

    // Reload restores the same checked rows
    await page.reload();
    await page.locator('button:has-text("隐私与条款")').click();
    await expect(page.locator('.compliance-checklist-row:has-text("自定义最终用户许可协议") input[type="checkbox"]')).toBeChecked();
    await expect(page.locator('.compliance-checklist-row:has-text("账号与数据注销独立页") input[type="checkbox"]')).toBeChecked();
  });

  test('should not crash when undoing page addition while on the newly added page', async ({ page }) => {
    // Initially 2 pages (P1, P2); add P3 -> activePageIndex becomes 2
    await page.locator('button:has-text("添加画幅")').click();
    const titleInput = page.locator('input[placeholder="请输入主标题"]');
    await expect(titleInput).toHaveValue('全新核心功能展示');

    // Undo the page addition -> pages length goes back to 2, activePageIndex must safely clamp to 1 without crashing
    await page.locator('button[aria-label="撤销"]').click();
    await expect(titleInput).toHaveValue('数据安全尽在掌握');
  });
});
