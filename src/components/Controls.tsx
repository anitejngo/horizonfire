import React from 'react';

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onParse: () => void;
}

const Controls: React.FC<ControlsProps> = ({ isRunning, onToggle, onParse }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button onClick={onParse} style={{ padding: '10px' }}>Parse Code</button>
      <button onClick={onToggle} style={{ padding: '10px' }}>
        {isRunning ? 'Pause' : 'Play'} Animation
      </button>
    </div>
  );
};

export default Controls;
