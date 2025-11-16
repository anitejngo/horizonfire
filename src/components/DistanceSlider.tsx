import React from 'react';
import { DISTANCE_MIN, DISTANCE_MAX } from '../config/constants';

interface DistanceSliderProps {
  distance: number;
  onChange: (distance: number) => void;
}

const DistanceSlider: React.FC<DistanceSliderProps> = ({ distance, onChange }) => {
  return (
    <div>
      <label>
        Distance (mm):{' '}
        <input
          type="range"
          min={DISTANCE_MIN}
          max={DISTANCE_MAX}
          value={distance}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <br />
        {distance}
      </label>
    </div>
  );
};

export default DistanceSlider;
