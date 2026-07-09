## ADDED Requirements

### Requirement: Standalone Account and Data Deletion page generation
The system SHALL generate a standalone, minimal HTML document titled "Account and Data Deletion" derived from the Privacy Policy draft's `hasUserAccounts` and `deletionInstructions` fields, distinct from the "Account and Data Deletion" section embedded inside the full Privacy Policy document.

#### Scenario: Generate with user accounts enabled
- **WHEN** the Privacy Policy draft has `hasUserAccounts` enabled and custom `deletionInstructions` filled in
- **THEN** the standalone page's body uses the custom instructions verbatim, formatted as a short, self-contained HTML page suitable for hosting at its own public URL.

#### Scenario: Generate without user accounts
- **WHEN** the Privacy Policy draft has `hasUserAccounts` disabled
- **THEN** the standalone page states that no persistent account is required and explains how to request deletion of any data held via the contact email.

### Requirement: Guidance for public hosting requirement
The system SHALL display a notice explaining that Apple (Guideline 5.1.1(v)) and Google Play require a publicly accessible URL for account/data deletion (not merely a mention inside the full Privacy Policy), and that this generated page is intended to be hosted separately at such a URL.

#### Scenario: View hosting guidance
- **WHEN** the user checks the "账号与数据注销页" row in the Compliance Toolkit
- **THEN** the expanded row shows a notice above the preview explaining the public-URL requirement and that this page is separate from the main Privacy Policy document.

### Requirement: Download the standalone page
The system SHALL let the user download the generated Account and Data Deletion page as a self-contained `account-deletion.html` file.

#### Scenario: Download the page
- **WHEN** the user clicks "下载 HTML" inside the expanded Account and Data Deletion row
- **THEN** the browser downloads `account-deletion.html` with inlined styles, ready to be uploaded to any static host and linked from App Store Connect / Play Console.
