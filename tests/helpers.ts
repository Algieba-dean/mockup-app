import type { Page } from '@playwright/test';
import path from 'path';

/**
 * Uploads the shared example screenshot into the Screenshots tool's asset
 * dock via the LeftSidebar's hidden file input, and binds it to device 1.
 */
export async function uploadSampleScreenshot(page: Page, fileName = 'example/09_multi_languages.png') {
  const fileInput = page.locator('aside.sidebar input[type="file"]').first();
  await fileInput.setInputFiles(path.join(process.cwd(), fileName));
}

/** Opens the multi-size export modal (Screenshots tool). */
export async function openExportModal(page: Page) {
  await page.locator('button:has-text("导出 ZIP")').click();
}
