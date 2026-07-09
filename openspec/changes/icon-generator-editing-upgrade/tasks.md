## 1. State model & rendering engine (iconManager.ts / App.tsx)

- [ ] 1.1 在 `iconManager.ts` 的 `IconRenderConfig`/`renderIconFrame` 新增可选 `offsetX`/`offsetY`/`contentScale` 字段（默认 0/0/1），实现"先缩放、再按 padding 计算安全区、再平移"的绘制顺序
- [ ] 1.2 在 `iconManager.ts` 新增渐变填充支持：`bgMode: 'solid' | 'gradient'`、`bgGradient: [string, string]`，`renderIconFrame` 内按 135° 用 `createLinearGradient` 绘制
- [ ] 1.3 `App.tsx` 新增状态字段 `iconOffsetX`/`iconOffsetY`/`iconContentScale`/`iconBgMode`/`iconBgGradient`，接入现有 `loadSavedState`/持久化 `useEffect`，为旧版 `localStorage` 数据提供默认值兜底
- [ ] 1.4 `buildIconZip` 的 Android Adaptive 背景层绘制改为复用新的渐变/纯色统一填充函数，而非硬编码 `fillStyle = bgColor`

## 2. Canvas drag & zoom interaction

- [ ] 2.1 `CanvasViewport.tsx` icons 分支：画布容器绑定 `onPointerDown/Move/Up`，拖拽时同步更新 `iconOffsetX/Y` 并立即重绘（不走 150ms 防抖）
- [ ] 2.2 绑定 `onWheel`（`preventDefault`）与双指 pointer 手势，映射为 `iconContentScale` 增量，限制在 0.5–2.0 范围
- [ ] 2.3 画布容器 `tabIndex` 可聚焦，绑定方向键事件做小步长 offset 微调（键盘可达性）
- [ ] 2.4 悬浮缩放条"重置"按钮同时清零 `iconOffsetX/Y`/`iconContentScale`（连同现有 `iconPadding` 重置逻辑）
- [ ] 2.5 拖拽/缩放结束（pointerup/wheel 停止）后触发现有防抖定时器完成 `localStorage` 持久化写入

## 3. Gradient background UI

- [ ] 3.1 `RightPropertiesPanel.tsx` 图标定制区块新增"纯色/渐变"分段控件（`SectionAccordion` 内）
- [ ] 3.2 渐变模式下渲染两个颜色输入（起始色/终止色），复用现有色板+hex 输入的控件样式
- [ ] 3.3 确保切换纯色/渐变模式时预览画布立即重绘（复用现有防抖重绘 `useEffect` 依赖数组，新增 `iconBgMode`/`iconBgGradient`）

## 4. Privacy disclosure copy

- [ ] 4.1 `CanvasViewport.tsx` 图标空状态上传卡片下方新增一行本地隐私处理提示文案（`--ink-secondary` 或更高对比度令牌）
- [ ] 4.2 导出平台选择弹窗底部新增同一提示文案的简short版本

## 5. Post-export integration guidance

- [ ] 5.1 `App.tsx` 将 `isExporting: boolean` 重构为 `exportState: 'idle' | 'exporting' | 'done' | 'error'`（图标导出与现有多尺寸导出共用状态机，注意不影响 `multi-size-export` 现有行为——如两者共享同一状态机会互相影响，则改为图标专属状态机 `iconExportState`）
- [ ] 5.2 `'done'` 态渲染 iOS（Xcode `Assets.xcassets` 集成）与 Android（`res` 目录合并）两行指引文案 + "关闭"按钮，替换现有自动消失的遮罩
- [ ] 5.3 导出失败路径保持现有 toast 报错，不进入 `'done'` 态

## 6. SVG container export

- [ ] 6.1 `iconManager.ts` 新增 `buildSvgContainer(sourceCanvas): string` 工具函数，生成内嵌 base64 位图的 1024×1024 SVG 字符串
- [ ] 6.2 `buildIconZip`/`IconExportConfig` 新增 `includeSvgContainer: boolean` 参数，为真时在 ZIP 根目录写入 `icon-1024.svg`
- [ ] 6.3 导出弹窗新增"附带 SVG 容器版"复选框，接入 `iconExportPlatforms`/新状态并透传给 `runIconZipExport`

## 7. Icon history drawer

- [ ] 7.1 新建 `src/components/IconHistoryDrawer.tsx`：侧滑抽屉，接收历史列表、保存/恢复/重命名/删除回调
- [ ] 7.2 `App.tsx` 实现历史 CRUD：`handleSaveIconHistory`/`handleRestoreIconHistory`/`handleRenameIconHistory`/`handleDeleteIconHistory`，持久化到新键 `mockup_app_icon_history`
- [ ] 7.3 `AppHeader.tsx` 新增仅 `activeTool === 'icons'` 时显示的"历史"入口按钮，控制抽屉开关
- [ ] 7.4 抽屉空状态文案；删除操作二次确认交互（复用现有自定义预设删除的确认模式）
- [ ] 7.5 图标定制面板新增"保存到历史"按钮，触发保存并做一次性 toast 反馈

## 8. Accessibility & responsive pass

- [ ] 8.1 历史抽屉：`role="dialog"`/`aria-modal`/焦点陷阱/Escape 关闭（复用现有 `FocusTrap`）
- [ ] 8.2 渐变颜色输入、拖拽画布、历史入口按钮在 <768px 视口下的触摸目标与布局检查
- [ ] 8.3 新增文案统一走 `--ink-secondary`/更高对比度令牌，不使用 `--ink-tertiary`

## 9. Test coverage

- [ ] 9.1 Playwright：拖拽画布后 `iconOffsetX/Y` 状态变化、重置按钮清零验证
- [ ] 9.2 Playwright：切换渐变背景后预览与导出 ZIP 内 Android 背景层像素模式验证（非纯色）
- [ ] 9.3 Playwright：保存/恢复/重命名/删除历史条目全流程
- [ ] 9.4 Playwright：导出成功后指引文案出现且需手动关闭；导出失败仍走 toast
- [ ] 9.5 Playwright：勾选 SVG 容器导出后，用 `jszip` 解析下载产物断言 `icon-1024.svg` 存在且为合法 XML

## 10. Verification

- [ ] 10.1 `npx tsc -b` 通过
- [ ] 10.2 `npx oxlint` 通过
- [ ] 10.3 `npx playwright test` 全量通过（含新增用例）
- [ ] 10.4 手动核对：旧版 `localStorage`（无新增字段）加载后不报错，新增字段均有合理默认值
