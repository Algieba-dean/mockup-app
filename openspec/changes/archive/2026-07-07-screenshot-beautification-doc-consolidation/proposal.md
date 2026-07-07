## Why

商店截图美化（Screenshots）工具历经 4 批次迭代（`scaffold-base-app`、`panoramic-and-floating-mockups`、`editor-features-upgrade`、`ui-quality-hardening`）后，已经拥有 9 个独立的 spec capability。其中 7 个（`screenshot-canvas`、`device-mix`、`multi-size-export`、`panoramic-background`、`skew-and-floating`、`advanced-templates`、`customization-controls`）的 `## Purpose` 仍是归档时自动生成的占位符（"TBD - created by archiving change X. Update Purpose after archive."），且没有任何索引文档说明这些能力如何组合成完整的截图美化流水线（导入 → 画布渲染 → 定制 → 多设备/多页 → 导出）。

这导致：
- 新贡献者/审查者难以快速理解截图工具的完整能力边界。
- 后续 OpenSpec 提案容易与已有能力重复或冲突（例如已发生过的 `advanced-templates` 与 `customization-controls` 均涉及画布渲染状态）。
- 无法一眼看出哪些能力仍缺少验收标准（相比 `ui-quality-hardening`、`screenshot-tool-completeness` 这类写得详尽的 spec）。

## What Changes

- 为以下 7 个占位 Purpose 的 capability 补全真实的 `## Purpose` 描述：`screenshot-canvas`、`device-mix`、`multi-size-export`、`panoramic-background`、`skew-and-floating`、`advanced-templates`、`customization-controls`。
- 新增主索引文档 `openspec/specs/README.md`，按"导入 → 画布渲染 → 定制 → 多设备/多页布局 → 导出 → 质量与完整性"的流水线阶段，将全部 10 个 capability（含 `ui-quality-hardening`、`workspace-scaffold`、`screenshot-tool-completeness`）分类列出并附一句话说明与文件链接。
- 在存在依赖/重叠关系的 capability 之间加入交叉引用（例如 `advanced-templates` 注明其与 `customization-controls` 共同修改 `canvasManager.ts` 渲染状态）。
- 本提案为纯文档变更，不修改任何源代码或运行时行为。

## Capabilities

### New Capabilities
（无——纯文档整理）

### Modified Capabilities
- `screenshot-canvas`：补全 Purpose。
- `device-mix`：补全 Purpose。
- `multi-size-export`：补全 Purpose。
- `panoramic-background`：补全 Purpose。
- `skew-and-floating`：补全 Purpose。
- `advanced-templates`：补全 Purpose，标注与 `customization-controls` 的交叉依赖。
- `customization-controls`：补全 Purpose，标注与 `advanced-templates` 的交叉依赖。

## Impact

- 无代码/运行时影响。
- 提升 `openspec/specs/` 目录的可发现性与可维护性，方便未来提案复用现有能力描述而非重复造轮子。
