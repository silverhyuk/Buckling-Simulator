/**
 * Euler Buckling Visualizer - Main Application
 * Handles UI interactions, state management, and rendering
 */

// Application State
const AppState = {
    selectedShapes: new Set(['circle', 'triangle', 'square', 'pentagon', 'hexagon']),
    parameters: {
        mode: 'equal-area',
        materialE: 200, // GPa
        columnHeight: 2.0, // m
        effectiveLengthFactor: 1.0,
        targetArea: 100, // cm²
        targetPerimeter: 120 // cm
    },
    results: [],
    chart: null
};

// Shape definitions
const SHAPES = {
    circle: { name: 'Circle', sides: null },
    triangle: { name: 'Triangle', sides: 3 },
    square: { name: 'Square', sides: 4 },
    pentagon: { name: 'Pentagon', sides: 5 },
    hexagon: { name: 'Hexagon', sides: 6 },
    heptagon: { name: 'Heptagon', sides: 7 },
    octagon: { name: 'Octagon', sides: 8 },
    nonagon: { name: 'Nonagon', sides: 9 }
};

// Default parameters
const DEFAULT_PARAMETERS = {
    mode: 'equal-area',
    materialE: 200,
    columnHeight: 2.0,
    effectiveLengthFactor: 1.0,
    targetArea: 100,
    targetPerimeter: 120
};

/**
 * Initialize the application with comprehensive startup sequence
 */
function initializeApp() {
    console.log('Initializing Euler Buckling Visualizer...');
    
    try {
        // Show loading state during initialization
        showLoadingState(true);
        
        // Step 1: Run mathematical sanity checks
        console.log('Step 1: Running mathematical validation...');
        const sanityResults = runSanityChecks();
        if (!sanityResults.success) {
            console.warn('Some mathematical functions failed validation:', sanityResults.details);
            announceToScreenReader('일부 수학적 함수 검증에 실패했습니다. 계산 결과가 부정확할 수 있습니다.');
        } else {
            console.log('✓ Mathematical functions validated successfully');
        }
        
        // Step 2: Initialize UI components
        console.log('Step 2: Initializing UI components...');
        initializeShapeSelector();
        initializeEventListeners();
        initializeChart();
        console.log('✓ UI components initialized');
        
        // Step 3: Load default state and validate parameters
        console.log('Step 3: Loading default application state...');
        loadDefaultApplicationState();
        updateUIFromState();
        console.log('✓ Default state loaded');
        
        // Step 4: Initialize export functionality
        console.log('Step 4: Initializing export functionality...');
        initializeExportButtons();
        console.log('✓ Export functionality initialized');
        
        // Step 5: Set up error boundaries and user feedback
        console.log('Step 5: Setting up error handling...');
        setupGlobalErrorHandling();
        setupUserFeedbackSystems();
        console.log('✓ Error handling configured');
        
        // Step 6: Perform initial calculation with default parameters
        console.log('Step 6: Performing initial calculations...');
        setTimeout(() => {
            triggerCalculationUpdate('initialization');
            
            // Hide loading state after initial calculation
            setTimeout(() => {
                showLoadingState(false);
                
                // Announce successful initialization
                announceToScreenReader('오일러 좌굴 시각화 도구가 성공적으로 초기화되었습니다. 매개변수를 조정하여 계산을 시작하세요.');
                
                console.log('✓ Application initialized successfully');
                
                // Log initialization metrics
                logInitializationMetrics();
                
            }, 500);
        }, 100);
        
    } catch (error) {
        console.error('Critical error during application initialization:', error);
        handleInitializationError(error);
    }
}

/**
 * Initialize shape selector checkboxes
 */
function initializeShapeSelector() {
    const shapeGrid = document.querySelector('.shape-grid');
    
    Object.entries(SHAPES).forEach(([key, shape]) => {
        const label = document.createElement('label');
        label.className = 'shape-checkbox';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `shape-${key}`;
        checkbox.value = key;
        checkbox.checked = AppState.selectedShapes.has(key);
        checkbox.setAttribute('aria-describedby', `${key}-description`);
        
        const span = document.createElement('span');
        span.textContent = shape.name;
        
        label.appendChild(checkbox);
        label.appendChild(span);
        shapeGrid.appendChild(label);
        
        // Add event listener
        checkbox.addEventListener('change', handleShapeToggle);
    });
}

/**
 * Initialize all event listeners with enhanced accessibility and performance optimizations
 */
function initializeEventListeners() {
    // Mode selector with enhanced accessibility
    document.querySelectorAll('input[name="comparison-mode"]').forEach(radio => {
        radio.addEventListener('change', handleModeChange);
        
        // Add keyboard navigation enhancements
        radio.addEventListener('keydown', handleRadioKeyNavigation);
        
        // Add focus management
        radio.addEventListener('focus', () => {
            announceToScreenReader(`${radio.nextElementSibling.textContent} 모드 선택됨`);
        });
    });
    
    // Parameter inputs with optimized debouncing and accessibility
    const parameterInputs = [
        'material-e',
        'material-e-slider',
        'column-height',
        'column-height-slider',
        'effective-length-factor',
        'target-area',
        'target-perimeter'
    ];
    
    parameterInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // Use optimized debounce function for performance
            element.addEventListener('input', debounceEnhanced(handleParameterChange, 100));
            
            // Add immediate feedback for slider synchronization
            if (element.type === 'range' || element.type === 'number') {
                element.addEventListener('input', syncInputValues);
                
                // Add keyboard navigation for sliders
                if (element.type === 'range') {
                    element.addEventListener('keydown', handleSliderKeyNavigation);
                }
            }
            
            // Add accessibility enhancements
            element.addEventListener('focus', () => {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label) {
                    announceToScreenReader(`${label.textContent} 입력 필드에 포커스됨`);
                }
            });
            
            // Add value announcement for screen readers
            element.addEventListener('change', () => {
                announceParameterChange(element);
            });
        }
    });
    
    // Reset button with enhanced feedback
    const resetButton = document.getElementById('reset-parameters');
    if (resetButton) {
        resetButton.addEventListener('click', resetToDefaults);
        resetButton.addEventListener('keydown', handleButtonKeyNavigation);
    }
    
    // Export buttons with enhanced accessibility
    const exportCSV = document.getElementById('export-csv');
    const exportChart = document.getElementById('export-chart');
    
    if (exportCSV) {
        exportCSV.addEventListener('click', exportResultsAsCSV);
        exportCSV.addEventListener('keydown', handleButtonKeyNavigation);
    }
    
    if (exportChart) {
        exportChart.addEventListener('click', exportChartAsPNG);
        exportChart.addEventListener('keydown', handleButtonKeyNavigation);
    }
    
    // Animation button with enhanced accessibility
    const animationButton = document.getElementById('compression-animation');
    if (animationButton) {
        animationButton.addEventListener('click', showCompressionAnimation);
        animationButton.addEventListener('keydown', handleButtonKeyNavigation);
    }
    
    // Table sorting with enhanced keyboard support
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', handleTableSort);
        header.addEventListener('keydown', handleTableHeaderKeyNavigation);
        
        // Add focus management
        header.addEventListener('focus', () => {
            const columnName = header.textContent.trim();
            announceToScreenReader(`${columnName} 열 정렬 버튼에 포커스됨`);
        });
    });
    
    // Theme change detection for chart colors and accessibility
    if (window.matchMedia) {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', (e) => {
            updateChartTheme();
            handleThemeChange(e.matches);
        });
        
        // High contrast mode detection
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        highContrastQuery.addEventListener('change', handleHighContrastChange);
        
        // Reduced motion detection
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    }
    
    // Global keyboard navigation
    document.addEventListener('keydown', handleGlobalKeyNavigation);
    
    // Focus management for modal-like interactions
    document.addEventListener('focusin', handleFocusManagement);
    
    // Performance monitoring for interactions
    setupInteractionPerformanceMonitoring();
    
    // Initialize export button state
    initializeExportButtons();
    
    // Set up mobile-specific optimizations
    setupMobileOptimizations();
}

/**
 * Initialize Chart.js chart with custom configuration
 */
function initializeChart() {
    const ctx = document.getElementById('buckling-chart').getContext('2d');
    
    // Define accessibility-compliant color scheme
    const chartColors = {
        primary: 'rgba(0, 102, 204, 0.8)',
        primaryBorder: 'rgba(0, 102, 204, 1)',
        secondary: 'rgba(40, 167, 69, 0.8)',
        secondaryBorder: 'rgba(40, 167, 69, 1)',
        warning: 'rgba(255, 193, 7, 0.8)',
        warningBorder: 'rgba(255, 193, 7, 1)',
        danger: 'rgba(220, 53, 69, 0.8)',
        dangerBorder: 'rgba(220, 53, 69, 1)',
        info: 'rgba(23, 162, 184, 0.8)',
        infoBorder: 'rgba(23, 162, 184, 1)',
        dark: 'rgba(52, 58, 64, 0.8)',
        darkBorder: 'rgba(52, 58, 64, 1)',
        light: 'rgba(248, 249, 250, 0.8)',
        lightBorder: 'rgba(248, 249, 250, 1)',
        purple: 'rgba(111, 66, 193, 0.8)',
        purpleBorder: 'rgba(111, 66, 193, 1)'
    };
    
    // Create color array for multiple bars
    const backgroundColors = [
        chartColors.primary,
        chartColors.secondary,
        chartColors.warning,
        chartColors.danger,
        chartColors.info,
        chartColors.purple,
        chartColors.dark,
        chartColors.light
    ];
    
    const borderColors = [
        chartColors.primaryBorder,
        chartColors.secondaryBorder,
        chartColors.warningBorder,
        chartColors.dangerBorder,
        chartColors.infoBorder,
        chartColors.purpleBorder,
        chartColors.darkBorder,
        chartColors.lightBorder
    ];
    
    AppState.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Critical Load (kN)',
                data: [],
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                borderRadius: 4,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 300,
                easing: 'easeOutQuart'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Critical Buckling Loads by Cross-Section',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    },
                    color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#212529'
                },
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            const value = context.parsed.y;
                            return `Critical Load: ${value.toFixed(2)} kN`;
                        },
                        afterLabel: function(context) {
                            // Add engineering context to tooltip
                            const dataIndex = context.dataIndex;
                            if (AppState.results && AppState.results[dataIndex]) {
                                const result = AppState.results[dataIndex];
                                return [
                                    `Area: ${result.area} cm²`,
                                    `Second Moment: ${result.secondMoment} cm⁴`,
                                    `Slenderness Ratio: ${result.slendernessRatio}`
                                ];
                            }
                            return [];
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Critical Load (kN)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#212529'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6c757d',
                        callback: function(value) {
                            return value.toFixed(1) + ' kN';
                        }
                    },
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#dee2e6',
                        lineWidth: 1
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Cross-Section Shape',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#212529'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6c757d',
                        maxRotation: 45,
                        minRotation: 0
                    },
                    grid: {
                        display: false
                    }
                }
            },
            // Accessibility enhancements
            onHover: function(event, activeElements) {
                event.native.target.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
            },
            onClick: function(event, activeElements) {
                if (activeElements.length > 0) {
                    const dataIndex = activeElements[0].index;
                    if (AppState.results && AppState.results[dataIndex]) {
                        const result = AppState.results[dataIndex];
                        announceToScreenReader(`Selected ${result.name}: Critical load ${result.criticalLoad} kN`);
                    }
                }
            }
        }
    });
    
    // Store chart colors for export functionality
    AppState.chartColors = {
        background: backgroundColors,
        border: borderColors
    };
}

/**
 * Handle shape toggle events
 */
function handleShapeToggle(event) {
    const shapeKey = event.target.value;
    
    if (event.target.checked) {
        AppState.selectedShapes.add(shapeKey);
    } else {
        AppState.selectedShapes.delete(shapeKey);
    }
    
    triggerCalculationUpdate('shape-selection');
}

/**
 * Handle comparison mode changes
 */
function handleModeChange(event) {
    AppState.parameters.mode = event.target.value;
    
    // Show/hide appropriate target controls
    const targetAreaGroup = document.querySelector('.target-area-group');
    const targetPerimeterGroup = document.querySelector('.target-perimeter-group');
    
    if (AppState.parameters.mode === 'equal-area') {
        targetAreaGroup.style.display = 'block';
        targetPerimeterGroup.style.display = 'none';
    } else {
        targetAreaGroup.style.display = 'none';
        targetPerimeterGroup.style.display = 'block';
    }
    
    triggerCalculationUpdate('comparison-mode');
}

/**
 * Handle parameter input changes with enhanced efficiency
 */
function handleParameterChange(event) {
    const id = event.target.id;
    const value = parseFloat(event.target.value);
    const baseId = id.replace('-slider', '');
    
    // Sync slider and number inputs
    if (id.includes('slider')) {
        const numberInput = document.getElementById(baseId);
        if (numberInput && numberInput.value !== value.toString()) {
            numberInput.value = value;
        }
    } else if (document.getElementById(id + '-slider')) {
        const slider = document.getElementById(id + '-slider');
        if (slider && parseFloat(slider.value) !== value) {
            slider.value = value;
        }
    }
    
    // Store previous value for comparison
    const previousValue = getPreviousParameterValue(baseId);
    
    // Update application state with validation
    let newValue;
    switch (baseId) {
        case 'material-e':
            newValue = validateMaterialE(value);
            AppState.parameters.materialE = newValue;
            break;
        case 'column-height':
            newValue = validateColumnHeight(value);
            AppState.parameters.columnHeight = newValue;
            break;
        case 'effective-length-factor':
            newValue = validateEffectiveLengthFactor(value);
            AppState.parameters.effectiveLengthFactor = newValue;
            break;
        case 'target-area':
            newValue = validateTargetArea(value);
            AppState.parameters.targetArea = newValue;
            break;
        case 'target-perimeter':
            newValue = validateTargetPerimeter(value);
            AppState.parameters.targetPerimeter = newValue;
            break;
        default:
            console.warn(`Unknown parameter: ${baseId}`);
            return;
    }
    
    // Update UI if value was clamped during validation
    if (newValue !== value) {
        event.target.value = newValue;
        if (id.includes('slider')) {
            const numberInput = document.getElementById(baseId);
            if (numberInput) numberInput.value = newValue;
        } else {
            const slider = document.getElementById(baseId + '-slider');
            if (slider) slider.value = newValue;
        }
    }
    
    // Only trigger update if value actually changed significantly
    if (hasSignificantParameterChange({ [baseId]: newValue }, { [baseId]: previousValue })) {
        triggerCalculationUpdate('parameter-change');
    } else {
        console.log(`Parameter ${baseId} change too small to trigger recalculation`);
    }
}

/**
 * Get previous parameter value for change detection
 * @param {string} parameterName - Name of parameter
 * @returns {number} Previous value
 */
function getPreviousParameterValue(parameterName) {
    switch (parameterName) {
        case 'material-e':
            return AppState.parameters.materialE;
        case 'column-height':
            return AppState.parameters.columnHeight;
        case 'effective-length-factor':
            return AppState.parameters.effectiveLengthFactor;
        case 'target-area':
            return AppState.parameters.targetArea;
        case 'target-perimeter':
            return AppState.parameters.targetPerimeter;
        default:
            return null;
    }
}

/**
 * Get current parameter value for change detection
 * @param {string} parameterName - Name of parameter
 * @returns {number} Current value
 */
function getCurrentParameterValue(parameterName) {
    switch (parameterName) {
        case 'material-e':
            return AppState.parameters.materialE;
        case 'column-height':
            return AppState.parameters.columnHeight;
        case 'effective-length-factor':
            return AppState.parameters.effectiveLengthFactor;
        case 'target-area':
            return AppState.parameters.targetArea;
        case 'target-perimeter':
            return AppState.parameters.targetPerimeter;
        default:
            return null;
    }
}

/**
 * Reset all parameters to defaults
 */
function resetToDefaults() {
    // Reset parameters
    AppState.parameters = { ...DEFAULT_PARAMETERS };
    
    // Reset selected shapes
    AppState.selectedShapes = new Set(['circle', 'triangle', 'square', 'pentagon', 'hexagon']);
    
    // Update UI
    updateUIFromState();
    
    // Trigger calculation update
    triggerCalculationUpdate('reset');
    
    // Announce reset to screen readers
    announceToScreenReader('모든 매개변수가 기본값으로 재설정되었습니다.');
}

/**
 * Update UI elements from current state
 */
function updateUIFromState() {
    // Update shape checkboxes
    Object.keys(SHAPES).forEach(key => {
        const checkbox = document.getElementById(`shape-${key}`);
        if (checkbox) {
            checkbox.checked = AppState.selectedShapes.has(key);
        }
    });
    
    // Update mode radio buttons
    document.querySelector(`input[value="${AppState.parameters.mode}"]`).checked = true;
    
    // Update parameter inputs
    document.getElementById('material-e').value = AppState.parameters.materialE;
    document.getElementById('material-e-slider').value = AppState.parameters.materialE;
    document.getElementById('column-height').value = AppState.parameters.columnHeight;
    document.getElementById('column-height-slider').value = AppState.parameters.columnHeight;
    document.getElementById('effective-length-factor').value = AppState.parameters.effectiveLengthFactor;
    document.getElementById('target-area').value = AppState.parameters.targetArea;
    document.getElementById('target-perimeter').value = AppState.parameters.targetPerimeter;
    
    // Show/hide target controls based on mode
    handleModeChange({ target: { value: AppState.parameters.mode } });
}

/**
 * Debounce function to limit calculation frequency
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance tracking for calculation optimization
let calculationMetrics = {
    totalCalculations: 0,
    averageTime: 0,
    maxTime: 0,
    lastCalculationTime: 0
};

/**
 * Debounced calculation update function
 * Ensures calculations complete within 100ms requirement
 */
const debouncedCalculationUpdate = debounce(() => {
    const startTime = performance.now();
    
    try {
        // Show loading state immediately
        showLoadingState(true);
        
        // Perform calculations with performance monitoring
        updateCalculationsAndDisplay();
        
        const endTime = performance.now();
        const calculationTime = endTime - startTime;
        
        // Update performance metrics
        updateCalculationMetrics(calculationTime);
        
        console.log(`Calculations completed in ${calculationTime.toFixed(2)}ms`);
        
        // Ensure we meet the 100ms requirement
        if (calculationTime > 100) {
            console.warn(`Calculation time (${calculationTime.toFixed(2)}ms) exceeded 100ms requirement`);
            // Announce performance issue to screen readers
            announceToScreenReader('계산이 예상보다 오래 걸렸습니다.');
        }
        
    } catch (error) {
        console.error('Error during calculation update:', error);
        announceToScreenReader('계산 중 오류가 발생했습니다.');
        
        // Clear results on error to prevent stale data
        clearResults();
    } finally {
        // Always hide loading state
        showLoadingState(false);
    }
}, 100);

/**
 * Show/hide loading state during calculations
 * @param {boolean} isLoading - Whether to show loading state
 */
function showLoadingState(isLoading) {
    const chartContainer = document.querySelector('.chart-container');
    const tableContainer = document.querySelector('.table-container');
    const previewContainer = document.querySelector('.preview-container');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (isLoading) {
        // Add loading visual feedback to containers
        [chartContainer, tableContainer, previewContainer].forEach(container => {
            if (container) {
                container.style.opacity = '0.6';
                container.style.pointerEvents = 'none';
                container.style.transition = 'opacity 0.2s ease';
                
                // Add loading class for CSS styling
                container.classList.add('loading');
            }
        });
        
        // Show loading indicator if it exists
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
            loadingIndicator.setAttribute('aria-hidden', 'false');
        }
        
        // Update live region for screen readers
        announceToScreenReader('계산 중입니다...');
        
        // Disable parameter inputs during calculation to prevent race conditions
        disableParameterInputs(true);
        
    } else {
        // Remove loading visual feedback from containers
        [chartContainer, tableContainer, previewContainer].forEach(container => {
            if (container) {
                container.style.opacity = '1';
                container.style.pointerEvents = 'auto';
                
                // Remove loading class
                container.classList.remove('loading');
            }
        });
        
        // Hide loading indicator
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
            loadingIndicator.setAttribute('aria-hidden', 'true');
        }
        
        // Re-enable parameter inputs
        disableParameterInputs(false);
    }
}

// Cache for previous calculation state to enable efficient updates
let previousCalculationState = null;

/**
 * Efficient update mechanism that only recalculates when necessary
 * @param {string} changeType - Type of change that triggered update
 */
function triggerCalculationUpdate(changeType = 'parameter') {
    // Check if we have selected shapes
    if (AppState.selectedShapes.size === 0) {
        console.log('No shapes selected, skipping calculation');
        clearResults();
        return;
    }
    
    // Validate parameters before calculation
    if (!validateCurrentParameters()) {
        console.log('Invalid parameters, skipping calculation');
        return;
    }
    
    // Check if calculation is actually needed (efficient update mechanism)
    const currentState = getCurrentCalculationState();
    if (shouldSkipCalculation(currentState, changeType)) {
        console.log(`Skipping calculation - no meaningful changes detected for ${changeType}`);
        return;
    }
    
    console.log(`Triggering calculation update due to: ${changeType}`);
    
    // Store current state for next comparison
    previousCalculationState = currentState;
    
    // Trigger debounced calculation
    debouncedCalculationUpdate();
}

/**
 * Clear results when no shapes are selected
 */
function clearResults() {
    AppState.results = [];
    updateChart();
    updateResultsTable();
    updateCrossSectionPreview();
    updateExportButtonState();
    announceToScreenReader('모든 형상이 선택 해제되었습니다.');
}

/**
 * Validate current parameters before calculation
 * @returns {boolean} True if parameters are valid
 */
function validateCurrentParameters() {
    const params = AppState.parameters;
    
    // Check material properties
    if (!isNumericallyStable(params.materialE) || params.materialE < 10 || params.materialE > 210) {
        return false;
    }
    
    // Check geometric properties
    if (!isNumericallyStable(params.columnHeight) || params.columnHeight < 0.5 || params.columnHeight > 5.0) {
        return false;
    }
    
    // Check effective length factor
    const validKValues = [0.5, 0.7, 1.0, 2.0];
    if (!validKValues.includes(params.effectiveLengthFactor)) {
        return false;
    }
    
    // Check target values based on mode
    if (params.mode === 'equal-area') {
        if (!isNumericallyStable(params.targetArea) || params.targetArea < 10 || params.targetArea > 400) {
            return false;
        }
    } else {
        if (!isNumericallyStable(params.targetPerimeter) || params.targetPerimeter < 20 || params.targetPerimeter > 400) {
            return false;
        }
    }
    
    return true;
}

/**
 * Main calculation orchestration function
 * Processes all selected shapes and updates results
 */
function calculateAllShapes() {
    const results = [];
    const params = AppState.parameters;
    
    try {
        // Process each selected shape
        for (const shapeKey of AppState.selectedShapes) {
            const shape = SHAPES[shapeKey];
            let shapeResult;
            
            if (shapeKey === 'circle') {
                shapeResult = calculateCircleResult(shape, params);
            } else {
                shapeResult = calculatePolygonResult(shape, params);
            }
            
            if (shapeResult) {
                results.push(shapeResult);
            }
        }
        
        // Sort results by critical load (descending)
        results.sort((a, b) => b.criticalLoad - a.criticalLoad);
        
        return results;
        
    } catch (error) {
        console.error('Error in calculation orchestration:', error);
        return [];
    }
}

/**
 * Calculate properties and buckling load for circular cross-section
 * @param {Object} shape - Shape definition
 * @param {Object} params - Calculation parameters
 * @returns {Object} Formatted result object
 */
function calculateCircleResult(shape, params) {
    try {
        let radius;
        
        // Determine radius based on comparison mode
        if (params.mode === 'equal-area') {
            radius = calculateCircleRadiusFromArea(params.targetArea);
        } else {
            radius = calculateCircleRadiusFromPerimeter(params.targetPerimeter);
        }
        
        // Calculate geometric properties
        const properties = calculateCircularProperties(radius);
        
        // Calculate buckling parameters
        const slendernessRatio = (params.effectiveLengthFactor * params.columnHeight * 100) / properties.radiusOfGyration;
        
        // Convert units and calculate critical load
        const E_Pa = gpaToPA(params.materialE);
        const I_m4 = cm4ToM4(properties.secondMoment);
        const criticalLoad_N = calculateEulerLoad(E_Pa, I_m4, params.effectiveLengthFactor, params.columnHeight);
        const criticalLoad_kN = nToKN(criticalLoad_N);
        
        return {
            name: shape.name,
            type: 'circle',
            sides: null,
            area: formatNumber(properties.area, 2),
            secondMoment: formatNumber(properties.secondMoment, 4),
            radiusOfGyration: formatNumber(properties.radiusOfGyration, 3),
            slendernessRatio: formatNumber(slendernessRatio, 1),
            criticalLoad: formatNumber(criticalLoad_kN, 2),
            // Raw values for sorting and calculations
            _rawCriticalLoad: criticalLoad_kN,
            _rawArea: properties.area,
            _rawSecondMoment: properties.secondMoment
        };
        
    } catch (error) {
        console.error(`Error calculating circle properties:`, error);
        return createFallbackResult(shape.name, 'circle');
    }
}

/**
 * Calculate properties and buckling load for polygon cross-section
 * @param {Object} shape - Shape definition
 * @param {Object} params - Calculation parameters
 * @returns {Object} Formatted result object
 */
function calculatePolygonResult(shape, params) {
    try {
        const n = shape.sides;
        let scaleFactor;
        
        // Calculate unit polygon properties
        const unitVertices = generateUnitPolygonVertices(n);
        const unitArea = calculatePolygonAreaShoelace(unitVertices);
        const unitPerimeter = calculatePolygonPerimeter(n, 1);
        
        // Determine scale factor based on comparison mode
        if (params.mode === 'equal-area') {
            scaleFactor = calculateEqualAreaScaleFactor(params.targetArea, unitArea);
        } else {
            scaleFactor = calculateEqualPerimeterScaleFactor(params.targetPerimeter, unitPerimeter);
        }
        
        // Calculate scaled properties
        const properties = calculatePolygonProperties(n, scaleFactor);
        
        // Calculate buckling parameters
        const slendernessRatio = (params.effectiveLengthFactor * params.columnHeight * 100) / properties.radiusOfGyration;
        
        // Convert units and calculate critical load
        const E_Pa = gpaToPA(params.materialE);
        const I_m4 = cm4ToM4(properties.secondMoment);
        const criticalLoad_N = calculateEulerLoad(E_Pa, I_m4, params.effectiveLengthFactor, params.columnHeight);
        const criticalLoad_kN = nToKN(criticalLoad_N);
        
        return {
            name: shape.name,
            type: 'polygon',
            sides: n,
            area: formatNumber(properties.area, 2),
            secondMoment: formatNumber(properties.secondMoment, 4),
            radiusOfGyration: formatNumber(properties.radiusOfGyration, 3),
            slendernessRatio: formatNumber(slendernessRatio, 1),
            criticalLoad: formatNumber(criticalLoad_kN, 2),
            // Raw values for sorting and calculations
            _rawCriticalLoad: criticalLoad_kN,
            _rawArea: properties.area,
            _rawSecondMoment: properties.secondMoment
        };
        
    } catch (error) {
        console.error(`Error calculating ${shape.name} properties:`, error);
        return createFallbackResult(shape.name, 'polygon', shape.sides);
    }
}

/**
 * Create fallback result for error cases
 * @param {string} name - Shape name
 * @param {string} type - Shape type
 * @param {number} sides - Number of sides (for polygons)
 * @returns {Object} Fallback result object
 */
function createFallbackResult(name, type, sides = null) {
    return {
        name: name,
        type: type,
        sides: sides,
        area: 'Error',
        secondMoment: 'Error',
        radiusOfGyration: 'Error',
        slendernessRatio: 'Error',
        criticalLoad: 'Error',
        _rawCriticalLoad: 0,
        _rawArea: 0,
        _rawSecondMoment: 0
    };
}

/**
 * Format number for display with specified decimal places
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
function formatNumber(value, decimals) {
    if (!isNumericallyStable(value)) {
        return 'N/A';
    }
    return value.toFixed(decimals);
}

/**
 * Update calculations and display
 */
function updateCalculationsAndDisplay() {
    console.log('Updating calculations and display...');
    console.log('Selected shapes:', Array.from(AppState.selectedShapes));
    console.log('Parameters:', AppState.parameters);
    
    try {
        // Perform calculations
        AppState.results = calculateAllShapes();
        
        // Check if calculations were successful
        if (AppState.results.length === 0 && AppState.selectedShapes.size > 0) {
            console.warn('No valid results generated despite having selected shapes');
            announceToScreenReader('계산 결과를 생성할 수 없습니다. 매개변수를 확인해주세요.');
            return;
        }
        
        // Update all display components
        updateChart();
        updateResultsTable();
        updateCrossSectionPreview();
        updateExportButtonState();
        
        // Announce successful update to screen readers
        const resultCount = AppState.results.length;
        announceToScreenReader(`${resultCount}개 형상에 대한 계산이 완료되었습니다.`);
        
    } catch (error) {
        console.error('Error in updateCalculationsAndDisplay:', error);
        
        // Clear results on error
        AppState.results = [];
        updateChart();
        updateResultsTable();
        updateCrossSectionPreview();
        
        // Announce error to screen readers
        announceToScreenReader('계산 중 오류가 발생했습니다.');
    }
}

/**
 * Parameter validation functions
 */
function validateMaterialE(value) {
    return validateAndClampValue(value, 10, 210, 200);
}

function validateColumnHeight(value) {
    return validateAndClampValue(value, 0.5, 5.0, 2.0);
}

function validateEffectiveLengthFactor(value) {
    const validValues = [0.5, 0.7, 1.0, 2.0];
    if (!validValues.includes(value)) {
        return 1.0; // Default to pinned-pinned
    }
    return value;
}

function validateTargetArea(value) {
    return validateAndClampValue(value, 10, 400, 100);
}

function validateTargetPerimeter(value) {
    return validateAndClampValue(value, 20, 400, 120);
}

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
 * Update Chart.js bar chart with current results and dynamic data changes
 */
function updateChart() {
    if (!AppState.chart || !AppState.results) {
        // Clear chart if no results
        if (AppState.chart) {
            AppState.chart.data.labels = [];
            AppState.chart.data.datasets[0].data = [];
            AppState.chart.update('none');
        }
        return;
    }
    
    const labels = AppState.results.map(result => result.name);
    const data = AppState.results.map(result => result._rawCriticalLoad);
    
    // Update chart data
    AppState.chart.data.labels = labels;
    AppState.chart.data.datasets[0].data = data;
    
    // Update colors to match number of data points
    const numBars = data.length;
    const backgroundColors = AppState.chartColors.background.slice(0, numBars);
    const borderColors = AppState.chartColors.border.slice(0, numBars);
    
    // Extend colors if we have more bars than colors
    while (backgroundColors.length < numBars) {
        backgroundColors.push(...AppState.chartColors.background);
        borderColors.push(...AppState.chartColors.border);
    }
    
    AppState.chart.data.datasets[0].backgroundColor = backgroundColors.slice(0, numBars);
    AppState.chart.data.datasets[0].borderColor = borderColors.slice(0, numBars);
    
    // Update chart with smooth animation for better UX
    AppState.chart.update('active');
    
    // Update chart title based on comparison mode
    const modeText = AppState.parameters.mode === 'equal-area' ? 'Equal Area' : 'Equal Perimeter';
    AppState.chart.options.plugins.title.text = `Critical Buckling Loads by Cross-Section (${modeText})`;
    
    // Announce chart update to screen readers
    const maxLoad = Math.max(...data);
    const maxLoadShape = AppState.results.find(r => r._rawCriticalLoad === maxLoad);
    if (maxLoadShape) {
        announceToScreenReader(`Chart updated. Highest critical load: ${maxLoadShape.name} with ${maxLoadShape.criticalLoad} kN`);
    }
}

/**
 * Update results table with current calculations
 * Enhanced with proper formatting and responsive design
 */
function updateResultsTable() {
    const tbody = document.querySelector('#results-table tbody');
    if (!tbody) {
        console.warn('Results table tbody not found');
        return;
    }
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    // Handle empty results
    if (!AppState.results || AppState.results.length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="6" class="empty-results">
                형상을 선택하여 계산 결과를 확인하세요
            </td>
        `;
        tbody.appendChild(emptyRow);
        return;
    }
    
    // Create document fragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    
    // Add rows for each result with proper formatting
    AppState.results.forEach((result, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-shape', result.name);
        row.setAttribute('data-index', index);
        
        // Add hover tooltip with additional information
        row.title = `${result.name}: ${result.type === 'circle' ? '원형' : result.sides + '각형'} 단면`;
        
        row.innerHTML = `
            <td class="shape-name" data-label="형상">
                <span class="shape-type-indicator ${result.type}"></span>
                ${result.name}
                ${result.sides ? `<small class="sides-count">(${result.sides}각형)</small>` : ''}
            </td>
            <td class="numerical-value" data-label="면적 (cm²)">
                ${formatTableValue(result.area, 'area')}
            </td>
            <td class="numerical-value" data-label="I (cm⁴)">
                ${formatTableValue(result.secondMoment, 'moment')}
            </td>
            <td class="numerical-value" data-label="r (cm)">
                ${formatTableValue(result.radiusOfGyration, 'radius')}
            </td>
            <td class="numerical-value" data-label="λ">
                ${formatTableValue(result.slendernessRatio, 'ratio')}
            </td>
            <td class="numerical-value critical-load" data-label="P_cr (kN)">
                ${formatTableValue(result.criticalLoad, 'load')}
            </td>
        `;
        
        // Add accessibility attributes
        row.setAttribute('role', 'row');
        row.querySelectorAll('td').forEach(cell => {
            cell.setAttribute('role', 'cell');
        });
        
        fragment.appendChild(row);
    });
    
    tbody.appendChild(fragment);
    
    // Update table accessibility
    updateTableAccessibility();
    
    // Announce table update to screen readers
    announceToScreenReader(`결과 표가 업데이트되었습니다. ${AppState.results.length}개의 형상 데이터가 표시됩니다.`);
}

/**
 * Format table values with appropriate precision and units
 * @param {string|number} value - Value to format
 * @param {string} type - Type of value for specific formatting
 * @returns {string} Formatted value with proper styling
 */
function formatTableValue(value, type) {
    if (value === 'Error' || value === 'N/A') {
        return `<span class="error-value" title="계산 오류">${value}</span>`;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return `<span class="invalid-value" title="유효하지 않은 값">${value}</span>`;
    }
    
    let formattedValue;
    let className = 'valid-value';
    
    switch (type) {
        case 'area':
            formattedValue = numValue.toFixed(2);
            className += ' area-value';
            break;
        case 'moment':
            // Use scientific notation for very small or large values
            if (numValue < 0.01 || numValue > 10000) {
                formattedValue = numValue.toExponential(3);
            } else {
                formattedValue = numValue.toFixed(4);
            }
            className += ' moment-value';
            break;
        case 'radius':
            formattedValue = numValue.toFixed(3);
            className += ' radius-value';
            break;
        case 'ratio':
            formattedValue = numValue.toFixed(1);
            className += ' ratio-value';
            break;
        case 'load':
            formattedValue = numValue.toFixed(2);
            className += ' load-value';
            // Highlight highest load
            if (AppState.results && numValue === Math.max(...AppState.results.map(r => parseFloat(r.criticalLoad)))) {
                className += ' highest-load';
            }
            break;
        default:
            formattedValue = numValue.toString();
    }
    
    return `<span class="${className}" title="${formattedValue}">${formattedValue}</span>`;
}

/**
 * Update table accessibility attributes and descriptions
 */
function updateTableAccessibility() {
    const table = document.getElementById('results-table');
    if (!table) return;
    
    const rowCount = AppState.results ? AppState.results.length : 0;
    const caption = table.querySelector('caption');
    
    if (caption) {
        caption.textContent = `${rowCount}개 형상의 상세한 공학적 특성과 임계 좌굴 하중`;
    }
    
    // Update table description
    const tableDescription = document.getElementById('table-description');
    if (tableDescription) {
        tableDescription.textContent = `${rowCount}개의 선택된 형상에 대해 계산된 공학적 특성을 보여주는 표입니다. 열 제목을 클릭하여 정렬할 수 있습니다.`;
    }
    
    // Update sort indicators accessibility
    document.querySelectorAll('.sortable').forEach(header => {
        const sortDirection = header.classList.contains('sort-asc') ? '오름차순' : 
                             header.classList.contains('sort-desc') ? '내림차순' : '정렬 안됨';
        header.setAttribute('aria-sort', 
            header.classList.contains('sort-asc') ? 'ascending' : 
            header.classList.contains('sort-desc') ? 'descending' : 'none'
        );
        header.title = `${header.textContent.trim()} - 클릭하여 정렬 (현재: ${sortDirection})`;
    });
}

/**
 * Update cross-section preview SVG with current results
 */
function updateCrossSectionPreview() {
    console.log('Updating cross-section preview...');
    
    const svg = document.getElementById('cross-section-svg');
    if (!svg) {
        console.warn('Cross-section SVG element not found');
        return;
    }
    
    // Clear existing content
    svg.innerHTML = '';
    
    // Handle empty results
    if (!AppState.results || AppState.results.length === 0) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '200');
        text.setAttribute('y', '100');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', 'var(--text-secondary)');
        text.setAttribute('font-size', '16');
        text.textContent = '형상을 선택하여 미리보기를 확인하세요';
        svg.appendChild(text);
        return;
    }
    
    // Calculate layout for shapes
    const layout = calculateShapeLayout(AppState.results.length);
    
    // Render each shape
    AppState.results.forEach((result, index) => {
        const position = layout.positions[index];
        renderShape(svg, result, position, layout.shapeSize);
    });
    
    // Update SVG description for accessibility
    updateSVGDescription();
}

/**
 * Update chart theme colors based on current theme
 */
function updateChartTheme() {
    if (!AppState.chart) return;
    
    // Get current theme colors
    const textPrimary = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#212529';
    const textSecondary = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#6c757d';
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border-color').trim() || '#dee2e6';
    
    // Update chart colors
    AppState.chart.options.plugins.title.color = textPrimary;
    AppState.chart.options.scales.y.title.color = textPrimary;
    AppState.chart.options.scales.x.title.color = textPrimary;
    AppState.chart.options.scales.y.ticks.color = textSecondary;
    AppState.chart.options.scales.x.ticks.color = textSecondary;
    AppState.chart.options.scales.y.grid.color = borderColor;
    
    // Update chart
    AppState.chart.update('none');
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        // Clear after a delay to allow for re-announcements
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

/**
 * Export results as CSV file with proper formatting and headers
 */
function exportResultsAsCSV() {
    console.log('Exporting results as CSV...');
    
    // Validate data before export
    const validation = validateDataForCSVExport();
    if (!validation.success) {
        console.error('CSV export validation failed:', validation.message);
        announceToScreenReader(`CSV를 내보낼 수 없습니다: ${validation.message}`);
        return;
    }
    
    try {
        // Generate CSV content
        const csvContent = generateCSVContent();
        
        // Validate CSV content
        if (!csvContent || csvContent.trim().length === 0) {
            throw new Error('Generated CSV content is empty');
        }
        
        // Generate filename
        const filename = generateCSVExportFilename();
        
        // Create and trigger download
        downloadCSVFile(csvContent, filename);
        
        // Log success
        console.log(`CSV exported successfully as: ${filename}`);
        announceToScreenReader(`결과가 ${filename}으로 성공적으로 내보내졌습니다.`);
        
        // Track export for analytics
        trackCSVExport(filename, AppState.results.length);
        
    } catch (error) {
        console.error('Error exporting CSV:', error);
        announceToScreenReader('CSV 내보내기 중 오류가 발생했습니다.');
        
        // Fallback: try alternative export method
        tryAlternativeCSVExport();
    }
}

/**
 * Validate data before CSV export
 * @returns {Object} Validation result with success flag and message
 */
function validateDataForCSVExport() {
    if (!AppState.results || AppState.results.length === 0) {
        return {
            success: false,
            message: 'No data to export'
        };
    }
    
    // Check if results contain valid data
    const hasValidData = AppState.results.some(result => 
        result.name && 
        result.area !== 'Error' && 
        result.secondMoment !== 'Error' &&
        result.criticalLoad !== 'Error'
    );
    
    if (!hasValidData) {
        return {
            success: false,
            message: 'No valid calculation results to export'
        };
    }
    
    return {
        success: true,
        message: 'Data ready for export'
    };
}

/**
 * Generate CSV content from current results
 * @returns {string} CSV formatted content
 */
function generateCSVContent() {
    const headers = [
        'Shape Name',
        'Type',
        'Sides',
        'Area (cm²)',
        'Second Moment (cm⁴)',
        'Radius of Gyration (cm)',
        'Slenderness Ratio',
        'Critical Load (kN)'
    ];
    
    // Add metadata headers
    const metadata = generateCSVMetadata();
    const metadataLines = Object.entries(metadata).map(([key, value]) => 
        `# ${key}: ${value}`
    );
    
    // Create CSV rows
    const dataRows = AppState.results.map(result => {
        return [
            escapeCSVField(result.name),
            escapeCSVField(result.type),
            result.sides || '',
            formatCSVNumber(result.area),
            formatCSVNumber(result.secondMoment),
            formatCSVNumber(result.radiusOfGyration),
            formatCSVNumber(result.slendernessRatio),
            formatCSVNumber(result.criticalLoad)
        ].join(',');
    });
    
    // Combine all parts
    const csvLines = [
        ...metadataLines,
        '', // Empty line separator
        headers.join(','),
        ...dataRows
    ];
    
    return csvLines.join('\n');
}

/**
 * Generate metadata for CSV export
 * @returns {Object} Metadata object
 */
function generateCSVMetadata() {
    const now = new Date();
    return {
        'Export Date': now.toISOString(),
        'Application': 'Euler Buckling Visualizer',
        'Comparison Mode': AppState.parameters.mode === 'equal-area' ? 'Equal Area' : 'Equal Perimeter',
        'Material E (GPa)': AppState.parameters.materialE,
        'Column Height (m)': AppState.parameters.columnHeight,
        'Effective Length Factor': AppState.parameters.effectiveLengthFactor,
        'Target Area (cm²)': AppState.parameters.mode === 'equal-area' ? AppState.parameters.targetArea : 'N/A',
        'Target Perimeter (cm)': AppState.parameters.mode === 'equal-perimeter' ? AppState.parameters.targetPerimeter : 'N/A',
        'Selected Shapes': Array.from(AppState.selectedShapes).join('; '),
        'Number of Results': AppState.results.length
    };
}

/**
 * Escape CSV field to handle commas, quotes, and newlines
 * @param {string} field - Field to escape
 * @returns {string} Escaped field
 */
function escapeCSVField(field) {
    if (typeof field !== 'string') {
        field = String(field);
    }
    
    // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    
    return field;
}

/**
 * Format number for CSV export
 * @param {string|number} value - Value to format
 * @returns {string} Formatted value
 */
function formatCSVNumber(value) {
    if (value === 'Error' || value === 'N/A') {
        return value;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
        return 'N/A';
    }
    
    // Use consistent decimal places for CSV
    return numValue.toString();
}

/**
 * Generate standardized filename for CSV export
 * @returns {string} Generated filename
 */
function generateCSVExportFilename() {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const modeText = AppState.parameters.mode === 'equal-area' ? 'equal-area' : 'equal-perimeter';
    const shapesCount = AppState.selectedShapes.size;
    
    return `euler-buckling-results-${modeText}-${shapesCount}shapes-${timestamp}.csv`;
}

/**
 * Download CSV file using blob and URL.createObjectURL
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Filename for download
 */
function downloadCSVFile(csvContent, filename) {
    // Create blob with proper MIME type and BOM for Excel compatibility
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
    });
    
    // Check if blob was created successfully
    if (!blob || blob.size === 0) {
        throw new Error('Failed to create CSV blob');
    }
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    
    // Add to DOM, click, and cleanup
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up object URL
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Track CSV export for analytics
 * @param {string} filename - Exported filename
 * @param {number} dataPoints - Number of data points exported
 * @param {string} method - Export method used ('standard' or 'alternative')
 */
function trackCSVExport(filename, dataPoints, method = 'standard') {
    const exportEvent = {
        type: 'csv_export',
        method: method,
        filename: filename,
        dataPoints: dataPoints,
        mode: AppState.parameters.mode,
        selectedShapes: Array.from(AppState.selectedShapes),
        timestamp: new Date().toISOString(),
        parameters: {
            materialE: AppState.parameters.materialE,
            columnHeight: AppState.parameters.columnHeight,
            effectiveLengthFactor: AppState.parameters.effectiveLengthFactor,
            targetArea: AppState.parameters.targetArea,
            targetPerimeter: AppState.parameters.targetPerimeter
        },
        browserInfo: {
            userAgent: navigator.userAgent,
            blobSupport: isCSVExportSupported()
        }
    };
    
    console.log('CSV export tracked:', exportEvent);
    
    // Store in localStorage for potential analytics collection
    try {
        const existingExports = JSON.parse(localStorage.getItem('euler-csv-exports') || '[]');
        existingExports.push(exportEvent);
        
        // Keep only last 10 exports to avoid storage bloat
        if (existingExports.length > 10) {
            existingExports.splice(0, existingExports.length - 10);
        }
        
        localStorage.setItem('euler-csv-exports', JSON.stringify(existingExports));
    } catch (storageError) {
        console.warn('Failed to store CSV export event in localStorage:', storageError);
    }
}

/**
 * Alternative CSV export method for fallback
 */
function tryAlternativeCSVExport() {
    try {
        console.log('Attempting alternative CSV export method...');
        
        // Generate simple CSV without metadata
        const headers = ['Shape', 'Area', 'Second Moment', 'Radius of Gyration', 'Slenderness Ratio', 'Critical Load'];
        const rows = AppState.results.map(result => [
            result.name,
            result.area,
            result.secondMoment,
            result.radiusOfGyration,
            result.slendernessRatio,
            result.criticalLoad
        ].join(','));
        
        const simpleCSV = [headers.join(','), ...rows].join('\n');
        
        // Try data URI method
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(simpleCSV);
        const filename = generateCSVExportFilename().replace('.csv', '-simple.csv');
        
        const downloadLink = document.createElement('a');
        downloadLink.href = dataUri;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`Alternative CSV export successful: ${filename}`);
        announceToScreenReader(`간단한 형식의 CSV가 ${filename}으로 내보내졌습니다.`);
        
        // Track alternative export
        trackCSVExport(filename, AppState.results.length, 'alternative');
        
    } catch (alternativeError) {
        console.error('Alternative CSV export also failed:', alternativeError);
        announceToScreenReader('CSV 내보내기에 실패했습니다. 브라우저가 이 기능을 지원하지 않을 수 있습니다.');
        
        // Final fallback: show manual copy instructions
        showManualCSVInstructions();
    }
}

/**
 * Show instructions for manual CSV creation as final fallback
 */
function showManualCSVInstructions() {
    const csvData = generateCSVContent();
    
    console.log('Manual CSV data:');
    console.log(csvData);
    
    announceToScreenReader('자동 CSV 내보내기가 실패했습니다. 콘솔에서 데이터를 복사하여 텍스트 파일로 저장하세요.');
    
    // Could show a modal with the CSV data for manual copying
    // For now, just log to console
}

/**
 * Check if CSV export is supported by the browser
 * @returns {boolean} True if export is supported
 */
function isCSVExportSupported() {
    try {
        // Check if Blob and URL.createObjectURL are supported
        return typeof Blob !== 'undefined' && 
               typeof URL !== 'undefined' && 
               typeof URL.createObjectURL === 'function';
    } catch (error) {
        return false;
    }
}

/**
 * Export chart as PNG using Chart.js built-in functionality
 */
function exportChartAsPNG() {
    console.log('Exporting chart as PNG...');
    
    // Validate chart state before export
    const validation = validateChartForExport();
    if (!validation.success) {
        console.error('Chart export validation failed:', validation.message);
        announceToScreenReader(`차트를 내보낼 수 없습니다: ${validation.message}`);
        return;
    }
    
    try {
        // Generate standardized filename
        const filename = generateChartExportFilename();
        
        // Get chart canvas as data URL with maximum quality
        const canvas = AppState.chart.canvas;
        const dataURL = canvas.toDataURL('image/png', 1.0);
        
        // Validate data URL
        if (!dataURL || dataURL === 'data:,') {
            throw new Error('Failed to generate chart image data');
        }
        
        // Create and trigger download
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Log success
        console.log(`Chart exported successfully as: ${filename}`);
        announceToScreenReader(`차트가 ${filename}으로 성공적으로 내보내졌습니다.`);
        
        // Track export for analytics
        trackChartExport(filename, AppState.results.length);
        
    } catch (error) {
        console.error('Error exporting chart:', error);
        announceToScreenReader('차트 내보내기 중 오류가 발생했습니다.');
        
        // Fallback: try alternative export method
        tryAlternativeChartExport();
    }
}

/**
 * Track chart export for analytics
 * @param {string} filename - Exported filename
 * @param {number} dataPoints - Number of data points exported
 * @param {string} method - Export method used ('standard' or 'alternative')
 */
function trackChartExport(filename, dataPoints, method = 'standard') {
    // Simple tracking - could be enhanced with analytics service
    const exportEvent = {
        type: 'chart_export',
        method: method,
        filename: filename,
        dataPoints: dataPoints,
        mode: AppState.parameters.mode,
        selectedShapes: Array.from(AppState.selectedShapes),
        timestamp: new Date().toISOString(),
        parameters: {
            materialE: AppState.parameters.materialE,
            columnHeight: AppState.parameters.columnHeight,
            effectiveLengthFactor: AppState.parameters.effectiveLengthFactor,
            targetArea: AppState.parameters.targetArea,
            targetPerimeter: AppState.parameters.targetPerimeter
        },
        browserInfo: {
            userAgent: navigator.userAgent,
            canvasSupport: isChartExportSupported()
        }
    };
    
    console.log('Chart export tracked:', exportEvent);
    
    // Store in localStorage for potential analytics collection
    try {
        const existingExports = JSON.parse(localStorage.getItem('euler-chart-exports') || '[]');
        existingExports.push(exportEvent);
        
        // Keep only last 10 exports to avoid storage bloat
        if (existingExports.length > 10) {
            existingExports.splice(0, existingExports.length - 10);
        }
        
        localStorage.setItem('euler-chart-exports', JSON.stringify(existingExports));
    } catch (storageError) {
        console.warn('Failed to store export event in localStorage:', storageError);
    }
}

/**
 * Alternative chart export method for fallback
 */
function tryAlternativeChartExport() {
    try {
        console.log('Attempting alternative chart export method...');
        
        // Create a temporary canvas with higher resolution
        const originalCanvas = AppState.chart.canvas;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) {
            throw new Error('Failed to get 2D context for temporary canvas');
        }
        
        // Set higher resolution for better quality
        const scaleFactor = 2;
        tempCanvas.width = originalCanvas.width * scaleFactor;
        tempCanvas.height = originalCanvas.height * scaleFactor;
        tempCtx.scale(scaleFactor, scaleFactor);
        
        // Set white background for better visibility
        tempCtx.fillStyle = '#ffffff';
        tempCtx.fillRect(0, 0, tempCanvas.width / scaleFactor, tempCanvas.height / scaleFactor);
        
        // Draw the original canvas onto the temporary canvas
        tempCtx.drawImage(originalCanvas, 0, 0);
        
        // Export the high-resolution version
        const dataURL = tempCanvas.toDataURL('image/png', 1.0);
        
        if (!dataURL || dataURL === 'data:,') {
            throw new Error('Failed to generate high-resolution image data');
        }
        
        // Generate filename with HQ suffix
        const filename = generateChartExportFilename('hq');
        
        // Create download
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log(`Alternative chart export successful: ${filename}`);
        announceToScreenReader(`고해상도 차트가 ${filename}으로 내보내졌습니다.`);
        
        // Track alternative export
        trackChartExport(filename, AppState.results.length, 'alternative');
        
    } catch (alternativeError) {
        console.error('Alternative chart export also failed:', alternativeError);
        announceToScreenReader('차트 내보내기에 실패했습니다. 브라우저가 이 기능을 지원하지 않을 수 있습니다.');
        
        // Final fallback: show instructions for manual screenshot
        showManualExportInstructions();
    }
}

/**
 * Initialize export buttons based on browser capabilities
 */
function initializeExportButtons() {
    const chartExportButton = document.getElementById('export-chart');
    const csvExportButton = document.getElementById('export-csv');
    
    // Initialize chart export button
    if (chartExportButton) {
        if (!isChartExportSupported()) {
            chartExportButton.disabled = true;
            chartExportButton.title = '이 브라우저에서는 차트 내보내기가 지원되지 않습니다';
            chartExportButton.setAttribute('aria-describedby', 'chart-export-unsupported');
            
            // Add description for screen readers
            const description = document.createElement('div');
            description.id = 'chart-export-unsupported';
            description.className = 'sr-only';
            description.textContent = '이 브라우저에서는 자동 차트 내보내기가 지원되지 않습니다. 수동으로 스크린샷을 찍어주세요.';
            document.body.appendChild(description);
            
            console.warn('Chart export not supported in this browser');
        } else {
            chartExportButton.disabled = false;
            chartExportButton.title = '차트를 PNG 이미지로 다운로드합니다';
            console.log('Chart export supported and enabled');
        }
    } else {
        console.warn('Chart export button not found');
    }
    
    // Initialize CSV export button
    if (csvExportButton) {
        if (!isCSVExportSupported()) {
            csvExportButton.disabled = true;
            csvExportButton.title = '이 브라우저에서는 CSV 내보내기가 지원되지 않습니다';
            csvExportButton.setAttribute('aria-describedby', 'csv-export-unsupported');
            
            // Add description for screen readers
            const description = document.createElement('div');
            description.id = 'csv-export-unsupported';
            description.className = 'sr-only';
            description.textContent = '이 브라우저에서는 자동 CSV 내보내기가 지원되지 않습니다.';
            document.body.appendChild(description);
            
            console.warn('CSV export not supported in this browser');
        } else {
            csvExportButton.disabled = false;
            csvExportButton.title = '계산 결과를 CSV 파일로 다운로드합니다';
            console.log('CSV export supported and enabled');
        }
    } else {
        console.warn('CSV export button not found');
    }
}

/**
 * Update export button state based on current data
 */
function updateExportButtonState() {
    const chartExportButton = document.getElementById('export-chart');
    const csvExportButton = document.getElementById('export-csv');
    
    const hasData = AppState.results && AppState.results.length > 0;
    const hasValidData = hasData && AppState.results.some(result => 
        result.area !== 'Error' && result.criticalLoad !== 'Error'
    );
    
    // Update chart export button
    if (chartExportButton) {
        const chartSupported = isChartExportSupported();
        chartExportButton.disabled = !hasData || !chartSupported;
        
        if (!hasData) {
            chartExportButton.title = '내보낼 데이터가 없습니다. 먼저 형상을 선택하세요.';
        } else if (!chartSupported) {
            chartExportButton.title = '이 브라우저에서는 차트 내보내기가 지원되지 않습니다';
        } else {
            chartExportButton.title = '차트를 PNG 이미지로 다운로드합니다';
        }
    }
    
    // Update CSV export button
    if (csvExportButton) {
        const csvSupported = isCSVExportSupported();
        csvExportButton.disabled = !hasValidData || !csvSupported;
        
        if (!hasData) {
            csvExportButton.title = '내보낼 데이터가 없습니다. 먼저 형상을 선택하세요.';
        } else if (!hasValidData) {
            csvExportButton.title = '유효한 계산 결과가 없습니다. 매개변수를 확인하세요.';
        } else if (!csvSupported) {
            csvExportButton.title = '이 브라우저에서는 CSV 내보내기가 지원되지 않습니다';
        } else {
            csvExportButton.title = '계산 결과를 CSV 파일로 다운로드합니다';
        }
    }
}

/**
 * Show instructions for manual chart export as final fallback
 */
function showManualExportInstructions() {
    const instructions = `
차트 내보내기가 지원되지 않습니다. 수동으로 스크린샷을 찍어주세요:
1. 차트 영역을 마우스 오른쪽 버튼으로 클릭
2. "이미지를 다른 이름으로 저장" 선택 (브라우저에 따라 다름)
3. 또는 브라우저의 스크린샷 도구 사용
    `;
    
    console.log(instructions);
    announceToScreenReader('자동 내보내기가 실패했습니다. 수동으로 스크린샷을 찍어주세요.');
    
    // Could show a modal or alert with instructions
    // For now, just log to console
}

/**
 * Task 7.3: Implement compression animation system
 */

/**
 * Show compression animation with arrows and deformation
 */
function showCompressionAnimation() {
    console.log('Showing compression animation...');
    
    if (!AppState.results || AppState.results.length === 0) {
        announceToScreenReader('애니메이션을 표시할 형상이 없습니다.');
        return;
    }
    
    const svg = document.getElementById('cross-section-svg');
    if (!svg) {
        console.warn('SVG element not found for animation');
        return;
    }
    
    // Find the weakest shape (lowest critical load)
    const weakestShape = findWeakestShape();
    
    // Start animation sequence
    startCompressionAnimation(svg, weakestShape);
    
    // Announce animation to screen readers
    announceToScreenReader(`압축 애니메이션이 시작되었습니다. 가장 약한 형상: ${weakestShape.name}`);
}

/**
 * Handle table sorting with enhanced functionality and visual indicators
 */
function handleTableSort(event) {
    const header = event.target.closest('.sortable');
    if (!header) return;
    
    const sortKey = header.dataset.sort;
    if (!sortKey) {
        console.warn('No sort key found for header');
        return;
    }
    
    // Prevent sorting if no data
    if (!AppState.results || AppState.results.length === 0) {
        announceToScreenReader('정렬할 데이터가 없습니다.');
        return;
    }
    
    const currentSort = header.classList.contains('sort-asc') ? 'asc' : 
                       header.classList.contains('sort-desc') ? 'desc' : 'none';
    
    // Remove sort classes from all headers
    document.querySelectorAll('.sortable').forEach(h => {
        h.classList.remove('sort-asc', 'sort-desc');
        h.setAttribute('aria-sort', 'none');
    });
    
    // Determine new sort direction
    let newSort;
    if (currentSort === 'none' || currentSort === 'desc') {
        newSort = 'asc';
        header.classList.add('sort-asc');
        header.setAttribute('aria-sort', 'ascending');
    } else {
        newSort = 'desc';
        header.classList.add('sort-desc');
        header.setAttribute('aria-sort', 'descending');
    }
    
    // Store original order for potential restoration
    const originalOrder = [...AppState.results];
    
    try {
        // Sort results with enhanced comparison
        AppState.results.sort((a, b) => {
            const comparison = compareTableValues(a, b, sortKey);
            return newSort === 'asc' ? comparison : -comparison;
        });
        
        // Update displays
        updateResultsTable();
        updateChart();
        
        // Announce sort to screen readers
        const sortDirection = newSort === 'asc' ? '오름차순' : '내림차순';
        const columnName = header.textContent.trim();
        announceToScreenReader(`${columnName} 열이 ${sortDirection}으로 정렬되었습니다.`);
        
        // Track sorting for analytics
        trackTableSort(sortKey, newSort);
        
    } catch (error) {
        console.error('Error during table sorting:', error);
        
        // Restore original order on error
        AppState.results = originalOrder;
        updateResultsTable();
        
        announceToScreenReader('정렬 중 오류가 발생했습니다. 원래 순서로 복원되었습니다.');
    }
}

/**
 * Compare two table values for sorting
 * @param {Object} a - First result object
 * @param {Object} b - Second result object
 * @param {string} sortKey - Key to sort by
 * @returns {number} Comparison result (-1, 0, 1)
 */
function compareTableValues(a, b, sortKey) {
    let aVal, bVal;
    
    // Get values for comparison with error handling
    switch (sortKey) {
        case 'name':
            aVal = a.name || '';
            bVal = b.name || '';
            // Natural sort for shape names (handles numbers in names)
            return aVal.localeCompare(bVal, undefined, { numeric: true, sensitivity: 'base' });
            
        case 'area':
            aVal = a._rawArea || 0;
            bVal = b._rawArea || 0;
            break;
            
        case 'secondMoment':
            aVal = a._rawSecondMoment || 0;
            bVal = b._rawSecondMoment || 0;
            break;
            
        case 'radiusOfGyration':
            aVal = parseFloat(a.radiusOfGyration) || 0;
            bVal = parseFloat(b.radiusOfGyration) || 0;
            break;
            
        case 'slendernessRatio':
            aVal = parseFloat(a.slendernessRatio) || 0;
            bVal = parseFloat(b.slendernessRatio) || 0;
            break;
            
        case 'criticalLoad':
            aVal = a._rawCriticalLoad || 0;
            bVal = b._rawCriticalLoad || 0;
            break;
            
        default:
            console.warn(`Unknown sort key: ${sortKey}`);
            return 0;
    }
    
    // Handle error values
    if (a[sortKey] === 'Error' && b[sortKey] !== 'Error') return 1;
    if (a[sortKey] !== 'Error' && b[sortKey] === 'Error') return -1;
    if (a[sortKey] === 'Error' && b[sortKey] === 'Error') return 0;
    
    // Handle NaN values
    if (isNaN(aVal) && !isNaN(bVal)) return 1;
    if (!isNaN(aVal) && isNaN(bVal)) return -1;
    if (isNaN(aVal) && isNaN(bVal)) return 0;
    
    // Numerical comparison
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
}

/**
 * Track table sorting for analytics
 * @param {string} sortKey - Column that was sorted
 * @param {string} direction - Sort direction (asc/desc)
 */
function trackTableSort(sortKey, direction) {
    const sortEvent = {
        type: 'table_sort',
        column: sortKey,
        direction: direction,
        resultCount: AppState.results ? AppState.results.length : 0,
        timestamp: new Date().toISOString()
    };
    
    console.log('Table sort tracked:', sortEvent);
    
    // Store in localStorage for potential analytics
    try {
        const existingSorts = JSON.parse(localStorage.getItem('euler-table-sorts') || '[]');
        existingSorts.push(sortEvent);
        
        // Keep only last 20 sort events
        if (existingSorts.length > 20) {
            existingSorts.splice(0, existingSorts.length - 20);
        }
        
        localStorage.setItem('euler-table-sorts', JSON.stringify(existingSorts));
    } catch (storageError) {
        console.warn('Failed to store sort event:', storageError);
    }
}

/**
 * Update calculation performance metrics
 * @param {number} calculationTime - Time taken for calculation in ms
 */
function updateCalculationMetrics(calculationTime) {
    calculationMetrics.totalCalculations++;
    calculationMetrics.lastCalculationTime = calculationTime;
    calculationMetrics.maxTime = Math.max(calculationMetrics.maxTime, calculationTime);
    
    // Update running average
    calculationMetrics.averageTime = 
        (calculationMetrics.averageTime * (calculationMetrics.totalCalculations - 1) + calculationTime) / 
        calculationMetrics.totalCalculations;
    
    // Log performance metrics periodically
    if (calculationMetrics.totalCalculations % 10 === 0) {
        console.log('Calculation Performance Metrics:', {
            total: calculationMetrics.totalCalculations,
            average: calculationMetrics.averageTime.toFixed(2) + 'ms',
            max: calculationMetrics.maxTime.toFixed(2) + 'ms',
            last: calculationMetrics.lastCalculationTime.toFixed(2) + 'ms'
        });
    }
}

/**
 * Get current calculation state for change detection
 * @returns {Object} Current state hash for comparison
 */
function getCurrentCalculationState() {
    return {
        selectedShapes: Array.from(AppState.selectedShapes).sort(),
        parameters: { ...AppState.parameters },
        timestamp: Date.now()
    };
}

/**
 * Determine if calculation should be skipped based on state comparison
 * @param {Object} currentState - Current calculation state
 * @param {string} changeType - Type of change that triggered update
 * @returns {boolean} True if calculation should be skipped
 */
function shouldSkipCalculation(currentState, changeType) {
    // Always calculate on initialization or reset
    if (changeType === 'initialization' || changeType === 'reset') {
        return false;
    }
    
    // No previous state means we should calculate
    if (!previousCalculationState) {
        return false;
    }
    
    // Check if selected shapes changed
    const shapesChanged = !arraysEqual(
        currentState.selectedShapes, 
        previousCalculationState.selectedShapes
    );
    
    if (shapesChanged) {
        return false;
    }
    
    // Check if parameters changed significantly
    const parametersChanged = hasSignificantParameterChange(
        currentState.parameters, 
        previousCalculationState.parameters
    );
    
    return !parametersChanged;
}

/**
 * Check if two arrays are equal
 * @param {Array} arr1 - First array
 * @param {Array} arr2 - Second array
 * @returns {boolean} True if arrays are equal
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
}

/**
 * Check if parameters have changed significantly enough to warrant recalculation
 * @param {Object} current - Current parameters
 * @param {Object} previous - Previous parameters
 * @returns {boolean} True if significant change detected
 */
function hasSignificantParameterChange(current, previous) {
    // Mode change always requires recalculation
    if (current.mode !== previous.mode) {
        return true;
    }
    
    // Define significance thresholds for different parameters
    const thresholds = {
        materialE: 0.1, // 0.1 GPa
        columnHeight: 0.01, // 1 cm
        effectiveLengthFactor: 0.001, // Exact match required
        targetArea: 0.1, // 0.1 cm²
        targetPerimeter: 0.1 // 0.1 cm
    };
    
    // Check each parameter for significant change
    for (const [key, threshold] of Object.entries(thresholds)) {
        if (Math.abs(current[key] - previous[key]) > threshold) {
            return true;
        }
    }
    
    return false;
}

/**
 * Disable/enable parameter inputs during calculation to prevent race conditions
 * @param {boolean} disabled - Whether to disable inputs
 */
function disableParameterInputs(disabled) {
    const inputSelectors = [
        'input[type="checkbox"]',
        'input[type="radio"]',
        'input[type="number"]',
        'input[type="range"]',
        'select',
        'button'
    ];
    
    inputSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(input => {
            if (disabled) {
                input.disabled = true;
                input.setAttribute('aria-busy', 'true');
            } else {
                input.disabled = false;
                input.removeAttribute('aria-busy');
            }
        });
    });
}

/**
 * Enhanced debounce function with immediate execution option
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately on first call
 * @returns {Function} Debounced function
 */
function debounceEnhanced(func, wait, immediate = false) {
    let timeout;
    let lastCallTime = 0;
    
    return function executedFunction(...args) {
        const callTime = Date.now();
        const timeSinceLastCall = callTime - lastCallTime;
        
        const later = () => {
            timeout = null;
            if (!immediate) {
                func.apply(this, args);
            }
        };
        
        const callNow = immediate && !timeout;
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) {
            func.apply(this, args);
        }
        
        lastCallTime = callTime;
    };
}

/**
 * Get calculation performance metrics for debugging
 * @returns {Object} Current performance metrics
 */
function getCalculationMetrics() {
    return { ...calculationMetrics };
}

/**
 * Reset calculation performance metrics
 */
function resetCalculationMetrics() {
    calculationMetrics = {
        totalCalculations: 0,
        averageTime: 0,
        maxTime: 0,
        lastCalculationTime: 0
    };
}

/**
 * Check if chart export is supported by the browser
 * @returns {boolean} True if export is supported
 */
function isChartExportSupported() {
    try {
        // Check if canvas toDataURL is supported
        const testCanvas = document.createElement('canvas');
        const testDataURL = testCanvas.toDataURL('image/png');
        return testDataURL.indexOf('data:image/png') === 0;
    } catch (error) {
        return false;
    }
}

/**
 * Validate chart state before export
 * @returns {Object} Validation result with success flag and message
 */
function validateChartForExport() {
    if (!AppState.chart) {
        return {
            success: false,
            message: 'Chart not initialized'
        };
    }
    
    if (!AppState.results || AppState.results.length === 0) {
        return {
            success: false,
            message: 'No data to export'
        };
    }
    
    if (!isChartExportSupported()) {
        return {
            success: false,
            message: 'Chart export not supported by browser'
        };
    }
    
    return {
        success: true,
        message: 'Chart ready for export'
    };
}

/**
 * Generate standardized filename for chart export
 * @param {string} suffix - Optional suffix for filename
 * @returns {string} Generated filename
 */
function generateChartExportFilename(suffix = '') {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const modeText = AppState.parameters.mode === 'equal-area' ? 'equal-area' : 'equal-perimeter';
    const shapesCount = AppState.selectedShapes.size;
    
    let filename = `euler-buckling-chart-${modeText}-${shapesCount}shapes-${timestamp}`;
    if (suffix) {
        filename += `-${suffix}`;
    }
    filename += '.png';
    
    return filename;
}

/**
 * Immediately sync input values for responsive UI feedback
 * This runs without debouncing for instant visual feedback
 * @param {Event} event - Input event
 */
function syncInputValues(event) {
    const id = event.target.id;
    const value = event.target.value;
    const baseId = id.replace('-slider', '');
    
    // Sync slider and number inputs immediately for responsive UI
    if (id.includes('slider')) {
        const numberInput = document.getElementById(baseId);
        if (numberInput && numberInput.value !== value) {
            numberInput.value = value;
        }
    } else if (document.getElementById(id + '-slider')) {
        const slider = document.getElementById(id + '-slider');
        if (slider && slider.value !== value) {
            slider.value = value;
        }
    }
}

/**
 * SVG Cross-Section Preview Functions
 * Task 7.1: Create SVG shape rendering functions
 */

/**
 * Calculate layout for arranging shapes in the SVG
 * @param {number} shapeCount - Number of shapes to arrange
 * @returns {Object} Layout configuration with positions and size
 */
function calculateShapeLayout(shapeCount) {
    const svgWidth = 400;
    const svgHeight = 200;
    const padding = 20;
    const minShapeSize = 30;
    const maxShapeSize = 60;
    
    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(shapeCount));
    const rows = Math.ceil(shapeCount / cols);
    
    // Calculate available space and shape size
    const availableWidth = svgWidth - (2 * padding);
    const availableHeight = svgHeight - (2 * padding);
    
    const cellWidth = availableWidth / cols;
    const cellHeight = availableHeight / rows;
    
    // Shape size should fit within cell with some margin
    const shapeSize = Math.max(minShapeSize, Math.min(maxShapeSize, 
        Math.min(cellWidth * 0.7, cellHeight * 0.7)));
    
    // Calculate positions for each shape
    const positions = [];
    for (let i = 0; i < shapeCount; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        
        const x = padding + (col * cellWidth) + (cellWidth / 2);
        const y = padding + (row * cellHeight) + (cellHeight / 2);
        
        positions.push({ x, y });
    }
    
    return {
        positions,
        shapeSize,
        cols,
        rows
    };
}

/**
 * Render a single shape in the SVG
 * @param {SVGElement} svg - SVG container element
 * @param {Object} result - Shape result data
 * @param {Object} position - Position {x, y} for the shape
 * @param {number} size - Size for the shape
 */
function renderShape(svg, result, position, size) {
    // Create group for the shape
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'shape-group');
    group.setAttribute('data-shape', result.name);
    group.setAttribute('transform', `translate(${position.x}, ${position.y})`);
    
    // Store original position for animation
    group.setAttribute('data-original-x', position.x);
    group.setAttribute('data-original-y', position.y);
    
    // Add shape path
    let shapePath;
    if (result.type === 'circle') {
        shapePath = createCirclePath(size);
    } else {
        shapePath = createPolygonPath(result.sides, size);
    }
    
    shapePath.setAttribute('fill', 'none');
    shapePath.setAttribute('stroke', 'var(--text-primary)');
    shapePath.setAttribute('stroke-width', '2');
    shapePath.setAttribute('opacity', '0.8');
    
    // Add hover effects
    shapePath.setAttribute('class', 'shape-path');
    shapePath.style.transition = 'all 0.2s ease';
    
    group.appendChild(shapePath);
    
    // Add shape label
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', '0');
    label.setAttribute('y', size / 2 + 20);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--text-secondary)');
    label.setAttribute('font-size', '12');
    label.setAttribute('font-weight', '500');
    label.textContent = result.name;
    
    group.appendChild(label);
    
    // Add accessibility attributes
    group.setAttribute('role', 'img');
    group.setAttribute('aria-label', `${result.name} cross-section`);
    group.setAttribute('tabindex', '0');
    
    // Add tooltip event handlers
    addTooltipEventHandlers(group, result, position);
    
    svg.appendChild(group);
}

/**
 * Create SVG path for a circle
 * @param {number} size - Diameter of the circle
 * @returns {SVGPathElement} Circle path element
 */
function createCirclePath(size) {
    const radius = size / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    path.setAttribute('cx', '0');
    path.setAttribute('cy', '0');
    path.setAttribute('r', radius.toString());
    
    return path;
}

/**
 * Create SVG path for a regular polygon
 * @param {number} sides - Number of sides
 * @param {number} size - Size (circumradius * 2)
 * @returns {SVGPathElement} Polygon path element
 */
function createPolygonPath(sides, size) {
    const radius = size / 2;
    const vertices = generatePolygonVertices(sides, radius);
    
    // Create path string
    let pathData = `M ${vertices[0].x} ${vertices[0].y}`;
    for (let i = 1; i < vertices.length; i++) {
        pathData += ` L ${vertices[i].x} ${vertices[i].y}`;
    }
    pathData += ' Z'; // Close the path
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    
    return path;
}

/**
 * Generate vertices for a regular polygon centered at origin
 * @param {number} sides - Number of sides
 * @param {number} radius - Circumradius
 * @returns {Array} Array of {x, y} vertex coordinates
 */
function generatePolygonVertices(sides, radius) {
    const vertices = [];
    const angleStep = (2 * Math.PI) / sides;
    
    // Start from top (rotate by -π/2 to align with mathematical convention)
    const startAngle = -Math.PI / 2;
    
    for (let i = 0; i < sides; i++) {
        const angle = startAngle + (i * angleStep);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        vertices.push({ x: x.toFixed(2), y: y.toFixed(2) });
    }
    
    return vertices;
}

/**
 * Update SVG description for accessibility
 */
function updateSVGDescription() {
    const description = document.getElementById('svg-description');
    if (!description) return;
    
    const shapeCount = AppState.results ? AppState.results.length : 0;
    const modeText = AppState.parameters.mode === 'equal-area' ? '동일 면적' : '동일 둘레';
    
    description.textContent = `${shapeCount}개의 ${modeText} 단면 형상들을 비교를 위해 크기 조정하여 시각적으로 표현합니다. 각 형상 위에 마우스를 올리면 상세 정보를 확인할 수 있습니다.`;
}

/**
 * Task 7.2: Add interactive hover tooltips
 */

/**
 * Add tooltip event handlers to a shape group
 * @param {SVGElement} group - Shape group element
 * @param {Object} result - Shape result data
 * @param {Object} position - Shape position
 */
function addTooltipEventHandlers(group, result, position) {
    // Mouse events
    group.addEventListener('mouseenter', (event) => {
        showShapeTooltip(event, result, position);
    });
    
    group.addEventListener('mouseleave', () => {
        hideShapeTooltip();
    });
    
    group.addEventListener('mousemove', (event) => {
        updateTooltipPosition(event);
    });
    
    // Keyboard events for accessibility
    group.addEventListener('focus', (event) => {
        showShapeTooltip(event, result, position);
        announceToScreenReader(`${result.name} 형상에 포커스됨`);
    });
    
    group.addEventListener('blur', () => {
        hideShapeTooltip();
    });
    
    // Touch events for mobile
    group.addEventListener('touchstart', (event) => {
        event.preventDefault();
        showShapeTooltip(event, result, position);
    });
    
    group.addEventListener('touchend', () => {
        // Hide tooltip after a delay on touch devices
        setTimeout(hideShapeTooltip, 2000);
    });
}

/**
 * Show tooltip for a shape
 * @param {Event} event - Triggering event
 * @param {Object} result - Shape result data
 * @param {Object} position - Shape position
 */
function showShapeTooltip(event, result, position) {
    // Create or get existing tooltip
    let tooltip = document.getElementById('shape-tooltip');
    if (!tooltip) {
        tooltip = createShapeTooltip();
    }
    
    // Update tooltip content
    updateTooltipContent(tooltip, result);
    
    // Position tooltip
    positionTooltip(tooltip, event);
    
    // Show tooltip
    tooltip.style.display = 'block';
    tooltip.setAttribute('aria-hidden', 'false');
    
    // Add fade-in animation
    setTimeout(() => {
        tooltip.style.opacity = '1';
    }, 10);
}

/**
 * Hide shape tooltip
 */
function hideShapeTooltip() {
    const tooltip = document.getElementById('shape-tooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.setAttribute('aria-hidden', 'true');
        
        // Hide after fade-out animation
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 200);
    }
}

/**
 * Create tooltip element
 * @returns {HTMLElement} Tooltip element
 */
function createShapeTooltip() {
    const tooltip = document.createElement('div');
    tooltip.id = 'shape-tooltip';
    tooltip.className = 'shape-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('aria-hidden', 'true');
    
    // Add tooltip styles
    tooltip.style.cssText = `
        position: absolute;
        background-color: var(--bg-tertiary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        padding: 12px;
        font-size: 14px;
        box-shadow: var(--shadow-hover);
        z-index: 1000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s ease;
        max-width: 280px;
        min-width: 200px;
    `;
    
    document.body.appendChild(tooltip);
    return tooltip;
}

/**
 * Update tooltip content with shape data
 * @param {HTMLElement} tooltip - Tooltip element
 * @param {Object} result - Shape result data
 */
function updateTooltipContent(tooltip, result) {
    const typeText = result.type === 'circle' ? '원형' : `${result.sides}각형`;
    const modeText = AppState.parameters.mode === 'equal-area' ? '동일 면적' : '동일 둘레';
    
    tooltip.innerHTML = `
        <div class="tooltip-header">
            <strong>${result.name}</strong>
            <span class="tooltip-type">(${typeText})</span>
        </div>
        <div class="tooltip-mode">${modeText} 모드</div>
        <div class="tooltip-content">
            <div class="tooltip-row">
                <span class="tooltip-label">면적:</span>
                <span class="tooltip-value">${result.area} cm²</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">2차 모멘트:</span>
                <span class="tooltip-value">${result.secondMoment} cm⁴</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">회전반지름:</span>
                <span class="tooltip-value">${result.radiusOfGyration} cm</span>
            </div>
            <div class="tooltip-row">
                <span class="tooltip-label">세장비:</span>
                <span class="tooltip-value">${result.slendernessRatio}</span>
            </div>
            <div class="tooltip-row critical-load-row">
                <span class="tooltip-label">임계 하중:</span>
                <span class="tooltip-value critical-load">${result.criticalLoad} kN</span>
            </div>
        </div>
    `;
}

/**
 * Position tooltip relative to cursor/event
 * @param {HTMLElement} tooltip - Tooltip element
 * @param {Event} event - Mouse or touch event
 */
function positionTooltip(tooltip, event) {
    const offset = 10;
    let x, y;
    
    if (event.type === 'touchstart') {
        const touch = event.touches[0];
        x = touch.clientX;
        y = touch.clientY;
    } else {
        x = event.clientX;
        y = event.clientY;
    }
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get tooltip dimensions (approximate)
    const tooltipWidth = 280;
    const tooltipHeight = 200;
    
    // Calculate position with boundary checking
    let tooltipX = x + offset;
    let tooltipY = y + offset;
    
    // Adjust if tooltip would go off-screen
    if (tooltipX + tooltipWidth > viewportWidth) {
        tooltipX = x - tooltipWidth - offset;
    }
    
    if (tooltipY + tooltipHeight > viewportHeight) {
        tooltipY = y - tooltipHeight - offset;
    }
    
    // Ensure tooltip stays within viewport
    tooltipX = Math.max(offset, Math.min(tooltipX, viewportWidth - tooltipWidth - offset));
    tooltipY = Math.max(offset, Math.min(tooltipY, viewportHeight - tooltipHeight - offset));
    
    tooltip.style.left = `${tooltipX}px`;
    tooltip.style.top = `${tooltipY}px`;
}

/**
 * Update tooltip position during mouse movement
 * @param {Event} event - Mouse move event
 */
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('shape-tooltip');
    if (tooltip && tooltip.style.display === 'block') {
        positionTooltip(tooltip, event);
    }
}

/**
 * Compression Animation Functions
 */

/**
 * Find the shape with the lowest critical load (weakest)
 * @returns {Object} Weakest shape result
 */
function findWeakestShape() {
    if (!AppState.results || AppState.results.length === 0) {
        return null;
    }
    
    return AppState.results.reduce((weakest, current) => {
        const currentLoad = parseFloat(current.criticalLoad) || 0;
        const weakestLoad = parseFloat(weakest.criticalLoad) || 0;
        return currentLoad < weakestLoad ? current : weakest;
    });
}

/**
 * Start the compression animation sequence
 * @param {SVGElement} svg - SVG container
 * @param {Object} weakestShape - Shape with lowest critical load
 */
function startCompressionAnimation(svg, weakestShape) {
    // Clear any existing animation
    clearCompressionAnimation(svg);
    
    // Add compression arrows
    addCompressionArrows(svg);
    
    // Animate shape deformation
    animateShapeDeformation(weakestShape);
    
    // Update animation button state
    updateAnimationButtonState(true);
    
    // Auto-stop animation after duration
    setTimeout(() => {
        stopCompressionAnimation(svg);
    }, 4000); // 4 second animation
}

/**
 * Stop the compression animation
 * @param {SVGElement} svg - SVG container
 */
function stopCompressionAnimation(svg) {
    // Remove compression arrows
    removeCompressionArrows(svg);
    
    // Reset shape deformation
    resetShapeDeformation();
    
    // Update animation button state
    updateAnimationButtonState(false);
    
    // Announce completion
    announceToScreenReader('압축 애니메이션이 완료되었습니다.');
}

/**
 * Clear any existing animation elements
 * @param {SVGElement} svg - SVG container
 */
function clearCompressionAnimation(svg) {
    // Remove existing arrows
    const existingArrows = svg.querySelectorAll('.compression-arrow');
    existingArrows.forEach(arrow => arrow.remove());
    
    // Reset shape classes
    const shapeGroups = svg.querySelectorAll('.shape-group');
    shapeGroups.forEach(group => {
        group.classList.remove('compressed', 'weakest');
    });
}

/**
 * Add compression arrows to the SVG
 * @param {SVGElement} svg - SVG container
 */
function addCompressionArrows(svg) {
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = 400; // From viewBox
    const svgHeight = 200; // From viewBox
    
    // Create arrow group
    const arrowGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    arrowGroup.setAttribute('class', 'compression-arrows');
    
    // Top arrows (pointing down)
    const topArrows = createArrowSet('top', svgWidth, svgHeight);
    arrowGroup.appendChild(topArrows);
    
    // Bottom arrows (pointing up)
    const bottomArrows = createArrowSet('bottom', svgWidth, svgHeight);
    arrowGroup.appendChild(bottomArrows);
    
    svg.appendChild(arrowGroup);
    
    // Animate arrows
    animateArrows(arrowGroup);
}

/**
 * Create a set of arrows for top or bottom
 * @param {string} position - 'top' or 'bottom'
 * @param {number} svgWidth - SVG width
 * @param {number} svgHeight - SVG height
 * @returns {SVGElement} Arrow group element
 */
function createArrowSet(position, svgWidth, svgHeight) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', `arrows-${position}`);
    
    const arrowCount = 5;
    const arrowSpacing = svgWidth / (arrowCount + 1);
    const arrowLength = 30;
    const arrowWidth = 8;
    
    for (let i = 0; i < arrowCount; i++) {
        const x = arrowSpacing * (i + 1);
        const y = position === 'top' ? 15 : svgHeight - 15;
        
        const arrow = createArrow(x, y, arrowLength, arrowWidth, position);
        group.appendChild(arrow);
    }
    
    return group;
}

/**
 * Create a single arrow SVG element
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} length - Arrow length
 * @param {number} width - Arrow width
 * @param {string} direction - 'top' or 'bottom'
 * @returns {SVGElement} Arrow path element
 */
function createArrow(x, y, length, width, direction) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    let pathData;
    if (direction === 'top') {
        // Arrow pointing down
        pathData = `M ${x} ${y} L ${x} ${y + length - width} L ${x - width/2} ${y + length - width} L ${x} ${y + length} L ${x + width/2} ${y + length - width} L ${x} ${y + length - width} Z`;
    } else {
        // Arrow pointing up
        pathData = `M ${x} ${y} L ${x} ${y - length + width} L ${x - width/2} ${y - length + width} L ${x} ${y - length} L ${x + width/2} ${y - length + width} L ${x} ${y - length + width} Z`;
    }
    
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'var(--warning-color)');
    path.setAttribute('stroke', 'var(--warning-color)');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('class', 'compression-arrow');
    path.setAttribute('opacity', '0.8');
    
    return path;
}

/**
 * Animate the compression arrows
 * @param {SVGElement} arrowGroup - Arrow group element
 */
function animateArrows(arrowGroup) {
    const arrows = arrowGroup.querySelectorAll('.compression-arrow');
    
    arrows.forEach((arrow, index) => {
        // Stagger the animation start times
        const delay = index * 100;
        
        setTimeout(() => {
            arrow.style.animation = 'compressionPulse 1s ease-in-out infinite';
        }, delay);
    });
}

/**
 * Remove compression arrows from SVG
 * @param {SVGElement} svg - SVG container
 */
function removeCompressionArrows(svg) {
    const arrowGroups = svg.querySelectorAll('.compression-arrows');
    arrowGroups.forEach(group => group.remove());
}

/**
 * Animate shape deformation to show compression effect
 * @param {Object} weakestShape - Shape with lowest critical load
 */
function animateShapeDeformation(weakestShape) {
    const svg = document.getElementById('cross-section-svg');
    if (!svg) return;
    
    const shapeGroups = svg.querySelectorAll('.shape-group');
    
    shapeGroups.forEach(group => {
        const shapeName = group.getAttribute('data-shape');
        const originalX = parseFloat(group.getAttribute('data-original-x'));
        const originalY = parseFloat(group.getAttribute('data-original-y'));
        
        // Add compression class for styling (colors, stroke width)
        setTimeout(() => {
            group.classList.add('compressed');
            
            // Apply SVG transform for compression animation
            animateGroupCompression(group, originalX, originalY, 0.7);
        }, 500);
        
        // Highlight the weakest shape
        if (shapeName === weakestShape.name) {
            setTimeout(() => {
                group.classList.add('weakest');
                
                // Apply stronger compression to weakest shape
                animateGroupCompression(group, originalX, originalY, 0.5);
            }, 1000);
        }
    });
}

/**
 * Animate group compression using SVG transforms
 * @param {SVGElement} group - Shape group element
 * @param {number} originalX - Original X position
 * @param {number} originalY - Original Y position
 * @param {number} scaleY - Y scale factor
 */
function animateGroupCompression(group, originalX, originalY, scaleY) {
    // Use SVG transform to compress the shape while keeping it in place
    const transform = `translate(${originalX}, ${originalY}) scale(1, ${scaleY})`;
    
    // Animate the transform change
    group.style.transition = 'transform 0.5s ease-in-out';
    group.setAttribute('transform', transform);
}

/**
 * Reset shape deformation after animation
 */
function resetShapeDeformation() {
    const svg = document.getElementById('cross-section-svg');
    if (!svg) return;
    
    const shapeGroups = svg.querySelectorAll('.shape-group');
    shapeGroups.forEach(group => {
        // Remove CSS classes
        group.classList.remove('compressed', 'weakest');
        
        // Reset SVG transform to original position
        const originalX = parseFloat(group.getAttribute('data-original-x'));
        const originalY = parseFloat(group.getAttribute('data-original-y'));
        
        // Animate back to original state
        group.style.transition = 'transform 0.3s ease-out';
        group.setAttribute('transform', `translate(${originalX}, ${originalY})`);
        
        // Clear transition after animation
        setTimeout(() => {
            group.style.transition = '';
        }, 300);
    });
}

/**
 * Update animation button state
 * @param {boolean} isAnimating - Whether animation is running
 */
function updateAnimationButtonState(isAnimating) {
    const button = document.getElementById('compression-animation');
    if (!button) return;
    
    if (isAnimating) {
        button.textContent = '애니메이션 중지';
        button.disabled = true;
        button.setAttribute('aria-pressed', 'true');
    } else {
        button.textContent = '압축 애니메이션 보기';
        button.disabled = false;
        button.setAttribute('aria-pressed', 'false');
    }
}

/**
 * Load and validate default application state
 */
function loadDefaultApplicationState() {
    // Reset to clean state
    AppState.selectedShapes = new Set(['circle', 'triangle', 'square', 'pentagon', 'hexagon']);
    AppState.parameters = { ...DEFAULT_PARAMETERS };
    AppState.results = [];
    
    // Validate default parameters
    AppState.parameters.materialE = validateMaterialE(AppState.parameters.materialE);
    AppState.parameters.columnHeight = validateColumnHeight(AppState.parameters.columnHeight);
    AppState.parameters.effectiveLengthFactor = validateEffectiveLengthFactor(AppState.parameters.effectiveLengthFactor);
    AppState.parameters.targetArea = validateTargetArea(AppState.parameters.targetArea);
    AppState.parameters.targetPerimeter = validateTargetPerimeter(AppState.parameters.targetPerimeter);
    
    console.log('Default application state loaded:', {
        selectedShapes: Array.from(AppState.selectedShapes),
        parameters: AppState.parameters
    });
}

/**
 * Set up global error handling and error boundaries
 */
function setupGlobalErrorHandling() {
    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
        console.error('Global error caught:', event.error);
        handleGlobalError(event.error, 'uncaught-error');
    });
    
    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        handleGlobalError(event.reason, 'unhandled-promise');
        event.preventDefault(); // Prevent default browser behavior
    });
    
    // Chart.js error handling
    if (window.Chart) {
        Chart.defaults.onError = (error) => {
            console.error('Chart.js error:', error);
            handleChartError(error);
        };
    }
}

/**
 * Set up user feedback systems
 */
function setupUserFeedbackSystems() {
    // Ensure live region exists for screen reader announcements
    let liveRegion = document.getElementById('live-region');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }
    
    // Set up performance monitoring
    setupPerformanceMonitoring();
    
    // Set up user interaction tracking
    setupInteractionTracking();
}

/**
 * Handle initialization errors gracefully
 * @param {Error} error - The initialization error
 */
function handleInitializationError(error) {
    console.error('Initialization failed:', error);
    
    // Hide loading state
    showLoadingState(false);
    
    // Show error message to user
    const errorMessage = 'Application initialization failed. Please refresh the page.';
    announceToScreenReader('애플리케이션 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
    
    // Try to show error in UI
    try {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-container" style="text-align: center; padding: 2rem; color: var(--danger-color);">
                    <h2>초기화 오류</h2>
                    <p>애플리케이션을 초기화하는 중 오류가 발생했습니다.</p>
                    <p>페이지를 새로고침하거나 브라우저를 다시 시작해보세요.</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        페이지 새로고침
                    </button>
                </div>
            `;
        }
    } catch (uiError) {
        console.error('Failed to show error in UI:', uiError);
        // Fallback: show browser alert
        alert(errorMessage);
    }
}

/**
 * Handle global errors during runtime
 * @param {Error} error - The error that occurred
 * @param {string} type - Type of error
 */
function handleGlobalError(error, type) {
    console.error(`Global error (${type}):`, error);
    
    // Don't overwhelm user with error messages
    const now = Date.now();
    const lastErrorTime = window.lastErrorAnnouncement || 0;
    
    if (now - lastErrorTime > 5000) { // Only announce errors every 5 seconds
        announceToScreenReader('애플리케이션에서 오류가 발생했습니다. 계속 문제가 발생하면 페이지를 새로고침해주세요.');
        window.lastErrorAnnouncement = now;
    }
    
    // Log error for potential analytics
    logError(error, type);
}

/**
 * Handle Chart.js specific errors
 * @param {Error} error - Chart error
 */
function handleChartError(error) {
    console.error('Chart error:', error);
    
    // Try to reinitialize chart
    try {
        if (AppState.chart) {
            AppState.chart.destroy();
        }
        initializeChart();
        updateChart();
    } catch (reinitError) {
        console.error('Failed to reinitialize chart:', reinitError);
        
        // Show fallback message in chart container
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer) {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary);">
                    <p>차트를 표시할 수 없습니다. 페이지를 새로고침해주세요.</p>
                </div>
            `;
        }
    }
}

/**
 * Set up performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor calculation performance
    let performanceWarningShown = false;
    
    const originalTriggerUpdate = triggerCalculationUpdate;
    window.triggerCalculationUpdate = function(changeType) {
        const startTime = performance.now();
        
        originalTriggerUpdate.call(this, changeType);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        // Warn if calculations are consistently slow
        if (duration > 200 && !performanceWarningShown) {
            console.warn(`Slow calculation detected: ${duration.toFixed(2)}ms`);
            performanceWarningShown = true;
            
            // Only show warning once per session
            setTimeout(() => {
                announceToScreenReader('계산이 예상보다 느립니다. 복잡한 형상이나 많은 데이터로 인한 것일 수 있습니다.');
            }, 1000);
        }
    };
}

/**
 * Set up user interaction tracking for analytics
 */
function setupInteractionTracking() {
    // Track major user interactions
    const interactions = {
        shapeSelections: 0,
        parameterChanges: 0,
        exports: 0,
        animations: 0
    };
    
    // Store in global scope for access
    window.userInteractions = interactions;
    
    // Log interactions periodically
    setInterval(() => {
        if (Object.values(interactions).some(count => count > 0)) {
            console.log('User interaction summary:', interactions);
        }
    }, 60000); // Every minute
}

/**
 * Log initialization metrics
 */
function logInitializationMetrics() {
    const metrics = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        },
        features: {
            chartSupported: isChartExportSupported(),
            csvSupported: isCSVExportSupported(),
            touchSupported: 'ontouchstart' in window,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
        },
        defaultState: {
            selectedShapes: Array.from(AppState.selectedShapes),
            parameters: AppState.parameters
        }
    };
    
    console.log('Initialization metrics:', metrics);
    
    // Store in localStorage for potential analytics
    try {
        localStorage.setItem('euler-init-metrics', JSON.stringify(metrics));
    } catch (storageError) {
        console.warn('Failed to store initialization metrics:', storageError);
    }
}

/**
 * Log errors for potential analytics
 * @param {Error} error - The error to log
 * @param {string} type - Type of error
 */
function logError(error, type) {
    const errorLog = {
        timestamp: new Date().toISOString(),
        type: type,
        message: error.message,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        appState: {
            selectedShapes: Array.from(AppState.selectedShapes),
            parameters: AppState.parameters,
            resultsCount: AppState.results ? AppState.results.length : 0
        }
    };
    
    console.log('Error logged:', errorLog);
    
    // Store recent errors in localStorage
    try {
        const existingErrors = JSON.parse(localStorage.getItem('euler-error-log') || '[]');
        existingErrors.push(errorLog);
        
        // Keep only last 5 errors
        if (existingErrors.length > 5) {
            existingErrors.splice(0, existingErrors.length - 5);
        }
        
        localStorage.setItem('euler-error-log', JSON.stringify(existingErrors));
    } catch (storageError) {
        console.warn('Failed to store error log:', storageError);
    }
}

/**
 * Enhanced keyboard navigation for radio buttons
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleRadioKeyNavigation(event) {
    const radios = document.querySelectorAll('input[name="comparison-mode"]');
    const currentIndex = Array.from(radios).indexOf(event.target);
    
    switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : radios.length - 1;
            radios[prevIndex].focus();
            radios[prevIndex].checked = true;
            radios[prevIndex].dispatchEvent(new Event('change'));
            break;
            
        case 'ArrowDown':
        case 'ArrowRight':
            event.preventDefault();
            const nextIndex = currentIndex < radios.length - 1 ? currentIndex + 1 : 0;
            radios[nextIndex].focus();
            radios[nextIndex].checked = true;
            radios[nextIndex].dispatchEvent(new Event('change'));
            break;
    }
}

/**
 * Enhanced keyboard navigation for sliders
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleSliderKeyNavigation(event) {
    const slider = event.target;
    const step = parseFloat(slider.step) || 1;
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    let currentValue = parseFloat(slider.value);
    
    switch (event.key) {
        case 'Home':
            event.preventDefault();
            slider.value = min;
            slider.dispatchEvent(new Event('input'));
            announceToScreenReader(`최소값 ${min}으로 설정됨`);
            break;
            
        case 'End':
            event.preventDefault();
            slider.value = max;
            slider.dispatchEvent(new Event('input'));
            announceToScreenReader(`최대값 ${max}으로 설정됨`);
            break;
            
        case 'PageUp':
            event.preventDefault();
            const largeStepUp = Math.min(max, currentValue + (step * 10));
            slider.value = largeStepUp;
            slider.dispatchEvent(new Event('input'));
            announceToScreenReader(`큰 단위로 증가: ${largeStepUp}`);
            break;
            
        case 'PageDown':
            event.preventDefault();
            const largeStepDown = Math.max(min, currentValue - (step * 10));
            slider.value = largeStepDown;
            slider.dispatchEvent(new Event('input'));
            announceToScreenReader(`큰 단위로 감소: ${largeStepDown}`);
            break;
    }
}

/**
 * Enhanced keyboard navigation for buttons
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleButtonKeyNavigation(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.target.click();
    }
}

/**
 * Enhanced keyboard navigation for table headers
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleTableHeaderKeyNavigation(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleTableSort(event);
    }
    
    // Arrow key navigation between headers
    const headers = document.querySelectorAll('.sortable');
    const currentIndex = Array.from(headers).indexOf(event.target);
    
    switch (event.key) {
        case 'ArrowLeft':
            event.preventDefault();
            if (currentIndex > 0) {
                headers[currentIndex - 1].focus();
            }
            break;
            
        case 'ArrowRight':
            event.preventDefault();
            if (currentIndex < headers.length - 1) {
                headers[currentIndex + 1].focus();
            }
            break;
    }
}

/**
 * Global keyboard navigation handler
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleGlobalKeyNavigation(event) {
    // Escape key to close tooltips or cancel operations
    if (event.key === 'Escape') {
        hideShapeTooltip();
        
        // Cancel any ongoing animations
        const animationButton = document.getElementById('compression-animation');
        if (animationButton && animationButton.getAttribute('aria-pressed') === 'true') {
            const svg = document.getElementById('cross-section-svg');
            if (svg) {
                stopCompressionAnimation(svg);
            }
        }
    }
    
    // Keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'r':
                event.preventDefault();
                resetToDefaults();
                announceToScreenReader('키보드 단축키로 매개변수가 재설정되었습니다.');
                break;
                
            case 's':
                event.preventDefault();
                if (AppState.results && AppState.results.length > 0) {
                    exportResultsAsCSV();
                    announceToScreenReader('키보드 단축키로 CSV 내보내기가 실행되었습니다.');
                }
                break;
                
            case 'p':
                event.preventDefault();
                if (AppState.results && AppState.results.length > 0) {
                    exportChartAsPNG();
                    announceToScreenReader('키보드 단축키로 차트 내보내기가 실행되었습니다.');
                }
                break;
        }
    }
}

/**
 * Handle focus management for better accessibility
 * @param {FocusEvent} event - Focus event
 */
function handleFocusManagement(event) {
    // Ensure focus is visible
    if (event.target.matches('input, button, select, [tabindex]')) {
        event.target.classList.add('keyboard-focused');
        
        // Remove class on mouse interaction
        const removeKeyboardFocus = () => {
            event.target.classList.remove('keyboard-focused');
            event.target.removeEventListener('mousedown', removeKeyboardFocus);
        };
        event.target.addEventListener('mousedown', removeKeyboardFocus);
    }
}

/**
 * Announce parameter changes to screen readers
 * @param {HTMLElement} element - The input element that changed
 */
function announceParameterChange(element) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    const labelText = label ? label.textContent : element.id;
    const value = element.value;
    const unit = getParameterUnit(element.id);
    
    announceToScreenReader(`${labelText}: ${value}${unit}으로 변경됨`);
}

/**
 * Get unit for parameter announcement
 * @param {string} elementId - Element ID
 * @returns {string} Unit string
 */
function getParameterUnit(elementId) {
    const baseId = elementId.replace('-slider', '');
    
    switch (baseId) {
        case 'material-e':
            return ' GPa';
        case 'column-height':
            return ' m';
        case 'target-area':
            return ' cm²';
        case 'target-perimeter':
            return ' cm';
        case 'effective-length-factor':
            return '';
        default:
            return '';
    }
}

/**
 * Handle theme changes for accessibility
 * @param {boolean} isDarkMode - Whether dark mode is active
 */
function handleThemeChange(isDarkMode) {
    console.log(`Theme changed to: ${isDarkMode ? 'dark' : 'light'} mode`);
    
    // Update chart theme
    updateChartTheme();
    
    // Announce theme change
    announceToScreenReader(`${isDarkMode ? '다크' : '라이트'} 모드로 변경되었습니다.`);
    
    // Update any theme-dependent calculations or displays
    if (AppState.results && AppState.results.length > 0) {
        updateCrossSectionPreview();
    }
}

/**
 * Handle high contrast mode changes
 * @param {MediaQueryListEvent} event - Media query event
 */
function handleHighContrastChange(event) {
    const isHighContrast = event.matches;
    console.log(`High contrast mode: ${isHighContrast ? 'enabled' : 'disabled'}`);
    
    if (isHighContrast) {
        document.body.classList.add('high-contrast');
        announceToScreenReader('고대비 모드가 활성화되었습니다.');
    } else {
        document.body.classList.remove('high-contrast');
        announceToScreenReader('고대비 모드가 비활성화되었습니다.');
    }
    
    // Update chart for high contrast
    if (AppState.chart) {
        updateChartTheme();
    }
}

/**
 * Handle reduced motion preference changes
 * @param {MediaQueryListEvent} event - Media query event
 */
function handleReducedMotionChange(event) {
    const prefersReducedMotion = event.matches;
    console.log(`Reduced motion preference: ${prefersReducedMotion ? 'enabled' : 'disabled'}`);
    
    if (prefersReducedMotion) {
        document.body.classList.add('reduced-motion');
        
        // Disable chart animations
        if (AppState.chart) {
            AppState.chart.options.animation.duration = 0;
            AppState.chart.update('none');
        }
        
        announceToScreenReader('애니메이션이 줄어든 모드가 활성화되었습니다.');
    } else {
        document.body.classList.remove('reduced-motion');
        
        // Re-enable chart animations
        if (AppState.chart) {
            AppState.chart.options.animation.duration = 300;
        }
        
        announceToScreenReader('일반 애니메이션 모드가 활성화되었습니다.');
    }
}

/**
 * Set up interaction performance monitoring
 */
function setupInteractionPerformanceMonitoring() {
    // Monitor input lag
    let lastInputTime = 0;
    
    document.addEventListener('input', (event) => {
        const now = performance.now();
        const inputLag = now - lastInputTime;
        
        if (inputLag > 100 && lastInputTime > 0) {
            console.warn(`High input lag detected: ${inputLag.toFixed(2)}ms`);
        }
        
        lastInputTime = now;
    });
    
    // Monitor scroll performance
    let scrollTimeout;
    let scrollStart = 0;
    
    document.addEventListener('scroll', () => {
        if (!scrollStart) {
            scrollStart = performance.now();
        }
        
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollDuration = performance.now() - scrollStart;
            if (scrollDuration > 16) { // More than one frame at 60fps
                console.warn(`Slow scroll performance: ${scrollDuration.toFixed(2)}ms`);
            }
            scrollStart = 0;
        }, 100);
    });
}

/**
 * Set up mobile-specific optimizations
 */
function setupMobileOptimizations() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = 'ontouchstart' in window;
    
    if (isMobile || isTouchDevice) {
        document.body.classList.add('mobile-device');
        
        // Optimize touch interactions
        setupTouchOptimizations();
        
        // Reduce calculation frequency on mobile
        setupMobilePerformanceOptimizations();
        
        console.log('Mobile optimizations enabled');
    }
}

/**
 * Set up touch-specific optimizations
 */
function setupTouchOptimizations() {
    // Prevent zoom on double-tap for form inputs
    document.addEventListener('touchend', (event) => {
        if (event.target.matches('input, button, select')) {
            event.preventDefault();
        }
    });
    
    // Optimize touch scrolling
    document.addEventListener('touchstart', () => {
        document.body.classList.add('touching');
    });
    
    document.addEventListener('touchend', () => {
        setTimeout(() => {
            document.body.classList.remove('touching');
        }, 300);
    });
    
    // Add touch-friendly hover states
    document.addEventListener('touchstart', (event) => {
        if (event.target.closest('.shape-group')) {
            event.target.closest('.shape-group').classList.add('touch-hover');
        }
    });
    
    document.addEventListener('touchend', (event) => {
        setTimeout(() => {
            document.querySelectorAll('.touch-hover').forEach(el => {
                el.classList.remove('touch-hover');
            });
        }, 300);
    });
}

/**
 * Set up mobile performance optimizations
 */
function setupMobilePerformanceOptimizations() {
    // Increase debounce time on mobile
    const originalDebounce = debounce;
    window.debounce = function(func, wait) {
        const mobileWait = document.body.classList.contains('mobile-device') ? wait * 1.5 : wait;
        return originalDebounce(func, mobileWait);
    };
    
    // Reduce chart update frequency on mobile
    const originalUpdateChart = updateChart;
    window.updateChart = function() {
        if (document.body.classList.contains('mobile-device')) {
            // Use requestAnimationFrame for smoother updates
            requestAnimationFrame(originalUpdateChart);
        } else {
            originalUpdateChart();
        }
    };
    
    // Optimize SVG rendering on mobile
    const svg = document.getElementById('cross-section-svg');
    if (svg && document.body.classList.contains('mobile-device')) {
        svg.style.willChange = 'transform';
    }
}

/**
 * Performance optimization: Lazy load non-critical features
 */
function lazyLoadFeatures() {
    // Lazy load compression animation functionality
    const animationButton = document.getElementById('compression-animation');
    if (animationButton) {
        animationButton.addEventListener('click', () => {
            import('./animation-features.js').then(module => {
                module.initializeAdvancedAnimations();
            }).catch(error => {
                console.warn('Failed to load advanced animation features:', error);
            });
        }, { once: true });
    }
}

/**
 * Memory management and cleanup
 */
function setupMemoryManagement() {
    // Clean up event listeners on page unload
    window.addEventListener('beforeunload', () => {
        // Clean up chart
        if (AppState.chart) {
            AppState.chart.destroy();
        }
        
        // Clean up tooltips
        const tooltip = document.getElementById('shape-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
        
        // Clear intervals and timeouts
        clearInterval(window.performanceMonitorInterval);
        clearTimeout(window.calculationTimeout);
    });
    
    // Periodic memory cleanup
    setInterval(() => {
        // Clean up old localStorage entries
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('euler-') && key.includes('temp-')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('Failed to clean up localStorage:', error);
        }
    }, 300000); // Every 5 minutes
}

/**
 * Comprehensive Testing and Validation Functions
 * Task 8.3: Add comprehensive testing and validation
 */

/**
 * Run comprehensive application tests
 * @returns {Object} Test results summary
 */
function runComprehensiveTests() {
    console.log('Running comprehensive application tests...');
    
    const testSuite = {
        mathematical: testMathematicalFunctions(),
        ui: testUIComponents(),
        accessibility: testAccessibilityFeatures(),
        performance: testPerformanceMetrics(),
        crossBrowser: testCrossBrowserCompatibility(),
        userExperience: testUserExperienceFlows()
    };
    
    // Calculate overall results
    const totalTests = Object.values(testSuite).reduce((sum, suite) => sum + suite.passed + suite.failed, 0);
    const totalPassed = Object.values(testSuite).reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = Object.values(testSuite).reduce((sum, suite) => sum + suite.failed, 0);
    
    const overallResults = {
        totalTests,
        totalPassed,
        totalFailed,
        successRate: (totalPassed / totalTests * 100).toFixed(1),
        testSuite,
        timestamp: new Date().toISOString()
    };
    
    console.log('Comprehensive test results:', overallResults);
    
    // Store results for analysis
    try {
        localStorage.setItem('euler-test-results', JSON.stringify(overallResults));
    } catch (error) {
        console.warn('Failed to store test results:', error);
    }
    
    return overallResults;
}

/**
 * Test mathematical functions beyond basic sanity checks
 * @returns {Object} Mathematical test results
 */
function testMathematicalFunctions() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test edge cases for circular calculations
    try {
        const verySmallCircle = calculateCircularProperties(1e-6);
        if (isNumericallyStable(verySmallCircle.area) && verySmallCircle.area > 0) {
            results.passed++;
            results.details.push('✓ Very small circle calculation stable');
        } else {
            results.failed++;
            results.details.push('✗ Very small circle calculation failed');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Very small circle calculation threw error');
    }
    
    // Test polygon convergence to circle
    try {
        const triangle = calculatePolygonProperties(3, 1);
        const hexagon = calculatePolygonProperties(6, 1);
        const dodecagon = calculatePolygonProperties(12, 1);
        const circle = calculateCircularProperties(1);
        
        const convergenceTest = triangle.unitArea < hexagon.unitArea && 
                               hexagon.unitArea < dodecagon.unitArea &&
                               dodecagon.unitArea < circle.area;
        
        if (convergenceTest) {
            results.passed++;
            results.details.push('✓ Polygon area converges to circle correctly');
        } else {
            results.failed++;
            results.details.push('✗ Polygon convergence test failed');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Polygon convergence test threw error');
    }
    
    // Test scaling behavior
    try {
        const basePolygon = calculatePolygonProperties(4, 1);
        const scaledPolygon = calculatePolygonProperties(4, 2);
        
        const areaScaling = Math.abs(scaledPolygon.area - (basePolygon.area * 4)) < 1e-10;
        const momentScaling = Math.abs(scaledPolygon.secondMoment - (basePolygon.secondMoment * 16)) < 1e-8;
        
        if (areaScaling && momentScaling) {
            results.passed++;
            results.details.push('✓ Polygon scaling behavior correct');
        } else {
            results.failed++;
            results.details.push('✗ Polygon scaling behavior incorrect');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Polygon scaling test threw error');
    }
    
    // Test Euler load calculation with extreme values
    try {
        const extremeTests = [
            { E: 1e9, I: 1e-8, K: 0.5, L: 10 }, // Very long column
            { E: 300e9, I: 1e-4, K: 2.0, L: 0.5 }, // Very stiff, short column
            { E: 10e9, I: 1e-6, K: 1.0, L: 1.0 }  // Moderate values
        ];
        
        let extremeTestsPassed = 0;
        extremeTests.forEach((test, index) => {
            const load = calculateEulerLoad(test.E, test.I, test.K, test.L);
            if (isNumericallyStable(load) && load > 0) {
                extremeTestsPassed++;
            }
        });
        
        if (extremeTestsPassed === extremeTests.length) {
            results.passed++;
            results.details.push('✓ Euler load calculation handles extreme values');
        } else {
            results.failed++;
            results.details.push('✗ Euler load calculation failed with extreme values');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Extreme value Euler load test threw error');
    }
    
    return results;
}

/**
 * Test UI components functionality
 * @returns {Object} UI test results
 */
function testUIComponents() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test shape selector initialization
    const shapeCheckboxes = document.querySelectorAll('.shape-checkbox input[type="checkbox"]');
    if (shapeCheckboxes.length === Object.keys(SHAPES).length) {
        results.passed++;
        results.details.push('✓ All shape checkboxes initialized');
    } else {
        results.failed++;
        results.details.push('✗ Shape checkbox count mismatch');
    }
    
    // Test parameter inputs existence
    const requiredInputs = [
        'material-e', 'material-e-slider',
        'column-height', 'column-height-slider',
        'effective-length-factor',
        'target-area', 'target-perimeter'
    ];
    
    const missingInputs = requiredInputs.filter(id => !document.getElementById(id));
    if (missingInputs.length === 0) {
        results.passed++;
        results.details.push('✓ All required parameter inputs present');
    } else {
        results.failed++;
        results.details.push(`✗ Missing inputs: ${missingInputs.join(', ')}`);
    }
    
    // Test chart initialization
    if (AppState.chart && AppState.chart.canvas) {
        results.passed++;
        results.details.push('✓ Chart initialized successfully');
    } else {
        results.failed++;
        results.details.push('✗ Chart initialization failed');
    }
    
    // Test results table structure
    const resultsTable = document.getElementById('results-table');
    const expectedColumns = 6; // Shape, Area, Second Moment, Radius, Slenderness, Critical Load
    const actualColumns = resultsTable ? resultsTable.querySelectorAll('th').length : 0;
    
    if (actualColumns === expectedColumns) {
        results.passed++;
        results.details.push('✓ Results table has correct column structure');
    } else {
        results.failed++;
        results.details.push(`✗ Results table column mismatch: expected ${expectedColumns}, got ${actualColumns}`);
    }
    
    // Test SVG preview container
    const svgContainer = document.getElementById('cross-section-svg');
    if (svgContainer && svgContainer.tagName === 'svg') {
        results.passed++;
        results.details.push('✓ SVG preview container initialized');
    } else {
        results.failed++;
        results.details.push('✗ SVG preview container missing or incorrect');
    }
    
    // Test export buttons
    const exportButtons = ['export-csv', 'export-chart'].map(id => document.getElementById(id));
    const exportButtonsPresent = exportButtons.every(btn => btn !== null);
    
    if (exportButtonsPresent) {
        results.passed++;
        results.details.push('✓ Export buttons present');
    } else {
        results.failed++;
        results.details.push('✗ Some export buttons missing');
    }
    
    return results;
}

/**
 * Test accessibility features
 * @returns {Object} Accessibility test results
 */
function testAccessibilityFeatures() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test ARIA labels and descriptions
    const elementsNeedingAria = document.querySelectorAll('input, button, select');
    let ariaCompliantCount = 0;
    
    elementsNeedingAria.forEach(element => {
        const hasLabel = element.getAttribute('aria-label') || 
                        element.getAttribute('aria-labelledby') ||
                        document.querySelector(`label[for="${element.id}"]`);
        
        if (hasLabel) {
            ariaCompliantCount++;
        }
    });
    
    const ariaComplianceRate = ariaCompliantCount / elementsNeedingAria.length;
    if (ariaComplianceRate > 0.9) {
        results.passed++;
        results.details.push(`✓ ARIA compliance rate: ${(ariaComplianceRate * 100).toFixed(1)}%`);
    } else {
        results.failed++;
        results.details.push(`✗ Low ARIA compliance rate: ${(ariaComplianceRate * 100).toFixed(1)}%`);
    }
    
    // Test keyboard navigation
    const focusableElements = document.querySelectorAll(
        'input, button, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
        results.passed++;
        results.details.push(`✓ ${focusableElements.length} focusable elements for keyboard navigation`);
    } else {
        results.failed++;
        results.details.push('✗ No focusable elements found');
    }
    
    // Test live region for screen readers
    const liveRegion = document.getElementById('live-region');
    if (liveRegion && liveRegion.getAttribute('aria-live')) {
        results.passed++;
        results.details.push('✓ Live region for screen reader announcements present');
    } else {
        results.failed++;
        results.details.push('✗ Live region missing or improperly configured');
    }
    
    // Test semantic HTML structure
    const semanticElements = ['header', 'main', 'aside', 'section', 'footer'];
    const presentSemanticElements = semanticElements.filter(tag => 
        document.querySelector(tag) !== null
    );
    
    if (presentSemanticElements.length >= 4) {
        results.passed++;
        results.details.push('✓ Good semantic HTML structure');
    } else {
        results.failed++;
        results.details.push('✗ Poor semantic HTML structure');
    }
    
    // Test color contrast (basic check)
    const computedStyles = getComputedStyle(document.body);
    const bgColor = computedStyles.backgroundColor;
    const textColor = computedStyles.color;
    
    if (bgColor && textColor && bgColor !== textColor) {
        results.passed++;
        results.details.push('✓ Basic color contrast check passed');
    } else {
        results.failed++;
        results.details.push('✗ Basic color contrast check failed');
    }
    
    return results;
}

/**
 * Test performance metrics
 * @returns {Object} Performance test results
 */
function testPerformanceMetrics() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test calculation performance
    const startTime = performance.now();
    
    // Simulate calculation with all shapes
    const testState = {
        selectedShapes: new Set(Object.keys(SHAPES)),
        parameters: { ...DEFAULT_PARAMETERS }
    };
    
    const originalState = { ...AppState };
    AppState.selectedShapes = testState.selectedShapes;
    AppState.parameters = testState.parameters;
    
    try {
        const testResults = calculateAllShapes();
        const calculationTime = performance.now() - startTime;
        
        if (calculationTime < 100) {
            results.passed++;
            results.details.push(`✓ Calculation performance: ${calculationTime.toFixed(2)}ms`);
        } else {
            results.failed++;
            results.details.push(`✗ Slow calculation performance: ${calculationTime.toFixed(2)}ms`);
        }
        
        // Test result validity
        if (testResults.length === testState.selectedShapes.size) {
            results.passed++;
            results.details.push('✓ All shapes calculated successfully');
        } else {
            results.failed++;
            results.details.push('✗ Some shapes failed to calculate');
        }
        
    } catch (error) {
        results.failed++;
        results.details.push('✗ Calculation performance test threw error');
    } finally {
        // Restore original state
        Object.assign(AppState, originalState);
    }
    
    // Test memory usage (basic check)
    if (performance.memory) {
        const memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        if (memoryUsage < 50) { // Less than 50MB
            results.passed++;
            results.details.push(`✓ Memory usage: ${memoryUsage.toFixed(2)}MB`);
        } else {
            results.failed++;
            results.details.push(`✗ High memory usage: ${memoryUsage.toFixed(2)}MB`);
        }
    } else {
        results.details.push('ℹ Memory usage data not available');
    }
    
    // Test DOM manipulation performance
    const domStartTime = performance.now();
    
    try {
        // Simulate table update
        updateResultsTable();
        const domTime = performance.now() - domStartTime;
        
        if (domTime < 50) {
            results.passed++;
            results.details.push(`✓ DOM update performance: ${domTime.toFixed(2)}ms`);
        } else {
            results.failed++;
            results.details.push(`✗ Slow DOM update: ${domTime.toFixed(2)}ms`);
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ DOM performance test threw error');
    }
    
    return results;
}

/**
 * Test cross-browser compatibility features
 * @returns {Object} Cross-browser test results
 */
function testCrossBrowserCompatibility() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test essential browser APIs
    const requiredAPIs = [
        { name: 'localStorage', test: () => typeof Storage !== 'undefined' },
        { name: 'Canvas', test: () => !!document.createElement('canvas').getContext },
        { name: 'SVG', test: () => !!document.createElementNS },
        { name: 'JSON', test: () => typeof JSON !== 'undefined' },
        { name: 'Promise', test: () => typeof Promise !== 'undefined' },
        { name: 'Array.from', test: () => typeof Array.from === 'function' },
        { name: 'Object.assign', test: () => typeof Object.assign === 'function' }
    ];
    
    requiredAPIs.forEach(api => {
        try {
            if (api.test()) {
                results.passed++;
                results.details.push(`✓ ${api.name} API supported`);
            } else {
                results.failed++;
                results.details.push(`✗ ${api.name} API not supported`);
            }
        } catch (error) {
            results.failed++;
            results.details.push(`✗ ${api.name} API test threw error`);
        }
    });
    
    // Test CSS features
    const cssFeatures = [
        { name: 'CSS Grid', test: () => CSS.supports('display', 'grid') },
        { name: 'CSS Flexbox', test: () => CSS.supports('display', 'flex') },
        { name: 'CSS Custom Properties', test: () => CSS.supports('--test', 'value') },
        { name: 'CSS Transforms', test: () => CSS.supports('transform', 'scale(1)') }
    ];
    
    if (typeof CSS !== 'undefined' && CSS.supports) {
        cssFeatures.forEach(feature => {
            try {
                if (feature.test()) {
                    results.passed++;
                    results.details.push(`✓ ${feature.name} supported`);
                } else {
                    results.failed++;
                    results.details.push(`✗ ${feature.name} not supported`);
                }
            } catch (error) {
                results.failed++;
                results.details.push(`✗ ${feature.name} test threw error`);
            }
        });
    } else {
        results.details.push('ℹ CSS.supports not available for feature testing');
    }
    
    // Test Chart.js compatibility
    if (typeof Chart !== 'undefined') {
        results.passed++;
        results.details.push('✓ Chart.js library loaded');
    } else {
        results.failed++;
        results.details.push('✗ Chart.js library not loaded');
    }
    
    return results;
}

/**
 * Test user experience flows
 * @returns {Object} User experience test results
 */
function testUserExperienceFlows() {
    const results = {
        passed: 0,
        failed: 0,
        details: []
    };
    
    // Test default initialization flow
    try {
        const defaultShapesSelected = AppState.selectedShapes.size > 0;
        const defaultParametersSet = AppState.parameters.materialE > 0;
        
        if (defaultShapesSelected && defaultParametersSet) {
            results.passed++;
            results.details.push('✓ Default initialization flow works');
        } else {
            results.failed++;
            results.details.push('✗ Default initialization flow incomplete');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Default initialization test threw error');
    }
    
    // Test parameter change flow
    try {
        const originalValue = AppState.parameters.materialE;
        AppState.parameters.materialE = 150;
        
        // Simulate parameter change
        const event = new Event('input');
        const materialInput = document.getElementById('material-e');
        if (materialInput) {
            materialInput.value = '150';
            materialInput.dispatchEvent(event);
            
            results.passed++;
            results.details.push('✓ Parameter change flow works');
        } else {
            results.failed++;
            results.details.push('✗ Material input not found for parameter change test');
        }
        
        // Restore original value
        AppState.parameters.materialE = originalValue;
    } catch (error) {
        results.failed++;
        results.details.push('✗ Parameter change test threw error');
    }
    
    // Test export functionality availability
    try {
        const csvSupported = isCSVExportSupported();
        const chartSupported = isChartExportSupported();
        
        if (csvSupported && chartSupported) {
            results.passed++;
            results.details.push('✓ Export functionality available');
        } else {
            results.failed++;
            results.details.push(`✗ Export support limited: CSV=${csvSupported}, Chart=${chartSupported}`);
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Export functionality test threw error');
    }
    
    // Test responsive design elements
    try {
        const viewportWidth = window.innerWidth;
        const isMobileLayout = viewportWidth < 768;
        const parameterPanel = document.querySelector('.parameter-panel');
        
        if (parameterPanel) {
            const panelStyles = getComputedStyle(parameterPanel);
            const isResponsive = panelStyles.display !== 'none';
            
            if (isResponsive) {
                results.passed++;
                results.details.push(`✓ Responsive design works (viewport: ${viewportWidth}px)`);
            } else {
                results.failed++;
                results.details.push('✗ Responsive design issues detected');
            }
        } else {
            results.failed++;
            results.details.push('✗ Parameter panel not found for responsive test');
        }
    } catch (error) {
        results.failed++;
        results.details.push('✗ Responsive design test threw error');
    }
    
    return results;
}

/**
 * Run automated performance benchmarks
 * @returns {Object} Performance benchmark results
 */
function runPerformanceBenchmarks() {
    console.log('Running performance benchmarks...');
    
    const benchmarks = {
        calculationSpeed: benchmarkCalculationSpeed(),
        uiUpdateSpeed: benchmarkUIUpdateSpeed(),
        memoryUsage: benchmarkMemoryUsage(),
        renderingPerformance: benchmarkRenderingPerformance()
    };
    
    console.log('Performance benchmarks completed:', benchmarks);
    return benchmarks;
}

/**
 * Benchmark calculation speed
 * @returns {Object} Calculation speed benchmark results
 */
function benchmarkCalculationSpeed() {
    const iterations = 100;
    const times = [];
    
    // Store original state
    const originalState = { ...AppState };
    
    // Set up test state
    AppState.selectedShapes = new Set(Object.keys(SHAPES));
    AppState.parameters = { ...DEFAULT_PARAMETERS };
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        calculateAllShapes();
        const endTime = performance.now();
        times.push(endTime - startTime);
    }
    
    // Restore original state
    Object.assign(AppState, originalState);
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
        iterations,
        averageTime: avgTime.toFixed(2),
        minTime: minTime.toFixed(2),
        maxTime: maxTime.toFixed(2),
        withinTarget: avgTime < 100 // Target: under 100ms
    };
}

/**
 * Benchmark UI update speed
 * @returns {Object} UI update speed benchmark results
 */
function benchmarkUIUpdateSpeed() {
    const iterations = 50;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        updateResultsTable();
        updateChart();
        const endTime = performance.now();
        times.push(endTime - startTime);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
        iterations,
        averageTime: avgTime.toFixed(2),
        minTime: minTime.toFixed(2),
        maxTime: maxTime.toFixed(2),
        withinTarget: avgTime < 50 // Target: under 50ms
    };
}

/**
 * Benchmark memory usage
 * @returns {Object} Memory usage benchmark results
 */
function benchmarkMemoryUsage() {
    if (!performance.memory) {
        return { available: false, message: 'Memory API not available' };
    }
    
    const initialMemory = performance.memory.usedJSHeapSize;
    
    // Perform memory-intensive operations
    for (let i = 0; i < 1000; i++) {
        calculateAllShapes();
    }
    
    const finalMemory = performance.memory.usedJSHeapSize;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
    
    return {
        initialMemory: (initialMemory / 1024 / 1024).toFixed(2) + ' MB',
        finalMemory: (finalMemory / 1024 / 1024).toFixed(2) + ' MB',
        memoryIncrease: memoryIncrease.toFixed(2) + ' MB',
        withinTarget: memoryIncrease < 10 // Target: less than 10MB increase
    };
}

/**
 * Benchmark rendering performance
 * @returns {Object} Rendering performance benchmark results
 */
function benchmarkRenderingPerformance() {
    const iterations = 20;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        updateCrossSectionPreview();
        const endTime = performance.now();
        times.push(endTime - startTime);
    }
    
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
        iterations,
        averageTime: avgTime.toFixed(2),
        minTime: minTime.toFixed(2),
        maxTime: maxTime.toFixed(2),
        withinTarget: avgTime < 30 // Target: under 30ms
    };
}

/**
 * Generate comprehensive test report
 * @returns {Object} Complete test report
 */
function generateTestReport() {
    console.log('Generating comprehensive test report...');
    
    const testResults = runComprehensiveTests();
    const performanceBenchmarks = runPerformanceBenchmarks();
    
    const report = {
        timestamp: new Date().toISOString(),
        environment: {
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            features: {
                localStorage: typeof Storage !== 'undefined',
                canvas: !!document.createElement('canvas').getContext,
                svg: !!document.createElementNS,
                chartjs: typeof Chart !== 'undefined'
            }
        },
        testResults,
        performanceBenchmarks,
        recommendations: generateRecommendations(testResults, performanceBenchmarks)
    };
    
    console.log('Test report generated:', report);
    
    // Store report
    try {
        localStorage.setItem('euler-test-report', JSON.stringify(report));
    } catch (error) {
        console.warn('Failed to store test report:', error);
    }
    
    return report;
}

/**
 * Generate recommendations based on test results
 * @param {Object} testResults - Test results
 * @param {Object} benchmarks - Performance benchmarks
 * @returns {Array} Array of recommendations
 */
function generateRecommendations(testResults, benchmarks) {
    const recommendations = [];
    
    // Check overall test success rate
    if (testResults.successRate < 90) {
        recommendations.push({
            type: 'critical',
            message: `Low test success rate (${testResults.successRate}%). Review failed tests and fix issues.`
        });
    }
    
    // Check performance benchmarks
    if (!benchmarks.calculationSpeed.withinTarget) {
        recommendations.push({
            type: 'performance',
            message: `Calculation speed (${benchmarks.calculationSpeed.averageTime}ms) exceeds target. Consider optimization.`
        });
    }
    
    if (!benchmarks.uiUpdateSpeed.withinTarget) {
        recommendations.push({
            type: 'performance',
            message: `UI update speed (${benchmarks.uiUpdateSpeed.averageTime}ms) exceeds target. Consider DOM optimization.`
        });
    }
    
    if (benchmarks.memoryUsage.available && !benchmarks.memoryUsage.withinTarget) {
        recommendations.push({
            type: 'memory',
            message: `Memory usage increase (${benchmarks.memoryUsage.memoryIncrease}) exceeds target. Check for memory leaks.`
        });
    }
    
    // Check accessibility
    if (testResults.testSuite.accessibility.failed > 0) {
        recommendations.push({
            type: 'accessibility',
            message: 'Accessibility issues detected. Review ARIA labels, keyboard navigation, and semantic HTML.'
        });
    }
    
    // Check cross-browser compatibility
    if (testResults.testSuite.crossBrowser.failed > 0) {
        recommendations.push({
            type: 'compatibility',
            message: 'Cross-browser compatibility issues detected. Consider polyfills or alternative implementations.'
        });
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            type: 'success',
            message: 'All tests passed successfully! Application is performing well.'
        });
    }
    
    return recommendations;
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Expose testing functions for development and debugging
if (typeof window !== 'undefined') {
    window.EulerTesting = {
        runComprehensiveTests,
        runPerformanceBenchmarks,
        generateTestReport,
        testMathematicalFunctions,
        testUIComponents,
        testAccessibilityFeatures,
        testPerformanceMetrics,
        testCrossBrowserCompatibility,
        testUserExperienceFlows
    };
}