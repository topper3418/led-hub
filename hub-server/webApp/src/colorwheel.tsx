import React, { useRef, useEffect } from 'react';


export interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorWheelProps {
    color: RGB;
    onChange: (color: RGB) => void;
  }

const ColorWheel: React.FC<ColorWheelProps> = ({color, onChange: setColor }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  console.warn('need to use the color value. in the future we should have a cursor on the wheel representing last click. ', color);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      drawColorWheel(canvas);
    }
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const { data } = ctx.getImageData(x, y, 1, 1);
        const [r, g, b] = data;
        setColor({ r, g, b });
      }
    }
  };

  return (
    <canvas
    ref={canvasRef}
    width={300}
    height={300}
    onClick={handleClick}
    style={{ backgroundColor: 'transparent' }}
    />
  );
};

function drawColorWheel(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const radius = canvas.width / 2;
  const toRadians = (deg: number) => deg * (Math.PI / 180);

  for (let angle = 0; angle < 360; angle += 1) {
    const startAngle = toRadians(angle);
    const endAngle = toRadians(angle + 1);
    ctx.beginPath();
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
    ctx.fill();
  }
}

export default ColorWheel;
