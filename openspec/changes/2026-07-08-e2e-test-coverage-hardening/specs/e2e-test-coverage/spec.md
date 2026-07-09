## ADDED Requirements

### Requirement: Per-capability test file organization
The system's Playwright test suite SHALL be organized into multiple spec files aligned with `openspec/specs/` capability boundaries, sharing common setup via fixtures, instead of a single monolithic spec file.

#### Scenario: Locate tests for a capability
- **WHEN** a contributor modifies the `advanced-templates` capability
- **THEN** the corresponding Playwright coverage lives in a dedicated spec file (or clearly-named `test.describe` block) discoverable without reading unrelated tool tests.

#### Acceptance Criteria
- [ ] `tests/` contains more than one spec file, split along capability/tool boundaries
- [ ] Common setup (localStorage reset, sample screenshot upload) is extracted into a shared fixture/helper, not duplicated per file
- [ ] The 9 pre-existing test cases in `tests/mockup-app.spec.ts` remain present (possibly relocated) with unchanged assertions

### Requirement: Canvas customization coverage
The test suite SHALL exercise the background, effects, typography, and device-shell customization behaviors documented in `advanced-templates` and `customization-controls`.

#### Scenario: Background type and effects
- **WHEN** the user switches background type (Solid/Gradient/Image), toggles Frosted Glass, or adjusts the background blur slider
- **THEN** a Playwright test verifies the corresponding UI control state changes and no console errors are thrown by the canvas redraw.

#### Scenario: Typography and device shell
- **WHEN** the user selects a different title font or swaps the device shell (iPhone Dark/Light, iPad Pro, Google Pixel)
- **THEN** a Playwright test verifies the selection is reflected in the corresponding control's active state.

#### Acceptance Criteria
- [ ] Test cases exist for background type switch, frosted glass toggle, and blur slider
- [ ] Test cases exist for font selector and device shell selector

### Requirement: Skew/rotate and panoramic background coverage
The test suite SHALL exercise the 2.5D skew/rotate controls from `skew-and-floating` and the multi-page slicing behavior from `panoramic-background`.

#### Scenario: Rotate and skew sliders
- **WHEN** the user adjusts the rotation angle and skewX sliders
- **THEN** a Playwright test verifies the canvas remains interactive and no errors are logged.

#### Scenario: Panoramic background slicing
- **WHEN** the user enables the global panoramic background and uploads a wide image across a multi-page layout
- **THEN** a Playwright test verifies each page's rendered background differs (e.g., by comparing canvas data or a page-specific indicator), consistent with per-page slicing.

#### Acceptance Criteria
- [ ] Test case exists for rotate/skew sliders
- [ ] Test case exists for panoramic background enabling and multi-page verification

### Requirement: Export ZIP content verification
The test suite SHALL verify the structural contents of exported ZIP files for `multi-size-export` and `icon-export`, not only the downloaded filename.

#### Scenario: Multi-size screenshot export structure
- **WHEN** the user selects multiple export sizes and downloads the screenshots ZIP
- **THEN** a Playwright test parses the downloaded ZIP (via `jszip`) and asserts the expected per-size subfolders (e.g., `ios/iphone_6.9/`) exist and contain files.

#### Scenario: Icon export structure
- **WHEN** the user exports the icon set ZIP
- **THEN** a Playwright test parses the downloaded ZIP and asserts `ios/AppIcon.appiconset/Contents.json` and an `android/` folder exist.

#### Acceptance Criteria
- [ ] `multi-size-export` test asserts ZIP subfolder structure via `jszip`
- [ ] `icon-export` test asserts `Contents.json` and Android folder presence via `jszip`

### Requirement: Extended privacy-policy-generator coverage
The test suite SHALL cover step-back navigation, custom third-party services, draft persistence, and the Terms of Use flow described in `privacy-policy-generator`.

#### Scenario: Step-back navigation preserves data
- **WHEN** the user completes steps 1-2, navigates to step 3, then clicks step 1's indicator
- **THEN** a Playwright test verifies step 1's fields still hold their previously entered values.

#### Scenario: Custom third-party service
- **WHEN** the user adds a custom third-party service via name and optional URL
- **THEN** a Playwright test verifies the generated document includes a disclosure paragraph for it.

#### Scenario: Draft resume banner
- **WHEN** the user partially fills the wizard and reloads the page
- **THEN** a Playwright test verifies a "继续编辑/重新开始" banner appears.

#### Scenario: Terms of Use full flow
- **WHEN** the user completes the Terms of Use wizard and downloads it as Markdown or copies it to the clipboard
- **THEN** a Playwright test verifies the download/clipboard action succeeds.

#### Acceptance Criteria
- [ ] Step-back navigation test exists and passes
- [ ] Custom third-party service test exists and passes
- [ ] Draft persistence/resume banner test exists and passes
- [ ] Terms of Use full-flow (Markdown + clipboard) test exists and passes

### Requirement: Accessibility and responsive coverage
The test suite SHALL verify the accessibility and responsive acceptance criteria already documented in `ui-quality-hardening`, and the theme toggle from `workspace-scaffold`.

#### Scenario: Export modal accessibility
- **WHEN** the export modal is opened
- **THEN** a Playwright test verifies `role="dialog"`, `aria-modal="true"`, that focus is trapped inside the modal, and that pressing Escape closes it.

#### Scenario: Accordion ARIA state
- **WHEN** a SectionAccordion header is toggled
- **THEN** a Playwright test verifies `aria-expanded` reflects the open/closed state.

#### Scenario: Theme toggle
- **WHEN** the user clicks the theme toggle button
- **THEN** a Playwright test verifies the active theme class changes.

#### Scenario: Mobile viewport sidebar behavior
- **WHEN** the suite runs under a dedicated mobile-viewport Playwright project (<768px)
- **THEN** a test verifies both sidebars are collapsed by default and can be opened as overlay drawers via the existing header buttons.

#### Acceptance Criteria
- [ ] Export modal accessibility test exists and passes
- [ ] Accordion `aria-expanded` test exists and passes
- [ ] Theme toggle test exists and passes
- [ ] A mobile-viewport Playwright project exists in `playwright.config.ts` with a passing sidebar-drawer test

### Requirement: Test isolation via storage reset
The test suite SHALL reset persisted browser storage between test cases to prevent state leakage across custom presets and privacy-policy drafts.

#### Scenario: No leakage between tests
- **WHEN** one test creates a custom preset or a privacy-policy draft
- **THEN** a subsequent, unrelated test does not observe that preset/draft (localStorage is reset in `beforeEach` or via an isolated browser context).

#### Acceptance Criteria
- [ ] `localStorage` is explicitly cleared before each test (or each test uses an isolated context)
- [ ] Running the full suite in any order produces consistent, non-flaky results
