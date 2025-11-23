
import React, { useState, useEffect, useRef } from 'react';
import { DataPanel } from './components/DataPanel';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { Manifesto } from './components/Manifesto';
import { BottomText } from './components/BottomText';
import { InfoPanel } from './components/InfoPanel';
import { NoiseBackground } from './components/NoiseBackground';
import { Point } from './types';

export default function App() {
  // Math State
  const [theta, setTheta] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [orbitA, setOrbitA] = useState(0);
  const [orbitB, setOrbitB] = useState(100);
  
  // UI State
  const [isInteracting, setIsInteracting] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // Auto-scroll state

  // Physics Refs for Momentum/Inertia
  const velocityRef = useRef(0);
  const thetaRef = useRef(0);
  const isPlayingRef = useRef(false); // Ref for animation loop
  const lastTouchYRef = useRef(0);
  const requestRef = useRef<number | undefined>(undefined);
  const interactionTimerRef = useRef<number | undefined>(undefined);

  // Sync state with ref for animation loop
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    // If we stop playing, kill any residual velocity so it stops instantly/smoothly
    if (!isPlaying) {
        velocityRef.current = 0;
    }
  }, [isPlaying]);

  // Physics Loop (The "DJ Spin" Effect)
  const updatePhysics = () => {
    if (isPlayingRef.current) {
        // AUTO PLAY MODE: Constant speed
        // Adjust 0.01 to change speed
        thetaRef.current += 0.01; 
        setTheta(thetaRef.current);
    } else {
        // MANUAL MODE: Inertia
        // Apply velocity to position
        if (Math.abs(velocityRef.current) > 0.00001) {
            thetaRef.current += velocityRef.current;
            if (thetaRef.current < 0) {
                thetaRef.current = 0;
                velocityRef.current = 0;
            }
            
            // Apply Friction (Decay)
            velocityRef.current *= 0.95; 
            
            // Update React State for rendering
            setTheta(thetaRef.current);
        }
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Event Handlers
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsInteracting(true);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = window.setTimeout(() => setIsInteracting(false), 1000);
    };

    const handleWheel = (e: WheelEvent) => {
      // Allow scroll in InfoPanel if open
      if (isInfoOpen) return;
      
      e.preventDefault(); // STOP browser scroll
      handleUserInteraction();

      // Disable auto-play on manual interaction
      if (isPlayingRef.current) setIsPlaying(false);
      
      // Add to velocity instead of setting position directly
      const delta = e.deltaY * 0.0005; 
      velocityRef.current += delta;
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Allow slider interaction and InfoPanel interaction
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.closest('.overflow-y-auto')) return;

      lastTouchYRef.current = e.touches[0].clientY;
      // Stop current momentum on touch down for better control
      velocityRef.current = 0;
      
      handleUserInteraction();
      
      // Disable auto-play on manual interaction
      if (isPlayingRef.current) setIsPlaying(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Allow slider interaction and InfoPanel interaction
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.closest('.overflow-y-auto')) return;

      e.preventDefault(); // CRITICAL: Stops "pulling" / rubber-banding
      handleUserInteraction();

      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - touchY;
      lastTouchYRef.current = touchY;

      // Add to velocity based on finger movement
      velocityRef.current += deltaY * 0.002;
    };

    // Add listeners to window/body to capture everything
    const target = window;
    
    // { passive: false } is required to use preventDefault()
    target.addEventListener('wheel', handleWheel, { passive: false });
    target.addEventListener('touchstart', handleTouchStart, { passive: false });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
    // Add a general click listener for desktop users who might just click without dragging
    target.addEventListener('click', handleUserInteraction);

    return () => {
      target.removeEventListener('wheel', handleWheel);
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('click', handleUserInteraction);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
    };
  }, [isInfoOpen]);

  const handleUpdate = (t: number, point: Point) => {
    setCurrentPoint(point);
  };

  return (
    // Fixed container
    <div className="fixed inset-0 w-full h-[100dvh] bg-black text-white font-mono overflow-hidden select-none touch-none">
        
        {/* GLOBAL NOISE OVERLAY - Top Z-Index for grain on everything */}
        <div className="fixed inset-0 z-[100] pointer-events-none mix-blend-overlay opacity-40">
             <NoiseBackground />
        </div>

        {/* CENTERED VIDEO BACKGROUND */}
        {/* Placed behind Manifesto but in front of Canvas background */}
        <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none opacity-50">
             {/* Filter to turn B&W video into Red: High Contrast, Low Brightness, Red Tint via Sepia/Hue */}
             <video 
                className="w-[300px] h-auto object-cover mix-blend-screen"
                style={{ filter: 'grayscale(100%) brightness(0.6) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(1.2)' }}
                autoPlay 
                loop 
                muted 
                playsInline
                src="https://media.istockphoto.com/id/1445196518/video/glitch-noise-static-television-vfx-pack.mp4?s=mp4-640x640-is&k=20&c=MPv_5ZgW_eQZ363f8u64i4H64oW54b64J363f8u64i4="
             />
        </div>

        {/* Manifesto Background Layer */}
        <Manifesto theta={theta} />

        {/* Scroll-revealed Bottom Text */}
        <BottomText theta={theta} />
        
        {/* Slide-out Info Panel containing Controls */}
        <InfoPanel 
            isOpen={isInfoOpen} 
            zoom={zoom}
            onZoomChange={setZoom}
            orbitA={orbitA}
            orbitB={orbitB}
            onChangeA={setOrbitA}
            onChangeB={setOrbitB}
        />

        {/* --- UI OVERLAYS (STICKY CORNERS) --- */}

        {/* Top Left Symbol */}
        <div className="absolute top-6 left-6 z-50 pointer-events-none mix-blend-difference">
            <div className="bg-black/0 backdrop-blur-none p-2 inline-block rounded">
                <div className="text-sm font-mono leading-tight tracking-tighter text-gray-200 opacity-80">
                    π
                </div>
            </div>
        </div>

        {/* PLAY / STOP BUTTON (Left Center) */}
        <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-1/2 -translate-y-1/2 left-6 z-50 mix-blend-difference cursor-pointer focus:outline-none group p-2"
        >
            <div className="flex items-center justify-center w-4 h-4">
                {isPlaying ? (
                    /* STOP SQUARE - Small */
                    <div className="w-[6px] h-[6px] bg-white opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    /* PLAY TRIANGLE - Small */
                    <div className="w-0 h-0 
                        border-t-[4px] border-t-transparent
                        border-l-[7px] border-l-white
                        border-b-[4px] border-b-transparent
                        opacity-80 group-hover:opacity-100 transition-opacity ml-0.5" 
                    />
                )}
            </div>
        </button>

        {/* TOGGLE BUTTON (Tiny X) */}
        {/* Adjusted to top-[25px] (1px lower than top-6 which is 24px) */}
        <button 
          onClick={() => setIsInfoOpen(!isInfoOpen)}
          className="absolute top-[25px] right-6 z-[60] w-8 h-8 flex items-center justify-center group focus:outline-none mix-blend-difference cursor-pointer pointer-events-auto"
        >
            <div className="relative w-2 h-2 flex items-center justify-center">
                {/* Small Dot/Square when closed */}
                <div className={`absolute w-1.5 h-1.5 bg-white rounded-[1px] transition-all duration-300 ${isInfoOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />

                {/* Tiny X when open - 8px wide */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isInfoOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                     <span className="absolute w-[8px] h-[1px] bg-white rotate-45" />
                     <span className="absolute w-[8px] h-[1px] bg-white -rotate-45" />
                </div>
            </div>
        </button>

        {/* Bottom Right Data Panel */}
        <DataPanel theta={theta} point={currentPoint} />
        
        {/* Bottom Left Signature */}
        {/* Lowered to bottom-4 (was bottom-8) */}
        <div className="absolute bottom-4 left-8 z-50 text-gray-500 pointer-events-none mix-blend-difference">
            <div className="font-mono text-xs tracking-widest opacity-70">
                ▬▬ι═══════ﺤ
            </div>
            <div className="font-mono text-[10px] mt-1 tracking-widest uppercase opacity-50">
                ⌖ x neeko
            </div>
        </div>

        {/* Interaction Prompt */}
        <div 
            className={`
                fixed z-40 transition-opacity duration-500 pointer-events-none 
                ${theta > 0.1 || isInteracting || isPlaying ? 'opacity-0' : 'opacity-100'}
                
                /* Mobile: Bottom Right, above Data Panel */
                bottom-64 right-6 text-right w-[200px]

                /* Desktop: Center Bottom */
                md:bottom-10 md:left-1/2 md:right-auto md:-translate-x-1/2 md:text-center md:w-auto
            `}
        >
            <div className="animate-pulse">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600">Scroll to Reveal</span>
            </div>
        </div>

        {/* Main Visualization */}
        <main className="w-full h-full relative z-0">
            <CanvasVisualizer 
                targetTheta={theta} 
                zoom={zoom}
                radiusA={orbitA / 100}
                radiusB={orbitB / 100}
                onUpdate={handleUpdate}
            />
        </main>
    </div>
  );
}
