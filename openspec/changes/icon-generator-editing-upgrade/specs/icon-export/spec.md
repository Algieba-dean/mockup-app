## ADDED Requirements

### Requirement: Post-export platform integration guidance
The system SHALL, after a successful ZIP export, display integration guidance for placing the generated assets into an Xcode and an Android Studio project, requiring explicit user dismissal rather than auto-hiding.

#### Scenario: Guidance shown after successful export
- **WHEN** icon ZIP generation completes successfully
- **THEN** the loading overlay transitions to a completed state showing a short instruction for the iOS `AppIcon.appiconset` destination and a short instruction for the Android `res` folder merge, along with a "关闭" button, and the overlay remains visible until the user clicks it.

#### Scenario: Guidance omitted on export failure
- **WHEN** icon ZIP generation fails
- **THEN** the existing error toast is shown instead of the completed-state guidance.

### Requirement: SVG container export
The system SHALL offer an optional "附带 SVG 容器版" checkbox in the icon export modal that, when checked, adds a single 1024×1024 SVG file to the top level of the exported ZIP, embedding the master artwork as a base64-encoded raster image inside an `<image>` element.

#### Scenario: Export with SVG container enabled
- **WHEN** the user checks "附带 SVG 容器版" and exports
- **THEN** the generated ZIP contains one additional file (e.g. `icon-1024.svg`) at its root, separate from the `ios/` and `android/` folders, valid as a standalone SVG document.

#### Scenario: Export with SVG container disabled
- **WHEN** the user leaves "附带 SVG 容器版" unchecked and exports
- **THEN** the generated ZIP structure is unchanged from the existing iOS/Android-only output.

### Requirement: Adaptive icon background honors gradient fill
The system SHALL render the Android Adaptive Icon background layer (`mipmap-anydpi-v26/ic_launcher_background.png`) using the workspace's configured fill mode, including linear gradients, instead of always rendering a solid color.

#### Scenario: Export with gradient background configured
- **WHEN** the workspace background fill mode is set to gradient and the user exports with Android selected
- **THEN** `ic_launcher_background.png` is rendered with the same 135° two-color linear gradient shown in the preview.
