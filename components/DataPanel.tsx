
import React from 'react';
import { Point } from '../types';

interface DataPanelProps {
  theta: number;
  point: Point;
}

export const DataPanel: React.FC<DataPanelProps> = ({ theta, point }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none text-right">
      <div className="bg-black/0 backdrop-blur-none p-0 min-w-[200px]">
        
        {/* Metrics */}
        <div className="flex flex-col gap-1 mb-2">
            <div className="flex justify-between items-baseline font-mono text-xs text-white">
                <span className="opacity-40 text-[10px]">θ</span>
                <span>{theta.toFixed(4)}</span>
            </div>
            
            <div className="flex justify-between items-baseline font-mono text-xs text-white">
                <span className="opacity-40 text-[10px]">Re</span>
                <span>{point.x.toFixed(4)}</span>
            </div>
            
            <div className="flex justify-between items-baseline font-mono text-xs text-white">
                <span className="opacity-40 text-[10px]">Im</span>
                <span>{point.y.toFixed(4)}</span>
            </div>
        </div>

        {/* Progress Bar */}
        {/* Track (Softer line in back) */}
        <div className="w-full h-[1px] bg-white/20 relative mt-1">
             {/* Fill (Bright line) */}
             <div 
               className="absolute top-0 left-0 h-full bg-white transition-all duration-75 shadow-[0_0_4px_rgba(255,32,32,0.6)]" 
               style={{ width: `${(Math.abs(Math.sin(theta)) * 100).toFixed(0)}%` }}
             />
        </div>

      </div>
    </div>
  );
};
