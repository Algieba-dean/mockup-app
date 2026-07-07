## ADDED Requirements

### Requirement: Multi-platform icon ZIP export
The system SHALL export the designed icon into a single ZIP containing all standard iOS and Android icon sizes, organized into platform-conventional folder structures.

#### Scenario: Export full icon set
- **WHEN** the user opens the export modal, selects "App Store 图标" and "Google Play 图标", and clicks Export
- **THEN** the system generates a ZIP containing `/ios/AppIcon.appiconset/` (13 iOS sizes + `Contents.json`) and `/android/mipmap-*/` (legacy densities) plus adaptive icon foreground/background layers and the 512px Play Store icon.

### Requirement: iOS Contents.json generation
The system MUST generate a valid `Contents.json` manifest inside the exported `AppIcon.appiconset/` folder describing each icon's idiom, scale, and filename.

#### Scenario: Verify manifest accuracy
- **WHEN** the exported ZIP is extracted and `AppIcon.appiconset/Contents.json` is inspected
- **THEN** each entry's `filename`, `size`, and `scale` fields correctly match a generated PNG file in the same folder.
