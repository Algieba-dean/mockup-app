## ADDED Requirements

### Requirement: Global wide background upload
The system SHALL allow uploading a single wide background image that spans across all pages.

#### Scenario: Verify global background toggle
- **WHEN** the user enables "Global Panoramic Background" and uploads a 3726x2208 image
- **THEN** the Canvas renders the first 1242px width slice on Page 1, the second slice on Page 2, and the third on Page 3.
