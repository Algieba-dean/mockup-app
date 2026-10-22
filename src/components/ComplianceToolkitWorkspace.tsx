import { useState, useEffect, useMemo, useRef, useId, isValidElement, cloneElement } from 'react';
import { Copy, Download, FileText, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';
import { getMessages, formatMessage } from '../i18n';
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
  checked: { privacy: true, terms: false, eula: false, att: false, nutrition: false, deletion: false, csv: false },
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
  camera: '相机拍摄权限',
};

const m = getMessages().compliance;

const ROWS: Array<{ id: RowId; title: string; description: string }> = [
  { id: 'privacy', title: m.rows.privacyTitle, description: m.rows.privacyDesc },
  { id: 'terms', title: m.rows.termsTitle, description: m.rows.termsDesc },
  { id: 'eula', title: m.rows.eulaTitle, description: m.rows.eulaDesc },
  { id: 'att', title: m.rows.attTitle, description: m.rows.attDesc },
  { id: 'nutrition', title: m.rows.nutritionTitle, description: m.rows.nutritionDesc },
  { id: 'deletion', title: m.rows.deletionTitle, description: m.rows.deletionDesc },
  { id: 'csv', title: m.rows.csvTitle, description: m.rows.csvDesc },
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
  setTimeout(() => URL.revokeObjectURL(url), 10000);
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
      onToast(m.actions.copiedToClipboard);
    } catch {
      onToast(m.actions.copyFailed);
    }
  };

  return (
    <div className="compliance-row-body">
      <DocPreview sections={sections} effectiveDate={effectiveDate} />
      <div className="compliance-actions">
        <button className="ds-btn" onClick={handleCopy}>
          <Copy size={14} aria-hidden="true" />
          <span>{m.actions.copyToClipboard}</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToHtml(docTitle, effectiveDate, sections), `${fileBaseName}.html`, 'text/html'); onToast(m.actions.downloadedHtml); }}>
          <FileText size={14} aria-hidden="true" />
          <span>{m.actions.downloadHtml}</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToMarkdown(docTitle, effectiveDate, sections), `${fileBaseName}.md`, 'text/markdown'); onToast(m.actions.downloadedMarkdown); }}>
          <Download size={14} aria-hidden="true" />
          <span>{m.actions.downloadMarkdown}</span>
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
      <span className="ds-label" style={{ display: 'block', marginBottom: '6px' }}>{m.form.customServicesLabel}</span>
      {services.map((s, i) => (
        <div key={i} className="legal-custom-service-row">
          <input className="ds-input" placeholder={m.form.serviceNamePlaceholder} value={s.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
          <input className="ds-input" placeholder={m.form.servicePolicyPlaceholder} value={s.url} onChange={(e) => updateRow(i, { url: e.target.value })} />
          <button className="ds-btn ds-btn-icon-only" onClick={() => removeRow(i)} aria-label="删除">×</button>
        </div>
      ))}
      <button className="ds-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={addRow}>{m.form.addCustomService}</button>
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

  const appNameError = touched.appName && !draft.appName.trim() ? m.form.appNameRequired : undefined;
  const emailError = touched.contactEmail
    ? (!draft.contactEmail.trim() ? m.form.emailRequired : !isValidEmail(draft.contactEmail) ? m.form.emailInvalid : undefined)
    : undefined;
  const ownerNameError = draft.ownerType === 'individual'
    ? (touched.developerName && !draft.developerName.trim() ? m.form.developerNameRequired : undefined)
    : (touched.companyName && !draft.companyName.trim() ? m.form.companyNameRequired : undefined);

  const privacySections = useMemo(() => buildPrivacyPolicySections(draft), [draft]);
  const termsSections = useMemo(() => buildTermsOfUseSections(draft), [draft]);
  const eulaSections = useMemo(() => buildCustomEulaSections(draft, state.highRiskType), [draft, state.highRiskType]);

  const handleZipDownload = async () => {
    try {
      const zip = new JSZip();
      if (state.checked.privacy) zip.file('privacy-policy.html', renderSectionsToHtml(m.rows.privacyTitle, draft.effectiveDate, privacySections));
      if (state.checked.terms) zip.file('terms-of-use.html', renderSectionsToHtml(m.rows.termsTitle, draft.effectiveDate, termsSections));
      if (state.checked.eula) zip.file('custom-eula.html', renderSectionsToHtml(m.rows.eulaTitle, draft.effectiveDate, eulaSections));
      if (state.checked.att) zip.file('permission-matrix.md', buildPermissionMatrixMarkdown(draft));
      if (state.checked.nutrition) zip.file('nutrition-label-cheatsheet.md', renderNutritionLabelRowsToMarkdown(buildNutritionLabelRows(draft)));
      if (state.checked.deletion) zip.file('account-deletion.html', renderSectionsToHtml(m.rows.deletionTitle, draft.effectiveDate, buildAccountDeletionSections(draft)));
      if (state.checked.csv) zip.file('data-safety.csv', toDataSafetyCsv(buildDataSafetyRows(draft)));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compliance-toolkit.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      onToast(m.actions.bundledZipSuccess);
    } catch {
      onToast(m.actions.bundledZipFailed);
    }
  };

  return (
    <div className="compliance-toolkit">
      <p className="compliance-toolkit-intro">
        {m.intro}
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
            <FormSectionTitle first>{m.form.devInfoSection}</FormSectionTitle>
            <FieldGroup label={m.form.appName} required error={appNameError}>
              <input className="ds-input" value={draft.appName} onChange={(e) => updateDraft({ appName: e.target.value })} onBlur={() => touchField('appName')} placeholder={m.form.appNamePlaceholder} />
            </FieldGroup>
            <FieldGroup label={m.form.ownerType}>
              <select className="ds-select" value={draft.ownerType} onChange={(e) => updateDraft({ ownerType: e.target.value as MasterDraft['ownerType'] })}>
                <option value="individual">{m.form.ownerIndividual}</option>
                <option value="company">{m.form.ownerCompany}</option>
              </select>
            </FieldGroup>
            {draft.ownerType === 'individual' ? (
              <FieldGroup label={m.form.developerName} required error={ownerNameError}>
                <input className="ds-input" value={draft.developerName} onChange={(e) => updateDraft({ developerName: e.target.value })} onBlur={() => touchField('developerName')} placeholder={m.form.developerNamePlaceholder} />
              </FieldGroup>
            ) : (
              <>
                <FieldGroup label={m.form.companyName} required error={ownerNameError}>
                  <input className="ds-input" value={draft.companyName} onChange={(e) => updateDraft({ companyName: e.target.value })} onBlur={() => touchField('companyName')} placeholder={m.form.companyNamePlaceholder} />
                </FieldGroup>
                <FieldGroup label={m.form.businessAddress}>
                  <input className="ds-input" value={draft.businessAddress} onChange={(e) => updateDraft({ businessAddress: e.target.value })} placeholder={m.form.businessAddressPlaceholder} />
                </FieldGroup>
              </>
            )}
            <FieldGroup label={m.form.websiteUrl}>
              <input className="ds-input" value={draft.websiteUrl} onChange={(e) => updateDraft({ websiteUrl: e.target.value })} placeholder={m.form.websiteUrlPlaceholder} />
            </FieldGroup>
            <FieldGroup label={m.form.contactEmail} required error={emailError}>
              <input type="email" className="ds-input" value={draft.contactEmail} onChange={(e) => updateDraft({ contactEmail: e.target.value })} onBlur={() => touchField('contactEmail')} placeholder={m.form.contactEmailPlaceholder} />
            </FieldGroup>
            <FieldGroup label={m.form.effectiveDate}>
              <input type="date" className="ds-input" value={draft.effectiveDate} onChange={(e) => updateDraft({ effectiveDate: e.target.value })} />
            </FieldGroup>
            <FieldGroup label={m.form.appType}>
              <select className="ds-select" value={draft.appType} onChange={(e) => updateDraft({ appType: e.target.value as MasterDraft['appType'] })}>
                <option value="free">{m.form.appTypeFree}</option>
                <option value="open_source">{m.form.appTypeOpenSource}</option>
                <option value="freemium">{m.form.appTypeFreemium}</option>
                <option value="ad_supported">{m.form.appTypeAdSupported}</option>
                <option value="commercial">{m.form.appTypeCommercial}</option>
              </select>
            </FieldGroup>
            <FieldGroup label={m.form.platform}>
              <select className="ds-select" value={draft.platform} onChange={(e) => updateDraft({ platform: e.target.value as MasterDraft['platform'] })}>
                {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </FieldGroup>

            <FormSectionTitle>{m.form.dataTypesSection}</FormSectionTitle>
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
            <FieldGroup label={m.form.customDataTypes}>
              <input className="ds-input" value={draft.customDataTypes} onChange={(e) => updateDraft({ customDataTypes: e.target.value })} />
            </FieldGroup>

            <FormSectionTitle>{m.form.sdkSection}</FormSectionTitle>
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

            <FormSectionTitle>{m.form.serviceDescSection}</FormSectionTitle>
            <FieldGroup label={m.form.serviceDescLabel}>
              <textarea className="ds-input" rows={4} value={draft.serviceDescription} onChange={(e) => updateDraft({ serviceDescription: e.target.value })} placeholder={m.form.serviceDescPlaceholder} />
            </FieldGroup>
            <CheckboxField label={m.form.requiresAccount} checked={draft.requiresAccount} onChange={(v) => updateDraft({ requiresAccount: v })} />
            <CheckboxField label={m.form.hasUgc} checked={draft.hasUGC} onChange={(v) => updateDraft({ hasUGC: v })} />
            <CheckboxField label={m.form.hasSubscriptions} checked={draft.hasSubscriptions} onChange={(v) => updateDraft({ hasSubscriptions: v })} />

            <FormSectionTitle>{m.form.complianceOptionsSection}</FormSectionTitle>
            <CheckboxField label={m.form.gdpr} checked={draft.gdpr} onChange={(v) => updateDraft({ gdpr: v })} />
            <CheckboxField label={m.form.ccpa} checked={draft.ccpa} onChange={(v) => updateDraft({ ccpa: v })} />
            <CheckboxField label={m.form.coppa} checked={draft.coppa} onChange={(v) => updateDraft({ coppa: v })} />
            <CheckboxField label={m.form.aiUsed} checked={draft.isAIUsed} onChange={(v) => updateDraft({ isAIUsed: v })} />
            <CheckboxField label={m.form.locationTracked} checked={draft.isLocationTracked} onChange={(v) => updateDraft({ isLocationTracked: v })} />
            <CheckboxField label={m.form.dsa} checked={draft.isDsa} onChange={(v) => updateDraft({ isDsa: v })} />
            {(draft.gdpr || draft.isDsa) && (
              <FieldGroup label={m.form.euRep}>
                <input className="ds-input" value={draft.euRepresentative} onChange={(e) => updateDraft({ euRepresentative: e.target.value })} placeholder={m.form.euRepPlaceholder} />
              </FieldGroup>
            )}
            <CheckboxField label={m.form.hasUserAccounts} checked={draft.hasUserAccounts} onChange={(v) => updateDraft({ hasUserAccounts: v })} />
            {draft.hasUserAccounts && (
              <FieldGroup label={m.form.deletionInstructions}>
                <textarea className="ds-input" rows={2} value={draft.deletionInstructions} onChange={(e) => updateDraft({ deletionInstructions: e.target.value })} placeholder={m.form.deletionPlaceholder} />
              </FieldGroup>
            )}
            <FieldGroup label={m.form.retention}>
              <textarea className="ds-input" rows={3} value={draft.retention} onChange={(e) => updateDraft({ retention: e.target.value })} />
            </FieldGroup>

            <FormSectionTitle>{m.form.lawSection}</FormSectionTitle>
            <FieldGroup label={m.form.governingLaw}>
              <input className="ds-input" value={draft.governingLaw} onChange={(e) => updateDraft({ governingLaw: e.target.value })} placeholder={m.form.governingLawPlaceholder} />
            </FieldGroup>
            <FieldGroup label={m.form.minimumAge}>
              <input type="number" min={0} className="ds-input" value={draft.minimumAge} onChange={(e) => updateDraft({ minimumAge: e.target.value })} />
            </FieldGroup>

            {state.checked.eula && (
              <>
                <FormSectionTitle>{m.form.highRiskSection}</FormSectionTitle>
                <fieldset className="compliance-fieldset">
                  <legend className="ds-label">{m.form.highRiskLegend}</legend>
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
              <ComplianceOutputSection title={m.rows.privacyTitle}>
                <DocOutputBody docTitle={m.rows.privacyTitle} effectiveDate={draft.effectiveDate} sections={privacySections} fileBaseName="privacy-policy" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.terms && (
              <ComplianceOutputSection title={m.rows.termsTitle}>
                <DocOutputBody docTitle={m.rows.termsTitle} effectiveDate={draft.effectiveDate} sections={termsSections} fileBaseName="terms-of-use" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.eula && (
              <ComplianceOutputSection title={m.rows.eulaTitle}>
                <DocOutputBody docTitle={m.rows.eulaTitle} effectiveDate={draft.effectiveDate} sections={eulaSections} fileBaseName="custom-eula" onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.att && (
              <ComplianceOutputSection title={m.rows.attTitle}>
                <AttRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.nutrition && (
              <ComplianceOutputSection title={m.rows.nutritionTitle}>
                <NutritionRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.deletion && (
              <ComplianceOutputSection title={m.rows.deletionTitle}>
                <DeletionRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
            {state.checked.csv && (
              <ComplianceOutputSection title={m.rows.csvTitle}>
                <CsvRow privacyDraft={draft} onToast={onToast} />
              </ComplianceOutputSection>
            )}
          </div>

          {checkedIds.length >= 2 && (
            <div className="compliance-bundle-row">
              <button className="ds-btn ds-btn-active" onClick={handleZipDownload}>
                <Download size={14} aria-hidden="true" />
                <span>{formatMessage(m.actions.bundleZip, { n: checkedIds.length })}</span>
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
      <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>生效日期：{effectiveDate}</p>
    </div>
  );
}

function buildPermissionMatrixMarkdown(privacyDraft: PrivacyDraft): string {
  const entries = buildPermissionMatrix(privacyDraft);
  const parts = ['# 追踪授权与系统权限话术配置表', ''];
  if (shouldShowAttPrompt(privacyDraft)) {
    parts.push('## 跨应用追踪授权弹窗文案', '', `推荐说明话术：${ATT_PROMPT_COPY.zh}`, '');
  }
  parts.push('## 系统权限说明矩阵', '', '| 数据类型 | 苹果权限标识 | 安卓权限标识 | 推荐合规话术 |', '| --- | --- | --- | --- |');
  for (const e of entries) {
    parts.push(`| ${PERMISSION_ENTRY_LABELS[e.dataTypeId] ?? e.dataTypeId} | ${e.iosKey ?? '-'} | ${e.androidPermission ?? '-'} | ${e.zh} |`);
  }
  parts.push('', '## 苹果权限配置片段', '', '```xml', renderInfoPlistSnippet(entries), '```');
  parts.push('', '## 安卓权限配置片段', '', '```xml', renderAndroidPermissionSnippet(entries), '```');
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
      onToast(m.actions.copyFailed);
    }
  };

  return (
    <div className="compliance-row-body">
      {showAtt ? (
        <div className="ds-panel compliance-doc-preview">
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>跨应用追踪弹窗文案</h4>
          <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>推荐话术：{ATT_PROMPT_COPY.zh}</p>
        </div>
      ) : (
        <div className="legal-resume-banner">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>未检测到广告变现与渠道归因类第三方服务，无需申请跨应用追踪授权弹窗。仅当应用确实用于跨应用追踪广告投放时才需配置。</span>
        </div>
      )}

      {entries.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>数据类型</th>
                <th>苹果权限标识</th>
                <th>安卓权限标识</th>
                <th>推荐合规话术</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i}>
                  <td>{PERMISSION_ENTRY_LABELS[e.dataTypeId] ?? e.dataTypeId}</td>
                  <td>{e.iosKey ?? '—'}</td>
                  <td>{e.androidPermission ?? '—'}</td>
                  <td>{e.zh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="legal-resume-banner">
          <AlertTriangle size={16} aria-hidden="true" />
          <span>未在问卷中选择任何需要敏感权限说明的数据类型（如相册、位置、通讯录）。</span>
        </div>
      )}

      <div className="compliance-actions">
        <button className="ds-btn" disabled={entries.length === 0} onClick={() => copyText(renderInfoPlistSnippet(entries), m.actions.copiedIosPlist)}>
          <Copy size={14} aria-hidden="true" />
          <span>{m.actions.copyIosPlist}</span>
        </button>
        <button className="ds-btn" disabled={entries.length === 0} onClick={() => copyText(renderAndroidPermissionSnippet(entries), m.actions.copiedAndroidXml)}>
          <Copy size={14} aria-hidden="true" />
          <span>{m.actions.copyAndroidXml}</span>
        </button>
        <button className="ds-btn" onClick={() => { downloadBlob(buildPermissionMatrixMarkdown(privacyDraft), 'permission-matrix.md', 'text/markdown'); onToast(m.actions.downloadedMarkdown); }}>
          <Download size={14} aria-hidden="true" />
          <span>{m.actions.downloadMarkdown}</span>
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
      onToast(m.actions.copiedToClipboard);
    } catch {
      onToast(m.actions.copyFailed);
    }
  };

  return (
    <div className="compliance-row-body">
      <div className="legal-resume-banner">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>应用商店后台暂未开放隐私标签自动导入接口，请以开发者后台最新问卷界面为准，逐项核对下表进行勾选。</span>
      </div>

      {rows.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>数据类型</th>
                <th>苹果隐私标签分类</th>
                <th>建议勾选用途</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.dataTypeId}>
                  <td>{r.dataTypeLabel}</td>
                  <td>{NUTRITION_LABEL_CATEGORY_LABELS[r.category]}</td>
                  <td>{r.purposes.join('、')}</td>
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
          <span>{m.actions.copyToClipboard}</span>
        </button>
        <button className="ds-btn" disabled={rows.length === 0} onClick={() => { downloadBlob(renderNutritionLabelRowsToMarkdown(rows), 'nutrition-label-cheatsheet.md', 'text/markdown'); onToast(m.actions.downloadedMarkdown); }}>
          <Download size={14} aria-hidden="true" />
          <span>{m.actions.downloadMarkdown}</span>
        </button>
      </div>
    </div>
  );
}

function DeletionRow({ privacyDraft, onToast }: { privacyDraft: PrivacyDraft; onToast: (msg: string) => void }) {
  const sections = useMemo(() => buildAccountDeletionSections(privacyDraft), [privacyDraft]);
  const docTitle = m.rows.deletionTitle;

  return (
    <div className="compliance-row-body">
      <div className="legal-resume-banner">
        <AlertTriangle size={16} aria-hidden="true" />
        <span>苹果与安卓应用商店均强制要求提供独立的公开网页链接用于账号与数据注销，仅在完整隐私政策里提及是不够的；这份独立页面可用于单独部署。</span>
      </div>
      <DocPreview sections={sections} effectiveDate={privacyDraft.effectiveDate} />
      <div className="compliance-actions">
        <button className="ds-btn" onClick={() => { downloadBlob(renderSectionsToHtml(docTitle, privacyDraft.effectiveDate, sections), 'account-deletion.html', 'text/html'); onToast(m.actions.downloadedHtml); }}>
          <FileText size={14} aria-hidden="true" />
          <span>{m.actions.downloadHtml}</span>
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
        <span>应用商店后台的批量导入模板可能随版本更新变化，如导入失败请对照开发者后台最新模板核对列名。</span>
      </div>

      {rows.length > 0 ? (
        <div className="compliance-table-wrap">
          <table className="compliance-table">
            <thead>
              <tr>
                <th>数据类型</th>
                <th>是否收集</th>
                <th>是否共享给第三方</th>
                <th>处理用途</th>
                <th>用户是否可选</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.dataType}</td>
                  <td>{r.collected ? '是' : '否'}</td>
                  <td>{r.shared ? '是' : '否'}</td>
                  <td>{r.purpose}</td>
                  <td>{r.optional ? '是' : '否'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p style={{ fontSize: '12px', color: 'var(--ink-secondary)' }}>未在隐私政策问卷中选择任何数据类型。</p>
      )}

      <div className="compliance-actions">
        <button className="ds-btn" disabled={rows.length === 0} onClick={() => { downloadBlob(csv, 'data-safety.csv', 'text/csv'); onToast(m.actions.downloadedCsv); }}>
          <Download size={14} aria-hidden="true" />
          <span>{m.actions.downloadCsv}</span>
        </button>
      </div>
    </div>
  );
}
