import { Canvas, Rect, Textbox, FabricImage, Group, Shadow, Gradient, filters } from 'fabric';

export interface DeviceInstance {
  id: string;
  deviceModel: string;
  screenshotSrc?: string;
  angle: number;
  skewX: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface CanvasState {
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor: string;
  bgGradient?: string[]; // Array of hex strings
  bgImageSrc?: string;
  bgBlur: number;
  showFrostedGlass: boolean;
  devices: DeviceInstance[]; // Supports multi-device layout
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
      const scale = canvasHeight / bgImg.height!;
      
      bgImg.set({
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

  // 3. 相对定位计算对比色
  const contrastingColor = getContrastingColor(state.bgColor, state.bgType);

  // 4. 绘制主标题 (使用 R 动态比率重新计算坐标与字号)
  const titleTop = 180 * R;
  const title = new Textbox(state.titleText || '主标题文本', {
    left: 80 * R,
    top: titleTop,
    width: canvasWidth - 160 * R,
    fontSize: state.titleFontSize * R,
    fontFamily: `${state.titleFontFamily}, Georgia, serif`,
    fontWeight: '500',
    fill: contrastingColor,
    textAlign: 'center',
    selectable: false,
    splitByGrapheme: true,
  });
  canvas.add(title);

  // 5. 绘制副标题 (紧跟标题高度，动态定位)
  const subtitleColor = contrastingColor === '#0f0f0f' ? '#575756' : '#d4d4d8';
  const subtitle = new Textbox(state.subtitleText || '这里是您的副标题文本说明', {
    left: 120 * R,
    top: titleTop + title.height! + 24 * R,
    width: canvasWidth - 240 * R,
    fontSize: state.subtitleFontSize * R,
    fontFamily: `${state.subtitleFontFamily}, -apple-system, sans-serif`,
    fontWeight: '300',
    fill: subtitleColor,
    textAlign: 'center',
    selectable: false,
    splitByGrapheme: true,
  });
  canvas.add(subtitle);

  // 6. 多设备迭代渲染逻辑 (支持设备混搭与三维偏角计算)
  if (state.devices && state.devices.length > 0) {
    for (const devInst of state.devices) {
      const dev = DEVICE_DB[devInst.deviceModel] || DEVICE_DB.iphone_16_pro;
      
      // 动态比率缩放的宽、高、圆角半径
      const devScale = devInst.scale || 1.0;
      const devWidth = dev.width * devScale * R;
      const devHeight = dev.height * devScale * R;
      
      // 计算外壳在 Canvas 的绝对中心坐标
      const centerX = canvasWidth / 2 + devInst.offsetX * R;
      const centerY = 680 * R + devHeight / 2 + devInst.offsetY * R;
      
      const cornerRadius = dev.rx * devScale * R;
      const screenBorderWidth = dev.screenBorderWidth * devScale * R;
      const activeDeviceColor = dev.color;

      // 6A. 渲染毛玻璃底板 (Frosted Glass Panel)
      if (state.showFrostedGlass) {
        const glassWidth = devWidth + 100 * R;
        const glassHeight = devHeight + 120 * R;
        const glassRadius = cornerRadius + 16 * R;

        const glassShadow = new Shadow({
          color: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)',
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
          fill: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
          stroke: activeDeviceColor === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
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

      const deviceShadow = new Shadow({
        color: 'rgba(0, 0, 0, 0.35)',
        blur: 40 * R,
        offsetX: shadowX,
        offsetY: shadowY,
      });

      // 准备构成手机 Group 的各个图层（全部基于相对原点 0,0 绘制）
      const groupParts: any[] = [];

      // Bezel 外边框
      const bezelOuter = new Rect({
        left: 0,
        top: 0,
        width: devWidth,
        height: devHeight,
        rx: cornerRadius,
        ry: cornerRadius,
        fill: activeDeviceColor === 'light' ? '#f5f5f4' : '#18181b',
        stroke: activeDeviceColor === 'light' ? '#d4d4d8' : '#27272a',
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
          const img = await FabricImage.fromURL(devInst.screenshotSrc);

          const screenWidth = devWidth - (screenBorderWidth * 2) - 4 * R;
          const screenHeight = devHeight - (screenBorderWidth * 2) - 4 * R;

          const scaleX = screenWidth / img.width!;
          const scaleY = screenHeight / img.height!;
          const scale = Math.max(scaleX, scaleY);

          img.set({
            left: 0,
            top: 0,
            scaleX: scale,
            scaleY: scale,
            originX: 'center',
            originY: 'center',
          });

          // 为内屏组件添加相对圆角裁切
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

          img.clipPath = clipPath;
          groupParts.push(img);
        } catch (error) {
          console.error('Failed to load screenshot image in Fabric.js', error);
        }
      }

      // 6D. 如果有动态岛，在顶端覆盖渲染
      if (dev.hasIsland) {
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
      }

      // 创建统一的设备 Group
      const deviceGroup = new Group(groupParts, {
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        angle: devInst.angle,
        skewX: devInst.skewX,
        shadow: deviceShadow,
        selectable: false,
        hoverCursor: 'default',
      });

      canvas.add(deviceGroup);
    }
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
