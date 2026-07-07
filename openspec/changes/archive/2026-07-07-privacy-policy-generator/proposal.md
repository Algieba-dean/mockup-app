## Why

开发者在 MockupApp 完成截图/图标素材后，仍需离开应用去外部工具（如 `app-privacy-policy-generator.firebaseapp.com`）生成上架所需的隐私政策与使用条款，打断了"一站式上架素材生成"的工作流。参考该类工具的分步向导体验，在 MockupApp 内新增一个独立工具标签，覆盖隐私政策与使用条款两套完整生成流程。

## What Changes

- 新增顶部导航"隐私与条款"独立工具标签（与商店截图/图标生成/文案助手并列），采用跳出 3 栏画布工作区范式的全宽单栏页面。
- 工具内以分段控件切换"隐私政策 / 使用条款"两个子生成器，各自拥有独立的分步向导状态与 localStorage 草稿持久化，互不干扰。
- 隐私政策向导：App/公司信息 → 数据收集类型（11 类 + 自定义） → 第三方服务（8 大类 ~30 项 + 自定义追加） → 合规选项（GDPR/CCPA/COPPA + 数据保留期限） → 生成结果。
- 使用条款向导：App/公司信息 → 服务说明 → 用户条款（账号/UGC/订阅开关） → 管辖权 → 生成结果。
- 生成结果为纯前端字符串模板拼装（无网络/AI 调用），支持复制到剪贴板、下载 HTML、下载 Markdown 三种产出方式。
- 步骤指示器支持点击已完成步骤跳回编辑；草稿检测到未完成时显示"继续编辑/重新开始"横幅。
- 生成文档语言为英文（面向 App Store Connect / Play Console 审核与终端用户的通用预期），向导界面文案保持中文，与应用其余部分一致。

## Capabilities

### New Capabilities
- `privacy-policy-generator`：隐私政策与使用条款分步向导工具，覆盖数据收集、第三方服务披露、合规选项配置、文档生成与多格式导出的完整流程。

### Modified Capabilities
（无）

## Impact

- 新增文件：`src/utils/legalDocManager.ts`（数据目录 + 文档拼装/渲染逻辑）、`src/components/PrivacyToolWorkspace.tsx`（向导容器与两套步骤表单）、`src/components/LegalResultView.tsx`（结果预览与导出操作）。
- 修改文件：`src/App.tsx`（新增 `activeTool === 'privacy'` 分支，全宽布局跳过左右侧栏）、`src/components/AppHeader.tsx`（新增工具标签，隐藏该工具下不适用的撤销/重做/导出 ZIP/侧栏折叠按钮）、`src/index.css`（新增 `.legal-*` 样式与 `.app-main.full-bleed` 布局变体）。
- 不影响现有"商店截图"、"图标生成"、"文案助手"工具的行为与状态。
- 生成的法律文档模板附带免责声明（非法律意见，建议发布前核实第三方链接并咨询专业顾问），第三方服务清单中的隐私政策链接基于公开可查的官方域名，个别链接可能随第三方站点改版失效，属已知限制。
