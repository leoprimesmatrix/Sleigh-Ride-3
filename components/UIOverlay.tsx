
import React from 'react';
import { Activity, Zap, Database, Clock, ShieldAlert } from 'lucide-react';
import { DialogueLine } from '../types.ts';

interface UIOverlayProps {
  integrity: number;
  stability: number;
  progress: number;
  timeLeft: number;
  currentLevelName: string;
  currentLevelSub: string;
  score: number;
  activeDialogue: DialogueLine | null;
  activeLog: string | null;
  isTimeSlipping: boolean;
  combo: number;
}

const UIOverlay: React.FC<UIOverlayProps> = ({
  integrity, stability, progress, timeLeft, currentLevelName, currentLevelSub,
  score, activeDialogue, activeLog, isTimeSlipping, combo
}) => {
  
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-6 z-20 font-mono text-blue-100 select-none pointer-events-none">
      
      {/* Top HUD */}
      <div className="flex justify-between items-start w-full border-b-2 border-red-900/30 pb-4 bg-gradient-to-b from-[#000000] to-transparent backdrop-blur-sm">
         
         {/* Left: Vital Systems */}
         <div className="flex flex-col gap-3 w-72">
            {/* Hull Integrity */}
            <div className="flex items-center gap-3">
                <ShieldAlert size={20} className={integrity < 30 ? "text-red-500 animate-pulse" : "text-green-500"} />
                <div className="w-full h-3 bg-slate-900 skew-x-[-10deg] overflow-hidden border border-slate-700 relative">
                    <div className={`h-full transition-all duration-300 ${integrity < 30 ? "bg-red-600" : "bg-green-600"}`} style={{width: `${integrity}%`}} />
                    {/* Grid overlay on bar */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDBMMCA0IiBzdHJva2U9InJnYmEoMCwwLDAsMC4zKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-30"></div>
                </div>
                <span className="text-[10px] tracking-wider text-slate-400 font-bold">HULL</span>
            </div>

            {/* Time Stability */}
            <div className="flex items-center gap-3">
                <Clock size={20} className={stability < 20 ? "text-red-500 animate-ping" : "text-cyan-400"} />
                <div className="w-full h-3 bg-slate-900 skew-x-[-10deg] overflow-hidden border border-slate-700 relative">
                    <div className="h-full bg-cyan-500 transition-all duration-100 shadow-[0_0_15px_#06b6d4]" style={{width: `${stability}%`}} />
                </div>
                <span className="text-[10px] tracking-wider text-cyan-400 font-bold">STABILITY</span>
            </div>
         </div>

         {/* Center: Combo Meter & Status */}
         <div className="flex flex-col items-center">
             <div className="flex flex-col items-center">
                 {combo > 1 && (
                     <div className="animate-bounce">
                         <span className="text-5xl font-black font-['Orbitron'] italic text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)] glitch-text" data-text={`${combo}x`}>
                             {combo}x
                         </span>
                         <span className="text-xs text-yellow-200 block text-center tracking-[0.3em] bg-black/50 px-2 mt-1">SYNC</span>
                     </div>
                 )}
                 {combo <= 1 && (
                     <div className="text-2xl font-bold tracking-widest text-slate-800 font-['Orbitron']">
                         STABILIZE
                     </div>
                 )}
             </div>
             
             <div className="flex gap-2 mt-2 h-6 justify-center">
               {isTimeSlipping && <div className="text-[10px] text-cyan-100 border border-cyan-400 px-3 py-1 bg-cyan-900/80 uppercase tracking-widest animate-pulse font-bold shadow-[0_0_20px_#06b6d4]">TIME SLIP ACTIVE</div>}
             </div>
         </div>

         {/* Right: Score */}
         <div className="text-right">
             <div className="text-[10px] text-slate-400 tracking-widest mb-1">TIMELINE INTEGRITY</div>
             <div className="text-3xl text-white font-['Orbitron'] font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{score.toLocaleString()}</div>
         </div>
      </div>

      {/* Central Notifications */}
      {activeLog && (
          <div className="absolute top-32 right-10 animate-slide-in-right">
              <div className="bg-black/90 border-r-4 border-yellow-600 p-4 max-w-sm shadow-2xl backdrop-blur skew-x-[-5deg]">
                  <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold mb-1 tracking-widest skew-x-[5deg]">
                      <Database size={12}/> SYSTEM LOG
                  </div>
                  <p className="text-sm text-yellow-100 font-mono skew-x-[5deg]">{activeLog}</p>
              </div>
          </div>
      )}

      {/* Bottom Dialogue */}
      {activeDialogue && (
          <div className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-3xl">
              <div className="bg-black/95 border-t-2 border-b-2 border-red-500/50 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                  <div className="text-xs font-bold mb-2 tracking-[0.2em] uppercase flex items-center gap-2" style={{ color: activeDialogue.color }}>
                      <span className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: activeDialogue.color }}/>
                      {activeDialogue.speaker}
                  </div>
                  <p className="text-xl text-white font-['Cinzel'] leading-relaxed typing-effect drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                      "{activeDialogue.text}"
                  </p>
              </div>
          </div>
      )}

      {/* Bottom Status Bar */}
      <div className="flex justify-between items-end text-xs text-slate-500 uppercase tracking-widest bg-gradient-to-t from-black to-transparent pt-10">
          <div>
              <div className="text-red-500 font-bold text-lg drop-shadow-[0_0_5px_rgba(239,68,68,0.5)] font-['Orbitron']">{currentLevelName}</div>
              <div className="text-slate-400">{currentLevelSub}</div>
          </div>
          
          <div className="flex flex-col items-end gap-1 w-1/3">
              <span className="text-cyan-500 animate-pulse">PROXIMITY TO SINGULARITY</span>
              <div className="w-full h-1 bg-slate-900 border border-slate-800">
                  <div className="h-full bg-white transition-all duration-500 shadow-[0_0_10px_#fff]" style={{width: `${Math.min(100, progress)}%`}} />
              </div>
          </div>
      </div>

    </div>
  );
};

export default UIOverlay;