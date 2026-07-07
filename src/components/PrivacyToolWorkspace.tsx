import { useState, useEffect, useMemo } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import {
  DATA_TYPE_CATALOG,
  SERVICE_CATALOG,
  DEFAULT_PRIVACY_DRAFT,
  DEFAULT_TERMS_DRAFT,
  PLATFORM_LABELS,
  buildPrivacyPolicySections,
  buildTermsOfUseSections,
} from '../utils/legalDocManager';
import type { PrivacyDraft, TermsDraft, CustomService } from '../utils/legalDocManager';
import { LegalResultView } from './LegalResultView';

type Mode = 'privacy' | 'terms';

interface StoredWizardState<T> {
  draft: T;
  step: number;
  done: boolean;
}

function loadState<T>(key: string, fallback: StoredWizardState<T>): StoredWizardState<T> {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return { ...fallback, ...parsed, draft: { ...fallback.draft, ...parsed.draft } };
  } catch {
    return fallback;
  }
}

const PRIVACY_STORAGE_KEY = 'mockup_app_privacy_wizard';
const TERMS_STORAGE_KEY = 'mockup_app_terms_wizard';

const PRIVACY_STEP_LABELS = ['App / 公司信息', '数据收集类型', '第三方服务', '合规选项', '生成结果'];
const TERMS_STEP_LABELS = ['App / 公司信息', '服务说明', '用户条款', '管辖权', '生成结果'];

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function isNonEmpty(draft: Record<string, unknown>): boolean {
  return Object.values(draft).some((v) => (typeof v === 'string' ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : !!v));
}

interface StepShellProps {
  labels: string[];
  currentStep: number;
  onJump: (step: number) => void;
  children: React.ReactNode;
}

function StepShell({ labels, currentStep, onJump, children }: StepShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      <ol className="legal-step-indicator" aria-label="向导进度">
        {labels.map((label, i) => {
          const step = i + 1;
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          return (
            <li key={label}>
              <button
                type="button"
                className={`legal-step-dot ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                onClick={() => isDone && onJump(step)}
                disabled={!isDone && !isCurrent}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isDone ? <Check size={12} aria-hidden="true" /> : step}
              </button>
              <span className="legal-step-label">{label}</span>
            </li>
          );
        })}
      </ol>
      {children}
    </div>
  );
}

function FieldGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="ds-input-group">
      <label className="ds-label">{label}{required ? ' *' : ''}</label>
      {children}
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="legal-checkbox-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function StepNav({ onBack, onNext, backLabel = '上一步', nextLabel = '下一步', nextDisabled }: {
  onBack?: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
      {onBack ? <button className="ds-btn" onClick={onBack}>{backLabel}</button> : <span />}
      <button className="ds-btn ds-btn-active" onClick={onNext} disabled={nextDisabled}>{nextLabel}</button>
    </div>
  );
}

function ResumeBanner({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  return (
    <div className="legal-resume-banner">
      <AlertTriangle size={16} aria-hidden="true" />
      <span>检测到未完成的草稿，是否继续上次编辑？</span>
      <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
        <button className="ds-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={onRestart}>重新开始</button>
        <button className="ds-btn ds-btn-active" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={onResume}>继续编辑</button>
      </div>
    </div>
  );
}

export function PrivacyToolWorkspace({ onToast }: { onToast: (msg: string) => void }) {
  const [mode, setMode] = useState<Mode>('privacy');

  const [privacyState, setPrivacyState] = useState<StoredWizardState<PrivacyDraft>>(() =>
    loadState(PRIVACY_STORAGE_KEY, { draft: DEFAULT_PRIVACY_DRAFT, step: 1, done: false })
  );
  const [termsState, setTermsState] = useState<StoredWizardState<TermsDraft>>(() =>
    loadState(TERMS_STORAGE_KEY, { draft: DEFAULT_TERMS_DRAFT, step: 1, done: false })
  );

  const [privacyResumeDismissed, setPrivacyResumeDismissed] = useState(false);
  const [termsResumeDismissed, setTermsResumeDismissed] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(privacyState)); } catch { /* quota exceeded */ }
  }, [privacyState]);

  useEffect(() => {
    try { localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(termsState)); } catch { /* quota exceeded */ }
  }, [termsState]);

  const showPrivacyResume = !privacyResumeDismissed && privacyState.step > 1 && !privacyState.done && isNonEmpty(privacyState.draft as unknown as Record<string, unknown>);
  const showTermsResume = !termsResumeDismissed && termsState.step > 1 && !termsState.done && isNonEmpty(termsState.draft as unknown as Record<string, unknown>);

  const updatePrivacyDraft = (fields: Partial<PrivacyDraft>) =>
    setPrivacyState((s) => ({ ...s, draft: { ...s.draft, ...fields } }));
  const updateTermsDraft = (fields: Partial<TermsDraft>) =>
    setTermsState((s) => ({ ...s, draft: { ...s.draft, ...fields } }));

  const privacySections = useMemo(() => buildPrivacyPolicySections(privacyState.draft), [privacyState.draft]);
  const termsSections = useMemo(() => buildTermsOfUseSections(termsState.draft), [termsState.draft]);

  const privacyStep1Valid = privacyState.draft.appName.trim().length > 0 && isValidEmail(privacyState.draft.contactEmail);
  const termsStep1Valid = termsState.draft.appName.trim().length > 0 && isValidEmail(termsState.draft.contactEmail);
  const termsStep2Valid = termsState.draft.serviceDescription.trim().length > 0;

  return (
    <div className="legal-workspace">
      <div className="legal-mode-switch" role="tablist" aria-label="选择生成器类型">
        <button
          role="tab"
          aria-selected={mode === 'privacy'}
          className={`ds-btn ${mode === 'privacy' ? 'ds-btn-active' : ''}`}
          onClick={() => setMode('privacy')}
        >
          隐私政策
        </button>
        <button
          role="tab"
          aria-selected={mode === 'terms'}
          className={`ds-btn ${mode === 'terms' ? 'ds-btn-active' : ''}`}
          onClick={() => setMode('terms')}
        >
          使用条款
        </button>
      </div>

      {mode === 'privacy' ? (
        <>
          {showPrivacyResume && (
            <ResumeBanner
              onResume={() => setPrivacyResumeDismissed(true)}
              onRestart={() => {
                setPrivacyState({ draft: DEFAULT_PRIVACY_DRAFT, step: 1, done: false });
                setPrivacyResumeDismissed(true);
              }}
            />
          )}

          {privacyState.done ? (
            <LegalResultView
              docTitle="Privacy Policy"
              effectiveDate={privacyState.draft.effectiveDate}
              sections={privacySections}
              fileBaseName="privacy-policy"
              onEdit={() => setPrivacyState((s) => ({ ...s, done: false, step: 4 }))}
              onToast={onToast}
            />
          ) : (
            <StepShell labels={PRIVACY_STEP_LABELS} currentStep={privacyState.step} onJump={(step) => setPrivacyState((s) => ({ ...s, step }))}>
              {privacyState.step === 1 && (
                <>
                  <FieldGroup label="App 名称" required>
                    <input className="ds-input" value={privacyState.draft.appName} onChange={(e) => updatePrivacyDraft({ appName: e.target.value })} placeholder="例如 MockupApp" />
                  </FieldGroup>
                  <FieldGroup label="公司名称（可选，默认使用 App 名称）">
                    <input className="ds-input" value={privacyState.draft.companyName} onChange={(e) => updatePrivacyDraft({ companyName: e.target.value })} />
                  </FieldGroup>
                  <FieldGroup label="官网 URL（可选）">
                    <input className="ds-input" value={privacyState.draft.websiteUrl} onChange={(e) => updatePrivacyDraft({ websiteUrl: e.target.value })} placeholder="https://" />
                  </FieldGroup>
                  <FieldGroup label="联系邮箱" required>
                    <input className="ds-input" value={privacyState.draft.contactEmail} onChange={(e) => updatePrivacyDraft({ contactEmail: e.target.value })} placeholder="support@example.com" />
                  </FieldGroup>
                  <FieldGroup label="生效日期">
                    <input type="date" className="ds-input" value={privacyState.draft.effectiveDate} onChange={(e) => updatePrivacyDraft({ effectiveDate: e.target.value })} />
                  </FieldGroup>
                  <FieldGroup label="平台">
                    <select className="ds-select" value={privacyState.draft.platform} onChange={(e) => updatePrivacyDraft({ platform: e.target.value as PrivacyDraft['platform'] })}>
                      {Object.entries(PLATFORM_LABELS).map(([id, label]) => (
                        <option key={id} value={id}>{label}</option>
                      ))}
                    </select>
                  </FieldGroup>
                  <StepNav nextDisabled={!privacyStep1Valid} onNext={() => setPrivacyState((s) => ({ ...s, step: 2 }))} />
                </>
              )}

              {privacyState.step === 2 && (
                <>
                  <div className="legal-checkbox-grid">
                    {DATA_TYPE_CATALOG.map((d) => (
                      <CheckboxRow
                        key={d.id}
                        label={d.label}
                        checked={privacyState.draft.dataTypes.includes(d.id)}
                        onChange={(checked) => updatePrivacyDraft({
                          dataTypes: checked ? [...privacyState.draft.dataTypes, d.id] : privacyState.draft.dataTypes.filter((id) => id !== d.id),
                        })}
                      />
                    ))}
                  </div>
                  <FieldGroup label="其他数据类型（可选，用逗号分隔）">
                    <input className="ds-input" value={privacyState.draft.customDataTypes} onChange={(e) => updatePrivacyDraft({ customDataTypes: e.target.value })} />
                  </FieldGroup>
                  <StepNav onBack={() => setPrivacyState((s) => ({ ...s, step: 1 }))} onNext={() => setPrivacyState((s) => ({ ...s, step: 3 }))} />
                </>
              )}

              {privacyState.step === 3 && (
                <>
                  {SERVICE_CATALOG.map((group) => (
                    <div key={group.category} style={{ marginBottom: '8px' }}>
                      <span className="ds-label" style={{ display: 'block', marginBottom: '6px' }}>{group.category}</span>
                      <div className="legal-checkbox-grid">
                        {group.services.map((svc) => (
                          <CheckboxRow
                            key={svc.id}
                            label={svc.label}
                            checked={privacyState.draft.services.includes(svc.id)}
                            onChange={(checked) => updatePrivacyDraft({
                              services: checked ? [...privacyState.draft.services, svc.id] : privacyState.draft.services.filter((id) => id !== svc.id),
                            })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  <CustomServiceEditor
                    services={privacyState.draft.customServices}
                    onChange={(customServices) => updatePrivacyDraft({ customServices })}
                  />
                  <StepNav onBack={() => setPrivacyState((s) => ({ ...s, step: 2 }))} onNext={() => setPrivacyState((s) => ({ ...s, step: 4 }))} />
                </>
              )}

              {privacyState.step === 4 && (
                <>
                  <CheckboxRow label="适用 GDPR（欧盟 / 英国用户）" checked={privacyState.draft.gdpr} onChange={(v) => updatePrivacyDraft({ gdpr: v })} />
                  <CheckboxRow label="适用 CCPA（加州用户）" checked={privacyState.draft.ccpa} onChange={(v) => updatePrivacyDraft({ ccpa: v })} />
                  <CheckboxRow label="面向 13 岁以下儿童 / 需遵守 COPPA" checked={privacyState.draft.coppa} onChange={(v) => updatePrivacyDraft({ coppa: v })} />
                  <CheckboxRow label="App 内支持用户账号注册" checked={privacyState.draft.hasUserAccounts} onChange={(v) => updatePrivacyDraft({ hasUserAccounts: v })} />
                  {privacyState.draft.hasUserAccounts && (
                    <FieldGroup label="账号 / 数据删除说明（可选，留空使用通用表述）">
                      <textarea className="ds-input" rows={2} value={privacyState.draft.deletionInstructions} onChange={(e) => updatePrivacyDraft({ deletionInstructions: e.target.value })} placeholder="例如：前往「设置 > 账号 > 删除账号」，或发邮件至联系邮箱申请删除" />
                    </FieldGroup>
                  )}
                  <FieldGroup label="数据保留期限（可选，留空使用默认表述）">
                    <textarea className="ds-input" rows={3} value={privacyState.draft.retention} onChange={(e) => updatePrivacyDraft({ retention: e.target.value })} />
                  </FieldGroup>
                  <FieldGroup label="适用法律 / 管辖地区（可选，留空使用通用表述）">
                    <input className="ds-input" value={privacyState.draft.governingLaw} onChange={(e) => updatePrivacyDraft({ governingLaw: e.target.value })} placeholder="例如 the State of Delaware, United States" />
                  </FieldGroup>
                  <StepNav
                    nextLabel="生成"
                    onBack={() => setPrivacyState((s) => ({ ...s, step: 3 }))}
                    onNext={() => setPrivacyState((s) => ({ ...s, done: true }))}
                  />
                </>
              )}
            </StepShell>
          )}
        </>
      ) : (
        <>
          {showTermsResume && (
            <ResumeBanner
              onResume={() => setTermsResumeDismissed(true)}
              onRestart={() => {
                setTermsState({ draft: DEFAULT_TERMS_DRAFT, step: 1, done: false });
                setTermsResumeDismissed(true);
              }}
            />
          )}

          {termsState.done ? (
            <LegalResultView
              docTitle="Terms of Use"
              effectiveDate={termsState.draft.effectiveDate}
              sections={termsSections}
              fileBaseName="terms-of-use"
              onEdit={() => setTermsState((s) => ({ ...s, done: false, step: 4 }))}
              onToast={onToast}
            />
          ) : (
            <StepShell labels={TERMS_STEP_LABELS} currentStep={termsState.step} onJump={(step) => setTermsState((s) => ({ ...s, step }))}>
              {termsState.step === 1 && (
                <>
                  <FieldGroup label="App 名称" required>
                    <input className="ds-input" value={termsState.draft.appName} onChange={(e) => updateTermsDraft({ appName: e.target.value })} placeholder="例如 MockupApp" />
                  </FieldGroup>
                  <FieldGroup label="公司名称（可选，默认使用 App 名称）">
                    <input className="ds-input" value={termsState.draft.companyName} onChange={(e) => updateTermsDraft({ companyName: e.target.value })} />
                  </FieldGroup>
                  <FieldGroup label="官网 URL（可选）">
                    <input className="ds-input" value={termsState.draft.websiteUrl} onChange={(e) => updateTermsDraft({ websiteUrl: e.target.value })} placeholder="https://" />
                  </FieldGroup>
                  <FieldGroup label="联系邮箱" required>
                    <input className="ds-input" value={termsState.draft.contactEmail} onChange={(e) => updateTermsDraft({ contactEmail: e.target.value })} placeholder="support@example.com" />
                  </FieldGroup>
                  <FieldGroup label="生效日期">
                    <input type="date" className="ds-input" value={termsState.draft.effectiveDate} onChange={(e) => updateTermsDraft({ effectiveDate: e.target.value })} />
                  </FieldGroup>
                  <StepNav nextDisabled={!termsStep1Valid} onNext={() => setTermsState((s) => ({ ...s, step: 2 }))} />
                </>
              )}

              {termsState.step === 2 && (
                <>
                  <FieldGroup label="用一段话描述你的 App 做什么" required>
                    <textarea className="ds-input" rows={4} value={termsState.draft.serviceDescription} onChange={(e) => updateTermsDraft({ serviceDescription: e.target.value })} placeholder="例如：MockupApp 帮助开发者在浏览器中一站式生成应用商店截图、图标与合规文档。" />
                  </FieldGroup>
                  <StepNav nextDisabled={!termsStep2Valid} onBack={() => setTermsState((s) => ({ ...s, step: 1 }))} onNext={() => setTermsState((s) => ({ ...s, step: 3 }))} />
                </>
              )}

              {termsState.step === 3 && (
                <>
                  <CheckboxRow label="需要用户注册账号" checked={termsState.draft.requiresAccount} onChange={(v) => updateTermsDraft({ requiresAccount: v })} />
                  <CheckboxRow label="包含用户生成内容 (UGC)" checked={termsState.draft.hasUGC} onChange={(v) => updateTermsDraft({ hasUGC: v })} />
                  <CheckboxRow label="包含订阅 / App 内购买" checked={termsState.draft.hasSubscriptions} onChange={(v) => updateTermsDraft({ hasSubscriptions: v })} />
                  <StepNav onBack={() => setTermsState((s) => ({ ...s, step: 2 }))} onNext={() => setTermsState((s) => ({ ...s, step: 4 }))} />
                </>
              )}

              {termsState.step === 4 && (
                <>
                  <FieldGroup label="适用法律 / 争议解决地区（可选，留空使用通用表述）">
                    <input className="ds-input" value={termsState.draft.governingLaw} onChange={(e) => updateTermsDraft({ governingLaw: e.target.value })} placeholder="例如 the State of Delaware, United States" />
                  </FieldGroup>
                  <FieldGroup label="最低使用年龄（默认 13）">
                    <input type="number" min={0} className="ds-input" value={termsState.draft.minimumAge} onChange={(e) => updateTermsDraft({ minimumAge: e.target.value })} />
                  </FieldGroup>
                  <StepNav
                    nextLabel="生成"
                    onBack={() => setTermsState((s) => ({ ...s, step: 3 }))}
                    onNext={() => setTermsState((s) => ({ ...s, done: true }))}
                  />
                </>
              )}
            </StepShell>
          )}
        </>
      )}
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
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input className="ds-input" placeholder="服务名称" value={s.name} onChange={(e) => updateRow(i, { name: e.target.value })} />
          <input className="ds-input" placeholder="隐私政策链接（可选）" value={s.url} onChange={(e) => updateRow(i, { url: e.target.value })} />
          <button className="ds-btn ds-btn-icon-only" onClick={() => removeRow(i)} aria-label="删除">×</button>
        </div>
      ))}
      <button className="ds-btn" style={{ fontSize: '12px', padding: '4px 10px' }} onClick={addRow}>+ 添加自定义服务</button>
    </div>
  );
}
