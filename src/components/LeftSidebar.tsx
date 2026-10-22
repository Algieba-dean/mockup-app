import React, { useRef, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Bookmark, RefreshCw } from 'lucide-react';
import { FocusTrap } from './FocusTrap';
import { AssetDock } from './AssetDock';
import { getMessages, formatMessage } from '../i18n';

const m = getMessages().leftSidebar;
const appMsg = getMessages().app;

interface MockupPage {
  id: string;
  title: string;
  bgType?: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor?: string;
  bgGradient?: string[];
  devices: { screenshotSrc?: string }[];
}

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: string;
  state: {
    bgType: 'solid' | 'gradient' | 'image' | 'panoramic';
    bgColor: string;
    bgGradient: string[];
    bgImageSrc: string;
    bgImageScale?: number;
    bgBlur: number;
    showFrostedGlass: boolean;
    titleText: string;
    subtitleText: string;
    titleFontSize: number;
    subtitleFontSize: number;
    titleFontFamily: string;
    subtitleFontFamily: string;
    textAlign?: 'left' | 'center' | 'right';
    customTextColor?: string;
    textOnTop?: boolean;
    layout?: 'text-top' | 'text-bottom' | 'full-device';
    showGlassReflection?: boolean;
    showStatusBar?: boolean;
    shadowPreset?: 'none' | 'soft' | 'premium';
    titleOffsetX?: number;
    titleOffsetY?: number;
    titleAngle?: number;
    subtitleOffsetX?: number;
    subtitleOffsetY?: number;
    subtitleAngle?: number;
    devices: any[];
  }
}

interface LeftSidebarProps {
  activeTool: string;
  screenshots: string[];
  onUploadScreenshot: (file: File) => void;
  onUploadScreenshots?: (files: File[]) => void;
  onSelectScreenshot: (index: number) => void;
  onDeleteScreenshot?: (index: number) => void;
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

  // 画幅序列 (原底部 Dock，现迁移至左侧栏首个板块，为画布腾出完整高度)
  pages: MockupPage[];
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage?: (index: number) => void;
  onReorderPages?: (fromIndex: number, toIndex: number) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  screenshots,
  onUploadScreenshot,
  onUploadScreenshots,
  onSelectScreenshot,
  onDeleteScreenshot,
  selectedScreenshotIndex,
  customPresets,
  onSavePreset,
  onDeletePreset,
  onApplyPreset,
  collapsed = false,
  hasIconImage = false,
  iconSizePreviews = [],
  onUploadIcon,
  pages,
  activePageIndex,
  setActivePageIndex,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
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
    setPresetNameValue(formatMessage(appMsg.defaults.presetDefaultName, { n: customPresets.length + 1 }));
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
          {/* 画幅序列：先选定要编辑的画幅，再决定素材与风格 */}
          <AssetDock
            pages={pages}
            activePageIndex={activePageIndex}
            setActivePageIndex={setActivePageIndex}
            onAddPage={onAddPage}
            onDeletePage={onDeletePage}
            onDuplicatePage={onDuplicatePage}
            onReorderPages={onReorderPages}
          />

          {/* 素材上传 */}
          <div className="sidebar-title">{m.screenshotAssets}</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="ds-btn"
              onClick={triggerFileInput}
              style={{ width: '100%', borderStyle: 'dashed', height: '40px' }}
            >
              <Plus size={16} />
              <span>{m.importScreenshots}</span>
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
                {m.noScreenshots}
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
                    title={m.clickToBindDevice}
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
                    <img src={src} alt={`${m.screenshotAssets} ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {onDeleteScreenshot && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScreenshot(index);
                        }}
                        title={m.removeScreenshotTitle}
                        aria-label={`${m.removeScreenshotTitle} ${index + 1}`}
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          width: '20px',
                          height: '20px',
                          padding: 0,
                          border: '1px solid var(--border-primary)',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--ink-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 自定义风格预设 */}
          <div className="sidebar-title">{m.customPresets}</div>
          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="ds-btn"
              onClick={triggerSavePreset}
              style={{ width: '100%', height: '40px', backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-primary)' }}
            >
              <Bookmark size={14} style={{ marginRight: '6px' }} />
              <span>{m.saveCurrentAsPreset}</span>
            </button>

            {customPresets.length === 0 ? (
              <div style={{
                border: '1px dashed var(--border-primary)',
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--ink-secondary)',
                fontSize: '12px',
              }}>
                {m.noCustomPresets}
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
                      title={m.deletePresetTitle}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* 图标原图上传 */}
          <div className="sidebar-title">{m.iconSource}</div>
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
              <span>{hasIconImage ? m.replaceIconSource : m.importIconSource}</span>
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
                {m.noIconSource}
              </div>
            )}
          </div>

          {hasIconImage && iconSizePreviews.length > 0 && (
            <>
              <div className="sidebar-title">{m.exportSizePreview}</div>
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
              {formatMessage(m.confirmDeletePreset, { name: customPresets.find(p => p.id === confirmDeletePresetId)?.name || '' })}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ds-btn" style={{ flex: 1 }} onClick={() => setConfirmDeletePresetId(null)}>{appMsg.modals.cancel}</button>
              <button className="ds-btn ds-btn-active" style={{ flex: 1 }} onClick={() => { onDeletePreset(confirmDeletePresetId); setConfirmDeletePresetId(null); }}>{appMsg.modals.confirmDelete}</button>
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
            <label className="ds-label" htmlFor="preset-name-input">{m.presetNameLabel}</label>
            <input
              id="preset-name-input"
              type="text"
              className="ds-input"
              value={presetNameValue}
              onChange={(e) => setPresetNameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSavePreset(); }}
              placeholder={m.presetNamePlaceholder}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ds-btn" style={{ flex: 1 }} onClick={() => { setShowPresetNameInput(false); setPresetNameValue(''); }}>{appMsg.modals.cancel}</button>
              <button className="ds-btn ds-btn-active" style={{ flex: 1 }} onClick={confirmSavePreset}>{m.savePreset}</button>
            </div>
          </div>
          </FocusTrap>
        </div>
      )}
    </aside>
  );
};
