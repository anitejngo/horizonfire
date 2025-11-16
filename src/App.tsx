import React, { useState, useEffect, useRef } from 'react';
import CodeEditor from './components/CodeEditor';
import SimulationCanvas from './components/SimulationCanvas';
import { Led } from './components/LEDRenderer';
import { Fire2012, DIST_OFF, DIST_FULL, BRIGHTNESS, map, getSmoothedDistance, fadeToBlackBy } from './arduinoUtils';
import { DEFAULT_CODE } from './config/arduinoDefaults';
import { ANIMATION_INTERVAL } from './config/constants';
import './App.css';

function App() {
  // Dynamic LED count
  const [numLeds, setNumLeds] = useState<number>(20);

  // Initialize LEDs as black
  const [leds, setLeds] = useState<Led[]>(
    Array.from({ length: numLeds }, (_, i) => ({
      index: i,
      color: { r: 0, g: 0, b: 0 },
    }))
  );

  // Heat array for fire simulation
  const [heat, setHeat] = useState<number[]>(Array(numLeds).fill(0));

  // Distance simulation
  const [distance, setDistance] = useState<number>(2500); // Simulated distance in mm
  const [distBuf, setDistBuf] = useState<number[]>(Array(6).fill(DIST_FULL)); // Init buffer
  const [distIdx, setDistIdx] = useState<number>(0);

  // Code input
  const [code, setCode] = useState<string>(DEFAULT_CODE);

  // Update leds and heat when numLeds changes
  useEffect(() => {
    setLeds(Array.from({ length: numLeds }, (_, i) => ({
      index: i,
      color: { r: 0, g: 0, b: 0 },
    })));
    setHeat(Array(numLeds).fill(0));
  }, [numLeds]);

  const runFire = () => {
    // Get smoothed distance
    const distResult = getSmoothedDistance(distBuf, distIdx, distance);
    setDistBuf(distResult.newBuf);
    setDistIdx(distResult.newIdx);
    const dist = distResult.smoothed;

    // Map distance to intensity
    let intensity: number;
    if (dist <= DIST_OFF) intensity = 0;
    else if (dist >= DIST_FULL) intensity = 255;
    else intensity = map(dist, DIST_OFF, DIST_FULL, 0, 255);

    // Set global brightness
    const globalB = map(intensity, 0, 255, 0, BRIGHTNESS);

    if (intensity === 0) {
      // Fade to black
      setLeds((prevLeds) =>
        prevLeds.map((led) => ({
          ...led,
          color: fadeToBlackBy(led.color, 200),
        }))
      );
    } else {
      // Run fire animation
      setHeat((prevHeat) => {
        const result = Fire2012(prevHeat);
        // Scale colors by brightness
        const scaledLeds = result.leds.map((color) => ({
          r: Math.floor((color.r * globalB) / BRIGHTNESS),
          g: Math.floor((color.g * globalB) / BRIGHTNESS),
          b: Math.floor((color.b * globalB) / BRIGHTNESS),
        }));
        setLeds(scaledLeds.map((color, index) => ({ index, color })));
        return result.newHeat;
      });
    }
  };

  // Animation state
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentRunRef = useRef<(() => void)>(runFire);

  const parseCode = () => {
    console.log('Parsing code...');
    // Extract NUM_LEDS
    const numLedsMatch = code.match(/#define NUM_LEDS\s+(\d+)/);
    if (numLedsMatch) {
      const newNumLeds = parseInt(numLedsMatch[1]);
      console.log('Parsed NUM_LEDS:', newNumLeds);
      setNumLeds(newNumLeds);
    }

    // Extract loop body using regex
    const loopMatch = code.match(/void loop\(\)\s*\{([\s\S]*)\}/);
    console.log('Loop match:', loopMatch);
    if (!loopMatch) {
      alert('No loop() function found in code');
      return;
    }
    const loopBody = loopMatch[1];
    console.log('Loop body:', loopBody);

    // For simplicity, check if it includes Fire2012, else assume fade
    const hasFire = loopBody.includes('Fire2012()');
    console.log('Includes Fire2012():', hasFire);
    if (hasFire) {
      console.log('Setting to fire mode');
      currentRunRef.current = runFire; // Use our fire logic
    } else {
      console.log('Setting to fade mode');
      currentRunRef.current = () => {
        // Custom fade logic
        setLeds((prevLeds) =>
          prevLeds.map((led) => ({
            ...led,
            color: fadeToBlackBy(led.color, 50),
          }))
        );
      };
    }
    console.log('Parse complete');
  };

  const toggleAnimation = () => {
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => currentRunRef.current(), ANIMATION_INTERVAL);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, distance]); // Remove currentRun from deps

  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <CodeEditor code={code} onChange={setCode} />
      <SimulationCanvas
        leds={leds}
        distance={distance}
        onDistanceChange={setDistance}
        isRunning={isRunning}
        onToggle={toggleAnimation}
        onParse={parseCode}
        numLeds={numLeds}
      />
    </div>
  );
}

export default App;
