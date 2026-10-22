# ui-quality-hardening Specification

**Status**: ✅ Completed (2025-07-07)  
**Final audit score**: 19/20 (up from 10/20)  
**Commits**: `319dabb` (P1-P2 + P1-P4), `a18dfed` (P3 polish)

## Purpose
Address all findings from the impeccable audit (score: 10/20) to bring MockupApp's technical quality to production-grade. This covers accessibility, responsive design, performance optimization, and design token consistency. Each phase maps to a specific impeccable command for execution.

## Non-goals
- No new features or user-facing functionality changes.
- No canvas rendering logic changes (canvasManager.ts internals stay as-is).
- No backend or deployment changes.

## Phase 1: Responsive Adaptation (P1)
**Command**: `/impeccable adapt src/`

### Requirement: Mobile/tablet responsive layout
The system SHALL adapt its layout for viewports below 768px.

#### Scenario: Sidebar collapse on mobile
- **WHEN** the viewport width is below 768px
- **THEN** both sidebars collapse by default and become overlay drawers toggled via existing header buttons.

#### Scenario: Touch target compliance
- **WHEN** rendering on a touch device
- **THEN** all interactive elements (buttons, checkboxes, color swatches) meet the 44×44px minimum touch target size (WCAG 2.5.8).

#### Scenario: Viewport container reflow
- **WHEN** the viewport is narrower than 768px
- **THEN** the AssetDock remains visible at the bottom, and the canvas viewport fills the remaining vertical space.

### Acceptance Criteria
- [x] At least one `@media` breakpoint at `max-width: 768px` in `index.css`
- [x] All buttons ≥ 44×44px on mobile (including zoom controls 28→44, delete button 16→44, color swatches 24→44)
- [x] No horizontal overflow at 375px viewport width
- [x] `tsc --noEmit` passes
- [x] Intermediate tablet breakpoint at `769-1024px` added

## Phase 2: Accessibility Hardening (P1)
**Command**: `/impeccable harden src/`

### Requirement: ARIA attributes on interactive elements
The system SHALL provide proper ARIA attributes for screen reader accessibility.

#### Scenario: Icon-only buttons have labels
- **WHEN** a button contains only an icon (no visible text)
- **THEN** it has an `aria-label` attribute describing its action.

#### Scenario: Accordion sections announce state
- **WHEN** a SectionAccordion header is focused
- **THEN** it has `aria-expanded` reflecting its open/closed state and `aria-controls` pointing to the content panel.

#### Scenario: Export modal is accessible
- **WHEN** the export modal opens
- **THEN** it has `role="dialog"`, `aria-modal="true"`, focus is trapped inside, and pressing Escape closes it.

### Requirement: Label-input associations
The system SHALL associate all `<label>` elements with their corresponding inputs.

#### Scenario: Clicking a label focuses its input
- **WHEN** a user clicks any label in RightPropertiesPanel
- **THEN** the associated input/select/range receives focus (via `htmlFor`/`id` pairing).

### Requirement: Reduced motion support
The system SHALL respect the user's `prefers-reduced-motion` preference.

#### Scenario: Animations disabled
- **WHEN** the user has `prefers-reduced-motion: reduce` set in their OS
- **THEN** all CSS transitions and animations are reduced to ≤1ms duration.

### Requirement: Focus visibility
The system SHALL provide visible focus indicators on all interactive elements.

#### Scenario: Keyboard tab navigation
- **WHEN** a user navigates via Tab key
- **THEN** every focusable element shows a visible `outline` ring (not just `border-color` change).

### Acceptance Criteria
- [x] All icon-only buttons have `aria-label`
- [x] SectionAccordion has `aria-expanded` and `aria-controls`
- [x] Export modal has `role="dialog"`, `aria-modal="true"`, focus trap, Escape handler
- [x] 16 labels have `htmlFor` with matching `id` on inputs
- [x] `@media (prefers-reduced-motion: reduce)` rule in `index.css`
- [x] `:focus-visible` outline rule on `.ds-btn`, `.ds-input`, `.ds-select`
- [x] `alt` attribute on all `<img>` elements
- [x] `<main>` landmark element wrapping viewport
- [x] Focus trap (reusable `FocusTrap` component) on all 3 modal types
- [x] `prompt()` replaced with custom styled input dialog
- [x] `tsc --noEmit` passes

## Phase 3: Performance Optimization (P2)
**Command**: `/impeccable optimize src/`

### Requirement: Debounced canvas redraw
The system SHALL debounce canvas redraws to avoid per-keystroke rendering.

#### Scenario: Typing in title field
- **WHEN** the user types in the title or subtitle input
- **THEN** the canvas redraw is deferred by 150-200ms after the last keystroke.

### Requirement: Font loading optimization
The system SHALL load Google Fonts without blocking first paint.

#### Scenario: Initial page load
- **WHEN** the app loads for the first time
- **THEN** fonts are loaded via `<link rel="preload">` or `<link rel="stylesheet">` in `index.html` (not CSS `@import`), with `font-display: swap`.

### Requirement: Component memoization
The system SHALL avoid unnecessary re-renders of child components.

#### Scenario: Changing a slider value
- **WHEN** the user adjusts a single slider in RightPropertiesPanel
- **THEN** only the affected component and the canvas re-render; other sidebar sections do not re-render.

### Acceptance Criteria
- [x] Canvas redraw debounced (150ms) for text input changes
- [x] Google Fonts loaded via `<link>` in `index.html`, not CSS `@import`
- [x] Key setter functions wrapped in `useCallback` (`handleUploadScreenshot`, `handleDeletePage`)
- [x] Child components wrapped in `React.memo` (`AppHeader`, `CanvasViewport`, `AssetDock`)
- [x] `npm run build` passes

## Phase 4: Design Token Polish (P2)
**Command**: `/impeccable polish src/`

### Requirement: Replace hard-coded colors with tokens
The system SHALL use CSS custom properties for all color values.

#### Scenario: Theme switch
- **WHEN** the user toggles between light and dark theme
- **THEN** all UI elements (including modal backdrops, shadows, overlays) correctly reflect the active theme.

### Requirement: Semantic z-index scale
The system SHALL define a tokenized z-index scale in CSS custom properties.

#### Scenario: Layering consistency
- **WHEN** overlays, modals, and tooltips are displayed
- **THEN** they use named z-index tokens (`--z-sticky`, `--z-overlay`, `--z-modal`) instead of magic numbers like `9998`/`9999`.

### Requirement: Replace native browser dialogs
The system SHALL use custom styled dialogs instead of `confirm()`/`alert()`.

#### Scenario: Deleting a page
- **WHEN** the user clicks delete on a page in AssetDock
- **THEN** a styled inline confirmation dialog appears (using `ds-panel` styling) instead of a browser `confirm()` popup.

### Acceptance Criteria
- [x] Zero hard-coded `rgba()`/`#fff`/`#000` in `.tsx` component inline styles (1 intentional exception for gradient contrast)
- [x] Z-index tokens (`--z-base/sticky/overlay/modal/toast`) defined in `:root` and used throughout
- [x] `confirm()` and `alert()` replaced with custom styled dialogs + toast notification
- [x] `npm run build` passes

## Phase 5: Final Polish Pass (P3)
**Command**: `/impeccable polish src/`

### Requirement: Holistic quality verification
The system SHALL pass a re-run of `/impeccable audit` with score ≥ 16/20.

#### Scenario: Re-audit
- **WHEN** `/impeccable audit` is re-run after all phases complete
- **THEN** the score is ≥ 16/20 (Good) with zero P0 or P1 findings.

### Acceptance Criteria
- [x] `/impeccable audit` score ≥ 16/20 (achieved 19/20)
- [x] `/impeccable detect` returns 0 findings
- [x] All prior phase acceptance criteria still pass
- [x] `npm run build` passes

---

## Phase 6: Editorial Craft, i18n Pure-Locale & Interaction Architecture Rules

### Requirement 1: Centralized i18n & Pure-Locale Consistency
The system SHALL manage all user-facing strings via `src/i18n/index.ts` (`getMessages`, `formatMessage`, `Locale`) and prohibit mixed-language strings within a single locale.
- Under `zh-CN`, all navigation items, buttons, modal labels, device model names, default slide titles/subtitles, and generated compliance documents MUST be written in pure Chinese without untranslated English fragments.

### Requirement 2: Editorial Output Craft & Canvas Concurrency Safety
- **CJK-Aware Wrapping**: Canvas `Textbox` instances MUST enable `splitByGrapheme` only when CJK characters are present (`containsCjkCharacters`), preserving whole-word wrapping for Latin text.
- **Micro-Typography & Alignment**: Display titles SHALL use tightened line-height (`1.08`) and letter-spacing (`charSpacing: -15`), and support left/center/right alignment as well as auto-contrast or custom text color.
- **Region-Quantized Smart Palette**: `extractPaletteFromImage` SHALL sample top/middle/bottom regional means and soften excessive saturation for editorial backgrounds instead of sampling 3 fixed pixels.
- **Monochrome Selection Handles & Center Snapping**: Fabric.js objects SHALL use high-contrast black/white rectangular handles (`MONOCHROME_CONTROL_PROPS`) and snap to the horizontal canvas center (`±18px`) with a visible center guide line.
- **Concurrency Guard**: `updateCanvas` MUST guard async image loading with a monotonically increasing `renderGeneration` counter and validate CSS color strings before passing them to Canvas gradients.

### Requirement 3: Workspace Synchronization, History Coalescing & Deduplicated Storage
- **Multi-Aspect Preview Switcher**: The viewport zoom bar SHALL allow switching preview dimensions (`1242×2208`, `1290×2796`, `2048×2732`) for true WYSIWYG before export.
- **Bidirectional Canvas-Panel Sync**: Selecting/modifying a device on the canvas MUST sync `activeDeviceIndex` in `RightPropertiesPanel`; exiting inline text editing on the canvas MUST sync back to `title`/`subtitle`; double-clicking any range slider MUST reset it to its default value.
- **Safe History & Input Protection**: `useHistory` MUST ignore `Ctrl/Cmd+Z` when focus is inside `<input>`, `<textarea>`, `<select>`, or `contentEditable`, coalesce rapid slider updates via `coalesceKey`, and clamp `activePageIndex` (`safePageIndex`) to prevent out-of-bounds crashes.
- **Storage Deduplication**: `mockup_app_pages` persisted in `localStorage` MUST dehydrate `screenshotSrc` into index references (`__ss_ref__:N`) pointing to `mockup_app_screenshots` to avoid duplicate Base64 storage.
