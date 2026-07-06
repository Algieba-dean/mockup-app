import { useState, useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import JSZip from 'jszip';
import { Layers } from 'lucide-react';
import { AppHeader } from './components/AppHeader';
import { LeftSidebar } from './components/LeftSidebar';
import { RightPropertiesPanel } from './components/RightPropertiesPanel';
import { CanvasViewport } from './components/CanvasViewport';
import { AssetDock } from './components/AssetDock';
import { updateCanvas } from './utils/canvasManager';
import type { DeviceInstance } from './utils/canvasManager';

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
}

const PRESETS = [
  { id: 'preset-gallery-light', name: '美术策展 (Gallery Light)', description: '经典纸白背景，高对比度衬线体标题' },
  { id: 'preset-linear-dark', name: '极简暗黑 (Minimal Dark)', description: '深色背景，纤细文字，居中手机外壳' },
  { id: 'preset-monochrome-gray', name: '石墨硬朗 (Graphite Gray)', description: '中灰色背景，黑白高对比排版' },
];

const EXPORT_PRESETS = [
  { id: 'ios-6.9', name: 'iPhone 16 Pro Max (6.9" - 1290x2796)', width: 1290, height: 2796, folder: 'ios/iphone_6.9' },
  { id: 'ios-6.5', name: 'iPhone XS/11 Pro Max (6.5" - 1242x2688)', width: 1242, height: 2688, folder: 'ios/iphone_6.5' },
  { id: 'ios-5.5', name: 'iPhone 8 Plus (5.5" - 1242x2208)', width: 1242, height: 2208, folder: 'ios/iphone_5.5' },
  { id: 'ios-ipad', name: 'iPad Pro 12.9" (2048x2732)', width: 2048, height: 2732, folder: 'ios/ipad_12.9' },
  { id: 'android-phone', name: 'Android Phone (1242x2208)', width: 1242, height: 2208, folder: 'android/phone' },
];

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

  // Multi-page slides list
  const [pages, setPages] = useState<MockupPage[]>([
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
        { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 0.95, offsetX: 0, offsetY: 80 }
      ],
      titleFontFamily: 'Playfair Display',
      subtitleFontFamily: 'Geist',
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
        { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 0.95, offsetX: 0, offsetY: 80 }
      ],
      titleFontFamily: 'Playfair Display',
      subtitleFontFamily: 'Geist',
    },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Asset Library
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number>(-1);

  // Layout parameters for active page
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-gallery-light');
  const [bgType, setBgType] = useState<'solid' | 'gradient' | 'image' | 'panoramic'>('solid');
  const [bgColor, setBgColor] = useState<string>('#f5f5f4');
  const [bgGradient, setBgGradient] = useState<string[]>(['#f5f5f4', '#e5e5e4']);
  const [bgImageSrc, setBgImageSrc] = useState<string>('');
  const [bgBlur, setBgBlur] = useState<number>(10);
  const [showFrostedGlass, setShowFrostedGlass] = useState<boolean>(false);
  const [devices, setDevices] = useState<DeviceInstance[]>([
    { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 0.95, offsetX: 0, offsetY: 80 }
  ]);
  const [titleText, setTitleText] = useState<string>('Manage Everything');
  const [subtitleText, setSubtitleText] = useState<string>('A beautiful minimal workspace');
  const [titleFontSize, setTitleFontSize] = useState<number>(54);
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(24);
  const [titleFontFamily, setTitleFontFamily] = useState<string>('Playfair Display');
  const [subtitleFontFamily, setSubtitleFontFamily] = useState<string>('Geist');

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

  // Sync active page changes to controls
  useEffect(() => {
    const activePage = pages[activePageIndex];
    if (activePage) {
      setTitleText(activePage.title);
      setSubtitleText(activePage.subtitle);
      setBgType(activePage.bgType || 'solid');
      setBgColor(activePage.bgColor);
      setBgGradient(activePage.bgGradient || ['#f5f5f4', '#e5e5e4']);
      setBgImageSrc(activePage.bgImageSrc || '');
      setBgBlur(activePage.bgBlur !== undefined ? activePage.bgBlur : 10);
      setShowFrostedGlass(!!activePage.showFrostedGlass);
      setDevices(activePage.devices || [
        { id: 'dev-1', deviceModel: 'iphone_16_pro_light', screenshotSrc: undefined, angle: 0, skewX: 0, scale: 0.95, offsetX: 0, offsetY: 80 }
      ]);
      setTitleFontFamily(activePage.titleFontFamily || 'Playfair Display');
      setSubtitleFontFamily(activePage.subtitleFontFamily || 'Geist');
    }
  }, [activePageIndex]);

  // Sync controls changes back to active page
  useEffect(() => {
    setPages((prevPages) =>
      prevPages.map((page, index) =>
        index === activePageIndex
          ? {
              ...page,
              title: titleText,
              subtitle: subtitleText,
              bgType: bgType,
              bgColor: bgColor,
              bgGradient: bgGradient,
              bgImageSrc: bgImageSrc,
              bgBlur: bgBlur,
              showFrostedGlass: showFrostedGlass,
              devices: devices,
              titleFontFamily: titleFontFamily,
              subtitleFontFamily: subtitleFontFamily,
            }
          : page
      )
    );
  }, [
    titleText,
    subtitleText,
    bgType,
    bgColor,
    bgGradient,
    bgImageSrc,
    bgBlur,
    showFrostedGlass,
    devices,
    titleFontFamily,
    subtitleFontFamily,
  ]);

  // Sync preset changes
  useEffect(() => {
    if (selectedPresetId === 'preset-linear-dark') {
      setBgType('solid');
      setBgColor('#0a0a0a');
      setTheme('dark');
    } else if (selectedPresetId === 'preset-gallery-light') {
      setBgType('solid');
      setBgColor('#f5f5f4');
      setTheme('light');
    } else if (selectedPresetId === 'preset-monochrome-gray') {
      setBgType('solid');
      setBgColor('#4a4a4a');
      setTheme('dark');
    }
  }, [selectedPresetId]);

  // Draw and render the FabricJS canvas when state changes
  useEffect(() => {
    if (fabricCanvas) {
      const draw = async () => {
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
      };

      draw();
    }
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
        setScreenshots((prev) => [...prev, newSrc]);
        setSelectedScreenshotIndex(screenshots.length);
        
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
  }, [screenshots]);

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
      alert('请至少勾选一个导出尺寸规格！');
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
              titleFontSize: titleFontSize,
              subtitleFontSize: subtitleFontSize,
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
      alert('导出失败，请查看控制台错误日志。');
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
          presets={PRESETS}
          selectedPresetId={selectedPresetId}
          onSelectPreset={setSelectedPresetId}
          screenshots={screenshots}
          onUploadScreenshot={handleUploadScreenshot}
          onSelectScreenshot={setSelectedScreenshotIndex}
          selectedScreenshotIndex={selectedScreenshotIndex}
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
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9998,
        }}>
          <div className="ds-panel" style={{
            width: '440px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', margin: 0, color: 'var(--ink-primary)' }}>
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
          backgroundColor: 'rgba(0,0,0,0.85)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          zIndex: 9999,
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
    </div>
  );
}

export default App;
