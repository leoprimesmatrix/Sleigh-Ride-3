
import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface VictorySequenceProps {
  onRestart: () => void;
}

const VictorySequence: React.FC<VictorySequenceProps> = ({ onRestart }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Cinematic Timing
    setTimeout(() => setStage(1), 2000); // Time Stop
    setTimeout(() => setStage(2), 5000); // Rift Opens
    setTimeout(() => setStage(3), 8000); // Krampus Falls
    setTimeout(() => setStage(4), 12000); // Title Card
  }, []);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden font-serif text-white">
      
      {/* Stage 0-1: Time Stabilization */}
      {stage < 2 && (
          <div className="relative flex flex-col items-center justify-center animate-pulse">
             <h1 className="text-4xl tracking-[0.5em] text-cyan-400 font-['Orbitron'] mb-4 glitch-text" data-text="TIMELINE STABILIZED">TIMELINE STABILIZED</h1>
             <p className="text-xs text-cyan-800 font-mono">CHRONOS PROTOCOLS: SUSPENDED</p>
          </div>
      )}

      {/* Stage 2: The Rift */}
      {stage === 2 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1a051f]">
            <div className="w-[2px] h-[0px] bg-purple-500 animate-[expand-height_0.5s_forwards] shadow-[0_0_50px_#a855f7]"></div>
            <div className="absolute w-[300px] h-[300px] border-4 border-purple-500 rounded-full opacity-0 animate-[ping_1s_infinite]"></div>
            <p className="absolute bottom-20 text-purple-400 font-mono tracking-widest animate-pulse">WARNING: ANOMALY DETECTED</p>
        </div>
      )}

      {/* Stage 3: The Arrival */}
      {stage === 3 && (
         <div className="absolute inset-0 bg-white animate-[flash_0.2s_ease-out]">
            <div className="absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-1000 opacity-90">
                 <div className="text-center">
                     <p className="text-red-500 text-sm font-mono mb-4">ENTITY IDENTIFIED: KRAMPUS (YEAR 2941)</p>
                     <p className="text-2xl text-white italic font-['Cinzel']">"Santa... I found you."</p>
                 </div>
            </div>
         </div>
      )}

      {/* Stage 4: Title Card */}
      <div className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-2000 ${stage >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-8 drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] font-['Cinzel']">
              TO BE CONCLUDED
          </h1>
          <h2 className="text-3xl text-white font-['Orbitron'] tracking-[0.5em] mb-12">IN SLEIGH RIDE 4</h2>
          
          <button 
              onClick={onRestart}
              className="text-slate-500 hover:text-white border border-slate-800 hover:border-white px-8 py-3 transition-all uppercase tracking-widest text-xs font-mono hover:bg-slate-900"
          >
              <div className="flex items-center gap-2">
                  <Play size={12} /> REBOOT SIMULATION
              </div>
          </button>
      </div>
    </div>
  );
};

export default VictorySequence;