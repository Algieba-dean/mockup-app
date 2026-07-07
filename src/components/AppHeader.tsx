import React from 'react';
import { Sun, Moon, Download, Layers, PanelLeftClose, PanelLeft, PanelRightClose, PanelRight } from 'lucide-react';

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
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTool,
  setActiveTool,
  theme,
  toggleTheme,
  onExport,
  leftSidebarCollapsed,
  setLeftSidebarCollapsed,
  rightSidebarCollapsed,
  setRightSidebarCollapsed,
}) => {
  return (
    <header className="app-header">
      <div className="app-logo">
        <button
          className="ds-btn ds-btn-icon-only"
          style={{ border: 'none' }}
          onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
          title={leftSidebarCollapsed ? "展开左边栏" : "折叠左边栏"}
          aria-label={leftSidebarCollapsed ? "展开左边栏" : "折叠左边栏"}
        >
          {leftSidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <Layers size={18} strokeWidth={1.5} style={{ marginLeft: '8px' }} />
        <h1 style={{ fontSize: '15px' }}>MockupApp</h1>
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
      </nav>

      <div className="app-actions">
        <button
          className="ds-btn ds-btn-icon-only"
          onClick={toggleTheme}
          title={theme === 'dark' ? '切换为亮色模式' : '切换为暗色模式'}
          aria-label={theme === 'dark' ? '切换为亮色模式' : '切换为暗色模式'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="ds-btn"
          onClick={onExport}
          title="导出 ZIP 压缩包"
        >
          <Download size={16} />
          <span>导出 ZIP</span>
        </button>
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
      </div>
    </header>
  );
};
