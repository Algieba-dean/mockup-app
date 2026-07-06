<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: MockupApp
description: 纯前端应用商店截图与图标生成器，采用社论杂志级黑白极简主义风格。
---

# Design System: MockupApp

## 1. Overview

**Creative North Star: "The Editorial Curator" (社论策展人)**

MockupApp 的设计核心是绝对的克制。它拒绝了传统 SaaS 工具喧宾夺主的色彩斑斓，转而采用纯单色极简主义（黑、灰、白）来呈现界面。这样做的主旨是：将用户上传的 App 截图和图标作为画布上唯一的“主角”。整个应用界面宛如一本高端电子艺术杂志或美术馆展厅，通过大面积的留白、极细的单像素分割线和高品位的排版来体现专业感与工艺水准。

本设计系统明确拒绝廉价的 SaaS 模板堆砌、老旧的图片转换工具质感、以及复杂繁琐的多层嵌套控制面板。

**Key Characteristics:**
- **绝对黑白单色**：排除红、绿、蓝等彩色高亮，纯粹依靠明暗度、字重和对比度区分层级。
- **社论级字体对比**：采用大字号衬线体（Serif）作为展示标题，搭配极简现代的无衬线体（Sans-serif）作为控制面板文字。
- **空间几何秩序**：借鉴 Stripe 和 Resend 的纯净版式，使用 1px 细线、均匀的网格和慷慨的留白。
- **即时轻量反馈**：微弱的悬停过渡和闪电般快速的纯前端响应，绝不使用影响效率的繁重入场动画。

## 2. Colors

色彩策略为纯单色系统。通过无彩色的明暗阶梯（灰度值）来划分工作区的容器与边界。

### Primary
- **[To be resolved during implementation]**

### Neutral
- **[To be resolved during implementation]**

### Named Rules
**The Monochrome Rule (单色守则).** 界面中禁止出现除黑、白、灰以外的任何彩色。如果需要强调某项操作，应使用反色（如白底黑字变成黑底白字）、字重加粗或增加实体边框，而非注入颜色。

## 3. Typography

**Display Font:** Serif Display (如 Playfair Display / Cormorant Garamond, 待代码实现阶段解析)
**Body Font:** Sans-serif (如 Inter / Geist Sans, 待代码实现阶段解析)

**Character:** 经典的社论杂志质感。当大气的衬线体标题与高易读性的几何无衬线体面板搭配时，能传递出一种冷峻而自信的专业气场。

### Hierarchy
- **Display** ([To be resolved]): 适用于大标题、主海报语和截图上方的 Caption 宣传词。
- **Headline** ([To be resolved]): 适用于模块标题与核心工作区标签。
- **Body** ([To be resolved]): 适用于设置选项、说明文字与用户输入内容。
- **Label** ([To be resolved]): 适用于小按钮文本、设备型号标识等。

### Named Rules
**The Typographic Contrast Rule (排版对比度守则).** 每一处大标题（衬线体）与副标题/正文（无衬线体）之间必须存在显著的尺寸和字重差异，以防止两者在视觉上混淆，确保版面的张力。

## 4. Elevation

本设计系统采用平面的几何版面，不使用传统的三维投影来构建层级。所有的卡片、面板和编辑区都在同一个高度层面上。

**The Flat-By-Default Rule (平面守则).** 所有组件默认呈平面状态，依靠 1px 的对比度边框或明暗色块拼接进行视觉隔离。投影（Box Shadow）仅在用户悬停于可拖拽的设备元素或浮动弹出菜单时作为辅助边缘光出现，且颜色应为微弱的黑色半透明。

## 5. Components

<!-- 组件参数将在代码实现后通过 /impeccable document 扫描提取。此处暂时置空。 -->

## 6. Do's and Don'ts

这里是针对 MockupApp 视觉系统的强效红线，后续的界面开发必须严格遵守。

### Do:
- **Do** 使用 1px 的精致灰色或黑色实线来分隔工作区面板。
- **Do** 在按钮的悬停状态下使用反色切换（例如：边框黑转白，或者背景由白变黑），使其具备高响应性。
- **Do** 在截图模版设计中提供超大字号的衬线体标题输入框，展现杂志封面般的排版美感。
- **Do** 保持布局高度对称和规律的内边距，利用大面积空白缓解用户的视觉疲劳。

### Don't:
- **Don't** 使用任何彩色图标或彩色按钮（如常见的绿色“保存”、蓝色“导出”）。
- **Don't** 使用大于 1px 的色条作为卡片左侧或右侧的装饰边框（Side-stripe borders）。
- **Don't** 使用拟物化的重度毛玻璃（Glassmorphism）效果作为默认背景。
- **Don't** 允许设置面板中出现超过两层嵌套的卡片结构，避免增加用户的认知负担。
- **Don't** 使用通用的 SaaS 模板徽章或彩色的 01、02 数字眉标。
