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
}

interface DeviceMetric {
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  rx: number;
  ry: number;
  screenBorderWidth: number;
  sensorType: 'island' | 'punchHole' | 'faceIdBar' | 'none';
  showSideButtons: boolean;
  color: 'dark' | 'light' | 'gold' | 'rose_gold';
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

  if (layoutMode !== 'full-device') {
    const title = new Textbox(state.titleText || '主标题文本', {
      left: 80 * R,
      top: titleTop,
      width: canvasWidth - 160 * R,
      fontSize: state.titleFontSize * R,
      fontFamily: `${state.titleFontFamily}, Georgia, serif`,
      fontWeight: '500',
      fill: contrastingColor,
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
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
      originX: 'left',
      originY: 'top',
      selectable: false,
      splitByGrapheme: true,
    });
    canvas.add(subtitle);
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
      
      let centerY = 680 * R + devHeight / 2 + devInst.offsetY * R;
      if (layoutMode === 'text-bottom') {
        centerY = 220 * R + devHeight / 2 + devInst.offsetY * R;
      } else if (layoutMode === 'full-device') {
        centerY = canvasHeight / 2 + devInst.offsetY * R;
      }
      
      const cornerRadius = dev.rx * devScale * R;
      const screenBorderWidth = dev.screenBorderWidth * devScale * R;
      const activeDeviceColor = dev.color;
      const frameColors = FRAME_COLOR_PALETTE[activeDeviceColor];

      // 6A. 渲染毛玻璃底板 (Frosted Glass Panel)
      if (state.showFrostedGlass) {
        const glassWidth = devWidth + 100 * R;
        const glassHeight = devHeight + 120 * R;
        const glassRadius = cornerRadius + 16 * R;

        const glassShadow = new Shadow({
          color: frameColors.isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.4)',
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
          fill: frameColors.isLight ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.08)',
          stroke: frameColors.isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.15)',
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

          // 绘制极简状态栏 (Minimalist Status Bar)
          if (state.showStatusBar !== false) {
            const sbHeight = Math.max(24, Math.floor(tempCanvas.height * 0.038));
            const padding = Math.max(12, Math.floor(tempCanvas.width * 0.06));
            
            // 智能提取状态栏下背景色亮度，自动调整黑白高对比图标文字
            let isLightBg = false;
            try {
              const pixel = tempCtx.getImageData(padding, sbHeight / 2, 1, 1).data;
              const brightness = (pixel[0] * 299 + pixel[1] * 587 + pixel[2] * 114) / 1000;
              isLightBg = brightness > 140;
            } catch (e) {
              isLightBg = frameColors.isLight;
            }
            const sbColor = isLightBg ? '#111111' : '#ffffff';

            // 绘制左侧时间
            tempCtx.font = `600 ${Math.max(11, Math.floor(sbHeight * 0.4))}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
            tempCtx.fillStyle = sbColor;
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText('9:41', padding, sbHeight / 2);

            // 绘制右侧电池电量
            const batW = 20;
            const batH = 10;
            const batX = tempCanvas.width - padding - batW;
            const batY = (sbHeight - batH) / 2;
            tempCtx.strokeStyle = sbColor;
            tempCtx.lineWidth = 1;
            tempCtx.strokeRect(batX, batY, batW, batH);
            // 填充电池容量
            tempCtx.fillStyle = sbColor;
            tempCtx.fillRect(batX + 2, batY + 2, 13, 6);
            // 电池触极
            tempCtx.fillRect(batX + batW, batY + 3, 2, 4);

            // 绘制右侧信号条
            const sigX = batX - 22;
            const sigY = (sbHeight - 10) / 2;
            tempCtx.fillStyle = sbColor;
            for (let bar = 0; bar < 4; bar++) {
              const barH = 2 + bar * 2.5;
              tempCtx.fillRect(sigX + bar * 3.5, sigY + (10 - barH), 2, barH);
            }

            // 绘制右侧 Wifi 图标
            const wifiX = sigX - 18;
            const wifiY = sbHeight / 2;
            tempCtx.strokeStyle = sbColor;
            tempCtx.lineWidth = 1.2;
            tempCtx.lineCap = 'round';
            // 最小弧
            tempCtx.beginPath();
            tempCtx.arc(wifiX, wifiY + 3, 2, Math.PI * 1.25, Math.PI * 1.75);
            tempCtx.stroke();
            // 中等弧
            tempCtx.beginPath();
            tempCtx.arc(wifiX, wifiY + 3, 5, Math.PI * 1.25, Math.PI * 1.75);
            tempCtx.stroke();
            // 最大弧
            tempCtx.beginPath();
            tempCtx.arc(wifiX, wifiY + 3, 8, Math.PI * 1.25, Math.PI * 1.75);
            tempCtx.stroke();
          }

          // 绘制屏幕玻璃反射 (Glass Reflection Glare)
          if (state.showGlassReflection !== false) {
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
