## ADDED Requirements

### Requirement: Custom EULA built on the Terms of Use baseline
The system SHALL generate a "Custom End User License Agreement (EULA)" document by reusing the existing Terms of Use baseline clauses (Eligibility, Feedback, Indemnification, Severability, Entire Agreement, etc.) and layering on high-risk-category-specific mandatory clauses selected via the Compliance Toolkit's high-risk type selector.

#### Scenario: No high-risk type selected
- **WHEN** the high-risk type selector is set to "无" (None)
- **THEN** the generated Custom EULA is identical in content to the standard Terms of Use output, only re-titled "Custom End User License Agreement (EULA)".

### Requirement: AI-generated content disclaimer clause
The system SHALL insert a clause disclaiming responsibility for the accuracy of AI-generated content when the high-risk type is set to "AI 生成类".

#### Scenario: AI-generated type selected
- **WHEN** the high-risk type is "AI 生成类"
- **THEN** the generated Custom EULA includes a clause stating the app does not guarantee the accuracy, completeness, or reliability of AI-generated content and that users rely on such content at their own risk.

### Requirement: Health/Medical disclaimer clause
The system SHALL insert a clause stating the app does not provide professional medical advice and is for reference/informational purposes only when the high-risk type is set to "健康/医疗类".

#### Scenario: Health/Medical type selected
- **WHEN** the high-risk type is "健康/医疗类"
- **THEN** the generated Custom EULA includes a clause stating the app is not a substitute for professional medical advice, diagnosis, or treatment, and users should consult a qualified healthcare provider.

### Requirement: UGC zero-tolerance and account enforcement clause
The system SHALL insert a clause covering zero tolerance for abusive/objectionable content and the app's content moderation and account enforcement mechanism when the high-risk type is set to "UGC 社区". The clause SHALL cover, at minimum: a mechanism for filtering objectionable content, a mechanism for users to block abusive users, a mechanism for reporting objectionable content, and a mechanism for removing violating content and banning violating accounts.

#### Scenario: UGC Community type selected
- **WHEN** the high-risk type is "UGC 社区"
- **THEN** the generated Custom EULA includes a clause describing zero tolerance for abusive or sexually explicit content, and explicitly describes the report-review-removal-ban mechanism the app commits to.

### Requirement: Custom EULA export and labeling
The system SHALL clearly label the generated document as a Custom EULA distinct from the standard Terms of Use output, and support the same copy/HTML/Markdown export options as other generated documents.

#### Scenario: Export Custom EULA
- **WHEN** the user downloads the Custom EULA as HTML from inside the expanded "Custom EULA" row
- **THEN** the downloaded file's title and heading read "Custom End User License Agreement (EULA)" and the filename is distinct from the standard `terms-of-use` filename (e.g. `custom-eula.html`).
