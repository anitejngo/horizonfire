# Horizonfire Refactor Plan

## Overview
The current codebase is functional but monolithic. `App.tsx` handles all state, logic, and rendering. We need to refactor for better maintainability, reusability, and separation of concerns. Focus on extracting constants, creating smaller components, and organizing code into logical units.

## Current Structure Analysis
- **App.tsx** (300+ lines): Single component with states for LEDs, heat, distance, code, animation. Handles parsing, animation loop, and UI rendering.
- **LEDRenderer.tsx**: Simple LED display component.
- **arduinoUtils.ts**: Utility functions for Arduino simulation.
- **App.css**: Basic styles.

## Refactor Goals
1. Extract constants and configuration.
2. Break App into smaller, focused components.
3. Move logic to custom hooks.
4. Improve state management.
5. Enhance reusability and testability.

## Detailed Plan

### 1. Extract Constants and Configuration
**Objective**: Move hardcoded values to a central config file for easy tweaking.

**Files to Create**:
- `src/config/constants.ts`: App-wide constants.
- `src/config/arduinoDefaults.ts`: Default Arduino code and settings.

**What to Move**:
- NUM_LEDS default (20), but keep dynamic parsing.
- BRIGHTNESS, DIST_OFF, DIST_FULL, COOLING, SPARKING, SMOOTH_N.
- Default code string (defaultCode).
- Animation interval (25ms).
- UI dimensions (textarea rows/cols, LED size).

**Steps**:
1. Create `src/config/constants.ts`:
   ```typescript
   export const DEFAULT_NUM_LEDS = 20;
   export const ANIMATION_INTERVAL = 25;
   export const TEXTAREA_ROWS = 30;
   export const TEXTAREA_COLS = 100;
   export const LED_SIZE = 20; // px
   ```

2. Create `src/config/arduinoDefaults.ts`:
   ```typescript
   import { DEFAULT_NUM_LEDS } from './constants';
   
   export const DEFAULT_CODE = `#include <Wire.h>
   ...
   #define NUM_LEDS    ${DEFAULT_NUM_LEDS}
   ...`;
   ```

3. Update imports in App.tsx and arduinoUtils.ts.

### 2. Create Smaller Components
**Objective**: Split App.tsx into reusable components.

**New Components**:
- `CodeEditor`: Textarea for Arduino code input.
- `Controls`: Play/Pause and Parse buttons.
- `DistanceSlider`: Slider for distance input.
- `SimulationCanvas`: Container for LEDs and controls (right panel).

**Steps**:
1. Create `src/components/CodeEditor.tsx`:
   - Props: code, onChange, rows, cols.
   - Renders textarea.

2. Create `src/components/Controls.tsx`:
   - Props: isRunning, onToggle, onParse.
   - Renders buttons.

3. Create `src/components/DistanceSlider.tsx`:
   - Props: distance, onChange.
   - Renders label and input.

4. Create `src/components/SimulationCanvas.tsx`:
   - Props: distance, onDistanceChange, isRunning, onToggle, onParse, leds.
   - Renders DistanceSlider, Controls, LEDRenderer.

5. Update App.tsx to use these components, removing direct JSX.

### 3. Extract Custom Hooks
**Objective**: Move stateful logic to hooks for reusability.

**New Hooks**:
- `useArduinoSimulation`: Manages leds, heat, distance, animation.
- `useCodeParser`: Handles code parsing and state updates.
- `useAnimationLoop`: Manages interval and current function.

**Steps**:
1. Create `src/hooks/useArduinoSimulation.ts`:
   - State: leds, heat, distance, distBuf, distIdx, numLeds.
   - Logic: runFire, update arrays on numLeds change.
   - Returns: states and setters.

2. Create `src/hooks/useCodeParser.ts`:
   - State: code.
   - Logic: parseCode function, updates numLeds, animation mode.
   - Returns: code, parseCode.

3. Create `src/hooks/useAnimationLoop.ts`:
   - State: isRunning, intervalRef, currentRunRef.
   - Logic: start/stop animation, switch functions.
   - Returns: isRunning, toggle, setCurrentRun.

4. Update App.tsx to use hooks instead of direct state.

### 4. Improve State Management
**Objective**: Centralize related states.

**Steps**:
1. Combine distance, distBuf, distIdx into a single object state.
2. Use reducers for complex state updates if needed.
3. Ensure state updates are batched to avoid multiple re-renders.

### 5. Enhance Utils and Types
**Objective**: Better type safety and organization.

**Steps**:
1. Create `src/types/index.ts`:
   - Export Led interface, ArduinoConfig, etc.

2. Add more utils to arduinoUtils.ts:
   - Functions for initializing arrays, parsing constants.

3. Add JSDoc comments to functions.

### 6. Update Styling
**Objective**: Modular CSS.

**Steps**:
1. Create `src/components/CodeEditor.module.css`.
2. Update App.css to be minimal.
3. Use CSS modules for component-specific styles.

### 7. Testing and Validation
**Objective**: Ensure refactor doesn't break functionality.

**Steps**:
1. After each change, run `npm start` and test features.
2. Verify parsing, animation, LED count changes.
3. Add console logs for debugging if needed.

### 8. Final Cleanup
**Objective**: Remove unused code, optimize.

**Steps**:
1. Remove old constants from files.
2. Ensure no duplicate code.
3. Update README with new structure.

## Implementation Order
1. Extract constants (quick win).
2. Create components (break down UI).
3. Extract hooks (logic separation).
4. Improve types and styles.
5. Test thoroughly.

## Benefits
- **Maintainability**: Easier to modify individual parts.
- **Reusability**: Components and hooks can be reused.
- **Testability**: Smaller units are easier to test.
- **Readability**: Code is organized and self-documenting.

## Potential Challenges
- State dependencies between hooks/components.
- Ensuring animation loop updates correctly.
- Keeping types consistent across files.

This plan will transform the app from a single large component to a modular, scalable application.
