# device-mix Specification

## Purpose
Enable a single slide page to showcase more than one device model side by side (e.g., iPhone next to iPad), so users can produce composite marketing shots that mix form factors without leaving the canvas. Extends the base rendering surface from `screenshot-canvas` by allowing multiple positioned device instances per page, each bound to its own screenshot asset.
## Requirements
### Requirement: Multiple mockup instances per page
The system SHALL support adding and rendering multiple device bezel instances on a single slide page.

#### Scenario: Side-by-side mix layout
- **WHEN** the user adds an iPad Pro next to an iPhone 16 Pro mockup
- **THEN** the Canvas renders both mockups in their designated coordinates, applying their respective screenshots.

