import React from 'react';
import { Activity, Zap, Database, Clock, ShieldAlert, Sparkles, AlertCircle, Play } from 'lucide-react';
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
  
  const isGlitchMode = progress > 50;
  const themeColor = isGlitchMode ? "text-cyan-400" : "text-yellow-400";
  const borderColor = isGlitchMode ? "border-cyan-500/30" : "border-yellow-500/30";

  return (
    <div className="absolute inset-0 z-20 pointer-events-none select-none p-6 flex flex-col justify-between overflow-hidden">
      
      {/* --- TOP HUD --- */}
      <div className="flex justify-between items-start">
         
         {/* Left: Vital Stats */}
         <div className="flex flex-col gap-4 w-64 glass-panel-light p-4 rounded-lg animate-[fade-enter_0.5s_ease-out]">
            {/* Health */}
            <div>
               <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
                  <span>Hull Integrity</span>
                  <span className={integrity < 30 ? "text-red-500" : "text-emerald-400"}>{Math.floor(integrity)}%</span>
               </div>
               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 ${integrity < 30 ? "bg-red-500" : "bg-emerald-500"}`} style={{width: `${integrity}%`}} />
               </div>
            </div>

            {/* Stability */}
            <div>
               <div className="flex justify-between text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">
                  <span>{isGlitchMode ? "Reality Anchor" : "Magic Reserve"}</span>
                  <span className={stability < 20 ? "text-red-500 animate-pulse" : themeColor}>{Math.floor(stability)}%</span>
               </div>
               <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full transition-all duration-300 shadow-[0_0_10px_currentColor] ${isGlitchMode ? "bg-cyan-500" : "bg-yellow-400"}`} style={{width: `${stability}%`}} />
               </div>
            </div>
         </div>

         {/* Center: Score & Combo */}
         <div className="flex flex-col items-center">
            {combo > 1 && (
                <div className="animate-bounce mb-2 flex flex-col items-center">
                    <span className={`text-5xl font-black italic drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] ${themeColor} font-tech`}>
                        {combo}x
                    </span>
                    <span className="text-[10px] tracking-[0.4em] uppercase text-white font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">Chain</span>
                </div>
            )}
            
            <div className={`bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border ${borderColor} flex items-center gap-4`}>
                <div className="text-right">
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">Score</div>
                    <div className="text-xl font-bold font-mono text-white">{score.toLocaleString()}</div>
                </div>
                <div className="w-px h-6 bg-white/20"></div>
                <div>
                     <div className="text-[9px] text-slate-400 uppercase tracking-widest">Zone</div>
                     <div className={`text-xs font-bold uppercase ${themeColor}`}>{currentLevelName}</div>
                </div>
            </div>

            {isTimeSlipping && (
                <div className="mt-2 text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 animate-pulse bg-cyan-900/30 px-3 py-1 rounded border border-cyan-500/30">
                    Phase Shift Active
                </div>
            )}
         </div>

         {/* Right: Progress Ring */}
         <div className="relative w-16 h-16 glass-panel-light rounded-full flex items-center justify-center">
             <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="6" />
                 <circle cx="50" cy="50" r="40" fill="none" stroke={isGlitchMode ? "#06b6d4" : "#fbbf24"} strokeWidth="6" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - progress/100)} className="transition-all duration-500" />
             </svg>
             <div className="text-[10px] font-bold text-white font-mono">{Math.floor(progress)}%</div>
         </div>
      </div>

      {/* --- MIDDLE: NOTIFICATIONS --- */}
      {activeLog && (
          <div className="absolute top-32 right-10 animate-[slide-in-right_0.3s_ease-out]">
              <div className="bg-slate-900/90 border-l-4 border-yellow-500 p-4 max-w-sm shadow-2xl backdrop-blur rounded-r-lg">
                  <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-bold mb-1 tracking-widest uppercase">
                      <Database size={12}/> System Alert
                  </div>
                  <p className="text-sm text-slate-200 font-mono leading-tight">{activeLog}</p>
              </div>
          </div>
      )}

      {/* --- BOTTOM: DIALOGUE --- */}
      <div className="flex flex-col items-center justify-end pb-8">
          {activeDialogue && (
              <div className="max-w-2xl w-full text-center animate-[fade-enter_0.5s_ease-out]">
                  <div className="inline-block bg-black/60 backdrop-blur-sm border-y border-white/10 px-8 py-4">
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase mb-2 flex items-center justify-center gap-2" style={{ color: activeDialogue.color }}>
                          {activeDialogue.speaker}
                      </div>
                      <p className={`text-2xl text-white leading-relaxed drop-shadow-md ${activeDialogue.font || "font-serif"}`}>
                          "{activeDialogue.text}"
                      </p>
                  </div>
              </div>
          )}
          
          <div className="absolute bottom-4 left-6 text-[10px] text-slate-500 font-mono">
               T-{timeLeft.toFixed(0)}s // {currentLevelSub}
          </div>
      </div>

    </div>
  );
};

export default UIOverlay;