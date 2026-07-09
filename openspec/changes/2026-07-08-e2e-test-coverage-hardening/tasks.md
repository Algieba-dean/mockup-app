## 1. Test infrastructure

- [ ] 1.1 设计并实现共享 fixture（清空 `localStorage`、上传示例截图等公共步骤）
- [ ] 1.2 将 `tests/mockup-app.spec.ts` 按能力域拆分为多个文件（如 `screenshots.spec.ts`、`icons.spec.ts`、`privacy.spec.ts`），保留原有 9 个用例不变
- [ ] 1.3 `playwright.config.ts` 新增移动视口 project（375×667），并通过 `testMatch`/`grep` 限定其只运行响应式相关用例

## 2. advanced-templates & customization-controls coverage

- [ ] 2.1 背景类型切换（纯色/渐变/图片）用例
- [ ] 2.2 毛玻璃开关用例
- [ ] 2.3 背景高斯模糊滑块用例
- [ ] 2.4 标题/副标题字体切换用例
- [ ] 2.5 设备外壳型号切换用例（iPhone Dark/Light、iPad Pro、Google Pixel）

## 3. skew-and-floating & panoramic-background coverage

- [ ] 3.1 旋转角度 + 倾斜角滑块操作用例（断言无控制台报错、画布仍可交互）
- [ ] 3.2 开启全局全景图上传后，验证不同页面背景渲染结果不同

## 4. Export content verification

- [ ] 4.1 `multi-size-export`：下载后用 `jszip` 解析，断言选中尺寸对应的子文件夹（如 `ios/iphone_6.9/`）存在且非空
- [ ] 4.2 `icon-export`：下载后用 `jszip` 解析，断言 `ios/AppIcon.appiconset/Contents.json` 与 `android/` 目录存在

## 5. privacy-policy-generator extended coverage

- [ ] 5.1 步骤回退导航（点击已完成步骤指示点，数据不丢失）
- [ ] 5.2 自定义第三方服务录入（名称 + URL）并出现在生成文档中
- [ ] 5.3 草稿持久化：填写部分字段后刷新页面，断言"继续编辑/重新开始"横幅出现
- [ ] 5.4 Terms of Use 完整流程 + Markdown 下载 + 复制到剪贴板

## 6. Accessibility & theme coverage

- [ ] 6.1 导出弹窗：`role="dialog"`、`aria-modal="true"`、焦点陷阱、Escape 关闭
- [ ] 6.2 SectionAccordion 的 `aria-expanded`/`aria-controls` 状态切换
- [ ] 6.3 主题切换按钮：断言 `<html>`/根容器的主题 class 切换
- [ ] 6.4 移动视口 project 下：<768px 时侧边栏默认折叠且可通过 header 按钮抽屉化展开

## 7. Verification

- [ ] 7.1 `npx playwright test` 全量通过（含新增的移动视口 project）
- [ ] 7.2 确认拆分后原有 9 个用例语义不变、断言未被弱化
