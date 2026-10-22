import React, { useRef, useState } from 'react';
import { ChevronDown, Palette, Info } from 'lucide-react';
import marbleBg from '../assets/white_marble_bg.jpg';
import grainBg from '../assets/minimal_grain_bg.jpg';
import type { DeviceInstance } from '../utils/canvasManager';
import { extractPaletteFromImage } from '../utils/canvasManager';
import { getMessages, formatMessage } from '../i18n';

const m = getMessages().rightPanel;
const appMsg = getMessages().app;

// 画布基准分辨率为 1242x2208 (见 canvasManager.ts 中 updateCanvas 的 canvasWidth/canvasHeight)，
// 标题/副标题文本框宽度分别为 canvasWidth - 160 与 canvasWidth - 240。
// 用当前字号反推"建议最大字数"，字数超出时给出非阻塞式预警，避免文案在画布中换行过多甚至溢出。
const TITLE_BOX_WIDTH = 1082;
const TITLE_MAX_LINES = 3;
const SUBTITLE_BOX_WIDTH = 1002;
const SUBTITLE_MAX_LINES = 4;

const estimateRecommendedMaxChars = (fontSize: number, boxWidth: number, maxLines: number): number => {
  const avgCharWidth = fontSize * 0.6; // 中英文混排场景下的经验平均字符宽度系数
  const charsPerLine = Math.max(1, Math.floor(boxWidth / avgCharWidth));
  return charsPerLine * maxLines;
};

let accordionIdCounter = 0;

const SectionAccordion: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  // 可选的小型操作 (如"恢复默认")，渲染在标题栏内、折叠箭头左侧，
  // 点击时需要 stopPropagation 避免同时触发折叠/展开。
  headerAction?: React.ReactNode;
}> = ({ title, defaultOpen = false, children, headerAction }) => {
  const [open, setOpen] = useState(defaultOpen);
  const [panelId] = useState(() => `accordion-panel-${++accordionIdCounter}`);
  return (
    <div>
      <div
        className="sidebar-title"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          borderBottom: '1px solid var(--border-primary)',
          color: 'var(--ink-secondary)',
        }}
      >
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'inherit',
            padding: 0,
            font: 'inherit',
            textTransform: 'inherit',
            letterSpacing: 'inherit',
          }}
        >
          <span>{title}</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {headerAction}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? `折叠${title}` : `展开${title}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: 0 }}
          >
            <ChevronDown
              size={14}
              style={{
                transition: 'transform 0.15s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>
        </div>
      </div>
      <div
        id={panelId}
        role="region"
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// 附着在 label 上的可见"可查看说明"提示图标 (label 本身携带 title 属性提供 hover 说明，
// 该图标仅作为发现性提示，不重复承载 title，避免冗余 tooltip)
const HintIcon: React.FC = () => (
  <Info
    size={11}
    strokeWidth={2}
    aria-hidden="true"
    style={{ display: 'inline-block', verticalAlign: '-1px', marginLeft: '4px', opacity: 0.5, pointerEvents: 'none' }}
  />
);

interface RightPropertiesPanelProps {
  activeTool: string;
  // Canvas Background
  bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
  setBgType: (type: 'solid' | 'gradient' | 'image' | 'panoramic') => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  setBgGradient: (grad: string[]) => void;
  bgImageSrc?: string;
  setBgImageSrc: (src: string) => void;
  bgImageScale?: number;
  setBgImageScale?: (scale: number) => void;
  bgBlur: number;
  setBgBlur: (blur: number) => void;
  showFrostedGlass: boolean;
  setShowFrostedGlass: (show: boolean) => void;

  // Device instances array (Multi-device support)
  devices: DeviceInstance[];
  setDevices: (devices: DeviceInstance[]) => void;
  screenshots: string[];
  activeDeviceIndex?: number;
  setActiveDeviceIndex?: (idx: number) => void;

  // Typography
  titleText: string;
  setTitleText: (text: string) => void;
  subtitleText: string;
  setSubtitleText: (text: string) => void;
  titleFontSize: number;
  setTitleFontSize: (size: number) => void;
  subtitleFontSize: number;
  setSubtitleFontSize: (size: number) => void;
  titleFontFamily: string;
  setTitleFontFamily: (font: string) => void;
  subtitleFontFamily: string;
  setSubtitleFontFamily: (font: string) => void;
  textAlign?: 'left' | 'center' | 'right';
  setTextAlign?: (align: 'left' | 'center' | 'right') => void;
  customTextColor?: string;
  setCustomTextColor?: (color: string | undefined) => void;
  textOnTop?: boolean;
  setTextOnTop?: (onTop: boolean) => void;
  hasTextTransform?: boolean;
  onResetTextTransform?: () => void;

  collapsed?: boolean;

  // Icon workspace
  hasIconImage?: boolean;
  iconSourceDataUrl?: string | null;
  iconPadding?: number;
  setIconPadding?: (v: number) => void;
  iconPaddingY?: number;
  setIconPaddingY?: (v: number) => void;
  iconBgColor?: string;
  setIconBgColor?: (v: string) => void;
  iconHasAlpha?: boolean;
  iconForegroundScale?: number;
  setIconForegroundScale?: (v: number) => void;
  iconBgMode?: 'solid' | 'gradient';
  setIconBgMode?: (v: 'solid' | 'gradient') => void;
  iconBgGradient?: [string, string];
  setIconBgGradient?: (v: [string, string]) => void;
  onSaveIconHistory?: () => void;

  // New mockup generator customization properties
  layout?: 'text-top' | 'text-bottom' | 'full-device';
  setLayout?: (layout: 'text-top' | 'text-bottom' | 'full-device') => void;
  showGlassReflection?: boolean;
  setShowGlassReflection?: (show: boolean) => void;
  showStatusBar?: boolean;
  setShowStatusBar?: (show: boolean) => void;
  shadowPreset?: 'none' | 'soft' | 'premium';
  setShadowPreset?: (preset: 'none' | 'soft' | 'premium') => void;
  showToast?: (msg: string, action?: { label: string; onClick: () => void }) => void;
  // 供"删除设备"之类可逆操作在 toast 里挂一个"撤销"按钮，直接回退到全局历史栈的上一步。
  onUndoLastAction?: () => void;
}

export const RightPropertiesPanel: React.FC<RightPropertiesPanelProps> = ({
  activeTool,
  bgType,
  setBgType,
  bgColor,
  setBgColor,
  setBgGradient,
  bgImageSrc,
  setBgImageSrc,
  bgImageScale = 1,
  setBgImageScale,
  bgBlur,
  setBgBlur,
  showFrostedGlass,
  setShowFrostedGlass,
  devices = [],
  setDevices,
  screenshots = [],
  activeDeviceIndex: controlledDeviceIndex,
  setActiveDeviceIndex: setControlledDeviceIndex,
  titleText,
  setTitleText,
  subtitleText,
  setSubtitleText,
  titleFontSize,
  setTitleFontSize,
  subtitleFontSize,
  setSubtitleFontSize,
  titleFontFamily,
  setTitleFontFamily,
  subtitleFontFamily,
  setSubtitleFontFamily,
  textAlign = 'center',
  setTextAlign,
  customTextColor,
  setCustomTextColor,
  textOnTop = true,
  setTextOnTop,
  hasTextTransform = false,
  onResetTextTransform,
  collapsed = false,
  hasIconImage = false,
  iconSourceDataUrl = null,
  iconPadding = 0.12,
  setIconPadding,
  iconPaddingY = 0.12,
  setIconPaddingY,
  iconBgColor = '#f5f5f4',
  setIconBgColor,
  iconHasAlpha = false,
  iconForegroundScale = 0.8,
  setIconForegroundScale,
  iconBgMode = 'solid',
  setIconBgMode,
  iconBgGradient = ['#f5f5f4', '#e5e5e4'],
  setIconBgGradient,
  onSaveIconHistory,
  
  // New properties
  layout = 'text-top',
  setLayout,
  showGlassReflection = true,
  setShowGlassReflection,
  showStatusBar = true,
  setShowStatusBar,
  shadowPreset = 'premium',
  setShadowPreset,
  showToast,
  onUndoLastAction,
}) => {
  const bgPresets = ['#ffffff', '#f5f5f4', '#e5e5e4', '#dcdcdc', '#8a8a8a', '#4a4a4a', '#1e1e1e', '#0a0a0a'];
  
  const gradientPresets = [
    { name: m.gradientPresets.charcoal, colors: ['#1c1c1c', '#0a0a0a'] },
    { name: m.gradientPresets.sand, colors: ['#f5f5f4', '#e5e5e4'] },
    { name: m.gradientPresets.silk, colors: ['#ffffff', '#d4d4d8'] },
    { name: m.gradientPresets.mist, colors: ['#fafaf9', '#e7e5e4'] },
  ];

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [internalDeviceIndex, setInternalDeviceIndex] = useState<number>(0);
  const activeDeviceIndex = controlledDeviceIndex ?? internalDeviceIndex;
  const setActiveDeviceIndex = setControlledDeviceIndex ?? setInternalDeviceIndex;

  // Auto layout preset triggers
  const applyPresetLayout = (presetType: 'single' | 'double' | 'skew') => {
    if (presetType === 'single') {
      setDevices([
        {
          id: 'dev-1',
          deviceModel: 'iphone_16_pro_light',
          screenshotSrc: devices[0]?.screenshotSrc || screenshots[0],
          angle: 0,
          skewX: 0,
          scale: 1.28,
          offsetX: 0,
          offsetY: 60,
          screenshotScale: 1.05,
          screenshotOffsetY: 25,
        }
      ]);
      setActiveDeviceIndex(0);
    } else if (presetType === 'double') {
      setDevices([
        {
          id: 'dev-1',
          deviceModel: 'iphone_16_pro',
          screenshotSrc: devices[0]?.screenshotSrc || screenshots[0],
          angle: -5,
          skewX: 0,
          scale: 0.82,
          offsetX: -180,
          offsetY: 150,
        },
        {
          id: 'dev-2',
          deviceModel: 'iphone_16_pro_light',
          screenshotSrc: devices[1]?.screenshotSrc || screenshots[0],
          angle: 5,
          skewX: 0,
          scale: 0.82,
          offsetX: 180,
          offsetY: 150,
        }
      ]);
      setActiveDeviceIndex(0);
    } else if (presetType === 'skew') {
      setDevices([
        {
          id: 'dev-1',
          deviceModel: 'iphone_16_pro',
          screenshotSrc: devices[0]?.screenshotSrc || screenshots[0],
          angle: 12,
          skewX: -5,
          scale: 0.88,
          offsetX: 0,
          offsetY: 120,
        }
      ]);
      setActiveDeviceIndex(0);
    }
  };

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result && typeof event.target.result === 'string') {
          setBgImageSrc(event.target.result);
          // 新图上传后重置缩放，避免沿用上一张图的比例导致意外裁切
          setBgImageScale?.(1);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Safe fetch of current device under edit
  const activeDevice = devices[activeDeviceIndex] || devices[0];

  const updateActiveDevice = (fields: Partial<DeviceInstance>) => {
    const idx = devices[activeDeviceIndex] ? activeDeviceIndex : 0;
    const newDevices = devices.map((dev, i) =>
      i === idx ? { ...dev, ...fields } : dev
    );
    setDevices(newDevices);
  };

  const addDevice = () => {
    const newDev: DeviceInstance = {
      id: `dev-${Date.now()}`,
      deviceModel: 'iphone_16_pro',
      screenshotSrc: screenshots[0],
      angle: 0,
      skewX: 0,
      scale: 0.8,
      offsetX: devices.length * 40,
      offsetY: 100,
      screenshotScale: 1.0,
      screenshotOffsetY: 0,
    };
    setDevices([...devices, newDev]);
    setActiveDeviceIndex(devices.length);
  };

  const deleteDevice = (index: number) => {
    if (devices.length <= 1) return;
    const newDevices = devices.filter((_, i) => i !== index);
    setDevices(newDevices);
    setActiveDeviceIndex(Math.max(0, index - 1));
    showToast?.(`已删除设备 ${index + 1}`, onUndoLastAction ? { label: '撤销', onClick: onUndoLastAction } : undefined);
  };

  const handleSmartColorExtract = async () => {
    const activeScreenshot = activeDevice?.screenshotSrc || devices.find(d => d.screenshotSrc)?.screenshotSrc || screenshots[0];
    if (!activeScreenshot) {
      showToast?.('请先在左侧上传或绑定内屏截图');
      return;
    }
    try {
      const [c1, c2] = await extractPaletteFromImage(activeScreenshot);
      setBgType('gradient');
      setBgGradient([c1, c2]);
      showToast?.('配色提取成功，已自动设置契合内屏的智能渐变色背景');
    } catch (e) {
      console.error('Palette extraction failed', e);
      showToast?.('色彩提取失败，请重试');
    }
  };

  const handleIconSmartColorExtract = async () => {
    const source = iconSourceDataUrl || devices.find(d => d.screenshotSrc)?.screenshotSrc || screenshots[0];
    if (!source) {
      showToast?.('请先上传图标原图或内屏截图');
      return;
    }
    try {
      const [c1, c2] = await extractPaletteFromImage(source);
      setIconBgMode?.('gradient');
      setIconBgGradient?.([c1, c2]);
      showToast?.('配色提取成功，已设置契合图像的 135° 渐变背景');
    } catch (e) {
      console.error('Icon palette extraction failed', e);
      showToast?.('色彩提取失败，请重试');
    }
  };

  const titleOverLimit = titleText.length > estimateRecommendedMaxChars(titleFontSize, TITLE_BOX_WIDTH, TITLE_MAX_LINES);
  const subtitleOverLimit = subtitleText.length > estimateRecommendedMaxChars(subtitleFontSize, SUBTITLE_BOX_WIDTH, SUBTITLE_MAX_LINES);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {activeTool === 'screenshots' ? (
        <>
          {/* 快速核心控制区：版式与置顶开关，无需展开折叠面板即可直接操作 */}
          <div className="sidebar-title">{m.coreArrangement}</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-primary)' }}>
            <div className="ds-input-group" style={{ marginBottom: '2px' }}>
              <label className="ds-label">{m.templateLayout}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  className={`ds-btn ${layout === 'text-top' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setLayout?.('text-top')}
                >
                  {m.textTop}
                </button>
                <button
                  className={`ds-btn ${layout === 'text-bottom' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setLayout?.('text-bottom')}
                >
                  {m.textBottom}
                </button>
                <button
                  className={`ds-btn ${layout === 'full-device' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setLayout?.('full-device')}
                >
                  {m.fullDevice}
                </button>
              </div>
            </div>

            <div className="ds-input-group" style={{ marginBottom: '2px' }}>
              <label className="ds-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0, cursor: 'pointer' }} htmlFor="text-on-top-toggle">
                <span>{m.textOnTop}</span>
                <input
                  id="text-on-top-toggle"
                  type="checkbox"
                  checked={textOnTop}
                  onChange={(e) => setTextOnTop?.(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--ink-primary)' }}
                />
              </label>
            </div>
          </div>

          {/* 画布背景 */}
          <SectionAccordion
            title="画布背景"
            defaultOpen={true}
            headerAction={
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBgType('solid');
                  setBgColor('#f5f5f4');
                  setBgBlur(0);
                  setShowFrostedGlass(false);
                  setBgImageScale?.(1);
                  showToast?.('已恢复默认背景');
                }}
                title="恢复默认背景设置"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', padding: 0 }}
              >
                恢复默认
              </button>
            }
          >
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label">填充方式</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                <button
                  className={`ds-btn ${bgType === 'solid' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setBgType('solid')}
                >
                  纯色
                </button>
                <button
                  className={`ds-btn ${bgType === 'gradient' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setBgType('gradient')}
                >
                  渐变
                </button>
                <button
                  className={`ds-btn ${bgType === 'image' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => {
                    setBgType('image');
                    if (!bgImageSrc || bgImageSrc.length < 50) {
                      setBgImageSrc(marbleBg);
                    }
                  }}
                >
                  纹理
                </button>
                <button
                  className={`ds-btn ${bgType === 'panoramic' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => {
                    setBgType('panoramic');
                  }}
                >
                  连图
                </button>
              </div>
            </div>

            {/* 智能提取配色按钮 */}
            {(screenshots.length > 0 || devices.some(d => d.screenshotSrc)) && (
              <button
                className="ds-btn"
                onClick={handleSmartColorExtract}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderColor: 'var(--border-focus)',
                  borderStyle: 'solid',
                  fontSize: '11px',
                  padding: '8px 0',
                  background: 'rgba(255, 255, 255, 0.03)',
                  marginTop: '-4px',
                  marginBottom: '4px',
                }}
              >
                <Palette size={13} strokeWidth={2} style={{ color: 'var(--ink-secondary)' }} />
                <span>智能提取内屏色彩一键配色</span>
              </button>
            )}

            {bgType === 'solid' && (
              <div className="ds-input-group">
                <label className="ds-label">背景色预设</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {bgPresets.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBgColor(color)}
                      style={{
                        height: '24px',
                        backgroundColor: color,
                        border: '1px solid',
                        borderColor: bgColor.toLowerCase() === color.toLowerCase() ? 'var(--border-focus)' : 'var(--border-primary)',
                        cursor: 'pointer',
                      }}
                      title={color}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#000000'}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    className="ds-input"
                    style={{ fontSize: '0.8125rem', height: '32px' }}
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {bgType === 'gradient' && (
              <div className="ds-input-group" style={{ gap: '8px' }}>
                <label className="ds-label">渐变模板</label>
                {gradientPresets.map((grad) => (
                  <button
                    key={grad.name}
                    className="ds-btn"
                    style={{
                      justifyContent: 'flex-start',
                      width: '100%',
                      background: `linear-gradient(to right, ${grad.colors[0]}, ${grad.colors[1]})`,
                      border: '1px solid var(--border-primary)',
                      padding: '8px 12px',
                      color: grad.colors[0] === '#1c1c1c' ? '#fff' : '#000',
                      fontWeight: 500,
                    }}
                    onClick={() => {
                      setBgGradient(grad.colors);
                      setBgColor(grad.colors[0]);
                    }}
                  >
                    <span>{grad.name}</span>
                  </button>
                ))}
              </div>
            )}

            {(bgType === 'image' || bgType === 'panoramic') && (
              <div className="ds-input-group" style={{ gap: '10px' }}>
                <label className="ds-label">底图选择</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    className={`ds-btn ${bgImageSrc === marbleBg ? 'ds-btn-active' : ''}`}
                    style={{ padding: '8px 4px', fontSize: '11px' }}
                    onClick={() => setBgImageSrc(marbleBg)}
                  >
                    白色大理石
                  </button>
                  <button
                    className={`ds-btn ${bgImageSrc === grainBg ? 'ds-btn-active' : ''}`}
                    style={{ padding: '8px 4px', fontSize: '11px' }}
                    onClick={() => setBgImageSrc(grainBg)}
                  >
                    细腻纸纹
                  </button>
                </div>

                <div>
                  <input
                    type="file"
                    ref={imageFileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                  />
                  <button
                    className="ds-btn"
                    style={{ width: '100%', fontSize: '12px' }}
                    onClick={() => imageFileInputRef.current?.click()}
                  >
                    {bgType === 'panoramic' ? '上传超宽连图背景' : '上传自定义背景图'}
                  </button>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="bg-image-scale" title="放大底图以填满画布边缘，避免留白，不影响标题与设备的位置（双击滑块可恢复 100%）">
                    {m.bgImageScale}<HintIcon /> ({Math.round(bgImageScale * 100)}%)
                  </label>
                  <input
                    id="bg-image-scale"
                    type="range"
                    min="100"
                    max="300"
                    step="5"
                    value={Math.round(bgImageScale * 100)}
                    onChange={(e) => setBgImageScale?.(parseInt(e.target.value) / 100)}
                    onDoubleClick={() => setBgImageScale?.(1)}
                    title={m.doubleClickResetHint}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>
              </div>
            )}
          </div>
          </SectionAccordion>

          {/* 渲染特效设置 */}
          <SectionAccordion title={m.visualEffects}>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(bgType === 'image' || bgType === 'panoramic') && (
              <div className="ds-input-group">
                <label className="ds-label" htmlFor="bg-blur" title="模糊底图细节，让前景的标题与设备更突出，数值越大越模糊（双击滑块可归零）">{m.bgGaussianBlur}<HintIcon /> ({bgBlur}px)</label>
                <input
                  id="bg-blur"
                  type="range"
                  min="0"
                  max="30"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(parseInt(e.target.value))}
                  onDoubleClick={() => setBgBlur(0)}
                  title={m.doubleClickResetHint}
                  style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                />
              </div>
            )}

            <div className="ds-input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <label className="ds-label" style={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="frosted-glass-toggle">
                {m.frostedGlassBacking}
              </label>
              <input
                id="frosted-glass-toggle"
                type="checkbox"
                checked={showFrostedGlass}
                onChange={(e) => setShowFrostedGlass(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--ink-primary)',
                }}
              />
            </div>

            <div className="ds-input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <label className="ds-label" style={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="glass-reflection-toggle">
                {m.screenGlassReflection}
              </label>
              <input
                id="glass-reflection-toggle"
                type="checkbox"
                checked={showGlassReflection}
                onChange={(e) => setShowGlassReflection?.(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--ink-primary)',
                }}
              />
            </div>

            <div className="ds-input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <label className="ds-label" style={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="status-bar-toggle">
                {m.smartStatusBar}
              </label>
              <input
                id="status-bar-toggle"
                type="checkbox"
                checked={showStatusBar}
                onChange={(e) => setShowStatusBar?.(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--ink-primary)',
                }}
              />
            </div>

            <div className="ds-input-group">
              <label className="ds-label">{m.deviceShadow}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  className={`ds-btn ${shadowPreset === 'none' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setShadowPreset?.('none')}
                >
                  {m.shadowNone}
                </button>
                <button
                  className={`ds-btn ${shadowPreset === 'soft' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setShadowPreset?.('soft')}
                >
                  {m.shadowSoft}
                </button>
                <button
                  className={`ds-btn ${shadowPreset === 'premium' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setShadowPreset?.('premium')}
                >
                  {m.shadowPremium}
                </button>
              </div>
            </div>
          </div>
          </SectionAccordion>

          {/* 设备与布局设置 */}
          <SectionAccordion
            title={m.deviceLayoutAndTransform}
            defaultOpen={true}
            headerAction={
              activeDevice ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateActiveDevice({
                      angle: 0,
                      skewX: 0,
                      scale: 1,
                      offsetX: 0,
                      offsetY: 100,
                      screenshotScale: 1,
                      screenshotOffsetY: 0,
                    });
                    showToast?.(appMsg.toasts.resetDeviceDone);
                  }}
                  title="恢复当前设备的默认位置与变换"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', padding: 0 }}
                >
                  {m.resetDefault}
                </button>
              ) : undefined
            }
          >
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label">{m.quickLayout}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('single')}>{m.layoutSingle}</button>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('double')}>{m.layoutDouble}</button>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('skew')}>{m.layoutSkew}</button>
              </div>
            </div>
            {/* 设备选择页签 */}
            <div className="ds-input-group">
              <label className="ds-label">{m.activeDeviceAdjust}</label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                {devices.map((dev, idx) => (
                  <button
                    key={dev.id}
                    className={`ds-btn ${activeDeviceIndex === idx ? 'ds-btn-active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
                    onClick={() => setActiveDeviceIndex(idx)}
                  >
                    {formatMessage(m.deviceTab, { n: idx + 1 })}
                  </button>
                ))}
                <button
                  className="ds-btn"
                  style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0, borderStyle: 'dashed' }}
                  onClick={addDevice}
                >
                  {m.addDevice}
                </button>
              </div>
            </div>

            {activeDevice && (
              <>
                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="device-model">{m.deviceModel}</label>
                  <select
                    id="device-model"
                    className="ds-select"
                    value={activeDevice.deviceModel}
                    onChange={(e) => updateActiveDevice({ deviceModel: e.target.value })}
                  >
                    <optgroup label={m.realFrameGroup}>
                      <option value="iphone_17_pro_max_silver">苹果 17 旗舰版 (银色)</option>
                      <option value="iphone_17_pro_max_deep_blue">苹果 17 旗舰版 (深蓝色)</option>
                      <option value="iphone_17_pro_max_cosmic_orange">苹果 17 旗舰版 (熔岩橙)</option>
                      <option value="iphone_17_pro_silver">苹果 17 专业版 (银色)</option>
                      <option value="iphone_17_pro_deep_blue">苹果 17 专业版 (深蓝色)</option>
                      <option value="iphone_16_pro_max_black_titanium">苹果 16 旗舰版 (黑色钛金属)</option>
                      <option value="iphone_16_pro_max_natural_titanium">苹果 16 旗舰版 (原色钛金属)</option>
                      <option value="iphone_16_pro_max_white_titanium">苹果 16 旗舰版 (白色钛金属)</option>
                      <option value="iphone_16_black">苹果 16 标准版 (黑色)</option>
                      <option value="iphone_16_white">苹果 16 标准版 (白色)</option>
                      <option value="iphone_16_ultramarine">苹果 16 标准版 (群青蓝)</option>
                      <option value="ipad_pro_12_9_space_gray">苹果专业平板 12.9 寸 (深空灰)</option>
                      <option value="ipad_pro_12_9_silver">苹果专业平板 12.9 寸 (银色)</option>
                      <option value="galaxy_s21_ultra_black">三星旗舰手机 (幻影黑)</option>
                      <option value="galaxy_s21_ultra_silver">三星旗舰手机 (幻影银)</option>
                      <option value="pixel_5_black">谷歌原生旗舰手机 (纯黑)</option>
                      <option value="pixel_5_sage">谷歌原生旗舰手机 (鼠尾草绿)</option>
                    </optgroup>
                    <optgroup label={m.vectorFrameGroup}>
                      <option value="iphone_16_pro">经典矢量手机 (深空黑)</option>
                      <option value="iphone_16_pro_light">经典矢量手机 (典雅银)</option>
                      <option value="iphone_16_pro_gold">经典矢量手机 (香槟金)</option>
                      <option value="iphone_16_pro_rose_gold">经典矢量手机 (玫瑰金)</option>
                      <option value="ipad_pro">经典矢量平板 (典雅银)</option>
                      <option value="ipad_pro_dark">经典矢量平板 (深空黑)</option>
                      <option value="google_pixel">经典安卓挖孔屏 (深空黑)</option>
                      <option value="google_pixel_light">经典安卓挖孔屏 (典雅银)</option>
                    </optgroup>
                  </select>
                </div>

                {/* 截图联动选择 */}
                <div className="ds-input-group">
                  <label className="ds-label">{m.bindScreenshot}</label>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
                    <button
                      className={`ds-btn ${!activeDevice.screenshotSrc ? 'ds-btn-active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}
                      onClick={() => updateActiveDevice({ screenshotSrc: undefined })}
                    >
                      {m.noScreenshot}
                    </button>
                    {screenshots.map((src, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => updateActiveDevice({ screenshotSrc: src })}
                        style={{
                          width: '32px',
                          height: '48px',
                          border: '1px solid',
                          borderColor: activeDevice.screenshotSrc === src ? 'var(--border-focus)' : 'var(--border-primary)',
                          padding: 0,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <img src={src} alt={`截图 ${sIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2.5D Sliders */}
                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-angle" title="围绕平面中心旋转整个设备外壳，用于制造轻微倾斜的展示视角（双击滑块可归零）">{m.rotationAngle}<HintIcon /> ({activeDevice.angle || 0}°)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-angle"
                      type="range"
                      min="-45"
                      max="45"
                      value={activeDevice.angle || 0}
                      onChange={(e) => updateActiveDevice({ angle: parseInt(e.target.value) })}
                      onDoubleClick={() => updateActiveDevice({ angle: 0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="-45"
                      max="45"
                      value={activeDevice.angle || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ angle: Math.max(-45, Math.min(45, val)) });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-skew" title="沿垂直轴倾斜外壳边缘，制造立体视角（双击滑块可归零）">{m.perspectiveSkew}<HintIcon /> ({activeDevice.skewX || 0}°)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-skew"
                      type="range"
                      min="-20"
                      max="20"
                      value={activeDevice.skewX || 0}
                      onChange={(e) => updateActiveDevice({ skewX: parseInt(e.target.value) })}
                      onDoubleClick={() => updateActiveDevice({ skewX: 0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="-20"
                      max="20"
                      value={activeDevice.skewX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ skewX: Math.max(-20, Math.min(20, val)) });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-scale" title="整体放大或缩小设备外壳尺寸（双击滑块可恢复 100%）">{m.scaleSize}<HintIcon /> ({Math.round((activeDevice.scale || 1) * 100)}%)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-scale"
                      type="range"
                      min="40"
                      max="150"
                      value={Math.round((activeDevice.scale || 1) * 100)}
                      onChange={(e) => updateActiveDevice({ scale: parseInt(e.target.value) / 100 })}
                      onDoubleClick={() => updateActiveDevice({ scale: 1 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="40"
                      max="150"
                      value={Math.round((activeDevice.scale || 1) * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ scale: Math.max(40, Math.min(150, val)) / 100 });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-offset-x" title="沿水平方向移动整个设备外壳在画布中的位置（双击滑块可居中归零）">{m.offsetX}<HintIcon /> ({activeDevice.offsetX || 0}px)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-offset-x"
                      type="range"
                      min="-500"
                      max="500"
                      value={activeDevice.offsetX || 0}
                      onChange={(e) => updateActiveDevice({ offsetX: parseInt(e.target.value) })}
                      onDoubleClick={() => updateActiveDevice({ offsetX: 0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="-500"
                      max="500"
                      value={activeDevice.offsetX || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ offsetX: Math.max(-500, Math.min(500, val)) });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-offset-y" title="沿垂直方向移动整个设备外壳在画布中的位置（双击滑块可归零）">{m.offsetY}<HintIcon /> ({activeDevice.offsetY || 0}px)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-offset-y"
                      type="range"
                      min="-200"
                      max="600"
                      value={activeDevice.offsetY || 0}
                      onChange={(e) => updateActiveDevice({ offsetY: parseInt(e.target.value) })}
                      onDoubleClick={() => updateActiveDevice({ offsetY: 0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="-200"
                      max="600"
                      value={activeDevice.offsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ offsetY: Math.max(-200, Math.min(600, val)) });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-ss-scale" title="仅缩放设备屏幕内的截图内容本身，不影响外壳大小（双击滑块可恢复 100%）">{m.screenshotScale}<HintIcon /> ({Math.round((activeDevice.screenshotScale || 1.0) * 100)}%)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-ss-scale"
                      type="range"
                      min="80"
                      max="150"
                      value={Math.round((activeDevice.screenshotScale || 1.0) * 100)}
                      onChange={(e) => updateActiveDevice({ screenshotScale: parseInt(e.target.value) / 100 })}
                      onDoubleClick={() => updateActiveDevice({ screenshotScale: 1.0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="80"
                      max="150"
                      value={Math.round((activeDevice.screenshotScale || 1.0) * 100)}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ screenshotScale: Math.max(80, Math.min(150, val)) / 100 });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="dev-ss-offset-y" title="仅上下移动屏幕内的截图内容，用于对齐状态栏或裁掉截图顶部/底部的多余留白（双击滑块可归零）">{m.screenshotOffsetY}<HintIcon /> ({activeDevice.screenshotOffsetY || 0}px)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      id="dev-ss-offset-y"
                      type="range"
                      min="-100"
                      max="100"
                      value={activeDevice.screenshotOffsetY || 0}
                      onChange={(e) => updateActiveDevice({ screenshotOffsetY: parseInt(e.target.value) })}
                      onDoubleClick={() => updateActiveDevice({ screenshotOffsetY: 0 })}
                      title={m.doubleClickResetHint}
                      style={{ flex: 1, accentColor: 'var(--ink-primary)' }}
                    />
                    <input
                      type="number"
                      min="-100"
                      max="100"
                      value={activeDevice.screenshotOffsetY || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          updateActiveDevice({ screenshotOffsetY: Math.max(-100, Math.min(100, val)) });
                        }
                      }}
                      className="ds-input"
                      style={{ width: '56px', padding: '4px 6px', fontSize: '11px', textAlign: 'center', height: '24px' }}
                    />
                  </div>
                </div>

                {devices.length > 1 && (
                  <button
                    className="ds-btn"
                    style={{ width: '100%' }}
                    onClick={() => deleteDevice(activeDeviceIndex)}
                  >
                    {m.deleteActiveDevice}
                  </button>
                )}
              </>
            )}
          </div>
          </SectionAccordion>

          {/* 文案与排版 */}
          <SectionAccordion
            title={m.copyAndTypography}
            defaultOpen={true}
            headerAction={
              hasTextTransform && onResetTextTransform ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetTextTransform();
                    showToast?.(appMsg.toasts.resetTextDone);
                  }}
                  title="恢复主副标题的默认排版位置与角度"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-tertiary)', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', padding: 0 }}
                >
                  {m.resetPosition}
                </button>
              ) : undefined
            }
          >
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label" htmlFor="title-font">{m.titleFont}</label>
              <select
                id="title-font"
                className="ds-select"
                style={{ fontFamily: `"${titleFontFamily}", var(--font-sans)` }}
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
              >
                <option value="Geist">{m.fonts.geist}</option>
                <option value="Playfair Display">{m.fonts.playfair}</option>
                <option value="Lora">{m.fonts.lora}</option>
                <option value="Cormorant Garamond">{m.fonts.cormorant}</option>
                <option value="Inter">{m.fonts.inter}</option>
                <option value="Outfit">{m.fonts.outfit}</option>
              </select>
            </div>

            <div className="ds-input-group">
              <label className="ds-label" htmlFor="subtitle-font">{m.subtitleFont}</label>
              <select
                id="subtitle-font"
                className="ds-select"
                style={{ fontFamily: `"${subtitleFontFamily}", var(--font-sans)` }}
                value={subtitleFontFamily}
                onChange={(e) => setSubtitleFontFamily(e.target.value)}
              >
                <option value="Geist">{m.fonts.geist}</option>
                <option value="Inter">{m.fonts.inter}</option>
                <option value="Playfair Display">{m.fonts.playfair}</option>
                <option value="Outfit">{m.fonts.outfit}</option>
              </select>
            </div>

            <div className="ds-input-group">
              <label className="ds-label">{m.textAlign}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  className={`ds-btn ${textAlign === 'left' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setTextAlign?.('left')}
                >
                  {m.alignLeft}
                </button>
                <button
                  className={`ds-btn ${textAlign === 'center' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setTextAlign?.('center')}
                >
                  {m.alignCenter}
                </button>
                <button
                  className={`ds-btn ${textAlign === 'right' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setTextAlign?.('right')}
                >
                  {m.alignRight}
                </button>
              </div>
            </div>

            <div className="ds-input-group">
              <label className="ds-label">{m.textColor}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: customTextColor ? '8px' : '0' }}>
                <button
                  className={`ds-btn ${!customTextColor ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setCustomTextColor?.(undefined)}
                >
                  {m.textColorAuto}
                </button>
                <button
                  className={`ds-btn ${customTextColor ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '10px', padding: '6px 0' }}
                  onClick={() => setCustomTextColor?.(customTextColor || '#121212')}
                >
                  {m.textColorCustom}
                </button>
              </div>
              {customTextColor && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="color"
                    value={customTextColor.startsWith('#') && customTextColor.length === 7 ? customTextColor : '#121212'}
                    onChange={(e) => setCustomTextColor?.(e.target.value)}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    className="ds-input"
                    style={{ fontSize: '0.8125rem', height: '32px' }}
                    value={customTextColor}
                    onChange={(e) => setCustomTextColor?.(e.target.value)}
                    placeholder="#121212"
                  />
                </div>
              )}
            </div>

            <div className="ds-input-group">
              <label className="ds-label" htmlFor="title-text">{m.titleContent}</label>
              <input
                id="title-text"
                type="text"
                className="ds-input"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder={m.titlePlaceholder}
                aria-describedby={titleOverLimit ? 'title-text-hint' : undefined}
              />
              {titleOverLimit && (
                <p id="title-text-hint" role="status" style={{ fontSize: '11px', color: 'var(--ink-secondary)', borderLeft: '1px solid var(--border-focus)', paddingLeft: '8px', marginTop: '4px', lineHeight: 1.4 }}>
                  {formatMessage(m.overLimitHint, { count: titleText.length })}
                </p>
              )}
            </div>

            <div className="ds-input-group">
              <label className="ds-label" htmlFor="title-size">{m.titleSize} ({titleFontSize}px)</label>
              <input
                id="title-size"
                type="range"
                min="24"
                max="320"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                onDoubleClick={() => setTitleFontSize(92)}
                title={m.doubleClickResetHint}
                style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
              />
            </div>

            <div className="ds-input-group">
              <label className="ds-label" htmlFor="subtitle-text">{m.subtitleContent}</label>
              <input
                id="subtitle-text"
                type="text"
                className="ds-input"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder={m.subtitlePlaceholder}
                aria-describedby={subtitleOverLimit ? 'subtitle-text-hint' : undefined}
              />
              {subtitleOverLimit && (
                <p id="subtitle-text-hint" role="status" style={{ fontSize: '11px', color: 'var(--ink-secondary)', borderLeft: '1px solid var(--border-focus)', paddingLeft: '8px', marginTop: '4px', lineHeight: 1.4 }}>
                  {formatMessage(m.overLimitHint, { count: subtitleText.length })}
                </p>
              )}
            </div>

            <div className="ds-input-group">
              <label className="ds-label" htmlFor="subtitle-size">{m.subtitleSize} ({subtitleFontSize}px)</label>
              <input
                id="subtitle-size"
                type="range"
                min="14"
                max="144"
                value={subtitleFontSize}
                onChange={(e) => setSubtitleFontSize(parseInt(e.target.value))}
                onDoubleClick={() => setSubtitleFontSize(44)}
                title={m.doubleClickResetHint}
                style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
              />
            </div>
          </div>
          </SectionAccordion>
        </>
      ) : activeTool === 'icons' ? (
        hasIconImage ? (
          <SectionAccordion title="图标定制" defaultOpen={true}>
            <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* 保存方案到历史 */}
              {onSaveIconHistory && (
                <button
                  className="ds-btn"
                  onClick={onSaveIconHistory}
                  style={{
                    width: '100%',
                    height: '36px',
                    fontSize: '12px',
                    marginBottom: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-primary)',
                  }}
                >
                  保存当前方案到历史
                </button>
              )}

              <div className="ds-input-group">
                <label className="ds-label" htmlFor="icon-padding">水平内边距 ({Math.round(iconPadding * 100)}%)</label>
                <input
                  id="icon-padding"
                  type="range"
                  min="0"
                  max="40"
                  value={Math.round(iconPadding * 100)}
                  onChange={(e) => setIconPadding?.(parseInt(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                />
              </div>

              <div className="ds-input-group">
                <label className="ds-label" htmlFor="icon-padding-y">垂直内边距 ({Math.round(iconPaddingY * 100)}%)</label>
                <input
                  id="icon-padding-y"
                  type="range"
                  min="0"
                  max="40"
                  value={Math.round(iconPaddingY * 100)}
                  onChange={(e) => setIconPaddingY?.(parseInt(e.target.value) / 100)}
                  style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                />
              </div>

              {/* 背景模式选择 */}
              <div className="ds-input-group">
                <label className="ds-label">背景填充模式</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px' }}>
                  <button
                    className={`ds-btn ${iconBgMode === 'solid' ? 'ds-btn-active' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 0' }}
                    onClick={() => setIconBgMode?.('solid')}
                  >
                    纯色
                  </button>
                  <button
                    className={`ds-btn ${iconBgMode === 'gradient' ? 'ds-btn-active' : ''}`}
                    style={{ fontSize: '11px', padding: '6px 0' }}
                    onClick={() => setIconBgMode?.('gradient')}
                  >
                    135°渐变
                  </button>
                </div>
              </div>

              <button
                className="ds-btn"
                onClick={handleIconSmartColorExtract}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderColor: 'var(--border-focus)',
                  borderStyle: 'solid',
                  fontSize: '11px',
                  padding: '8px 0',
                  marginTop: '-4px',
                  marginBottom: '4px',
                }}
              >
                <Palette size={13} strokeWidth={2} style={{ color: 'var(--ink-secondary)' }} />
                <span>智能提取色彩一键渐变配色</span>
              </button>

              {iconBgMode === 'solid' ? (
                <div className="ds-input-group">
                  <label className="ds-label">背景填充色</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '8px' }}>
                    {bgPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => setIconBgColor?.(color)}
                        style={{
                          height: '24px',
                          backgroundColor: color,
                          border: '1px solid',
                          borderColor: iconBgColor.toLowerCase() === color.toLowerCase() ? 'var(--border-focus)' : 'var(--border-primary)',
                          cursor: 'pointer',
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="color"
                      value={iconBgColor.startsWith('#') && iconBgColor.length === 7 ? iconBgColor : '#000000'}
                      onChange={(e) => setIconBgColor?.(e.target.value)}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        border: '1px solid var(--border-primary)',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    />
                    <input
                      type="text"
                      className="ds-input"
                      style={{ fontSize: '0.8125rem', height: '32px' }}
                      value={iconBgColor}
                      onChange={(e) => setIconBgColor?.(e.target.value)}
                      placeholder="#f5f5f4"
                    />
                  </div>
                  {iconHasAlpha && (
                    <span style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>
                      检测到透明背景，已自动提取边缘色作为建议填充色，可手动覆盖。
                    </span>
                  )}
                </div>
              ) : (
                <div className="ds-input-group" style={{ gap: '10px' }}>
                  <label className="ds-label">渐变颜色设定</label>
                  
                  {/* Start color picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>起始颜色</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="color"
                        value={iconBgGradient[0]}
                        onChange={(e) => setIconBgGradient?.([e.target.value, iconBgGradient[1]])}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          border: '1px solid var(--border-primary)',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <input
                        type="text"
                        className="ds-input"
                        style={{ fontSize: '0.8125rem', height: '32px' }}
                        value={iconBgGradient[0]}
                        onChange={(e) => setIconBgGradient?.([e.target.value, iconBgGradient[1]])}
                      />
                    </div>
                  </div>

                  {/* End color picker */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>结束颜色</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="color"
                        value={iconBgGradient[1]}
                        onChange={(e) => setIconBgGradient?.([iconBgGradient[0], e.target.value])}
                        style={{
                          width: '32px',
                          height: '32px',
                          padding: 0,
                          border: '1px solid var(--border-primary)',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />
                      <input
                        type="text"
                        className="ds-input"
                        style={{ fontSize: '0.8125rem', height: '32px' }}
                        value={iconBgGradient[1]}
                        onChange={(e) => setIconBgGradient?.([iconBgGradient[0], e.target.value])}
                      />
                    </div>
                  </div>
                </div>
              )}

              {iconHasAlpha && (
                <div className="ds-input-group">
                  <label className="ds-label" htmlFor="icon-fg-scale">
                    {m.androidFgScale} ({Math.round(iconForegroundScale * 100)}%)
                  </label>
                  <input
                    id="icon-fg-scale"
                    type="range"
                    min="50"
                    max="100"
                    value={Math.round(iconForegroundScale * 100)}
                    onChange={(e) => setIconForegroundScale?.(parseInt(e.target.value) / 100)}
                    onDoubleClick={() => setIconForegroundScale?.(0.8)}
                    title={m.doubleClickResetHint}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>
              )}
            </div>
          </SectionAccordion>
        ) : (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
            上传图标原图后可在此调整内边距与背景填充
          </div>
        )
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
          本模块功能正在研发中
        </div>
      )}
    </aside>
  );
};
