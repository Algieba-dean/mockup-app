import { Canvas, Rect, Circle, Textbox, FabricImage, Group, Shadow, Gradient, filters } from 'fabric';

export interface DeviceInstance {
  id: string;
  deviceModel: string;
  screenshotSrc?: string;
  angle: number;
  skewX: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  screenshotScale?: number;   // 内屏截图缩放比例
  screenshotOffsetY?: number; // 内屏截图垂直偏移
}

export interface CanvasState {
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor: string;
  bgGradient?: string[]; // Array of hex strings
  bgImageSrc?: string;
  bgImageScale?: number; // 背景图/连图缩放倍数 (>=1，1 为铺满画布的最小基准缩放)
  bgBlur: number;
  showFrostedGlass: boolean;
  devices: DeviceInstance[]; // Supports multi-device layout
  titleText: string;
  subtitleText: string;
  titleFontSize: number;
  subtitleFontSize: number;
  titleFontFamily: string;
  subtitleFontFamily: string;
  layout?: 'text-top' | 'text-bottom' | 'full-device';
  showGlassReflection?: boolean;
  showStatusBar?: boolean;
  shadowPreset?: 'none' | 'soft' | 'premium';
  // 标题/副标题的画布内拖拽/缩放/旋转偏移量 (相对于版式默认锚点的增量)，
  // 由 Canvas 上的交互控制手柄写入，默认 0 = 完全沿用版式默认排版。
  titleOffsetX?: number;
  titleOffsetY?: number;
  titleAngle?: number;
  subtitleOffsetX?: number;
  subtitleOffsetY?: number;
  subtitleAngle?: number;
}

interface DeviceMetric {
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  // 以下手绘矢量外壳专用字段：使用真机 PNG 边框 (frameImage) 时可不填
  rx?: number;
  ry?: number;
  screenBorderWidth?: number;
  sensorType?: 'island' | 'punchHole' | 'faceIdBar' | 'none';
  showSideButtons?: boolean;
  color?: 'dark' | 'light' | 'gold' | 'rose_gold';
  // 真机 PNG 边框素材 (来自 fastlane/frameit-frames)：设置后渲染逻辑会切换到
  // "真实边框图片" 路径，忽略上面用于手绘矢量外壳的 rx/screenBorderWidth/sensorType 等字段。
  frameImage?: string;
  frameOffsetX?: number;   // 屏幕区域左上角在边框原始像素坐标系中的 X 偏移
  frameOffsetY?: number;   // 屏幕区域左上角在边框原始像素坐标系中的 Y 偏移
  frameScreenWidth?: number; // 屏幕区域在边框原始像素坐标系中的宽度
  isLight?: boolean; // 用于对比色/玻璃底板配色的明暗提示 (真机边框场景下不查 FRAME_COLOR_PALETTE)
  // 屏幕圆角半径 = frameScreenWidth * screenCornerRadiusPct，用于给截图显式裁出圆角。
  // 边框 PNG 挖空区域本身也带圆角 alpha 蒙版，但其圆角起点与 frameOffsetX/Y 声明的矩形边界
  // 并不完全贴合 (真机照片边缘存在机身弧面高光过渡带)，若不额外裁剪，截图的直角会从边框
  // 圆角与声明矩形之间的缝隙中"漏出去"。默认 0.06，未提供时使用该值。
  screenCornerRadiusPct?: number;
}

// 设备外壳颜色变体调色板 (深空黑 / 银色 / 金色 / 玫瑰金)
// stops: 沿外壳对角线的三段渐变色 (高光 / 主色 / 阴影)，模拟金属拉丝质感；stroke 为描边与侧边按键的实色
const FRAME_COLOR_PALETTE: Record<'dark' | 'light' | 'gold' | 'rose_gold', { stops: [string, string, string]; stroke: string; isLight: boolean }> = {
  dark: { stops: ['#3f3f42', '#18181b', '#040404'], stroke: '#050505', isLight: false },
  light: { stops: ['#ffffff', '#f2f2f0', '#c4c4c9'], stroke: '#b3b3b8', isLight: true },
  gold: { stops: ['#f4e6cc', '#d9c19a', '#a3814f'], stroke: '#8a6b41', isLight: true },
  rose_gold: { stops: ['#f7ded4', '#e8c3b9', '#bd867a'], stroke: '#a06f63', isLight: true },
};

// 构造外壳金属渐变填充配置 (沿对角线分布高光/主色/阴影，比纯色更接近真机质感)
// 注意：Fabric.js v7 的 fill 渲染判断依赖 `toLive()` 方法 (isFiller 检测)，
// 传入普通对象字面量 (plain object) 不会被识别为渐变，会被静默忽略并回退成上一次的 fillStyle。
// 因此这里必须使用真正的 Gradient 类实例，而不是 `as any` 的裸对象。
function buildFrameGradient(stops: [string, string, string], width: number, height: number) {
  return new Gradient({
    type: 'linear',
    gradientUnits: 'pixels',
    coords: { x1: 0, y1: 0, x2: width, y2: height },
    colorStops: [
      { offset: 0, color: stops[0] },
      { offset: 0.5, color: stops[1] },
      { offset: 1, color: stops[2] },
    ],
  });
}

// 绘制截图离屏 Canvas 上的极简状态栏与玻璃反射光效
// 手绘矢量外壳 与 真机 PNG 边框 两条渲染路径共用此函数，避免逻辑分叉导致视觉不一致。
// uiScale: 以 750px 参考宽度为基准等比缩放图标绝对像素尺寸，兼容真机边框远高于该基准的原始分辨率。
function renderScreenOverlays(
  tempCtx: CanvasRenderingContext2D,
  tempCanvas: HTMLCanvasElement,
  showStatusBar: boolean,
  showGlassReflection: boolean,
  isLightFallback: boolean
) {
  const uiScale = tempCanvas.width / 750;

  if (showStatusBar) {
    const sbHeight = Math.max(24, Math.floor(tempCanvas.height * 0.038));
    const padding = Math.max(12, Math.floor(tempCanvas.width * 0.06));

    // 智能提取状态栏下背景色亮度，自动调整黑白高对比图标文字
    let isLightBg = false;
    try {
      const pixel = tempCtx.getImageData(padding, sbHeight / 2, 1, 1).data;
      const brightness = (pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114) / 1000;
      isLightBg = brightness > 140;
    } catch (e) {
      isLightBg = isLightFallback;
    }
    const sbColor = isLightBg ? '#111111' : '#ffffff';

    // 绘制左侧时间
    tempCtx.font = `600 ${Math.max(11, Math.floor(sbHeight * 0.4))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    tempCtx.fillStyle = sbColor;
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText('9:41', padding, sbHeight / 2);

    // 绘制右侧电池电量
    const batW = 20 * uiScale;
    const batH = 10 * uiScale;
    const batX = tempCanvas.width - padding - batW;
    const batY = (sbHeight - batH) / 2;
    tempCtx.strokeStyle = sbColor;
    tempCtx.lineWidth = 1 * uiScale;
    tempCtx.strokeRect(batX, batY, batW, batH);
    // 填充电池容量
    tempCtx.fillStyle = sbColor;
    tempCtx.fillRect(batX + 2 * uiScale, batY + 2 * uiScale, 13 * uiScale, 6 * uiScale);
    // 电池触极
    tempCtx.fillRect(batX + batW, batY + 3 * uiScale, 2 * uiScale, 4 * uiScale);

    // 绘制右侧信号条
    const sigX = batX - 22 * uiScale;
    const sigY = (sbHeight - 10 * uiScale) / 2;
    tempCtx.fillStyle = sbColor;
    for (let bar = 0; bar < 4; bar++) {
      const barH = (2 + bar * 2.5) * uiScale;
      tempCtx.fillRect(sigX + bar * 3.5 * uiScale, sigY + (10 * uiScale - barH), 2 * uiScale, barH);
    }

    // 绘制右侧 Wifi 图标
    const wifiX = sigX - 18 * uiScale;
    const wifiY = sbHeight / 2;
    tempCtx.strokeStyle = sbColor;
    tempCtx.lineWidth = 1.2 * uiScale;
    tempCtx.lineCap = 'round';
    // 最小弧
    tempCtx.beginPath();
    tempCtx.arc(wifiX, wifiY + 3 * uiScale, 2 * uiScale, Math.PI * 1.25, Math.PI * 1.75);
    tempCtx.stroke();
    // 中等弧
    tempCtx.beginPath();
    tempCtx.arc(wifiX, wifiY + 3 * uiScale, 5 * uiScale, Math.PI * 1.25, Math.PI * 1.75);
    tempCtx.stroke();
    // 最大弧
    tempCtx.beginPath();
    tempCtx.arc(wifiX, wifiY + 3 * uiScale, 8 * uiScale, Math.PI * 1.25, Math.PI * 1.75);
    tempCtx.stroke();
  }

  // 绘制屏幕玻璃反射 (Glass Reflection Glare)
  if (showGlassReflection) {
    const glareGrad = tempCtx.createLinearGradient(0, 0, tempCanvas.width, tempCanvas.height);
    glareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glareGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.15)');
    glareGrad.addColorStop(0.36, 'rgba(255, 255, 255, 0.03)');
    glareGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.0)');
    glareGrad.addColorStop(0.75, 'rgba(255, 255, 255, 0.05)');
    glareGrad.addColorStop(1, 'rgba(255, 255, 255, 0.10)');
    tempCtx.fillStyle = glareGrad;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  }
}

// 'text-top' 布局下，标题+副标题文案块底部与设备顶部之间的固定间距 (基准像素，随 R 缩放)。
const TEXT_TO_DEVICE_GAP = 56;

const DEVICE_DB: Record<string, DeviceMetric> = {
  iphone_16_pro: {
    width: 620,
    height: 1260,
    screenWidth: 592,
    screenHeight: 1232,
    rx: 45,
    ry: 45,
    screenBorderWidth: 14,
    sensorType: 'island',
    showSideButtons: true,
    color: 'dark',
  },
  iphone_16_pro_light: {
    width: 620,
    height: 1260,
    screenWidth: 592,
    screenHeight: 1232,
    rx: 45,
    ry: 45,
    screenBorderWidth: 14,
    sensorType: 'island',
    showSideButtons: true,
    color: 'light',
  },
  iphone_16_pro_gold: {
    width: 620,
    height: 1260,
    screenWidth: 592,
    screenHeight: 1232,
    rx: 45,
    ry: 45,
    screenBorderWidth: 14,
    sensorType: 'island',
    showSideButtons: true,
    color: 'gold',
  },
  iphone_16_pro_rose_gold: {
    width: 620,
    height: 1260,
    screenWidth: 592,
    screenHeight: 1232,
    rx: 45,
    ry: 45,
    screenBorderWidth: 14,
    sensorType: 'island',
    showSideButtons: true,
    color: 'rose_gold',
  },
  ipad_pro: {
    width: 900,
    height: 1200,
    screenWidth: 840,
    screenHeight: 1140,
    rx: 24,
    ry: 24,
    screenBorderWidth: 30,
    sensorType: 'faceIdBar',
    showSideButtons: false,
    color: 'light',
  },
  ipad_pro_dark: {
    width: 900,
    height: 1200,
    screenWidth: 840,
    screenHeight: 1140,
    rx: 24,
    ry: 24,
    screenBorderWidth: 30,
    sensorType: 'faceIdBar',
    showSideButtons: false,
    color: 'dark',
  },
  google_pixel: {
    width: 620,
    height: 1260,
    screenWidth: 588,
    screenHeight: 1228,
    rx: 40,
    ry: 40,
    screenBorderWidth: 16,
    sensorType: 'punchHole',
    showSideButtons: true,
    color: 'dark',
  },
  google_pixel_light: {
    width: 620,
    height: 1260,
    screenWidth: 588,
    screenHeight: 1228,
    rx: 40,
    ry: 40,
    screenBorderWidth: 16,
    sensorType: 'punchHole',
    showSideButtons: true,
    color: 'light',
  },

  // ---------------------------------------------------------------------
  // 真机 PNG 边框素材 (来源: fastlane/frameit-frames)
  // 注意：width/height 不能直接使用原始 PNG 像素尺寸 (1000~2200+px)，否则会比手绘矢量外壳
  // (width 基准约 620/900) 大出数倍，导致混用时两种风格的设备大小明显不一致。
  // 这里改为与矢量外壳同一套"设计单位"基准 (手机 620 / 平板 900)，按原始 PNG 的宽高比等比换算，
  // 保证 devScale 相同时两种风格视觉大小一致；frameOffsetX/Y/frameScreenWidth 仍使用
  // frameit-frames 仓库 latest/offsets.json 中的原始像素坐标 (渲染时按加载到的真实图片尺寸动态换算)。
  // ---------------------------------------------------------------------
  iphone_17_pro_max_silver: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-17-pro-max-silver.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_17_pro_max_deep_blue: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-17-pro-max-deep-blue.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: false, screenCornerRadiusPct: 0.09,
  },
  iphone_17_pro_max_cosmic_orange: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-17-pro-max-cosmic-orange.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_17_pro_silver: {
    width: 620, height: 1268, screenWidth: 1206, screenHeight: 2622,
    frameImage: '/device-frames/iphone-17-pro-silver.png',
    frameOffsetX: 72, frameOffsetY: 69, frameScreenWidth: 1206, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_17_pro_deep_blue: {
    width: 620, height: 1268, screenWidth: 1206, screenHeight: 2622,
    frameImage: '/device-frames/iphone-17-pro-deep-blue.png',
    frameOffsetX: 72, frameOffsetY: 69, frameScreenWidth: 1206, isLight: false, screenCornerRadiusPct: 0.09,
  },
  iphone_16_pro_max_black_titanium: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-16-pro-max-black-titanium.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: false, screenCornerRadiusPct: 0.09,
  },
  iphone_16_pro_max_natural_titanium: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-16-pro-max-natural-titanium.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_16_pro_max_white_titanium: {
    width: 620, height: 1265, screenWidth: 1320, screenHeight: 2868,
    frameImage: '/device-frames/iphone-16-pro-max-white-titanium.png',
    frameOffsetX: 75, frameOffsetY: 66, frameScreenWidth: 1320, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_16_black: {
    width: 620, height: 1248, screenWidth: 1179, screenHeight: 2556,
    frameImage: '/device-frames/iphone-16-black.png',
    frameOffsetX: 90, frameOffsetY: 90, frameScreenWidth: 1179, isLight: false, screenCornerRadiusPct: 0.09,
  },
  iphone_16_white: {
    width: 620, height: 1248, screenWidth: 1179, screenHeight: 2556,
    frameImage: '/device-frames/iphone-16-white.png',
    frameOffsetX: 90, frameOffsetY: 90, frameScreenWidth: 1179, isLight: true, screenCornerRadiusPct: 0.09,
  },
  iphone_16_ultramarine: {
    width: 620, height: 1248, screenWidth: 1179, screenHeight: 2556,
    frameImage: '/device-frames/iphone-16-ultramarine.png',
    frameOffsetX: 90, frameOffsetY: 90, frameScreenWidth: 1179, isLight: false, screenCornerRadiusPct: 0.09,
  },
  ipad_pro_12_9_space_gray: {
    width: 900, height: 1175, screenWidth: 2048, screenHeight: 2732,
    frameImage: '/device-frames/ipad-pro-12-9-space-gray.png',
    frameOffsetX: 96, frameOffsetY: 102, frameScreenWidth: 2048, isLight: false, screenCornerRadiusPct: 0.018,
  },
  ipad_pro_12_9_silver: {
    width: 900, height: 1175, screenWidth: 2048, screenHeight: 2732,
    frameImage: '/device-frames/ipad-pro-12-9-silver.png',
    frameOffsetX: 96, frameOffsetY: 102, frameScreenWidth: 2048, isLight: true, screenCornerRadiusPct: 0.018,
  },
  galaxy_s21_ultra_black: {
    width: 620, height: 1338, screenWidth: 1440, screenHeight: 3200,
    frameImage: '/device-frames/galaxy-s21-ultra-black.png',
    frameOffsetX: 44, frameOffsetY: 54, frameScreenWidth: 1440, isLight: false, screenCornerRadiusPct: 0.06,
  },
  galaxy_s21_ultra_silver: {
    width: 620, height: 1338, screenWidth: 1440, screenHeight: 3200,
    frameImage: '/device-frames/galaxy-s21-ultra-silver.png',
    frameOffsetX: 44, frameOffsetY: 54, frameScreenWidth: 1440, isLight: true, screenCornerRadiusPct: 0.06,
  },
  pixel_5_black: {
    width: 620, height: 1265, screenWidth: 1080, screenHeight: 2340,
    frameImage: '/device-frames/pixel-5-black.png',
    frameOffsetX: 58, frameOffsetY: 58, frameScreenWidth: 1080, isLight: false, screenCornerRadiusPct: 0.09,
  },
  pixel_5_sage: {
    width: 620, height: 1265, screenWidth: 1080, screenHeight: 2340,
    frameImage: '/device-frames/pixel-5-sage.png',
    frameOffsetX: 58, frameOffsetY: 58, frameScreenWidth: 1080, isLight: true, screenCornerRadiusPct: 0.09,
  },
};

export const updateCanvas = async (
  canvas: Canvas,
  state: CanvasState,
  pageIndex: number = 0
) => {
  // 1. 清空画布
  canvas.clear();

  // 获取当前实际画布分辨率以进行动态比率缩放 (基准物理高度为 2208)
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const R = canvasHeight / 2208; // 相对重采样缩放系数

  // 2. 绘制画布背景
  if (state.bgType === 'panoramic' && state.bgImageSrc) {
    // ASO 全局连图模式
    try {
      const bgImg = await FabricImage.fromURL(state.bgImageSrc);
      const scale = (canvasHeight / bgImg.height!) * (state.bgImageScale ?? 1);
      
      bgImg.set({
        originX: 'left',
        originY: 'top',
        left: -pageIndex * canvasWidth, // 根据页面索引平移切片
        top: 0,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        hoverCursor: 'default',
      });

      if (state.bgBlur > 0) {
        const blurFilter = new filters.Blur({ blur: state.bgBlur / 30 });
        bgImg.filters.push(blurFilter);
        bgImg.applyFilters();
      }
      canvas.add(bgImg);
    } catch (error) {
      console.error('Failed to load panoramic background', error);
      drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
    }
  } else if (state.bgType === 'image' && state.bgImageSrc) {
    // 普通单页纹理背景
    try {
      const bgImg = await FabricImage.fromURL(state.bgImageSrc);
      const imgWidth = bgImg.width || (bgImg.getElement() as HTMLImageElement)?.naturalWidth || (bgImg.getElement() as HTMLImageElement)?.width || 1242;
      const imgHeight = bgImg.height || (bgImg.getElement() as HTMLImageElement)?.naturalHeight || (bgImg.getElement() as HTMLImageElement)?.height || 2208;
      
      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.max(scaleX, scaleY) * (state.bgImageScale ?? 1);
      
      bgImg.set({
        originX: 'left',
        originY: 'top',
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        hoverCursor: 'default',
      });

      if (state.bgBlur > 0) {
        const blurFilter = new filters.Blur({ blur: state.bgBlur / 30 });
        bgImg.filters.push(blurFilter);
        bgImg.applyFilters();
      }
      canvas.add(bgImg);
    } catch (error) {
      console.error('Failed to load template background image', error);
      drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
    }
  } else if (state.bgType === 'gradient' && state.bgGradient && state.bgGradient.length >= 2) {
    // 渐变填充模式
    try {
      const gradientBackground = new Rect({
        left: 0,
        top: 0,
        width: canvasWidth,
        height: canvasHeight,
        // 同上：必须显式声明 left/top 原点，否则默认的 'center' 原点会导致矩形只有 1/4 落在画布内
        originX: 'left',
        originY: 'top',
        selectable: false,
        hoverCursor: 'default',
      });

      // 注意：必须使用真实的 Gradient 类实例 (具备 toLive() 方法)，
      // 否则 Fabric.js v7 不会将其识别为渐变，会静默回退为上一次绘制留下的 fillStyle，
      // 导致背景只有局部区域被意外的颜色覆盖(即“只填充了左上角”的根本原因)。
      const linearGrad = new Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: 0, y2: canvasHeight },
        colorStops: [
          { offset: 0, color: state.bgGradient[0] },
          { offset: 1, color: state.bgGradient[1] }
        ]
      });
      gradientBackground.set({ fill: linearGrad });
      canvas.add(gradientBackground);
    } catch (error) {
      console.error('Failed to render gradient background', error);
      drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
    }
  } else {
    // 默认纯色背景
    drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
  }

  // 3. 相对定位计算对比色
  const contrastingColor = getContrastingColor(state.bgColor, state.bgType);
  const layoutMode = state.layout || 'text-top';

  // 4. 绘制标题与副标题 (根据布局模式动态调整)
  let titleTop = 180 * R;
  if (layoutMode === 'text-bottom') {
    titleTop = 1620 * R;
  }

  // 文案区实际占用的底部坐标 (标题+副标题自然排版高度)，用于 'text-top' 布局下动态
  // 计算设备起始位置 —— 避免旧版硬编码 680 的固定基准线在字号变化后产生巨大空白间隙
  // 或反之与文案重叠 (即"画布利用率不高"的根本原因)。
  let textBlockBottom = titleTop;

  if (layoutMode !== 'full-device') {
    const title = new Textbox(state.titleText || '主标题文本', {
      left: 80 * R + (state.titleOffsetX || 0) * R,
      top: titleTop + (state.titleOffsetY || 0) * R,
      angle: state.titleAngle || 0,
      width: canvasWidth - 160 * R,
      fontSize: state.titleFontSize * R,
      fontFamily: `${state.titleFontFamily}, Georgia, serif`,
      fontWeight: '500',
      fill: contrastingColor,
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
      selectable: true,
      hoverCursor: 'move',
      splitByGrapheme: true,
    });
    // 标记角色供 App.tsx 的 object:modified 处理函数识别是哪个可编辑元素
    (title as unknown as { data: Record<string, unknown> }).data = { role: 'title' };
    // 仅保留四角缩放 + 旋转手柄，隐藏四边中点手柄 (避免拖出与自动换行宽度冲突的独立拉伸)
    title.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false });
    canvas.add(title);
    // 记录本次实际渲染的标题高度，供副标题基准定位与交互反解使用
    (canvas as unknown as { _lastTitleHeight: number })._lastTitleHeight = title.height || 0;

    // 5. 绘制副标题 (紧跟标题高度，动态定位)
    const subtitleColor = contrastingColor === '#0f0f0f' ? '#575756' : '#d4d4d8';
    const subtitle = new Textbox(state.subtitleText || '这里是您的副标题文本说明', {
      left: 120 * R + (state.subtitleOffsetX || 0) * R,
      top: titleTop + title.height! + 24 * R + (state.subtitleOffsetY || 0) * R,
      angle: state.subtitleAngle || 0,
      width: canvasWidth - 240 * R,
      fontSize: state.subtitleFontSize * R,
      fontFamily: `${state.subtitleFontFamily}, -apple-system, sans-serif`,
      fontWeight: '300',
      fill: subtitleColor,
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
      selectable: true,
      hoverCursor: 'move',
      splitByGrapheme: true,
    });
    (subtitle as unknown as { data: Record<string, unknown> }).data = { role: 'subtitle' };
    subtitle.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false });
    canvas.add(subtitle);
    // 记录本次实际渲染的副标题高度，供动态设备基准线与交互反解使用
    (canvas as unknown as { _lastSubtitleHeight: number })._lastSubtitleHeight = subtitle.height || 0;
    textBlockBottom = titleTop + title.height! + 24 * R + subtitle.height!;
  }

  // 6. 多设备迭代渲染逻辑 (支持设备混搭与三维偏角计算)
  if (state.devices && state.devices.length > 0) {
    for (const devInst of state.devices) {
      const dev = DEVICE_DB[devInst.deviceModel] || DEVICE_DB.iphone_16_pro;
      
      // 动态比率缩放的宽、高、圆角半径
      const devScale = devInst.scale || 1.0;
      const devWidth = dev.width * devScale * R;
      const devHeight = dev.height * devScale * R;
      
      // 计算外壳在 Canvas 的绝对中心坐标 (根据布局模式动态调整基准 Y 坐标)
      const centerX = canvasWidth / 2 + devInst.offsetX * R;
      
      let centerY = textBlockBottom + TEXT_TO_DEVICE_GAP * R + devHeight / 2 + devInst.offsetY * R;
      if (layoutMode === 'text-bottom') {
        centerY = 220 * R + devHeight / 2 + devInst.offsetY * R;
      } else if (layoutMode === 'full-device') {
        centerY = canvasHeight / 2 + devInst.offsetY * R;
      }
      
      const cornerRadius = (dev.rx ?? 0) * devScale * R;
      const screenBorderWidth = (dev.screenBorderWidth ?? 0) * devScale * R;
      const activeDeviceColor = dev.color || 'dark';
      const frameColors = FRAME_COLOR_PALETTE[activeDeviceColor];
      // 真机 PNG 边框设备用 isLight 字段直接指定明暗；手绘矢量外壳设备回退到调色板的 isLight
      const isLightDevice = dev.isLight ?? frameColors.isLight;

      // 6A. 渲染毛玻璃底板 (Frosted Glass Panel)
      if (state.showFrostedGlass) {
        const glassWidth = devWidth + 100 * R;
        const glassHeight = devHeight + 120 * R;
        const glassRadius = cornerRadius + 16 * R;

        const glassShadow = new Shadow({
          color: isLightDevice ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)',
          blur: 50 * R,
          offsetX: 0,
          offsetY: 10 * R,
        });

        const glassPanel = new Rect({
          left: centerX,
          top: centerY,
          width: glassWidth,
          height: glassHeight,
          rx: glassRadius,
          ry: glassRadius,
          fill: isLightDevice ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
          stroke: isLightDevice ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
          strokeWidth: 1.5 * R,
          shadow: glassShadow,
          originX: 'center',
          originY: 'center',
          selectable: false,
          angle: devInst.angle,
          skewX: devInst.skewX,
        });

        canvas.add(glassPanel);
      }

      // 6B. 光学投影补偿算法 (角度越大，投影偏移越明显)
      const rad = (devInst.angle * Math.PI) / 180;
      const shadowX = 15 * Math.sin(rad) * R;
      const shadowY = 25 * Math.cos(rad) * R;

      const sPreset = state.shadowPreset || 'premium';
      let shadowColor = 'rgba(0, 0, 0, 0.35)';
      let shadowBlur = 40 * R;
      let sOffsetX = shadowX;
      let sOffsetY = shadowY;

      if (sPreset === 'none') {
        shadowColor = 'transparent';
        shadowBlur = 0;
        sOffsetX = 0;
        sOffsetY = 0;
      } else if (sPreset === 'soft') {
        shadowColor = 'rgba(0, 0, 0, 0.12)';
        shadowBlur = 15 * R;
        sOffsetX = shadowX * 0.4;
        sOffsetY = shadowY * 0.4;
      }

      const deviceShadow = new Shadow({
        color: shadowColor,
        blur: shadowBlur,
        offsetX: sOffsetX,
        offsetY: sOffsetY,
      });

      // 准备构成手机 Group 的各个图层（全部基于相对原点 0,0 绘制）
      const groupParts: any[] = [];

      if (dev.frameImage) {
        // ---------------------------------------------------------------
        // 真机 PNG 边框渲染路径 (来源: fastlane/frameit-frames)
        // 截图先铺底，真机边框图片盖在上层；边框挖空区域自带 alpha 透明像素，
        // 天然形成精确的圆角屏幕蒙版，无需额外绘制 clipPath。
        // ---------------------------------------------------------------
        try {
          const frameImg = await FabricImage.fromURL(dev.frameImage);
          const frameNativeW = frameImg.width!;
          const frameNativeH = frameImg.height!;
          // dev.width 为归一化后的"设计单位"基准宽度 (与矢量外壳同基准)，需除以边框 PNG
          // 实际加载到的原始像素宽度，才能得到正确的整体缩放系数
          const frameScale = devWidth / frameNativeW;

          if (devInst.screenshotSrc) {
            try {
              const screenNativeW = dev.frameScreenWidth || frameNativeW;
              const img = await FabricImage.fromURL(devInst.screenshotSrc);
              // 注意：屏幕高度必须使用设备真实屏幕分辨率的宽高比 (dev.screenHeight)，
              // 不能按上传截图自身的宽高比反推——用户截图（尤其是长截图/文档截图）宽高比
              // 往往和真机屏幕差异很大，若按截图比例反推屏幕框高度，画面会大幅溢出边框
              // 之外，只留下裸露的截图矩形而看不到边框（即"没有把边框用起来"的根本原因）。
              // 与手绘矢量外壳一致，这里改为固定屏幕框尺寸 + cover-fit 缩放裁切。
              const screenNativeH = screenNativeW * ((dev.screenHeight || frameNativeH) / (dev.screenWidth || frameNativeW));

              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = screenNativeW;
              tempCanvas.height = screenNativeH;
              const tempCtx = tempCanvas.getContext('2d')!;

              const scale = Math.max(screenNativeW / img.width!, screenNativeH / img.height!);
              const scrScale = scale * (devInst.screenshotScale || 1.0);
              const scrOffsetY = (devInst.screenshotOffsetY || 0) * R;

              const drawW = img.width! * scrScale;
              const drawH = img.height! * scrScale;
              const drawX = (screenNativeW - drawW) / 2;
              const drawY = (screenNativeH - drawH) / 2 + scrOffsetY;

              tempCtx.drawImage(img._element as HTMLImageElement, drawX, drawY, drawW, drawH);

              renderScreenOverlays(
                tempCtx,
                tempCanvas,
                state.showStatusBar !== false,
                state.showGlassReflection !== false,
                isLightDevice
              );

              const croppedImg = new FabricImage(tempCanvas, {
                originX: 'left',
                originY: 'top',
              });

              // 屏幕区域左上角在边框原始像素坐标系中的位置，转换为以边框中心为原点的 group 本地坐标
              // (originX/Y 均为 'left'/'top'，故只需将原始像素坐标平移 -frameNative/2 再乘以缩放系数)
              croppedImg.set({
                left: ((dev.frameOffsetX || 0) - frameNativeW / 2) * frameScale,
                top: ((dev.frameOffsetY || 0) - frameNativeH / 2) * frameScale,
                scaleX: frameScale,
                scaleY: frameScale,
              });

              // 显式给截图裁出圆角安全边距：真机边框 PNG 挖空区域的圆角起点与
              // frameOffsetX/Y 声明的矩形边界并不完全贴合 (镜头/机身弧面高光过渡带)，
              // 若完全依赖边框自身 alpha 蒙版，截图的直角会从缝隙中露出边框之外。
              // clipPath 坐标系以被裁剪对象 (croppedImg，即整张 tempCanvas) 的中心为原点，
              // 与其 originX/Y 设置无关，故直接以 0,0 为中心即可，无需换算 origin。
              const cornerInset = 6;
              const cornerRadiusPx = screenNativeW * (dev.screenCornerRadiusPct ?? 0.06);
              croppedImg.clipPath = new Rect({
                left: 0,
                top: 0,
                width: screenNativeW - cornerInset * 2,
                height: screenNativeH - cornerInset * 2,
                rx: cornerRadiusPx,
                ry: cornerRadiusPx,
                originX: 'center',
                originY: 'center',
              });

              groupParts.push(croppedImg);
            } catch (error) {
              console.error('Failed to load screenshot image in Fabric.js', error);
            }
          }

          frameImg.set({
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
            scaleX: frameScale,
            scaleY: frameScale,
          });
          groupParts.push(frameImg);
        } catch (error) {
          console.error('Failed to load real device frame image', error);
        }
      } else {

      // Bezel 外边框
      const bezelOuter = new Rect({
        left: 0,
        top: 0,
        width: devWidth,
        height: devHeight,
        rx: cornerRadius,
        ry: cornerRadius,
        fill: buildFrameGradient(frameColors.stops, devWidth, devHeight),
        stroke: frameColors.stroke,
        strokeWidth: 6 * R,
        originX: 'center',
        originY: 'center',
      });
      groupParts.push(bezelOuter);

      // Bezel 内屏黑边
      const bezelInner = new Rect({
        left: 0,
        top: 0,
        width: devWidth - (screenBorderWidth * 2),
        height: devHeight - (screenBorderWidth * 2),
        rx: cornerRadius - 8 * devScale * R,
        ry: cornerRadius - 8 * devScale * R,
        fill: '#000000',
        originX: 'center',
        originY: 'center',
      });
      groupParts.push(bezelInner);

      // 6C. 载入内屏截图并应用几何形变裁切
      if (devInst.screenshotSrc) {
        try {
          const screenWidth = devWidth - (screenBorderWidth * 2) - 4 * R;
          const screenHeight = devHeight - (screenBorderWidth * 2) - 4 * R;

          // 1. 载入原始图片
          const img = await FabricImage.fromURL(devInst.screenshotSrc);

          // 2. 创建离线 Canvas 进行高保真区域裁剪与缩放，防止溢出边框影响 Group 中心点计算
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = screenWidth;
          tempCanvas.height = screenHeight;
          const tempCtx = tempCanvas.getContext('2d')!;

          const scaleX = screenWidth / img.width!;
          const scaleY = screenHeight / img.height!;
          const scale = Math.max(scaleX, scaleY);

          const scrScale = scale * (devInst.screenshotScale || 1.0);
          const scrOffsetY = (devInst.screenshotOffsetY || 0) * R;

          const drawW = img.width! * scrScale;
          const drawH = img.height! * scrScale;
          const drawX = (screenWidth - drawW) / 2;
          const drawY = (screenHeight - drawH) / 2 + scrOffsetY;

          // 将裁剪缩放后的截图绘制到离线 canvas 上
          tempCtx.drawImage(img._element as HTMLImageElement, drawX, drawY, drawW, drawH);

          // 绘制极简状态栏 与 玻璃反射光效
          renderScreenOverlays(
            tempCtx,
            tempCanvas,
            state.showStatusBar !== false,
            state.showGlassReflection !== false,
            isLightDevice
          );

          // 3. 从离线 canvas 创建 Fabric 图像对象，此对象的宽高刚好等于屏幕宽高，绝不溢出
          const croppedImg = new FabricImage(tempCanvas, {
            left: 0,
            top: 0,
            originX: 'center',
            originY: 'center',
          });

          // 4. 为其应用相对圆角裁剪
          const clipPath = new Rect({
            left: 0,
            top: 0,
            width: screenWidth,
            height: screenHeight,
            rx: cornerRadius - 10 * devScale * R,
            ry: cornerRadius - 10 * devScale * R,
            originX: 'center',
            originY: 'center',
          });

          croppedImg.clipPath = clipPath;
          groupParts.push(croppedImg);
        } catch (error) {
          console.error('Failed to load screenshot image in Fabric.js', error);
        }
      }

      // 6D. 顶部传感器区域渲染 (灵动岛 / Android 打孔摄像头 / iPad Face ID 挖孔条)
      if (dev.sensorType === 'island') {
        const islandWidth = 160 * devScale * R;
        const islandHeight = 36 * devScale * R;
        const island = new Rect({
          left: 0,
          top: -devHeight / 2 + screenBorderWidth + 16 * devScale * R + islandHeight / 2,
          width: islandWidth,
          height: islandHeight,
          rx: 18 * devScale * R,
          ry: 18 * devScale * R,
          fill: '#000000',
          originX: 'center',
          originY: 'center',
        });
        groupParts.push(island);
      } else if (dev.sensorType === 'punchHole') {
        const holeRadius = 12 * devScale * R;
        const punchHole = new Circle({
          left: 0,
          top: -devHeight / 2 + screenBorderWidth + 22 * devScale * R,
          radius: holeRadius,
          fill: '#000000',
          originX: 'center',
          originY: 'center',
        });
        groupParts.push(punchHole);
      } else if (dev.sensorType === 'faceIdBar') {
        const barWidth = 90 * devScale * R;
        const barHeight = 10 * devScale * R;
        const faceIdBar = new Rect({
          left: 0,
          top: -devHeight / 2 + screenBorderWidth + 14 * devScale * R + barHeight / 2,
          width: barWidth,
          height: barHeight,
          rx: barHeight / 2,
          ry: barHeight / 2,
          fill: '#000000',
          originX: 'center',
          originY: 'center',
        });
        groupParts.push(faceIdBar);
      }

      // 6E. 手机侧边音量与电源按键 (参考 fastlane/Snapframe 真机细节，仅手机机型显示)
      if (dev.showSideButtons) {
        const buttonDepth = devWidth * 0.016;
        const volumeButtonHeight = devHeight * 0.05;
        const powerButtonHeight = devHeight * 0.065;

        // 左侧音量上 / 音量下
        [0.15, 0.245].forEach((topFrac) => {
          groupParts.push(new Rect({
            left: -devWidth / 2 - buttonDepth / 2,
            top: -devHeight / 2 + devHeight * topFrac,
            width: buttonDepth,
            height: volumeButtonHeight,
            rx: buttonDepth / 2,
            ry: buttonDepth / 2,
            fill: frameColors.stroke,
            originX: 'center',
            originY: 'center',
          }));
        });

        // 右侧电源键
        groupParts.push(new Rect({
          left: devWidth / 2 + buttonDepth / 2,
          top: -devHeight / 2 + devHeight * 0.18,
          width: buttonDepth,
          height: powerButtonHeight,
          rx: buttonDepth / 2,
          ry: buttonDepth / 2,
          fill: frameColors.stroke,
          originX: 'center',
          originY: 'center',
        }));
      }
      } // end else (手绘矢量外壳渲染路径)

      // 创建统一的设备 Group
      const deviceGroup = new Group(groupParts, {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        angle: devInst.angle,
        skewX: devInst.skewX,
        shadow: deviceShadow,
        selectable: true,
        hoverCursor: 'move',
      });
      // 标记角色 + 所属设备 id，供 App.tsx 的 object:modified 处理函数反解回 offsetX/offsetY/scale/angle
      (deviceGroup as unknown as { data: Record<string, unknown> }).data = { role: 'device', deviceId: devInst.id };
      // 仅保留四角缩放 + 旋转手柄，隐藏四边中点手柄 (机型整体等比缩放，不支持单轴拉伸变形)
      deviceGroup.setControlsVisibility({ ml: false, mr: false, mt: false, mb: false });

      canvas.add(deviceGroup);
    }
  }

  // 重新渲染画布
  canvas.requestRenderAll();
};

// 拖拽/缩放/旋转手柄操作结束后 (object:modified) 的最终变换值
export interface ObjectTransformSnapshot {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  angle: number;
}

/**
 * 将设备 Group 手柄操作后的最终变换 (left/top/scaleX/scaleY/angle，均为画布绝对坐标)
 * 反解回 DeviceInstance 的 offsetX/offsetY/scale/angle 字段。
 * 反解公式与 updateCanvas 中构造 centerX/centerY 的公式严格对应，保证下一次重建渲染出
 * 与手柄操作结束时视觉一致的结果 (数值上做了轻微精度舍入)。
 */
export function computeDeviceTransformUpdate(
  target: ObjectTransformSnapshot,
  dev: DeviceInstance,
  layoutMode: 'text-top' | 'text-bottom' | 'full-device',
  canvasWidth: number,
  canvasHeight: number,
  lastTitleHeight: number = 0,
  lastSubtitleHeight: number = 0
): Partial<DeviceInstance> {
  const R = canvasHeight / 2208;
  const deviceMeta = DEVICE_DB[dev.deviceModel] || DEVICE_DB.iphone_16_pro;
  const avgScale = (target.scaleX + target.scaleY) / 2;
  const newScale = Math.max(0.1, (dev.scale || 1) * avgScale);
  const newDevHeight = deviceMeta.height * newScale * R;

  // 与 updateCanvas 中的动态文案块基准线保持严格一致，否则拖拽/缩放结束后
  // 下一次重建渲染会因基准不一致而发生"跳位"。
  const titleTop = 180 * R;
  const textBlockBottom = titleTop + lastTitleHeight + 24 * R + lastSubtitleHeight;
  let baseY = textBlockBottom + TEXT_TO_DEVICE_GAP * R;
  if (layoutMode === 'text-bottom') baseY = 220 * R;

  let newOffsetY: number;
  if (layoutMode === 'full-device') {
    newOffsetY = (target.top - canvasHeight / 2) / R;
  } else {
    newOffsetY = (target.top - baseY - newDevHeight / 2) / R;
  }
  const newOffsetX = (target.left - canvasWidth / 2) / R;

  return {
    scale: Math.round(newScale * 1000) / 1000,
    angle: Math.round(target.angle * 100) / 100,
    offsetX: Math.round(newOffsetX),
    offsetY: Math.round(newOffsetY),
  };
}

/**
 * 计算设备外壳在画布绝对坐标系下的矩形范围 (中心点 + 宽高)，公式与 updateCanvas 中
 * 构造 centerX/centerY/devWidth/devHeight 严格对应。供 App.tsx 在无截图时定位
 * "导入应用截图" 空状态提示的位置/尺寸，使其能随缩放比例与设备拖拽/缩放同步跟随，
 * 而不是固定叠加在视口中央 (避免视觉上显得与画布比例脱节、突兀)。
 */
export function computeDeviceRect(
  dev: DeviceInstance,
  layoutMode: 'text-top' | 'text-bottom' | 'full-device',
  canvasWidth: number,
  canvasHeight: number,
  lastTitleHeight: number = 0,
  lastSubtitleHeight: number = 0
): { centerX: number; centerY: number; width: number; height: number } {
  const R = canvasHeight / 2208;
  const deviceMeta = DEVICE_DB[dev.deviceModel] || DEVICE_DB.iphone_16_pro;
  const devScale = dev.scale || 1.0;
  const devWidth = deviceMeta.width * devScale * R;
  const devHeight = deviceMeta.height * devScale * R;

  const titleTop = 180 * R;
  const textBlockBottom = layoutMode === 'text-bottom' ? titleTop : titleTop + lastTitleHeight + 24 * R + lastSubtitleHeight;
  let baseY = textBlockBottom + TEXT_TO_DEVICE_GAP * R;
  if (layoutMode === 'text-bottom') baseY = 220 * R;

  const centerX = canvasWidth / 2 + dev.offsetX * R;
  let centerY = baseY + devHeight / 2 + dev.offsetY * R;
  if (layoutMode === 'full-device') centerY = canvasHeight / 2 + dev.offsetY * R;

  return { centerX, centerY, width: devWidth, height: devHeight };
}

/**
 * 将标题/副标题手柄操作后的最终变换反解回 titleOffsetX/Y/Angle (或 subtitle 对应字段) +
 * 新字号。角标缩放手柄的 scaleX/scaleY 平均值直接乘算到当前字号上，随后手柄自身的
 * scale 会在下一次重建时被重置为 1 (视觉上无缝衔接，字体保持清晰矢量渲染而非拉伸位图)。
 */
export function computeTextTransformUpdate(
  target: ObjectTransformSnapshot,
  role: 'title' | 'subtitle',
  layoutMode: 'text-top' | 'text-bottom' | 'full-device',
  canvasHeight: number,
  currentFontSize: number,
  lastTitleHeight: number
): { offsetX: number; offsetY: number; angle: number; fontSize: number } {
  const R = canvasHeight / 2208;
  let titleTop = 180 * R;
  if (layoutMode === 'text-bottom') titleTop = 1620 * R;

  const avgScale = (target.scaleX + target.scaleY) / 2;
  const newFontSize = Math.max(8, Math.round(currentFontSize * avgScale));

  if (role === 'title') {
    return {
      offsetX: Math.round((target.left - 80 * R) / R),
      offsetY: Math.round((target.top - titleTop) / R),
      angle: Math.round(target.angle * 100) / 100,
      fontSize: newFontSize,
    };
  }

  const subtitleBaseTop = titleTop + lastTitleHeight + 24 * R;
  return {
    offsetX: Math.round((target.left - 120 * R) / R),
    offsetY: Math.round((target.top - subtitleBaseTop) / R),
    angle: Math.round(target.angle * 100) / 100,
    fontSize: newFontSize,
  };
}

/**
 * 辅助函数：绘制纯色背景
 */
const drawSolidBackground = (canvas: Canvas, w: number, h: number, color: string) => {
  const bg = new Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    // 注意：Fabric.js v7 中所有对象的默认 originX/originY 均为 'center'，
    // 若不显式声明为 'left'/'top'，left:0,top:0 会把矩形的"中心点"钉在画布(0,0)上，
    // 导致矩形只有右下 1/4 区域落在画布可视范围内 —— 即视觉上"只填充了左上角"的根本原因。
    originX: 'left',
    originY: 'top',
    fill: color,
    selectable: false,
    hoverCursor: 'default',
  });
  canvas.add(bg);
};

/**
 * 辅助函数：根据背景明暗色，动态返回对比高反差文本颜色 (黑或白)
 */
const getContrastingColor = (hexcolor: string, bgType: 'solid' | 'gradient' | 'image' | 'panoramic'): string => {
  if (bgType === 'image' || bgType === 'panoramic') return '#0f0f0f'; // 纹理背景统一黑字
  const hex = hexcolor.replace('#', '');
  if (hex.length !== 6) return '#0f0f0f';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f0f0f' : '#ffffff';
};

/**
 * 辅助函数：将 RGB 颜色转换为 HEX 字符串
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (c: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return '#' + toHex(r) + toHex(g) + toHex(b);
};

/**
 * 辅助函数：调整 HEX 颜色的明暗度
 */
const adjustColorBrightness = (hex: string, percent: number): string => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  r = Math.min(255, Math.max(0, r + percent));
  g = Math.min(255, Math.max(0, g + percent));
  b = Math.min(255, Math.max(0, b + percent));

  return rgbToHex(r, g, b);
};

/**
 * 智能一键色彩提取算法：从上传的截图原图中采样提取代表性颜色，
 * 并智能生成和谐美观、适合商店 mockups 展示的高端背景渐变色。
 */
export const extractPaletteFromImage = (imageSrc: string): Promise<string[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(['#f5f5f4', '#e5e5e4']);
        return;
      }
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      // 1. 采样三个具有代表性的像素：TL(左上角), Center(中心区域), BR(右下角)
      const getPixelColor = (x: number, y: number) => {
        const d = ctx.getImageData(x, y, 1, 1).data;
        return rgbToHex(d[0], d[1], d[2]);
      };

      const colorTL = getPixelColor(15, 15);
      const colorCenter = getPixelColor(50, 50);
      const colorBR = getPixelColor(85, 85);

      const c1 = colorTL;
      let c2 = colorBR;

      // 2. 如果首尾色彩过于相似，采样中心点并进行亮度智能错位
      if (c1.toLowerCase() === c2.toLowerCase()) {
        c2 = adjustColorBrightness(c1, -16); // 降低 16 点亮度作为底色，生成柔和的同色系微渐变
      }

      // 返回包含 2 个渐变色及 1 个中心品牌色的数组
      resolve([c1, c2, colorCenter]);
    };
    img.onerror = () => {
      resolve(['#f5f5f4', '#e5e5e4']);
    };
    img.src = imageSrc;
  });
};
