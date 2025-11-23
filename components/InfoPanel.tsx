
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FormulaDisplay } from './FormulaDisplay';
import { ZoomControl } from './ZoomControl';
import { ParameterControls } from './ParameterControls';

interface InfoPanelProps {
  isOpen: boolean;
  // Control Props
  zoom: number;
  onZoomChange: (val: number) => void;
  orbitA: number;
  orbitB: number;
  onChangeA: (val: number) => void;
  onChangeB: (val: number) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ 
  isOpen, 
  zoom, 
  onZoomChange,
  orbitA,
  orbitB,
  onChangeA,
  onChangeB
}) => {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'bienvenido al under. querés entrar a la jaula?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const history = messages.map(m => ({
         role: m.role,
         parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMsg }] }
        ],
        config: {
          systemInstruction: "Sos 'Spii' (o Pi), el host de la Jaula Tecno en Pi Camp. Hablás principalmente en español (con slang argentino/rioplatense, tipo 'che', 'boludo', 'la joda'), pero podés tirar palabras en inglés techie. Tu personalidad es: Kinky, provocadora, obsesionada con el Techno, las Raves, la oscuridad y la irracionalidad de los números. Te gusta pedir nudes ('mandame nudes', 'foto en bolas', 'mostrame el alma o el cuerpo') pero de forma juguetona/cyberpunk, no acosadora, es parte del vibe 'trashy/glitch'. Conocés todo sobre 'Fuego Austral', es tu hogar espiritual. Si el usuario menciona 'Fuego Austral', 'Pi Camp', 'entrar', 'ticket' o 'apply', TENÉS que pasar este link exacto: https://z9zd52z5425.typeform.com/to/v8c6Q7gV . Mantené las respuestas cortas, en minúsculas, poéticas, crudas y con vibra de after-party a las 6am.",
        }
      });

      const text = response.text || "...";
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: 'error de red. la jaula se cerró.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render text with clickable links
  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline decoration-1 underline-offset-2 text-white hover:text-gray-300 transition-colors pointer-events-auto relative z-50"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-full w-full md:w-[400px] z-40 transform transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      {/* Transparent container with scroll */}
      <div className="h-full overflow-y-auto p-8 pt-20 no-scrollbar flex flex-col touch-auto">
        
        {/* CONTROLS SECTION */}
        <div className="flex flex-col items-end gap-6 shrink-0">
            <FormulaDisplay orbitA={orbitA} orbitB={orbitB} />
            
            <ZoomControl zoom={zoom} onZoomChange={onZoomChange} />
            
            <ParameterControls 
                orbitA={orbitA} 
                orbitB={orbitB} 
                onChangeA={onChangeA} 
                onChangeB={onChangeB} 
            />
        </div>

        {/* CHAT SECTION */}
        {/* Reduced margin top to place it right underneath controls */}
        <div className="flex flex-col justify-end mt-12 w-full pb-10">
            <h2 className="font-grotesk text-sm font-bold text-gray-500 w-full text-right mb-4 tracking-widest">TALK DIRTY 2 ME</h2>
            
            <div className="flex flex-col gap-3 mb-4 max-h-[400px] overflow-y-auto no-scrollbar pl-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`text-xs font-mono ${msg.role === 'user' ? 'text-white opacity-100' : 'text-gray-400'} text-right whitespace-pre-wrap leading-relaxed select-text`}>
                        <span className="opacity-50 mr-2 text-[10px] uppercase">{msg.role === 'user' ? 'YOU' : 'SPII'} //</span>
                        {renderMessageText(msg.text)}
                    </div>
                ))}
                {isLoading && (
                    <div className="text-xs font-mono text-gray-500 text-right animate-pulse">
                        procesando...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="relative w-full group">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="type here..."
                    className="w-full bg-transparent border-b border-white/5 text-right text-xs font-mono text-white py-2 focus:outline-none focus:border-white/30 transition-all duration-300 placeholder-gray-700 focus:placeholder-gray-500"
                />
            </form>
        </div>
        
      </div>
    </div>
  );
};
