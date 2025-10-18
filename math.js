/**
 * Mathematical functions for Euler Buckling Visualizer
 * Handles geometric calculations, cross-section properties, and buckling analysis
 */

/**
 * Calculate circular cross-section properties
 * @param {number} radius - Radius in cm
 * @returns {Object} Properties object with area, secondMoment, radiusOfGyration
 */
function calculateCircularProperties(radius) {
    const area = Math.PI * radius * radius; // cm²
    const secondMoment = Math.PI * Math.pow(radius, 4) / 4; // cm⁴
    const radiusOfGyration = radius / 2; // cm
    
    return {
        area,
        secondMoment,
        radiusOfGyration
    };
}

/**
 * Generate vertices for a regular n-gon with circumradius = 1
 * @param {number} n - Number of sides
 * @returns {Array} Array of [x, y] coordinate pairs
 */
function generateUnitPolygonVertices(n) {
    const vertices = [];
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI * i) / n;
        vertices.push([Math.cos(angle), Math.sin(angle)]);
    }
    return vertices;
}

/**
 * Calculate polygon area using the Shoelace formula
 * @param {Array} vertices - Array of [x, y] coordinate pairs
 * @returns {number} Area of the polygon
 */
function calculatePolygonAreaShoelace(vertices) {
    let area = 0;
    const n = vertices.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        area += vertices[i][0] * vertices[j][1];
        area -= vertices[j][0] * vertices[i][1];
    }
    
    return Math.abs(area) / 2;
}

/**
 * Calculate polygon centroid
 * @param {Array} vertices - Array of [x, y] coordinate pairs
 * @returns {Array} [x, y] coordinates of centroid
 */
function calculatePolygonCentroid(vertices) {
    const area = calculatePolygonAreaShoelace(vertices);
    let cx = 0, cy = 0;
    const n = vertices.length;
    
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const crossProduct = vertices[i][0] * vertices[j][1] - vertices[j][0] * vertices[i][1];
        cx += (vertices[i][0] + vertices[j][0]) * crossProduct;
        cy += (vertices[i][1] + vertices[j][1]) * crossProduct;
    }
    
    const factor = 1 / (6 * area);
    return [cx * factor, cy * factor];
}

/**
 * Calculate second moment of area for polygon using parallel axis theorem
 * @param {Array} vertices - Array of [x, y] coordinate pairs
 * @returns {Object} Object with Ixx, Iyy, and minimum second moment
 */
function calculatePolygonSecondMoment(vertices) {
    const area = calculatePolygonAreaShoelace(vertices);
    const [cx, cy] = calculatePolygonCentroid(vertices);
    const n = vertices.length;
    
    let Ixx = 0, Iyy = 0;
    
    // Calculate second moments about centroidal axes
    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = vertices[i][0] - cx;
        const yi = vertices[i][1] - cy;
        const xj = vertices[j][0] - cx;
        const yj = vertices[j][1] - cy;
        
        const crossProduct = xi * yj - xj * yi;
        
        // Second moments using the shoelace-based formula
        Ixx += crossProduct * (yi * yi + yi * yj + yj * yj);
        Iyy += crossProduct * (xi * xi + xi * xj + xj * xj);
    }
    
    Ixx = Math.abs(Ixx) / 12;
    Iyy = Math.abs(Iyy) / 12;
    
    // Return minimum second moment (critical for buckling)
    const minSecondMoment = Math.min(Ixx, Iyy);
    
    return {
        Ixx,
        Iyy,
        minSecondMoment
    };
}

/**
 * Calculate complete properties for a regular polygon
 * @param {number} n - Number of sides
 * @param {number} scaleFactor - Scaling factor to apply to unit polygon
 * @returns {Object} Complete properties object
 */
function calculatePolygonProperties(n, scaleFactor = 1) {
    const vertices = generateUnitPolygonVertices(n);
    const unitArea = calculatePolygonAreaShoelace(vertices);
    const unitSecondMoment = calculatePolygonSecondMoment(vertices);
    
    // Apply scaling
    const area = unitArea * scaleFactor * scaleFactor; // scales as s²
    const secondMoment = unitSecondMoment.minSecondMoment * Math.pow(scaleFactor, 4); // scales as s⁴
    const radiusOfGyration = Math.sqrt(secondMoment / area); // cm
    
    return {
        area,
        secondMoment,
        radiusOfGyration,
        unitArea,
        unitSecondMoment: unitSecondMoment.minSecondMoment
    };
}

/**
 * Calculate Euler critical buckling load
 * @param {number} E - Elastic modulus in Pa
 * @param {number} I - Second moment of area in m⁴
 * @param {number} K - Effective length factor
 * @param {number} L - Column length in m
 * @returns {number} Critical load in N
 */
function calculateEulerLoad(E, I, K, L) {
    const effectiveLength = K * L;
    return (Math.PI * Math.PI * E * I) / (effectiveLength * effectiveLength);
}
/**
 * U
nit conversion utilities
 */

/**
 * Convert GPa to Pa
 * @param {number} gpa - Value in GPa
 * @returns {number} Value in Pa
 */
function gpaToPA(gpa) {
    return gpa * 1e9;
}

/**
 * Convert cm to m
 * @param {number} cm - Value in cm
 * @returns {number} Value in m
 */
function cmToM(cm) {
    return cm / 100;
}

/**
 * Convert cm⁴ to m⁴
 * @param {number} cm4 - Value in cm⁴
 * @returns {number} Value in m⁴
 */
function cm4ToM4(cm4) {
    return cm4 / 1e8;
}

/**
 * Convert N to kN
 * @param {number} n - Value in N
 * @returns {number} Value in kN
 */
function nToKN(n) {
    return n / 1000;
}

/**
 * Scaling utilities for equal area and equal perimeter modes
 */

/**
 * Calculate scale factor for equal area mode
 * @param {number} targetArea - Target area in cm²
 * @param {number} unitArea - Unit polygon area
 * @returns {number} Scale factor
 */
function calculateEqualAreaScaleFactor(targetArea, unitArea) {
    return Math.sqrt(targetArea / unitArea);
}

/**
 * Calculate scale factor for equal perimeter mode
 * @param {number} targetPerimeter - Target perimeter in cm
 * @param {number} unitPerimeter - Unit polygon perimeter
 * @returns {number} Scale factor
 */
function calculateEqualPerimeterScaleFactor(targetPerimeter, unitPerimeter) {
    return targetPerimeter / unitPerimeter;
}

/**
 * Calculate perimeter of a regular n-gon with circumradius r
 * @param {number} n - Number of sides
 * @param {number} r - Circumradius
 * @returns {number} Perimeter
 */
function calculatePolygonPerimeter(n, r) {
    const sideLength = 2 * r * Math.sin(Math.PI / n);
    return n * sideLength;
}

/**
 * Calculate radius for circular cross-section in equal area mode
 * @param {number} targetArea - Target area in cm²
 * @returns {number} Radius in cm
 */
function calculateCircleRadiusFromArea(targetArea) {
    return Math.sqrt(targetArea / Math.PI);
}

/**
 * Calculate radius for circular cross-section in equal perimeter mode
 * @param {number} targetPerimeter - Target perimeter in cm
 * @returns {number} Radius in cm
 */
function calculateCircleRadiusFromPerimeter(targetPerimeter) {
    return targetPerimeter / (2 * Math.PI);
}

/**
 * Input validation and range checking functions
 */

/**
 * Validate and clamp a numeric value within specified range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {number} defaultValue - Default value if invalid
 * @returns {number} Validated and clamped value
 */
function validateAndClampValue(value, min, max, defaultValue) {
    if (typeof value !== 'number' || isNaN(value)) {
        return defaultValue;
    }
    return Math.max(min, Math.min(max, value));
}

/**
 * Validate material properties
 * @param {number} E - Elastic modulus in GPa
 * @returns {number} Validated elastic modulus
 */
function validateMaterialE(E) {
    return validateAndClampValue(E, 10, 210, 200);
}

/**
 * Validate column height
 * @param {number} L - Column height in m
 * @returns {number} Validated column height
 */
function validateColumnHeight(L) {
    return validateAndClampValue(L, 0.5, 5.0, 2.0);
}

/**
 * Validate effective length factor
 * @param {number} K - Effective length factor
 * @returns {number} Validated effective length factor
 */
function validateEffectiveLengthFactor(K) {
    const validValues = [0.5, 0.7, 1.0, 2.0];
    if (!validValues.includes(K)) {
        return 1.0; // Default to pinned-pinned
    }
    return K;
}

/**
 * Validate target area
 * @param {number} area - Target area in cm²
 * @returns {number} Validated target area
 */
function validateTargetArea(area) {
    return validateAndClampValue(area, 10, 400, 100);
}

/**
 * Validate target perimeter
 * @param {number} perimeter - Target perimeter in cm
 * @returns {number} Validated target perimeter
 */
function validateTargetPerimeter(perimeter) {
    return validateAndClampValue(perimeter, 20, 400, 120);
}

/**
 * Check for numerical stability issues
 * @param {number} value - Value to check
 * @returns {boolean} True if value is numerically stable
 */
function isNumericallyStable(value) {
    return typeof value === 'number' && 
           isFinite(value) && 
           !isNaN(value) && 
           Math.abs(value) > Number.EPSILON;
}/**

 * Mathematical validation and sanity check functions
 */

/**
 * Test circular cross-section calculations against known theoretical values
 * @returns {Object} Test results with pass/fail status and details
 */
function testCircularCalculations() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test case 1: Unit circle (r = 1 cm)
    const test1 = calculateCircularProperties(1);
    const expectedArea1 = Math.PI;
    const expectedI1 = Math.PI / 4;
    const expectedRg1 = 0.5;
    
    if (Math.abs(test1.area - expectedArea1) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ Unit circle area calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Unit circle area: expected ${expectedArea1}, got ${test1.area}`);
    }
    
    if (Math.abs(test1.secondMoment - expectedI1) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ Unit circle second moment calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Unit circle second moment: expected ${expectedI1}, got ${test1.secondMoment}`);
    }
    
    if (Math.abs(test1.radiusOfGyration - expectedRg1) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ Unit circle radius of gyration calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Unit circle radius of gyration: expected ${expectedRg1}, got ${test1.radiusOfGyration}`);
    }
    
    // Test case 2: Circle with r = 2 cm
    const test2 = calculateCircularProperties(2);
    const expectedArea2 = 4 * Math.PI;
    const expectedI2 = 4 * Math.PI; // π * 2^4 / 4 = 4π
    const expectedRg2 = 1.0;
    
    if (Math.abs(test2.area - expectedArea2) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ r=2 circle area calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ r=2 circle area: expected ${expectedArea2}, got ${test2.area}`);
    }
    
    if (Math.abs(test2.secondMoment - expectedI2) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ r=2 circle second moment calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ r=2 circle second moment: expected ${expectedI2}, got ${test2.secondMoment}`);
    }
    
    return testResults;
}

/**
 * Test polygon area calculations for known shapes
 * @returns {Object} Test results with pass/fail status and details
 */
function testPolygonCalculations() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test equilateral triangle (n=3)
    const triangle = calculatePolygonProperties(3, 1);
    const expectedTriangleArea = 3 * Math.sqrt(3) / 4; // Area of unit circumradius equilateral triangle
    
    if (Math.abs(triangle.unitArea - expectedTriangleArea) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ Unit triangle area calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Unit triangle area: expected ${expectedTriangleArea}, got ${triangle.unitArea}`);
    }
    
    // Test square (n=4)
    const square = calculatePolygonProperties(4, 1);
    const expectedSquareArea = 2; // Area of unit circumradius square
    
    if (Math.abs(square.unitArea - expectedSquareArea) < 1e-10) {
        testResults.passed++;
        testResults.details.push("✓ Unit square area calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Unit square area: expected ${expectedSquareArea}, got ${square.unitArea}`);
    }
    
    // Test that polygon approaches circle as n increases
    const hexagon = calculatePolygonProperties(6, 1);
    const dodecagon = calculatePolygonProperties(12, 1);
    const circleArea = Math.PI; // Unit circle area
    
    if (hexagon.unitArea < dodecagon.unitArea && dodecagon.unitArea < circleArea) {
        testResults.passed++;
        testResults.details.push("✓ Polygon area converges to circle as n increases");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Polygon area convergence test failed");
    }
    
    return testResults;
}

/**
 * Test Euler buckling load calculation
 * @returns {Object} Test results with pass/fail status and details
 */
function testEulerLoadCalculation() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test with known values
    const E = 200e9; // 200 GPa in Pa
    const I = 1e-6; // 1 cm⁴ in m⁴
    const K = 1.0; // Pinned-pinned
    const L = 2.0; // 2 m
    
    const expectedLoad = (Math.PI * Math.PI * E * I) / (K * L * K * L);
    const calculatedLoad = calculateEulerLoad(E, I, K, L);
    
    if (Math.abs(calculatedLoad - expectedLoad) < 1e-6) {
        testResults.passed++;
        testResults.details.push("✓ Euler load calculation correct");
    } else {
        testResults.failed++;
        testResults.details.push(`✗ Euler load: expected ${expectedLoad}, got ${calculatedLoad}`);
    }
    
    // Test scaling behavior
    const doubleI = calculateEulerLoad(E, 2 * I, K, L);
    if (Math.abs(doubleI - 2 * calculatedLoad) < 1e-6) {
        testResults.passed++;
        testResults.details.push("✓ Euler load scales correctly with second moment");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Euler load scaling with second moment failed");
    }
    
    const doubleL = calculateEulerLoad(E, I, K, 2 * L);
    if (Math.abs(doubleL - calculatedLoad / 4) < 1e-6) {
        testResults.passed++;
        testResults.details.push("✓ Euler load scales correctly with length (1/L²)");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Euler load scaling with length failed");
    }
    
    return testResults;
}

/**
 * Test unit conversion functions
 * @returns {Object} Test results with pass/fail status and details
 */
function testUnitConversions() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test GPa to Pa conversion
    if (gpaToPA(200) === 200e9) {
        testResults.passed++;
        testResults.details.push("✓ GPa to Pa conversion correct");
    } else {
        testResults.failed++;
        testResults.details.push("✗ GPa to Pa conversion failed");
    }
    
    // Test cm to m conversion
    if (cmToM(100) === 1.0) {
        testResults.passed++;
        testResults.details.push("✓ cm to m conversion correct");
    } else {
        testResults.failed++;
        testResults.details.push("✗ cm to m conversion failed");
    }
    
    // Test cm⁴ to m⁴ conversion
    if (cm4ToM4(1e8) === 1.0) {
        testResults.passed++;
        testResults.details.push("✓ cm⁴ to m⁴ conversion correct");
    } else {
        testResults.failed++;
        testResults.details.push("✗ cm⁴ to m⁴ conversion failed");
    }
    
    // Test N to kN conversion
    if (nToKN(1000) === 1.0) {
        testResults.passed++;
        testResults.details.push("✓ N to kN conversion correct");
    } else {
        testResults.failed++;
        testResults.details.push("✗ N to kN conversion failed");
    }
    
    return testResults;
}

/**
 * Test numerical stability checks
 * @returns {Object} Test results with pass/fail status and details
 */
function testNumericalStability() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test valid numbers
    if (isNumericallyStable(1.0)) {
        testResults.passed++;
        testResults.details.push("✓ Valid number recognized as stable");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Valid number not recognized as stable");
    }
    
    // Test invalid numbers
    if (!isNumericallyStable(NaN)) {
        testResults.passed++;
        testResults.details.push("✓ NaN correctly identified as unstable");
    } else {
        testResults.failed++;
        testResults.details.push("✗ NaN not identified as unstable");
    }
    
    if (!isNumericallyStable(Infinity)) {
        testResults.passed++;
        testResults.details.push("✓ Infinity correctly identified as unstable");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Infinity not identified as unstable");
    }
    
    // Test very small numbers
    if (!isNumericallyStable(Number.EPSILON / 2)) {
        testResults.passed++;
        testResults.details.push("✓ Very small number correctly identified as unstable");
    } else {
        testResults.failed++;
        testResults.details.push("✗ Very small number not identified as unstable");
    }
    
    return testResults;
}

/**
 * Run comprehensive sanity checks on all mathematical functions
 * @returns {Object} Complete test results with overall pass/fail status
 */
function runSanityChecks() {
    console.log("Running mathematical sanity checks...");
    
    const allResults = {
        circular: testCircularCalculations(),
        polygon: testPolygonCalculations(),
        euler: testEulerLoadCalculation(),
        units: testUnitConversions(),
        stability: testNumericalStability()
    };
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    // Aggregate results
    Object.values(allResults).forEach(result => {
        totalPassed += result.passed;
        totalFailed += result.failed;
    });
    
    const overallResult = {
        passed: totalPassed,
        failed: totalFailed,
        success: totalFailed === 0,
        details: allResults
    };
    
    // Log results
    console.log(`Sanity checks completed: ${totalPassed} passed, ${totalFailed} failed`);
    if (overallResult.success) {
        console.log("✓ All mathematical functions validated successfully");
    } else {
        console.log("✗ Some mathematical functions failed validation");
        Object.entries(allResults).forEach(([category, result]) => {
            if (result.failed > 0) {
                console.log(`${category} failures:`);
                result.details.forEach(detail => {
                    if (detail.startsWith('✗')) {
                        console.log(`  ${detail}`);
                    }
                });
            }
        });
    }
    
    return overallResult;
}

/**
 * Validate edge cases for geometric calculations
 * @returns {Object} Edge case test results
 */
function testEdgeCases() {
    const testResults = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test very small radius
    try {
        const smallCircle = calculateCircularProperties(1e-6);
        if (isNumericallyStable(smallCircle.area) && isNumericallyStable(smallCircle.secondMoment)) {
            testResults.passed++;
            testResults.details.push("✓ Small radius calculation stable");
        } else {
            testResults.failed++;
            testResults.details.push("✗ Small radius calculation unstable");
        }
    } catch (error) {
        testResults.failed++;
        testResults.details.push("✗ Small radius calculation threw error");
    }
    
    // Test large radius
    try {
        const largeCircle = calculateCircularProperties(1e6);
        if (isNumericallyStable(largeCircle.area) && isNumericallyStable(largeCircle.secondMoment)) {
            testResults.passed++;
            testResults.details.push("✓ Large radius calculation stable");
        } else {
            testResults.failed++;
            testResults.details.push("✗ Large radius calculation unstable");
        }
    } catch (error) {
        testResults.failed++;
        testResults.details.push("✗ Large radius calculation threw error");
    }
    
    // Test high-sided polygon
    try {
        const highSidedPolygon = calculatePolygonProperties(100, 1);
        if (isNumericallyStable(highSidedPolygon.area) && isNumericallyStable(highSidedPolygon.secondMoment)) {
            testResults.passed++;
            testResults.details.push("✓ High-sided polygon calculation stable");
        } else {
            testResults.failed++;
            testResults.details.push("✗ High-sided polygon calculation unstable");
        }
    } catch (error) {
        testResults.failed++;
        testResults.details.push("✗ High-sided polygon calculation threw error");
    }
    
    return testResults;
}