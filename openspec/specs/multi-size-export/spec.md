# multi-size-export Specification

## Purpose
Turn the canvas designs into store-submission-ready deliverables in one action: users pick the target App Store / Google Play resolutions and export a single ZIP with correctly organized subfolders, removing the need to manually re-render and rename files per required screen size.
## Requirements
### Requirement: Preset size selection on export
The system SHALL display standard resolution options for App Store (6.9", 6.5", 5.5", iPad 12.9") and Google Play in the export configuration.

#### Scenario: Check multiple sizes for export
- **WHEN** the user selects "iPhone 6.9\"" and "iPhone 5.5\"" options and clicks Export
- **THEN** the system generates a single ZIP containing subfolders `/ios/iphone_6.9/` and `/ios/iphone_5.5/` populated with respective rendered screens.

