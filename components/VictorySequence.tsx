import React, { useEffect, useState } from 'react';
import { Play } from 'lucide-react';

interface VictorySequenceProps {
  onRestart: () => void;
}

const VictorySequence: React.FC<VictorySequenceProps> = ({ onRestart }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
        setTimeout(() => setStage(1), 2000),
        setTimeout(() => setStage(2), 5000),
        setTimeout(() => setStage(3), 8500),
        setTimeout(() => setStage(4), 13000)
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden text-white font-sans select-none">
      
      {/* Stage 0-1: Stabilization */}
      {stage < 2 && (
          <div className="flex flex-col items-center animate-pulse">
             <h1 className="text-3xl md:text-5xl tracking-[0.3em] text-cyan-400 font-tech font-bold mb-4 glitch-active" data-text="TIMELINE STABILIZED">TIMELINE STABILIZED</h1>
             <p className="text-xs text-cyan-800 font-mono tracking-widest">PROTOCOL: OMEGA // CHRONOS RESTORED</p>
          </div>
      )}

      {/* Stage 2: Rift */}
      {stage === 2 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a050d] animate-[fade-enter_1s_ease-out]">
            <div className="w-1 h-0 bg-purple-500 animate-[expand-height_0.5s_forwards] shadow-[0_0_80px_#a855f7]"></div>
            <div className="absolute w-[400px] h-[400px] border border-purple-500/50 rounded-full opacity-0 animate-[ping_2s_infinite]"></div>
            <p className="absolute bottom-20 text-purple-400 font-mono tracking-[0.5em] text-[10px] animate-pulse">ANOMALY DETECTED: SECTOR 9</p>
        </div>
      )}

      {/* Stage 3: Arrival */}
      {stage === 3 && (
         <div className="absolute inset-0 bg-white animate-[flash_0.2s_ease-out]">
            <div className="absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-1000 opacity-90">
                 <div className="text-center max-w-md p-8 border-y border-red-900/30">
                     <p className="text-red-500 text-[10px] font-mono tracking-widest mb-6">ENTITY IDENTIFIED: KRAMPUS [YEAR 2941]</p>
                     <p className="text-3xl text-white font-cinematic italic text-glow-red">"Santa... I found you."</p>
                 </div>
            </div>
         </div>
      )}

      {/* Stage 4: Title Card */}
      <div className={`absolute inset-0 bg-black flex flex-col items-center justify-center transition-opacity duration-2000 ${stage >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-bold font-cinematic text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 mb-6 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                  TO BE CONCLUDED
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-500 font-tech tracking-[0.8em] uppercase">In Sleigh Ride 4</h2>
          </div>
          
          <button 
              onClick={onRestart}
              className="group px-8 py-4 border border-slate-800 hover:border-white transition-all bg-transparent hover:bg-white/5"
          >
              <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-slate-400 group-hover:text-white">
                  <Play size={14} /> Reboot Simulation
              </div>
          </button>
      </div>

      <style>{`
        @keyframes expand-height { from { height: 0; } to { height: 100vh; } }
        @keyframes flash { 0% { opacity: 1; } 100% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default VictorySequence;