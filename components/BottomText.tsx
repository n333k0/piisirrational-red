
import React from 'react';
import { MANIFESTO_TEXT_ES } from '../constants';

interface BottomTextProps {
  theta: number;
}

export const BottomText: React.FC<BottomTextProps> = ({ theta }) => {
  // Start revealing after theta passes this threshold
  // Delayed to 40 to ensure horizontal text has time to play out "IT MISSES"
  const startTheta = 40; 
  
  // Pixel movement per theta unit
  // Slowed down to 30 to force the user to "scroll to infinity" to read it
  const scrollSpeed = 30; 

  // If we haven't scrolled enough, don't render to save resources
  if (theta < startTheta - 5) return null;

  // Calculate position: starts below viewport, moves up as theta increases
  // We add window.innerHeight to push it initially off-screen
  const translateY = Math.max(-10000, window.innerHeight - (theta - startTheta) * scrollSpeed);
  
  // Basic opacity fade in when it first starts moving up
  const opacity = Math.min(1, Math.max(0, (theta - startTheta) * 0.5));

  return (
    <div 
      className="fixed top-0 left-0 w-full pointer-events-none z-10 px-6 md:px-8 pb-32 mix-blend-exclusion"
      style={{ 
        transform: `translateY(${translateY}px)`,
        opacity: opacity
      }}
    >
      <div className="w-full">
         {/* Main Text */}
         <h1 className="font-grotesk text-3xl md:text-5xl lg:text-7xl leading-[0.9] font-bold text-white uppercase text-justify tracking-tighter whitespace-pre-wrap">
           {MANIFESTO_TEXT_ES}
         </h1>

         {/* Footer decoration */}
         <div className="w-full flex justify-between items-center mt-12 opacity-50 font-mono text-sm border-t border-white pt-2">
           <span>/// END OF FILE</span>
           <span>π_RAVE_MANIFESTO.TXT</span>
         </div>
      </div>
    </div>
  );
};
