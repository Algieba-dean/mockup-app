import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, Upload } from 'lucide-react';

interface CanvasViewportProps {
  zoom: number;
  setZoom: (z: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onFileDrop: (file: File) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  zoom,
  setZoom,
  canvasRef,
  onFileDrop,
}) => {
  const [isDragging, setIsDragging] = useState(false);

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
        backgroundColor: isDragging ? 'var(--bg-tertiary)' : 'transparent',
        transition: 'background-color 0.2s ease',
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
            boxShadow: '0 12px 40px var(--shadow-color)',
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--bg-secondary)',
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* 拖拽指示蒙层 */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          inset: '20px',
          border: '2px dashed var(--border-focus)',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          zIndex: 20,
          pointerEvents: 'none',
        }}>
          <Upload size={32} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>释放鼠标以导入应用截图</span>
        </div>
      )}

      {/* 缩放悬浮控制栏 - 独立于滚动层，永远固定于可见区域底部 */}
      <div className="viewport-zoom-bar" style={{ zIndex: 15 }}>
        <button className="ds-btn ds-btn-icon-only" style={{ width: '28px', height: '28px' }} onClick={handleZoomOut} title="缩小">
          <ZoomOut size={14} />
        </button>
        <span className="viewport-zoom-value">{zoom}%</span>
        <button className="ds-btn ds-btn-icon-only" style={{ width: '28px', height: '28px' }} onClick={handleZoomIn} title="放大">
          <ZoomIn size={14} />
        </button>
        <button className="ds-btn ds-btn-icon-only" style={{ width: '28px', height: '28px' }} onClick={handleZoomReset} title="重置 100%">
          <Maximize size={14} />
        </button>
      </div>
    </div>
  );
};
