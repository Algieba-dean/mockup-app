## Why

对比 appicongenerator.org（详见本次对话前置调研），我们的图标生成器在"内容定位自由度、导出后的落地引导、信任感传达、多方案管理、可交付格式"五个维度存在明显体验差距，导致用户仍需依赖外部工具微调构图或来回试错。本提案在保留现有单图上传、非阻断校验、平台遮罩预览等已验收能力的基础上，补齐这些差距，仅排除 AI 生成类功能（不在本次范围内）。

## What Changes

- 画布内直接拖拽平移 + 滚轮/捏合缩放图标内容，新增独立于内边距的 `iconOffsetX`/`iconOffsetY`/`iconContentScale` 状态，内边距滑块保留作为"安全区留白"的补充控制，二者共同决定最终渲染矩阵。
- 背景填充新增"纯色/渐变"分段控件，渐变为固定 135° 双色线性渐变；Android Adaptive 背景层导出时使用渐变 PNG（而非当前的纯色 fill）。
- 导出成功后的加载遮罩升级为"完成态"：停留展示 iOS（Xcode 集成）与 Android（Android Studio 集成）的落地指引文案，用户主动点击关闭，而非现有的自动消失。
- 图标空状态上传区与导出弹窗新增一行本地隐私处理提示文案（"全部处理在本地浏览器完成，图片不会上传到任何服务器"）。
- 新增"图标历史"抽屉：AppHeader 新增仅图标工具下可见的入口按钮，支持保存任意数量的命名历史方案（缩略图+参数快照）、恢复、删除，复用现有自定义预设的持久化模式（localStorage）。
- 导出弹窗新增"附带 SVG 容器版"勾选项：生成一份 1024×1024 的 `.svg`（`<image>` 内嵌 base64 位图），作为设计交接用的可缩放容器，位于 ZIP 顶层，不逐尺寸孪生。
- **BREAKING**：无——所有改动为新增状态字段与新增 UI 分支，不移除或改变现有 `iconPadding`/`iconBgColor`/`iconHasAlpha`/`iconForegroundScale` 字段的既有语义。

## Capabilities

### New Capabilities
- `icon-history`：图标生成器的命名历史方案抽屉——保存/恢复/删除任意数量的历史配置快照，独立于当前工作状态持久化。

### Modified Capabilities
- `icon-generator`：新增画布拖拽平移+滚轮缩放的内容定位交互（新增 `iconOffsetX`/`iconOffsetY`/`iconContentScale` 状态及其与现有 `iconPadding` 的组合渲染规则）；新增渐变背景填充模式；新增本地隐私处理提示文案的展示要求。
- `icon-export`：新增导出成功后的平台集成指引展示要求（不再自动消失，需用户主动关闭）；新增"SVG 容器版"可选导出产物；Android Adaptive 背景层导出需支持渐变填充。

## Impact

- 代码：`src/components/CanvasViewport.tsx`（拖拽/缩放手势、渐变预览、导出完成态 UI）、`src/components/RightPropertiesPanel.tsx`（渐变分段控件、颜色选择器）、`src/components/AppHeader.tsx`（历史入口按钮）、`src/utils/iconManager.ts`（渲染矩阵纳入 offset/scale、渐变背景渲染、SVG 容器生成）、`src/App.tsx`（新增状态字段、历史 CRUD、导出弹窗新增勾选项、localStorage schema 扩展）。
- 新增文件：历史抽屉组件（如 `src/components/IconHistoryDrawer.tsx`）。
- 无新增第三方依赖（SVG 容器用字符串拼装 + base64，渐变用原生 Canvas `createLinearGradient`）。
- localStorage：新增一个历史记录键（如 `mockup_app_icon_history`），需评估容量上限与超限处理（历史缩略图为 base64，需要压缩或限制分辨率）。
- 测试：需扩展 `tests/` 覆盖新增交互（拖拽、渐变、历史 CRUD、导出完成态、SVG 产物内容）。
