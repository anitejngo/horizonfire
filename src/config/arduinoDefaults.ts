// Default Arduino code and settings for Horizonfire

import { DEFAULT_NUM_LEDS } from './constants';

function getDefaultCode(numLeds: number): string {
  return `#include <Wire.h>
#include <Adafruit_VL53L1X.h>
#include <FastLED.h>

#define LED_PIN     6
#define NUM_LEDS    ${numLeds}
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB
#define BRIGHTNESS  200

CRGB leds[NUM_LEDS];

const uint16_t DIST_OFF  = 1500;
const uint16_t DIST_FULL = 3000;

Adafruit_VL53L1X vl53;
const uint8_t SMOOTH_N = 6;
uint16_t distBuf[SMOOTH_N];
uint8_t distIdx = 0;

uint16_t getSmoothedDistance() {
  VL53L1X_RangingMeasurementData_t m;
  vl53.rangingTest(&m, false);
  uint16_t d;

  if (m.RangeStatus == 0) d = m.RangeMilliMeter;
  else d = distBuf[(distIdx + SMOOTH_N - 1) % SMOOTH_N];

  distBuf[distIdx] = d;
  distIdx = (distIdx + 1) % SMOOTH_N;

  uint32_t sum = 0;
  for (uint8_t i=0;i<SMOOTH_N;i++) sum += distBuf[i];
  return sum / SMOOTH_N;
}

// fire code (Electriangle)
#define COOLING  55
#define SPARKING 120
uint8_t heat[NUM_LEDS];

void Fire2012() {
  for (int i = 0; i < NUM_LEDS; i++)
    heat[i] = qsub8(heat[i], random8(0, ((COOLING * 10) / NUM_LEDS) + 2));

  for (int k = NUM_LEDS - 1; k >= 2; k--)
    heat[k] = (heat[k - 1] + heat[k - 2] + heat[k - 2]) / 3;

  if (random8() < SPARKING) {
    int y = random16(7);
    heat[y] = qadd8(heat[y], random8(160, 255));
  }

  for (int j = 0; j < NUM_LEDS; j++) {
    uint8_t ci = scale8(heat[j], 240);
    leds[j] = ColorFromPalette(HeatColors_p, ci);
  }
}

void setup() {
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.show();

  Wire.begin();
  vl53.begin();
  vl53.setDistanceMode(VL53L1X::Long);
  vl53.setMeasurementTimingBudget(20000);
  vl53.startContinuous(50);

  uint16_t init = DIST_FULL;
  for (uint8_t i = 0; i < SMOOTH_N; i++) distBuf[i] = init;
}

void loop() {
  uint16_t dist = getSmoothedDistance();

  uint8_t intensity;
  if (dist <= DIST_OFF) intensity = 0;
  else if (dist >= DIST_FULL) intensity = 255;
  else intensity = map(dist, DIST_OFF, DIST_FULL, 0, 255);

  uint8_t globalB = map(intensity, 0, 255, 0, BRIGHTNESS);
  FastLED.setBrightness(globalB);

  if (intensity == 0) {
    for (int i=0;i<NUM_LEDS;i++) leds[i].fadeToBlackBy(200);
    FastLED.show();
    delay(40);
    return;
  }

  Fire2012();
  FastLED.show();
  delay(25);
}`;
}

export const DEFAULT_CODE = getDefaultCode(DEFAULT_NUM_LEDS);
