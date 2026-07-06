import React, { useRef } from 'react';
import marbleBg from '../assets/white_marble_bg.jpg';
import grainBg from '../assets/minimal_grain_bg.jpg';

interface RightPropertiesPanelProps {
  activeTool: string;
  // Canvas Background
  bgType: 'solid' | 'gradient' | 'image';
  setBgType: (type: 'solid' | 'gradient' | 'image') => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  setBgGradient: (grad: string[]) => void;
  bgImageSrc?: string;
  setBgImageSrc: (src: string) => void;
  bgBlur: number;
  setBgBlur: (blur: number) => void;
  showFrostedGlass: boolean;
  setShowFrostedGlass: (show: boolean) => void;

  // Device Model
  deviceModel: string;
  setDeviceModel: (model: string) => void;

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
  deviceModel,
  setDeviceModel,
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

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {activeTool === 'screenshots' ? (
        <>
          {/* 画布背景 */}
          <div className="sidebar-title">画布背景</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 背景类型切换选项卡 */}
            <div className="ds-input-group">
              <label className="ds-label">填充方式</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                <button
                  className={`ds-btn ${bgType === 'solid' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 0' }}
                  onClick={() => setBgType('solid')}
                >
                  纯色
                </button>
                <button
                  className={`ds-btn ${bgType === 'gradient' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 0' }}
                  onClick={() => setBgType('gradient')}
                >
                  渐变
                </button>
                <button
                  className={`ds-btn ${bgType === 'image' ? 'ds-btn-active' : ''}`}
                  style={{ fontSize: '11px', padding: '6px 0' }}
                  onClick={() => {
                    setBgType('image');
                    if (!bgImageSrc) {
                      setBgImageSrc(marbleBg);
                    }
                  }}
                >
                  纹理图
                </button>
              </div>
            </div>

            {/* A. 纯色背景配置 */}
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
                    title="选取自定义背景颜色"
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

            {/* B. 渐变背景配置 */}
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
                      setBgColor(grad.colors[0]); // 联动明暗对比计算
                    }}
                  >
                    <span style={{ textShadow: '0 1px 2px rgba(255,255,255,0.2)' }}>{grad.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* C. 纹理图片背景配置 */}
            {bgType === 'image' && (
              <div className="ds-input-group" style={{ gap: '10px' }}>
                <label className="ds-label">纹理图选择</label>
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

                <div style={{ marginTop: '4px' }}>
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
                    上传自定义背景图
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 渲染特效设置 */}
          <div className="sidebar-title">视觉特效</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 1. 背景模糊滤镜 */}
            {bgType === 'image' && (
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

            {/* 2. 毛玻璃背板 */}
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

          {/* 设备设置 */}
          <div className="sidebar-title">外壳型号</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="ds-input-group">
              <label className="ds-label">机型选择</label>
              <select
                className="ds-select"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
              >
                <option value="iphone_16_pro">iPhone 16 Pro (深色边框)</option>
                <option value="iphone_16_pro_light">iPhone 16 Pro (银白边框)</option>
                <option value="ipad_pro">iPad Pro (平板大壳)</option>
                <option value="google_pixel">Google Pixel (安卓极简)</option>
              </select>
            </div>
          </div>

          {/* 文案与排版 */}
          <div className="sidebar-title">文案与排版</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 字体选择 */}
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

            {/* 文字内容 */}
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
        </>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
          本模块功能正在研发中
        </div>
      )}
    </aside>
  );
};
