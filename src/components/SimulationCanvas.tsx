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
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  leds,
  distance,
  onDistanceChange,
  isRunning,
  onToggle,
  onParse,
}) => {
  return (
    <div style={{ width: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <DistanceSlider distance={distance} onChange={onDistanceChange} />
      <Controls isRunning={isRunning} onToggle={onToggle} onParse={onParse} />
      <LEDRenderer leds={[...leds].reverse()} />
    </div>
  );
};

export default SimulationCanvas;
