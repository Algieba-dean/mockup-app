## 1. Data model & mapping functions (legalDocManager.ts)

- [x] 1.1 新增 `HighRiskType` 类型（`'none' | 'ai_generated' | 'health_medical' | 'ugc_community'`）
- [x] 1.2 新增 `buildCustomEulaSections(termsDraft, highRiskType)`：复用 `buildTermsOfUseSections`，按 `highRiskType` 插入 AI/健康医疗/UGC 强制条款，标题渲染为 "Custom End User License Agreement (EULA)"
- [x] 1.3 UGC 条款文案逐项覆盖 Apple Guideline 1.2 四项机制（内容过滤/拉黑/举报/下架封号），人工审阅一遍措辞
- [x] 1.4 新增 `NUTRITION_LABEL_MAPPING`（实现为 `DEFAULT_PURPOSES`）常量表 + `buildNutritionLabelRows(privacyDraft)`：按广告类服务/`hasUserAccounts` 判定三大类目，输出结构化行数组
- [x] 1.5 新增 `buildAccountDeletionSections(privacyDraft)`：复用 `hasUserAccounts`/`deletionInstructions`，输出独立 `DocSection[]`（标题 "Account and Data Deletion"）
- [x] 1.6 新增 `PERMISSION_COPY_MATRIX` 常量表（数据类型 → iOS key / Android permission / 中英文案）+ `buildPermissionMatrix(privacyDraft)`
- [x] 1.7 新增 ATT 判定逻辑：`shouldShowAttPrompt(privacyDraft)`（`device_id` 且命中广告/归因分组）+ 固定合规双语文案常量 `ATT_PROMPT_COPY`
- [x] 1.8 新增 `buildDataSafetyRows(privacyDraft)` + `toDataSafetyCsv(rows)` 通用序列化工具
- [x] 1.9 已在 `DATA_SAFETY_CSV_COLUMNS` 上方标注列结构为最佳猜测且需在实际导入前对照 Play Console 当前模板核实（未接入真实 Play Console 校验，因无网络访问权限验证官方最新模板——已在 UI 与代码注释中显式标注为待人工核实的假设）
- [x] 1.10 为 1.4/1.6/1.8 的输出新增 `renderNutritionLabelRowsToMarkdown`/`buildPermissionMatrixMarkdown`（ComplianceToolkitWorkspace.tsx 内）等自定义渲染函数，供复制到剪贴板使用

## 2. Compliance Toolkit shell (ComplianceToolkitWorkspace.tsx)

- [x] 2.1 新建 `src/components/ComplianceToolkitWorkspace.tsx`：改为由 `PrivacyToolWorkspace.tsx` 以 props 形式传入实时 `privacyDraft`/`termsDraft`（比重新读取 localStorage 更准确，避免 300ms 防抖写入窗口内的读写竟态），而非自行重复读取两个 storage key
- [x] 2.2 新增本地状态与持久化键 `mockup_app_compliance_toolkit`：`{ highRiskType, checked: Record<RowId, boolean> }`，默认 `checked` 全 `false`
- [x] 2.3 渲染五行勾选列表（复用 `.legal-checkbox-grid` 同源设计新增 `.compliance-checklist` 样式），每行勾选框兼作手风琴开关
- [x] 2.4 勾选态变化时同步更新 `checked` 并持久化（300ms 防抖写入，对齐现有向导的持久化频率）
- [x] 2.5 每行展开区域的公共骨架组件：标题 + 一行说明文案 + （空草稿态）引导提示条 `legal-resume-banner` 样式 + 内容区 + 操作行
- [x] 2.6 空状态判断：两个前置草稿均为空（复用迁移到 `legalDocManager.ts` 的 `isNonEmptyDraft`）时，任意勾选展开显示引导文案 + 跳转按钮，不渲染生成/下载操作

## 3. Custom EULA row

- [x] 3.1 展开区域顶部内嵌高风险类型单选题（无/AI 生成类/健康医疗类/UGC 社区），选中态即时触发预览重渲染
- [x] 3.2 调用 `buildCustomEulaSections` 渲染文档预览（新增 `DocPreview` 组件，轻量复用同样排版）
- [x] 3.3 复制到剪贴板 / 下载 HTML（`custom-eula.html`）/ 下载 Markdown 操作按钮，复用 `renderSectionsToHtml/Markdown/PlainText` 与 toast 模式

## 4. ATT & 权限话术矩阵 row

- [x] 4.1 展开区域内判定 `shouldShowAttPrompt`：为真时展示双语 ATT 弹窗文案；为假时展示"无需 ATT"说明文案，不展示空表格
- [x] 4.2 渲染权限矩阵表格（数据类型人可读标签 → iOS key / Android permission / 中英文案，未选任何需要权限的数据类型时提示提示文而非空表格）
- [x] 4.3 "复制 Info.plist 片段"按钮：拼装 `<key>...</key><string>...</string>` XML 片段并复制（无可用数据时按钮 disabled）
- [x] 4.4 "复制 Android 权限片段"按钮：拼装 AndroidManifest 权限声明注释块并复制（无可用数据时按钮 disabled）

## 5. 隐私营养标签 Cheat Sheet row

- [x] 5.1 渲染 Cheat Sheet 表格（Data Type / Apple Category / Suggested Purpose(s)）
- [x] 5.2 顶部固定免责提示："Apple 未开放隐私标签 API，无法一键导入；请以 App Store Connect 最新问卷界面为准"
- [x] 5.3 复制到剪贴板（纯文本表格）/ 下载 Markdown 操作按钮（无数据时按钮 disabled）

## 6. 账号与数据注销页 row

- [x] 6.1 展开区域顶部展示公开 URL 要求的说明文案（引用 Apple 5.1.1(v) 与 Google Play 政策）
- [x] 6.2 渲染独立预览（复用 `renderSectionsToHtml`，标题 "Account and Data Deletion"）
- [x] 6.3 下载 HTML（`account-deletion.html`）操作按钮

## 7. Google Play Data Safety CSV row

- [x] 7.1 渲染已映射的 Data Safety 行预览（表格形式：数据类型 / 是否收集 / 是否共享 / 用途）
- [x] 7.2 顶部展示"请对照最新 Play Console 模板核对列名"免责提示
- [x] 7.3 下载 CSV（`data-safety.csv`）操作按钮（无数据时按钮 disabled）

## 8. Bundled ZIP download

- [x] 8.1 勾选行数 ≥2 时，在勾选列表底部渲染"打包下载 ZIP（已选 N 项）"按钮
- [x] 8.2 点击时用现有 `jszip` 依赖，收集当前已勾选行各自的文件内容，打包为单个 `compliance-toolkit.zip` 并触发下载
- [x] 8.3 勾选行数 ≤1 时隐藏该按钮

## 9. Workspace integration

- [x] 9.1 `PrivacyToolWorkspace.tsx` 的 `Mode` 类型扩展为 `'privacy' | 'terms' | 'compliance'`，新增分段控件第三个选项"合规工具箱"
- [x] 9.2 切换到 `compliance` 模式时渲染 `ComplianceToolkitWorkspace`（传入 `privacyState.draft`/`termsState.draft`），不影响另外两个模式的既有状态
- [x] 9.3 空状态引导按钮跳转回 `privacy` 模式（`onJumpToPrivacy` 回调切换 `Mode`）

## 10. Accessibility & responsive pass

- [x] 10.1 勾选行使用原生 `<input type="checkbox">` + 关联 `<label>`，展开/收起区域用 `aria-expanded`/`aria-controls` 关联
- [x] 10.2 高风险类型单选题用原生 `<input type="radio">` 分组（`<fieldset><legend>`），键盘可达
- [x] 10.3 展开动画依赖 `index.css` 已有的全局 `prefers-reduced-motion: reduce` 规则（对 `*` 统一将 `animation-duration` 降为 0.01ms），无需额外专项规则
- [x] 10.4 表格包裹 `.compliance-table-wrap { overflow-x: auto }` 处理横向滚动；勾选行整行 label 可点击，触摸目标足够大

## 11. Test coverage

- [x] 11.1 Playwright：默认打开合规工具箱时五项均未勾选，勾选/取消勾选触发展开/收起
- [x] 11.2 Playwright：多项同时勾选时各自独立展开、互不影响（“数据复用”测试中同时勾选 ATT/隐私营养标签/EULA 三行）
- [x] 11.3 Playwright：Custom EULA 高风险类型单选切换后，预览文本包含对应强制条款关键词
- [x] 11.4 Playwright：勾选 ATT 行时，验证命中广告 SDK 时展示合规 ATT 文案
- [x] 11.5 Playwright：两个前置草稿为空时，勾选任意行展示引导文案且不出现下载按钮
- [x] 11.6 Playwright：勾选 ≥2 项出现 ZIP 打包按钮且按钮文本显示正确数量，下载后用 `jszip` 解析断言包含对应文件；勾选 1 项时按钮不出现
- [x] 11.7 Playwright：刷新页面后勾选状态被正确恢复
- [ ] 11.8 单元测试：本项未执行——项目当前仅配置了 Playwright E2E（`package.json` 无 vitest/jest），未引入新的单元测试框架；相关纯函数已通过 11.1-11.7 的 Playwright 用例间接覆盖（如需严格单元测试需先征得用户同意引入新依赖）

## 12. Verification

- [ ] 12.1 `npx tsc -b` ——本次改动涉及的三个文件（`legalDocManager.ts`/`ComplianceToolkitWorkspace.tsx`/`PrivacyToolWorkspace.tsx`）已用独立的 `tsc --noEmit` 隔离核实无类型错误（0 errors）；但项目级 `npx tsc -b` 当前因 `src/utils/canvasManager.ts`（非本次改动涉及、存在未提交的其他改动）的括号不匹配语法错误而整体失败，需先由该文件的改动者修复后才能跑通全量构建。注：该文件的语法问题不影响 Vite dev server 实际运行（12.3 已在其上验证通过），只阻塞 `tsc -b`/生产构建
- [x] 12.2 `npx oxlint` 通过（0 errors；331 项警告均位于 `.github/skills` 第三方脚本目录，与本次改动无关）
- [x] 12.3 `npx playwright test` 全量通过新增的 3 个 Compliance Toolkit 用例（空状态引导/数据复用 ATT+隐私营养标签+EULA/ZIP 打包阈值+刷新持久化，均绿），且未在现有用例上引入新的失败；全量套件仅有 1 个预置失败（`should apply preset layout and manage multiple devices`），该用例在本次改动前已存在于 `test-results/` 目录快照中，与设备混排功能相关、与本次隐私合规工具箱改动无关
- [ ] 12.4 手动核对生成的 `data-safety.csv` 可在当前 Google Play Console 界面成功导入（或至少列结构与官方模板逐列比对一致）——需要人工访问 Play Console 核实，无法在当前环境自动化验证
