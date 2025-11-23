
import React from 'react';

interface CircleControlProps {
  diameter: number;
  onChange: (val: number) => void;
}

export const CircleControl: React.FC<CircleControlProps> = ({ diameter, onChange }) => {
  return (
    <div className="pointer-events-auto mix-blend-difference text-right mt-2">
      <div className="bg-black/0 backdrop-blur-none p-2 inline-block min-w-[200px] rounded">
        <div className="flex justify-end items-center mb-2 gap-4 opacity-80">
            <span className="font-mono text-[10px] text-gray-400">DIAMETER</span>
            <span className="font-mono text-[10px] text-white bg-gray-900/0 px-2 py-0.5 rounded">
                {diameter.toFixed(0)}
            </span>
        </div>
        <div className="relative flex items-center h-4">
            <input
            type="range"
            min="0"
            max="333"
            step="1"
            value={diameter}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-[1px] bg-gray-800 appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-0 [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-webkit-slider-thumb]:rounded-none"
            />
        </div>
      </div>
    </div>
  );
};
