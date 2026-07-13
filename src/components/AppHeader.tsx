import React, { useEffect, useState } from 'react';
import { Sun, Moon, Download, Layers, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Undo2, Redo2, History, Check, HelpCircle } from 'lucide-react';

interface AppHeaderProps {
  activeTool: string;
  setActiveTool: (tool: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  onExport: () => void;
  // Sidebar Toggles
  leftSidebarCollapsed: boolean;
  setLeftSidebarCollapsed: (collapsed: boolean) => void;
  rightSidebarCollapsed: boolean;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  // Undo/Redo
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onToggleHistory?: () => void;
  // 最近一次成功写入 localStorage 的时间戳，用于驱动"已自动保存"状态指示
  lastSavedAt?: number | null;
  onShowHelp?: () => void;
}

// 持续可见的保存状态提示：每次 pages/screenshots 变更并成功写入 localStorage 后
// 更新，让用户随时能确认自己的编辑确实已经落盘 (Nielsen heuristic #1)，
// 而不必"信任"自动保存在背后默默发生、出错也无从察觉。
const SaveStatusIndicator: React.FC<{ lastSavedAt?: number | null }> = ({ lastSavedAt }) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!lastSavedAt) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 15000);
    return () => clearInterval(interval);
  }, [lastSavedAt]);

  if (!lastSavedAt) return null;

  const seconds = Math.max(0, Math.floor((Date.now() - lastSavedAt) / 1000));
  const relative = seconds < 5 ? '刚刚' : seconds < 60 ? `${seconds} 秒前` : `${Math.floor(seconds / 60)} 分钟前`;
  const absolute = new Date(lastSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <span
      title={`已自动保存到本机浏览器 · ${absolute}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: 'var(--ink-tertiary)',
        marginLeft: '14px',
        whiteSpace: 'nowrap',
      }}
    >
      <Check size={12} strokeWidth={2} />
      已保存 {relative}
    </span>
  );
};

export const AppHeader: React.FC<AppHeaderProps> = React.memo(({
  activeTool,
  setActiveTool,
  theme,
  toggleTheme,
  onExport,
  leftSidebarCollapsed,
  setLeftSidebarCollapsed,
  rightSidebarCollapsed,
  setRightSidebarCollapsed,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onToggleHistory,
  lastSavedAt,
  onShowHelp,
}) => {
  return (
    <header className="app-header">
      <div className="app-logo">
        {activeTool !== 'privacy' && (
          <button
            className="ds-btn ds-btn-icon-only"
            style={{ border: 'none' }}
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            title={leftSidebarCollapsed ? "展开左边栏" : "折叠左边栏"}
            aria-label={leftSidebarCollapsed ? "展开左边栏" : "折叠左边栏"}
          >
            {leftSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
        <Layers size={18} strokeWidth={1.5} style={{ marginLeft: activeTool !== 'privacy' ? '8px' : '0' }} />
        <h1 style={{ fontSize: '15px' }}>MockupApp</h1>
        {activeTool !== 'privacy' && <SaveStatusIndicator lastSavedAt={lastSavedAt} />}
      </div>

      <nav className="app-nav">
        <button
          className={`ds-btn ${activeTool === 'screenshots' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('screenshots')}
        >
          商店截图
        </button>
        <button
          className={`ds-btn ${activeTool === 'icons' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('icons')}
        >
          图标生成
        </button>
        <button
          className={`ds-btn ${activeTool === 'copywriter' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('copywriter')}
        >
          文案助手
        </button>
        <button
          className={`ds-btn ${activeTool === 'privacy' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('privacy')}
        >
          隐私与条款
        </button>
      </nav>

      <div className="app-actions">
        {activeTool !== 'privacy' && (
          <>
            <button
              className="ds-btn ds-btn-icon-only"
              onClick={onUndo}
              disabled={!canUndo}
              title="撤销 (Ctrl+Z)"
              aria-label="撤销"
            >
              <Undo2 size={16} />
            </button>
            <button
              className="ds-btn ds-btn-icon-only"
              onClick={onRedo}
              disabled={!canRedo}
              title="重做 (Ctrl+Shift+Z)"
              aria-label="重做"
            >
              <Redo2 size={16} />
            </button>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-primary)', margin: '0 4px' }} />
          </>
        )}
        {onShowHelp && (
          <button
            className="ds-btn ds-btn-icon-only"
            onClick={onShowHelp}
            title="帮助与快捷键"
            aria-label="帮助与快捷键"
          >
            <HelpCircle size={18} />
          </button>
        )}
        <button
          className="ds-btn ds-btn-icon-only"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换为亮色模式' : '切换为暗色模式'}
          aria-label={theme === 'dark' ? '切换为亮色模式' : '切换为暗色模式'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {activeTool === 'icons' && onToggleHistory && (
          <button
            className="ds-btn ds-btn-icon-only"
            onClick={onToggleHistory}
            title="查看历史方案"
            aria-label="查看历史方案"
          >
            <History size={16} />
          </button>
        )}
        {activeTool !== 'privacy' && (
          <button
            className="ds-btn"
            onClick={onExport}
            title="导出 ZIP 压缩包"
          >
            <Download size={16} />
            <span>导出 ZIP</span>
          </button>
        )}
        {activeTool !== 'privacy' && (
          <>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-primary)', margin: '0 4px' }} />
            <button
              className="ds-btn ds-btn-icon-only"
              style={{ border: 'none' }}
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              title={rightSidebarCollapsed ? "展开右边栏" : "折叠右边栏"}
              aria-label={rightSidebarCollapsed ? "展开右边栏" : "折叠右边栏"}
            >
              {rightSidebarCollapsed ? <PanelRight size={16} /> : <PanelRightClose size={16} />}
            </button>
          </>
        )}
      </div>
    </header>
  );
});
