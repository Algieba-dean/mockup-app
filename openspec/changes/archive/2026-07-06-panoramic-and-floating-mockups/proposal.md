## Why

为了让 MockupApp 的商店页面截图生成功能达到行业顶尖的视觉包装水准，我们需要规划四个高级排版与渲染特性：
1. **全局跨页连图背景模式 (Global Panoramic Background)**：允许用户上传一张超宽大图作为所有页面的连续背景，增强用户滑动商店页面时的整体连贯性。
2. **三维悬浮与旋转机型 (2.5D Floating & Rotated Mockups)**：摆脱死板的正面直立机壳，支持倾斜旋转手机、调整边缘和弥散投影效果，模拟精美海报质感。
3. **多机型组合混搭 (Multi-device Mix & Match)**：支持在单页画幅中放置多个不同种类的设备（如 iPhone 与 iPad 并排），用于演示跨端协作或多端适配。
4. **一键多尺寸商店图导出 (Multi-size Export Presets)**：解决 App Store 与 Google Play 各类寸要求（如 iPhone 6.9", 6.5", 5.5" 及 iPad 12.9"）极为严苛繁琐的痛点，帮助开发者一键完成适配。

## What Changes

- **跨页连图 (Panoramic Background)**：
  - 新增“全局连图背景”开关和上传入口。
  - 在 Canvas 渲染器中计算画幅页数与比例，裁剪并按页宽位移背景图（第 $i$ 页的背景图 `left` 设置为 $-i \times 1242$）。
  - 支持多页预览时背景无缝拼接。
- **三维悬浮与旋转 (2.5D Floating)**：
  - 增加“设备偏转角度”滑块（-45° 到 +45°）以及“三维倾斜/错切 (Skew)”控制。
  - 渲染器根据偏转角计算外壳及内屏的几何形变，并对设备投影（Shadow）的 `blur`、`offsetX` 和 `offsetY` 进行相应的光学偏差补偿。
- **多机型混搭 (Mix & Match)**：
  - 在每个 Page 状态中支持 `devices` 数组（代替原有的单一机型）。
  - 支持用户在单页画幅中添加、删除、排序设备，并为每个设备独立指定机型（iPhone/iPad/Pixel）和屏幕截图。
- **一键多尺寸导出 (Multi-size Export)**：
  - 提供 Apple App Store / Google Play 商店常用截图尺寸的复选配置项。
  - 重构导出逻辑，在后台依次将画布重设为目标分辨率尺寸（如 `1290x2796`, `1242x2208`, `2048x2732`），重新调用 `updateCanvas` 计算相对比率位置，渲染 PNG 存入分目录 ZIP。

## Capabilities

### New Capabilities
- `panoramic-background`: 管理全局宽屏背景图的存储、分割绘制逻辑与无缝导出。
- `floating-bezel-geometry`: 处理 Fabric.js 对象组 of 旋转、错切投影及内屏截图的坐标透视变换。
- `multi-device-layout`: 支持在一个画幅中管理多个 Mockup 实例，并提供混搭排版引擎。
- `multi-size-export`: 提供应用商店标准的画布比例缩放、重新重绘与按目录分类 ZIP 归档输出的能力。

## Impact

- **数据模型**：`MockupPage` 结构将由单设备模型升级为多设备设备列表数组，且 `bgType` 新增加 `panoramic` 类型。
- **UI 界面**：左侧素材面板需要增加“全局连图背景”管理区；右侧属性栏的“设备设置”需要变为“设备列表”的管理交互；导出弹窗（或者 Header 导出区）增加标准尺寸选项多选框。
- **导出流**：`JSZip` 导出流程将从一页一次渲染打包，升级为单页在多个尺寸下依次循环重设分辨率、重组相对坐标并输出。
