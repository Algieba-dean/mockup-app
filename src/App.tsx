import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from 'fabric';
import JSZip from 'jszip';
import { Layers } from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { LeftSidebar } from './components/LeftSidebar';
import type { CustomPreset } from './components/LeftSidebar';
import { RightPropertiesPanel } from './components/RightPropertiesPanel';
import { CanvasViewport } from './components/CanvasViewport';
import { AssetDock } from './components/AssetDock';
import { FocusTrap } from './components/FocusTrap';
import { updateCanvas, computeDeviceTransformUpdate, computeTextTransformUpdate } from './utils/canvasManager';
import type { DeviceInstance, ObjectTransformSnapshot } from './utils/canvasManager';
import { useHistory } from './utils/useHistory';
import { cropImageToSquare, detectAlphaChannel, detectEdgeColor, renderIconFrame, buildIconZip, ICON_MASTER_SIZE, ICON_SIZE_PREVIEW_SPECS } from './utils/iconManager';
import type { IconBgMode } from './utils/iconManager';
import { IconHistoryDrawer } from './components/IconHistoryDrawer';
import type { IconHistoryEntry } from './components/IconHistoryDrawer';
import { PrivacyToolWorkspace } from './components/PrivacyToolWorkspace';

interface MockupPage {
  id: string;
  title: string;
  subtitle: string;
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor: string;
  bgGradient?: string[];
  bgImageSrc?: string;
  bgImageScale?: number;
  bgBlur: number;
  showFrostedGlass: boolean;
  devices: DeviceInstance[];
  titleFontFamily: string;
  subtitleFontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
  layout?: 'text-top' | 'text-bottom' | 'full-device';
  showGlassReflection?: boolean;
  showStatusBar?: boolean;
  shadowPreset?: 'none' | 'soft' | 'premium';
  // 画布上通过拖拽手柄操作标题/副标题后写入的位移/旋转增量，默认 0
  titleOffsetX?: number;
  titleOffsetY?: number;
  titleAngle?: number;
  subtitleOffsetX?: number;
  subtitleOffsetY?: number;
  subtitleAngle?: number;
}

const EXPORT_PRESETS = [
  { id: 'ios-6.9', name: 'iPhone 16 Pro Max (6.9" - 1290x2796)', width: 1290, height: 2796, folder: 'ios/iphone_6.9' },
  { id: 'ios-6.5', name: 'iPhone XS/11 Pro Max (6.5" - 1242x2688)', width: 1242, height: 2688, folder: 'ios/iphone_6.5' },
  { id: 'ios-5.5', name: 'iPhone 8 Plus (5.5" - 1242x2208)', width: 1242, height: 2208, folder: 'ios/iphone_5.5' },
  { id: 'ios-ipad', name: 'iPad Pro 12.9" (2048x2732)', width: 2048, height: 2732, folder: 'ios/ipad_12.9' },
  { id: 'android-phone', name: 'Android Phone (1242x2208)', width: 1242, height: 2208, folder: 'android/phone' },
];

const DEFAULT_PAGES: MockupPage[] = [
  {
    id: 'page-1',
    title: 'Manage Everything',
    subtitle: 'A beautiful minimal workspace',
    bgType: 'solid',
    bgColor: '#f5f5f4',
    bgGradient: ['#f5f5f4', '#e5e5e4'],
    bgImageSrc: '',
    bgBlur: 0,
    showFrostedGlass: false,
    devices: [
      { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 1.28, offsetX: 0, offsetY: 60, screenshotScale: 1.05, screenshotOffsetY: 25 }
    ],
    titleFontFamily: 'Playfair Display',
    subtitleFontFamily: 'Geist',
    titleFontSize: 76,
    subtitleFontSize: 30,
    layout: 'text-top',
    showGlassReflection: true,
    showStatusBar: true,
    shadowPreset: 'premium',
  },
  {
    id: 'page-2',
    title: 'Absolute Control',
    subtitle: 'Track your assets offline',
    bgType: 'solid',
    bgColor: '#e5e5e4',
    bgGradient: ['#ffffff', '#d4d4d8'],
    bgImageSrc: '',
    bgBlur: 0,
    showFrostedGlass: false,
    devices: [
      { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 1.28, offsetX: 0, offsetY: 60, screenshotScale: 1.05, screenshotOffsetY: 25 }
    ],
    titleFontFamily: 'Playfair Display',
    subtitleFontFamily: 'Geist',
    titleFontSize: 76,
    subtitleFontSize: 30,
    layout: 'text-top',
    showGlassReflection: true,
    showStatusBar: true,
    shadowPreset: 'premium',
  },
];

function loadSavedState<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  // App Routing & Theme State
  const [activeTool, setActiveTool] = useState<string>('screenshots');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Sidebar Toggles
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState<boolean>(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState<boolean>(false);

  // Export States
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportSizes, setExportSizes] = useState<Record<string, boolean>>({
    'ios-6.9': true,
    'ios-6.5': false,
    'ios-5.5': true,
    'ios-ipad': false,
    'android-phone': true,
  });

  // Multi-page slides list (with undo/redo)
  const { state: pages, set: setPages, undo, redo, canUndo, canRedo } = useHistory<MockupPage[]>(
    loadSavedState('mockup_app_pages', DEFAULT_PAGES)
  );
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  // Note: undo/redo keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z) are handled by useHistory hook

  // Asset Library
  const [screenshots, setScreenshots] = useState<string[]>(
    () => loadSavedState<string[]>('mockup_app_screenshots', [])
  );
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number>(-1);

  // Toast notification (replaces alert())
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3500);
  };

  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      const saved = localStorage.getItem('mockup_app_custom_presets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Icon Generator state
  const iconInitialState = loadSavedState('mockup_app_icon_state', {
    sourceDataUrl: null as string | null,
    originalWidth: null as number | null,
    originalHeight: null as number | null,
    padding: 0.12,
    paddingY: 0.12,
    bgColor: '#f5f5f4',
    hasAlpha: false,
    foregroundScale: 0.8,
    offsetX: 0,
    offsetY: 0,
    contentScale: 1,
    bgMode: 'solid' as IconBgMode,
    bgGradient: ['#f5f5f4', '#e5e5e4'] as [string, string],

    // Dual-platform overrides
    paddingIos: null as number | null,
    paddingYIos: null as number | null,
    offsetXIos: null as number | null,
    offsetYIos: null as number | null,
    contentScaleIos: null as number | null,
    paddingAndroid: null as number | null,
    paddingYAndroid: null as number | null,
    offsetXAndroid: null as number | null,
    offsetYAndroid: null as number | null,
    contentScaleAndroid: null as number | null,
  });
  const [iconSourceDataUrl, setIconSourceDataUrl] = useState<string | null>(iconInitialState.sourceDataUrl);
  const [iconOriginalWidth, setIconOriginalWidth] = useState<number | null>(iconInitialState.originalWidth);
  const [iconOriginalHeight, setIconOriginalHeight] = useState<number | null>(iconInitialState.originalHeight);

  // iOS-specific states
  const [iconPaddingIos, setIconPaddingIos] = useState<number>(iconInitialState.paddingIos ?? iconInitialState.padding ?? 0.12);
  const [iconPaddingYIos, setIconPaddingYIos] = useState<number>(iconInitialState.paddingYIos ?? iconInitialState.paddingY ?? iconInitialState.padding ?? 0.12);
  const [iconOffsetXIos, setIconOffsetXIos] = useState<number>(iconInitialState.offsetXIos ?? iconInitialState.offsetX ?? 0);
  const [iconOffsetYIos, setIconOffsetYIos] = useState<number>(iconInitialState.offsetYIos ?? iconInitialState.offsetY ?? 0);
  const [iconContentScaleIos, setIconContentScaleIos] = useState<number>(iconInitialState.contentScaleIos ?? iconInitialState.contentScale ?? 1);

  // Android-specific states
  const [iconPaddingAndroid, setIconPaddingAndroid] = useState<number>(iconInitialState.paddingAndroid ?? iconInitialState.padding ?? 0.12);
  const [iconPaddingYAndroid, setIconPaddingYAndroid] = useState<number>(iconInitialState.paddingYAndroid ?? iconInitialState.paddingY ?? iconInitialState.padding ?? 0.12);
  const [iconOffsetXAndroid, setIconOffsetXAndroid] = useState<number>(iconInitialState.offsetXAndroid ?? iconInitialState.offsetX ?? 0);
  const [iconOffsetYAndroid, setIconOffsetYAndroid] = useState<number>(iconInitialState.offsetYAndroid ?? iconInitialState.offsetY ?? 0);
  const [iconContentScaleAndroid, setIconContentScaleAndroid] = useState<number>(iconInitialState.contentScaleAndroid ?? iconInitialState.contentScale ?? 1);

  const [iconBgColor, setIconBgColor] = useState<string>(iconInitialState.bgColor);
  const [iconHasAlpha, setIconHasAlpha] = useState<boolean>(iconInitialState.hasAlpha);
  const [iconForegroundScale, setIconForegroundScale] = useState<number>(iconInitialState.foregroundScale);

  const [iconBgMode, setIconBgMode] = useState<IconBgMode>(iconInitialState.bgMode ?? 'solid');
  const [iconBgGradient, setIconBgGradient] = useState<[string, string]>(iconInitialState.bgGradient ?? ['#f5f5f4', '#e5e5e4']);
  const [iconPlatformPreview, setIconPlatformPreview] = useState<'ios' | 'android'>('ios');

  // Derive active platform values dynamically
  const iconPadding = iconPlatformPreview === 'ios' ? iconPaddingIos : iconPaddingAndroid;
  const setIconPadding = iconPlatformPreview === 'ios' ? setIconPaddingIos : setIconPaddingAndroid;

  const iconPaddingY = iconPlatformPreview === 'ios' ? iconPaddingYIos : iconPaddingYAndroid;
  const setIconPaddingY = iconPlatformPreview === 'ios' ? setIconPaddingYIos : setIconPaddingYAndroid;

  const iconOffsetX = iconPlatformPreview === 'ios' ? iconOffsetXIos : iconOffsetXAndroid;
  const setIconOffsetX = iconPlatformPreview === 'ios' ? setIconOffsetXIos : setIconOffsetXAndroid;

  const iconOffsetY = iconPlatformPreview === 'ios' ? iconOffsetYIos : iconOffsetYAndroid;
  const setIconOffsetY = iconPlatformPreview === 'ios' ? setIconOffsetYIos : setIconOffsetYAndroid;

  const iconContentScale = iconPlatformPreview === 'ios' ? iconContentScaleIos : iconContentScaleAndroid;
  const setIconContentScale = iconPlatformPreview === 'ios' ? setIconContentScaleIos : setIconContentScaleAndroid;
  const [iconSizePreviews, setIconSizePreviews] = useState<Array<{ size: number; dataUrl: string }>>([]);
  const iconCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showIconExportModal, setShowIconExportModal] = useState<boolean>(false);
  const [iconExportPlatforms, setIconExportPlatforms] = useState<{ ios: boolean; android: boolean }>({ ios: true, android: true });
  const [includeSvgContainer, setIncludeSvgContainer] = useState<boolean>(false);
  const [iconExportDone, setIconExportDone] = useState<boolean>(false);

  // Icon history (named snapshots), independent of the current working state
  const [iconHistory, setIconHistory] = useState<IconHistoryEntry[]>(
    () => loadSavedState<IconHistoryEntry[]>('mockup_app_icon_history', [])
  );
  const [showIconHistoryDrawer, setShowIconHistoryDrawer] = useState<boolean>(false);

  useEffect(() => {
    try { localStorage.setItem('mockup_app_icon_history', JSON.stringify(iconHistory)); } catch { /* quota exceeded */ }
  }, [iconHistory]);

  const handleSaveIconHistory = useCallback((name: string) => {
    if (!iconSourceDataUrl) return;
    const thumbnail = iconCanvasRef.current?.toDataURL('image/png') || iconSourceDataUrl;
    const entry: IconHistoryEntry = {
      id: `icon-history-${Date.now()}`,
      name: name.trim() || `方案 ${iconHistory.length + 1}`,
      createdAt: new Date().toLocaleString(),
      thumbnail,
      snapshot: {
        sourceDataUrl: iconSourceDataUrl,
        originalWidth: iconOriginalWidth,
        originalHeight: iconOriginalHeight,
        padding: iconPadding,
        paddingY: iconPaddingY,
        bgColor: iconBgColor,
        hasAlpha: iconHasAlpha,
        foregroundScale: iconForegroundScale,
        offsetX: iconOffsetX,
        offsetY: iconOffsetY,
        contentScale: iconContentScale,
        bgMode: iconBgMode,
        bgGradient: iconBgGradient,

        // Dual-platform overrides
        paddingIos: iconPaddingIos,
        paddingYIos: iconPaddingYIos,
        offsetXIos: iconOffsetXIos,
        offsetYIos: iconOffsetYIos,
        contentScaleIos: iconContentScaleIos,
        paddingAndroid: iconPaddingAndroid,
        paddingYAndroid: iconPaddingYAndroid,
        offsetXAndroid: iconOffsetXAndroid,
        offsetYAndroid: iconOffsetYAndroid,
        contentScaleAndroid: iconContentScaleAndroid,
      },
    };
    setIconHistory((prev) => [entry, ...prev]);
    showToast('已保存到历史');
  }, [
    iconSourceDataUrl, iconOriginalWidth, iconOriginalHeight, iconPadding, iconPaddingY, iconBgColor, iconHasAlpha,
    iconForegroundScale, iconOffsetX, iconOffsetY, iconContentScale, iconBgMode, iconBgGradient,
    iconPaddingIos, iconPaddingYIos, iconOffsetXIos, iconOffsetYIos, iconContentScaleIos,
    iconPaddingAndroid, iconPaddingYAndroid, iconOffsetXAndroid, iconOffsetYAndroid, iconContentScaleAndroid,
    iconHistory.length
  ]);

  const handleRestoreIconHistory = useCallback((id: string) => {
    setIconHistory((current) => {
      const entry = current.find((h) => h.id === id);
      if (entry) {
        const s = entry.snapshot;
        setIconSourceDataUrl(s.sourceDataUrl);
        setIconOriginalWidth(s.originalWidth);
        setIconOriginalHeight(s.originalHeight);

        // Restore dual platform states with fallback to legacy single values
        setIconPaddingIos(s.paddingIos ?? s.padding ?? 0.12);
        setIconPaddingYIos(s.paddingYIos ?? s.paddingY ?? s.padding ?? 0.12);
        setIconOffsetXIos(s.offsetXIos ?? s.offsetX ?? 0);
        setIconOffsetYIos(s.offsetYIos ?? s.offsetY ?? 0);
        setIconContentScaleIos(s.contentScaleIos ?? s.contentScale ?? 1);

        setIconPaddingAndroid(s.paddingAndroid ?? s.padding ?? 0.12);
        setIconPaddingYAndroid(s.paddingYAndroid ?? s.paddingY ?? s.padding ?? 0.12);
        setIconOffsetXAndroid(s.offsetXAndroid ?? s.offsetX ?? 0);
        setIconOffsetYAndroid(s.offsetYAndroid ?? s.offsetY ?? 0);
        setIconContentScaleAndroid(s.contentScaleAndroid ?? s.contentScale ?? 1);

        setIconBgColor(s.bgColor);
        setIconHasAlpha(s.hasAlpha);
        setIconForegroundScale(s.foregroundScale);
        setIconBgMode(s.bgMode);
        setIconBgGradient(s.bgGradient);
      }
      return current;
    });
    setShowIconHistoryDrawer(false);
  }, []);

  const handleRenameIconHistory = useCallback((id: string, name: string) => {
    setIconHistory((prev) => prev.map((h) => (h.id === id ? { ...h, name } : h)));
  }, []);

  const handleDeleteIconHistory = useCallback((id: string) => {
    setIconHistory((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const iconWarning = useMemo(() => (
    iconSourceDataUrl && iconOriginalWidth && iconOriginalHeight &&
    (iconOriginalWidth !== iconOriginalHeight || Math.min(iconOriginalWidth, iconOriginalHeight) < 1024)
      ? { width: iconOriginalWidth, height: iconOriginalHeight }
      : null
  ), [iconSourceDataUrl, iconOriginalWidth, iconOriginalHeight]);

  const handleUploadIcon = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || typeof e.target.result !== 'string') return;
      const img = new window.Image();
      img.onload = () => {
        const squareCanvas = cropImageToSquare(img);
        const hasAlpha = detectAlphaChannel(squareCanvas);
        setIconOriginalWidth(img.naturalWidth);
        setIconOriginalHeight(img.naturalHeight);
        setIconHasAlpha(hasAlpha);
        if (hasAlpha) {
          setIconBgColor(detectEdgeColor(squareCanvas));
        }
        setIconSourceDataUrl(squareCanvas.toDataURL('image/png'));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  // Persist icon generator state
  useEffect(() => {
    try {
      localStorage.setItem('mockup_app_icon_state', JSON.stringify({
        sourceDataUrl: iconSourceDataUrl,
        originalWidth: iconOriginalWidth,
        originalHeight: iconOriginalHeight,
        paddingIos: iconPaddingIos,
        paddingYIos: iconPaddingYIos,
        offsetXIos: iconOffsetXIos,
        offsetYIos: iconOffsetYIos,
        contentScaleIos: iconContentScaleIos,
        paddingAndroid: iconPaddingAndroid,
        paddingYAndroid: iconPaddingYAndroid,
        offsetXAndroid: iconOffsetXAndroid,
        offsetYAndroid: iconOffsetYAndroid,
        contentScaleAndroid: iconContentScaleAndroid,
        bgColor: iconBgColor,
        hasAlpha: iconHasAlpha,
        foregroundScale: iconForegroundScale,
        bgMode: iconBgMode,
        bgGradient: iconBgGradient,
      }));
    } catch { /* quota exceeded */ }
  }, [
    iconSourceDataUrl, iconOriginalWidth, iconOriginalHeight,
    iconPaddingIos, iconPaddingYIos, iconOffsetXIos, iconOffsetYIos, iconContentScaleIos,
    iconPaddingAndroid, iconPaddingYAndroid, iconOffsetXAndroid, iconOffsetYAndroid, iconContentScaleAndroid,
    iconBgColor, iconHasAlpha, iconForegroundScale, iconBgMode, iconBgGradient
  ]);

  // Debounced icon canvas render
  const iconDrawTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!iconSourceDataUrl) {
      setIconSizePreviews([]);
      return;
    }
    clearTimeout(iconDrawTimerRef.current);
    iconDrawTimerRef.current = setTimeout(() => {
      const canvas = iconCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = new window.Image();
      img.onload = () => {
        const isAndroidAdaptive = iconPlatformPreview === 'android' && iconHasAlpha;
        const adaptiveExtraInset = isAndroidAdaptive ? (1 - iconForegroundScale) * 0.5 : 0;
        renderIconFrame(ctx, {
          image: img,
          size: ICON_MASTER_SIZE,
          padding: iconPadding + adaptiveExtraInset,
          paddingY: iconPaddingY + adaptiveExtraInset,
          bgColor: iconBgColor,
          offsetX: iconOffsetX,
          offsetY: iconOffsetY,
          contentScale: iconContentScale,
          bgMode: iconBgMode,
          bgGradient: iconBgGradient,
        });

        // Real per-size, per-platform renders for the "导出尺寸预览" sidebar
        // grid — each size is actually rendered at its target pixel
        // dimensions using that platform's own padding/offset/scale, instead
        // of reusing a single master image scaled by CSS (which made every
        // thumbnail look identical regardless of the labeled size).
        const sizePreviews = ICON_SIZE_PREVIEW_SPECS.map(({ size, platform }) => {
          const previewCanvas = document.createElement('canvas');
          previewCanvas.width = size;
          previewCanvas.height = size;
          const previewCtx = previewCanvas.getContext('2d')!;
          renderIconFrame(previewCtx, {
            image: img,
            size,
            padding: platform === 'ios' ? iconPaddingIos : iconPaddingAndroid,
            paddingY: platform === 'ios' ? iconPaddingYIos : iconPaddingYAndroid,
            bgColor: iconBgColor,
            offsetX: platform === 'ios' ? iconOffsetXIos : iconOffsetXAndroid,
            offsetY: platform === 'ios' ? iconOffsetYIos : iconOffsetYAndroid,
            contentScale: platform === 'ios' ? iconContentScaleIos : iconContentScaleAndroid,
            bgMode: iconBgMode,
            bgGradient: iconBgGradient,
          });
          return { size, dataUrl: previewCanvas.toDataURL('image/png') };
        });
        setIconSizePreviews(sizePreviews);
      };
      img.src = iconSourceDataUrl;
    }, 150);
    return () => clearTimeout(iconDrawTimerRef.current);
  }, [
    iconSourceDataUrl, iconPadding, iconPaddingY, iconBgColor, iconHasAlpha, iconPlatformPreview,
    iconForegroundScale, iconOffsetX, iconOffsetY, iconContentScale, iconBgMode, iconBgGradient,
    iconPaddingIos, iconPaddingYIos, iconOffsetXIos, iconOffsetYIos, iconContentScaleIos,
    iconPaddingAndroid, iconPaddingYAndroid, iconOffsetXAndroid, iconOffsetYAndroid, iconContentScaleAndroid,
  ]);

  const runIconZipExport = async () => {
    if (!iconExportPlatforms.ios && !iconExportPlatforms.android) {
      showToast('请至少勾选一个平台！');
      return;
    }
    if (!iconSourceDataUrl) return;

    setShowIconExportModal(false);
    setIsExporting(true);
    setExportProgress('准备图标画布环境...');
    setIconExportDone(false);

    try {
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图标加载失败'));
        img.src = iconSourceDataUrl;
      });
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = img.naturalWidth;
      sourceCanvas.height = img.naturalHeight;
      sourceCanvas.getContext('2d')!.drawImage(img, 0, 0);

      const zip = new JSZip();
      await buildIconZip(zip, {
        sourceCanvas,
        padding: iconPadding,
        paddingY: iconPaddingY,
        bgColor: iconBgColor,
        hasAlpha: iconHasAlpha,
        foregroundScale: iconForegroundScale,
        platforms: iconExportPlatforms,
        offsetX: iconOffsetX,
        offsetY: iconOffsetY,
        contentScale: iconContentScale,
        bgMode: iconBgMode,
        bgGradient: iconBgGradient,
        includeSvgContainer,

        // Per-platform overrides: without these, the exported ZIP would use
        // whichever platform tab happened to be active for BOTH iOS and
        // Android assets, silently discarding the other platform's tuning.
        paddingIos: iconPaddingIos,
        paddingYIos: iconPaddingYIos,
        offsetXIos: iconOffsetXIos,
        offsetYIos: iconOffsetYIos,
        contentScaleIos: iconContentScaleIos,
        paddingAndroid: iconPaddingAndroid,
        paddingYAndroid: iconPaddingYAndroid,
        offsetXAndroid: iconOffsetXAndroid,
        offsetYAndroid: iconOffsetYAndroid,
        contentScaleAndroid: iconContentScaleAndroid,
      }, (msg) => setExportProgress(msg));

      setExportProgress('正在生成压缩包，请稍候...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'mockup_app_icons.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);
      setIconExportDone(true);
    } catch (error) {
      console.error('Error generating icon ZIP export:', error);
      showToast('导出失败，请查看控制台错误日志。');
      setIsExporting(false);
      setExportProgress('');
    }
  };

  const handleSavePreset = (name: string) => {
    const newPreset: CustomPreset = {
      id: `preset-${Date.now()}`,
      name: name || `自定义风格预设 ${customPresets.length + 1}`,
      createdAt: new Date().toLocaleString(),
      state: {
        bgType,
        bgColor,
        bgGradient,
        bgImageSrc,
        bgBlur,
        showFrostedGlass,
        titleText,
        subtitleText,
        titleFontSize,
        subtitleFontSize,
        titleFontFamily,
        subtitleFontFamily,
        devices: devices.map(({ id, deviceModel, angle, skewX, scale, offsetX, offsetY, screenshotScale, screenshotOffsetY }) => ({
          id,
          deviceModel,
          angle,
          skewX,
          scale,
          offsetX,
          offsetY,
          screenshotScale,
          screenshotOffsetY
        }))
      }
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('mockup_app_custom_presets', JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = customPresets.filter(p => p.id !== id);
    setCustomPresets(updated);
    localStorage.setItem('mockup_app_custom_presets', JSON.stringify(updated));
  };

  const handleApplyPreset = (preset: CustomPreset) => {
    updateActivePage({
      bgType: preset.state.bgType,
      bgColor: preset.state.bgColor,
      bgGradient: preset.state.bgGradient,
      bgImageSrc: preset.state.bgImageSrc,
      bgBlur: preset.state.bgBlur,
      showFrostedGlass: preset.state.showFrostedGlass,
      title: preset.state.titleText,
      subtitle: preset.state.subtitleText,
      titleFontSize: preset.state.titleFontSize,
      subtitleFontSize: preset.state.subtitleFontSize,
      titleFontFamily: preset.state.titleFontFamily,
      subtitleFontFamily: preset.state.subtitleFontFamily,
      devices: preset.state.devices.map((presetDev, index) => {
        const currentDev = activePage.devices[index];
        return {
          ...presetDev,
          screenshotSrc: currentDev ? currentDev.screenshotSrc : undefined
        };
      }),
    });
  };

  // Single source of truth: derive current values from the active page
  const activePage = pages[activePageIndex];

  const updateActivePage = (fields: Partial<MockupPage>) => {
    setPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, ...fields } : p));
  };

  // Convenience aliases for the active page's fields
  const bgType = activePage.bgType;
  const bgColor = activePage.bgColor;
  const bgGradient = activePage.bgGradient || ['#f5f5f4', '#e5e5e4'];
  const bgImageSrc = activePage.bgImageSrc || '';
  const bgImageScale = activePage.bgImageScale ?? 1;
  const bgBlur = activePage.bgBlur;
  const showFrostedGlass = activePage.showFrostedGlass;
  const devices = activePage.devices;
  const titleText = activePage.title;
  const subtitleText = activePage.subtitle;
  const titleFontSize = activePage.titleFontSize;
  const subtitleFontSize = activePage.subtitleFontSize;
  const titleFontFamily = activePage.titleFontFamily;
  const subtitleFontFamily = activePage.subtitleFontFamily;
  const layout = activePage.layout || 'text-top';
  const showGlassReflection = activePage.showGlassReflection !== false;
  const showStatusBar = activePage.showStatusBar !== false;
  const shadowPreset = activePage.shadowPreset || 'premium';
  const titleOffsetX = activePage.titleOffsetX || 0;
  const titleOffsetY = activePage.titleOffsetY || 0;
  const titleAngle = activePage.titleAngle || 0;
  const subtitleOffsetX = activePage.subtitleOffsetX || 0;
  const subtitleOffsetY = activePage.subtitleOffsetY || 0;
  const subtitleAngle = activePage.subtitleAngle || 0;

  // "连图" (panoramic) 模式下，一张超宽图会按页面索引横向切片铺满所有故事帧，
  // 因此其类型/图源/模糊/缩放必须同步广播到全部页面，而不能只写入当前激活页，
  // 否则切换页面后连图背景就会消失或与其他帧脱节。
  const updateBgAcrossPages = (fields: Partial<MockupPage>) => {
    setPages(prev => prev.map(p => ({ ...p, ...fields })));
  };
  const isPanoramicContext = (nextType?: 'solid' | 'gradient' | 'image' | 'panoramic') =>
    activePage.bgType === 'panoramic' || nextType === 'panoramic';

  // Setter functions that update the active page directly
  const setBgType = (v: 'solid' | 'gradient' | 'image' | 'panoramic') =>
    isPanoramicContext(v) ? updateBgAcrossPages({ bgType: v }) : updateActivePage({ bgType: v });
  const setBgColor = (v: string) => updateActivePage({ bgColor: v });
  const setBgGradient = (v: string[]) => updateActivePage({ bgGradient: v });
  const setBgImageSrc = (v: string) =>
    isPanoramicContext() ? updateBgAcrossPages({ bgImageSrc: v }) : updateActivePage({ bgImageSrc: v });
  const setBgImageScale = (v: number) =>
    isPanoramicContext() ? updateBgAcrossPages({ bgImageScale: v }) : updateActivePage({ bgImageScale: v });
  const setBgBlur = (v: number) =>
    isPanoramicContext() ? updateBgAcrossPages({ bgBlur: v }) : updateActivePage({ bgBlur: v });
  const setShowFrostedGlass = (v: boolean) => updateActivePage({ showFrostedGlass: v });
  const setLayout = (v: 'text-top' | 'text-bottom' | 'full-device') => updateActivePage({ layout: v });
  const setShowGlassReflection = (v: boolean) => updateActivePage({ showGlassReflection: v });
  const setShowStatusBar = (v: boolean) => updateActivePage({ showStatusBar: v });
  const setShadowPreset = (v: 'none' | 'soft' | 'premium') => updateActivePage({ shadowPreset: v });
  const setDevices = (v: DeviceInstance[] | ((prev: DeviceInstance[]) => DeviceInstance[])) => {
    if (typeof v === 'function') {
      setPages(prev => prev.map((p, i) => i === activePageIndex ? { ...p, devices: v(p.devices) } : p));
    } else {
      updateActivePage({ devices: v });
    }
  };
  const setTitleText = (v: string) => updateActivePage({ title: v });
  const setSubtitleText = (v: string) => updateActivePage({ subtitle: v });
  const setTitleFontSize = (v: number) => updateActivePage({ titleFontSize: v });
  const setSubtitleFontSize = (v: number) => updateActivePage({ subtitleFontSize: v });
  const setTitleFontFamily = (v: string) => updateActivePage({ titleFontFamily: v });
  const setSubtitleFontFamily = (v: string) => updateActivePage({ subtitleFontFamily: v });

  // Viewport Zoom
  // 初始值仅为 ResizeObserver 首次测量完成前的占位；CanvasViewport 会在挂载后
  // 立即依据实际容器尺寸计算"完整显示画布"的缩放比例并覆盖此值，避免小视口下
  // 画布顶部/底部被裁到滚动区域之外（表现为"看不到标题文字"）。
  const [zoom, setZoom] = useState<number>(30);

  // Canvas References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);

  // Sync state between global theme and DOM element class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.remove('light');
    } else {
      root.classList.add('light');
    }
  }, [theme]);

  // Initialize Fabric.js Canvas instance
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = new Canvas(canvasRef.current, {
        width: 1242,
        height: 2208,
        backgroundColor: '#f5f5f4',
      });
      setFabricCanvas(canvas);
      (window as any).__canvas = canvas;

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  // 画布上直接拖拽/缩放/旋转标题、副标题与机型的手柄交互：
  // updateCanvas 每次都会 canvas.clear() 后整体重建，所以不能在事件回调里直接
  // 闭包读取 devices/layout 等值 (会拿到挂载时的旧值)。这里用一个 ref 始终持有
  // "最新" 的可编辑状态与 setter，事件处理函数只在 fabricCanvas 变化时绑定一次，
  // 但读取的永远是最新数据 —— 这是 React 里处理"稳定回调 + 易变数据"的标准写法。
  const latestEditableStateRef = useRef({
    devices,
    layout,
    titleFontSize,
    subtitleFontSize,
    updateActivePage,
    setDevices,
  });
  latestEditableStateRef.current = {
    devices,
    layout,
    titleFontSize,
    subtitleFontSize,
    updateActivePage,
    setDevices,
  };

  useEffect(() => {
    if (!fabricCanvas) return;

    const handleObjectModified = (e: { target?: unknown }) => {
      const target = e.target as (Record<string, unknown> & {
        left: number; top: number; scaleX: number; scaleY: number; angle: number;
        data?: { role?: string; deviceId?: string };
      }) | undefined;
      const data = target?.data;
      if (!target || !data?.role) return;

      const {
        devices: curDevices,
        layout: curLayout,
        titleFontSize: curTitleFontSize,
        subtitleFontSize: curSubtitleFontSize,
        updateActivePage: curUpdateActivePage,
        setDevices: curSetDevices,
      } = latestEditableStateRef.current;

      const canvasWidth = fabricCanvas.getWidth();
      const canvasHeight = fabricCanvas.getHeight();
      const snapshot: ObjectTransformSnapshot = {
        left: target.left,
        top: target.top,
        scaleX: target.scaleX,
        scaleY: target.scaleY,
        angle: target.angle,
      };

      if (data.role === 'device' && data.deviceId) {
        const idx = curDevices.findIndex((d) => d.id === data.deviceId);
        if (idx === -1) return;
        const updates = computeDeviceTransformUpdate(snapshot, curDevices[idx], curLayout, canvasWidth, canvasHeight);
        curSetDevices(curDevices.map((d, i) => (i === idx ? { ...d, ...updates } : d)));
      } else if (data.role === 'title') {
        const lastTitleHeight = (fabricCanvas as unknown as { _lastTitleHeight?: number })._lastTitleHeight || 0;
        const result = computeTextTransformUpdate(snapshot, 'title', curLayout, canvasHeight, curTitleFontSize, lastTitleHeight);
        curUpdateActivePage({
          titleOffsetX: result.offsetX,
          titleOffsetY: result.offsetY,
          titleAngle: result.angle,
          titleFontSize: result.fontSize,
        });
      } else if (data.role === 'subtitle') {
        const lastTitleHeight = (fabricCanvas as unknown as { _lastTitleHeight?: number })._lastTitleHeight || 0;
        const result = computeTextTransformUpdate(snapshot, 'subtitle', curLayout, canvasHeight, curSubtitleFontSize, lastTitleHeight);
        curUpdateActivePage({
          subtitleOffsetX: result.offsetX,
          subtitleOffsetY: result.offsetY,
          subtitleAngle: result.angle,
          subtitleFontSize: result.fontSize,
        });
      }
    };

    fabricCanvas.on('object:modified', handleObjectModified);
    return () => {
      fabricCanvas.off('object:modified', handleObjectModified);
    };
  }, [fabricCanvas]);

  // No more bidirectional sync effects needed — pages[activePageIndex] is the
  // single source of truth and the setter functions above update it directly.

  // Persist pages and screenshots to localStorage
  useEffect(() => {
    try { localStorage.setItem('mockup_app_pages', JSON.stringify(pages)); } catch { /* quota exceeded */ }
  }, [pages]);

  useEffect(() => {
    try { localStorage.setItem('mockup_app_screenshots', JSON.stringify(screenshots)); } catch { /* quota exceeded */ }
  }, [screenshots]);

  // Draw and render the FabricJS canvas when state changes (debounced)
  const drawTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (fabricCanvas) {
      clearTimeout(drawTimerRef.current);
      drawTimerRef.current = setTimeout(async () => {
        // Load fonts dynamically
        if (document.fonts && document.fonts.load) {
          try {
            await Promise.all([
              document.fonts.load(`1em "${titleFontFamily}"`),
              document.fonts.load(`1em "${subtitleFontFamily}"`)
            ]);
          } catch (e) {
            console.warn('Failed to load Google Fonts, falling back to system fonts:', e);
          }
        }

        updateCanvas(
          fabricCanvas,
          {
            bgType,
            bgColor,
            bgGradient,
            bgImageSrc,
            bgImageScale,
            bgBlur,
            showFrostedGlass,
            devices,
            titleText,
            subtitleText,
            titleFontSize,
            subtitleFontSize,
            titleFontFamily,
            subtitleFontFamily,
            layout,
            showGlassReflection,
            showStatusBar,
            shadowPreset,
            titleOffsetX,
            titleOffsetY,
            titleAngle,
            subtitleOffsetX,
            subtitleOffsetY,
            subtitleAngle,
          },
          activePageIndex
        );
      }, 150);
    }
    return () => clearTimeout(drawTimerRef.current);
  }, [
    fabricCanvas,
    activePageIndex,
    bgType,
    bgColor,
    bgGradient,
    bgImageSrc,
    bgImageScale,
    bgBlur,
    showFrostedGlass,
    devices,
    titleText,
    subtitleText,
    titleFontSize,
    subtitleFontSize,
    titleFontFamily,
    subtitleFontFamily,
    layout,
    showGlassReflection,
    showStatusBar,
    shadowPreset,
    titleOffsetX,
    titleOffsetY,
    titleAngle,
    subtitleOffsetX,
    subtitleOffsetY,
    subtitleAngle,
  ]);

  // Handle uploading screenshots
  const handleUploadScreenshot = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === 'string') {
        const newSrc = e.target.result;
        setScreenshots((prev) => {
          setSelectedScreenshotIndex(prev.length);
          return [...prev, newSrc];
        });
        
        // Auto bind uploaded screen to the active selected device
        setDevices((prevDevs) =>
          prevDevs.map((d, i) => i === 0 ? { ...d, screenshotSrc: newSrc } : d)
        );
      }
    };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    (window as any).__uploadScreenshot = (dataUrl: string) => {
      setScreenshots((prev) => {
        const updated = [...prev, dataUrl];
        setSelectedScreenshotIndex(updated.length - 1);
        return updated;
      });
      setDevices((prevDevs) =>
        prevDevs.map((d, i) => i === 0 ? { ...d, screenshotSrc: dataUrl } : d)
      );
    };
  }, []);

  // Manage slides
  const handleAddPage = () => {
    const newId = `page-${Date.now()}`;
    const newPage: MockupPage = {
      id: newId,
      title: 'New Feature Screen',
      subtitle: 'Write an descriptive subline here',
      bgType: bgType,
      bgColor: bgColor,
      bgGradient: bgGradient,
      bgImageSrc: bgImageSrc,
      bgImageScale: bgImageScale,
      bgBlur: bgBlur,
      showFrostedGlass: showFrostedGlass,
      devices: devices.map(d => ({ ...d, id: `dev-${d.id}-${Date.now()}` })),
      titleFontFamily: titleFontFamily,
      subtitleFontFamily: subtitleFontFamily,
      titleFontSize: titleFontSize,
      subtitleFontSize: subtitleFontSize,
      layout: layout,
      showGlassReflection: showGlassReflection,
      showStatusBar: showStatusBar,
      shadowPreset: shadowPreset,
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = useCallback((index: number) => {
    setPages((prev) => {
      if (prev.length <= 1) return prev;
      const newPages = prev.filter((_, i) => i !== index);
      setActivePageIndex(Math.max(0, index - 1));
      return newPages;
    });
  }, [setPages]);

  // Helper utility: Convert Data URL to binary Blob
  const dataURItoBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Trigger size modal config
  const handleExport = () => {
    if (activeTool === 'icons') {
      if (!iconSourceDataUrl) {
        showToast('请先上传图标原图');
        return;
      }
      setShowIconExportModal(true);
      return;
    }
    setShowExportModal(true);
  };

  // Run the ZIP export sequentially
  const runZipExport = async () => {
    const selectedPresets = EXPORT_PRESETS.filter(p => exportSizes[p.id]);
    if (selectedPresets.length === 0) {
      showToast('请至少勾选一个导出尺寸规格！');
      return;
    }

    setShowExportModal(false);
    setIsExporting(true);
    setExportProgress('准备画布环境...');

    try {
      const zip = new JSZip();

      // 创建离线 canvas 元素
      const exportEl = document.createElement('canvas');
      const exportCanvas = new Canvas(exportEl);

      for (const preset of selectedPresets) {
        // 重置物理像素大小以重采样
        exportCanvas.setDimensions({ width: preset.width, height: preset.height });

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          setExportProgress(`正在渲染 [${preset.name}] 第 ${i + 1}/${pages.length} 页...`);

          await updateCanvas(
            exportCanvas,
            {
              bgType: page.bgType || 'solid',
              bgColor: page.bgColor,
              bgGradient: page.bgGradient,
              bgImageSrc: page.bgImageSrc,
              bgImageScale: page.bgImageScale ?? 1,
              bgBlur: page.bgBlur !== undefined ? page.bgBlur : 0,
              showFrostedGlass: !!page.showFrostedGlass,
              devices: page.devices || [],
              titleText: page.title,
              subtitleText: page.subtitle,
              titleFontSize: page.titleFontSize || 76,
              subtitleFontSize: page.subtitleFontSize || 30,
              titleFontFamily: page.titleFontFamily || 'Playfair Display',
              subtitleFontFamily: page.subtitleFontFamily || 'Geist',
              layout: page.layout || 'text-top',
              showGlassReflection: page.showGlassReflection !== false,
              showStatusBar: page.showStatusBar !== false,
              shadowPreset: page.shadowPreset || 'premium',
              titleOffsetX: page.titleOffsetX || 0,
              titleOffsetY: page.titleOffsetY || 0,
              titleAngle: page.titleAngle || 0,
              subtitleOffsetX: page.subtitleOffsetX || 0,
              subtitleOffsetY: page.subtitleOffsetY || 0,
              subtitleAngle: page.subtitleAngle || 0,
            },
            i
          );

          // 导出 PNG
          const dataUrl = exportCanvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
          const blob = dataURItoBlob(dataUrl);
          zip.file(`${preset.folder}/page_${i + 1}.png`, blob);
        }
      }

      setExportProgress('正在生成压缩包，请稍候...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      // 下载
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = 'mockup_app_screenshots.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(downloadUrl);

      exportCanvas.dispose();
    } catch (error) {
      console.error('Error generating mockup ZIP export:', error);
      showToast('导出失败，请查看控制台错误日志。');
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="app-shell">
      {/* 头部栏 */}
      <AppHeader
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        theme={theme}
        toggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onExport={handleExport}
        leftSidebarCollapsed={leftSidebarCollapsed}
        setLeftSidebarCollapsed={setLeftSidebarCollapsed}
        rightSidebarCollapsed={rightSidebarCollapsed}
        setRightSidebarCollapsed={setRightSidebarCollapsed}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onToggleHistory={() => setShowIconHistoryDrawer(!showIconHistoryDrawer)}
      />

      {/* 主工作区 */}
      <div className={`app-main ${activeTool === 'privacy' ? 'full-bleed' : leftSidebarCollapsed && rightSidebarCollapsed ? 'both-collapsed' : leftSidebarCollapsed ? 'left-collapsed' : rightSidebarCollapsed ? 'right-collapsed' : ''}`}>
        {activeTool === 'privacy' ? (
          <main className="privacy-tool-container">
            <PrivacyToolWorkspace onToast={showToast} />
          </main>
        ) : (
        <>
        {/* 左侧栏 */}
        <LeftSidebar
          activeTool={activeTool}
          screenshots={screenshots}
          onUploadScreenshot={handleUploadScreenshot}
          onSelectScreenshot={setSelectedScreenshotIndex}
          selectedScreenshotIndex={selectedScreenshotIndex}
          customPresets={customPresets}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          onApplyPreset={handleApplyPreset}
          collapsed={leftSidebarCollapsed}
          hasIconImage={!!iconSourceDataUrl}
          iconSizePreviews={iconSizePreviews}
          onUploadIcon={handleUploadIcon}
        />

        {/* 画布视口 */}
        <main className="viewport-container">
          {activeTool === 'screenshots' ? (
            <>
              <CanvasViewport
                zoom={zoom}
                setZoom={setZoom}
                canvasRef={canvasRef}
                onFileDrop={handleUploadScreenshot}
                hasScreenshots={devices.some(d => d.screenshotSrc)}
              />

              {/* 底部故事画幅 Dock */}
              <AssetDock
                pages={pages}
                activePageIndex={activePageIndex}
                setActivePageIndex={setActivePageIndex}
                onAddPage={handleAddPage}
                onDeletePage={handleDeletePage}
              />
            </>
          ) : activeTool === 'icons' ? (
            <CanvasViewport
              activeTool="icons"
              zoom={zoom}
              setZoom={setZoom}
              canvasRef={canvasRef}
              onFileDrop={handleUploadScreenshot}
              iconCanvasRef={iconCanvasRef}
              hasIconImage={!!iconSourceDataUrl}
              onIconFileDrop={handleUploadIcon}
              iconPlatformPreview={iconPlatformPreview}
              setIconPlatformPreview={setIconPlatformPreview}
              iconWarning={iconWarning}
              iconPadding={iconPadding}
              setIconPadding={setIconPadding}
              iconPaddingY={iconPaddingY}
              setIconPaddingY={setIconPaddingY}
              iconOffsetX={iconOffsetX}
              setIconOffsetX={setIconOffsetX}
              iconOffsetY={iconOffsetY}
              setIconOffsetY={setIconOffsetY}
              iconContentScale={iconContentScale}
              setIconContentScale={setIconContentScale}
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--ink-secondary)',
              gap: '16px',
              padding: '40px',
              textAlign: 'center'
            }}>
              <Layers size={48} strokeWidth={1} style={{ color: 'var(--ink-tertiary)' }} />
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--ink-primary)' }}>
                文案助手 (ASO Copywriter)
              </h2>
              <p style={{ maxWidth: '400px', fontSize: '13px', lineHeight: 1.6 }}>
                本模块正在进行纯前端商店长描述 HTML 标签排版检验开发。
              </p>
              <button className="ds-btn" onClick={() => setActiveTool('screenshots')}>
                返回截图加壳工具
              </button>
            </div>
          )}
        </main>

        {/* 右侧属性控制面板 */}
        <RightPropertiesPanel
          activeTool={activeTool}
          bgType={bgType}
          setBgType={setBgType}
          bgColor={bgColor}
          setBgColor={setBgColor}
          setBgGradient={setBgGradient}
          bgImageSrc={bgImageSrc}
          setBgImageSrc={setBgImageSrc}
          bgImageScale={bgImageScale}
          setBgImageScale={setBgImageScale}
          bgBlur={bgBlur}
          setBgBlur={setBgBlur}
          showFrostedGlass={showFrostedGlass}
          setShowFrostedGlass={setShowFrostedGlass}
          devices={devices}
          setDevices={setDevices}
          screenshots={screenshots}
          titleText={titleText}
          setTitleText={setTitleText}
          subtitleText={subtitleText}
          setSubtitleText={setSubtitleText}
          titleFontSize={titleFontSize}
          setTitleFontSize={setTitleFontSize}
          subtitleFontSize={subtitleFontSize}
          setSubtitleFontSize={setSubtitleFontSize}
          titleFontFamily={titleFontFamily}
          setTitleFontFamily={setTitleFontFamily}
          subtitleFontFamily={subtitleFontFamily}
          setSubtitleFontFamily={setSubtitleFontFamily}
          layout={layout}
          setLayout={setLayout}
          showGlassReflection={showGlassReflection}
          setShowGlassReflection={setShowGlassReflection}
          showStatusBar={showStatusBar}
          setShowStatusBar={setShowStatusBar}
          shadowPreset={shadowPreset}
          setShadowPreset={setShadowPreset}
          showToast={showToast}
          collapsed={rightSidebarCollapsed}
          hasIconImage={!!iconSourceDataUrl}
          iconPadding={iconPadding}
          setIconPadding={setIconPadding}
          iconPaddingY={iconPaddingY}
          setIconPaddingY={setIconPaddingY}
          iconBgColor={iconBgColor}
          setIconBgColor={setIconBgColor}
          iconHasAlpha={iconHasAlpha}
          iconForegroundScale={iconForegroundScale}
          setIconForegroundScale={setIconForegroundScale}
          iconBgMode={iconBgMode}
          setIconBgMode={setIconBgMode}
          iconBgGradient={iconBgGradient}
          setIconBgGradient={setIconBgGradient}
          onSaveIconHistory={() => {
            const name = prompt('请输入方案名称：', `方案 ${iconHistory.length + 1}`);
            if (name !== null) {
              handleSaveIconHistory(name);
            }
          }}
        />
        </>
        )}
      </div>

      {/* 图标导出平台选择模态弹窗 */}
      {showIconExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="icon-export-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
          }}
          onClick={() => setShowIconExportModal(false)}
        >
          <FocusTrap onEscape={() => setShowIconExportModal(false)}>
          <div className="ds-panel" style={{
            width: '380px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 id="icon-export-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink-primary)' }}>
              导出应用图标包
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="ds-label">选择要包含在 ZIP 中的平台图标集</span>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}>
                <span style={{ color: 'var(--ink-primary)' }}>App Store 图标（iOS 全尺寸 + Contents.json）</span>
                <input
                  type="checkbox"
                  checked={iconExportPlatforms.ios}
                  onChange={(e) => setIconExportPlatforms({ ...iconExportPlatforms, ios: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                />
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}>
                <span style={{ color: 'var(--ink-primary)' }}>Google Play 图标（Legacy + Adaptive + 512px）</span>
                <input
                  type="checkbox"
                  checked={iconExportPlatforms.android}
                  onChange={(e) => setIconExportPlatforms({ ...iconExportPlatforms, android: e.target.checked })}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                />
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                cursor: 'pointer',
                userSelect: 'none',
              }}>
                <span style={{ color: 'var(--ink-primary)' }}>附带 SVG 容器版（1024×1024，内嵌位图）</span>
                <input
                  type="checkbox"
                  checked={includeSvgContainer}
                  onChange={(e) => setIncludeSvgContainer(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                />
              </label>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--ink-secondary)', opacity: 0.8, textAlign: 'center', borderTop: '1px solid var(--border-primary)', paddingTop: '8px' }}>
              全部处理在本地浏览器完成，图片不会上传到任何服务器
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="ds-btn"
                style={{ flex: 1 }}
                onClick={() => setShowIconExportModal(false)}
              >
                取消
              </button>
              <button
                className="ds-btn ds-btn-active"
                style={{ flex: 1 }}
                onClick={runIconZipExport}
              >
                生成并下载
              </button>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}

      {/* 导出多尺寸配置模态弹窗 */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
          }}
          onClick={() => setShowExportModal(false)}
        >
          <FocusTrap onEscape={() => setShowExportModal(false)}>
          <div className="ds-panel" style={{
            width: '440px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 id="export-modal-title" style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink-primary)' }}>
              一键多尺寸商店图打包
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="ds-label">选择要包含在 ZIP 中的规格分类</span>
              {EXPORT_PRESETS.map(preset => (
                <label
                  key={preset.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    padding: '8px 12px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-primary)',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <span style={{ color: 'var(--ink-primary)' }}>{preset.name}</span>
                  <input
                    type="checkbox"
                    checked={exportSizes[preset.id] || false}
                    onChange={(e) => setExportSizes({ ...exportSizes, [preset.id]: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                  />
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                className="ds-btn"
                style={{ flex: 1 }}
                onClick={() => setShowExportModal(false)}
              >
                取消
              </button>
              <button
                className="ds-btn ds-btn-active"
                style={{ flex: 1 }}
                onClick={runZipExport}
              >
                开始生成并打包
              </button>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}

      {/* 导出打包的加载指示器 & 落地指引 */}
      {isExporting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg-heavy)',
          color: 'var(--overlay-text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 'var(--z-toast)',
        }}>
          {iconExportDone ? (
            <div
              className="ds-panel"
              style={{
                width: '400px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                color: 'var(--ink-primary)',
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0 }}>
                🎉 图标包导出成功！
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', textAlign: 'left', lineHeight: 1.5 }}>
                <div style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '8px' }}>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>iOS Xcode 集成指引:</strong>
                  <span style={{ color: 'var(--ink-secondary)' }}>
                    解压 ZIP，在项目导航栏找到 <code>Assets.xcassets</code>，将解压得到的 <code>ios/AppIcon.appiconset</code> 拖拽拖入其中替换原有 AppIcon。
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Android Studio 集成指引:</strong>
                  <span style={{ color: 'var(--ink-secondary)' }}>
                    解压 ZIP，将 <code>android/mipmap-*</code> 文件夹及 <code>play_store_512.png</code> 复制并直接合并替换您 Android 项目的 <code>res</code> 目录。
                  </span>
                </div>
              </div>

              <button
                className="ds-btn ds-btn-active"
                style={{ width: '100%', height: '36px', marginTop: '8px' }}
                onClick={() => {
                  setIsExporting(false);
                  setExportProgress('');
                  setIconExportDone(false);
                }}
              >
                关闭指引
              </button>
            </div>
          ) : (
            <>
              <div style={{
                width: '40px',
                height: '40px',
                border: '2px solid var(--border-primary)',
                borderTopColor: 'var(--ink-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <span style={{ fontSize: '14px', letterSpacing: '0.05em' }}>{exportProgress}</span>
            </>
          )}
        </div>
      )}

      {/* 历史方案抽屉 */}
      <IconHistoryDrawer
        isOpen={showIconHistoryDrawer}
        onClose={() => setShowIconHistoryDrawer(false)}
        history={iconHistory}
        onRestore={handleRestoreIconHistory}
        onRename={handleRenameIconHistory}
        onDelete={handleDeleteIconHistory}
        currentState={{
          sourceDataUrl: iconSourceDataUrl,
          padding: iconPadding,
          bgColor: iconBgColor,
          offsetX: iconOffsetX,
          offsetY: iconOffsetY,
          contentScale: iconContentScale,
          bgMode: iconBgMode,
          bgGradient: iconBgGradient,

          // Dual-platform parameters
          paddingIos: iconPaddingIos,
          paddingYIos: iconPaddingYIos,
          offsetXIos: iconOffsetXIos,
          offsetYIos: iconOffsetYIos,
          contentScaleIos: iconContentScaleIos,
          paddingAndroid: iconPaddingAndroid,
          paddingYAndroid: iconPaddingYAndroid,
          offsetXAndroid: iconOffsetXAndroid,
          offsetYAndroid: iconOffsetYAndroid,
          contentScaleAndroid: iconContentScaleAndroid,
        }}
      />

      {/* Toast notification */}
      {toastMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--ink-primary)',
            border: '1px solid var(--border-primary)',
            padding: '12px 24px',
            fontSize: '13px',
            zIndex: 'var(--z-toast)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
