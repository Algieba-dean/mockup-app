## ADDED Requirements

### Requirement: Canvas drag-and-zoom content positioning
The system SHALL let the user reposition the icon artwork within the fixed-size preview frame by dragging directly on the canvas, and scale it via mouse wheel or pinch gesture, independent of the existing padding control.

#### Scenario: Drag to reposition
- **WHEN** the user presses and drags on the icon preview canvas
- **THEN** the artwork translates within the frame according to the drag delta (updating `iconOffsetX`/`iconOffsetY`), the outer frame size stays fixed, and the render updates in real time without waiting for the debounce used by other controls.

#### Scenario: Scale via wheel or pinch
- **WHEN** the user scrolls the mouse wheel or performs a pinch gesture over the icon preview canvas
- **THEN** the artwork's content scale (`iconContentScale`) increases or decreases within a bounded range, composing with the existing padding value to determine the final rendered size.

#### Scenario: Keyboard-accessible nudge
- **WHEN** the icon preview canvas has focus and the user presses an arrow key
- **THEN** the artwork offset shifts by a small fixed increment in the corresponding direction, providing a non-pointer alternative to dragging.

#### Scenario: Reset position and scale
- **WHEN** the user clicks the "重置" control beneath the canvas
- **THEN** `iconOffsetX`, `iconOffsetY`, and `iconContentScale` all return to their defaults (0, 0, 1) while `iconPadding` is also reset, matching the existing reset behavior.

### Requirement: Gradient background fill
The system SHALL let the user choose between a solid color and a two-color linear gradient (fixed 135°) for the icon's background fill.

#### Scenario: Switch to gradient fill
- **WHEN** the user selects "渐变" in the background fill mode control and picks a start and end color
- **THEN** the canvas preview immediately renders a 135° linear gradient between the two colors behind the artwork, replacing the solid fill.

#### Scenario: Gradient persists across sessions
- **WHEN** the user reloads the page after configuring a gradient background
- **THEN** the gradient mode and both colors are restored from persisted state, matching the existing solid-color persistence behavior.

### Requirement: Local privacy processing disclosure
The system SHALL display a persistent, non-dismissible notice in the Icon workspace stating that all image processing happens locally in the browser and no image is uploaded to a server.

#### Scenario: Empty-state disclosure
- **WHEN** the user has not yet uploaded an icon artwork
- **THEN** the upload dropzone area shows a short line of text disclosing local-only processing, using `--ink-secondary` or higher-contrast tokens.
