
import React, { useState } from 'react';

interface ParameterControlsProps {
  orbitA: number;
  orbitB: number;
  onChangeA: (val: number) => void;
  onChangeB: (val: number) => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({ orbitA, orbitB, onChangeA, onChangeB }) => {
  const [activeControl, setActiveControl] = useState<'A' | 'B' | null>(null);

  return (
    <div className="pointer-events-auto mix-blend-difference text-right flex flex-col gap-0">
      {/* ORBIT A CONTROL */}
      <div className={`bg-black/0 backdrop-blur-none px-2 py-0 inline-block min-w-[200px] rounded transition-all duration-300 ${activeControl === 'A' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] scale-[1.02]' : ''}`}>
        <div className="flex justify-end items-center mb-1 gap-4 opacity-80">
            <span className={`font-mono text-[10px] transition-colors duration-300 ${activeControl === 'A' ? 'text-white' : 'text-gray-400'}`}>ORBIT A (π)</span>
            <span className="font-mono text-[10px] text-white bg-gray-900/0 px-2 py-0.5 rounded">
                {(orbitA / 100).toFixed(2)}
            </span>
        </div>
        <div className="relative flex items-center h-12 w-full">
            {/* Visual Track */}
            <div className={`absolute w-full h-[1px] top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none transition-colors duration-300 ${activeControl === 'A' ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-[#444444]'}`}></div>
            {/* Input */}
            <input
            type="range"
            min="0"
            max="333"
            step="1"
            value={orbitA}
            onChange={(e) => onChangeA(parseFloat(e.target.value))}
            onMouseDown={() => setActiveControl('A')}
            onMouseUp={() => setActiveControl(null)}
            onTouchStart={() => setActiveControl('A')}
            onTouchEnd={() => setActiveControl(null)}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none z-10
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-2 
              [&::-webkit-slider-thumb]:h-2 
              [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:border-0 
              [&::-webkit-slider-thumb]:rounded-none
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-150
              active:[&::-webkit-slider-thumb]:scale-150
              [&::-moz-range-thumb]:w-2 
              [&::-moz-range-thumb]:h-2 
              [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:border-0
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-moz-range-track]:bg-transparent"
            />
        </div>
      </div>

      {/* ORBIT B CONTROL */}
      <div className={`bg-black/0 backdrop-blur-none px-2 py-0 inline-block min-w-[200px] rounded transition-all duration-300 ${activeControl === 'B' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] scale-[1.02]' : ''}`}>
        <div className="flex justify-end items-center mb-1 gap-4 opacity-80">
            <span className={`font-mono text-[10px] transition-colors duration-300 ${activeControl === 'B' ? 'text-white' : 'text-gray-400'}`}>ORBIT B (2π)</span>
            <span className="font-mono text-[10px] text-white bg-gray-900/0 px-2 py-0.5 rounded">
                {(orbitB / 100).toFixed(2)}
            </span>
        </div>
        <div className="relative flex items-center h-12 w-full">
             {/* Visual Track */}
             <div className={`absolute w-full h-[1px] top-1/2 -translate-y-1/2 left-0 right-0 pointer-events-none transition-colors duration-300 ${activeControl === 'B' ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)]' : 'bg-[#444444]'}`}></div>
             {/* Input */}
            <input
            type="range"
            min="0"
            max="333"
            step="1"
            value={orbitB}
            onChange={(e) => onChangeB(parseFloat(e.target.value))}
            onMouseDown={() => setActiveControl('B')}
            onMouseUp={() => setActiveControl(null)}
            onTouchStart={() => setActiveControl('B')}
            onTouchEnd={() => setActiveControl(null)}
            className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer focus:outline-none z-10
              [&::-webkit-slider-thumb]:appearance-none 
              [&::-webkit-slider-thumb]:w-2 
              [&::-webkit-slider-thumb]:h-2 
              [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:border-0 
              [&::-webkit-slider-thumb]:rounded-none
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:duration-150
              active:[&::-webkit-slider-thumb]:scale-150
              [&::-moz-range-thumb]:w-2 
              [&::-moz-range-thumb]:h-2 
              [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:border-0
              [&::-webkit-slider-runnable-track]:bg-transparent
              [&::-moz-range-track]:bg-transparent"
            />
        </div>
      </div>
    </div>
  );
};
