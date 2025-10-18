# Requirements Document

## Introduction

A single-page web application for visualizing and comparing axial compression buckling (Euler buckling) behavior between regular n-gons (n=3-9) and circular columns. The application provides interactive parameter controls, real-time calculations, and multiple visualization modes to help users understand structural engineering concepts related to column stability.

## Glossary

- **Euler_Buckling_App**: The complete web application system for buckling analysis
- **Shape_Selector**: UI component for toggling geometric shapes on/off
- **Parameter_Panel**: UI component containing all input controls for material and geometric properties
- **Chart_Display**: Bar chart visualization showing critical buckling loads
- **Results_Table**: Tabular display of calculated engineering properties
- **Cross_Section_Preview**: SVG visualization of geometric cross-sections
- **Calculation_Engine**: Mathematical computation system for structural analysis
- **Export_System**: Data export functionality for charts and tables

## Requirements

### Requirement 1

**User Story:** As a structural engineer, I want to select different geometric shapes for comparison, so that I can analyze how cross-sectional geometry affects buckling resistance.

#### Acceptance Criteria

1. THE Euler_Buckling_App SHALL provide toggle checkboxes for Circle and regular n-gons where n ranges from 3 to 9
2. WHEN the application loads, THE Shape_Selector SHALL have all geometric shapes enabled by default
3. WHEN a user toggles a shape checkbox, THE Euler_Buckling_App SHALL immediately update all visualizations and calculations
4. THE Shape_Selector SHALL maintain keyboard accessibility with proper ARIA labels

### Requirement 2

**User Story:** As an engineering student, I want to adjust material and geometric parameters, so that I can understand how different variables affect column buckling behavior.

#### Acceptance Criteria

1. THE Parameter_Panel SHALL provide a toggle between "Equal Area" and "Equal Perimeter" comparison modes with "Equal Area" as default
2. THE Parameter_Panel SHALL provide input controls for Material E with range 10-210 GPa and default value 200 GPa
3. THE Parameter_Panel SHALL provide a slider for Column Height L with range 0.5-5.0 meters and default value 2.0 meters
4. THE Parameter_Panel SHALL provide a dropdown for Effective Length Factor K with options: Fixed-Fixed (0.5), Fixed-Pinned (0.7), Pinned-Pinned (1.0, default), Fixed-Free (2.0)
5. WHERE "Equal Area" mode is selected, THE Parameter_Panel SHALL display Target Area control with range 10-400 cm² and default 100 cm²
6. WHERE "Equal Perimeter" mode is selected, THE Parameter_Panel SHALL display Target Perimeter control with range 20-400 cm and default 120 cm

### Requirement 3

**User Story:** As a user, I want to see immediate visual feedback when I change parameters, so that I can quickly understand the relationships between variables.

#### Acceptance Criteria

1. WHEN any parameter changes, THE Euler_Buckling_App SHALL recalculate and update all displays within 100 milliseconds using debouncing
2. THE Chart_Display SHALL show critical buckling loads as a bar chart sorted in descending order
3. THE Results_Table SHALL display shape name, area, second moment of area, radius of gyration, slenderness ratio, and critical load with sortable columns
4. THE Cross_Section_Preview SHALL render all selected shapes at the same scale using SVG with gray outlines
5. WHEN a user hovers over a cross-section, THE Cross_Section_Preview SHALL display a tooltip with shape-specific data

### Requirement 4

**User Story:** As a researcher, I want to export calculation results and visualizations, so that I can include them in reports and presentations.

#### Acceptance Criteria

1. THE Export_System SHALL provide a button to download the results table as CSV format
2. THE Export_System SHALL provide a button to save the bar chart as PNG image
3. WHEN export is requested, THE Euler_Buckling_App SHALL generate the file without requiring external dependencies

### Requirement 5

**User Story:** As a user, I want the application to work reliably across different devices and accessibility needs, so that I can use it in various environments.

#### Acceptance Criteria

1. THE Euler_Buckling_App SHALL function as a single HTML file with embedded CSS and JavaScript without requiring build tools
2. THE Euler_Buckling_App SHALL support both light and dark themes based on system preferences
3. THE Euler_Buckling_App SHALL provide full keyboard navigation support for all interactive elements
4. THE Euler_Buckling_App SHALL maintain color contrast ratios compliant with accessibility standards
5. THE Euler_Buckling_App SHALL be responsive and functional on mobile and desktop devices

### Requirement 6

**User Story:** As an engineering educator, I want to demonstrate buckling behavior visually, so that I can help students understand structural failure modes.

#### Acceptance Criteria

1. THE Euler_Buckling_App SHALL provide an optional "Compression Animation" button
2. WHEN animation is activated, THE Cross_Section_Preview SHALL display compression arrows and exaggerated deformation
3. DURING animation, THE Euler_Buckling_App SHALL highlight the weakest shape in red color
4. THE Euler_Buckling_App SHALL provide a reset button to restore all parameters to default values

### Requirement 7

**User Story:** As a quality assurance engineer, I want the calculations to be mathematically accurate, so that I can trust the results for educational and preliminary design purposes.

#### Acceptance Criteria

1. THE Calculation_Engine SHALL compute circular cross-section properties using standard formulas: area A=πr², second moment I=πr⁴/4
2. THE Calculation_Engine SHALL compute regular polygon properties using the Shoelace formula for area and parallel axis theorem for second moments
3. THE Calculation_Engine SHALL calculate Euler critical load using the formula Pcr = π²EI/(KL)²
4. THE Calculation_Engine SHALL handle unit conversions between UI units (GPa, cm, m) and SI base units internally
5. THE Calculation_Engine SHALL provide a sanity check function that validates circular section calculations against known theoretical values