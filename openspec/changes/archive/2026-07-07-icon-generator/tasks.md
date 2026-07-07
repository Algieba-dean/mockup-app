## 1. Icon workspace scaffold

- [x] 1.1 移除 `App.tsx` 中 `activeTool === 'icons'` 的占位空状态分支，接入真实图标工作区组件
- [x] 1.2 `LeftSidebar` 新增图标工具分支：单图上传 dropzone + 已生成尺寸缩略图网格
- [x] 1.3 `CanvasViewport` 新增图标渲染路径：绘制背景填充 + 内边距缩放后的原图（`src/utils/iconManager.ts` 的 `renderIconFrame`，采用原生 Canvas 2D API 而非 Fabric.js，详见 design.md 决策）

## 2. Upload validation & smart defaults

- [x] 2.1 读取上传图片 `naturalWidth/naturalHeight`，非正方形或 <1024px 时渲染非阻断式警告条
- [x] 2.2 实现自动居中裁剪为正方形（上传时静默处理，警告条提供"重新上传"快捷操作，简化自手动裁剪 UI，详见 design.md）
- [x] 2.3 检测图片 alpha 通道，若存在透明背景则读取边缘像素众数颜色作为默认背景填充色

## 3. Platform mask & safe-zone preview

- [x] 3.1 画布顶部新增 iOS / Android 分段切换控件
- [x] 3.2 iOS 模式：叠加 squircle 圆角遮罩预览层（SVG，DOM 叠加，不烘焙进导出像素）
- [x] 3.3 Android 模式：叠加中心 66% 安全区圆形参考线

## 4. Customization controls

- [x] 4.1 `RightPropertiesPanel` 新增内边距（padding/inset）滑块，150ms 防抖重绘
- [x] 4.2 新增背景填充色选择器（含自动取色默认值，可手动覆盖）
- [x] 4.3 新增 Android adaptive icon 前景缩放滑块（仅当检测到透明前景时展示）

## 5. Multi-platform export

- [x] 5.1 在 `src/utils/iconManager.ts` 建立数据驱动的图标尺寸配置表（iOS 18 种规格 + Android mipmap 密度 + adaptive 432px 层 + Play Store 512px）
- [x] 5.2 新增 `runIconZipExport`，采用离屏 Canvas 2D + JSZip 模式，按配置表逐尺寸渲染
- [x] 5.3 生成 iOS `AppIcon.appiconset/Contents.json` 与 Android 对应目录结构
- [x] 5.4 导出弹窗新增 iOS/Android 图标集勾选项，复用现有 `multi-size-export` 弹窗交互与进度提示

## 6. Verification

- [x] 6.1 `npm run build` 通过
- [x] 6.2 `npx tsc --noEmit` 通过
- [x] 6.3 新增 Playwright E2E：上传图标 → 校验警告条出现 → 切换 iOS/Android → 导出 ZIP 触发下载（待浏览器二进制安装后运行验证）
