import React, { useState } from 'react';
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
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  return (
    <div className="asset-dock">
      <div className="asset-dock-header">
        <span>故事画幅序列 (Mockup Pages)</span>
        <button
          className="ds-btn"
          style={{ padding: '4px 10px', fontSize: '11px' }}
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
                backgroundColor: 'var(--overlay-bg)',
                color: 'var(--overlay-text)',
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
                  setConfirmDeleteIndex(index);
                }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--ink-primary)',
                  color: 'var(--bg-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '50%',
                  width: '22px',
                  height: '22px',
                  padding: 0,
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

      {/* Custom delete confirmation */}
      {confirmDeleteIndex !== null && (
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
          onKeyDown={(e) => { if (e.key === 'Escape') setConfirmDeleteIndex(null); }}
        >
          <div className="ds-panel" style={{
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--ink-primary)' }}>
              确定要删除画幅 P{confirmDeleteIndex + 1} 吗？此操作无法恢复。
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="ds-btn"
                style={{ flex: 1 }}
                onClick={() => setConfirmDeleteIndex(null)}
              >
                取消
              </button>
              <button
                className="ds-btn ds-btn-active"
                style={{ flex: 1 }}
                onClick={() => {
                  onDeletePage(confirmDeleteIndex);
                  setConfirmDeleteIndex(null);
                }}
              >
                确定删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
