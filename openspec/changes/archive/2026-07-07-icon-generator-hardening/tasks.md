## 1. [P1] /impeccable harden — 对比度修复

- [x] 1.1 `CanvasViewport.tsx` 图标遮罩参考说明文案：`--ink-tertiary` → `--ink-secondary`
- [x] 1.2 `CanvasViewport.tsx` 图标空状态提示文案（新增 + 沿用截图空状态旧文案）：`--ink-tertiary` → `--ink-secondary`
- [x] 1.3 `LeftSidebar.tsx` 尺寸缩略图标签文字：`--ink-tertiary` → `--ink-secondary`
- [x] 1.4 `RightPropertiesPanel.tsx` 透明背景自动取色提示文案：`--ink-tertiary` → `--ink-secondary`

## 2. [P2] /impeccable optimize — 性能修复

- [x] 2.1 `iconManager.ts` 的 `cropImageToSquare` 增加最大边长上限（1024px），超出则等比缩小
- [x] 2.2 `App.tsx` 的 `iconWarning` 派生对象改用 `useMemo`，恢复 `CanvasViewport` 的 `React.memo` 有效性

## 3. [P2] /impeccable adapt — 响应式修复

- [x] 3.1 `index.css` 移动端断点内为 `.platform-tab-btn`（图标平台切换分段控件）补齐 44×44px 最小触控目标
- [x] 3.2 `CanvasViewport.tsx` 警告横幅改为响应式换行/自适应宽度（`width: min(420px, 100%)` + `flexWrap`），避免窄屏裁切

## 4. [P3] /impeccable harden — 无障碍细节

- [x] 4.1 `CanvasViewport.tsx` 警告横幅内 `AlertTriangle` 图标添加 `aria-hidden="true"`

## 5. /impeccable polish — 收尾验证

- [x] 5.1 `npm run build` 通过
- [x] 5.2 `npx tsc --noEmit` 通过
