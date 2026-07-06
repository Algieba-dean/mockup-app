## 1. Global Panoramic Background

- [ ] 1.1 在左侧控制栏添加“全局连图背景”上传控件和开关状态
- [ ] 1.2 在 `canvasManager.ts` 中实现基于页面序号（index）的连图背景按比例位移裁剪算法（$-index \times 1242$）

## 2. 2.5D Mockups Rotation & Skew

- [ ] 2.1 在右侧属性面板添加设备“旋转角 (angle)”和“错切角 (skewX)”滑块控件
- [ ] 2.2 在 `canvasManager.ts` 中重构手机 Bezel Group，支持应用偏转角和三维错切几何矩阵
- [ ] 2.3 在渲染器中实现阴影补偿算法，根据倾斜角自动推导并渲染对应的弥散外发光 Shadow

## 3. Mix & Match Multi-device

- [ ] 3.1 升级 `App.tsx` 数据结构，将单画幅设备状态重构为 `devices: DeviceInstance[]` 数组
- [ ] 3.2 在控制面板实现设备的添加、删除和独立参数（机型、绑定截图、旋转度）的属性修改
- [ ] 3.3 提供“双机并排”、“手机+平板”、“三机交错”等经典混搭排版预设
- [ ] 3.4 在 `canvasManager.ts` 渲染循环中支持迭代多设备列表，分别计算各自坐标并完成无损 Canvas 裁切叠加

## 4. Multi-size Export Presets

- [ ] 4.1 在页面导出控制中增加多尺寸规格复选列表（iPhone 6.9", 6.5", 5.5", iPad 12.9", Android Phone）
- [ ] 4.2 重构 `canvasManager.ts`，将关键元素布局坐标与尺寸更改为以基准高度（2208px）为参照的相对百分比计算
- [ ] 4.3 升级导出逻辑，支持多重 Canvas 分辨率重置、动态相对重绘渲染，并按树状目录结构（如 /ios/iphone_6.9/）压缩写入 ZIP 归档包
