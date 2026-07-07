# screenshot-tool-completeness Specification

## Purpose
Close the two remaining functional gaps found during the completeness audit of the
Screenshots tool: (1) E2E test suite drift caused by the P3 custom-dialog hardening,
and (2) missing Undo/Redo UI affordance despite working keyboard shortcuts.

## Non-goals
- No changes to canvas rendering logic (canvasManager.ts).
- No new export formats or device models.

## Requirement 1: E2E tests match custom dialog UI
The system SHALL have E2E tests that exercise the actual custom preset
save/delete dialogs instead of native browser dialogs.

### Scenario: Save preset via custom modal
- WHEN the user clicks "保存当前风格为预设"
- THEN a custom modal with a named input field (`#preset-name-input`) appears
- AND clicking "保存预设" (or pressing Enter) creates the preset and closes the modal

### Scenario: Delete preset via custom modal
- WHEN the user clicks the trash icon on a preset card
- THEN a custom confirmation modal appears
- AND clicking "确定删除" removes the preset

### Acceptance Criteria
- [ ] `tests/mockup-app.spec.ts` preset test uses `page.locator` for the custom
      modal instead of `page.on('dialog', ...)`
- [ ] `npx playwright test` passes for the preset save/delete flow

## Requirement 2: Discoverable Undo/Redo
The system SHALL expose Undo/Redo as visible header buttons in addition to
the existing Ctrl+Z / Ctrl+Shift+Z shortcuts.

### Scenario: Undo button state
- WHEN there is no history to undo
- THEN the Undo button is disabled
- WHEN at least one change has been made
- THEN the Undo button is enabled and clicking it reverts the last change

### Scenario: Redo button state
- WHEN an undo has been performed
- THEN the Redo button becomes enabled and clicking it re-applies the change

### Acceptance Criteria
- [ ] `useHistory`'s `undo`/`redo`/`canUndo`/`canRedo` are wired into `AppHeader`
- [ ] Undo/Redo buttons have `aria-label`, `disabled` state, and `title` with
      shortcut hint (e.g., "撤销 (Ctrl+Z)")
- [ ] `tsc --noEmit` and `npm run build` pass
