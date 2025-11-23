
import React, { useRef, useEffect, useState } from 'react';
import { RADIUS_1, FREQ_1, FREQ_2, FREQ_3 } from '../constants';
import { Point } from '../types';

interface CanvasVisualizerProps {
  targetTheta: number;
  zoom: number;
  radiusA: number; // For the 2nd term (default 0.9)
  radiusB: number; // For the 3rd term (default 0.8)
  onUpdate: (theta: number, point: Point) => void;
}

export const CanvasVisualizer: React.FC<CanvasVisualizerProps> = ({ targetTheta, zoom, radiusA, radiusB, onUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth lerp value for display
  const [smoothTheta, setSmoothTheta] = useState(0);

  // Helper to calculate complex number position at a given theta
  const calculateZ = (t: number) => {
    // 1. First term: e^(θi) - Fixed Radius 1.0
    const r1 = RADIUS_1; 
    const angle1 = FREQ_1 * t;
    const x1 = r1 * Math.cos(angle1);
    const y1 = r1 * Math.sin(angle1);

    // 2. Second term: radiusA * e^(-πθi)
    const r2 = radiusA;
    const angle2 = FREQ_2 * t;
    const x2 = r2 * Math.cos(angle2);
    const y2 = r2 * Math.sin(angle2);

    // 3. Third term: radiusB * e^(2πθi)
    const r3 = radiusB;
    const angle3 = FREQ_3 * t;
    const x3 = r3 * Math.cos(angle3);
    const y3 = r3 * Math.sin(angle3);

    return {
      x: x1 + x2 + x3,
      y: y1 + y2 + y3,
      vectors: [
        { start: {x: 0, y: 0}, end: {x: x1, y: y1}, length: r1 },
        { start: {x: x1, y: y1}, end: {x: x1 + x2, y: y1 + y2}, length: r2 },
        { start: {x: x1 + x2, y: y1 + y2}, end: {x: x1 + x2 + x3, y: y1 + y2 + y3}, length: r3 }
      ]
    };
  };

  // Animation Loop for Smooth Lerp
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      setSmoothTheta(prev => {
        const diff = targetTheta - prev;
        // If very close, snap to target
        if (Math.abs(diff) < 0.0001) return targetTheta;
        // Lerp factor
        return prev + diff * 0.15; 
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetTheta]);


  // Drawing Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
    }

    const width = rect?.width || 800;
    const height = rect?.height || 600;
    const cx = width / 2;
    const cy = height / 2;
    
    // Scale calc: Max extent is sum of radii + margin
    const maxExtent = RADIUS_1 + 3.33 + 3.33; // Max possible with slider at 333
    const baseScale = Math.min(width, height) / (4.5); // Fixed visual scale relative to window
    const scale = baseScale * zoom;

    // CLEAR
    ctx.clearRect(0, 0, width, height);
    
    // GRID - Deep Red Grid
    const gridOpacity = Math.max(0.01, 0.05 - (zoom / 5000));
    ctx.strokeStyle = `rgba(100, 0, 0, ${gridOpacity * 20})`; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, 0); ctx.lineTo(cx, height);
    ctx.moveTo(0, cy); ctx.lineTo(width, cy);
    ctx.stroke();

    // --- DRAW PATH ---
    // Matrix Red Path
    ctx.strokeStyle = '#FF2020';
    ctx.lineWidth = zoom > 5000 ? 0.1 : (zoom > 50 ? 0.25 : 0.5);
    ctx.beginPath();
    
    // Step size optimization
    const step = Math.max(0.000005, 0.05 / Math.max(1, Math.sqrt(zoom)));
    
    const startZ = calculateZ(0);
    ctx.moveTo(cx + startZ.x * scale, cy - startZ.y * scale);
    
    for (let t = 0; t <= smoothTheta; t += step) {
      const z = calculateZ(t);
      ctx.lineTo(cx + z.x * scale, cy - z.y * scale);
    }
    
    const currentZState = calculateZ(smoothTheta);
    ctx.lineTo(cx + currentZState.x * scale, cy - currentZState.y * scale);
    ctx.stroke();

    // --- DRAW VECTORS & ORBITS ---
    if (zoom < 50000) {
        const { vectors, x: lastX, y: lastY } = currentZState;
        
        // Draw the vectors and their orbital paths
        vectors.forEach((v, i) => {
            const startX = cx + v.start.x * scale;
            const startY = cy - v.start.y * scale;
            const endX = cx + v.end.x * scale;
            const endY = cy - v.end.y * scale;

            // 1. Draw the "Orbit" circle for the NEXT vector
            // Dark Red faint orbit
            ctx.strokeStyle = 'rgba(120, 0, 0, 0.5)'; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            // Draw the full circle that this vector traces
            ctx.arc(startX, startY, v.length * scale, 0, Math.PI * 2);
            ctx.stroke();

            // 2. Draw the Vector itself
            const isLast = i === vectors.length - 1;
            // Last vector bright red, others dark red
            ctx.strokeStyle = isLast ? '#FF2020' : '#880000'; 
            ctx.lineWidth = 1 / Math.max(1, Math.log10(zoom));

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            // 3. Draw Joint
            ctx.fillStyle = '#050505'; // Black Fill
            ctx.strokeStyle = isLast ? '#FF2020' : '#AA0000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const jointSize = Math.max(1, 3 / Math.pow(zoom, 0.3));
            ctx.arc(startX, startY, jointSize, 0, Math.PI * 2); 
            ctx.fill();
            ctx.stroke();
        });

        // Draw End Point (Pen)
        const finalScreenX = cx + lastX * scale;
        const finalScreenY = cy - lastY * scale;

        ctx.fillStyle = '#FF2020';
        ctx.beginPath();
        const dotSize = Math.max(1.5, 4 / Math.pow(zoom, 0.3));
        ctx.arc(finalScreenX, finalScreenY, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }

    // Notify parent
    onUpdate(smoothTheta, { x: currentZState.x, y: currentZState.y });

  }, [smoothTheta, zoom, radiusA, radiusB]);

  return (
    <div ref={containerRef} className="w-full h-full relative cursor-crosshair">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
