import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload, AlertTriangle } from 'lucide-react';

export interface IconSizeWarning {
  width: number;
  height: number;
}

interface CanvasViewportProps {
  activeTool?: string;
  zoom: number;
  setZoom: (z: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onFileDrop: (file: File) => void;
  // 可选：一次性导入多张截图 (拖入/多选文件时)，用于批量新建画幅。未提供时回退为
  // 逐个调用 onFileDrop，仅处理第一张，保持向后兼容。
  onFilesDrop?: (files: File[]) => void;
  hasScreenshots?: boolean;
  // 首个设备在画布坐标系 (设计分辨率 1242x2208) 下的矩形范围，用于将"导入应用截图"
  // 空状态提示精确定位在设备屏幕区域内，使其随缩放比例/设备拖拽缩放同步跟随
  deviceOverlayRect?: { left: number; top: number; width: number; height: number } | null;

  // Icon workspace mode
  iconCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  hasIconImage?: boolean;
  onIconFileDrop?: (file: File) => void;
  iconPlatformPreview?: 'ios' | 'android';
  setIconPlatformPreview?: (p: 'ios' | 'android') => void;
  iconWarning?: IconSizeWarning | null;
  iconPadding?: number;
  setIconPadding?: (p: number) => void;
  iconPaddingY?: number;
  setIconPaddingY?: (p: number) => void;
  iconOffsetX?: number;
  setIconOffsetX?: (v: number) => void;
  iconOffsetY?: number;
  setIconOffsetY?: (v: number) => void;
  iconContentScale?: number;
  setIconContentScale?: (v: number | ((prev: number) => number)) => void;
}

const ICON_PADDING_MIN = 0;
const ICON_PADDING_MAX = 0.4;
const ICON_DISPLAY_SIZE = 300;

// 编辑画布的固定设计分辨率 (与 App.tsx 中 new Canvas({ width: 1242, height: 2208 }) 保持一致)
const EDITOR_CANVAS_WIDTH = 1242;
const EDITOR_CANVAS_HEIGHT = 2208;
// 画布外层留白 (对应下方 wrapper 的 padding: '40px 40px 100px 40px')
const VIEWPORT_PADDING_X = 80;
const VIEWPORT_PADDING_Y = 140;

/**
 * Curated Android adaptive-icon mask shapes, referencing the shape catalog
 * researched by NotWoods/maskable (the industry-standard maskable-icon
 * preview tool). Real OEM launchers (Pixel/AOSP, Samsung One UI, and other
 * skins) each apply a different mask to the same adaptive icon layers, so
 * previewing more than a single circle is necessary to catch content that
 * would be cropped on some devices but not others.
 *
 * `circle` matches Android's official Adaptive Icon safe zone (a 66dp
 * circle centered on the 108dp canvas, i.e. 66/108 ≈ 61% diameter / 17%
 * inset) — the one shape every icon is guaranteed to satisfy. The other
 * shapes are looser (larger visible area) illustrative references for how
 * more lenient OEM masks reveal extra content; they are not a replacement
 * for keeping key content inside the circle.
 */
type AndroidMaskShapeId = 'circle' | 'squircle' | 'drop' | 'square';

interface AndroidMaskShape {
  id: AndroidMaskShapeId;
  label: string;
  /** SVG path `d` in a 0-100 viewBox, used as the transparent cutout inside the dimming scrim. */
  path: string;
}

const ANDROID_MASK_SHAPES: AndroidMaskShape[] = [
  {
    id: 'circle',
    label: '圆形（官方安全区）',
    // r = 33, centered at (50,50) -> 17% inset, matches Android's 66dp/108dp safe zone
    path: 'M50,17 A33,33 0 1 0 50,83 A33,33 0 1 0 50,17 Z',
  },
  {
    id: 'squircle',
    label: '圆润方形',
    // Inset 12%, corner radius 22 (rounded-square, e.g. Samsung One UI style)
    path: 'M34,12 H66 A22,22 0 0 1 88,34 V66 A22,22 0 0 1 66,88 H34 A22,22 0 0 1 12,66 V34 A22,22 0 0 1 34,12 Z',
  },
  {
    id: 'drop',
    label: '水滴形',
    // Same bounds as squircle, but one sharp corner (bottom-right) — some OEM skins
    path: 'M34,12 H66 A22,22 0 0 1 88,34 V88 H34 A22,22 0 0 1 12,66 V34 A22,22 0 0 1 34,12 Z',
  },
  {
    id: 'square',
    label: '方形（宽松遮罩）',
    // Inset 8%, minimal corner rounding — the most lenient common OEM mask
    path: 'M14,8 H86 A6,6 0 0 1 92,14 V86 A6,6 0 0 1 86,92 H14 A6,6 0 0 1 8,86 V14 A6,6 0 0 1 14,8 Z',
  },
];

export const CanvasViewport: React.FC<CanvasViewportProps> = React.memo(({
  activeTool = 'screenshots',
  zoom,
  setZoom,
  canvasRef,
  onFileDrop,
  onFilesDrop,
  hasScreenshots = false,
  deviceOverlayRect = null,
  iconCanvasRef,
  hasIconImage = false,
  onIconFileDrop,
  iconPlatformPreview = 'ios',
  setIconPlatformPreview,
  iconWarning = null,
  iconPadding = 0.12,
  setIconPadding,
  setIconPaddingY,
  iconOffsetX = 0,
  setIconOffsetX,
  iconOffsetY = 0,
  setIconOffsetY,
  iconContentScale = 1,
  setIconContentScale,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [androidMaskShapeId, setAndroidMaskShapeId] = useState<AndroidMaskShapeId>('circle');
  const emptyStateFileRef = useRef<HTMLInputElement>(null);
  const iconFileRef = useRef<HTMLInputElement>(null);
  const iconFileEmptyRef = useRef<HTMLInputElement>(null);

  // 自适应视口缩放：容器可用空间会随窗口/侧边栏宽度变化，硬编码固定百分比 (如之前的
  // 30%) 在较小视口下会导致画布顶部/底部被裁到滚动区域之外，看起来像"文字消失了"。
  // 这里改为测量滚动容器实际尺寸，自动算出刚好完整显示整张画布的缩放比例。
  // 仅在用户尚未手动调整过缩放时才自动纠正，避免打断用户主动缩放的操作。
  const screenshotScrollRef = useRef<HTMLDivElement>(null);
  const userAdjustedZoomRef = useRef(false);

  useEffect(() => {
    const container = screenshotScrollRef.current;
    if (!container || activeTool !== 'screenshots') return;

    const recalcFit = () => {
      if (userAdjustedZoomRef.current) return;
      const availableWidth = container.clientWidth - VIEWPORT_PADDING_X;
      const availableHeight = container.clientHeight - VIEWPORT_PADDING_Y;
      if (availableWidth <= 0 || availableHeight <= 0) return;
      const fitRatio = Math.min(availableWidth / EDITOR_CANVAS_WIDTH, availableHeight / EDITOR_CANVAS_HEIGHT);
      const fitPercent = Math.max(10, Math.min(200, Math.floor(fitRatio * 100)));
      setZoom(fitPercent);
    };

    recalcFit();
    const observer = new ResizeObserver(recalcFit);
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  const markZoomAdjustedByUser = () => {
    userAdjustedZoomRef.current = true;
  };

  // Drag and zoom interaction tracking
  const [isPointerDown, setIsPointerDown] = useState(false);
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const offsetStartRef = useRef({ x: 0, y: 0 });
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const initialDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  const handleZoomIn = () => { markZoomAdjustedByUser(); setZoom(Math.min(zoom + 10, 200)); };
  const handleZoomOut = () => { markZoomAdjustedByUser(); setZoom(Math.max(zoom - 10, 10)); };
  const handleZoomReset = () => { markZoomAdjustedByUser(); setZoom(100); };

  // Ctrl/Cmd + 滚轮缩放画布 (浏览器会将触控板双指缩放手势合成为携带 ctrlKey 的 wheel 事件，
  // 因此同一处理逻辑同时覆盖了「按住 Ctrl 滚轮」与「触控板手势缩放」两种输入方式)。
  // 不按修饰键时保留默认滚动行为，用于在放大后平移画布。
  // 用原生 addEventListener 而非 React 的 onWheel 挂载：React 17+ 默认以 passive
  // 监听器绑定 wheel 事件，其中调用 preventDefault() 只会抛出警告而不会真正生效，
  // 导致缩放的同时画布还会跟着滚动。这里显式传 { passive: false } 才能真正拦截默认滚动。
  const zoomRef = useRef(zoom);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);

  useEffect(() => {
    const container = screenshotScrollRef.current;
    if (!container) return;
    const onWheelZoom = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      userAdjustedZoomRef.current = true;
      const step = Math.round(e.deltaY * -0.15) || (e.deltaY < 0 ? 2 : -2);
      setZoom(Math.min(200, Math.max(10, zoomRef.current + step)));
    };
    container.addEventListener('wheel', onWheelZoom, { passive: false });
    return () => container.removeEventListener('wheel', onWheelZoom);
  }, [setZoom]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const imageFiles = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;
    if (onFilesDrop) {
      onFilesDrop(imageFiles);
    } else {
      onFileDrop(imageFiles[0]);
    }
  };

  // Icon handlers defined globally in the component
  const handleIconDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onIconFileDrop?.(file);
    }
  };

  const clampPadding = (p: number) => Math.min(ICON_PADDING_MAX, Math.max(ICON_PADDING_MIN, p));
  const handleIconZoomIn = () => setIconPadding?.(clampPadding(iconPadding - 0.02));
  const handleIconZoomOut = () => setIconPadding?.(clampPadding(iconPadding + 0.02));
  const handleIconZoomReset = () => {
    setIconPadding?.(0.12);
    setIconPaddingY?.(0.12);
    setIconOffsetX?.(0);
    setIconOffsetY?.(0);
    setIconContentScale?.(1);
  };
  const zoomPercent = Math.round((1 - iconPadding / ICON_PADDING_MAX) * 100);
  const activeAndroidMaskShape = ANDROID_MASK_SHAPES.find((s) => s.id === androidMaskShapeId) ?? ANDROID_MASK_SHAPES[0];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1) {
      setIsPointerDown(true);
      pointerStartRef.current = { x: e.clientX, y: e.clientY };
      offsetStartRef.current = { x: iconOffsetX, y: iconOffsetY };
    } else if (activePointersRef.current.size === 2) {
      const pointers = Array.from(activePointersRef.current.values());
      const dx = pointers[0].x - pointers[1].x;
      const dy = pointers[0].y - pointers[1].y;
      initialDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
      initialScaleRef.current = iconContentScale;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 1 && isPointerDown) {
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      const scaleFactor = 512 / ICON_DISPLAY_SIZE;
      setIconOffsetX?.(offsetStartRef.current.x + (dx * scaleFactor) / 512);
      setIconOffsetY?.(offsetStartRef.current.y + (dy * scaleFactor) / 512);
    } else if (activePointersRef.current.size === 2 && initialDistanceRef.current !== null) {
      const pointers = Array.from(activePointersRef.current.values());
      const dx = pointers[0].x - pointers[1].x;
      const dy = pointers[0].y - pointers[1].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ratio = dist / initialDistanceRef.current;
      const nextScale = Math.min(2.0, Math.max(0.5, initialScaleRef.current * ratio));
      setIconContentScale?.(nextScale);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size === 0) {
      setIsPointerDown(false);
      initialDistanceRef.current = null;
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomStep = 0.05;
    const dir = e.deltaY < 0 ? 1 : -1;
    setIconContentScale?.((prev) => Math.min(2.0, Math.max(0.5, prev + dir * zoomStep)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const nudgeAmount = 0.01;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setIconOffsetX?.(iconOffsetX - nudgeAmount);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setIconOffsetX?.(iconOffsetX + nudgeAmount);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIconOffsetY?.(iconOffsetY - nudgeAmount);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIconOffsetY?.(iconOffsetY + nudgeAmount);
    }
  };

  return (
    <div
      className={`viewport ${isDragging ? 'drag-active' : ''}`}
      onDragOver={activeTool === 'icons' ? undefined : handleDragOver}
      onDragLeave={activeTool === 'icons' ? undefined : handleDragLeave}
      onDrop={activeTool === 'icons' ? undefined : handleDrop}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
        position: 'relative',
      }}
    >
      {/* 1. SCREENSHOTS WORKSPACE PANEL */}
      <div
        className="viewport-canvas-wrapper"
        style={{
          display: activeTool === 'screenshots' ? 'flex' : 'none',
          flex: 1,
          position: 'relative',
          // 注意：此处始终使用固定的中性工作区背景色 (与画布本身的填充解耦)，
          // 不再镶嵌 bgColor/bgGradient。此前该容器会把画布填充样式复制到整个视口面板，
          // 导致视觉上分不清"画布边界"在哪，看起来像是纯色/渐变溢出/超出了画布范围。
          // 真正的画布内容填充完全由 canvasManager.ts 在 <canvas> 内部绘制，
          // 视口容器只负责提供一个稳定的中性画布衬底，便于用户分辨画布边缘。
          backgroundColor: isDragging ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
          transition: 'background-color 0.3s ease',
          overflow: 'hidden',
          height: '100%',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          ref={screenshotScrollRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'auto',
            display: 'flex',
            padding: '40px 40px 100px 40px',
          }}
        >
          {/* 注意：不要用 alignItems/justifyContent: 'center' 做居中——当画布放大后
              尺寸超出滚动容器时，flex 居中会把内容推到滚动原点 (0,0) 的负方向，
              而 overflow:auto 无法滚动到负偏移，导致顶部/左侧被裁切到不可见区域
              (视觉上表现为被顶部工具栏遮挡)。改用子元素 margin:auto：内容小于容器
              时依旧居中，一旦超出容器则自动退化为贴靠起始边、可完整滚动查看全部内容。 */}
          <div style={{
            width: `${EDITOR_CANVAS_WIDTH * (zoom / 100)}px`,
            height: `${EDITOR_CANVAS_HEIGHT * (zoom / 100)}px`,
            position: 'relative',
            flexShrink: 0,
            margin: 'auto',
          }}>
            <div style={{
              width: `${EDITOR_CANVAS_WIDTH}px`,
              height: `${EDITOR_CANVAS_HEIGHT}px`,
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) scale(${zoom / 100})`,
              transformOrigin: 'center center',
              boxShadow: '0 8px 32px var(--shadow-color)',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <canvas ref={canvasRef} aria-label="应用商店截图实时预览，呈现您配置的设备外壳及主副标题排版" role="img" />

              {/* 空状态提示：直接叠加在设备屏幕矩形范围内 (画布设计坐标)，随该容器的
                  zoom 缩放同步缩放/跟随设备拖拽位置，而不是固定悬浮在视口中央——
                  避免小缩放比例下显得比设备本身还大、与画面比例脱节的"突兀"感。 */}
              {!hasScreenshots && !isDragging && deviceOverlayRect && (() => {
                // 该提示框位于随 zoom 整体缩放的容器内部，尺寸/字号若仅按 deviceOverlayRect
                // (画布设计坐标，未缩放) 的比例计算，会在常见的自适应缩放比例 (如 25%-35%)
                // 下缩成几像素高、完全无法阅读的文字 (根本原因)。这里换算出屏幕实际可视宽度，
                // 再对图标/字号设定"实际 CSS 像素"下限 (用 /zoomFactor 换算回设计坐标)，
                // 确保无论当前缩放多小，提示文字始终清晰可读；缩放较大时则保留原比例上限。
                const zoomFactor = Math.max(zoom, 1) / 100;
                const screenWidthCss = deviceOverlayRect.width * zoomFactor;
                const toDesignPx = (cssPx: number) => cssPx / zoomFactor;

                const iconSizeCss = Math.min(48, Math.max(22, screenWidthCss * 0.09));
                const titleFontCss = Math.min(22, Math.max(14, screenWidthCss * 0.052));
                const subtitleFontCss = Math.min(15, Math.max(12, screenWidthCss * 0.034));
                const btnFontCss = Math.min(15, Math.max(12, screenWidthCss * 0.034));
                const gapCss = Math.max(6, screenWidthCss * 0.015);
                const btnPaddingCss = Math.max(6, screenWidthCss * 0.022);

                return (
                <div style={{
                  position: 'absolute',
                  left: `${deviceOverlayRect.left}px`,
                  top: `${deviceOverlayRect.top}px`,
                  width: `${deviceOverlayRect.width}px`,
                  height: `${deviceOverlayRect.height}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '18px',
                  border: '3px dashed rgba(255,255,255,0.38)',
                  borderRadius: `${Math.min(deviceOverlayRect.width, deviceOverlayRect.height) * 0.08}px`,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  pointerEvents: 'auto',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  padding: '5%',
                }}>
                  <Upload size={toDesignPx(iconSizeCss)} strokeWidth={1.2} style={{ color: 'rgba(255,255,255,0.85)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: `${toDesignPx(gapCss)}px` }}>
                    <span style={{ fontSize: `${toDesignPx(titleFontCss)}px`, fontWeight: 600, color: 'rgba(255,255,255,0.92)', lineHeight: 1.3 }}>
                      导入应用截图
                    </span>
                    <span style={{ fontSize: `${toDesignPx(subtitleFontCss)}px`, color: 'rgba(255,255,255,0.62)', lineHeight: 1.4 }}>
                      拖拽图片到画布，或点击下方按钮
                    </span>
                  </div>
                  <input
                    ref={emptyStateFileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;
                      if (onFilesDrop) onFilesDrop(files);
                      else onFileDrop(files[0]);
                    }}
                  />
                  <button
                    className="ds-btn"
                    style={{
                      fontSize: `${toDesignPx(btnFontCss)}px`,
                      width: '70%',
                      padding: `${toDesignPx(btnPaddingCss)}px 0`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                    onClick={() => emptyStateFileRef.current?.click()}
                  >
                    <span>选择图片文件</span>
                  </button>
                </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* 兜底空状态：首次渲染完成前 deviceOverlayRect 尚未算出时短暂显示，
            或页面完全没有设备实例时的通用提示 */}
        {!hasScreenshots && !isDragging && !deviceOverlayRect && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-sticky)',
            pointerEvents: 'none',
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              padding: '24px 32px',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: '0 4px 16px var(--shadow-color)',
              pointerEvents: 'auto',
              width: '280px',
              textAlign: 'center',
              transition: 'border-color var(--transition-speed) ease',
            }}>
              <Upload size={22} strokeWidth={1.2} style={{ color: 'var(--ink-secondary)', marginBottom: '4px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)' }}>
                  导入应用截图
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
                  拖拽图片到画布，或点击下方按钮
                </span>
              </div>
              <input
                ref={emptyStateFileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  if (files.length === 0) return;
                  if (onFilesDrop) onFilesDrop(files);
                  else onFileDrop(files[0]);
                }}
              />
              <button
                className="ds-btn"
                style={{
                  marginTop: '6px',
                  fontSize: '11px',
                  width: '100%',
                  padding: '6px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
                onClick={() => emptyStateFileRef.current?.click()}
              >
                <span>选择图片文件</span>
              </button>
            </div>
          </div>
        )}

        {isDragging && (
          <div style={{
            position: 'absolute',
            inset: '20px',
            border: '2px dashed var(--border-focus)',
            backgroundColor: 'var(--overlay-bg-heavy)',
            color: 'var(--overlay-text)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            zIndex: 'var(--z-overlay)',
            pointerEvents: 'none',
          }}>
            <Upload size={32} />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>释放鼠标以导入应用截图</span>
          </div>
        )}

        <div className="viewport-zoom-bar">
          <button className="ds-btn ds-btn-icon-only" onClick={handleZoomOut} title="缩小" aria-label="缩小">
            <ZoomOut size={14} />
          </button>
          <span className="viewport-zoom-value" title="按住 Ctrl/Cmd 滚轮或触控板双指缩放手势也可直接缩放画布">{zoom}%</span>
          <button className="ds-btn ds-btn-icon-only" onClick={handleZoomIn} title="放大" aria-label="放大">
            <ZoomIn size={14} />
          </button>
          <button className="ds-btn ds-btn-icon-only" onClick={handleZoomReset} title="重置 100%" aria-label="重置缩放比例">
            <Maximize size={14} />
          </button>
        </div>
      </div>

      {/* 2. ICON WORKSPACE PANEL */}
      <div
        className="viewport-canvas-wrapper"
        style={{
          display: activeTool === 'icons' ? 'flex' : 'none',
          flex: 1,
          position: 'relative',
          backgroundColor: isDragging ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
          overflow: 'hidden',
          height: '100%',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleIconDrop}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Top-aligned (not centered): with `overflow: auto` + `justifyContent:
          // 'center'`, content taller than the container overflows above the
          // scrollable origin and becomes unreachable (can't scroll negative),
          // clipping/hiding the platform toggle tabs at the top. Top-aligning
          // keeps the tabs always visible right below the top padding.
          justifyContent: hasIconImage ? 'flex-start' : 'center',
          gap: '20px',
          padding: hasIconImage ? '40px 40px 100px 40px' : '40px',
        }}>
          {hasIconImage ? (
            <>
              {/* 平台切换分段控件 */}
              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} role="tablist" aria-label="平台预览切换">
                <button
                  role="tab"
                  aria-selected={iconPlatformPreview === 'ios'}
                  className={`ds-btn platform-tab-btn ${iconPlatformPreview === 'ios' ? 'ds-btn-active' : ''}`}
                  style={{ padding: '6px 20px', fontSize: '12px' }}
                  onClick={() => setIconPlatformPreview?.('ios')}
                >
                  iOS
                </button>
                <button
                  role="tab"
                  aria-selected={iconPlatformPreview === 'android'}
                  className={`ds-btn platform-tab-btn ${iconPlatformPreview === 'android' ? 'ds-btn-active' : ''}`}
                  style={{ padding: '6px 20px', fontSize: '12px' }}
                  onClick={() => setIconPlatformPreview?.('android')}
                >
                  Android
                </button>
              </div>

              {/* 尺寸/比例警告条 */}
              {iconWarning && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  border: '1px solid var(--border-primary)',
                  backgroundColor: 'var(--bg-secondary)',
                  fontSize: '12px',
                  color: 'var(--ink-secondary)',
                  width: 'min(420px, 100%)',
                  flexShrink: 0,
                }}>
                  <AlertTriangle size={16} strokeWidth={1.5} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--ink-primary)' }} />
                  <span style={{ flex: 1 }}>
                    建议原图 ≥1024×1024 正方形，当前 {iconWarning.width}×{iconWarning.height}（已自动居中裁剪为正方形预览）。
                  </span>
                  <input
                    ref={iconFileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.[0]) onIconFileDrop?.(e.target.files[0]); }}
                  />
                  <button
                    className="ds-btn"
                    style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
                    onClick={() => iconFileRef.current?.click()}
                  >
                    重新上传
                  </button>
                </div>
              )}

              {/* 图标画布 + 遮罩预览层 */}
              <div
                tabIndex={0}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onWheel={handleWheel}
                onKeyDown={handleKeyDown}
                aria-label="图标编辑器预览画布。支持拖拽平移、滚轮缩放、方向键微调"
                style={{
                  width: `${ICON_DISPLAY_SIZE}px`,
                  height: `${ICON_DISPLAY_SIZE}px`,
                  position: 'relative',
                  flexShrink: 0,
                  boxShadow: '0 8px 32px var(--shadow-color)',
                  cursor: isPointerDown ? 'grabbing' : 'grab',
                  outline: 'none',
                }}
              >
                <canvas ref={iconCanvasRef} width={512} height={512} style={{ width: '100%', height: '100%', display: 'block' }} />
                {iconPlatformPreview === 'ios' ? (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '22%',
                      border: '2px dashed var(--border-focus)',
                      boxSizing: 'border-box',
                      pointerEvents: 'none',
                    }}
                  />
                ) : (
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
                  >
                    <defs>
                      <mask id="android-mask-cutout">
                        <rect width="100" height="100" fill="white" />
                        <path d={activeAndroidMaskShape.path} fill="black" />
                      </mask>
                    </defs>
                    {/* Dims everything outside the selected mask shape, so content
                        at risk of being cropped by that shape is clearly visible. */}
                    <rect width="100" height="100" fill="rgba(0,0,0,0.5)" mask="url(#android-mask-cutout)" />
                    <path d={activeAndroidMaskShape.path} fill="none" stroke="var(--border-focus)" strokeWidth="1" strokeDasharray="2,1.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                )}
              </div>

              {iconPlatformPreview === 'android' && (
                <div role="tablist" aria-label="Android 厂商遮罩形状预览" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', flexShrink: 0 }}>
                  {ANDROID_MASK_SHAPES.map((shape) => (
                    <button
                      key={shape.id}
                      role="tab"
                      aria-selected={androidMaskShapeId === shape.id}
                      className={`ds-btn ${androidMaskShapeId === shape.id ? 'ds-btn-active' : ''}`}
                      style={{ fontSize: '11px', padding: '4px 10px' }}
                      onClick={() => setAndroidMaskShapeId(shape.id)}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              )}

              <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', flexShrink: 0, maxWidth: '420px', textAlign: 'center' }}>
                {iconPlatformPreview === 'ios'
                  ? '按住画布拖动/滚轮缩放，虚线为系统圆角遮罩区域，不影响导出像素'
                  : '按住画布拖动/滚轮缩放；不同安卓厂商启动器会应用不同形状的遮罩，阴影覆盖区域为该形状下可能被裁切的部分，圆形为官方保证的最小安全区'}
              </span>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '40px 48px',
              border: '1px dashed var(--border-secondary)',
              backgroundColor: 'var(--bg-secondary)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }} aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    width: i % 4 === 0 ? '32px' : '22px',
                    height: i % 4 === 0 ? '32px' : '22px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: i % 2 === 0 ? '22%' : '50%',
                    alignSelf: 'center',
                    opacity: 0.5,
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                拖拽或点击上传应用图标原图
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', textAlign: 'center' }}>
                建议 ≥1024×1024 正方形 PNG，将自动生成 iOS / Android 全尺寸图标
              </span>
              <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', opacity: 0.8, borderTop: '1px solid var(--border-primary)', paddingTop: '8px', width: '100%', textAlign: 'center' }}>
                全部处理在本地浏览器完成，图片不会上传到任何服务器
              </span>
              <input
                ref={iconFileEmptyRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) onIconFileDrop?.(e.target.files[0]); }}
              />
              <button
                className="ds-btn"
                style={{ marginTop: '4px', fontSize: '12px' }}
                onClick={() => iconFileEmptyRef.current?.click()}
              >
                <Upload size={14} />
                <span>选择文件上传</span>
              </button>
            </div>
          )}
        </div>

        {hasIconImage && (
          <div className="viewport-zoom-bar">
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomOut} title="缩小图像" aria-label="缩小图像">
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={zoomPercent}
              onChange={(e) => setIconPadding?.((100 - parseInt(e.target.value)) / 100 * ICON_PADDING_MAX)}
              aria-label="图像缩放滑动条"
              style={{ width: '100px', accentColor: 'var(--ink-primary)' }}
            />
            <span className="viewport-zoom-value">{zoomPercent}%</span>
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomIn} title="放大图像" aria-label="放大图像">
              <ZoomIn size={14} />
            </button>
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomReset} title="重置" aria-label="重置图像位置与缩放">
              <Maximize size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
