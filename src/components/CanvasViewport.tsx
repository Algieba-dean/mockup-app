import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload, Image, AlertTriangle } from 'lucide-react';

export interface IconSizeWarning {
  width: number;
  height: number;
}

interface CanvasViewportProps {
  activeTool?: string;
  zoom: number;
  setZoom: (z: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onFileDrop: (file: File) => void;
  bgColor?: string;
  bgType?: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgGradient?: string[];
  hasScreenshots?: boolean;

  // Icon workspace mode
  iconCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
  hasIconImage?: boolean;
  onIconFileDrop?: (file: File) => void;
  iconPlatformPreview?: 'ios' | 'android';
  setIconPlatformPreview?: (p: 'ios' | 'android') => void;
  iconWarning?: IconSizeWarning | null;
  iconPadding?: number;
  setIconPadding?: (p: number) => void;
}

const ICON_PADDING_MIN = 0;
const ICON_PADDING_MAX = 0.4;
const ICON_DISPLAY_SIZE = 300;

export const CanvasViewport: React.FC<CanvasViewportProps> = React.memo(({
  activeTool = 'screenshots',
  zoom,
  setZoom,
  canvasRef,
  onFileDrop,
  bgColor = '#f5f5f4',
  bgType = 'solid',
  bgGradient = [],
  hasScreenshots = false,
  iconCanvasRef,
  hasIconImage = false,
  onIconFileDrop,
  iconPlatformPreview = 'ios',
  setIconPlatformPreview,
  iconWarning = null,
  iconPadding = 0.12,
  setIconPadding,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const emptyStateFileRef = useRef<HTMLInputElement>(null);
  const iconFileRef = useRef<HTMLInputElement>(null);

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 10));
  const handleZoomReset = () => setZoom(100);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileDrop(file);
      }
    }
  };

  if (activeTool === 'icons') {
    const handleIconDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onIconFileDrop?.(file);
      }
    };

    // Zooming in shrinks padding (image fills more of the fixed frame);
    // zooming out grows padding (image shrinks, more background shows).
    const clampPadding = (p: number) => Math.min(ICON_PADDING_MAX, Math.max(ICON_PADDING_MIN, p));
    const handleIconZoomIn = () => setIconPadding?.(clampPadding(iconPadding - 0.02));
    const handleIconZoomOut = () => setIconPadding?.(clampPadding(iconPadding + 0.02));
    const handleIconZoomReset = () => setIconPadding?.(0.12);
    const zoomPercent = Math.round((1 - iconPadding / ICON_PADDING_MAX) * 100);

    return (
      <div
        className="viewport-canvas-wrapper"
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: isDragging ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
          transition: 'background-color 0.3s ease',
          overflow: 'hidden',
          height: '100%',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleIconDrop}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          padding: hasIconImage ? '40px 40px 100px 40px' : '40px',
        }}>
        {hasIconImage ? (
          <>
            {/* 平台切换分段控件 */}
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} role="tablist" aria-label="平台预览切换">
              <button
                role="tab"
                aria-selected={iconPlatformPreview === 'ios'}
                className={`ds-btn platform-tab-btn ${iconPlatformPreview === 'ios' ? 'ds-btn-active' : ''}`}
                style={{ padding: '6px 20px', fontSize: '12px' }}
                onClick={() => setIconPlatformPreview?.('ios')}
              >
                iOS
              </button>
              <button
                role="tab"
                aria-selected={iconPlatformPreview === 'android'}
                className={`ds-btn platform-tab-btn ${iconPlatformPreview === 'android' ? 'ds-btn-active' : ''}`}
                style={{ padding: '6px 20px', fontSize: '12px' }}
                onClick={() => setIconPlatformPreview?.('android')}
              >
                Android
              </button>
            </div>

            {/* 尺寸/比例警告条 */}
            {iconWarning && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 16px',
                border: '1px solid var(--border-primary)',
                backgroundColor: 'var(--bg-secondary)',
                fontSize: '12px',
                color: 'var(--ink-secondary)',
                width: 'min(420px, 100%)',
                flexShrink: 0,
              }}>
                <AlertTriangle size={16} strokeWidth={1.5} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--ink-primary)' }} />
                <span style={{ flex: 1 }}>
                  建议原图 ≥1024×1024 正方形，当前 {iconWarning.width}×{iconWarning.height}（已自动居中裁剪为正方形预览）。
                </span>
                <input
                  ref={iconFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files?.[0]) onIconFileDrop?.(e.target.files[0]); }}
                />
                <button
                  className="ds-btn"
                  style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
                  onClick={() => iconFileRef.current?.click()}
                >
                  重新上传
                </button>
              </div>
            )}

            {/* 图标画布 + 遮罩预览层：外框固定不变，滑块调整图像内容大小（页边距） */}
            <div
              style={{
                width: `${ICON_DISPLAY_SIZE}px`,
                height: `${ICON_DISPLAY_SIZE}px`,
                position: 'relative',
                flexShrink: 0,
                boxShadow: '0 8px 32px var(--shadow-color)',
              }}
            >
              <canvas ref={iconCanvasRef} width={512} height={512} style={{ width: '100%', height: '100%', display: 'block' }} />
              {iconPlatformPreview === 'ios' ? (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '22%',
                    border: '2px dashed var(--border-focus)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '66%',
                    height: '66%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    border: '2px dashed var(--border-focus)',
                    boxSizing: 'border-box',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--ink-secondary)', flexShrink: 0 }}>
              {iconPlatformPreview === 'ios' ? '虚线为系统圆角遮罩参考区域，不影响导出像素' : '虚线圆圈为自适应图标安全区，内容应避免超出此区域'}
            </span>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '40px 48px',
            border: '1px dashed var(--border-secondary)',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }} aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                  width: i % 4 === 0 ? '32px' : '22px',
                  height: i % 4 === 0 ? '32px' : '22px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: i % 2 === 0 ? '22%' : '50%',
                  alignSelf: 'center',
                  opacity: 0.5,
                }} />
              ))}
            </div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-primary)' }}>
              拖拽或点击上传应用图标原图
            </span>
            <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
              建议 ≥1024×1024 正方形 PNG，将自动生成 iOS / Android 全尺寸图标
            </span>
            <input
              ref={iconFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => { if (e.target.files?.[0]) onIconFileDrop?.(e.target.files[0]); }}
            />
            <button
              className="ds-btn"
              style={{ marginTop: '4px', fontSize: '12px' }}
              onClick={() => iconFileRef.current?.click()}
            >
              <Upload size={14} />
              <span>选择文件上传</span>
            </button>
          </div>
        )}
        </div>

        {/* 缩放悬浮控制栏：外框不变，调整图像在框内的大小（等同页边距） */}
        {hasIconImage && (
          <div className="viewport-zoom-bar">
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomOut} title="缩小图像" aria-label="缩小图像">
              <ZoomOut size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={zoomPercent}
              onChange={(e) => setIconPadding?.((100 - parseInt(e.target.value)) / 100 * ICON_PADDING_MAX)}
              aria-label="图像缩放滑动条"
              style={{ width: '100px', accentColor: 'var(--ink-primary)' }}
            />
            <span className="viewport-zoom-value">{zoomPercent}%</span>
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomIn} title="放大图像" aria-label="放大图像">
              <ZoomIn size={14} />
            </button>
            <button className="ds-btn ds-btn-icon-only" onClick={handleIconZoomReset} title="重置" aria-label="重置图像缩放">
              <Maximize size={14} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="viewport-canvas-wrapper"
      style={{
        flex: 1,
        position: 'relative',
        backgroundColor: isDragging
          ? 'var(--bg-tertiary)'
          : bgType === 'gradient' && bgGradient.length >= 2
            ? undefined
            : bgColor,
        background: isDragging
          ? undefined
          : bgType === 'gradient' && bgGradient.length >= 2
            ? `linear-gradient(180deg, ${bgGradient[0]}, ${bgGradient[1]})`
            : undefined,
        transition: 'background-color 0.3s ease, background 0.3s ease',
        overflow: 'hidden',
        height: '100%',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 内层独立滚动容器，确保 Canvas 滚动时悬浮栏位置保持静止 */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 40px 100px 40px', // 底部预留 padding 防止缩放栏遮挡 Canvas
      }}>
        {/* Outer container representing the actual scaled layout size in DOM */}
        <div style={{
          width: `${1242 * (zoom / 100)}px`,
          height: `${2208 * (zoom / 100)}px`,
          position: 'relative',
          flexShrink: 0,
        }}>
          {/* Inner container scaled using transform */}
          <div style={{
            width: '1242px',
            height: '2208px',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${zoom / 100})`,
            transformOrigin: 'center center',
            boxShadow: '0 8px 32px var(--shadow-color)',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* 空状态引导 */}
      {!hasScreenshots && !isDragging && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          zIndex: 'var(--z-sticky)',
          pointerEvents: 'none',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            padding: '40px 48px',
            border: '1px dashed var(--border-secondary)',
            backgroundColor: 'var(--bg-secondary)',
            pointerEvents: 'auto',
          }}>
            <Image size={32} strokeWidth={1} style={{ color: 'var(--ink-tertiary)' }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-primary)' }}>
              拖拽应用截图到此处开始
            </span>
            <span style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>
              支持 PNG、JPG 格式
            </span>
            <input
              ref={emptyStateFileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files?.[0]) onFileDrop(e.target.files[0]);
              }}
            />
            <button
              className="ds-btn"
              style={{ marginTop: '4px', fontSize: '12px' }}
              onClick={() => emptyStateFileRef.current?.click()}
            >
              <Upload size={14} />
              <span>选择文件上传</span>
            </button>
          </div>
        </div>
      )}

      {/* 拖拽指示蒙层 */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          inset: '20px',
          border: '2px dashed var(--border-focus)',
          backgroundColor: 'var(--overlay-bg-heavy)',
          color: 'var(--overlay-text)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 'var(--z-overlay)',
          pointerEvents: 'none',
        }}>
          <Upload size={32} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>释放鼠标以导入应用截图</span>
        </div>
      )}

      {/* 缩放悬浮控制栏 - 独立于滚动层，永远固定于可见区域底部 */}
      <div className="viewport-zoom-bar">
        <button className="ds-btn ds-btn-icon-only" onClick={handleZoomOut} title="缩小" aria-label="缩小">
          <ZoomOut size={14} />
        </button>
        <span className="viewport-zoom-value">{zoom}%</span>
        <button className="ds-btn ds-btn-icon-only" onClick={handleZoomIn} title="放大" aria-label="放大">
          <ZoomIn size={14} />
        </button>
        <button className="ds-btn ds-btn-icon-only" onClick={handleZoomReset} title="重置 100%" aria-label="重置缩放比例">
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
});
