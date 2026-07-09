import { useState, useEffect, useMemo, useRef, useId, isValidElement, cloneElement } from 'react';
import { Copy, Download, FileText, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';
import {
  DATA_TYPE_CATALOG,
  SERVICE_CATALOG,
  DEFAULT_MASTER_DRAFT,
  PLATFORM_LABELS,
  buildPrivacyPolicySections,
  buildTermsOfUseSections,
  buildAccountDeletionSections,
  buildCustomEulaSections,
  buildDataSafetyRows,
  buildNutritionLabelRows,
  buildPermissionMatrix,
  HIGH_RISK_TYPE_LABELS,
  NUTRITION_LABEL_CATEGORY_LABELS,
  renderAndroidPermissionSnippet,
  renderInfoPlistSnippet,
  renderNutritionLabelRowsToMarkdown,
  renderNutritionLabelRowsToText,
  renderSectionsToHtml,
  renderSectionsToMarkdown,
  renderSectionsToPlainText,
  shouldShowAttPrompt,
  toDataSafetyCsv,
  ATT_PROMPT_COPY,
} from '../utils/legalDocManager';
import type { CustomService, DocSection, HighRiskType, MasterDraft, PrivacyDraft } from '../utils/legalDocManager';

type RowId = 'privacy' | 'terms' | 'eula' | 'att' | 'nutrition' | 'deletion' | 'csv';

const MASTER_STORAGE_KEY = 'mockup_app_compliance_master_draft';
const TOOLKIT_STORAGE_KEY = 'mockup_app_compliance_toolkit';

function loadMasterDraft(): MasterDraft {
  try {
    const saved = localStorage.getItem(MASTER_STORAGE_KEY);
    if (!saved) return DEFAULT_MASTER_DRAFT;
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_MASTER_DRAFT, ...parsed };
  } catch {
    return DEFAULT_MASTER_DRAFT;
  }
}

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

interface ToolkitState {
  highRiskType: HighRiskType;
  checked: Record<RowId, boolean>;
}

const DEFAULT_TOOLKIT_STATE: ToolkitState = {
  highRiskType: 'none',
  checked: { privacy: false, terms: false, eula: false, att: false, nutrition: false, deletion: false, csv: false },
};

function loadToolkitState(): ToolkitState {
  try {
    const saved = localStorage.getItem(TOOLKIT_STORAGE_KEY);
    if (!saved) return DEFAULT_TOOLKIT_STATE;
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_TOOLKIT_STATE,
      ...parsed,
      checked: { ...DEFAULT_TOOLKIT_STATE.checked, ...parsed.checked },
    };
  } catch {
    return DEFAULT_TOOLKIT_STATE;
  }
}

const PERMISSION_ENTRY_LABELS: Record<string, string> = {
  ...Object.fromEntries(DATA_TYPE_CATALOG.map((d) => [d.id, d.label])),
  camera: 'Camera access',
};

const ROWS: Array<{ id: RowId; title: string; description: string }> = [
  { id: 'privacy', title: '隐私政策', description: '生成 App Store / Play 提审要求的隐私政策文档。' },
  { id: 'terms', title: '使用条款', description: '生成使用条款 / 服务协议文档。' },
  { id: 'eula', title: 'Custom EULA', description: '根据高风险类型自动插入 Apple 强制性条款，生成可直接粘贴进 App Store Connect 的自定义 EULA。' },
  { id: 'att', title: 'ATT 与系统权限话术矩阵', description: 'ATT 追踪弹窗文案 + iOS/Android 权限中英双语话术，避免因话术不合规被机审拒绝。' },
  { id: 'nutrition', title: '隐私营养标签 Cheat Sheet', description: '把已选数据类型映射为 App Store Connect 隐私标签问卷的填表对照表。' },
  { id: 'deletion', title: '账号与数据注销页', description: '独立于完整隐私政策的账号与数据注销页面，满足 Apple / Google 的公开 URL 要求。' },
  { id: 'csv', title: 'Google Play Data Safety CSV', description: '把已选数据类型 / SDK 映射为 Google Play Data Safety 表单的批量导入 CSV。' },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Shared master-questionnaire building blocks
// ============================================================================

function FieldGroup({ label, children, required, error }: { label: string; children: React.ReactNode; required?: boolean; error?: string }) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const isField = isValidElement(children);
  const fieldId = isField ? ((children as React.ReactElement<{ id?: string }>).props.id ?? generatedId) : undefined;
  const field = isField
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: fieldId,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })
    : children;

  return (
    <div className="ds-input-group">
      <label className="ds-label" htmlFor={fieldId}>{label}{required ? ' *' : ''}</label>
      {field}
      {error && (
        <p className="legal-field-error" id={errorId} role="alert">{error}</p>
      )}
    </div>
  );
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="legal-checkbox-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function FormSectionTitle({ children, first }: { children: React.ReactNode; first?: boolean }) {
  return <h3 className={`compliance-form-section-title ${first ? 'is-first' : ''}`}>{children}</h3>;
}

function ComplianceOutputSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="compliance-output-section">
      <h3 className="compliance-output-title">{title}</h3>
      {children}
    </section>
  );
}

function DocOutputBody({ docTitle, effectiveDate, sections, fileBaseName, onToast }: {
  docTitle: string;
  effectiveDate: string;
  sections: DocSection[];
  fileBaseName: string;
  onToast: (msg: string) => void;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderSectionsToPlainText(docTitle, effectiveDate, sections));
      onToast('已复制到剪贴板');
    } catch {
      onToast('复制失败，请手动选中文本复制');
    }
  };

  return (
    <div className="compliance-row-body">
      <DocPreview sections={sections} effectiveDate={effectiveDate} />
      <div className="compliance-actions">
        <button className="ds-btn" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          <span>复制到剪贴板</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToHtml(docTitle, effectiveDate, sections), `${fileBaseName}.html`, 'text/html'); onToast('已下载 HTML 文件'); }}>
          <FileText size={14} aria-hidden="true" />
          <span>下载 HTML</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToMarkdown(docTitle, effectiveDate, sections), `${fileBaseName}.md`, 'text/markdown'); onToast('已下载 Markdown 文件'); }}>
          <Download size={14} aria-hidden="true" />
          <span>下载 Markdown</span>
        </button>
      </div>
    </div>
  );
}

function CustomServiceEditor({ services, onChange }: { services: CustomService[]; onChange: (services: CustomService[]) => void }) {
  const addRow = () => onChange([...services, { name: '', url: '' }]);
  const updateRow = (i: number, fields: Partial<CustomService>) =>
    onChange(services.map((s, idx) => (idx === i ? { ...s, ...fields } : s)));
  const removeRow = (i: number) => onChange(services.filter((_, idx) => idx !== i));

  return (
    <div style={{ marginTop: '12px' }}>
      <span className="ds-label" style={{ display: 'block', marginBottom: '6px' }}>自定义第三方服务</span>
      {services.map((s, i) => (
        <div key={i} className="legal-custom-service-row">
          <input className="ds-input" placeholder="服务名称" value={s.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
          <input className="ds-input" placeholder="隐私政策链接（可选）" value={s.url} onChange={(e) => updateRow(i, { url: e.target.value })} />
          <button className="ds-btn ds-btn-icon-only" onClick={() => removeRow(i)} aria-label="删除">×</button>
        </div>
      ))}
      <button className="ds-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={addRow}>+ 添加自定义服务</button>
    </div>
  );
}

// ============================================================================
// Main workspace
// ============================================================================

export function ComplianceToolkitWorkspace({ onToast }: { onToast: (msg: string) => void }) {
  const [draft, setDraft] = useState<MasterDraft>(loadMasterDraft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<ToolkitState>(loadToolkitState);

  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(draftSaveTimerRef.current);
    draftSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(MASTER_STORAGE_KEY, JSON.stringify(draft)); } catch { /* quota exceeded */ }
    }, 300);
    return () => clearTimeout(draftSaveTimerRef.current);
  }, [draft]);

  const toolkitSaveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    clearTimeout(toolkitSaveTimerRef.current);
    toolkitSaveTimerRef.current = setTimeout(() => {
      try { localStorage.setItem(TOOLKIT_STORAGE_KEY, JSON.stringify(state)); } catch { /* quota exceeded */ }
    }, 300);
    return () => clearTimeout(toolkitSaveTimerRef.current);
  }, [state]);

  const updateDraft = (fields: Partial<MasterDraft>) => setDraft((d) => ({ ...d, ...fields }));
  const touchField = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const toggleRow = (id: RowId) =>
    setState((s) => ({ ...s, checked: { ...s.checked, [id]: !s.checked[id] } }));
  const setHighRiskType = (highRiskType: HighRiskType) => setState((s) => ({ ...s, highRiskType }));

  const checkedIds = ROWS.filter((r) => state.checked[r.id]).map((r) => r.id);
  const anyChecked = checkedIds.length > 0;

  const appNameError = touched.appName && !draft.appName.trim() ? 'App 名称为必填项' : undefined;
  const emailError = touched.contactEmail
    ? (!draft.contactEmail.trim() ? '联系邮箱为必填项' : !isValidEmail(draft.contactEmail) ? '请输入有效的邮箱地址' : undefined)
    : undefined;
  const ownerNameError = draft.ownerType === 'individual'
    ? (touched.developerName && !draft.developerName.trim() ? '开发者名称为必填项' : undefined)
    : (touched.companyName && !draft.companyName.trim() ? '公司名称为必填项' : undefined);

  const privacySections = useMemo(() => buildPrivacyPolicySections(draft), [draft]);
  const termsSections = useMemo(() => buildTermsOfUseSections(draft), [draft]);
  const eulaSections = useMemo(() => buildCustomEulaSections(draft, state.highRiskType), [draft, state.highRiskType]);

  const handleZipDownload = async () => {
    try {
      const zip = new JSZip();
      if (state.checked.privacy) zip.file('privacy-policy.html', renderSectionsToHtml('Privacy Policy', draft.effectiveDate, privacySections));
      if (state.checked.terms) zip.file('terms-of-use.html', renderSectionsToHtml('Terms of Use', draft.effectiveDate, termsSections));
      if (state.checked.eula) zip.file('custom-eula.html', renderSectionsToHtml('Custom End User License Agreement (EULA)', draft.effectiveDate, eulaSections));
      if (state.checked.att) zip.file('permission-matrix.md', buildPermissionMatrixMarkdown(draft));
      if (state.checked.nutrition) zip.file('nutrition-label-cheatsheet.md', renderNutritionLabelRowsToMarkdown(buildNutritionLabelRows(draft)));
      if (state.checked.deletion) zip.file('account-deletion.html', renderSectionsToHtml('Account and Data Deletion', draft.effectiveDate, buildAccountDeletionSections(draft)));
      if (state.checked.csv) zip.file('data-safety.csv', toDataSafetyCsv(buildDataSafetyRows(draft)));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compliance-toolkit.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onToast('已打包下载 ZIP');
    } catch {
      onToast('打包下载失败，请稍后重试');
    }
  };

  return (
    <div className="compliance-toolkit">
      <p className="compliance-toolkit-intro">
        先勾选你需要生成的合规文档，再填写下方唯一的问卷——所有输出共享同一份数据，只需填写一次。
      </p>

      <ul className="compliance-checklist">
        {ROWS.map((row) => (
          <li key={row.id} className="compliance-checklist-row">
            <label className="compliance-checklist-header">
              <input type="checkbox" checked={state.checked[row.id]} onChange={() => toggleRow(row.id)} />
              <span className="compliance-checklist-titles">
                <span className="compliance-checklist-title">{row.title}</span>
                <span className="compliance-checklist-desc">{row.description}</span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      {anyChecked && (
        <>
          <div className="compliance-questionnaire">
            <FormSectionTitle first>App / 开发者信息</FormSectionTitle>
            <FieldGroup label="App 名称" required error={appNameError}>
              <input className="ds-input" value={draft.appName} onChange={(e) => updateDraft({ appName: e.target.value })} onBlur={() => touchField('appName')} placeholder="例如 MockupApp" />
            </FieldGroup>
            <FieldGroup label="所有者类型">
              <select className="ds-select" value={draft.ownerType} onChange={(e) => updateDraft({ ownerType: e.target.value as MasterDraft['ownerType'] })}>
                <option value="individual">个人开发者 (Individual)</option>
                <option value="company">公司 / 企业 (Company)</option>
              </select>
            </FieldGroup>
            {draft.ownerType === 'individual' ? (
              <FieldGroup label="开发者姓名" required error={ownerNameError}>
                <input className="ds-input" value={draft.developerName} onChange={(e) => updateDraft({ developerName: e.target.value })} onBlur={() => touchField('developerName')} placeholder="例如 John Doe" />
              </FieldGroup>
            ) : (
              <>
                <FieldGroup label="公司名称" required error={ownerNameError}>
                  <input className="ds-input" value={draft.companyName} onChange={(e) => updateDraft({ companyName: e.target.value })} onBlur={() => touchField('companyName')} placeholder="例如 Acme Corp" />
                </FieldGroup>
                <FieldGroup label="营业地址（企业合规必填）">
                  <input className="ds-input" value={draft.businessAddress} onChange={(e) => updateDraft({ businessAddress: e.target.value })} placeholder="例如 123 Main St, New York, NY" />
                </FieldGroup>
              </>
            )}
            <FieldGroup label="官网 URL（可选）">
              <input className="ds-input" value={draft.websiteUrl} onChange={(e) => updateDraft({ websiteUrl: e.target.value })} placeholder="https://" />
            </FieldGroup>
            <FieldGroup label="联系邮箱" required error={emailError}>
              <input type="email" className="ds-input" value={draft.contactEmail} onChange={(e) => updateDraft({ contactEmail: e.target.value })} onBlur={() => touchField('contactEmail')} placeholder="support@example.com" />
            </FieldGroup>
            <FieldGroup label="生效日期">
              <input type="date" className="ds-input" value={draft.effectiveDate} onChange={(e) => updateDraft({ effectiveDate: e.target.value })} />
            </FieldGroup>
            <FieldGroup label="应用类型">
              <select className="ds-select" value={draft.appType} onChange={(e) => updateDraft({ appType: e.target.value as MasterDraft['appType'] })}>
                <option value="free">免费 (Free)</option>
                <option value="open_source">开源 (Open Source)</option>
                <option value="freemium">免费+内购 (Freemium)</option>
                <option value="ad_supported">广告支持 (Ad Supported)</option>
                <option value="commercial">商业/付费 (Commercial)</option>
              </select>
            </FieldGroup>
            <FieldGroup label="平台">
              <select className="ds-select" value={draft.platform} onChange={(e) => updateDraft({ platform: e.target.value as MasterDraft['platform'] })}>
                {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </FieldGroup>

            <FormSectionTitle>数据收集类型</FormSectionTitle>
            <div className="legal-checkbox-grid">
              {DATA_TYPE_CATALOG.map((d) => (
                <CheckboxField
                  key={d.id}
                  label={d.label}
                  checked={draft.dataTypes.includes(d.id)}
                  onChange={(checked) => updateDraft({
                    dataTypes: checked ? [...draft.dataTypes, d.id] : draft.dataTypes.filter((id) => id !== d.id),
                  })}
                />
              ))}
            </div>
            <FieldGroup label="其他数据类型（可选，用逗号分隔）">
              <input className="ds-input" value={draft.customDataTypes} onChange={(e) => updateDraft({ customDataTypes: e.target.value })} />
            </FieldGroup>

            <FormSectionTitle>第三方服务 / SDK</FormSectionTitle>
            {SERVICE_CATALOG.map((group) => (
              <div key={group.category} style={{ marginBottom: '8px' }}>
                <span className="ds-label" style={{ display: 'block', marginBottom: '6px' }}>{group.category}</span>
                <div className="legal-checkbox-grid">
                  {group.services.map((svc) => (
                    <CheckboxField
                      key={svc.id}
                      label={svc.label}
                      checked={draft.services.includes(svc.id)}
                      onChange={(checked) => updateDraft({
                        services: checked ? [...draft.services, svc.id] : draft.services.filter((id) => id !== svc.id),
                      })}
                    />
                  ))}
                </div>
              </div>
            ))}
            <CustomServiceEditor services={draft.customServices} onChange={(customServices) => updateDraft({ customServices })} />

            <FormSectionTitle>服务说明（用于使用条款 / EULA）</FormSectionTitle>
            <FieldGroup label="用一段话描述你的 App 做什么">
              <textarea className="ds-input" rows={4} value={draft.serviceDescription} onChange={(e) => updateDraft({ serviceDescription: e.target.value })} placeholder="例如：MockupApp 帮助开发者在浏览器中一站式生成应用商店截图、图标与合规文档。" />
            </FieldGroup>
            <CheckboxField label="需要用户注册账号（使用条款）" checked={draft.requiresAccount} onChange={(v) => updateDraft({ requiresAccount: v })} />
            <CheckboxField label="包含用户生成内容 (UGC)" checked={draft.hasUGC} onChange={(v) => updateDraft({ hasUGC: v })} />
            <CheckboxField label="包含订阅 / App 内购买" checked={draft.hasSubscriptions} onChange={(v) => updateDraft({ hasSubscriptions: v })} />

            <FormSectionTitle>隐私与合规选项</FormSectionTitle>
            <CheckboxField label="适用 GDPR（欧盟 / 英国用户）" checked={draft.gdpr} onChange={(v) => updateDraft({ gdpr: v })} />
            <CheckboxField label="适用 CCPA（加州用户）" checked={draft.ccpa} onChange={(v) => updateDraft({ ccpa: v })} />
            <CheckboxField label="面向 13 岁以下儿童 / 需遵守 COPPA" checked={draft.coppa} onChange={(v) => updateDraft({ coppa: v })} />
            <CheckboxField label="集成人工智能技术 (AI)" checked={draft.isAIUsed} onChange={(v) => updateDraft({ isAIUsed: v })} />
            <CheckboxField label="收集并使用地理位置 (Location)" checked={draft.isLocationTracked} onChange={(v) => updateDraft({ isLocationTracked: v })} />
            <CheckboxField label="适用欧盟数字服务法案 (DSA合规)" checked={draft.isDsa} onChange={(v) => updateDraft({ isDsa: v })} />
            {(draft.gdpr || draft.isDsa) && (
              <FieldGroup label="欧盟授权代表姓名/联系方式 (EU Legal Representative)">
                <input className="ds-input" value={draft.euRepresentative} onChange={(e) => updateDraft({ euRepresentative: e.target.value })} placeholder="例如 Acme Representative Ltd, representative@example.com" />
              </FieldGroup>
            )}
            <CheckboxField label="App 内支持用户账号注册（用于隐私政策的账号注销说明）" checked={draft.hasUserAccounts} onChange={(v) => updateDraft({ hasUserAccounts: v })} />
            {draft.hasUserAccounts && (
              <FieldGroup label="账号 / 数据删除说明（可选，留空使用通用表述）">
                <textarea className="ds-input" rows={2} value={draft.deletionInstructions} onChange={(e) => updateDraft({ deletionInstructions: e.target.value })} placeholder="例如：前往「设置 > 账号 > 删除账号」，或发邮件至联系邮箱申请删除" />
              </FieldGroup>
            )}
            <FieldGroup label="数据保留期限（可选，留空使用默认表述）">
              <textarea className="ds-input" rows={3} value={draft.retention} onChange={(e) => updateDraft({ retention: e.target.value })} />
            </FieldGroup>

            <FormSectionTitle>法律与地区</FormSectionTitle>
            <FieldGroup label="适用法律 / 管辖地区（可选，留空使用通用表述）">
              <input className="ds-input" value={draft.governingLaw} onChange={(e) => updateDraft({ governingLaw: e.target.value })} placeholder="例如 the State of Delaware, United States" />
            </FieldGroup>
            <FieldGroup label="最低使用年龄（默认 13，用于使用条款 / EULA）">
              <input type="number" min={0} className="ds-input" value={draft.minimumAge} onChange={(e) => updateDraft({ minimumAge: e.target.value })} />
            </FieldGroup>

            {state.checked.eula && (
              <>
                <FormSectionTitle>高风险类型（用于 Custom EULA）</FormSectionTitle>
                <fieldset className="compliance-fieldset">
                  <legend className="ds-label">你的 App 属于哪种高风险类型？</legend>
                  <div className="legal-checkbox-grid">
                    {(Object.keys(HIGH_RISK_TYPE_LABELS) as HighRiskType[]).map((type) => (
                      <label key={type} className="legal-checkbox-row">
                        <span>{HIGH_RISK_TYPE_LABELS[type]}</span>
                        <input type="radio" name="high-risk-type" checked={state.highRiskType === type} onChange={() => setHighRiskType(type)} />
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>
            )}
          </div>

          <div className="compliance-outputs">
            {state.checked.privacy && (
              <ComplianceOutputSection title="隐私政策">
                <DocOutputBody docTitle="Privacy Policy" effectiveDate={draft.effectiveDate} sections={privacySections} fileBaseName="privacy-policy" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.terms && (
              <ComplianceOutputSection title="使用条款">
                <DocOutputBody docTitle="Terms of Use" effectiveDate={draft.effectiveDate} sections={termsSections} fileBaseName="terms-of-use" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.eula && (
              <ComplianceOutputSection title="Custom EULA">
                <DocOutputBody docTitle="Custom End User License Agreement (EULA)" effectiveDate={draft.effectiveDate} sections={eulaSections} fileBaseName="custom-eula" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.att && (
              <ComplianceOutputSection title="ATT 与系统权限话术矩阵">
                <AttRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.nutrition && (
              <ComplianceOutputSection title="隐私营养标签 Cheat Sheet">
                <NutritionRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.deletion && (
              <ComplianceOutputSection title="账号与数据注销页">
                <DeletionRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.csv && (
              <ComplianceOutputSection title="Google Play Data Safety CSV">
                <CsvRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
          </div>

          {checkedIds.length >= 2 && (
            <div className="compliance-bundle-row">
              <button className="ds-btn ds-btn-active" onClick={handleZipDownload}>
                <Download size={14} aria-hidden="true" />
                <span>打包下载 ZIP（已选 {checkedIds.length} 项）</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DocPreview({ sections, effectiveDate }: { sections: DocSection[]; effectiveDate: string }) {
  return (
    <div className="ds-panel compliance-doc-preview">
      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink-primary)', borderBottom: '1px solid var(--border-primary)', paddingBottom: '4px', marginBottom: '8px' }}>
            {s.heading}
          </h4>
          {s.paragraphs.map((p, j) => (
            <p key={j} style={{ fontSize: '12px', lineHeight: 1.7, color: 'var(--ink-secondary)', whiteSpace: 'pre-wrap', marginBottom: '6px' }}>
              {p}
            </p>
          ))}
        </div>
      ))}
      <p style={{ fontSize: '11px', color: 'var(--ink-secondary)' }}>Effective date: {effectiveDate}</p>
    </div>
  );
}

function buildPermissionMatrixMarkdown(privacyDraft: PrivacyDraft): string {
  const entries = buildPermissionMatrix(privacyDraft);
  const parts = ['# ATT & 系统权限话术配置表', ''];
  if (shouldShowAttPrompt(privacyDraft)) {
    parts.push('## ATT (NSUserTrackingUsageDescription)', '', `中文：${ATT_PROMPT_COPY.zh}`, '', `English: ${ATT_PROMPT_COPY.en}`, '');
  }
  parts.push('## 权限矩阵', '', '| Data Type | iOS Key | Android Permission | 中文 | English |', '| --- | --- | --- | --- | --- |');
  for (const e of entries) {
    parts.push(`| ${e.dataTypeId} | ${e.iosKey ?? '-'} | ${e.androidPermission ?? '-'} | ${e.zh} | ${e.en} |`);
  }
  parts.push('', '## Info.plist 片段', '', '```xml', renderInfoPlistSnippet(entries), '```');
  parts.push('', '## Android 权限片段', '', '```xml', renderAndroidPermissionSnippet(entries), '```');
  return parts.join('\n');
}

function AttRow({ privacyDraft, onToast }: { privacyDraft: PrivacyDraft; onToast: (msg: string) => void }) {
  const entries = useMemo(() => buildPermissionMatrix(privacyDraft), [privacyDraft]);
  const showAtt = shouldShowAttPrompt(privacyDraft);

  const copyText = async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onToast(message);
    } catch {
      onToast('复制失败，请手动选中文本复制');
    }
  };

  return (
    <div className="compliance-row-body">
      {showAtt ? (
        <div className="ds-panel compliance-doc-preview">
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>ATT 弹窗文案 (NSUserTrackingUsageDescription)</h4>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)', marginBottom: '4px' }}>中文：{ATT_PROMPT_COPY.zh}</p>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>English: {ATT_PROMPT_COPY.en}</p>
        </div>
      ) : (
        <div className="legal-resume-banner">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>未检测到广告 / 归因类第三方服务，无需 ATT 弹窗文案。仅当你的 App 确实用于跨 App/网站追踪广告时才需要 ATT。</span>
        </div>
      )}

      {entries.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>数据类型</th>
                <th>iOS Key</th>
                <th>Android Permission</th>
                <th>中文话术</th>
                <th>English</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td>{PERMISSION_ENTRY_LABELS[e.dataTypeId] ?? e.dataTypeId}</td>
                  <td>{e.iosKey ?? '—'}</td>
                  <td>{e.androidPermission ?? '—'}</td>
                  <td>{e.zh}</td>
                  <td>{e.en}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="legal-resume-banner">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>未在隐私政策问卷中选择任何需要权限说明的数据类型（如相册、位置、联系人）。</span>
        </div>
      )}

      <div className="compliance-actions">
        <button className="ds-btn" disabled={entries.length === 0} onClick={() => copyText(renderInfoPlistSnippet(entries), '已复制 Info.plist 片段')}>
          <Copy size={14} aria-hidden="true" />
          <span>复制 Info.plist 片段</span>
        </button>
        <button className="ds-btn" disabled={entries.length === 0} onClick={() => copyText(renderAndroidPermissionSnippet(entries), '已复制 Android 权限片段')}>
          <Copy size={14} aria-hidden="true" />
          <span>复制 Android 权限片段</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(buildPermissionMatrixMarkdown(privacyDraft), 'permission-matrix.md', 'text/markdown'); onToast('已下载 Markdown 文件'); }}>
          <Download size={14} aria-hidden="true" />
          <span>下载 Markdown</span>
        </button>
      </div>
    </div>
  );
}

function NutritionRow({ privacyDraft, onToast }: { privacyDraft: PrivacyDraft; onToast: (msg: string) => void }) {
  const rows = useMemo(() => buildNutritionLabelRows(privacyDraft), [privacyDraft]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(renderNutritionLabelRowsToText(rows));
      onToast('已复制到剪贴板');
    } catch {
      onToast('复制失败，请手动选中文本复制');
    }
  };

  return (
    <div className="compliance-row-body">
      <div className="legal-resume-banner">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>Apple 未开放隐私标签 API，无法一键导入；请以 App Store Connect 最新问卷界面为准，逐项核对下表。</span>
      </div>

      {rows.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Apple Category</th>
                <th>Suggested Purpose(s)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dataTypeId}>
                  <td>{r.dataTypeLabel}</td>
                  <td>{NUTRITION_LABEL_CATEGORY_LABELS[r.category]}</td>
                  <td>{r.purposes.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>未在隐私政策问卷中选择任何数据类型。</p>
      )}

      <div className="compliance-actions">
        <button className="ds-btn" disabled={rows.length === 0} onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          <span>复制到剪贴板</span>
        </button>
        <button className="ds-btn" disabled={rows.length === 0} onClick={() => { downloadBlob(renderNutritionLabelRowsToMarkdown(rows), 'nutrition-label-cheatsheet.md', 'text/markdown'); onToast('已下载 Markdown 文件'); }}>
          <Download size={14} aria-hidden="true" />
          <span>下载 Markdown</span>
        </button>
      </div>
    </div>
  );
}

function DeletionRow({ privacyDraft, onToast }: { privacyDraft: PrivacyDraft; onToast: (msg: string) => void }) {
  const sections = useMemo(() => buildAccountDeletionSections(privacyDraft), [privacyDraft]);
  const docTitle = 'Account and Data Deletion';

  return (
    <div className="compliance-row-body">
      <div className="legal-resume-banner">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>Apple（Guideline 5.1.1(v)）与 Google Play 均要求提供一个独立的公开 URL 用于账号/数据注销，仅在完整隐私政策里提及是不够的；这份独立页面用于单独部署。</span>
      </div>
      <DocPreview sections={sections} effectiveDate={privacyDraft.effectiveDate} />
      <div className="compliance-actions">
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToHtml(docTitle, privacyDraft.effectiveDate, sections), 'account-deletion.html', 'text/html'); onToast('已下载 HTML 文件'); }}>
          <FileText size={14} aria-hidden="true" />
          <span>下载 HTML</span>
        </button>
      </div>
    </div>
  );
}

function CsvRow({ privacyDraft, onToast }: { privacyDraft: PrivacyDraft; onToast: (msg: string) => void }) {
  const rows = useMemo(() => buildDataSafetyRows(privacyDraft), [privacyDraft]);
  const csv = useMemo(() => toDataSafetyCsv(rows), [rows]);

  return (
    <div className="compliance-row-body">
      <div className="legal-resume-banner">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>Google Play 后台的批量导入模板可能随版本更新变化，如导入失败请对照 Play Console 最新模板核对列名。</span>
      </div>

      {rows.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>Data type</th>
                <th>Collected</th>
                <th>Shared</th>
                <th>Purpose</th>
                <th>Optional</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.dataType}</td>
                  <td>{r.collected ? 'Yes' : 'No'}</td>
                  <td>{r.shared ? 'Yes' : 'No'}</td>
                  <td>{r.purpose}</td>
                  <td>{r.optional ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>未在隐私政策问卷中选择任何数据类型。</p>
      )}

      <div className="compliance-actions">
        <button className="ds-btn" disabled={rows.length === 0} onClick={() => { downloadBlob(csv, 'data-safety.csv', 'text/csv'); onToast('已下载 CSV 文件'); }}>
          <Download size={14} aria-hidden="true" />
          <span>下载 CSV</span>
        </button>
      </div>
    </div>
  );
}
