# icon-export Specification

## Purpose
Turn the icon-generator workspace's design into store-submission-ready deliverables in one action: a single ZIP containing every standard iOS and Android icon size, organized into the platform-conventional folder structures each store/IDE expects.

## Requirements

### Requirement: Multi-platform icon ZIP export
The system SHALL export the designed icon into a single ZIP containing all standard iOS and Android icon sizes, organized into platform-conventional folder structures.

#### Scenario: Export full icon set
- **WHEN** the user opens the export modal, selects "App Store 图标" and "Google Play 图标", and clicks Export
- **THEN** the system generates a ZIP containing `/ios/AppIcon.appiconset/` (18 iOS sizes + `Contents.json`) and `/android/` (5 legacy mipmap densities, adaptive icon foreground/background layers, and the 512px Play Store icon).

### Requirement: iOS Contents.json generation
The system MUST generate a valid `Contents.json` manifest inside the exported `AppIcon.appiconset/` folder describing each icon's idiom, scale, and filename. The idiom/size/scale → filename mapping SHALL be produced by a pure, reusable builder function decoupled from the render loop (mirroring the template.json + generator separation used by reference tools like dwmkerr/app-icon), with entries sorted deterministically by filename.

#### Scenario: Verify manifest accuracy
- **WHEN** the exported ZIP is extracted and `AppIcon.appiconset/Contents.json` is inspected
- **THEN** each entry's `filename`, `size`, and `scale` fields correctly match a generated PNG file in the same folder.

### Requirement: Per-platform export overrides are honored
The system SHALL apply the user's iOS-specific and Android-specific padding/offset/scale overrides to their respective exported assets, rather than applying whichever platform tab is currently active to both platforms.

#### Scenario: Diverging iOS/Android tuning survives export
- **WHEN** the user sets different padding, offset, or content scale values while previewing iOS vs. Android, then exports both platforms in one ZIP
- **THEN** the iOS assets reflect the iOS-tuned values and the Android assets reflect the Android-tuned values, independent of which platform tab was active at export time.

### Requirement: Bounded source resolution
The system SHALL cap the persisted/master icon source resolution to avoid oversized local storage writes.

#### Scenario: Large source image uploaded
- **WHEN** the user uploads a source image larger than 1024×1024
- **THEN** the cropped square source is downscaled to at most 1024×1024 before being persisted, since all export sizes are ≤1024px.
