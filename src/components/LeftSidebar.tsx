import React, { useRef, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Bookmark, RefreshCw } from 'lucide-react';
import { FocusTrap } from './FocusTrap';

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: string;
  state: {
    bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
    bgColor: string;
    bgGradient: string[];
    bgImageSrc: string;
    bgBlur: number;
    showFrostedGlass: boolean;
    titleText: string;
    subtitleText: string;
    titleFontSize: number;
    subtitleFontSize: number;
    titleFontFamily: string;
    subtitleFontFamily: string;
    devices: any[];
  }
}

interface LeftSidebarProps {
  activeTool: string;
  screenshots: string[];
  onUploadScreenshot: (file: File) => void;
  onUploadScreenshots?: (files: File[]) => void;
  onSelectScreenshot: (index: number) => void;
  selectedScreenshotIndex: number;
  customPresets: CustomPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (preset: CustomPreset) => void;
  collapsed?: boolean;

  // Icon workspace
  hasIconImage?: boolean;
  iconSizePreviews?: Array<{ size: number; dataUrl: string }>;
  onUploadIcon?: (file: File) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  screenshots,
  onUploadScreenshot,
  onUploadScreenshots,
  onSelectScreenshot,
  selectedScreenshotIndex,
  customPresets,
  onSavePreset,
  onDeletePreset,
  onApplyPreset,
  collapsed = false,
  hasIconImage = false,
  iconSizePreviews = [],
  onUploadIcon,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (onUploadScreenshots) onUploadScreenshots(files);
    else onUploadScreenshot(files[0]);
  };

  const [confirmDeletePresetId, setConfirmDeletePresetId] = useState<string | null>(null);
  const [showPresetNameInput, setShowPresetNameInput] = useState(false);
  const [presetNameValue, setPresetNameValue] = useState('');

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerSavePreset = () => {
    setPresetNameValue(`自定义风格预设 ${customPresets.length + 1}`);
    setShowPresetNameInput(true);
  };

  const confirmSavePreset = () => {
    if (presetNameValue.trim()) {
      onSavePreset(presetNameValue.trim());
    }
    setShowPresetNameInput(false);
    setPresetNameValue('');
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {activeTool === 'screenshots' ? (
        <>
          {/* 素材上传 */}
          <div className="sidebar-title">截图素材</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="ds-btn"
              onClick={triggerFileInput}
              style={{ width: '100%', borderStyle: 'dashed', height: '40px' }}
            >
              <Plus size={16} />
              <span>导入应用截图</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />

            {screenshots.length === 0 ? (
              <div style={{
                border: '1px dashed var(--border-primary)',
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--ink-secondary)',
                fontSize: '12px',
              }}>
                <ImageIcon size={24} style={{ margin: '0 auto 8px', strokeWidth: 1 }} />
                暂未导入截图素材
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                marginTop: '8px'
              }}>
                {screenshots.map((src, index) => (
                  <div
                    key={index}
                    onClick={() => onSelectScreenshot(index)}
                    style={{
                      aspectRatio: '9/16',
                      border: '1px solid',
                      borderColor: selectedScreenshotIndex === index ? 'var(--border-focus)' : 'var(--border-primary)',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: 'var(--bg-tertiary)',
                    }}
                  >
                    <img src={src} alt={`Screenshot ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 自定义风格预设 */}
          <div className="sidebar-title">自定义设计预设</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="ds-btn"
              onClick={triggerSavePreset}
              style={{ width: '100%', height: '40px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <Bookmark size={14} style={{ marginRight: '6px' }} />
              <span>保存当前风格为预设</span>
            </button>

            {customPresets.length === 0 ? (
              <div style={{
                border: '1px dashed var(--border-primary)',
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--ink-secondary)',
                fontSize: '12px',
              }}>
                暂无自定义设计预设
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {customPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="custom-preset-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      border: '1px solid var(--border-primary)',
                      backgroundColor: 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      borderRadius: '4px',
                    }}
                    onClick={() => onApplyPreset(preset)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preset.name}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>
                        {preset.createdAt}
                      </span>
                    </div>
                    <button
                      className="ds-btn ds-btn-icon-only"
                      style={{
                        width: '26px',
                        height: '26px',
                        padding: 0,
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                        color: 'var(--ink-secondary)',
                        transition: 'color 0.15s ease',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeletePresetId(preset.id);
                      }}
                      title="删除预设"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : activeTool === 'icons' ? (
        <>
          {/* 图标原图上传 */}
          <div className="sidebar-title">图标原图</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="file"
              ref={iconFileInputRef}
              onChange={(e) => { if (e.target.files?.[0]) onUploadIcon?.(e.target.files[0]); }}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              className="ds-btn"
              onClick={() => iconFileInputRef.current?.click()}
              style={{ width: '100%', borderStyle: hasIconImage ? 'solid' : 'dashed', height: '40px' }}
            >
              {hasIconImage ? <RefreshCw size={14} /> : <Plus size={16} />}
              <span>{hasIconImage ? '替换图标原图' : '导入图标原图'}</span>
            </button>

            {!hasIconImage && (
              <div style={{
                border: '1px dashed var(--border-primary)',
                padding: '30px 20px',
                textAlign: 'center',
                color: 'var(--ink-secondary)',
                fontSize: '12px',
              }}>
                <ImageIcon size={24} style={{ margin: '0 auto 8px', strokeWidth: 1 }} />
                暂未导入图标原图
              </div>
            )}
          </div>

          {/* 尺寸预览网格：每个尺寸均按其平台的实际内边距/偏移/缩放独立渲染，
              方框大小也按真实像素尺寸成比例缩放，以直观呈现尺寸差异 */}
          {hasIconImage && iconSizePreviews.length > 0 && (
            <>
              <div className="sidebar-title">导出尺寸预览</div>
              <div className="sidebar-content">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                }}>
                  {iconSizePreviews.map(({ size, dataUrl }) => {
                    const maxSize = Math.max(...iconSizePreviews.map((p) => p.size));
                    const boxPercent = 35 + (size / maxSize) * 65;
                    return (
                      <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                          width: '100%',
                          aspectRatio: '1',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <div style={{
                            width: `${boxPercent}%`,
                            aspectRatio: '1',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}>
                            <img
                              src={dataUrl}
                              alt={`${size}×${size} 预览`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>{size}px</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
          功能开发中...
        </div>
      )}
      {/* Custom preset delete confirmation */}
      {confirmDeletePresetId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
          }}
          onClick={() => setConfirmDeletePresetId(null)}
        >
          <FocusTrap onEscape={() => setConfirmDeletePresetId(null)}>
          <div className="ds-panel" style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <span style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>
              确认删除预设「{customPresets.find(p => p.id === confirmDeletePresetId)?.name}」吗？
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ds-btn" style={{ flex: 1 }} onClick={() => setConfirmDeletePresetId(null)}>取消</button>
              <button className="ds-btn ds-btn-active" style={{ flex: 1 }} onClick={() => { onDeletePreset(confirmDeletePresetId); setConfirmDeletePresetId(null); }}>确定删除</button>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}
      {/* Custom preset name input (replaces prompt()) */}
      {showPresetNameInput && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'var(--z-modal)',
          }}
          onClick={() => { setShowPresetNameInput(false); setPresetNameValue(''); }}
        >
          <FocusTrap onEscape={() => { setShowPresetNameInput(false); setPresetNameValue(''); }}>
          <div className="ds-panel" style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: 'var(--shadow-lg)',
          }} onClick={(e) => e.stopPropagation()}>
            <label className="ds-label" htmlFor="preset-name-input">预设名称</label>
            <input
              id="preset-name-input"
              type="text"
              className="ds-input"
              value={presetNameValue}
              onChange={(e) => setPresetNameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSavePreset(); }}
              placeholder="请输入预设名称"
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ds-btn" style={{ flex: 1 }} onClick={() => { setShowPresetNameInput(false); setPresetNameValue(''); }}>取消</button>
              <button className="ds-btn ds-btn-active" style={{ flex: 1 }} onClick={confirmSavePreset}>保存预设</button>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}
    </aside>
  );
};
