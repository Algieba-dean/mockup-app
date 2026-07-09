## ADDED Requirements

### Requirement: Map selected data types and services to Data Safety rows
The system SHALL map each selected data type and third-party service from the Privacy Policy draft into structured Data Safety Form rows (data type, whether collected, whether shared with third parties, purpose, optional/required), reusing the existing `DATA_TYPE_CATALOG`/`SERVICE_CATALOG` selections without prompting for new input.

#### Scenario: Data type used with a third-party SDK
- **WHEN** the user has selected "Approximate location data" and "Google Analytics (GA4)" as a service
- **THEN** the generated rows mark that data type as both collected and shared with a third party.

### Requirement: Google Play Data Safety CSV export
The system SHALL serialize the mapped Data Safety rows into a downloadable `.csv` file compatible with the Google Play Console Data Safety Form's bulk-import format, so the developer can import it directly in Play Console.

#### Scenario: Download the CSV
- **WHEN** the user clicks "下载 CSV" inside the expanded "Data Safety CSV" row
- **THEN** the browser downloads a `data-safety.csv` file with one header row and one row per mapped data type, using the column structure verified against the current Play Console import template.

### Requirement: Import verification disclaimer
The system SHALL display a disclaimer near the CSV download action noting that Google Play's import template can change over time, and that the developer should cross-check column names against the current Play Console template if the import fails.

#### Scenario: View disclaimer
- **WHEN** the user checks the "Data Safety CSV" row in the Compliance Toolkit
- **THEN** the expanded row shows a short notice above the download button advising the user to verify the CSV against the latest Play Console template before relying on it.
