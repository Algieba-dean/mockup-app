## ADDED Requirements

### Requirement: Save current configuration to named history
The system SHALL let the user save the current icon workspace configuration (source artwork, padding, offset, content scale, background fill mode/color(s), foreground scale) as a named entry in a persistent history list, with no fixed limit on the number of entries.

#### Scenario: Save a new history entry
- **WHEN** the user clicks "保存到历史" in the icon customization panel
- **THEN** the system captures a thumbnail and a snapshot of all current icon state fields, prompts for an inline name (defaulting to "方案 {n}"), and appends it to the top of the history list in `localStorage`.

### Requirement: History drawer access and listing
The system SHALL provide a header-level entry point (visible only while the Icon tool is active) that opens a right-side drawer listing all saved history entries in most-recent-first order.

#### Scenario: Open history drawer with entries
- **WHEN** the user clicks the header "历史" button and at least one entry exists
- **THEN** a drawer slides in showing each entry's thumbnail, name, and relative save time, with the entry matching the currently active workspace state visually marked as current.

#### Scenario: Open history drawer with no entries
- **WHEN** the user clicks the header "历史" button and no entries exist
- **THEN** the drawer shows an empty-state message instructing the user to adjust the icon and click "保存到历史" to create the first entry.

### Requirement: Restore a history entry
The system SHALL let the user restore any saved history entry, replacing the current workspace state with the entry's snapshot.

#### Scenario: Restore an entry
- **WHEN** the user clicks "恢复" on a history entry
- **THEN** the canvas and all customization controls (padding, offset, scale, background, foreground scale) update to match the saved snapshot, and the drawer closes.

### Requirement: Rename and delete history entries
The system SHALL let the user rename a history entry inline and delete it with a confirmation step.

#### Scenario: Rename an entry
- **WHEN** the user activates inline edit on an entry's name and presses Enter
- **THEN** the new name is persisted and reflected immediately in the list.

#### Scenario: Delete an entry
- **WHEN** the user clicks "删除" on an entry and confirms the destructive action
- **THEN** the entry is permanently removed from `localStorage` and the list re-renders without it.
