## ADDED Requirements

### Requirement: Map collected data to Apple's Privacy Nutrition Label categories
The system SHALL map each selected data type and third-party service from the Privacy Policy draft to one of Apple's three App Privacy categories ("Data Used to Track You", "Data Linked to You", "Data Not Linked to You") using the presence of advertising/attribution third-party services and the `hasUserAccounts` flag as classification signals.

#### Scenario: Data type used with an advertising SDK
- **WHEN** the user has selected "Device identifiers / Advertising ID" as a data type and "AdMob" as a third-party service
- **THEN** that data type is classified under "Data Used to Track You" in the generated cheat sheet.

#### Scenario: Data type with no advertising SDK but with user accounts
- **WHEN** the user has selected "Email address" as a data type, has no advertising services selected, and has enabled `hasUserAccounts`
- **THEN** that data type is classified under "Data Linked to You".

#### Scenario: Data type with no advertising SDK and no user accounts
- **WHEN** the user has selected "Usage and log data" and has not enabled `hasUserAccounts`
- **THEN** that data type is classified under "Data Not Linked to You".

### Requirement: Step-by-step App Store Connect fill-in cheat sheet
The system SHALL render the classified data as an ordered cheat sheet that mirrors the App Store Connect "App Privacy" questionnaire flow, listing for each data type which category to select and which standard Purpose(s) apply, since Apple provides no API for automated submission.

#### Scenario: View the cheat sheet
- **WHEN** the user checks the "隐私营养标签" row in the Compliance Toolkit with at least one data type selected in the Privacy Policy draft
- **THEN** the row expands to display a table with columns for Data Type, Apple Category, and Suggested Purpose(s), plus a note that Apple's own questionnaire UI is the source of truth and this table should be cross-checked against it.

### Requirement: Copy or download the cheat sheet
The system SHALL let the user copy the cheat sheet as plain text or download it as a Markdown file, consistent with the export patterns used elsewhere in the Privacy tool.

#### Scenario: Copy cheat sheet to clipboard
- **WHEN** the user clicks "复制到剪贴板" inside the expanded "隐私营养标签" row
- **THEN** a plain-text tabular representation of the cheat sheet is copied to the clipboard and a toast confirms the action.
