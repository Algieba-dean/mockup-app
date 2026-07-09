## Why

当前 `privacy-policy-generator` 只覆盖"隐私政策 + 使用条款"两份通用文档，但开发者在 App Store Connect / Play Console 实际提审时还会卡在五个更具体、更容易被机器审核直接拒绝的环节：Apple 隐私营养标签问卷（无法一键导入，纯人工逐项勾选）、账号与数据注销公开页面（Apple 5.1.1(v) 与 Google Play 强制要求的公开 URL）、高风险类别（AI 生成/医疗健康/UGC）App 使用标准 EULA 会被直接拒审、Info.plist/AndroidManifest 权限话术与 ATT 弹窗文案诱导性表述会被机审秒拒、Google Play Data Safety 表单手工填写繁琐易错。这五个环节的输入数据（数据类型、第三方 SDK、是否有账号体系、是否 UGC）与现有 Privacy/Terms 问卷高度重合，理应在同一工具内复用，而不是让开发者再去外部工具重新填一遍。

## What Changes

- 新增第三个分段模式"合规工具箱"（Compliance Toolkit），与现有"隐私政策"/"使用条款"分段并列，不再是分步向导，而是单页勾选列表：自动读取已保存的 Privacy/Terms 草稿（`mockup_app_privacy_wizard`/`mockup_app_terms_wizard`），以五行勾选项（复用现有数据类型勾选网格样式）呈现下述五个产物，默认全部不勾选；勾选任意一项即在原地展开（手风琴）该项的完整内容，其中"Custom EULA"这一项的展开区域内嵌一个新增的单选题"你的 App 属于哪种高风险类型？"（无/AI 生成类/健康医疗类/UGC 社区），其余四项无需额外输入，直接读取已有草稿即时渲染；同时勾选 ≥2 项时，底部出现"打包下载 ZIP"按钮一次性导出所有已勾选产物（复用现有 `jszip` 依赖）。
- **Apple 隐私营养标签 Cheat Sheet**：将已选的数据类型/第三方服务映射为 Apple App Store Connect"App Privacy"问卷的三大类目（用于追踪你的数据 / 与你关联的数据 / 未与你关联的数据）与标准 Purpose 选项，逐项生成"第几步该勾哪个选项"的对照清单（不做 API 自动提交，Apple 未开放该接口）。
- **账号与数据注销说明页**：基于已有 `hasUserAccounts`/`deletionInstructions` 字段，生成一份独立于完整隐私政策的、可单独部署为公开 URL 的极简 HTML 页面，满足 Apple 5.1.1(v) 与 Google Play 账号删除政策的"公开链接"硬性要求。
- **Custom EULA 生成器**：复用新增的高风险类型单选题，在标准 Terms of Use 基础上动态插入 Apple 强制性条款（AI 生成类插入"不对 AI 生成内容准确性负责"声明；健康医疗类插入"不构成专业医疗建议"声明；UGC 类插入"对辱骂/色情内容零容忍及举报-下架-封号机制"条款），并将结果标注为"Custom EULA"（区别于当前的标准 Terms of Use 结果），供开发者直接粘贴到 App Store Connect 的自定义 EULA 字段。
- **ATT 与系统权限话术矩阵**：若 Privacy 问卷第三步已选择广告类第三方服务（如 AdMob）或数据类型含"设备标识符"，自动生成合规的 `NSUserTrackingUsageDescription` 弹窗文案；同时基于已选数据类型（相机/照片/联系人/位置等）生成中英双语的 iOS `Info.plist` 权限键值 + Android `AndroidManifest` 权限话术对照表，供开发者直接复制进代码工程。
- **Google Play Data Safety Form CSV 导出**：复用 Privacy 问卷已选的数据类型与第三方 SDK 勾选结果，按 Google Play 现行 Data Safety 表单的批量导入 CSV 模式映射生成一份 `.csv` 文件，供开发者在 Play Console 后台一键导入（具体列结构需在实现前对照当前 Play Console 官方模板核实，见 design.md 的 Open Questions）。
- **BREAKING**：无——所有改动为新增分段模式与新增数据字段，不修改现有 Privacy Policy / Terms of Use 生成逻辑或字段语义。

## Capabilities

### New Capabilities
- `compliance-toolkit`：合规工具箱分段模式的容器 UI——统一高风险类型问题、跨草稿数据聚合读取、五个子生成器之间的切换与空状态引导。
- `nutrition-label-cheatsheet`：Apple App Store Connect 隐私营养标签问卷填表 Cheat Sheet 生成器。
- `data-deletion-page`：独立部署的账号与数据注销说明页生成器。
- `custom-eula-generator`：基于高风险类型动态插入强制性条款的 Custom EULA 生成器。
- `att-permission-copy-kit`：ATT 追踪弹窗文案 + 中英双语系统权限话术配置表生成器。
- `play-data-safety-csv`：Google Play Data Safety Form 标准 CSV 导出。

### Modified Capabilities
- `privacy-policy-generator`：新增第三个分段模式入口（合规工具箱），原有"两个独立分步向导"的描述扩展为"三个"；新增跨草稿只读数据聚合的能力边界说明，不改变 Privacy Policy / Terms of Use 本身的字段语义或生成逻辑。

## Impact

- 代码：新增 `src/components/ComplianceToolkitWorkspace.tsx`（容器 + 五行勾选/手风琴渲染 + ZIP 打包下载）；`src/utils/legalDocManager.ts` 新增高风险类型字段（`highRiskType`）、隐私营养标签映射表、账号注销页构建函数、Custom EULA 强制条款片段、ATT/权限话术双语文案表、Data Safety CSV 行映射与序列化函数；`src/components/PrivacyToolWorkspace.tsx` 新增第三个分段 Tab 入口及跨草稿数据读取；`src/components/AppHeader.tsx`（如分段控件位置在 Header 则同步更新，否则不涉及）。
- 新增文件：`src/components/ComplianceToolkitWorkspace.tsx`，以及若干子面板组件（可拆分为同文件内的子函数，视实现规模决定是否拆文件）。
- 无新增第三方依赖（CSV/HTML/文案均为字符串拼装，复用现有 `renderSectionsToHtml` 系列模式；ZIP 打包复用现有 `jszip` 依赖，对齐 `icon-export`/`multi-size-export` 的既有打包模式）。
- localStorage：新增一个持久化键（如 `mockup_app_compliance_toolkit`）存储高风险类型选择、五项勾选态等合规工具箱专属字段；不改变现有 `mockup_app_privacy_wizard`/`mockup_app_terms_wizard` 的 schema。
- 测试：需扩展 `tests/` 覆盖合规工具箱的勾选/展开交互（默认全不勾选、勾选即展开、取消勾选即收起）、五个子生成器的数据映射正确性、CSV 格式、EULA 条款动态插入、ZIP 打包内容（≥2 项勾选时的产物完整性）。
- 免责声明：五个产物均基于开发者自填信息生成模板化文本/表格，不构成法律意见，需在 UI 与生成文档中延续现有 `LEGAL_DISCLAIMER` 免责声明模式。
