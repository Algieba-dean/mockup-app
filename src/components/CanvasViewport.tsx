import React, { useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload, Image } from 'lucide-react';

interface CanvasViewportProps {
  zoom: number;
  setZoom: (z: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onFileDrop: (file: File) => void;
  bgColor?: string;
  bgType?: 'solid' | 'gradient' | 'image' | 'panoramic';
  bgGradient?: string[];
  hasScreenshots?: boolean;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = React.memo(({
  zoom,
  setZoom,
  canvasRef,
  onFileDrop,
  bgColor = '#f5f5f4',
  bgType = 'solid',
  bgGradient = [],
  hasScreenshots = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const emptyStateFileRef = useRef<HTMLInputElement>(null);

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
            <span style={{ fontSize: '12px', color: 'var(--ink-tertiary)' }}>
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
