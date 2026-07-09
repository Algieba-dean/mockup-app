import React, { useState } from 'react';
import { X, Trash2, Edit2, Check, RefreshCw } from 'lucide-react';
import { FocusTrap } from './FocusTrap';

export interface IconHistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  thumbnail: string;
  snapshot: {
    sourceDataUrl: string | null;
    originalWidth: number | null;
    originalHeight: number | null;
    padding: number;
    paddingY?: number;
    bgColor: string;
    hasAlpha: boolean;
    foregroundScale: number;
    offsetX: number;
    offsetY: number;
    contentScale: number;
    bgMode: 'solid' | 'gradient';
    bgGradient: [string, string];

    // Dual-platform overrides
    paddingIos?: number;
    paddingYIos?: number;
    offsetXIos?: number;
    offsetYIos?: number;
    contentScaleIos?: number;
    paddingAndroid?: number;
    paddingYAndroid?: number;
    offsetXAndroid?: number;
    offsetYAndroid?: number;
    contentScaleAndroid?: number;
  };
}

interface IconHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: IconHistoryEntry[];
  onRestore: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  currentState: {
    sourceDataUrl: string | null;
    padding: number;
    bgColor: string;
    offsetX: number;
    offsetY: number;
    contentScale: number;
    bgMode: 'solid' | 'gradient';
    bgGradient: [string, string];

    // Dual-platform
    paddingIos: number;
    paddingYIos: number;
    offsetXIos: number;
    offsetYIos: number;
    contentScaleIos: number;
    paddingAndroid: number;
    paddingYAndroid: number;
    offsetXAndroid: number;
    offsetYAndroid: number;
    contentScaleAndroid: number;
  };
}

export const IconHistoryDrawer: React.FC<IconHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onRestore,
  onRename,
  onDelete,
  currentState,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartEdit = (entry: IconHistoryEntry) => {
    setEditingId(entry.id);
    setEditValue(entry.name);
  };

  const handleSaveRename = (id: string) => {
    if (editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  const isCurrentState = (entry: IconHistoryEntry) => {
    const s = entry.snapshot;
    
    // Check basic parameters
    if (
      s.sourceDataUrl !== currentState.sourceDataUrl ||
      s.bgColor !== currentState.bgColor ||
      s.bgMode !== currentState.bgMode ||
      s.bgGradient[0] !== currentState.bgGradient[0] ||
      s.bgGradient[1] !== currentState.bgGradient[1]
    ) {
      return false;
    }

    // Check dual platform values with fallback to legacy values
    const sPaddingIos = s.paddingIos ?? s.padding;
    const sPaddingYIos = s.paddingYIos ?? s.paddingY ?? s.padding;
    const sOffsetXIos = s.offsetXIos ?? s.offsetX;
    const sOffsetYIos = s.offsetYIos ?? s.offsetY;
    const sContentScaleIos = s.contentScaleIos ?? s.contentScale;

    const sPaddingAndroid = s.paddingAndroid ?? s.padding;
    const sPaddingYAndroid = s.paddingYAndroid ?? s.paddingY ?? s.padding;
    const sOffsetXAndroid = s.offsetXAndroid ?? s.offsetX;
    const sOffsetYAndroid = s.offsetYAndroid ?? s.offsetY;
    const sContentScaleAndroid = s.contentScaleAndroid ?? s.contentScale;

    return (
      sPaddingIos === currentState.paddingIos &&
      sPaddingYIos === currentState.paddingYIos &&
      sOffsetXIos === currentState.offsetXIos &&
      sOffsetYIos === currentState.offsetYIos &&
      sContentScaleIos === currentState.contentScaleIos &&
      sPaddingAndroid === currentState.paddingAndroid &&
      sPaddingYAndroid === currentState.paddingYAndroid &&
      sOffsetXAndroid === currentState.offsetXAndroid &&
      sOffsetYAndroid === currentState.offsetYAndroid &&
      sContentScaleAndroid === currentState.contentScaleAndroid
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="图标历史记录"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        justifyContent: 'flex-end',
        backgroundColor: 'var(--overlay-bg)',
      }}
      onClick={onClose}
    >
      <FocusTrap onEscape={onClose}>
        <div
          style={{
            width: '360px',
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-primary)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                margin: 0,
                color: 'var(--ink-primary)',
              }}
            >
              历史方案
            </h2>
            <button
              className="ds-btn ds-btn-icon-only"
              style={{ border: 'none', background: 'none' }}
              onClick={onClose}
              title="关闭抽屉"
              aria-label="关闭抽屉"
            >
              <X size={16} />
            </button>
          </div>

          {/* List Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {history.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  textAlign: 'center',
                  color: 'var(--ink-secondary)',
                  padding: '40px 20px',
                }}
              >
                <RefreshCw size={24} strokeWidth={1} style={{ opacity: 0.5 }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-primary)' }}>
                  暂无历史记录
                </span>
                <p style={{ fontSize: '12px', lineHeight: 1.5, margin: 0, maxWidth: '240px' }}>
                  调整参数后点击“保存到历史”按钮即可创建第一份方案副本，方便后续对比与恢复。
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((entry) => {
                  const active = isCurrentState(entry);
                  return (
                    <div
                      key={entry.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid',
                        borderColor: active ? 'var(--border-focus)' : 'var(--border-primary)',
                        backgroundColor: 'var(--bg-primary)',
                        padding: '12px',
                        position: 'relative',
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      {active && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            backgroundColor: 'var(--ink-primary)',
                            color: 'var(--bg-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          当前
                        </span>
                      )}

                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* Thumbnail */}
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            border: '1px solid var(--border-primary)',
                            backgroundColor: 'var(--bg-tertiary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={entry.thumbnail}
                            alt="预览"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          />
                        </div>

                        {/* Title and date */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {editingId === entry.id ? (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="text"
                                className="ds-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(entry.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                autoFocus
                                style={{
                                  fontSize: '13px',
                                  height: '26px',
                                  padding: '0 6px',
                                  width: '100%',
                                }}
                              />
                              <button
                                className="ds-btn"
                                onClick={() => handleSaveRename(entry.id)}
                                style={{ width: '26px', height: '26px', padding: 0 }}
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  color: 'var(--ink-primary)',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                }}
                              >
                                {entry.name}
                              </span>
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: 0,
                                  color: 'var(--ink-secondary)',
                                }}
                                onClick={() => handleStartEdit(entry)}
                                title="重命名"
                              >
                                <Edit2 size={11} />
                              </button>
                            </div>
                          )}
                          <span style={{ fontSize: '10px', color: 'var(--ink-secondary)' }}>
                            {entry.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '12px',
                          borderTop: '1px solid var(--border-primary)',
                          paddingTop: '8px',
                        }}
                      >
                        <button
                          className="ds-btn"
                          style={{ flex: 1, fontSize: '11px', height: '26px', padding: 0 }}
                          onClick={() => onRestore(entry.id)}
                          disabled={active}
                        >
                          恢复此方案
                        </button>
                        <button
                          className="ds-btn ds-btn-icon-only"
                          style={{
                            width: '26px',
                            height: '26px',
                            padding: 0,
                            borderColor: 'var(--border-primary)',
                            color: 'var(--ink-secondary)',
                          }}
                          onClick={() => setConfirmDeleteId(entry.id)}
                          title="删除此方案"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </FocusTrap>

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'var(--overlay-bg-heavy)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 'calc(var(--z-modal) + 10)',
          }}
          onClick={() => setConfirmDeleteId(null)}
        >
          <FocusTrap onEscape={() => setConfirmDeleteId(null)}>
            <div
              className="ds-panel"
              style={{
                width: '320px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: 'var(--shadow-lg)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <span style={{ fontSize: '13px', color: 'var(--ink-primary)', lineHeight: 1.5 }}>
                确认永久删除此历史方案「
                <strong>
                  {history.find((h) => h.id === confirmDeleteId)?.name}
                </strong>
                」吗？
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="ds-btn"
                  style={{ flex: 1, fontSize: '12px', height: '32px' }}
                  onClick={() => setConfirmDeleteId(null)}
                >
                  取消
                </button>
                <button
                  className="ds-btn ds-btn-active"
                  style={{ flex: 1, fontSize: '12px', height: '32px' }}
                  onClick={() => {
                    onDelete(confirmDeleteId);
                    setConfirmDeleteId(null);
                  }}
                >
                  确认删除
                </button>
              </div>
            </div>
          </FocusTrap>
        </div>
      )}
    </div>
  );
};
