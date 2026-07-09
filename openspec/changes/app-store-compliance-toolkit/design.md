## Context

`privacy-policy-generator` 目前由 `src/components/PrivacyToolWorkspace.tsx`（两个分步向导：Privacy Policy / Terms of Use，各自独立持久化到 `mockup_app_privacy_wizard`/`mockup_app_terms_wizard`）与 `src/utils/legalDocManager.ts`（数据目录 `DATA_TYPE_CATALOG`/`SERVICE_CATALOG`、草稿类型 `PrivacyDraft`/`TermsDraft`、纯函数 `buildPrivacyPolicySections`/`buildTermsOfUseSections`、多格式渲染 `renderSectionsToHtml/PlainText/Markdown`）组成，全部纯前端字符串拼装，无网络/AI 调用。结果页 `LegalResultView.tsx` 提供复制/HTML/Markdown 三种导出方式。本次新增五个"App Store/Play 后台提审专项"产物，均是对已收集数据的**二次映射**，不新增数据采集入口（除一个高风险类型单选题），因此优先复用现有架构而非引入新状态管理方案。

## Goals / Non-Goals

**Goals:**
- 合规工具箱作为只读/轻写的"聚合层"，从两个既有向导的 `localStorage` 草稿中读取数据，不重复采集已问过的信息。
- 五个子生成器各自是纯函数（输入 draft，输出字符串/结构化数据），可独立单元测试，不依赖 React 状态。
- 新增字段（`highRiskType`）与既有 `TermsDraft`/`PrivacyDraft` 字段解耦，存放在独立的合规工具箱专属状态里，避免污染已验收的两个向导 schema。
- 复用现有导出模式（复制到剪贴板 / 下载文件），CSV 导出复用 `downloadBlob` 思路新增 `text/csv` MIME。

**Non-Goals:**
- 不对接 App Store Connect / Play Console 官方 API 做自动提交或一键导入（Apple 未开放隐私标签 API；Google Play 的 Data Safety 导入是人工上传 CSV，无公开写 API）。
- 不做法律合规校验或多法域自动判定——所有输出仍是模板化文本，需用户自行核对（沿用现有 `LEGAL_DISCLAIMER` 免责声明）。
- Custom EULA 不做与标准 Terms of Use 的完全分叉维护；复用 `buildTermsOfUseSections` 的既有条款并在其基础上追加/替换高风险专属条款，避免两套文案漂移。
- 不做真实设备权限检测；权限矩阵仅基于用户在 Privacy 问卷勾选的数据类型做静态映射。

## Decisions

### 1. 合规工具箱作为第三个分段模式，聚合读取而非重新问卷
`PrivacyToolWorkspace.tsx` 的 `Mode` 类型从 `'privacy' | 'terms'` 扩展为 `'privacy' | 'terms' | 'compliance'`。合规工具箱模式渲染新组件 `ComplianceToolkitWorkspace`，通过 `loadState` 同款工具函数只读读取 `mockup_app_privacy_wizard`/`mockup_app_terms_wizard`（不新增写入两者的路径），新增的 `highRiskType` 单选题与其他工具箱专属字段存入新键 `mockup_app_compliance_toolkit`。
- **原因**：五个新产物的核心输入（数据类型、第三方服务、账号体系、UGC）已经在两个向导里问过；重新问一遍会造成"两处真相"和用户重复劳动。只读聚合保证单一数据源。
- **空状态**：若两个向导均未产生任何非空草稿（复用现有 `isNonEmpty` 判断），工具箱在勾选列表上方显示引导文案"请先完成隐私政策或使用条款问卷"并提供跳转按钮；勾选项本身不禁用，勾选后展开区域内展示同样的引导文案而非生成空洞文档（与"不适用"态复用同一种提示样式，见 Decision #1a）。
- **替代方案**：把五个产物拆进现有两个向导的"生成结果"步骤末尾——已排除，因为部分产物（如 Data Safety CSV）同时需要 Privacy 与 Terms 的字段，塞进单一向导会造成职责混乱；独立聚合层更清晰。

### 1a. 交互形态：勾选列表 + 手风琴展开，默认全不勾选，非固定导航栏/子标签
经与用户讨论排除了"左侧固定导航栏"和"顶部子标签"两种方案（详见本次对话前置的交互设计讨论），最终确定：五个产物以一个扁平勾选列表呈现（复用现有 `.legal-checkbox-grid`/单列勾选行样式），**默认全部不勾选**（不做智能预勾选猜测）。勾选框本身兼作手风琴展开开关——勾上的瞬间该行原地展开，显示（如有）补充问题 + 实时预览 + 复制/下载操作按钮；取消勾选则收起为一行纯文字，不占视觉空间。
- **原因**：用户明确指出"只想做某一个或几个时也不会有问题"是核心诉求——固定导航栏/子标签会让所有用户被迫看到全部 5 项（包括与自己 App 无关的，如非 UGC 应用也要划过 EULA 高风险页），而勾选驱动的手风琴让无关项始终收起，零干扰。
- **默认不勾选而非智能预勾选**：用户明确排除了"检测到广告 SDK 自动勾 ATT"之类的智能预选，选择让用户自己主动判断每一项是否适用，避免"看起来系统已经帮我选好了"的错误安全感。
- **勾选即实时展开而非"先勾选后统一生成"**：与现有 Privacy/Terms 向导"改字段即时重绘预览"的心智模型保持一致（`design.md` Goals 中的"复用现有单一 `useState` 集合 + 即时重绘"模式），用户勾选的瞬间就能看到最终产物，无需额外的"生成"提交步骤。
- **Custom EULA 的高风险类型单选题内嵌位置**：就近放在"Custom EULA"这一行展开区域的顶部，而不是作为全局设置固定在页面顶部——因为该问题只影响这一个产物，全局放置会让其余 4 个无关产物的展开区域也一直看到这个控件，违反极简克制原则。

### 1b. 打包下载：勾选 ≥2 项时提供 ZIP 打包，复用现有 `jszip` 依赖
当用户勾选的项目数量 ≥2 时，勾选列表底部出现一个"打包下载 ZIP"按钮，点击后用项目已有的 `jszip` 依赖（`icon-export`/`multi-size-export` 已在使用）将当前已勾选项各自的文件产物（如 `custom-eula.html`、`account-deletion.html`、`permission-matrix.md`、`nutrition-label-cheatsheet.md`、`data-safety.csv`）打包进一个 ZIP 一次性下载，文件命名对齐各自的独立下载文件名。
- **原因**：勾选驱动模型天然支持"只要几项"的场景，但当用户确实想要多项时（如提审前一次性收集所有材料），逐个点击 5 次下载不如一次打包方便；复用现有 ZIP 依赖不引入新的第三方库。
- **不做**：仅勾选 1 项时不展示打包按钮（单文件下载已经是最简路径，打包反而多一步）。

### 2. 高风险类型单选题：新字段 + 动态条款片段拼装，不分叉 Terms 构建函数
`legalDocManager.ts` 新增：
```ts
type HighRiskType = 'none' | 'ai_generated' | 'health_medical' | 'ugc_community';
```
新增 `buildCustomEulaSections(termsDraft: TermsDraft, highRiskType: HighRiskType): DocSection[]`，内部调用既有 `buildTermsOfUseSections(termsDraft)` 得到基线条款数组，再按 `highRiskType` 在返回数组的合适位置（如 "User-Generated Content" 之后）插入/替换对应的强制性免责或封号条款段落，最终整体标题渲染为"Custom End User License Agreement (EULA)"而非"Terms of Use"。
- **原因**：Apple 的 Custom EULA 本质是"以 Terms of Use 为基底 + 特定行业强制条款"，复用基线条款函数避免重复维护 Eligibility/Indemnification/Severability 等通用条款两套文案。
- **UGC 条款内容**：需同时满足 Apple Guideline 1.2（Safety - User Generated Content）的四项机制：内容过滤/举报机制、拉黑辱骂用户的能力、快速下架被举报内容、驱逐违规用户的方法——条款文案需逐项覆盖这四点，不能只写"零容忍"一句空话。
- **替代方案**：让用户在 Terms 向导里直接选高风险类型，混入现有 `hasUGC`/`hasSubscriptions` 复选框列表——已排除，因为该问题的语义是"互斥单选"（App 只属于其中一种高风险类别或不属于），与现有独立复选框的"可多选叠加"语义不同，混在一起会误导用户以为可以多选。

### 3. 隐私营养标签 Cheat Sheet：静态映射表 + 分步对照 UI，非 PDF/图片
新增映射表 `NUTRITION_LABEL_MAPPING: Record<DataTypeId, { category: 'tracking' | 'linked' | 'not_linked'; purposes: string[] }>`，其中 `category` 的判定规则：若该数据类型关联的第三方服务里包含广告/归因类（`SERVICE_CATALOG` 的"广告 / 归因"分组），则标记为 `tracking`；否则若 `hasUserAccounts` 为真则 `linked`，否则 `not_linked`。渲染为一个"App Store Connect 问卷第几步 → 该勾哪个选项"的对照表格（纯文本/HTML 表格，可复制），而不是生成 PDF 或截图。
- **原因**：Apple 官方从未公开过写 API，且他们的问卷界面经常调整措辞，生成静态图片/PDF 反而容易与最新界面文案不一致；纯文本对照表让用户照着填、且方便随 Apple 界面变化自行核对更新。
- **风险**：Apple 的实际问卷分类比这里的简化三分类更细（还有具体 Purpose 子选项、是否可选关闭等），已在 Risks 中列出需要人工复核的免责声明。

### 4. 账号与数据注销页：独立 HTML 文件，非完整隐私政策的一个章节
新增 `buildAccountDeletionPage(draft: PrivacyDraft): DocSection[]` + 复用现有 `renderSectionsToHtml` 生成一份**独立**、精简的单页 HTML（标题"Account and Data Deletion"），区别于完整隐私政策里已有的同名章节（`buildPrivacyPolicySections` 中的 "Account and Data Deletion" section，见 `@/home/algieba/project/mockup-app/src/utils/legalDocManager.ts:396-407`）。
- **原因**：Apple 5.1.1(v) 与 Google Play 账号删除政策要求的是一个**独立可公开访问的 URL**，不是隐私政策文档里的一段话；很多开发者误以为隐私政策里提到了就够，实测会被要求单独提供链接。生成独立精简页面降低"部署单页 HTML 到静态托管"的门槛。
- **内容来源**：直接复用 `hasUserAccounts`/`deletionInstructions` 字段，无需新增输入。

### 5. ATT + 权限话术矩阵：双语静态词表 + 条件触发
新增权限映射表 `PERMISSION_COPY_MATRIX: Record<DataTypeId, { iosKey?: string; androidPermission?: string; zh: string; en: string }>`（如 `photos` → `NSPhotoLibraryUsageDescription` / `READ_MEDIA_IMAGES`）。ATT 文案单独处理：当 `draft.dataTypes.includes('device_id')` 且 `draft.services` 命中"广告 / 归因"分组任一项时，展示一段固定的合规 `NSUserTrackingUsageDescription` 双语文案模板（说明用途为"个性化广告"，不含诱导性表述如"帮助我们改善服务，请允许"）。
- **原因**：Apple 机审对权限话术的核心红线是"必须说明具体用途 + 不能诱导点击同意"，固定的合规模板文案比让用户自由填写更保险；仅在检测到广告 SDK 时才展示 ATT 文案，避免误导没有追踪行为的 App 也去申请 ATT。
- **导出形式**：表格形式支持复制整段（Info.plist 风格的 `<key>...</key><string>...</string>` 片段 + AndroidManifest 权限声明注释），供开发者直接粘贴进 Xcode/Android Studio 工程，不生成完整可运行的 plist/manifest 文件（避免覆盖用户工程里的其他既有键值）。

### 6. Data Safety CSV：结构化行数组 + CSV 序列化，列结构留待实现前核实
新增 `buildDataSafetyRows(draft: PrivacyDraft): DataSafetyRow[]`，将已选 `dataTypes` + `services` 映射为若干行（每行大致对应"数据类型 / 是否收集 / 是否与第三方共享 / 用途 / 是否可选"），再用一个通用 `toCsv(rows, columns)` 工具序列化为 CSV 字符串并下载。
- **风险/待办**：Google Play Console 的 Data Safety CSV 批量导入模板的**确切列名与顺序**会随 Play Console 界面迭代变化，本设计不在此处假设固定列结构；实现阶段第一个任务必须是从 Play Console 官方帮助文档/实际导出一份空模板核实当前列结构，再据此调整 `columns` 常量，避免生成"看起来像 CSV 但导入报错"的产物。

## Risks / Trade-offs

- **[Risk] Apple/Google 官方问卷界面与本工具的映射规则随时间漂移，导致 Cheat Sheet / CSV 列结构过时**
  - *Mitigation*：所有输出页面/文档顶部固定展示"生成于 {日期}，请核对 App Store Connect / Play Console 最新界面为准"的免责声明；`NUTRITION_LABEL_MAPPING`/CSV 列结构常量集中定义在 `legalDocManager.ts` 顶部，未来仅需修改常量表而非渲染逻辑。
- **[Risk] Custom EULA 的高风险条款文案不够"逐项覆盖 Apple Guideline 1.2 的四项机制"，仍可能被拒审**
  - *Mitigation*：UGC 条款文案编写时逐条对照 Apple Guideline 1.2（过滤/举报/下架/封号四项），并在 design 阶段由人工审阅一遍；生成结果页明确标注"这是模板起点，需按你的实际社区管理机制调整"。
- **[Risk] Data Safety CSV 列结构假设错误导致用户导入失败**
  - *Mitigation*：见 Decisions #6，实现前置任务为核实官方模板；CSV 导出附带一行使用说明（如"如导入失败，请对照 Play Console 最新模板核对列名"）。
- **[Risk] 合规工具箱在两个向导草稿为空时生成空洞或误导性文档**
  - *Mitigation*：见 Decisions #1 的空状态引导；勾选任意一项展开后若前置草稿为空，展开区域内只展示引导文案与跳转按钮，不渲染生成/下载按钮。
- **[Risk] 勾选态本身若不持久化，用户刷新页面后需要重新勾选，体验割裂**
  - *Mitigation*：五项的勾选/展开状态一并存入 `mockup_app_compliance_toolkit`（与 `highRiskType` 同一个键），刷新后恢复上次的勾选与展开状态，而不仅仅是恢复 `highRiskType`。
- **[Risk] ATT 文案误判——用户选了 `device_id` 但服务里的第三方并非广告类（如仅用于风控）**
  - *Mitigation*：判定条件同时要求命中"广告 / 归因"分组（见 Decisions #5），降低误判率；仍在文案旁提示"仅当你的 App 确实用于跨 App/网站追踪广告时才需要 ATT 弹窗"。

## Migration Plan

- 新增 localStorage 键 `mockup_app_compliance_toolkit`，全新键无迁移负担；不存在则视为默认值（`highRiskType: 'none'`，五项勾选态全部为 `false`）。
- 不修改 `mockup_app_privacy_wizard`/`mockup_app_terms_wizard` 现有 schema，两个既有向导的读写逻辑零改动，仅新增只读消费方。
- `legalDocManager.ts` 的新增导出函数均为纯新增，不修改现有函数签名，回滚代码版本不影响既有两个向导的可用性。

## Open Questions

- Data Safety CSV 的确切官方列结构需要在进入 `tasks.md` 执行阶段之前，由实现者对照当前 Play Console"数据安全"页面的官方导入模板核实一遍（本设计文档不假设具体列名，避免传递错误的确定性）。
- 隐私营养标签 Cheat Sheet 是否需要覆盖 Apple 三大类目下更细的 Purpose 子选项（如"App 功能" vs "分析" vs "第三方广告"的组合勾选规则）——本次先做粗粒度三分类 + 常见 Purpose 标注，细化规则留作后续提案的开放问题。
- Custom EULA 的四项高风险类型是否需要支持"多选叠加"（如同时是 AI 生成 + 健康类）——本次按用户需求做单选，若后续反馈需要组合类型再扩展。
