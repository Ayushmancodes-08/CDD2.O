'use client';
import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export function AnimatedGridPattern({
  width = 40, height = 40, x = -1, y = -1, strokeDasharray = 0,
  numSquares = 50, className, maxOpacity = 0.5, duration = 4, repeatDelay = 0.5,
}) {
  const id = useId();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [squares, setSquares] = useState(() => generateSquares(numSquares, { width: 800, height: 600 }));

  function getPos(dims) {
    return [
      Math.floor((Math.random() * dims.width) / width),
      Math.floor((Math.random() * dims.height) / height),
    ];
  }

  function generateSquares(count, dims) {
    return Array.from({ length: count }, (_, i) => ({ id: i, pos: getPos(dims) }));
  }

  const updateSquarePosition = (id) => {
    setSquares((curr) => curr.map((sq) => sq.id === id ? { ...sq, pos: getPos(dimensions) } : sq));
  };

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      setSquares(generateSquares(numSquares, dimensions));
    }
  }, [dimensions, numSquares]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <svg ref={containerRef} aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-brand-500/20 stroke-brand-500/20 ${className || ''}`}>
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" strokeDasharray={strokeDasharray} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [sx, sy], id: sqId }, index) => (
          <motion.rect key={`${sx}-${sy}-${index}`}
            initial={{ opacity: 0 }} animate={{ opacity: maxOpacity }}
            transition={{ duration, repeat: 1, delay: index * 0.1, repeatType: 'reverse' }}
            onAnimationComplete={() => updateSquarePosition(sqId)}
            width={width - 1} height={height - 1} x={sx * width + 1} y={sy * height + 1}
            fill="currentColor" strokeWidth="0" />
        ))}
      </svg>
    </svg>
  );
}
