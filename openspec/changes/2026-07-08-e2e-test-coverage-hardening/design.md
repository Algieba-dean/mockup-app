## Context

`tests/mockup-app.spec.ts` 是唯一的 Playwright 测试文件，随着覆盖范围从"截图工具"扩展到"图标生成器"和"隐私政策生成器"，文件已增长到 242 行、9 个用例。继续在单文件中追加新覆盖（背景/字体/设备/全景图/无障碍/响应式等）会让文件难以浏览和维护，且用例间共享同一个浏览器 `localStorage`，存在状态泄漏风险。

## Goals / Non-Goals

**Goals:**
- 建立可扩展的测试文件组织方式，按能力域拆分。
- 补齐 `openspec/specs/` 中已记录但从未被 E2E 验证的行为。
- 让导出类测试真正验证产物内容（ZIP 结构），而不仅仅是文件名。
- 用最小成本验证 `ui-quality-hardening` 的响应式与无障碍验收标准（新增一个移动视口 project，而非引入新的可视化回归工具）。

**Non-Goals:**
- 不引入视觉回归测试（截图比对）——现有工具链（Playwright + 手工 impeccable 审计）已覆盖视觉质量，视觉回归成本收益比在当前阶段不划算。
- 不引入 axe-core 等自动化无障碍扫描库——先用针对性的 DOM 属性断言（`role`、`aria-*`）覆盖已知验收标准，避免新增依赖和噪音发现。
- 不修改任何 `src/` 业务代码或渲染逻辑。

## Decisions

- **按能力域拆分测试文件，而非按用户旅程**
  - *原因*：`openspec/specs/` 已经是按 capability 组织的权威索引，测试文件与之对齐（如 `advanced-templates.spec.ts`、`icon-export.spec.ts`）能让"新增/修改某 capability 时应更新哪个测试文件"一目了然。
  - *替代方案*：保持单文件——排除，可维护性随用例数量增长会持续恶化。

- **ZIP 内容校验复用 `jszip`（已是生产依赖），在测试里对 `download.path()` 读取的 buffer 做 `JSZip.loadAsync`**
  - *原因*：`jszip` 已经被 `src/utils` 用于打包导出，测试直接复用无需新增依赖；相比只断言 `suggestedFilename()`，解析 ZIP entry 列表能真正验证 `multi-size-export`/`icon-export` 的子文件夹与 `Contents.json` 是否存在。
  - *替代方案*：`adm-zip`——功能重复，且会新增一个仅测试环境使用的依赖。

- **新增一个移动视口 Playwright project，而不是在每个 `test` 内手动 `setViewportSize`**
  - *原因*：`playwright.config.ts` 的 `projects` 机制原生支持按 viewport 矩阵重跑指定测试文件（通过 `testMatch`），比在业务用例里穿插 `setViewportSize` 更清晰，也方便未来扩展平板断点。
  - *替代方案*：单一 project 内混用视口切换——排除，容易与其他用例的假设（桌面侧边栏可见）冲突。

- **用 `test.beforeEach` 清空 `localStorage`（`page.addInitScript` 或 `context.clearCookies()` + `evaluate(() => localStorage.clear())`）实现测试隔离**
  - *原因*：自定义预设 (`custom-preset-card`) 与隐私政策草稿都持久化在 `localStorage`；不清空会导致某个用例遗留的数据影响后续用例的断言（例如草稿续写横幅的"首次访问应无横幅"场景）。

## Risks / Trade-offs

- **[Risk] 用例数量增加导致 CI 运行时间变长**
  - *Mitigation*：`fullyParallel: true` 已开启；如后续实测时间过长，可按 project/文件维度分片（Playwright 原生支持 `--shard`）。
- **[Risk] ZIP 内容断言对导出实现细节耦合较紧（文件夹命名、Contents.json 字段）**
  - *Mitigation*：断言聚焦在 `openspec/specs/multi-size-export`、`icon-export` 中已写明的稳定契约（子文件夹路径、`Contents.json` 存在性），不断言像素级图像内容。
