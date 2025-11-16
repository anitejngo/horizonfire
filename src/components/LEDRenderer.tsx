import React from 'react';

export interface Led {
  index: number;
  color: { r: number; g: number; b: number };
}

interface LEDRendererProps {
  leds: Led[];
  numLeds: number;
}

const LEDRenderer: React.FC<LEDRendererProps> = ({ leds, numLeds }) => {
  const ledHeight = 25;
  const gap = 5;
  const padding = 30;
  const totalHeight = numLeds * ledHeight + (numLeds - 1) * gap + padding;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: `${gap}px`,
      backgroundColor: 'black',
      padding: `${padding / 2}px`,
      borderRadius: '10px',
      width: '100%',
      height: `${totalHeight}px`,
      overflow: 'hidden',
    }}>
      {leds.map((led) => {
        const isOff = led.color.r === 0 && led.color.g === 0 && led.color.b === 0;
        return (
          <div
            key={led.index}
            style={{
              width: '25px',
              height: '25px',
              backgroundColor: `rgb(${led.color.r}, ${led.color.g}, ${led.color.b})`,
              borderRadius: '50%',
              border: isOff ? '1px solid #222' : 'none',
              boxShadow: isOff ? 'none' : `0 0 8px rgba(${led.color.r}, ${led.color.g}, ${led.color.b}, 0.6)`,
              opacity: isOff ? 0.3 : 1,
            }}
          />
        );
      })}
    </div>
  );
};

export default LEDRenderer;
