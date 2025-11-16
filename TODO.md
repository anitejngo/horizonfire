# Horizonfire Arduino Lib Simulator TODO

## Project Overview
Build a React app that simulates the Fire_Main Arduino library (https://github.com/Electriangle/Fire_Main). Instead of controlling physical LEDs via Arduino pins, replicate the logic in JavaScript to update a React state with LED indices and colors. The app will allow users to paste Arduino code into a text field, simulate its execution (setup and loop), and render the LED animations in real-time.

### Key Features
- **Code Input**: Text field/textarea for pasting Arduino code (e.g., the provided fire animation code).
- **Simulation**: Parse/simulate the code to run setup() once, then loop() repeatedly, updating LED state.
- **LED Renderer**: Visual component displaying 20 LEDs (WS2812B strip) with colors from state.
- **Controls**: Play/pause, speed adjustment, distance sensor input (slider for simulation).
- **Animation**: Smooth fire effect modulated by distance sensor data.

## Detailed Breakdown

### 1. Analyze Arduino Code Structure
- **Objective**: Understand the provided Arduino sketch and library dependencies.
- **Components**:
  - Libraries: FastLED (for LEDs), Adafruit_VL53L1X (distance sensor), Wire.
  - Constants: LED_PIN=6, NUM_LEDS=20, BRIGHTNESS=200, DIST_OFF=1500, DIST_FULL=3000, etc.
  - Global vars: leds[] array, heat[] array, distBuf[] for smoothing.
  - Functions: Fire2012() (fire animation), getSmoothedDistance() (sensor smoothing), setup(), loop().
- **Logic Flow**:
  - setup(): Init LEDs, sensor, fill distBuf.
  - loop(): Get distance → map to intensity → set brightness → run Fire2012 or fade.
- **Output**: Instead of FastLED.show(), collect led colors into state array.

### 2. Replicate Arduino Functions in JavaScript
- **Objective**: Port low-level Arduino/FastLED functions to JS.
- **Functions to Implement**:
  - `qsub8(a, b)`: Subtract with saturation (a - b, min 0).
  - `qadd8(a, b)`: Add with saturation (a + b, max 255).
  - `map(value, fromLow, fromHigh, toLow, toHigh)`: Linear mapping.
  - `scale8(i, scale)`: Scale value (i * scale / 256).
  - `ColorFromPalette(palette, index)`: Get color from HeatColors_p (heat map).
  - `random8(min?, max?)`: Random 0-255 or in range.
  - `random16(limit)`: Random 0 to limit-1.
  - `fadeToBlackBy(led, fade)`: Dim color by fade amount.
- **HeatColors_p Palette**: Implement a heat color array (blues to reds).
- **Notes**: Use Math.random() for randomness, arrays for palettes.

### 3. Create React State for LED Array
- **Objective**: Manage LED data in React.
- **Structure**:
  - State: `leds` as array of 20 objects: `{ index: number, color: { r: number, g: number, b: number } }`
  - Initial: All black (r=0,g=0,b=0).
- **Updates**: Modify state via setLeds in simulation functions.

### 4. Implement Distance Sensor Simulation
- **Objective**: Simulate VL53L1X sensor input.
- **Implementation**:
  - State: `distance` (uint16_t, 0-4000mm).
  - UI: Slider (range 0-4000) or auto-random.
  - Smoothing: Replicate distBuf logic (6-sample average).
- **Notes**: In loop, call getSmoothedDistance() which updates buffer and returns avg.

### 5. Port Fire2012 Logic to Update LED State
- **Objective**: Translate fire animation to JS, updating leds state.
- **Steps**:
  - Replicate heat[] array (uint8_t[20]).
  - Cooling: heat[i] -= random(0, (COOLING*10/NUM_LEDS)+2), saturate to 0.
  - Diffusion: heat[k] = (heat[k-1] + heat[k-2] + heat[k-2]) / 3 for k=19 to 2.
  - Sparking: If random() < SPARKING, add heat to random index.
  - Color mapping: For each i, ci = scale8(heat[i], 240), color = HeatColors_p[ci], set leds[i].
- **Integration**: Call Fire2012() in loop when intensity > 0.

### 6. Create LED Renderer Component
- **Objective**: Visual representation of LEDs.
- **Options**:
  - Canvas: Draw 20 rectangles/circles with colors.
  - Divs: 20 inline divs styled with background-color.
- **Props**: leds array, brightness.
- **Animation**: Re-render on state change for smooth updates.
- **Layout**: Horizontal strip, centered.

### 7. Add Code Editor/Text Field
- **Objective**: Input for Arduino code.
- **Implementation**:
  - Textarea component with placeholder (e.g., the sample code).
  - State: `code` string.
  - On change, update state (for future parsing).
- **Notes**: Initially, hardcode simulation; later add parsing.

### 8. Parse/Simulate Code Execution
- **Objective**: Run the pasted code logic in React.
- **Approach**:
  - Simple simulation: Ignore pasted code, run hardcoded setup/loop.
  - Advanced: Use a JS parser (e.g., acorn) to extract setup/loop, eval safely.
  - For now: Button to "run" which starts loop simulation.
- **Execution**:
  - On run: Call setup (init state), then loop every ~25ms.
  - Update leds state in loop.

### 9. Implement Animation Loop in React
- **Objective**: Continuous execution of loop().
- **Implementation**:
  - useEffect with setInterval (25ms).
  - In interval: Run getSmoothedDistance, map intensity, set brightness, Fire2012 or fade, update leds.
  - State: `isRunning`, `intervalId`.
- **Controls**: Start/stop via buttons.

### 10. Add Controls
- **Objective**: User interaction.
- **Elements**:
  - Play/Pause button.
  - Speed slider (adjust interval).
  - Distance slider (override sensor).
  - Brightness display.
- **State**: speed (ms), manualDistance (optional).

## Implementation Steps
1. Set up basic React structure (App.tsx with states).
2. Implement JS replicas of Arduino functions.
3. Create LED renderer component.
4. Add distance simulation.
5. Port Fire2012 and loop logic.
6. Integrate with state updates.
7. Add text field and run button.
8. Implement animation loop.
9. Add controls UI.
10. Test with sample code.

## Testing
- Run setup: LEDs init black.
- Set distance high: Fire animation runs, LEDs colorful.
- Set distance low: LEDs fade to black.
- Adjust speed: Faster/slower animation.
- Paste code: (Future) parses and runs.

## Dependencies
- React, TypeScript.
- Optional: @monaco-editor/react for code editor, but start with textarea.
