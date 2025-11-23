
import React from 'react';

interface FormulaDisplayProps {
  orbitA?: number;
  orbitB?: number;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ orbitA = 90, orbitB = 80 }) => {
  const valA = (orbitA / 100).toFixed(2).replace(/^0+/, ''); // .90
  const valB = (orbitB / 100).toFixed(2).replace(/^0+/, ''); // .80
  
  return (
    <div className="pointer-events-none mb-2 text-right min-w-[200px]">
      <div className="bg-black/0 backdrop-blur-none p-2 inline-block rounded w-full">
        <div className="text-[10px] font-mono leading-tight tracking-tight text-white flex justify-end gap-1">
          <span>z(θ) = </span>
          <span className="inline-block">e<sup>θi</sup></span>
          <span> + </span>
          <span className="inline-block">{valA}e<sup>(-πθ)i</sup></span>
          <span> + </span>
          <span className="inline-block">{valB}e<sup>(2πθ)i</sup></span>
        </div>
      </div>
    </div>
  );
};
