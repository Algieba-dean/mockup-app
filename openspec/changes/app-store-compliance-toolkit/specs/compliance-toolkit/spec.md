## ADDED Requirements

### Requirement: Compliance Toolkit as a third segmented mode with a checklist entry point
The system SHALL provide a third segmented mode ("合规工具箱" / Compliance Toolkit) alongside the existing Privacy Policy and Terms of Use modes, rendered as a single aggregated page (not a step wizard) whose entry point is a flat checkbox list of the five compliance outputs, all unchecked by default, that consumes data already captured by the other two modes.

#### Scenario: Switch into the Compliance Toolkit mode
- **WHEN** the user selects "合规工具箱" in the segmented control
- **THEN** the workspace renders a single page listing five checkbox rows (one per compliance output), all unchecked, with no step indicator and no "next step" gating.

### Requirement: Checkbox-driven accordion disclosure
The system SHALL treat each checkbox as an accordion toggle: checking a row immediately expands it in place to reveal that output's content (any supplementary question, the live preview, and its copy/download actions); unchecking a row immediately collapses it back to a single label line.

#### Scenario: Check a row to expand it
- **WHEN** the user checks the "Custom EULA" row
- **THEN** the row expands in place directly below the checkbox, without navigating away or opening a modal, showing the EULA content live.

#### Scenario: Uncheck a row to collapse it
- **WHEN** the user unchecks an already-expanded row
- **THEN** the row collapses back to a single label line and no longer occupies vertical space for its content.

#### Scenario: Multiple rows expanded simultaneously
- **WHEN** the user has checked three of the five rows
- **THEN** all three remain expanded at once (independent accordion state per row, not mutually exclusive), each showing its own content and actions.

### Requirement: No smart pre-selection
The system SHALL leave all five checkboxes unchecked by default regardless of the content of the Privacy Policy or Terms of Use drafts, requiring the user to actively opt into each output rather than guessing relevance on their behalf.

#### Scenario: Open toolkit with an ad SDK already selected in the Privacy wizard
- **WHEN** the user has already selected "AdMob" in the Privacy Policy wizard and then opens the Compliance Toolkit
- **THEN** the "ATT 与权限话术矩阵" checkbox is still unchecked by default; the system does not auto-check it on the user's behalf.

### Requirement: Read-only aggregation of existing wizard drafts
The system SHALL read the persisted Privacy Policy draft (`mockup_app_privacy_wizard`) and Terms of Use draft (`mockup_app_terms_wizard`) to populate the Compliance Toolkit outputs, without writing back to or mutating either draft.

#### Scenario: Aggregate already-filled data
- **WHEN** the user has previously filled in data types, third-party services, and UGC/account fields in the Privacy Policy and Terms of Use wizards, then checks a Compliance Toolkit row
- **THEN** that row's expanded content uses those values directly without re-prompting the user for the same information.

### Requirement: Empty-state guidance when prerequisite drafts are missing
The system SHALL detect when both the Privacy Policy and Terms of Use drafts are empty and, in that case, show guidance directing the user to complete at least one of the two wizards first, inside any row the user expands, instead of rendering a generation/download action on empty data.

#### Scenario: Expand a row before completing any wizard
- **WHEN** the user opens the Compliance Toolkit mode without having entered any data in the Privacy Policy or Terms of Use wizards and checks any of the five rows
- **THEN** the expanded row shows a guidance message with a button to jump to the Privacy Policy wizard, and no copy/download actions are rendered.

### Requirement: Unified high-risk app type selector embedded in the Custom EULA row
The system SHALL provide a single-select question "你的 App 属于哪种高风险类型？" with options None, AI-generated, Health/Medical, and UGC Community, embedded at the top of the expanded "Custom EULA" row only (not shown globally or on the other four rows), persisted in a dedicated Compliance Toolkit storage key (`mockup_app_compliance_toolkit`).

#### Scenario: Select a high-risk type
- **WHEN** the user has checked the "Custom EULA" row and selects "UGC 社区" in the embedded high-risk type selector
- **THEN** the selection is persisted to `mockup_app_compliance_toolkit`, and the same expanded row immediately re-renders its preview to reflect the UGC-specific mandatory clauses.

#### Scenario: Default to none
- **WHEN** the user has never interacted with the high-risk type selector
- **THEN** it defaults to "无" (None) and the Custom EULA row produces the same output as the standard Terms of Use baseline clauses with no extra risk-specific clauses.

### Requirement: Bundled ZIP download for multiple selections
The system SHALL show a "打包下载 ZIP" action once the user has checked two or more rows, which bundles each checked row's downloadable file output into a single ZIP archive using the project's existing `jszip` dependency; this action SHALL NOT appear when zero or one row is checked.

#### Scenario: Two or more rows checked
- **WHEN** the user has checked the "Custom EULA" and "账号与数据注销页" rows
- **THEN** a "打包下载 ZIP" button appears below the checklist, and clicking it downloads a single ZIP containing both rows' generated files.

#### Scenario: Only one row checked
- **WHEN** the user has checked exactly one row
- **THEN** no "打包下载 ZIP" button is shown; the user downloads that row's file directly from its own action row.

### Requirement: Persisted checklist and expansion state
The system SHALL persist which of the five rows are checked/expanded to `mockup_app_compliance_toolkit`, so that reloading the page restores the same checked and expanded rows.

#### Scenario: Reload after checking rows
- **WHEN** the user has checked and expanded two rows, then reloads the page
- **THEN** the same two rows are checked and expanded on reload, matching the state left before reload.
