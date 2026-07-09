## MODIFIED Requirements

### Requirement: Independent Privacy Policy, Terms of Use, and Compliance Toolkit sub-generators
The system SHALL provide three independent sub-generators (Privacy Policy, Terms of Use, Compliance Toolkit) switchable via a segmented control. Privacy Policy and Terms of Use remain step-wizards each retaining their own draft and step state; Compliance Toolkit is a single-page, checkbox-driven aggregator that reads (but does not mutate) the other two sub-generators' persisted drafts.

#### Scenario: Switch sub-mode without losing progress
- **WHEN** the user has partially completed the Privacy Policy wizard and switches to the Terms of Use segmented tab
- **THEN** the Terms of Use wizard starts fresh (or resumes its own saved draft) and switching back to Privacy Policy preserves the exact step and field values left behind.

#### Scenario: Switch into Compliance Toolkit without affecting the other two drafts
- **WHEN** the user switches from the Privacy Policy or Terms of Use segmented tab into the Compliance Toolkit tab
- **THEN** the Compliance Toolkit renders its checkbox list using the current persisted state of both drafts, and switching back to either wizard shows it unchanged, exactly as it was left.
