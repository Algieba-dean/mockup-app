import { Canvas, Rect, Textbox, FabricImage, Group, Shadow, Gradient, filters } from 'fabric';

export interface CanvasState {
  bgType: 'solid' | 'gradient' | 'image';
  bgColor: string;
  bgGradient?: string[]; // Array of hex strings, e.g. ['#f5f5f4', '#e5e5e4']
  bgImageSrc?: string;
  bgBlur: number;
  showFrostedGlass: boolean;
  deviceModel: string;
  deviceColor: 'dark' | 'light';
  titleText: string;
  subtitleText: string;
  titleFontSize: number;
  subtitleFontSize: number;
  titleFontFamily: string;
  subtitleFontFamily: string;
}

interface DeviceMetric {
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  rx: number;
  ry: number;
  screenBorderWidth: number;
  hasIsland: boolean;
  color: 'dark' | 'light';
}

const DEVICE_DB: Record<string, DeviceMetric> = {
  iphone_16_pro: {
    width: 620,
    height: 1260,
    screenWidth: 592,
    screenHeight: 1232,
    rx: 45,
    ry: 45,
    screenBorderWidth: 14,
    hasIsland: true,
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
    hasIsland: true,
    color: 'light',
  },
  ipad_pro: {
    width: 900,
    height: 1200,
    screenWidth: 840,
    screenHeight: 1140,
    rx: 24,
    ry: 24,
    screenBorderWidth: 30,
    hasIsland: false,
    color: 'light',
  },
  google_pixel: {
    width: 620,
    height: 1260,
    screenWidth: 588,
    screenHeight: 1228,
    rx: 40,
    ry: 40,
    screenBorderWidth: 16,
    hasIsland: false,
    color: 'dark',
  },
};

export const updateCanvas = async (
  canvas: Canvas,
  state: CanvasState,
  screenshotSrc?: string
) => {
  // 1. 清空画布
  canvas.clear();

  // 设置统一的输出分辨率 (App Store 6.5" 适配规范比率)
  const canvasWidth = 1242;
  const canvasHeight = 2208;
  canvas.setDimensions({ width: canvasWidth, height: canvasHeight });

  // 2. 绘制画布背景
  if (state.bgType === 'image' && state.bgImageSrc) {
    try {
      const bgImg = await FabricImage.fromURL(state.bgImageSrc);
      const scaleX = canvasWidth / bgImg.width!;
      const scaleY = canvasHeight / bgImg.height!;
      const scale = Math.max(scaleX, scaleY);
      
      bgImg.set({
        left: (canvasWidth - bgImg.width! * scale) / 2,
        top: (canvasHeight - bgImg.height! * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        hoverCursor: 'default',
      });

      // 应用背景模糊滤镜 (Gaussian Blur)
      if (state.bgBlur > 0) {
        const blurFilter = new filters.Blur({ blur: state.bgBlur / 30 });
        bgImg.filters.push(blurFilter);
        bgImg.applyFilters();
      }
      canvas.add(bgImg);
    } catch (error) {
      console.error('Failed to load template background image', error);
      // 回退纯色背景
      drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
    }
  } else if (state.bgType === 'gradient' && state.bgGradient && state.bgGradient.length >= 2) {
    const gradientBackground = new Rect({
      left: 0,
      top: 0,
      width: canvasWidth,
      height: canvasHeight,
      selectable: false,
      hoverCursor: 'default',
    });

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
  } else {
    // 默认纯色背景
    drawSolidBackground(canvas, canvasWidth, canvasHeight, state.bgColor);
  }

  // 辅助计算对比高亮色
  const contrastingColor = getContrastingColor(state.bgColor, state.bgType);

  // 3. 绘制主标题
  const title = new Textbox(state.titleText || '主标题文本', {
    left: 80,
    top: 180,
    width: canvasWidth - 160,
    fontSize: state.titleFontSize,
    fontFamily: `${state.titleFontFamily}, Georgia, serif`,
    fontWeight: '500',
    fill: contrastingColor,
    textAlign: 'center',
    selectable: false,
    splitByGrapheme: true,
  });
  canvas.add(title);

  // 4. 绘制副标题
  const subtitleColor = contrastingColor === '#0f0f0f' ? '#575756' : '#d4d4d8';
  const subtitle = new Textbox(state.subtitleText || '这里是您的副标题文本说明', {
    left: 120,
    top: 180 + title.height! + 24,
    width: canvasWidth - 240,
    fontSize: state.subtitleFontSize,
    fontFamily: `${state.subtitleFontFamily}, -apple-system, sans-serif`,
    fontWeight: '300',
    fill: subtitleColor,
    textAlign: 'center',
    selectable: false,
    splitByGrapheme: true,
  });
  canvas.add(subtitle);

  // 5. 根据机型数据库获取设备适配参数
  const dev = DEVICE_DB[state.deviceModel] || DEVICE_DB.iphone_16_pro;
  const devWidth = dev.width;
  const devHeight = dev.height;
  const devLeft = (canvasWidth - devWidth) / 2;
  const devTop = 640;
  const cornerRadius = dev.rx;
  const screenBorderWidth = dev.screenBorderWidth;
  const activeDeviceColor = dev.color;

  // 6. 绘制圆角毛玻璃背板 (Frosted Glass Panel Effect)
  if (state.showFrostedGlass) {
    const glassWidth = devWidth + 120;
    const glassHeight = devHeight + 140;
    const glassLeft = devLeft - 60;
    const glassTop = devTop - 70;
    const glassRadius = cornerRadius + 20;

    const glassShadow = new Shadow({
      color: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.4)',
      blur: 50,
      offsetX: 0,
      offsetY: 10,
    });

    const glassPanel = new Rect({
      left: glassLeft,
      top: glassTop,
      width: glassWidth,
      height: glassHeight,
      rx: glassRadius,
      ry: glassRadius,
      fill: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
      stroke: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
      strokeWidth: 1.5,
      shadow: glassShadow,
      selectable: false,
      hoverCursor: 'default',
    });

    canvas.add(glassPanel);
  }

  // 7. 绘制手机外壳边缘投影
  const deviceShadow = new Shadow({
    color: 'rgba(0, 0, 0, 0.35)',
    blur: 40,
    offsetX: 0,
    offsetY: 15,
  });

  // A. 外壳边缘主体
  const bezelOuter = new Rect({
    left: devLeft,
    top: devTop,
    width: devWidth,
    height: devHeight,
    rx: cornerRadius,
    ry: cornerRadius,
    fill: activeDeviceColor === 'light' ? '#f5f5f4' : '#18181b',
    stroke: activeDeviceColor === 'light' ? '#d4d4d8' : '#27272a',
    strokeWidth: 6,
    shadow: deviceShadow,
    selectable: false,
  });

  // B. 屏幕黑色内侧边缘
  const bezelInner = new Rect({
    left: devLeft + screenBorderWidth,
    top: devTop + screenBorderWidth,
    width: devWidth - (screenBorderWidth * 2),
    height: devHeight - (screenBorderWidth * 2),
    rx: cornerRadius - 8,
    ry: cornerRadius - 8,
    fill: '#000000',
    selectable: false,
  });

  // C. 动态岛 (Dynamic Island)
  const islandWidth = 160;
  const islandHeight = 36;
  const island = new Rect({
    left: devLeft + (devWidth - islandWidth) / 2,
    top: devTop + screenBorderWidth + 16,
    width: islandWidth,
    height: islandHeight,
    rx: 18,
    ry: 18,
    fill: '#000000',
    selectable: false,
  });

  // 将手机边框组件合为一组
  const deviceGroup = new Group([bezelOuter, bezelInner], {
    selectable: false,
    hoverCursor: 'default',
  });
  canvas.add(deviceGroup);

  // 8. 加载截图并裁切贴合至手机屏幕
  if (screenshotSrc) {
    try {
      const img = await FabricImage.fromURL(screenshotSrc);

      const screenWidth = devWidth - (screenBorderWidth * 2) - 4;
      const screenHeight = devHeight - (screenBorderWidth * 2) - 4;
      const screenLeft = devLeft + screenBorderWidth + 2;
      const screenTop = devTop + screenBorderWidth + 2;

      const scaleX = screenWidth / img.width!;
      const scaleY = screenHeight / img.height!;
      const scale = Math.max(scaleX, scaleY);

      img.set({
        left: screenLeft + (screenWidth - img.width! * scale) / 2,
        top: screenTop + (screenHeight - img.height! * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
      });

      const clipPath = new Rect({
        left: screenLeft,
        top: screenTop,
        width: screenWidth,
        height: screenHeight,
        rx: cornerRadius - 10,
        ry: cornerRadius - 10,
        absolutePositioned: true,
      });

      img.clipPath = clipPath;
      canvas.add(img);
    } catch (error) {
      console.error('Failed to load screenshot image in Fabric.js', error);
    }
  }

  // 9. 如果是 iPhone，在最上方渲染动态岛，避免被截图遮挡
  if (dev.hasIsland) {
    canvas.add(island);
  }

  // 重新渲染画布
  canvas.requestRenderAll();
};

/**
 * 辅助函数：绘制纯色背景
 */
const drawSolidBackground = (canvas: Canvas, w: number, h: number, color: string) => {
  const bg = new Rect({
    left: 0,
    top: 0,
    width: w,
    height: h,
    fill: color,
    selectable: false,
    hoverCursor: 'default',
  });
  canvas.add(bg);
};

/**
 * 辅助函数：根据背景明暗色，动态返回对比高反差文本颜色 (黑或白)
 */
const getContrastingColor = (hexcolor: string, bgType: 'solid' | 'gradient' | 'image'): string => {
  if (bgType === 'image') return '#0f0f0f'; // 纹理背景统一黑字
  const hex = hexcolor.replace('#', '');
  if (hex.length !== 6) return '#0f0f0f';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#0f0f0f' : '#ffffff';
};
