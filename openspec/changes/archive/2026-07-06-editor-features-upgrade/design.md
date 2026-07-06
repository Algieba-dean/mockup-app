## Context

根据用户反馈，我们需要将 MockupApp 的系统默认主题升级为亮色模式（Light Mode），并扩充高级编辑特性：包含丰富的画布背景模版（纯色、渐变与背景图）、高档滤镜特效（背景高斯模糊、手机后面的圆角毛玻璃背板、大光圈景深）、标题字体自由切换，以及更多设备型号（iPhone/iPad/Pixel）的支持。

## Goals / Non-Goals

**Goals:**
- 将系统启动默认状态设置为亮色模式 (Light Theme)。
- 扩展背景定义：支持纯色填充、线性渐变填充以及纹理图背景填充。
- 引入 Canvas 背景高斯模糊滤镜（FabricJS Blur filter），使用滑块进行模糊度实时修改。
- 引入手机外壳毛玻璃底板效果 (Glassmorphism card)：在设备外框后绘制一个具有白色透明度、细边框和白色外发光阴影的 `fabric.Rect`，营造高级层叠质感。
- 引入字体加载器：提供 Lora, Geist, Playfair Display, Cormorant Garamond 等字体的下拉切换，加载完毕后再重绘 Canvas。
- 引入设备规格数据库：支持 iPhone (深/浅)、iPad Pro (960x1280 容器)、Google Pixel，并自动调整裁剪圆角和位置。

**Non-Goals:**
- 支持用户自行上传任意本地 `.ttf` / `.woff` 字体文件（仅限于内置的 6 款高水准 Google 字体）。
- 手机外壳的 3D 自由倾斜透视（在当前版本中保持扁平的高清矢量投影叠层）。

## Decisions

- **利用 `document.fonts.load` 加载字体后再触发 Canvas 渲染**
  - *原因*: Fabric.js Canvas 在绘制文本时，如果指定的字体在浏览器中还没有完成下载，会直接回退到系统默认的无衬线体。为确保“所见即所得”，我们必须使用 `document.fonts.load("1em YourFont")` 异步等待字体准备就绪，再调用 `canvas.requestRenderAll()`。
  - *替代方案*: 静态延时重绘（容易产生闪烁，或者网速慢时依然渲染出 Arial）。

- **使用 Fabric.js 原始对象层级模拟 Glassmorphism (毛玻璃) 视觉**
  - *原因*: 2D Canvas 本身不支持全局 CSS `backdrop-filter: blur(...)` 特效。为了在手机壳后营造“磨砂玻璃”质感，我们会在手机壳下层绘制一个低饱和度/白色透明的 `fabric.Rect`，并为其添加一个向外扩散的白色虚化阴影（Shadow），同时对最底部的背景图应用全局高斯模糊。这样能以极高的运行性能模拟出几乎一致的视觉美感。
  - *替代方案*: WebGL 自定义 Shader 滤镜（开发难度极大，且容易产生渲染卡顿）。

- **数据驱动的设备适配矩阵 (Device Metrics Matrix)**
  - *原因*: 我们在 `canvasManager.ts` 中维护一个机型坐标表，当用户切换机型时，直接读取该机型的 `width, height, screenWidth, screenHeight, rx, ry`，动态调整 Fabric Group 和剪切蒙版。
  - *机型适配数据*：
    * `iphone_16_pro`: 边框 620x1260，内屏 592x1232，圆角 45
    * `ipad_pro`: 边框 900x1200，内屏 840x1140，圆角 24
    * `google_pixel`: 边框 620x1260，内屏 588x1228，圆角 40

## Risks / Trade-offs

- **[Risk] 大尺寸 Canvas 背景模糊滤镜卡顿**
  - *Mitigation*: 限制背景图最大模糊半径为 30，且仅在滑块释放或拖动防抖（Debounce 100ms）后应用滤镜，避免每一像素拖动都引发 CPU 重度重绘。
