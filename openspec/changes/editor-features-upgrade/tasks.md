## 1. Default Light Mode Theme

- [x] 1.1 在 `App.tsx` 中将系统初始化默认主题状态更改为亮色模式（Light Mode）
- [x] 1.2 确保 `App.tsx` 中的 initial useEffect 能在首次加载时自动将 `.light` 类名添加至根 `documentElement` 节点

## 2. Advanced Background & Effects Templates

- [x] 2.1 升级 `RightPropertiesPanel` 支持背景类型选择：纯色 (Solid Color)、渐变色 (Gradient)、纹理背景图 (Image)
- [x] 2.2 在控制面板为背景图选项提供高档大理石、极简噪点、渐变虚化等背景模版素材列表
- [x] 2.3 在 `canvasManager.ts` 中实现渐变背景重绘，以及加载并拉伸绘制背景图的逻辑
- [x] 2.4 在 `RightPropertiesPanel` 和 `canvasManager.ts` 中引入“背景模糊半径”滑块，实现 Gaussian 模糊滤镜处理
- [x] 2.5 在 `canvasManager.ts` 中实现毛玻璃背板（Glassmorphism Card）选项，若勾选则在手机下方绘制一层带微弱白色虚化边缘阴影的半透明面板

## 3. Font & Device Shell Customization Controls

- [x] 3.1 在 `RightPropertiesPanel` 属性面板中提供主副标题的字体选择下拉框 (Lora, Geist, Playfair Display, Cormorant Garamond)
- [x] 3.2 在 `App.tsx` 页面重绘事件中结合 `document.fonts.load` 保证所选字体加载完毕后再行刷新 FabricJS 画布
- [x] 3.3 扩展 `RightPropertiesPanel` 的设备选择菜单，增加 iPad Pro 与 Google Pixel 选项
- [x] 3.4 在 `canvasManager.ts` 中重构设备绘制引擎，使用配置化的机型适配矩阵（Device Metrics Matrix）动态设置坐标、外框大小及内屏 clipPath
