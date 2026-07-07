import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface MockupPage {
  id: string;
  title: string;
  devices: { screenshotSrc?: string }[];
}

interface AssetDockProps {
  pages: MockupPage[];
  activePageIndex: number;
  setActivePageIndex: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (index: number) => void;
}

export const AssetDock: React.FC<AssetDockProps> = ({
  pages,
  activePageIndex,
  setActivePageIndex,
  onAddPage,
  onDeletePage,
}) => {
  return (
    <div className="asset-dock">
      <div className="asset-dock-header">
        <span>故事画幅序列 (Mockup Pages)</span>
        <button
          className="ds-btn"
          style={{ padding: '2px 8px', fontSize: '11px', height: '24px' }}
          onClick={onAddPage}
        >
          <Plus size={12} />
          <span>添加画幅</span>
        </button>
      </div>

      <div className="asset-dock-scroll">
        {pages.map((page, index) => (
          <div
            key={page.id}
            onClick={() => setActivePageIndex(index)}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              cursor: 'pointer',
            }}
          >
            {/* 卡片主体 */}
            <div
              className="asset-item-card"
              style={{
                borderColor: activePageIndex === index ? 'var(--border-focus)' : 'var(--border-primary)',
                width: '76px',
                height: '76px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: page.devices[0]?.screenshotSrc ? 'center' : 'flex-end',
                alignItems: 'center',
                padding: '4px',
                fontSize: '9px',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--ink-secondary)',
              }}
            >
              {page.devices[0]?.screenshotSrc ? (
                <img src={page.devices[0].screenshotSrc} alt={`Page ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', margin: 'auto 0' }}>
                  空白画幅
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                left: '4px',
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: '#fff',
                padding: '1px 4px',
                borderRadius: '2px',
                fontSize: '8px'
              }}>
                P{index + 1}
              </div>
            </div>

            {/* 删除按钮 */}
            {pages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`确定要删除画幅 P${index + 1} 吗？此操作无法恢复。`)) {
                    onDeletePage(index);
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--ink-primary)',
                  color: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 2,
                }}
                title="删除此页"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}

        {/* 快速添加占位卡 */}
        <div
          className="asset-item-card asset-item-add"
          onClick={onAddPage}
          style={{ width: '76px', height: '76px', cursor: 'pointer' }}
          title="新增一页"
        >
          <Plus size={20} strokeWidth={1} style={{ color: 'var(--ink-tertiary)' }} />
        </div>
      </div>
    </div>
  );
};
