# advanced-templates Specification

## Purpose
Give the canvas background premium visual depth (gradients, texture images, frosted glass, Gaussian blur) so exported screenshots look brand-quality out of the box instead of flat solid colors. This capability shares canvas rendering state (`canvasManager.ts`) with `customization-controls`; the two were shipped together in `editor-features-upgrade` and should be reviewed jointly when modifying background/rendering behavior.
## Requirements
### Requirement: Advanced background type selection
The system SHALL support selecting background types: Solid Color, Gradient, and Image.

#### Scenario: Verify background selection renders
- **WHEN** the user selects background type "Image" and chooses a preset texture
- **THEN** the Fabric.js canvas updates to draw the texture image as the background.

### Requirement: Frosted glass effect
The system MUST allow drawing a translucent blurred rounded rectangle (Frosted Glass) behind the device mockup.

#### Scenario: Toggle frosted glass effect
- **WHEN** the user checks the "Frosted Glass" toggle
- **THEN** the Fabric.js canvas renders a semi-transparent white container behind the phone frame with a soft white glow shadow.

### Requirement: Background blur filter
The system SHALL support adjusting background blur using a slider.

#### Scenario: Adjust blur intensity
- **WHEN** the user slides the background blur to 20px
- **THEN** the Fabric.js canvas applies a Gaussian blur filter of 20px to the background image.

