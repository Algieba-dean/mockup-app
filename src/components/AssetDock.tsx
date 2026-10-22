import React, { useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { getMessages, formatMessage } from '../i18n';

const m = getMessages().leftSidebar;

interface MockupPage {
  id: string;
  title: string;
  bgType?: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgColor?: string;
  bgGradient?: string[];
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
      <div className="sidebar-title asset-dock-header">
        <span>{m.pageSequence}</span>
        <button
          className="ds-btn"
          style={{ padding: '4px 10px', fontSize: '11px' }}
          onClick={onAddPage}
        >
          <Plus size={12} />
          <span>{m.addPage}</span>
        </button>
      </div>

      <div className="asset-dock-scroll">
        {pages.map((page, index) => {
          const cardBg = page.bgType === 'gradient' && page.bgGradient && page.bgGradient.length >= 2
            ? `linear-gradient(180deg, ${page.bgGradient[0]}, ${page.bgGradient[1]})`
            : (page.bgColor || 'var(--bg-tertiary)');
          return (
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
            title={m.dragToReorder}
            style={{
              position: 'relative',
              cursor: onReorderPages ? 'grab' : 'pointer',
              opacity: draggedIndex === index ? 0.4 : 1,
              outline: dragOverIndex === index && draggedIndex !== null && draggedIndex !== index ? '2px solid var(--border-focus)' : 'none',
              outlineOffset: '2px',
              transition: 'opacity 0.15s ease',
            }}
          >
            {/* 卡片主体：呈现该画幅的真实背景色/渐变、标题预览与微缩设备框 */}
            <div
              className="asset-item-card"
              style={{
                borderColor: activePageIndex === index ? 'var(--border-focus)' : 'var(--border-primary)',
                borderWidth: activePageIndex === index ? '2px' : '1px',
                width: '100%',
                aspectRatio: '9 / 16',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 4px 0 4px',
                fontSize: '9px',
                background: cardBg,
                color: 'var(--ink-secondary)',
              }}
            >
              <div style={{
                width: '100%',
                fontSize: '8px',
                fontWeight: 600,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: '#121212',
                backgroundColor: 'rgba(255,255,255,0.72)',
                padding: '1px 3px',
                borderRadius: '2px',
                flexShrink: 0,
              }}>
                {page.title || m.emptyPage}
              </div>
              {page.devices[0]?.screenshotSrc ? (
                <div style={{
                  width: '78%',
                  height: '72%',
                  border: '2px solid #18181b',
                  borderBottom: 'none',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  overflow: 'hidden',
                  backgroundColor: '#000',
                }}>
                  <img src={page.devices[0].screenshotSrc} alt={formatMessage(m.pageBadge, { n: index + 1 })} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{
                  width: '74%',
                  height: '68%',
                  border: '1px dashed rgba(120,120,120,0.45)',
                  borderBottom: 'none',
                  borderTopLeftRadius: '6px',
                  borderTopRightRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontSize: '8px',
                  color: 'var(--ink-secondary)',
                  backgroundColor: 'rgba(0,0,0,0.08)',
                }}>
                  {m.emptyPage}
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
                {formatMessage(m.pageBadge, { n: index + 1 })}
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
                title={m.duplicatePageTitle}
              >
                <Copy size={10} />
              </button>
            )}

            {/* 删除按钮 */}
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
                title={m.deletePageTitle}
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
          );
        })}

        {/* 快速添加占位卡 */}
        <div
          className="asset-item-card asset-item-add"
          onClick={onAddPage}
          style={{ width: '100%', aspectRatio: '9 / 16', cursor: 'pointer' }}
          title={m.addNewPageTitle}
        >
          <Plus size={20} strokeWidth={1} style={{ color: 'var(--ink-tertiary)' }} />
        </div>
      </div>

    </div>
  );
});
