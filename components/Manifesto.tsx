
import React from 'react';

interface ManifestoProps {
  theta: number;
}

export const Manifesto: React.FC<ManifestoProps> = ({ theta }) => {
  // Updated text starting with "RAVE ME HARD" and using π as separator
  const text = "RAVE ME HARD π RAVE ME LONG π JUST WHEN IT SEEMS IT WILL ALIGN π IT MISSES BY A WHISPER π THE IRRATIONALITY OF PI IS WONDERFUL π A FRACTURE IN THE PERFECT CIRCLE π THE TECHNO SONG OF ETERNITY π NEVER TOUCHING π ALWAYS REACHING π 3.14159 π CHAOS DANCING IN ORDER π INFINITE SCROLL π INFINITE DESIRE π REPEAT π ALIGN π MISS π REPEAT π ";
  
  // Speed multiplier for the text scroll relative to theta
  // Increased to 350 so it scrolls past the intro phrases before the vertical text triggers
  const speed = 350; 
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-[-1] flex flex-col justify-center opacity-20 mix-blend-screen">
      {/* Single centered scrolling line */}
      <div 
        className="whitespace-nowrap text-[12vh] font-black text-gray-800 leading-none tracking-tighter"
        style={{ transform: `translateX(-${theta * speed}px)` }}
      >
        {text.repeat(50)}
      </div>
    </div>
  );
};
