## ADDED Requirements

### Requirement: Workspace multi-panel layout
The system SHALL display a multi-panel workspace layout containing a Left Sidebar for presets, a Center Canvas Viewport, a Right Properties Panel, and a Bottom Asset Dock.

#### Scenario: Verify workspace components on load
- **WHEN** the user opens the MockupApp URL
- **THEN** the application renders the Left Sidebar, Center Canvas Viewport, Right Properties Panel, and Bottom Asset Dock in a dark-theme grid.

### Requirement: Tool routing and navigation
The system MUST support switching active tools (Screenshots, Icons, Copywriter) via a top header navigation, and load the corresponding workspace configuration.

#### Scenario: Switch from Screenshots to Icons tool
- **WHEN** the user clicks the "Icons" tool button in the header
- **THEN** the active view changes to the Icon generator configuration, and the Right Properties Panel updates to show Icon settings.

### Requirement: Dark and light theme toggle
The system SHALL support toggling between dark-mode and light-mode themes using a button in the header.

#### Scenario: Toggle theme state
- **WHEN** the user clicks the theme toggle button
- **THEN** the app theme class changes between dark and light, and the UI colors adjust to match.
