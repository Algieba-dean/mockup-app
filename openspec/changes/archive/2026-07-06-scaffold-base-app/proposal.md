## Why

目前的 MockupApp 项目还是一个完全空白的仓库。为了能开始进行纯前端应用商店截图与图标生成工具的开发，我们需要率先搭建起项目的基本框架（React + Vite + TypeScript），集成 Fabric.js 绘图引擎，并确立基于“社论策展人 (The Editorial Curator)”极简黑白视觉主题的工作区骨架，为后续的画布交互和切图功能落地提供坚实的基础。

## What Changes

- 初始化基于 React, Vite, TypeScript 的前端项目脚手架。
- 引入 Fabric.js 作为核心图形渲染和编辑库。
- 构建工作台的多面板基础布局（包含工具导航栏、左侧素材预设区、中央 FabricJS 画布视口、右侧属性控制面板以及底部的资源管理 Dock）。
- 实现全局视觉主题（暗色/亮色极简主题切换，并集成 Playfair Display / Inter Google 字体）。
- 建立基于 FabricJS 的多尺寸画布缩放引擎（Viewport Controller）基础架构。

## Capabilities

### New Capabilities
- `workspace-scaffold`: 完成工作台主界面多栏布局、响应式框架导航、微动效面板以及本地存储与状态同步的脚手架开发。
- `screenshot-canvas`: 完成 Canvas 层级渲染引擎的搭建，支持设备外壳图片加载、圆角裁切（clipPath）以及主标题/副标题的 Canvas 渲染。

### Modified Capabilities
<!-- 暂无已存在的 capabilities -->

## Impact

- 引入基础前端依赖项（react, react-dom, fabric, lucide-react, typescript, vite 等）。
- 产生核心页面文件结构（组件目录、画布助手、本地数据持久化辅助函数等）。
- 设定路由或工作台状态（ Screenshots、Icons、Text 之间的 tab 导航）。
