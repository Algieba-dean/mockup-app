# icon-generator Specification

## Purpose
Provide the "图标生成" (Icon Maker) workspace: a single-image upload, live canvas preview, platform-specific mask/safe-zone overlays, and customization controls (padding, background fill, adaptive icon foreground scale) needed to prepare an App Store/Google Play icon for export. Mirrors the same 4-panel workspace paradigm as the screenshot tool (`screenshot-canvas`) rather than a separate wizard flow.

## Requirements

### Requirement: Single icon artwork upload
The system SHALL provide a dropzone in the Icon workspace that accepts a single square icon artwork image, replacing the previous placeholder empty state.

#### Scenario: Upload a valid icon image
- **WHEN** the user drags a 1024x1024 PNG onto the Icon workspace dropzone
- **THEN** the canvas immediately renders the icon artwork at full preview size.

### Requirement: Non-blocking size/ratio validation
The system SHALL validate the uploaded artwork's dimensions and aspect ratio without blocking export.

#### Scenario: Undersized or non-square image
- **WHEN** the user uploads a 512x768 image
- **THEN** the system auto center-crops it to a square, displays a non-blocking warning banner stating the recommended size and current size, and offers a one-click re-upload action, while still allowing export.

### Requirement: Platform mask and safe-zone preview
The system SHALL let the user toggle between iOS and Android preview modes, overlaying the platform-appropriate mask or safe-zone guide without altering the exported pixels.

#### Scenario: Switch to Android preview
- **WHEN** the user selects "Android" in the platform segmented control
- **THEN** the canvas overlays a circular safe-zone guide covering the center 66% of the icon (Android's official Adaptive Icon safe zone), without modifying the underlying artwork.

#### Scenario: Preview alternate Android OEM mask shapes
- **WHEN** the user is in the Android preview and selects a different shape chip (圆形/圆润方形/水滴形/方形), referencing the shape catalog researched by NotWoods/maskable (the industry-standard maskable-icon preview tool)
- **THEN** the overlay dims the region that would be cropped under that shape while leaving the shape's interior clear, without modifying the underlying artwork or exported pixels; the default "圆形（官方安全区）" shape remains selected on entry.

#### Scenario: Switch to iOS preview
- **WHEN** the user selects "iOS" in the platform segmented control
- **THEN** the canvas overlays a squircle rounded-corner mask preview as a non-destructive DOM/SVG layer.

### Requirement: Customization controls
The system SHALL provide padding, background fill, and (when applicable) adaptive icon foreground scale controls, available both in the Right Properties Panel and as a quick zoom control beneath the canvas.

#### Scenario: Adjust padding via the properties panel
- **WHEN** the user drags the padding slider in the Right Properties Panel
- **THEN** the canvas redraws the icon artwork scaled within the padded safe area, debounced by ~150ms.

#### Scenario: Independent horizontal/vertical padding
- **WHEN** the user drags the "水平内边距" (horizontal) and "垂直内边距" (vertical) sliders to different values
- **THEN** the safe area becomes a non-square padded box, but the artwork itself is always uniformly scaled to fit the smaller box dimension (never stretched/distorted), matching the CSS `object-fit: contain` safe-area model.

#### Scenario: Adjust image size via the canvas zoom control
- **WHEN** the user drags the zoom slider or clicks +/- beneath the icon canvas
- **THEN** the same padding value updates (the outer frame stays a fixed size; only the image content scales within it), staying in sync with the Right Properties Panel's padding slider.

#### Scenario: Transparent artwork background fill
- **WHEN** the user uploads a PNG with alpha transparency
- **THEN** the system auto-detects a default background fill color from the artwork's edge pixels and renders it behind the artwork, while allowing the user to override the color.

### Requirement: Accessible and responsive workspace
The system SHALL meet WCAG AA contrast for all workspace text and provide adequate touch targets on mobile viewports.

#### Scenario: Caption text contrast
- **WHEN** any caption or hint text is rendered in the Icon workspace
- **THEN** it uses `--ink-secondary` (or higher-contrast) tokens, never the low-contrast `--ink-tertiary` token, achieving ≥4.5:1 contrast.

#### Scenario: Mobile touch targets
- **WHEN** the viewport is narrower than 768px
- **THEN** the iOS/Android platform tab buttons meet the 44×44px minimum touch target size.

#### Scenario: Narrow viewport warning banner
- **WHEN** the size/ratio warning banner is shown on a viewport narrower than 420px
- **THEN** the banner wraps and shrinks to fit rather than being clipped.
