## 1. Data model & document generation

- [x] 1.1 建立 `src/utils/legalDocManager.ts`：`DATA_TYPE_CATALOG`（11 类）、`SERVICE_CATALOG`（8 大类 ~30 项服务，含官方隐私政策链接）
- [x] 1.2 `PrivacyDraft` / `TermsDraft` 数据结构 + 默认值
- [x] 1.3 `buildPrivacyPolicySections` / `buildTermsOfUseSections`：按用户选择动态拼装章节（含 GDPR/CCPA/COPPA 条件章节）
- [x] 1.4 `renderSectionsToHtml` / `renderSectionsToPlainText` / `renderSectionsToMarkdown` 三种输出渲染器 + 统一免责声明

## 2. Wizard components

- [x] 2.1 `PrivacyToolWorkspace.tsx`：隐私政策/使用条款分段切换，各自独立 state + localStorage 草稿持久化
- [x] 2.2 步骤指示器（可点击跳回已完成步骤）、必填字段校验（App 名称/邮箱/服务说明）
- [x] 2.3 数据类型/第三方服务复选框网格 + 自定义服务追加行
- [x] 2.4 草稿续接横幅（继续编辑 / 重新开始）
- [x] 2.5 `LegalResultView.tsx`：生成结果预览 + 复制到剪贴板 + 下载 HTML/Markdown

## 3. App integration

- [x] 3.1 `AppHeader.tsx` 新增"隐私与条款"工具标签；隐藏该工具下不适用的撤销/重做/导出 ZIP/左右侧栏折叠按钮
- [x] 3.2 `App.tsx` 新增 `activeTool === 'privacy'` 分支，跳过 `LeftSidebar`/`RightPropertiesPanel`，使用全宽布局渲染 `PrivacyToolWorkspace`
- [x] 3.3 `index.css` 新增 `.app-main.full-bleed` 布局变体与 `.legal-*` 系列样式（含移动端断点）

## 4. Verification

- [x] 4.1 `npx tsc --noEmit` 通过
- [x] 4.2 `npm run build` 通过
- [x] 4.3 新增 Playwright E2E：隐私政策向导分步填写 → 校验必填拦截 → 生成结果 → 下载 HTML → 切换使用条款验证独立状态
- [ ] 4.4 运行 `npx playwright test -g "Privacy Policy wizard"` 完整通过 —— 当前环境缺少 headless Chromium 系统依赖（`libatk-1.0.so.0` 等），需执行 `npx playwright install-deps chromium` 后手动验证

## 5. Gap audit follow-up（对齐同类工具通用结构）

- [x] 5.1 隐私政策新增：Log Data 基线段、Do Not Track 声明、International Data Transfers、Account and Data Deletion（含账号注册开关 + 删除说明字段）、Governing Law 字段与章节、平台选择字段（影响 Introduction 措辞）
- [x] 5.2 使用条款新增：Eligibility（最低年龄字段，默认 13）、Feedback、Indemnification、Severability、Entire Agreement 条款
- [x] 5.3 `loadState` 增加 fallback 合并逻辑，兼容本次新增字段前保存的旧草稿（避免 `undefined.trim()` 崩溃）
- [x] 5.4 E2E 测试新增断言覆盖 Log Data / International Data Transfers / Account and Data Deletion 章节
- [x] 5.5 `npx tsc --noEmit` + `npm run build` 通过
