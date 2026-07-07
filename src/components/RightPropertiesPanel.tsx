import React, { useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import marbleBg from '../assets/white_marble_bg.jpg';
import grainBg from '../assets/minimal_grain_bg.jpg';
import type { DeviceInstance } from '../utils/canvasManager';

const SectionAccordion: React.FC<{
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}> = ({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="sidebar-title"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          background: 'none',
          border: 'none',
          borderBottom: '1px solid var(--border-primary)',
          cursor: 'pointer',
          color: 'var(--ink-secondary)',
        }}
      >
        <span>{title}</span>
        <ChevronDown
          size={14}
          style={{
            transition: 'transform 0.15s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
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
  bgBlur: number;
  setBgBlur: (blur: number) => void;
  showFrostedGlass: boolean;
  setShowFrostedGlass: (show: boolean) => void;

  // Device instances array (Multi-device support)
  devices: DeviceInstance[];
  setDevices: (devices: DeviceInstance[]) => void;
  screenshots: string[];

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

  collapsed?: boolean;
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
  bgBlur,
  setBgBlur,
  showFrostedGlass,
  setShowFrostedGlass,
  devices = [],
  setDevices,
  screenshots = [],
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
  collapsed = false,
}) => {
  const bgPresets = ['#ffffff', '#f5f5f4', '#e5e5e4', '#dcdcdc', '#8a8a8a', '#4a4a4a', '#1e1e1e', '#0a0a0a'];
  
  const gradientPresets = [
    { name: '石墨渐变 (Charcoal)', colors: ['#1c1c1c', '#0a0a0a'] },
    { name: '沙褐渐变 (Sand)', colors: ['#f5f5f4', '#e5e5e4'] },
    { name: '银丝渐变 (Silk)', colors: ['#ffffff', '#d4d4d8'] },
    { name: '晨雾渐变 (Mist)', colors: ['#fafaf9', '#e7e5e4'] },
  ];

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [activeDeviceIndex, setActiveDeviceIndex] = useState<number>(0);

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
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {activeTool === 'screenshots' ? (
        <>
          {/* 画布背景 */}
          <SectionAccordion title="画布背景" defaultOpen={true}>
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
              </div>
            )}
          </div>
          </SectionAccordion>

          {/* 渲染特效设置 */}
          <SectionAccordion title="视觉特效">
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(bgType === 'image' || bgType === 'panoramic') && (
              <div className="ds-input-group">
                <label className="ds-label">背景高斯模糊 ({bgBlur}px)</label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                />
              </div>
            )}

            <div className="ds-input-group" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <label className="ds-label" style={{ marginBottom: 0, cursor: 'pointer' }} htmlFor="frosted-glass-toggle">
                加装毛玻璃背板
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
          </div>
          </SectionAccordion>

          {/* 设备与布局设置 */}
          <SectionAccordion title="设备布局与变换">
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label">快捷布局</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('single')}>单机居中</button>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('double')}>双机左右</button>
                <button className="ds-btn" style={{ fontSize: '10px', padding: '6px 0' }} onClick={() => applyPresetLayout('skew')}>倾斜悬浮</button>
              </div>
            </div>
            {/* 设备选择页签 */}
            <div className="ds-input-group">
              <label className="ds-label">活动设备调整</label>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px' }}>
                {devices.map((dev, idx) => (
                  <button
                    key={dev.id}
                    className={`ds-btn ${activeDeviceIndex === idx ? 'ds-btn-active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0 }}
                    onClick={() => setActiveDeviceIndex(idx)}
                  >
                    设备 {idx + 1}
                  </button>
                ))}
                <button
                  className="ds-btn"
                  style={{ padding: '4px 10px', fontSize: '11px', flexShrink: 0, borderStyle: 'dashed' }}
                  onClick={addDevice}
                >
                  + 新增
                </button>
              </div>
            </div>

            {activeDevice && (
              <>
                <div className="ds-input-group">
                  <label className="ds-label">设备机型</label>
                  <select
                    className="ds-select"
                    value={activeDevice.deviceModel}
                    onChange={(e) => updateActiveDevice({ deviceModel: e.target.value })}
                  >
                    <option value="iphone_16_pro">iPhone 16 Pro (深色)</option>
                    <option value="iphone_16_pro_light">iPhone 16 Pro (银色)</option>
                    <option value="ipad_pro">iPad Pro (平板)</option>
                    <option value="google_pixel">Google Pixel (安卓)</option>
                  </select>
                </div>

                {/* 截图联动选择 */}
                <div className="ds-input-group">
                  <label className="ds-label">绑定内屏截图</label>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0' }}>
                    <button
                      className={`ds-btn ${!activeDevice.screenshotSrc ? 'ds-btn-active' : ''}`}
                      style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}
                      onClick={() => updateActiveDevice({ screenshotSrc: undefined })}
                    >
                      无截图
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
                        <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2.5D Sliders */}
                <div className="ds-input-group">
                  <label className="ds-label">旋转角度 ({activeDevice.angle || 0}°)</label>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    value={activeDevice.angle || 0}
                    onChange={(e) => updateActiveDevice({ angle: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">三维错切 ({activeDevice.skewX || 0}°)</label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={activeDevice.skewX || 0}
                    onChange={(e) => updateActiveDevice({ skewX: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">缩放大小 ({Math.round((activeDevice.scale || 1) * 100)}%)</label>
                  <input
                    type="range"
                    min="40"
                    max="150"
                    value={Math.round((activeDevice.scale || 1) * 100)}
                    onChange={(e) => updateActiveDevice({ scale: parseInt(e.target.value) / 100 })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">水平偏移 ({activeDevice.offsetX || 0}px)</label>
                  <input
                    type="range"
                    min="-500"
                    max="500"
                    value={activeDevice.offsetX || 0}
                    onChange={(e) => updateActiveDevice({ offsetX: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">垂直偏移 ({activeDevice.offsetY || 0}px)</label>
                  <input
                    type="range"
                    min="-200"
                    max="600"
                    value={activeDevice.offsetY || 0}
                    onChange={(e) => updateActiveDevice({ offsetY: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">截图缩放 ({Math.round((activeDevice.screenshotScale || 1.0) * 100)}%)</label>
                  <input
                    type="range"
                    min="80"
                    max="150"
                    value={Math.round((activeDevice.screenshotScale || 1.0) * 100)}
                    onChange={(e) => updateActiveDevice({ screenshotScale: parseInt(e.target.value) / 100 })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                <div className="ds-input-group">
                  <label className="ds-label">截图垂直偏移 ({activeDevice.screenshotOffsetY || 0}px)</label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={activeDevice.screenshotOffsetY || 0}
                    onChange={(e) => updateActiveDevice({ screenshotOffsetY: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
                  />
                </div>

                {devices.length > 1 && (
                  <button
                    className="ds-btn"
                    style={{ width: '100%' }}
                    onClick={() => deleteDevice(activeDeviceIndex)}
                  >
                    删除当前选中的设备
                  </button>
                )}
              </>
            )}
          </div>
          </SectionAccordion>

          {/* 文案与排版 */}
          <SectionAccordion title="文案与排版">
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label">标题字体</label>
              <select
                className="ds-select"
                value={titleFontFamily}
                onChange={(e) => setTitleFontFamily(e.target.value)}
              >
                <option value="Geist">Geist Sans (科技极简)</option>
                <option value="Playfair Display">Playfair Display (雅致衬线)</option>
                <option value="Lora">Lora (清秀衬线)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (古典衬线)</option>
                <option value="Inter">Inter (通用设计)</option>
                <option value="Outfit">Outfit (圆润现代)</option>
              </select>
            </div>

            <div className="ds-input-group">
              <label className="ds-label">副标题字体</label>
              <select
                className="ds-select"
                value={subtitleFontFamily}
                onChange={(e) => setSubtitleFontFamily(e.target.value)}
              >
                <option value="Geist">Geist Sans (科技极简)</option>
                <option value="Inter">Inter (通用设计)</option>
                <option value="Playfair Display">Playfair Display (雅致衬线)</option>
                <option value="Outfit">Outfit (圆润现代)</option>
              </select>
            </div>

            <div className="ds-input-group">
              <label className="ds-label">主标题内容</label>
              <input
                type="text"
                className="ds-input"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                placeholder="请输入主标题"
              />
            </div>

            <div className="ds-input-group">
              <label className="ds-label">主标题字号 ({titleFontSize}px)</label>
              <input
                type="range"
                min="24"
                max="96"
                value={titleFontSize}
                onChange={(e) => setTitleFontSize(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
              />
            </div>

            <div className="ds-input-group">
              <label className="ds-label">副标题内容</label>
              <input
                type="text"
                className="ds-input"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                placeholder="请输入副标题"
              />
            </div>

            <div className="ds-input-group">
              <label className="ds-label">副标题字号 ({subtitleFontSize}px)</label>
              <input
                type="range"
                min="14"
                max="48"
                value={subtitleFontSize}
                onChange={(e) => setSubtitleFontSize(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--ink-primary)' }}
              />
            </div>
          </div>
          </SectionAccordion>
        </>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
          本模块功能正在研发中
        </div>
      )}
    </aside>
  );
};
