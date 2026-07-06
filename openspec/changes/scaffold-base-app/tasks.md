## 1. Project Initialization & Dependencies

- [x] 1.1 使用 Vite-React 脚手架初始化当前项目目录并配置 TypeScript
- [x] 1.2 安装核心库依赖：fabric, lucide-react
- [x] 1.3 编写全局 CSS 样式文件与基本色彩主题变量（支持黑白暗色/亮色切换）

## 2. Workspace & Sidebar Scaffold

- [x] 2.1 编写 `AppHeader` 组件，包含工具选项卡切换（Screenshots/Icons/Copywriter）以及主题切换按钮
- [x] 2.2 编写 `LeftSidebar` 侧边栏组件，支持模板预设列表和临时上传的图片资产列表
- [x] 2.3 编写 `RightPropertiesPanel` 组件，为画布背景色、设备型号、标题文案提供输入表单
- [x] 2.4 实现主页面的多栏网格布局，将头部、侧栏、中央视口与底部资产 Dock 进行拼接

## 3. FabricJS Canvas Viewport Engine

- [x] 3.1 在中央视口集成 Fabric.js 基础画布，设置正确的视口缩放与平移状态
- [x] 3.2 建立设备外壳元数据结构（Device Specs JSON），导入首批 iPhone 外壳矢量/图片资源
- [x] 3.3 实现 Drag-and-Drop 截图上传逻辑，在 Canvas 中加载截图并使用 clipPath 限制在设备内部
- [x] 3.4 实现副文本标题编辑功能，并在 Fabric.js 画布顶端实时以 Serif 字体渲染该文本
