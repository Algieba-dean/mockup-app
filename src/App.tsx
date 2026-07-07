import { useState, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import JSZip from 'jszip';
import { Layers } from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { LeftSidebar } from './components/LeftSidebar';
import type { CustomPreset } from './components/LeftSidebar';
import { RightPropertiesPanel } from './components/RightPropertiesPanel';
import { CanvasViewport } from './components/CanvasViewport';
import { AssetDock } from './components/AssetDock';
import { updateCanvas } from './utils/canvasManager';
import type { DeviceInstance } from './utils/canvasManager';
import { useHistory } from './utils/useHistory';

interface MockupPage {
  id: string;
  title: string;
  subtitle: string;
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor: string;
  bgGradient?: string[];
  bgImageSrc?: string;
  bgBlur: number;
  showFrostedGlass: boolean;
  devices: DeviceInstance[];
  titleFontFamily: string;
  subtitleFontFamily: string;
  titleFontSize: number;
  subtitleFontSize: number;
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
    bgBlur: 10,
    showFrostedGlass: false,
    devices: [
      { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 1.28, offsetX: 0, offsetY: 60, screenshotScale: 1.05, screenshotOffsetY: 25 }
    ],
    titleFontFamily: 'Playfair Display',
    subtitleFontFamily: 'Geist',
    titleFontSize: 54,
    subtitleFontSize: 24,
  },
  {
    id: 'page-2',
    title: 'Absolute Control',
    subtitle: 'Track your assets offline',
    bgType: 'solid',
    bgColor: '#e5e5e4',
    bgGradient: ['#ffffff', '#d4d4d8'],
    bgImageSrc: '',
    bgBlur: 10,
    showFrostedGlass: false,
    devices: [
      { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 1.28, offsetX: 0, offsetY: 60, screenshotScale: 1.05, screenshotOffsetY: 25 }
    ],
    titleFontFamily: 'Playfair Display',
    subtitleFontFamily: 'Geist',
    titleFontSize: 54,
    subtitleFontSize: 24,
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
  const { state: pages, set: setPages } = useHistory<MockupPage[]>(
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
  const bgBlur = activePage.bgBlur;
  const showFrostedGlass = activePage.showFrostedGlass;
  const devices = activePage.devices;
  const titleText = activePage.title;
  const subtitleText = activePage.subtitle;
  const titleFontSize = activePage.titleFontSize;
  const subtitleFontSize = activePage.subtitleFontSize;
  const titleFontFamily = activePage.titleFontFamily;
  const subtitleFontFamily = activePage.subtitleFontFamily;

  // Setter functions that update the active page directly
  const setBgType = (v: 'solid' | 'gradient' | 'image' | 'panoramic') => updateActivePage({ bgType: v });
  const setBgColor = (v: string) => updateActivePage({ bgColor: v });
  const setBgGradient = (v: string[]) => updateActivePage({ bgGradient: v });
  const setBgImageSrc = (v: string) => updateActivePage({ bgImageSrc: v });
  const setBgBlur = (v: number) => updateActivePage({ bgBlur: v });
  const setShowFrostedGlass = (v: boolean) => updateActivePage({ showFrostedGlass: v });
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
  const [zoom, setZoom] = useState<number>(30); // Default to 30% for a 1242x2208 canvas fitting on screen

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
            bgBlur,
            showFrostedGlass,
            devices,
            titleText,
            subtitleText,
            titleFontSize,
            subtitleFontSize,
            titleFontFamily,
            subtitleFontFamily,
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
    bgBlur,
    showFrostedGlass,
    devices,
    titleText,
    subtitleText,
    titleFontSize,
    subtitleFontSize,
    titleFontFamily,
    subtitleFontFamily,
  ]);

  // Handle uploading screenshots
  const handleUploadScreenshot = (file: File) => {
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
  };

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
      bgBlur: bgBlur,
      showFrostedGlass: showFrostedGlass,
      devices: devices.map(d => ({ ...d, id: `dev-${d.id}-${Date.now()}` })),
      titleFontFamily: titleFontFamily,
      subtitleFontFamily: subtitleFontFamily,
      titleFontSize: titleFontSize,
      subtitleFontSize: subtitleFontSize,
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
    setActivePageIndex(Math.max(0, index - 1));
  };

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
              bgBlur: page.bgBlur !== undefined ? page.bgBlur : 10,
              showFrostedGlass: !!page.showFrostedGlass,
              devices: page.devices || [],
              titleText: page.title,
              subtitleText: page.subtitle,
              titleFontSize: page.titleFontSize || 54,
              subtitleFontSize: page.subtitleFontSize || 24,
              titleFontFamily: page.titleFontFamily || 'Playfair Display',
              subtitleFontFamily: page.subtitleFontFamily || 'Geist',
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
      />

      {/* 主工作区 */}
      <div className={`app-main ${leftSidebarCollapsed && rightSidebarCollapsed ? 'both-collapsed' : leftSidebarCollapsed ? 'left-collapsed' : rightSidebarCollapsed ? 'right-collapsed' : ''}`}>
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
        />

        {/* 画布视口 */}
        <div className="viewport-container">
          {activeTool === 'screenshots' ? (
            <>
              <CanvasViewport
                zoom={zoom}
                setZoom={setZoom}
                canvasRef={canvasRef}
                onFileDrop={handleUploadScreenshot}
                bgColor={bgColor}
                bgType={bgType}
                bgGradient={bgGradient}
                hasScreenshots={screenshots.length > 0}
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
                {activeTool === 'icons' ? '图标生成器 (Icon Maker)' : '文案助手 (ASO Copywriter)'}
              </h2>
              <p style={{ maxWidth: '400px', fontSize: '13px', lineHeight: 1.6 }}>
                本模块正在进行纯前端 Fabric.js 画布算法开发。后续将支持从单张图片一键剪切导出 App Store/Google Play 全分辨率图标包及商店长描述 HTML 标签排版检验。
              </p>
              <button className="ds-btn" onClick={() => setActiveTool('screenshots')}>
                返回截图加壳工具
              </button>
            </div>
          )}
        </div>

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
          collapsed={rightSidebarCollapsed}
        />
      </div>

      {/* 导出多尺寸配置模态弹窗 */}
      {showExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
          onKeyDown={(e) => { if (e.key === 'Escape') setShowExportModal(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
          }}
        >
          <div className="ds-panel" style={{
            width: '440px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)',
          }}>
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
        </div>
      )}

      {/* 导出打包的加载指示器 */}
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
        </div>
      )}

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
