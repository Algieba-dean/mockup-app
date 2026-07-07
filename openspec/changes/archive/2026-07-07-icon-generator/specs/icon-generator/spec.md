## ADDED Requirements

### Requirement: Single icon artwork upload
The system SHALL provide a dropzone in the Icon workspace that accepts a single square icon artwork image, replacing the previous placeholder empty state.

#### Scenario: Upload a valid icon image
- **WHEN** the user drags a 1024x1024 PNG onto the Icon workspace dropzone
- **THEN** the canvas immediately renders the icon artwork at full preview size.

### Requirement: Non-blocking size/ratio validation
The system SHALL validate the uploaded artwork's dimensions and aspect ratio without blocking export.

#### Scenario: Undersized or non-square image
- **WHEN** the user uploads a 512x768 image
- **THEN** the system displays a non-blocking warning banner stating the recommended size and current size, and offers a one-click "crop to square" action, while still allowing export.

### Requirement: Platform mask and safe-zone preview
The system SHALL let the user toggle between iOS and Android preview modes, overlaying the platform-appropriate mask or safe-zone guide without altering the exported pixels.

#### Scenario: Switch to Android preview
- **WHEN** the user selects "Android" in the platform segmented control
- **THEN** the canvas overlays a circular safe-zone guide covering the center 66% of the icon, without modifying the underlying artwork.

#### Scenario: Switch to iOS preview
- **WHEN** the user selects "iOS" in the platform segmented control
- **THEN** the canvas overlays a squircle rounded-corner mask preview as a non-destructive DOM/SVG layer.

### Requirement: Customization controls
The system SHALL provide padding, background fill, and (when applicable) adaptive icon foreground scale controls in the Right Properties Panel.

#### Scenario: Adjust padding
- **WHEN** the user drags the padding slider
- **THEN** the canvas redraws the icon artwork scaled down within the padded safe area, debounced by ~150ms.

#### Scenario: Transparent artwork background fill
- **WHEN** the user uploads a PNG with alpha transparency
- **THEN** the system auto-detects a default background fill color from the artwork's edge pixels and renders it behind the artwork, while allowing the user to override the color.
