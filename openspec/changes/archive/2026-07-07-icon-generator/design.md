## Context

MockupApp 已有"商店截图"工具建立了一套成熟的纯前端渲染+导出模式：Fabric.js 离屏 Canvas 逐尺寸重绘 → `toDataURL` → JSZip 打包 → 触发下载（见 `App.tsx` 的 `runZipExport`）。图标生成器复用同一套模式，但渲染内容从"设备外壳+截图+文案"简化为"单张图标图稿+遮罩/内边距/背景"，导出目录结构也从 `/ios/iphone_6.9/` 换成 iOS/Android 官方图标集规范目录。

## Goals / Non-Goals

**Goals:**
- 单一工作区完成上传、实时预览、平台遮罩/安全区可视化、自定义与导出，不新增路由或分步页面。
- 导出产物开箱即用：iOS 输出 `AppIcon.appiconset/`（含 `Contents.json`），Android 输出各密度 `mipmap-*/ic_launcher.png` + adaptive icon 前景/背景层 + Play Store 512px 图标。
- 非阻断式的尺寸/比例校验，不因原图不完美而拒绝用户导出。

**Non-Goals:**
- 不支持 favicon / PWA manifest / Chrome 扩展图标（后续如有需要另开提案）。
- 不做图标内容的 AI 生成或矢量编辑，仅接受已有位图并做裁切/遮罩/背景处理。
- 不支持批量导入多个不同图标同时生成（每次一个母图，与截图工具的多页范式不同）。

## Decisions

- **复用离屏 Fabric Canvas + JSZip 导出模式**
  - *原因*：与 `multi-size-export` 完全一致的技术路径已验证可靠（见 `App.tsx:437-511`）。新增一个 `runIconZipExport` 函数，对每个目标尺寸重设 Canvas 物理像素、重绘图标图层（背景填充 + 内边距缩放后的原图 + 可选前景层），再 `toDataURL` 写入 zip 对应路径。
  - *替代方案*：纯 Canvas 2D API 手写代码（放弃 Fabric.js 抽象）——放弃，因为要与现有代码风格/对象模型保持一致，且需要复用透明检测与颜色提取的 Canvas 像素读取逻辑。

- **遮罩预览用 SVG/CSS clipPath 叠加层，不烘焙进导出像素**
  - *原因*：iOS/Android 系统本身会在设备端应用圆角/圆形遮罩，图标文件本身应保持方形不裁切（iOS 系统要求上传方形 PNG，由系统动态加 squircle 遮罩）。因此画布内的遮罩/安全区参考线只是**预览辅助层**（DOM 上叠加的 SVG，随 Canvas 位置同步），导出时不参与像素合成，避免产出错误的已裁切图标导致 App Store 审核异常。
  - *替代方案*：导出时也烘焙圆角遮罩——放弃，不符合平台规范，安卓/iOS 都要求提交未裁切的方形原图。

- **非阻断式尺寸校验 + adaptive icon 安全区可视化**
  - *原因*：产品设计原则是 Frictionless Velocity，不因原图不完美阻断用户。校验逻辑读取上传图片的 `naturalWidth/naturalHeight`，若非正方形或 <1024px，仅在画布上方渲染警告条并提供"一键居中裁剪为正方形"按钮，不禁用导出按钮。Android 安全区参考线用一个半透明圆形叠加在画布中心 66% 直径处，帮助用户判断内容是否会被自适应图标的圆形/圆角遮罩裁掉。

- **透明背景自动取色**
  - *原因*：iOS 图标不允许 alpha 透明通道（App Store Connect 会拒绝半透明图标）。上传图片含 alpha 通道时，读取图片四条边缘像素的众数颜色作为默认背景填充色（呼应 `PRODUCT.md` 的 Contextual Intelligence 原则：从用户素材自动提取调色），并允许用户在右侧面板手动覆盖。
  - *替代方案*：默认纯白/纯黑背景——放弃，不够"智能默认"，容易与图标主体撞色。

- **Android adaptive icon 前景/背景分层**
  - *原因*：Google 官方 adaptive icon 规范要求前景层（图标图形）与背景层（纯色/图案）分离，系统会分别应用形状遮罩与视差效果。当用户素材带透明背景时，自动作为前景层，背景色作为背景层；若素材本身是不透明矩形图，则前景=背景=同一图（退化为传统 legacy 图标行为）。

## Risks / Trade-offs

- **[Risk] 自动边缘取色在渐变/复杂背景下不准确**
  - *Mitigation*：取色仅作为默认建议值，右侧面板提供颜色选择器随时覆盖，不阻塞导出流程。

- **[Risk] iOS/Android 完整尺寸清单较长（13 + 多密度），首次实现工作量集中在 `canvasManager.ts` 的尺寸配置表**
  - *Mitigation*：以数据驱动的尺寸配置数组实现（类似现有 `EXPORT_PRESETS` 模式），后续增删尺寸只需改配置，不改渲染逻辑。
