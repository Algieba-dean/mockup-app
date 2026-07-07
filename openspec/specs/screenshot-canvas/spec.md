# screenshot-canvas Specification

## Purpose
Provide the core interactive Fabric.js canvas that underlies the entire screenshot beautification pipeline: it hosts the zoom/pan viewport, accepts screenshot assets via drag-and-drop, and renders the device bezel overlay that clips each screenshot into a realistic mockup frame. This is the foundational rendering surface that `advanced-templates`, `customization-controls`, `device-mix`, `panoramic-background`, and `skew-and-floating` all build on top of.
## Requirements
### Requirement: Interactive FabricJS Canvas Initialization
The system SHALL initialize a Fabric.js canvas in the Center Viewport with zoom and pan controls.

#### Scenario: Canvas rendering on mount
- **WHEN** the workspace-scaffold mounts
- **THEN** a canvas element is initialized, and viewport zoom controls are active at 100%.

### Requirement: Screenshot dropzone and loading
The system MUST provide a drag-and-drop zone where users can load screenshots, adding them to the asset list.

#### Scenario: Drop a valid screenshot image
- **WHEN** a user drops a PNG screenshot file onto the viewport
- **THEN** the file is processed locally and added to the asset list.

### Requirement: Device frame overlay layer
The system SHALL support wrapping the screenshot in a vector/image device bezel frame.

#### Scenario: Select a device frame model
- **WHEN** the user selects the "iPhone 16 Pro" device frame model
- **THEN** the Fabric.js canvas renders the selected device SVG bezel frame, and clips the screenshot inside the device screen region.

