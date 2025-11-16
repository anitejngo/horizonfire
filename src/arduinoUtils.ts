// Arduino utility functions replicated in JavaScript for Fire_Main simulation

export const NUM_LEDS = 20;
export const BRIGHTNESS = 200;
export const DIST_OFF = 1500;
export const DIST_FULL = 3000;
export const COOLING = 55;
export const SPARKING = 120;
export const SMOOTH_N = 6;

// Saturation arithmetic
export function qsub8(a: number, b: number): number {
  return Math.max(0, a - b);
}

export function qadd8(a: number, b: number): number {
  return Math.min(255, a + b);
}

// Linear mapping
export function map(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
  return ((value - fromLow) * (toHigh - toLow)) / (fromHigh - fromLow) + toLow;
}

// Scale value (i * scale / 256)
export function scale8(i: number, scale: number): number {
  return Math.floor((i * scale) / 256);
}

// Random functions
export function random8(max?: number, min?: number): number {
  if (max === undefined) return Math.floor(Math.random() * 256);
  if (min === undefined) return Math.floor(Math.random() * max);
  return Math.floor(Math.random() * (max - min)) + min;
}

export function random16(limit: number): number {
  return Math.floor(Math.random() * limit);
}

// Heat color palette (simplified HeatColors_p from FastLED)
const HeatColors_p = [
  { r: 0, g: 0, b: 0 },       // Black
  { r: 0, g: 0, b: 4 },       // Dark blue
  { r: 0, g: 0, b: 8 },
  { r: 0, g: 0, b: 16 },
  { r: 0, g: 0, b: 32 },
  { r: 0, g: 0, b: 64 },
  { r: 0, g: 0, b: 128 },
  { r: 0, g: 0, b: 255 },     // Blue
  { r: 0, g: 4, b: 255 },
  { r: 0, g: 8, b: 255 },
  { r: 0, g: 16, b: 255 },
  { r: 0, g: 32, b: 255 },
  { r: 0, g: 64, b: 255 },
  { r: 0, g: 128, b: 255 },
  { r: 0, g: 255, b: 255 },   // Cyan
  { r: 0, g: 255, b: 128 },
  { r: 0, g: 255, b: 64 },
  { r: 0, g: 255, b: 32 },
  { r: 0, g: 255, b: 16 },
  { r: 0, g: 255, b: 8 },
  { r: 0, g: 255, b: 4 },
  { r: 0, g: 255, b: 0 },     // Green
  { r: 4, g: 255, b: 0 },
  { r: 8, g: 255, b: 0 },
  { r: 16, g: 255, b: 0 },
  { r: 32, g: 255, b: 0 },
  { r: 64, g: 255, b: 0 },
  { r: 128, g: 255, b: 0 },
  { r: 255, g: 255, b: 0 },   // Yellow
  { r: 255, g: 192, b: 0 },
  { r: 255, g: 128, b: 0 },
  { r: 255, g: 64, b: 0 },
  { r: 255, g: 32, b: 0 },
  { r: 255, g: 16, b: 0 },
  { r: 255, g: 8, b: 0 },
  { r: 255, g: 4, b: 0 },
  { r: 255, g: 0, b: 0 },     // Red
  // Extend to 256 entries if needed, but for simplicity, repeat or interpolate
];

// For index 0-255, map to palette
export function ColorFromPalette(index: number): { r: number, g: number, b: number } {
  const i = Math.floor(index / 256 * HeatColors_p.length);
  return HeatColors_p[Math.min(i, HeatColors_p.length - 1)];
}

// Fade to black by amount (0-255)
export function fadeToBlackBy(color: { r: number, g: number, b: number }, fade: number): { r: number, g: number, b: number } {
  return {
    r: scale8(color.r, 255 - fade),
    g: scale8(color.g, 255 - fade),
    b: scale8(color.b, 255 - fade),
  };
}

// Fire2012 simulation: takes current heat array, returns updated heat and leds
export function Fire2012(heat: number[]): { newHeat: number[], leds: { r: number, g: number, b: number }[] } {
  const newHeat = [...heat];
  const numLeds = heat.length;

  // Step 1. Cool down every cell a little
  for (let i = 0; i < numLeds; i++) {
    newHeat[i] = qsub8(newHeat[i], random8(0, ((COOLING * 10) / numLeds) + 2));
  }

  // Step 2. Heat from each cell drifts 'up' and diffuses a little
  for (let k = numLeds - 1; k >= 2; k--) {
    newHeat[k] = (newHeat[k - 1] + newHeat[k - 2] + newHeat[k - 2]) / 3;
  }

  // Step 3. Randomly ignite new 'sparks' of heat near the bottom
  if (random8() < SPARKING) {
    const y = random16(7);
    newHeat[y] = qadd8(newHeat[y], random8(160, 255));
  }

  // Step 4. Map from heat cells to LED colors
  const leds = newHeat.map((h) => {
    const ci = scale8(h, 240);
    return ColorFromPalette(ci);
  });

  return { newHeat, leds };
}

// Distance smoothing simulation
export function getSmoothedDistance(distBuf: number[], distIdx: number, currentDist: number): { newBuf: number[], newIdx: number, smoothed: number } {
  const newBuf = [...distBuf];
  newBuf[distIdx] = currentDist;
  const newIdx = (distIdx + 1) % SMOOTH_N;
  const sum = newBuf.reduce((a, b) => a + b, 0);
  const smoothed = sum / SMOOTH_N;
  return { newBuf, newIdx, smoothed };
}
