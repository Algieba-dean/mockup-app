import React, { useEffect, useState } from 'react';
import { Sun, Moon, Download, Layers, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight, Undo2, Redo2, History, Check, HelpCircle } from 'lucide-react';
import { getMessages, formatMessage } from '../i18n';

const m = getMessages().app;

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
  const relative = seconds < 5
    ? m.header.savedJustNow
    : seconds < 60
      ? formatMessage(m.header.savedSecondsAgo, { n: seconds })
      : formatMessage(m.header.savedMinutesAgo, { n: Math.floor(seconds / 60) });
  const absolute = new Date(lastSavedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <span
      title={formatMessage(m.header.savedTooltip, { time: absolute })}
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
      {formatMessage(m.header.savedLabel, { time: relative })}
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
            title={leftSidebarCollapsed ? m.header.expandLeftSidebar : m.header.collapseLeftSidebar}
            aria-label={leftSidebarCollapsed ? m.header.expandLeftSidebar : m.header.collapseLeftSidebar}
          >
            {leftSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
          </button>
        )}
        <Layers size={18} strokeWidth={1.5} style={{ marginLeft: activeTool !== 'privacy' ? '8px' : '0' }} />
        <h1 style={{ fontSize: '15px' }}>{m.brandName}</h1>
        {activeTool !== 'privacy' && <SaveStatusIndicator lastSavedAt={lastSavedAt} />}
      </div>

      <nav className="app-nav">
        <button
          className={`ds-btn ${activeTool === 'screenshots' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('screenshots')}
        >
          {m.nav.screenshots}
        </button>
        <button
          className={`ds-btn ${activeTool === 'icons' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('icons')}
        >
          {m.nav.icons}
        </button>
        <button
          className={`ds-btn ${activeTool === 'privacy' ? 'ds-btn-active' : ''}`}
          onClick={() => setActiveTool('privacy')}
        >
          {m.nav.privacy}
        </button>
      </nav>

      <div className="app-actions">
        {activeTool === 'screenshots' && (
          <>
            <button
              className="ds-btn ds-btn-icon-only"
              onClick={onUndo}
              disabled={!canUndo}
              title={m.header.undoShortcut}
              aria-label={m.header.undo}
            >
              <Undo2 size={16} />
            </button>
            <button
              className="ds-btn ds-btn-icon-only"
              onClick={onRedo}
              disabled={!canRedo}
              title={m.header.redoShortcut}
              aria-label={m.header.redo}
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
            title={m.header.help}
            aria-label={m.header.help}
          >
            <HelpCircle size={18} />
          </button>
        )}
        <button
          className="ds-btn ds-btn-icon-only"
          onClick={toggleTheme}
          title={theme === 'dark' ? m.header.switchToLight : m.header.switchToDark}
          aria-label={theme === 'dark' ? m.header.switchToLight : m.header.switchToDark}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        {activeTool === 'icons' && onToggleHistory && (
          <button
            className="ds-btn ds-btn-icon-only"
            onClick={onToggleHistory}
            title={m.header.iconHistory}
            aria-label={m.header.iconHistory}
          >
            <History size={16} />
          </button>
        )}
        {activeTool !== 'privacy' && (
          <button
            className="ds-btn"
            onClick={onExport}
            title={m.header.exportZipTitle}
          >
            <Download size={16} />
            <span>{m.header.exportZip}</span>
          </button>
        )}
        {activeTool !== 'privacy' && (
          <>
            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-primary)', margin: '0 4px' }} />
            <button
              className="ds-btn ds-btn-icon-only"
              style={{ border: 'none' }}
              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
              title={rightSidebarCollapsed ? m.header.expandRightSidebar : m.header.collapseRightSidebar}
              aria-label={rightSidebarCollapsed ? m.header.expandRightSidebar : m.header.collapseRightSidebar}
            >
              {rightSidebarCollapsed ? <PanelRight size={16} /> : <PanelRightClose size={16} />}
            </button>
          </>
        )}
      </div>
    </header>
  );
});
