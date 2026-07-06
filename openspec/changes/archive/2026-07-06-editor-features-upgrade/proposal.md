## Why

目前 MockupApp 默认使用暗色模式，且缺少丰富的自定义功能，例如更具视觉深度的背景模版（纯色、渐变与自定义背景图）、高档滤镜特效（模糊、毛玻璃、景深）以及多字重字体和多款手机外壳的切换选择。为了满足不同开发者和设计师差异化的品牌包装与 ASO 提交需求，需要升级这些核心画布控制与渲染特性。

## What Changes

- 将网站默认主题改为亮色模式（Light Mode）。
- 扩展背景设置：除了单色外，新增渐变色预设和内置大理石/质感背景图模版。
- 引入 Canvas 画布特效控制：支持对背景图进行高斯模糊、为手机外壳后面增加毛玻璃圆角面板（Glassmorphism）、以及模拟大光圈景深模糊效果。
- 引入字体选择列表：允许用户从多款 Google Fonts 衬线体（Lora / Playfair Display / Cormorant Garamond）与无衬线体（Geist / Inter / Outfit）中切换主副标题字体。
- 引入外壳切换与机型数据库：支持在 iPhone（深/浅）、iPad、Google Pixel 等外壳之间切换，自动映射对应的定位坐标与 clipPath 裁切半径。

## Capabilities

### New Capabilities
- `advanced-templates`: 实现纯色、渐变、纹理图片背景的渲染，支持 Canvas 背景滤镜（模糊度调节、高斯景深）以及毛玻璃底层面板（fabric.Rect 混合发光与半透明混合）的渲染。
- `customization-controls`: 实现字体切换拉取（Geist/Playfair/Lora/Cormorant/Outfit）、多机型库切换绑定（iPhone, iPad, Pixel），并在右侧控制面板与左侧素材栏中提供交互表单。

### Modified Capabilities
<!-- 暂无已存在的 capabilities -->

## Impact

- 扩展组件 `LeftSidebar`、`RightPropertiesPanel`、`canvasManager` 与 `App.tsx` 中的状态架构。
- 丰富 CSS 变量对亮色模式下的排版优化。
- 引入异步字体加载机制，防止字体未加载前 Canvas 渲染回退。
