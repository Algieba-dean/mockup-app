# skew-and-floating Specification

## Purpose
TBD - created by archiving change panoramic-and-floating-mockups. Update Purpose after archive.
## Requirements
### Requirement: 2.5D skew and rotate bezel
The system SHALL support rotating the phone bezel group using an angle slider, and applying a horizontal skew angle.

#### Scenario: Skew bezel group
- **WHEN** the user sets angle to 15 degrees and skewX to -5
- **THEN** the Fabric.js canvas updates the outer bezel, inner bezel, and clipped screenshot to render under a skewed perspective transformation.

