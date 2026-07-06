import React, { useRef } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';

interface LeftSidebarProps {
  activeTool: string;
  screenshots: string[];
  onUploadScreenshot: (file: File) => void;
  onSelectScreenshot: (index: number) => void;
  selectedScreenshotIndex: number;
  collapsed?: boolean;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTool,
  screenshots,
  onUploadScreenshot,
  onSelectScreenshot,
  selectedScreenshotIndex,
  collapsed = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUploadScreenshot(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        </>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--ink-secondary)', fontSize: '13px' }}>
          功能开发中...
        </div>
      )}
    </aside>
  );
};
