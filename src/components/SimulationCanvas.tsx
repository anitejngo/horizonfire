import React from 'react';
import LEDRenderer, { Led } from './LEDRenderer';
import Controls from './Controls';
import DistanceSlider from './DistanceSlider';

interface SimulationCanvasProps {
  leds: Led[];
  distance: number;
  onDistanceChange: (distance: number) => void;
  isRunning: boolean;
  onToggle: () => void;
  onParse: () => void;
  numLeds: number;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  leds,
  distance,
  onDistanceChange,
  isRunning,
  onToggle,
  onParse,
  numLeds,
}) => {
  return (
    <div style={{
      width: '20%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      height: '100vh'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <DistanceSlider distance={distance} onChange={onDistanceChange} />
      </div>
      <Controls isRunning={isRunning} onToggle={onToggle} onParse={onParse} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '80vh', overflow: 'auto' }}>
        <LEDRenderer leds={[...leds].reverse()} numLeds={numLeds} />
      </div>
    </div>
  );
};

export default SimulationCanvas;
