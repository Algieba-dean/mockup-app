import React, { useRef, useState } from 'react';
import { Plus, Image as ImageIcon, Trash2, Bookmark } from 'lucide-react';

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
  onSelectScreenshot: (index: number) => void;
  selectedScreenshotIndex: number;
  customPresets: CustomPreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  onApplyPreset: (preset: CustomPreset) => void;
  collapsed?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  screenshots,
  onUploadScreenshot,
  onSelectScreenshot,
  selectedScreenshotIndex,
  customPresets,
  onSavePreset,
  onDeletePreset,
  onApplyPreset,
  collapsed = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadScreenshot(e.target.files[0]);
    }
  };

  const [confirmDeletePresetId, setConfirmDeletePresetId] = useState<string | null>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerSavePreset = () => {
    const name = prompt('请输入自定义设计预设名称：', `自定义风格预设 ${customPresets.length + 1}`);
    if (name && name.trim()) {
      onSavePreset(name.trim());
    }
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
          onKeyDown={(e) => { if (e.key === 'Escape') setConfirmDeletePresetId(null); }}
        >
          <div className="ds-panel" style={{
            width: '300px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>
              确认删除预设「{customPresets.find(p => p.id === confirmDeletePresetId)?.name}」吗？
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="ds-btn" style={{ flex: 1 }} onClick={() => setConfirmDeletePresetId(null)}>取消</button>
              <button className="ds-btn ds-btn-active" style={{ flex: 1 }} onClick={() => { onDeletePreset(confirmDeletePresetId); setConfirmDeletePresetId(null); }}>确定删除</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
