## Context

为了在 MockupApp 中落地全局跨页连图、设备三维旋转、以及单页多机型混搭等高级功能，我们需要设计合理的数据结构和 Canvas 坐标计算方案。

## Technical Design

### 1. 全局跨页连图 (Panoramic Background)

#### 数据结构扩展
在全局应用状态或 active page 之外引入 `globalBackground` 字段：
```typescript
interface GlobalBackground {
  imageSrc?: string;      // 超宽背景图 Base64 或 ObjectURL
  totalWidth: number;     // 原始宽度
  totalHeight: number;    // 原始高度
  enabled: boolean;       // 是否启用连图模式
}
```

#### 渲染位移与裁剪算法
当 `bgType === 'panoramic'` 且全局背景图启用时，我们在 `canvasManager.ts` 渲染 Page $i$ 时执行以下计算：
- **画布单页尺寸**：$W_{page} = 1242$, $H_{page} = 2208$
- **背景缩放比例**：为了保证纵向填满，缩放系数为 $S = H_{page} / H_{img}$
- **背景位移 (offset)**：
  - 第 $i$ 页的裁剪偏移量为 $X_{offset} = i \times W_{page}$
  - 将背景图的 `left` 设置为：
    $$\text{left} = -X_{offset}$$
  - 将背景图的 `top` 设为 `0`（若有高度盈余，可增加纵向平移居中）。
- **示例图解 (以3页连图为例)**：
  ```
  [======================== 3726px Panoramic Image ========================]
  |      Page 1 [0-1242]    |    Page 2 [1242-2484]   |    Page 3 [2484-3726]   |
  |  left: 0px              |  left: -1242px          |  left: -2484px          |
  ```

---

### 2. 三维偏转与悬浮投影 (2.5D Skew & Shadow Compensation)

由于 Fabric.js 的 `Group` 对子元素应用旋转 (`angle`) 或错切 (`skewX`, `skewY`) 非常方便，我们可以直接把外壳 `bezelOuter`、内屏 `bezelInner` 和截图 `img` 放置于一个 `deviceGroup` 中。

#### 几何偏转矩阵
- **旋转**：`deviceGroup.set({ angle: state.angle })`
- **错切 (三维深度错觉)**：`deviceGroup.set({ skewX: state.skewX, skewY: state.skewY })`
- **动态裁切 (clipPath) 的三维形变**：
  在 Fabric v7 中，由于 `clipPath` 设置了 `absolutePositioned: true`，其位置和形变也需要与 `deviceGroup` 同步。方案是**不使用绝对定位的 clipPath，而是将 clipPath 相对定位在图片组内部**，或者随着 `deviceGroup` 的旋转错切矩阵，对 `clipPath` 执行同样的 `transform` 运算。

#### 投影补偿算法
倾斜偏转的机壳如果使用普通正下方投影会显得很不自然，投影需要根据角度产生对应的偏移：
- 当 $\theta = \text{angle} > 0$ 时，光源从左上方照射：
  $$\text{offsetX} = 20 \times \cos(\theta), \quad \text{offsetY} = 30 \times \sin(\theta)$$
- 阴影模糊度 `blur` 随悬浮高度 slider 动态变化（`blur = 20 + height * 2`），营造真实的空间深度感。

---

### 3. 单页多机型混搭 (Mix & Match)

#### 数据结构升级
将单个 Page 的 device 结构改写为设备数组：
```typescript
interface DeviceInstance {
  id: string;             // 唯一实例 ID
  deviceModel: string;    // iphone_16_pro / ipad_pro / google_pixel 等
  screenshotSrc?: string; // 该设备绑定的截图
  angle: number;          // 旋转偏转角
  skewX: number;          // 错切角
  scale: number;          // 缩放比例 (默认 1.0)
  offsetX: number;        // 横向偏移量 (相对于画布中心)
  offsetY: number;        // 纵向偏移量 (相对于画布中心)
}

interface MockupPage {
  id: string;
  title: string;
  subtitle: string;
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor: string;
  devices: DeviceInstance[]; // 单页支持多设备实例
}
```

#### 混搭排版引擎 (Grid & Free-drag Layout)
在 Fabric.js 中支持两种多设备布局模式：
1.  **自动排版模式 (Auto Preset)**：提供“双机左右并排”、“三机阶梯重叠”、“手机+平板”等预设，系统自动计算每个设备实例的 `scale`, `offsetX`, `offsetY` 坐标。
2.  **自由拖拽模式 (Free Drag)**：将设备实例设为 `selectable: true`，允许用户在 Canvas 上直接用鼠标缩放、旋转和挪动手机位置，满足高级自定义海报设计。

---

### 4. 一键多尺寸重采样导出 (Multi-size Re-sampling Export)

#### 商店分辨率规格矩阵
我们在导出控制侧定义标准分辨率映射配置：
```typescript
interface ExportPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  platform: 'ios' | 'android';
}

const EXPORT_PRESETS: ExportPreset[] = [
  { id: 'ios-6.9', name: 'iPhone 16 Pro Max (6.9")', width: 1290, height: 2796, platform: 'ios' },
  { id: 'ios-6.5', name: 'iPhone XS Max / 11 Pro Max (6.5")', width: 1242, height: 2688, platform: 'ios' },
  { id: 'ios-5.5', name: 'iPhone 8 Plus (5.5")', width: 1242, height: 2208, platform: 'ios' },
  { id: 'ios-ipad', name: 'iPad Pro 12.9" (iPad)', width: 2048, height: 2732, platform: 'ios' },
  { id: 'android-phone', name: 'Android Phone (Google Play)', width: 1242, height: 2208, platform: 'android' },
];
```

#### 相对重定位重绘渲染流 (Relative Re-layout rendering flow)
因为画布的物理像素改变了（例如从 1242x2208 变为 2048x2732），我们不能使用绝对像素来定死位置，否则在大尺寸下标题会显得极小且偏置。
- **坐标相对化**：
  在 `canvasManager.ts` 中，所有核心坐标（Bezel, Title, Subtitle, Padding）将使用**基准高度比率（Relative Height Ratio）**动态计算。
  例如，基准高度为 $H_{base} = 2208$：
  - 标题的 `top` 计算为：
    $$\text{top} = \text{canvasHeight} \times \frac{180}{2208}$$
  - 标题的 `fontSize` 计算为：
    $$\text{fontSize} = \text{canvasHeight} \times \frac{\text{state.titleFontSize}}{2208}$$
  - 手机壳的基准宽度和高度也根据画布当前高度按比率重缩放，从而使不同尺寸导出的构图完全一致，实现真正的**一键高保真重采样**。

#### ZIP 目录分包存储结构
导出的 ZIP 包中按平台和尺寸进行层级化隔离，方便开发者直接上传对应的分类：
```
mockup_export.zip/
  ├── ios/
  │    ├── iphone_6.9/
  │    │    ├── page_1.png
  │    │    └── page_2.png
  │    ├── iphone_5.5/
  │    │    ├── page_1.png
  │    │    └── page_2.png
  │    └── ipad_12.9/
  │         ├── page_1.png
  │         └── page_2.png
  └── android/
       └── phone/
            ├── page_1.png
            └── page_2.png
```
