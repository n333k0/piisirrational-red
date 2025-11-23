
import React, { useState, useEffect, useRef } from 'react';
import { DataPanel } from './components/DataPanel';
import { CanvasVisualizer } from './components/CanvasVisualizer';
import { Manifesto } from './components/Manifesto';
import { BottomText } from './components/BottomText';
import { InfoPanel } from './components/InfoPanel';
import { NoiseBackground } from './components/NoiseBackground';
import { Point } from './types';

export default function App() {
  // Math State (Display Values)
  const [theta, setTheta] = useState(0);
  const [currentPoint, setCurrentPoint] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [orbitA, setOrbitA] = useState(0);
  const [orbitB, setOrbitB] = useState(100);
  
  // Animation Targets & Refs (Physics Source of Truth)
  const zoomRef = useRef(1);
  const targetZoomRef = useRef(1);
  
  const orbitARef = useRef(0);
  const targetOrbitARef = useRef(0);
  
  const orbitBRef = useRef(100);
  const targetOrbitBRef = useRef(100);
  
  // UI State
  const [isInteracting, setIsInteracting] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); // Default to TRUE (Play Mode)

  // Audio State (Web Audio API)
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStartedRef = useRef(false);

  // Physics Refs for Momentum/Inertia
  const velocityRef = useRef(0);
  const thetaRef = useRef(0);
  const isPlayingRef = useRef(true); // Default to TRUE
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

  // --- GENERATIVE AUDIO ENGINE ---
  const initAudio = () => {
    if (audioContextRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    // Master Volume
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0; // Start silent
    masterGain.connect(ctx.destination);

    // Oscillator 1 - Sub Bass
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = 55; // A1
    
    // Oscillator 2 - Mid Bass (Audible on phones)
    const osc2 = ctx.createOscillator();
    osc2.type = 'square';
    osc2.frequency.value = 110; // A2
    
    // Mix Oscillators
    const osc1Gain = ctx.createGain();
    osc1Gain.gain.value = 0.6;
    
    const osc2Gain = ctx.createGain();
    osc2Gain.gain.value = 0.15; // Lower volume for square wave

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600; // Open up to hear more grit
    filter.Q.value = 1;

    // LFO for Filter Movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Slow breathe
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200; 

    // Connections
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    
    filter.connect(masterGain);

    // Start
    osc1.start();
    osc2.start();
    lfo.start();

    // Fade in volume
    masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 2);
  };

  // Physics Loop (The "DJ Spin" Effect & Parameter Animation)
  const updatePhysics = () => {
    // 1. THETA PHYSICS
    if (isPlayingRef.current) {
        // AUTO PLAY MODE: Constant speed
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

    // 2. PARAMETER ANIMATION (Lerp to Targets)
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    // Smoother easing for the "P" visualization animation (0.05 is slower than 0.1)
    const ease = 0.05; 

    // Zoom Animation
    if (Math.abs(targetZoomRef.current - zoomRef.current) > 0.01) {
        zoomRef.current = lerp(zoomRef.current, targetZoomRef.current, ease);
        setZoom(zoomRef.current);
    } else if (zoomRef.current !== targetZoomRef.current) {
        zoomRef.current = targetZoomRef.current;
        setZoom(zoomRef.current);
    }

    // Orbit A Animation
    if (Math.abs(targetOrbitARef.current - orbitARef.current) > 0.1) {
        orbitARef.current = lerp(orbitARef.current, targetOrbitARef.current, ease);
        setOrbitA(orbitARef.current);
    } else if (orbitARef.current !== targetOrbitARef.current) {
        orbitARef.current = targetOrbitARef.current;
        setOrbitA(orbitARef.current);
    }

    // Orbit B Animation
    if (Math.abs(targetOrbitBRef.current - orbitBRef.current) > 0.1) {
        orbitBRef.current = lerp(orbitBRef.current, targetOrbitBRef.current, ease);
        setOrbitB(orbitBRef.current);
    } else if (orbitBRef.current !== targetOrbitBRef.current) {
        orbitBRef.current = targetOrbitBRef.current;
        setOrbitB(orbitBRef.current);
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Event Handlers
  useEffect(() => {
    const handleUserInteraction = () => {
      setIsInteracting(true);
      if (interactionTimerRef.current) clearTimeout(interactionTimerRef.current);
      interactionTimerRef.current = window.setTimeout(() => setIsInteracting(false), 1000);

      // START AUDIO ON FIRST INTERACTION
      if (!audioStartedRef.current) {
          initAudio();
          if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
          audioStartedRef.current = true;
      } else {
           if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
          }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (isInfoOpen) return;
      
      e.preventDefault(); // STOP browser scroll
      handleUserInteraction();
      if (isPlayingRef.current) setIsPlaying(false);
      
      const delta = e.deltaY * 0.0005; 
      velocityRef.current += delta;
    };

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.closest('.overflow-y-auto')) return;

      lastTouchYRef.current = e.touches[0].clientY;
      velocityRef.current = 0;
      handleUserInteraction();
      if (isPlayingRef.current) setIsPlaying(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.closest('.overflow-y-auto')) return;

      e.preventDefault();
      handleUserInteraction();

      const touchY = e.touches[0].clientY;
      const deltaY = lastTouchYRef.current - touchY;
      lastTouchYRef.current = touchY;
      velocityRef.current += deltaY * 0.002;
    };

    const target = window;
    target.addEventListener('wheel', handleWheel, { passive: false });
    target.addEventListener('touchstart', handleTouchStart, { passive: false });
    target.addEventListener('touchmove', handleTouchMove, { passive: false });
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

  // --- CONTROL HANDLERS (Update Targets) ---
  const handleToggleInfo = () => {
    const nextState = !isInfoOpen;
    setIsInfoOpen(nextState);
    
    if (nextState) {
        // OPEN: Animate to "Edit Mode" (Zoom 8.0)
        targetZoomRef.current = 8.0;
        targetOrbitARef.current = 90;
        targetOrbitBRef.current = 80;
    } else {
        // CLOSE: Animate to "Default Mode" (Zoom 1.0)
        targetZoomRef.current = 1.0;
        targetOrbitARef.current = 0;
        targetOrbitBRef.current = 100;
    }
  };

  const handleZoomChange = (val: number) => {
      targetZoomRef.current = val;
  };
  const handleAChange = (val: number) => {
      targetOrbitARef.current = val;
  };
  const handleBChange = (val: number) => {
      targetOrbitBRef.current = val;
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] text-white font-mono overflow-hidden select-none touch-none">
        
        {/* Background Shader */}
        <NoiseBackground />

        {/* Manifesto Background Layer */}
        <Manifesto theta={theta} />

        {/* Scroll-revealed Bottom Text */}
        <BottomText theta={theta} />
        
        {/* Slide-out Info Panel containing Controls */}
        <InfoPanel 
            isOpen={isInfoOpen} 
            zoom={zoom}
            onZoomChange={handleZoomChange}
            orbitA={orbitA}
            orbitB={orbitB}
            onChangeA={handleAChange}
            onChangeB={handleBChange}
        />

        {/* --- UI OVERLAYS (STICKY CORNERS) --- */}

        {/* TOGGLE BUTTON (Circle -> X) - TOP LEFT */}
        <button 
          onClick={handleToggleInfo}
          className="absolute top-6 left-6 z-[60] w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center group focus:outline-none overflow-hidden mix-blend-difference cursor-pointer pointer-events-auto"
        >
            <div className="relative w-full h-full">
                <span className={`absolute top-1/2 left-1/2 w-4 h-[1px] bg-white -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${isInfoOpen ? 'rotate-45' : 'rotate-0 group-hover:w-2'}`} />
                <span className={`absolute top-1/2 left-1/2 h-4 w-[1px] bg-white -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ${isInfoOpen ? '-rotate-45' : 'rotate-0 group-hover:h-2'}`} />
            </div>
        </button>

        {/* PI SYMBOL - TOP RIGHT - BRIGHT RED */}
        <div className="absolute top-6 right-6 z-50 pointer-events-none">
            <div className="bg-black/0 backdrop-blur-none p-2 inline-block rounded">
                <div className="text-sm font-mono leading-tight tracking-tighter text-[#FF0000] drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                    π
                </div>
            </div>
        </div>

        {/* PLAY / STOP BUTTON (Left Center) */}
        <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute top-1/2 -translate-y-1/2 left-6 z-50 mix-blend-difference cursor-pointer focus:outline-none group"
        >
            <div className="bg-black/0 backdrop-blur-none p-2 inline-flex items-center justify-center rounded">
                {isPlaying ? (
                    /* STOP SQUARE */
                    <div className="w-3 h-3 bg-gray-200 opacity-80 group-hover:opacity-100 transition-opacity" />
                ) : (
                    /* PLAY TRIANGLE */
                    <div className="w-0 h-0 
                        border-t-[6px] border-t-transparent
                        border-l-[10px] border-l-gray-200
                        border-b-[6px] border-b-transparent
                        opacity-80 group-hover:opacity-100 transition-opacity ml-0.5" 
                    />
                )}
            </div>
        </button>

        {/* Bottom Right Data Panel */}
        <DataPanel theta={theta} point={currentPoint} />
        
        {/* Bottom Left Signature */}
        <div className="absolute bottom-8 left-8 z-50 text-gray-500 pointer-events-none mix-blend-difference">
            <div className="font-mono text-xs tracking-widest opacity-70">
                ▬▬ι═══════ﺤ
            </div>
            <div className="font-mono text-[10px] mt-1 tracking-widest uppercase opacity-50">
                ⌖ x neeko
            </div>
        </div>

        {/* Interaction Prompt - VISIBLE ON MOBILE (lowered), Desktop standard */}
        <div 
            className={`
                fixed z-40 transition-opacity duration-500 pointer-events-none 
                ${theta > 0.1 || isInteracting || isPlaying ? 'opacity-0' : 'opacity-100'}
                
                /* Mobile: Visible, centered low */
                bottom-16 left-1/2 -translate-x-1/2 text-center w-full
                
                /* Desktop: Bottom center */
                md:bottom-10 
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

        {/* CENTERED VIDEO BACKGROUND */}
        <div className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none opacity-50">
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
    </div>
  );
}
