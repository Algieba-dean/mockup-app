## Context

MockupApp 是一款纯前端、零服务端的应用商店资产生成工具。本次更改旨在初始化项目的前端工程骨架（React + Vite + TypeScript），并集成 Fabric.js 作为画布渲染底层。我们将实现“社论策展人 (The Editorial Curator)”视觉系统的主色调（纯单色黑白）与面板网格，并为截图和外壳的 Canvas 绘制打下架构基础。

## Goals / Non-Goals

**Goals:**
- 初始化 Vite-React 基础脚手架，集成 TypeScript 与原生 CSS (Vanilla CSS)。
- 构建整体的后台布局网格，包含头部导航、左侧预设/素材面板、中央 Canvas 视口、右侧参数控制面板以及底部的资产列表。
- 集成 Fabric.js 绘图引擎，在中央视口完成画布容器初始化。
- 实现基本的设备外壳定义格式（JSON mapping），支持在 Canvas 中加载模拟手机边框，并为其指定截图容器边界与圆角裁剪（clipPath）。
- 支持暗色 (Dark)/亮色 (Light) 极简主题的一键切换。

**Non-Goals:**
- 实现 zip 压缩文件多分辨率批量打包导出（这将在后续开发阶段完成）。
- 实现完整的 Icon 生成器控制流及自适应图标层级编辑。
- 实现多字重/字体的远程 Google Fonts 实时异步加载下载控制（仅做静态样式对标）。

## Decisions

- **使用 Vite 作为构建工具，React 作为渲染框架**
  - *原因*: Vite 具备极速的热重载（HMR）速度，开箱即用支持 TypeScript。对于不依赖 SSR/SEO 的纯前端单页应用（SPA）来说，它比 Next.js 更加轻量，启动更为顺畅。
  - *替代方案*: Next.js（对于纯浏览器图像渲染工具，Next.js 会增加不必要的打包体积及服务端逻辑复杂度）。

- **使用 Fabric.js 作为 Canvas 底层编辑器库**
  - *原因*: Fabric.js 拥有成熟的对象管理系统（Fabric.Group, Fabric.Image, Fabric.IText），可直接进行缩放、矩阵变换和定位。通过 Canvas 绘制能够绝对避免 `html2canvas` 经常出现的 DOM 渲染模糊、跨域图片黑屏及不同浏览器下排版渲染不一致的坑。
  - *替代方案*: 使用标准 HTML 元素拼装再通过 `html2canvas` 截图（性能低，在大尺寸 300 DPI 导出时极易产生崩溃与像素错位）。

- **使用 JSON 文件格式配置设备边框元数据**
  - *原因*: 每个手机外壳 SVG 或 PNG 均有特定的屏幕绘制区域（比如 iPhone 16 Pro 屏幕起止像素坐标为 `(x: 35, y: 35)`，圆角半径为 `40px`）。采用统一的 JSON 配置文件来描述这些机型数据，能让我们在未来无缝扩充新机型，而不需要重写 Canvas 逻辑。

## Risks / Trade-offs

- **[Risk] Fabric.js 打包体积较大**  
  - *Mitigation*: 可在打包时开启 Tree Shaking，只打包 2D Canvas 需要的模块；由于是离线优先的 Web 运用，首次加载后可利用 Service Worker 将资产持久缓存在浏览器中。
- **[Risk] Retina 屏幕下的 Canvas 模糊问题**  
  - *Mitigation*: 在初始化 Canvas 时检测浏览器的 `devicePixelRatio`，自动调整 Canvas 的 backing store size，使其始终保持超清渲染。
