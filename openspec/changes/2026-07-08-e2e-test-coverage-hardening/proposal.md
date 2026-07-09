## Why

当前 `tests/mockup-app.spec.ts`（单文件、9 个用例）只覆盖了各工具的"happy path"：工作区加载、侧边栏折叠、标题编辑、双机预设 + 设备增删、导出 ZIP 触发、自定义预设增删、撤销/重做、图标生成器上传导出、隐私政策向导生成下载。

对照 `openspec/specs/` 下已归档的 13 个 capability，仍有大片行为完全没有 E2E 覆盖：

- **`advanced-templates`**：背景类型切换（纯色/渐变/图片）、毛玻璃开关、背景高斯模糊滑块——全部未测试。
- **`customization-controls`**：标题/副标题字体切换、设备外壳型号切换——全部未测试。
- **`skew-and-floating`**：2.5D 旋转/倾斜滑块——未测试。
- **`panoramic-background`**：全局全景图上传与跨页切片——未测试。
- **`multi-size-export` / `icon-export`**：现有测试只断言下载文件名，从未打开 ZIP 校验文件夹结构（`/ios/iphone_6.9/`、`AppIcon.appiconset/Contents.json` 等），无法真正验证导出正确性。
- **`privacy-policy-generator`**：只覆盖了 Privacy Policy 主路径一次通过；未测试步骤回退导航、自定义第三方服务、草稿持久化/续写横幅、Terms of Use 完整流程、Markdown 导出与复制到剪贴板。
- **`ui-quality-hardening`**：无任何无障碍或响应式断言——`playwright.config.ts` 只有单一 `chromium` 桌面 project，从未在 <768px 视口下验证侧边栏抽屉化；导出弹窗的 focus trap / Escape 关闭 / `role="dialog"` 也从未断言。
- **`workspace-scaffold`**：主题切换（深色/浅色）从未测试。

此外，所有用例集中在一个文件里，且测试之间共享同一浏览器 `localStorage`（自定义预设、隐私政策草稿），存在跨用例状态泄漏风险，随着用例增多会越来越难维护。

## What Changes

- 按工具/能力域拆分 `tests/` 为多个 spec 文件（screenshots、icons、privacy、advanced-templates、accessibility 等），提取公共 fixture（清空 `localStorage`、上传示例截图等），替代当前的单文件结构。
- 新增 `advanced-templates` 与 `customization-controls` 覆盖：背景类型切换、毛玻璃开关、模糊滑块、字体切换、设备外壳切换。
- 新增 `skew-and-floating`（旋转/倾斜滑块操作画布无报错）与 `panoramic-background`（开启全局全景图后多页背景不同）覆盖。
- 为 `multi-size-export` 与 `icon-export` 增加 ZIP 内容级断言：复用现有依赖 `jszip` 解析下载的 ZIP buffer，校验子文件夹与文件（如 `ios/iphone_6.9/`、`ios/AppIcon.appiconset/Contents.json`、`android/`）真实存在。
- 扩展 `privacy-policy-generator` 覆盖：步骤回退导航、自定义第三方服务录入、草稿持久化续写/重新开始横幅、Terms of Use 完整流程 + Markdown 下载 + 复制到剪贴板。
- 新增无障碍/响应式用例：导出弹窗 `role="dialog"`/焦点陷阱/Escape 关闭、SectionAccordion 的 `aria-expanded`、主题切换、以及新增一个移动视口 Playwright project 验证 <768px 侧边栏抽屉化行为（对应 `ui-quality-hardening` Phase 1/2 验收标准）。
- 每个用例（或 `test.beforeEach`）显式清空 `localStorage`/`context` 存储，避免自定义预设、隐私政策草稿等状态跨用例泄漏。

## Capabilities

### New Capabilities
- `e2e-test-coverage`：定义 Playwright 测试套件应达到的组织方式与覆盖范围要求（本提案新增此能力用于追踪测试基础设施本身，不属于任何单一业务功能）。

### Modified Capabilities
（无——不修改任何业务 capability 的行为，仅新增测试覆盖）

## Impact

- 新增/重组文件：`tests/*.spec.ts`（按域拆分）、`tests/fixtures.ts`（共享 fixture，待实现时确定最终命名）。
- 修改 `playwright.config.ts`：新增一个移动视口 project（如 `Mobile Chrome`，viewport 375×667）。
- 无生产代码 (`src/`) 变更；无新增第三方依赖（ZIP 校验复用已有的 `jszip`）。
- 用例数量与运行时长会增加，`npx playwright test` 的 CI 运行时间需重新评估（可考虑为新增的重量级用例设置合理 `workers`/分片）。
