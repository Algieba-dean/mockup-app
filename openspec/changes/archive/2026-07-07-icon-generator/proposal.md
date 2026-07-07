## Why

MockupApp 顶部导航中的"图标生成"(Icons) 工具目前只是一个占位空状态（见 `src/App.tsx` 中 `activeTool === 'icons'` 分支），尚未实现任何实际功能。开发者在准备 App Store / Google Play 上架材料时，通常需要同时准备商店截图（已支持）与应用图标全尺寸集（未支持），目前仍要依赖外部工具（如 appicongenerator.org）完成图标切图，打断了 MockupApp"一站式上架素材生成"的工作流。

## What Changes

- 新增图标生成工作区，复用现有 4 区工作区范式（左侧栏上传+尺寸缩略图、中间画布实时预览、右侧属性面板、顶部导出），不引入独立的分步向导页面。
- 支持上传单张正方形图标原图，实时校验尺寸/比例，非阻断式提示裁切风险。
- 支持 iOS / Android 平台切换，画布叠加对应的遮罩预览（iOS squircle 圆角矩形、Android adaptive icon 66% 安全区参考线）。
- 支持内边距、背景填充色（含透明 PNG 自动提取边缘色）、Android adaptive icon 前景缩放等自定义控制。
- 支持一键导出符合 App Store Connect（13 种 iOS 尺寸）与 Google Play（Legacy mipmap 密度 + Adaptive 前景/背景层 + 512px 商店图标）规范的 ZIP 图标包。
- 范围仅覆盖 iOS + Android，不含 favicon/PWA/Chrome 扩展。

## Capabilities

### New Capabilities
- `icon-generator`：图标生成工作区的上传、实时画布渲染、平台遮罩/安全区预览、自定义控制（内边距/背景填充/前景缩放）。
- `icon-export`：将图标生成工作区的设计导出为符合 iOS/Android 规范目录结构的 ZIP 图标包。

### Modified Capabilities
（无）

## Impact

- 新增/修改组件：`App.tsx`（移除 icons 占位分支）、`LeftSidebar`、`CanvasViewport`、`RightPropertiesPanel`、`canvasManager.ts`（新增图标渲染与遮罩逻辑）。
- 复用现有导出基础设施（JSZip 打包模式，参考 `multi-size-export` 能力的实现）。
- 不影响现有"商店截图"(screenshots) 与"文案助手"(copywriter) 工具的行为。
