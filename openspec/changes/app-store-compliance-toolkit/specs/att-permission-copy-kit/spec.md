## ADDED Requirements

### Requirement: Conditional ATT tracking prompt copy
The system SHALL generate a compliant bilingual (Chinese/English) `NSUserTrackingUsageDescription` prompt copy whenever the Privacy Policy draft's selected data types include "Device identifiers / Advertising ID" AND at least one selected third-party service belongs to the "广告 / 归因" (Advertising/Attribution) category.

#### Scenario: Advertising SDK and device ID both selected
- **WHEN** the Privacy Policy draft includes "Device identifiers / Advertising ID" in `dataTypes` and "AdMob" in `services`
- **THEN** the ATT sub-tab displays a bilingual prompt copy stating the identifier is used only to provide more relevant personalized advertising, with no manipulative or vague wording.

#### Scenario: No advertising SDK selected
- **WHEN** the Privacy Policy draft does not include any "广告 / 归因" category service
- **THEN** the ATT sub-tab shows a message explaining that ATT prompt copy is not needed because no cross-app/cross-site advertising tracking was detected, instead of showing empty or placeholder copy.

### Requirement: Bilingual system permission usage-description matrix
The system SHALL generate a table mapping each selected data type to its corresponding iOS `Info.plist` usage description key and Android manifest permission, each with compliant bilingual (Chinese/English) copy that explicitly states the specific purpose and avoids manipulative phrasing.

#### Scenario: Camera and location selected
- **WHEN** the Privacy Policy draft's `dataTypes` includes "Photos and camera access" and "Precise location data"
- **THEN** the matrix includes rows for `NSCameraUsageDescription`/`CAMERA` and `NSLocationWhenInUseUsageDescription`/`ACCESS_FINE_LOCATION`, each with bilingual copy naming the specific in-app feature that uses the permission.

### Requirement: Copy-paste ready snippet export
The system SHALL let the user copy the full permission matrix as an Info.plist-style XML snippet (`<key>`/`<string>` pairs) plus an Android manifest-style comment block, ready to paste directly into an Xcode or Android Studio project.

#### Scenario: Copy Info.plist snippet
- **WHEN** the user clicks "复制 Info.plist 片段" inside the expanded "ATT 与权限话术矩阵" row
- **THEN** the clipboard receives a well-formed `<key>...</key><string>...</string>` snippet for every mapped permission, using the English copy variant.
