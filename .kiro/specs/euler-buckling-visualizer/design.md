# Design Document

## Overview

The Euler Buckling Visualizer is a single-page web application built with vanilla HTML, CSS, and JavaScript. The application follows a modular architecture with clear separation between UI components, mathematical calculations, and data visualization. The design emphasizes performance, accessibility, and educational value through interactive visualizations.

## Architecture

### File Structure
```
euler-buckling-visualizer/
├── index.html          # Main HTML structure and Chart.js CDN
├── styles.css          # Responsive styling with dark/light theme support
├── app.js             # UI event handling, state management, rendering
└── math.js            # Pure mathematical functions for geometry and buckling calculations
```

### Core Design Principles
- **Zero Build Dependencies**: All functionality implemented in vanilla web technologies
- **Modular Architecture**: Clear separation between UI, calculations, and visualization
- **Responsive Design**: Mobile-first approach with flexible layouts
- **Accessibility First**: WCAG 2.1 AA compliance with keyboard navigation and screen reader support
- **Performance Optimized**: Debounced updates and efficient DOM manipulation

## Components and Interfaces

### 1. Application State Manager (app.js)
```javascript
const AppState = {
  selectedShapes: Set<string>,
  parameters: {
    mode: 'equal-area' | 'equal-perimeter',
    materialE: number,
    columnHeight: number,
    effectiveLengthFactor: number,
    targetArea: number,
    targetPerimeter: number
  },
  results: Array<ShapeResult>
}
```

### 2. Mathematical Engine (math.js)
```javascript
// Core calculation interfaces
interface ShapeProperties {
  area: number;           // cm²
  secondMoment: number;   // cm⁴
  radiusOfGyration: number; // cm
  slendernessRatio: number;
  criticalLoad: number;   // kN
}

// Pure functions for geometric calculations
function calculateCircularProperties(radius: number): ShapeProperties
function calculatePolygonProperties(n: number, targetArea: number): ShapeProperties
function calculateEulerLoad(E: number, I: number, K: number, L: number): number
```

### 3. UI Components

#### Shape Selector Component
- Checkbox grid for shape selection (Circle, Triangle, Square, Pentagon, etc.)
- Keyboard navigation with arrow keys
- ARIA labels and descriptions
- Visual feedback for selection state

#### Parameter Panel Component
- Mode toggle (Equal Area/Equal Perimeter) with radio buttons
- Material E input with both slider and number input
- Column height slider with live value display
- Effective length factor dropdown with engineering descriptions
- Conditional target area/perimeter controls based on mode

#### Chart Display Component
- Chart.js bar chart integration
- Responsive canvas sizing
- Custom color scheme for accessibility
- Interactive tooltips with engineering units
- Export functionality for PNG download

#### Results Table Component
- Sortable columns with visual indicators
- Responsive table design with horizontal scroll on mobile
- Formatted numerical display with appropriate precision
- CSV export functionality

#### Cross-Section Preview Component
- SVG-based rendering system
- Normalized scaling for consistent comparison
- Interactive hover tooltips
- Animation system for compression demonstration

## Data Models

### Shape Result Model
```javascript
interface ShapeResult {
  name: string;
  type: 'circle' | 'polygon';
  sides?: number;
  area: number;           // cm²
  secondMoment: number;   // cm⁴
  radiusOfGyration: number; // cm
  slendernessRatio: number;
  criticalLoad: number;   // kN
  svgPath: string;        // For cross-section preview
}
```

### Calculation Parameters Model
```javascript
interface CalculationParams {
  mode: 'equal-area' | 'equal-perimeter';
  materialE: number;      // GPa
  columnHeight: number;   // m
  effectiveLengthFactor: number;
  targetArea?: number;    // cm² (equal-area mode)
  targetPerimeter?: number; // cm (equal-perimeter mode)
}
```

## Mathematical Implementation

### Geometric Calculations

#### Circular Cross-Sections
- Area: A = πr²
- Second moment of area: I = πr⁴/4
- For equal area mode: r = √(A₀/π)
- For equal perimeter mode: r = P₀/(2π)

#### Regular Polygon Cross-Sections
1. **Unit Polygon Generation**: Create normalized polygon with circumradius = 1
2. **Shoelace Formula**: Calculate raw area and centroid
3. **Second Moment Calculation**: Use parallel axis theorem for principal axes
4. **Scaling**: Apply linear scaling factor based on target area or perimeter
   - Equal area: s = √(A₀/A_raw), I scales as s⁴
   - Equal perimeter: s = P₀/P_raw, I scales as s⁴

#### Euler Buckling Load
- Critical load: P_cr = π²EI/(KL)²
- Use minimum principal second moment for non-circular sections
- Unit conversions: GPa → Pa, cm⁴ → m⁴, result in kN

### Numerical Stability
- Use double precision for all calculations
- Implement proper rounding for display values
- Handle edge cases (very small/large values)
- Validate input ranges to prevent numerical overflow

## Error Handling

### Input Validation
- Range checking for all numerical inputs
- Type validation for form inputs
- Graceful degradation for invalid states
- User-friendly error messages

### Calculation Errors
- Division by zero protection
- Numerical overflow/underflow handling
- Fallback values for edge cases
- Error logging for debugging

### UI Error States
- Loading states during calculations
- Error boundaries for component failures
- Accessibility announcements for errors
- Recovery mechanisms for failed operations

## Testing Strategy

### Unit Testing Approach
- Pure function testing for mathematical calculations
- Known value verification against engineering handbooks
- Edge case testing for numerical stability
- Cross-browser compatibility testing

### Integration Testing
- End-to-end user workflows
- Parameter change propagation
- Export functionality validation
- Accessibility compliance testing

### Performance Testing
- Calculation performance benchmarks
- UI responsiveness under load
- Memory usage monitoring
- Mobile device performance validation

### Validation Functions
```javascript
// Built-in sanity checks
function runSanityChecks(): boolean {
  // Verify circular section calculations against known values
  // Test polygon area calculations
  // Validate Euler formula implementation
  // Check unit conversion accuracy
}
```

## Accessibility Design

### Keyboard Navigation
- Tab order follows logical flow
- Arrow key navigation for related controls
- Enter/Space activation for interactive elements
- Escape key for modal dismissal

### Screen Reader Support
- Semantic HTML structure
- ARIA labels and descriptions
- Live regions for dynamic updates
- Alternative text for visual elements

### Visual Accessibility
- High contrast color schemes
- Scalable text and UI elements
- Focus indicators for all interactive elements
- Color-blind friendly palette

## Performance Considerations

### Optimization Strategies
- Debounced input handling (100ms delay)
- Efficient DOM updates using document fragments
- Lazy loading for non-critical features
- Minimal reflow/repaint operations

### Memory Management
- Event listener cleanup
- Canvas context management
- Efficient data structure usage
- Garbage collection considerations

### Responsive Performance
- CSS-based responsive design
- Optimized image assets
- Efficient media queries
- Touch-friendly interface elements

## Browser Compatibility

### Target Support
- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- ES6+ feature usage with graceful degradation
- CSS Grid and Flexbox for layout
- Chart.js compatibility requirements

### Progressive Enhancement
- Core functionality without JavaScript
- CSS fallbacks for advanced features
- Polyfill strategy for older browsers
- Graceful degradation for unsupported features