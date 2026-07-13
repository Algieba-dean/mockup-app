import React, { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

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
  onDuplicatePage?: (index: number) => void;
  onReorderPages?: (fromIndex: number, toIndex: number) => void;
}

export const AssetDock: React.FC<AssetDockProps> = React.memo(({
  pages,
  activePageIndex,
  setActivePageIndex,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  return (
    <div className="asset-dock">
      <div className="asset-dock-header">
        <span>画幅序列</span>
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
            draggable={!!onReorderPages}
            onDragStart={(e) => {
              setDraggedIndex(index);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              if (draggedIndex === null) return;
              e.preventDefault();
              if (dragOverIndex !== index) setDragOverIndex(index);
            }}
            onDragLeave={() => {
              if (dragOverIndex === index) setDragOverIndex(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedIndex !== null && draggedIndex !== index) {
                onReorderPages?.(draggedIndex, index);
              }
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            title="拖拽以调整画幅顺序"
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              cursor: onReorderPages ? 'grab' : 'pointer',
              opacity: draggedIndex === index ? 0.4 : 1,
              outline: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? '2px solid var(--border-focus)' : 'none',
              outlineOffset: '2px',
              transition: 'opacity 0.15s ease',
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

            {/* 复制按钮 */}
            {onDuplicatePage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicatePage(index);
                }}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--ink-primary)',
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
                title="复制此页 (Ctrl+D)"
              >
                <Copy size={10} />
              </button>
            )}

            {/* 删除按钮：删除画幅可通过全局 Ctrl+Z 或 toast 上的“撤销”恢复，
                因此不再用二次确认弹窗拦截。 */}
            {pages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePage(index);
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

    </div>
  );
});
