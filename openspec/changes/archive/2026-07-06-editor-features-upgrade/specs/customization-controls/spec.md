## ADDED Requirements

### Requirement: Typography font selector
The system SHALL support choosing the title and subtitle font family from Lora, Geist, Playfair Display, and Cormorant Garamond.

#### Scenario: Select Playfair Display for title
- **WHEN** the user selects "Playfair Display" from the Font dropdown
- **THEN** the system dynamically loads the font from Google Fonts and redraws the canvas title using "Playfair Display".

### Requirement: Swappable mockup device shell
The system MUST support swapping the mockup device frame between iPhone Dark, iPhone Light, iPad Pro, and Google Pixel.

#### Scenario: Swap to iPad Pro frame
- **WHEN** the user selects "iPad Pro" from the Device dropdown
- **THEN** the canvas updates, scaling the frame to iPad coordinates and clipping screenshots matching the iPad ratio.
