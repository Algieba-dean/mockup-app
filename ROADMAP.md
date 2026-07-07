# MockupApp 路线图 — App 上架全流程工具清单

一个独立开发者/Indie App 从开发完成到上架 App Store / Google Play，通常需要经历的完整素材与合规准备流程。本文档梳理该流程中的各类工具，标注 MockupApp 已覆盖与尚未覆盖的部分，作为后续功能规划的参考清单。

## 已完成

- [x] **商店截图** — Fabric.js 画布，设备外壳叠加、多页故事画幅、多尺寸批量导出 ZIP（`openspec/specs/screenshot-canvas`, `multi-size-export` 等）
- [x] **图标生成** — 单图上传、iOS/Android 平台遮罩预览、内边距/背景/自适应前景定制，导出 iOS `AppIcon.appiconset` + Android mipmap/adaptive/Play Store 图标集（`openspec/specs/icon-generator`, `icon-export`）
- [x] **隐私政策 / 使用条款** — 分步向导生成隐私政策与使用条款，含数据收集/第三方服务披露目录、GDPR/CCPA/COPPA 合规选项，纯前端模板拼装，支持复制/HTML/Markdown 导出（`openspec/specs/privacy-policy-generator`）

## 待规划

### 1. 视觉素材（可复用画布渲染 + ZIP 导出范式）
- [ ] **Feature Graphic 生成器** — Google Play 强制要求的 1024×500 推广图，目前无工具覆盖
- [ ] **App Store 预览视频 / GIF 生成器** — 从截图序列合成预览视频，对转化率影响较大
- [ ] **多语言截图本地化** — 同一套截图模板批量套用不同语区文案（App Store 最多支持 40 个语区）
- [ ] **Watch/Widget 图标补充** — Apple Watch complications、桌面小组件所需的额外图标尺寸

### 2. 商店文案
- [ ] **文案助手 (ASO Copywriter)** — 标题/副标题/关键词/长描述的字数与关键词密度校验（顶部导航已有占位标签，未实现）
- [ ] **What's New / 更新日志生成器** — 每次发版的 Release Notes 排版工具

### 3. 法务与合规（可直接复用隐私政策生成器已收集的数据）
- [ ] **Google Play Data Safety 表单助手** — 复用 `src/utils/legalDocManager.ts` 的 `PrivacyDraft`（已选数据类型/第三方服务）自动映射生成 Data Safety 问卷答案
- [ ] **Apple 隐私"营养标签"助手** — 同理复用 `PrivacyDraft`，生成 App Store Connect 的 App Privacy 详情数据类型/用途矩阵
- [ ] **加密出口合规声明助手** — Apple 上架时的加密使用问卷（开发者常见困惑点）
- [ ] **年龄分级问卷助手** — 内容分级问卷（暴力/赌博/UGC 等）标准化问答

### 4. 营销与分发
- [ ] **落地页 / Landing Page 生成器** — 复用已有截图/图标资产直接拼装官网
- [ ] **Press Kit 生成器** — 打包 Logo + 截图 + 简介 + 联系方式的媒体资料包
- [ ] **社交卡片生成器** — Open Graph / Twitter Card 等社交分享图
- [ ] **应用商店页面 QR 码生成器** — 用于落地页/线下物料引流

## 优先级建议

- **Data Safety 表单助手 / Apple 隐私标签助手** 优先级最高：直接复用隐私政策生成器已建立的 `PrivacyDraft` 数据模型，用户无需重新回答一遍数据收集问题。
- **Feature Graphic 生成器** 是视觉素材中最明显的空缺，且可完全复用 `screenshot-canvas` / `multi-size-export` 已验证的渲染与打包模式。

---
*最后更新：2026-07-07。新增能力归档后，请回到本文件勾选对应条目并更新 `openspec/specs/README.md` 索引。*
