## Why

`/impeccable audit` 对 `icon-generator` 工作区的评分为 14/20（Good），发现 1 个 P1、3 个 P2、1 个 P3 问题：文字对比度不达标（WCAG AA 违规）、上传原图无尺寸上限导致 localStorage 静默写入失败风险、`React.memo` 被破坏、移动端触控目标/响应式处理缺失、装饰性图标缺少 `aria-hidden`。这些问题在功能可用的前提下降低了生产质量，应在归档前修复。

## What Changes

- **[P1] 对比度修复**：将 `icon-generator` 工作区内所有正文/说明文字从 `--ink-tertiary` 改为 `--ink-secondary`（新增 4 处 + 沿用的既有 1 处 `CanvasViewport.tsx` 截图空状态提示文案），确保 ≥4.5:1 对比度。图标着色（非文字）用途保留 `--ink-tertiary` 不变。
- **[P2] 性能修复**：`iconManager.ts` 的 `cropImageToSquare` 增加最大边长上限（1024px），避免大图上传后整张高分辨率 PNG base64 被写入 localStorage 造成静默配额溢出；`App.tsx` 中的 `iconWarning` 派生对象改用 `useMemo`，恢复 `CanvasViewport` 的 `React.memo` 有效性。
- **[P2] 响应式修复**：为分段控件（iOS/Android 切换按钮）等文字类 `.ds-btn` 在移动端断点下补齐 44×44px 最小触控目标；警告横幅改为可换行/自适应宽度，避免窄屏被裁切。
- **[P3] 无障碍细节**：为警告横幅中的装饰性 `AlertTriangle` 图标添加 `aria-hidden="true"`。
- **收尾**：`npm run build` + `npx tsc --noEmit` 验证，作为 `/impeccable polish` 收尾检查。

## Capabilities

### Modified Capabilities
- `icon-generator`：补充非阻断校验、平台预览、自定义控制相关的无障碍与响应式验收标准。

## Impact

- 修改文件：`src/components/CanvasViewport.tsx`、`src/components/LeftSidebar.tsx`、`src/components/RightPropertiesPanel.tsx`、`src/utils/iconManager.ts`、`src/App.tsx`、`src/index.css`。
- 无新增依赖，无破坏性变更；`iconManager.ts` 的裁剪输出分辨率上限化，导出图标质量在 ≤1024px 主图源下不受影响（所有目标尺寸均 ≤1024px）。
