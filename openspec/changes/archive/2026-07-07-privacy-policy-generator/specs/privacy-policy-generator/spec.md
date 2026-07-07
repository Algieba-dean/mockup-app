## ADDED Requirements

### Requirement: Independent tool tab with full-bleed wizard layout
The system SHALL provide a standalone "隐私与条款" tool tab in the top navigation, rendering a full-bleed page (no left/right side panels) instead of the 3-panel canvas workspace used by other tools.

#### Scenario: Switch to the privacy tool
- **WHEN** the user clicks "隐私与条款" in the top navigation
- **THEN** the main workspace renders a single full-width column with no `LeftSidebar`/`RightPropertiesPanel`, and the header hides the undo/redo, export ZIP, and sidebar-collapse controls that don't apply to this tool.

### Requirement: Independent Privacy Policy and Terms of Use sub-generators
The system SHALL provide two independent step-wizard sub-generators (Privacy Policy, Terms of Use) switchable via a segmented control, each retaining its own draft and step state.

#### Scenario: Switch sub-mode without losing progress
- **WHEN** the user has partially completed the Privacy Policy wizard and switches to the Terms of Use segmented tab
- **THEN** the Terms of Use wizard starts fresh (or resumes its own saved draft) and switching back to Privacy Policy preserves the exact step and field values left behind.

### Requirement: Step-by-step wizard with validation gating
The system SHALL walk the user through an ordered set of steps per sub-generator, blocking advancement until required fields are valid, while allowing free navigation back to already-completed steps.

#### Scenario: Required field validation
- **WHEN** the user is on step 1 (App/公司信息) without a valid app name or contact email
- **THEN** the "下一步" button stays disabled until both fields are filled with a valid-looking email.

#### Scenario: Jump back to a completed step
- **WHEN** the user has completed steps 1-2 and is on step 3
- **THEN** clicking step 1 or 2's indicator dot navigates back to that step without losing any data from step 3.

### Requirement: Data collection and third-party service disclosure catalog
The system SHALL provide a curated catalog of personal data types and third-party services (grouped by category) that the user can select, with each selection generating a corresponding disclosure paragraph in the final document, plus a custom-entry escape hatch for services not in the catalog.

#### Scenario: Select a cataloged third-party service
- **WHEN** the user checks "Google Analytics (GA4)" in the Third-Party Services step
- **THEN** the generated Privacy Policy includes a paragraph disclosing the use of Google Analytics (GA4) with a link to its official privacy policy.

#### Scenario: Add a custom service
- **WHEN** the user adds a custom service via name + optional URL that isn't in the catalog
- **THEN** the generated document includes a corresponding disclosure paragraph for that custom service.

### Requirement: Conditional compliance sections
The system SHALL append GDPR, CCPA, and COPPA-specific sections to the generated Privacy Policy only when the corresponding toggle is enabled, and otherwise fall back to standard non-jurisdiction-specific language.

#### Scenario: Enable GDPR
- **WHEN** the user enables the GDPR toggle in the Compliance Options step
- **THEN** the generated Privacy Policy includes a "Your GDPR Data Protection Rights" section describing data subject rights and legal basis of processing.

### Requirement: Baseline sections always present
The system SHALL always include a set of baseline Privacy Policy sections regardless of user selections: Log Data (IP address/device metadata logging), Do Not Track Signals, International Data Transfers, Account and Data Deletion, and Governing Law. The Terms of Use SHALL always include: Eligibility (minimum age), Feedback, Indemnification, Severability, and Entire Agreement.

#### Scenario: Log Data baseline
- **WHEN** a Privacy Policy is generated regardless of which data-type checkboxes were selected
- **THEN** the document includes a "Log Data" section describing IP address and device metadata collection.

#### Scenario: Account and Data Deletion wording adapts to app type
- **WHEN** the user enables "App 内支持用户账号注册" in the Compliance Options step
- **THEN** the "Account and Data Deletion" section describes how to request account/data deletion (using the user's custom instructions if provided, otherwise a generic contact-us fallback); when disabled, the section states no persistent account is required.

#### Scenario: Platform-aware introduction
- **WHEN** the user selects a platform (iOS / Android / iOS+Android / Web) in step 1
- **THEN** the Privacy Policy's Introduction section refers to the app using the corresponding noun (e.g. "iOS and Android app").

### Requirement: Multi-format document export
The system SHALL let the user copy the generated document to the clipboard, or download it as a standalone HTML file or a Markdown file, entirely client-side with no network calls.

#### Scenario: Download generated Privacy Policy as HTML
- **WHEN** the user clicks "下载 HTML" on the Result screen
- **THEN** the browser downloads a self-contained `privacy-policy.html` file with inlined styles that can be deployed to any static host.

### Requirement: Draft persistence and resume
The system SHALL persist each sub-generator's draft and step progress to localStorage independently, and offer to resume or discard an in-progress draft on return.

#### Scenario: Resume an in-progress draft
- **WHEN** the user returns to the Privacy Policy wizard after previously filling in step 1-2 without generating a result
- **THEN** a banner offers "继续编辑" (resume, keeping all fields and current step) or "重新开始" (discard and reset to step 1 with default values).
