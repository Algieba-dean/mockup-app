# MockupApp — 商店截图美化能力索引

本文档是 `openspec/specs/` 目录下所有 capability 的主索引，按截图美化工具的完整流水线阶段分类，方便快速定位某个功能点归属的 spec，以及在提出新 OpenSpec 提案前检查是否已有相关能力。

## 流水线总览

```
导入 → 画布渲染 → 定制 → 多设备/多页布局 → 导出 → 质量与完整性
```

## 1. 工作区骨架

- **[`workspace-scaffold`](./workspace-scaffold/spec.md)** — 多面板工作区布局（左侧栏 / 画布视口 / 右侧属性面板 / 底部素材栏），工具路由切换（截图/图标/文案），深浅色主题切换。

## 2. 导入 & 画布渲染

- **[`screenshot-canvas`](./screenshot-canvas/spec.md)** — 核心 Fabric.js 画布：缩放平移、拖拽导入截图、设备外壳叠加与裁切。是本节其他所有能力的渲染基座。

## 3. 定制（背景 / 排版 / 特效）

- **[`advanced-templates`](./advanced-templates/spec.md)** — 高级背景类型（纯色/渐变/纹理图）、毛玻璃特效、背景高斯模糊。与 `customization-controls` 共享 `canvasManager.ts` 渲染状态。
- **[`customization-controls`](./customization-controls/spec.md)** — 字体选择（标题/副标题）、设备外壳型号切换。与 `advanced-templates` 共享渲染状态，需联合评审。
- **[`skew-and-floating`](./skew-and-floating/spec.md)** — 2.5D 旋转与倾斜外壳组，赋予设计动态视觉效果。

## 4. 多设备 / 多页布局

- **[`device-mix`](./device-mix/spec.md)** — 单页内混合多个设备型号（如 iPhone + iPad 并排）。
- **[`panoramic-background`](./panoramic-background/spec.md)** — 单张全景图跨多页自动切片铺展，实现跨页视觉连贯的背景。

## 5. 导出

- **[`multi-size-export`](./multi-size-export/spec.md)** — 按 App Store / Google Play 标准分辨率批量导出为分文件夹的 ZIP 压缩包。

## 6. 图标生成（Icon Generator，独立工具分支）

与"商店截图"共享 `workspace-scaffold` 的 4 区工作区范式与顶部工具路由，但拥有独立的画布渲染与导出管线（单图上传，非多页），不复用 `screenshot-canvas`/`multi-size-export`。

- **[`icon-generator`](./icon-generator/spec.md)** — 单图上传、非阻断尺寸校验、iOS/Android 平台遮罩与安全区预览、内边距/背景填充/自适应前景缩放定制，含无障碍与响应式验收标准。
- **[`icon-export`](./icon-export/spec.md)** — 导出为 iOS `AppIcon.appiconset`（含 `Contents.json`）与 Android mipmap/adaptive/Play Store 图标集的 ZIP 压缩包。

## 7. 隐私与条款生成器（独立工具分支）

与"商店截图"/"图标生成"共享顶部工具路由，但完全跳出 3 栏画布工作区范式（无左右侧栏），采用全宽分步向导 + 纯字符串模板拼装，不涉及 Canvas 渲染或 ZIP 打包。

- **[`privacy-policy-generator`](./privacy-policy-generator/spec.md)** — 隐私政策 / 使用条款分步向导，数据收集与第三方服务披露目录，GDPR/CCPA/COPPA 合规选项，草稿持久化与多格式导出（复制/HTML/Markdown）。

## 8. 质量与完整性

- **[`ui-quality-hardening`](./ui-quality-hardening/spec.md)** — 响应式适配、无障碍访问、性能优化、设计令牌统一（已完成，审计分 19/20）。
- **[`screenshot-tool-completeness`](./screenshot-tool-completeness/spec.md)** — 功能完整性核查发现的收尾项：自定义弹窗 E2E 测试对齐、Undo/Redo 可见入口。

## 交叉引用备注

- `advanced-templates` ⇄ `customization-controls`：两者均修改 `canvasManager.ts` 的渲染/重绘逻辑，同批次（`editor-features-upgrade`）交付，修改任一方时应同时检查另一方的验收标准。
- `screenshot-canvas` 是 `device-mix`、`panoramic-background`、`skew-and-floating`、`advanced-templates`、`customization-controls` 的共同渲染基座，改动其核心接口前应先检查下游 5 个 capability 的影响面。
- `icon-generator` ⇄ `icon-export`：同批次交付，`icon-export` 依赖 `icon-generator` 的 `iconPadding`/`iconBgColor`/`iconHasAlpha`/`iconForegroundScale` 状态渲染最终导出像素，修改任一方需同时检查另一方。
- `--ink-tertiary` 令牌在正文/说明文字场景下对比度不达标（约 2.6:1，见 `icon-generator` 的无障碍验收标准），新增文字类 UI 时避免使用该令牌，应使用 `--ink-secondary` 或更高对比度令牌。
- `privacy-policy-generator` 的第三方服务隐私政策链接（`src/utils/legalDocManager.ts` 的 `SERVICE_CATALOG`）基于公开可查官方域名整理，未逐一实时校验有效性，新增服务时应尽量使用官方稳定域名，避免深层路径。

## 如何新增/修改能力

在提出新的 OpenSpec 提案前：
1. 查阅本索引，确认是否已有相近能力（避免重复/冲突）。
2. 若修改涉及 `canvasManager.ts`，检查上方"交叉引用备注"中列出的关联 capability。
3. 新提案完成归档后，回到本文件补充索引条目。
