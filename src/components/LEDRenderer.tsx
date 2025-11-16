import React from 'react';

export interface Led {
  index: number;
  color: { r: number; g: number; b: number };
}

interface LEDRendererProps {
  leds: Led[];
}

const LEDRenderer: React.FC<LEDRendererProps> = ({ leds }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
      {leds.map((led) => (
        <div
          key={led.index}
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: `rgb(${led.color.r}, ${led.color.g}, ${led.color.b})`,
            border: '1px solid #ccc',
          }}
        />
      ))}
    </div>
  );
};

export default LEDRenderer;
