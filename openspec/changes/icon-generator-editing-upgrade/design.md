## Context

图标生成器（`icon-generator`/`icon-export`）目前是"上传单图 → 内边距/背景色滑块 → 平台预览 → 导出 ZIP"的线性流程，所有渲染集中在 `src/utils/iconManager.ts` 的 `renderIconFrame`/`buildIconZip`，状态集中在 `src/App.tsx` 的 `icon*` 一组 `useState`，并整体持久化到 `localStorage` 的 `mockup_app_icon_state` 键。本次改动在这个既有架构内新增六项能力，不引入新的渲染框架或状态管理库。

## Goals / Non-Goals

**Goals:**
- 在不破坏现有 `iconPadding`/`iconBgColor`/`iconHasAlpha`/`iconForegroundScale` 语义的前提下，新增内容定位（offset+scale）、渐变背景、历史方案、导出指引、隐私提示、SVG 容器六项能力。
- 所有新状态复用现有的"单一 `useState` 集合 + `useEffect` 防抖持久化"模式，保持代码风格一致。
- 新交互（拖拽/滚轮）不依赖新的第三方库（原生 Pointer Events + Canvas 2D API 足够）。

**Non-Goals:**
- 不实现 AI 生成相关能力（本次提案范围外）。
- 不做真矢量 SVG（路径提取/描摹）；SVG 导出仅为位图容器包装。
- 不做渐变角度自定义、多段渐变、图案/纹理背景——固定 135° 双色线性渐变。
- 不迁移到 IndexedDB；历史记录沿用 `localStorage`（与现有自定义预设一致），暂不做容量硬限制。

## Decisions

### 1. 内容定位：Canvas 内 Pointer Events 拖拽 + wheel/pinch 缩放，独立状态字段
新增 `iconOffsetX`/`iconOffsetY`（像素，相对 512 基准画布）与 `iconContentScale`（0.5–2.0 倍率）三个状态，与既有 `iconPadding` 共同参与 `renderIconFrame` 的绘制矩阵计算：先按 `iconContentScale` 缩放原图，再按 `iconPadding` 计算安全区，再叠加 `iconOffsetX/Y` 平移。
- **原因**：复用现有 `renderIconFrame(ctx, config)` 的签名扩展（新增可选 `offsetX/offsetY/contentScale` 字段，默认 0/0/1），对现有导出调用是纯新增参数，不破坏 `icon-export` 现有 18 个 iOS 尺寸+Android 密度的批量渲染调用点。
- **拖拽实现**：在 `CanvasViewport.tsx` 的 icons 分支画布容器上绑定 `onPointerDown/Move/Up`，拖拽时直接更新 React state（无防抖，需要跟手），松手后与其他控件一样触发已有的 150ms 防抖重绘定时器逻辑用于持久化写入（避免拖拽过程中高频写 `localStorage`）。
- **缩放实现**：`onWheel` 阻止默认滚动，`deltaY` 映射为 `iconContentScale` 增量；触屏用双指 `pointer` 事件计算两点距离变化。
- **替代方案**：仅做偏移、缩放沿用滑块——已在讨论中排除，用户明确要求画布内直接缩放手势。
- **替代方案**：把 offset/scale 合并进现有 `iconPadding` 语义（复用单一字段）——排除，因为 padding 是"整体安全区留白"概念，与"内容在框内的位置/大小"是正交的两个概念，合并会让两个交互相互覆盖、难以独立重置。

### 2. 渐变背景：Canvas `createLinearGradient`，固定 135°
新增 `iconBgMode: 'solid' | 'gradient'` 与 `iconBgGradient: [string, string]` 状态。渲染时若 `iconBgMode === 'gradient'`，用 `ctx.createLinearGradient` 按画布对角线方向（135° 近似为从左上到右下）生成渐变并 `fillRect`，替代原来的 `ctx.fillStyle = bgColor`。
- **原因**：135° 是 appicongenerator 的默认角度，且原生 Canvas API 原生支持，无需额外库；固定角度把用户决策面收窄到"选两个颜色"，符合产品"精确高效"的定位。
- **Android Adaptive 背景层**：`buildIconZip` 中原先用纯色 `fillRect` 生成 `ic_launcher_background.png` 的逻辑，改为复用同一个渐变绘制函数，保证预览与导出一致（对应 `icon-export` 新增的"Adaptive icon background honors gradient fill"需求）。

### 3. 历史方案：独立 localStorage 键 + 侧滑抽屉，复用自定义预设的 CRUD 模式
新增 `mockup_app_icon_history` 键，存储 `IconHistoryEntry[]`（`id`/`name`/`createdAt`/`thumbnail`(dataURL)/`snapshot`(完整 icon 状态字段)）。UI 新增 `src/components/IconHistoryDrawer.tsx`，交互模式对齐现有 `customPresets`（`handleSavePreset`/`handleDeletePreset`/`handleApplyPreset`）而非重新设计一套模式。
- **原因**：`App.tsx` 已有一套成熟的"预设保存/应用/删除 + localStorage 持久化"模式（截图工具的 `customPresets`），历史方案是同构问题，直接复用降低实现和维护成本。
- **缩略图**：保存时用现成的 512 基准画布 `toDataURL('image/png')` 生成缩略图，不额外降采样（历史条目数量预期为个位数到几十，用户会手动删除不需要的，暂不做自动淘汰策略）。
- **替代方案**：历史记录限制最近 N 条自动淘汰——排除，用户已明确选择"命名历史抽屉，支持任意数量、命名、删除"。

### 4. SVG 容器导出：字符串拼装，非渲染库
`buildIconZip` 新增可选参数 `includeSvgContainer: boolean`。为真时，取 1024×1024 主图的 `dataURL`（已有的 `sourceCanvas.toDataURL('image/png')`），拼装成一个最小 SVG 字符串：
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <image width="1024" height="1024" href="data:image/png;base64,...."/>
</svg>
```
写入 ZIP 根目录 `icon-1024.svg`。
- **原因**：无需任何 SVG 生成库；`<image>` + base64 是所有现代浏览器/设计工具（Figma、Sketch）都能正确导入的标准做法。
- **替代方案**：逐尺寸孪生 SVG——已排除（用户选择"仅一份 1024 容器"）。

### 5. 导出完成态：复用现有 `isExporting` 遮罩，新增 `exportResult` 状态机
不新增模态框组件，而是把现有的 `isExporting` boolean 遮罩扩展为一个简单状态机：`'idle' | 'exporting' | 'done' | 'error'`。`'done'` 态渲染指引文案 + 关闭按钮，不再像现在这样自动清空。
- **原因**：复用现有全屏遮罩容器和层级（`z-toast`），避免新增一个 z-index 语义；`product.md` 也明确"Modal as first thought is usually laziness"，能内联扩展现有状态就不新开模态框。

### 6. 隐私提示：纯文案，无新增状态
直接在 `CanvasViewport.tsx` 空状态区块和 `App.tsx` 导出弹窗 JSX 中插入静态文案节点，不涉及状态管理。

## Risks / Trade-offs

- **[Risk] 拖拽状态高频更新可能导致 512 画布重绘性能抖动**
  - *Mitigation*：拖拽期间的 `renderIconFrame` 直接在 `requestAnimationFrame` 或 pointermove 回调内同步绘制（不经过现有 150ms 防抖 `useEffect`），只在松手时才触发防抖持久化写入，避免拖拽卡顿与避免高频 `localStorage` 写入两个目标分离处理。
- **[Risk] 历史记录的 base64 缩略图可能撑爆 `localStorage` 5-10MB 限额**
  - *Mitigation*：缩略图复用现有 512px 画布（而非 1024 源图），单条约几十 KB；若后续用户反馈容量问题，可在下一提案中引入缩略图降采样或迁移到 IndexedDB，本次不预先过度设计。
- **[Risk] `iconOffsetX/Y`/`iconContentScale` 与既有 `iconPadding` 的组合渲染可能在极端值下裁切出黑边或空白**
  - *Mitigation*：`icon-generator` 新增的"Reset position and scale"需求提供一键归零；渲染函数对 offset 不做数值裁剪（允许内容部分移出画布，与遮罩预览一致，用户可自行判断），只对 `contentScale` 设置 0.5–2.0 的硬边界防止极端缩放。
- **[Risk] SVG 容器体积因 base64 膨胀（约比原 PNG 大 33%）**
  - *Mitigation*：仅生成一份 1024 主图（而非逐尺寸），且为可选勾选项，默认不启用，可接受。

## Migration Plan

- `localStorage` 的 `mockup_app_icon_state` 读取逻辑需要对新增字段（`iconOffsetX/Y`、`iconContentScale`、`iconBgMode`、`iconBgGradient`）做默认值兜底（沿用现有 `loadSavedState` 的合并模式），保证升级前保存的旧状态仍能正常加载。
- `mockup_app_icon_history` 是全新键，无迁移负担；不存在则视为空数组。
- 无需数据库迁移、无需服务端改动（纯前端本地状态）。
- 回滚策略：新增字段均为可选且有默认值，回退代码版本后旧版本会忽略/丢弃新增字段，不会导致解析失败。

## Open Questions

- 历史记录是否需要导出/导入（跨设备迁移）——本次不做，用户未提出该需求，标记为潜在后续提案。
- 拖拽是否需要限制内容不能完全移出画布——本次不限制，作为开放但已决策的默认值（对齐 Decisions #1）。
