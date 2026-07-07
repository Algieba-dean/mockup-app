import { Copy, Download, FileText, Pencil } from 'lucide-react';
import type { DocSection } from '../utils/legalDocManager';
import { renderSectionsToHtml, renderSectionsToPlainText, renderSectionsToMarkdown } from '../utils/legalDocManager';

interface LegalResultViewProps {
  docTitle: string;
  effectiveDate: string;
  sections: DocSection[];
  fileBaseName: string;
  onEdit: () => void;
  onToast: (msg: string) => void;
}

export function LegalResultView({ docTitle, effectiveDate, sections, fileBaseName, onEdit, onToast }: LegalResultViewProps) {
  const plainText = renderSectionsToPlainText(docTitle, effectiveDate, sections);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainText);
      onToast('已复制到剪贴板');
    } catch {
      onToast('复制失败，请手动选中文本复制');
    }
  };

  const downloadBlob = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    downloadBlob(renderSectionsToHtml(docTitle, effectiveDate, sections), `${fileBaseName}.html`, 'text/html');
    onToast('已下载 HTML 文件');
  };

  const handleDownloadText = () => {
    downloadBlob(renderSectionsToMarkdown(docTitle, effectiveDate, sections), `${fileBaseName}.md`, 'text/markdown');
    onToast('已下载 Markdown 文件');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '720px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', margin: 0, color: 'var(--ink-primary)' }}>
            {docTitle}
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginTop: '4px' }}>Effective date: {effectiveDate}</p>
        </div>
        <button className="ds-btn" onClick={onEdit}>
          <Pencil size={14} aria-hidden="true" />
          <span>返回编辑</span>
        </button>
      </div>

      <div className="ds-panel" style={{
        border: '1px solid var(--border-primary)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '32px',
        maxHeight: '55vh',
        overflowY: 'auto',
      }}>
        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-primary)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '6px', marginBottom: '10px' }}>
              {s.heading}
            </h3>
            {s.paragraphs.map((p, j) => (
              <p key={j} style={{ fontSize: '13px', lineHeight: 1.7, color: 'var(--ink-secondary)', whiteSpace: 'pre-wrap', marginBottom: '8px' }}>
                {p}
              </p>
            ))}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button className="ds-btn" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          <span>复制到剪贴板</span>
        </button>
        <button className="ds-btn" onClick={handleDownloadHtml}>
          <FileText size={14} aria-hidden="true" />
          <span>下载 HTML</span>
        </button>
        <button className="ds-btn" onClick={handleDownloadText}>
          <Download size={14} aria-hidden="true" />
          <span>下载 Markdown</span>
        </button>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>
        本文档由模板工具生成，仅供参考，不构成法律意见。请在发布前核实文中列出的第三方服务链接，并咨询专业法律顾问。
      </p>
    </div>
  );
}
