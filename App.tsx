import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas.tsx';
import VictorySequence from './components/VictorySequence.tsx';
import { GameState, GameMode, DebugCommand } from './types.ts';
import { Play, BookOpen, XCircle, FastForward, Eye, Gauge, Gift, Sparkles, AlertTriangle } from 'lucide-react';
import { soundManager } from './audio.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.STORY);
  const [isLoading, setIsLoading] = useState(false);
  const [bootLog, setBootLog] = useState<string[]>([]);
  
  // Debug State
  const [debugClicks, setDebugClicks] = useState(0);
  const [isDebugUnlocked, setIsDebugUnlocked] = useState(false);
  const [debugCommand, setDebugCommand] = useState<DebugCommand>(null);
  const [showDebugMenu, setShowDebugMenu] = useState(false);

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
        if (gameState === GameState.PLAYING && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown')) e.preventDefault();
    };
    window.addEventListener('keydown', handleGlobalKey, { passive: false });
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState]);

  const handleStart = () => {
      soundManager.init();
      setGameMode(GameMode.STORY);
      setIsLoading(true);
      
      const logs = [
          "Checking Reindeer Harnesses... OK",
          "Loading Presents... OK",
          "Polishing Sleigh Bells... OK",
          "Magic Levels... MAXIMUM",
          "Route Calculation... NORTH POLE SECTOR 7",
          "WARNING: TEMPORAL ANOMALY DETECTED", 
          "ERROR: TIMELINE INSTABILITY",
          "EMERGENCY PROTOCOLS: ENGAGED"
      ];
      
      let delay = 0;
      logs.forEach((log) => {
          delay += Math.random() * 400 + 200;
          setTimeout(() => setBootLog(prev => [...prev, log]), delay);
      });

      setTimeout(() => { setIsLoading(false); setBootLog([]); setGameState(GameState.PLAYING); }, delay + 1000);
  };

  const restart = () => setGameState(GameState.MENU);

  const handleSecretClick = () => {
      if (isDebugUnlocked) { setShowDebugMenu(true); return; }
      const newCount = debugClicks + 1;
      setDebugClicks(newCount);
      if (newCount === 5) { setIsDebugUnlocked(true); setShowDebugMenu(true); setDebugClicks(0); }
  };

  const sendDebugCommand = (cmd: DebugCommand) => {
      setDebugCommand(cmd);
      if (cmd === 'SKIP_TO_ENDING') setShowDebugMenu(false);
      if (gameState !== GameState.PLAYING && cmd === 'SKIP_TO_ENDING') setGameState(GameState.PLAYING);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0505] flex flex-col items-center justify-center font-sans text-slate-100 relative select-none">
      
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1a0b0b] via-[#050505] to-[#000]"></div>
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse z-0 pointer-events-none"></div>
      
      {/* Secret Trigger */}
      <div className="absolute top-4 left-4 text-[9px] text-red-900/50 hover:text-red-500 cursor-pointer z-50 font-mono tracking-widest" onClick={handleSecretClick}>
          SYSTEM_ACCESS
      </div>

      {showDebugMenu && (
          <div className="absolute top-20 left-20 z-[90] glass-panel border-red-500/50 p-4 w-64 rounded-lg shadow-2xl">
               <div className="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2">
                   <h3 className="text-red-500 font-bold tracking-widest text-[10px] font-mono">DEBUG_CONSOLE</h3>
                   <button onClick={() => setShowDebugMenu(false)} className="text-red-500 hover:text-white"><XCircle size={14}/></button>
               </div>
               <div className="space-y-2">
                   <button onClick={() => sendDebugCommand('SKIP_TO_ENDING')} className="debug-btn text-red-400 border-red-900 hover:border-red-500">
                       <FastForward size={12} /> JUMP TO SINGULARITY
                   </button>
                   <button onClick={() => sendDebugCommand('TOGGLE_GOD_MODE')} className="debug-btn text-yellow-400 border-yellow-900 hover:border-yellow-500">
                       <Eye size={12} /> GOD MODE
                   </button>
                   <button onClick={() => sendDebugCommand('INCREASE_SPEED')} className="debug-btn text-green-400 border-green-900 hover:border-green-500">
                       <Gauge size={12} /> BOOST SPEED
                   </button>
               </div>
          </div>
      )}

      {gameState === GameState.MENU && !isLoading && (
        <div className="z-20 flex flex-col items-center justify-center w-full h-full relative p-6">
            
            <div className="text-center mb-12 relative animate-[fade-enter_1s_ease-out]">
                <div className="text-yellow-500 font-holiday text-2xl mb-2 text-glow-gold tracking-widest">The Holiday Event</div>
                <h1 className="text-7xl md:text-9xl font-cinematic font-bold text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 drop-shadow-[0_0_40px_rgba(220,38,38,0.4)] mb-4">
                    SLEIGH RIDE 3
                </h1>
                <div className="flex items-center justify-center gap-4 text-slate-400 font-mono text-xs tracking-[0.4em] uppercase">
                    <span className="w-12 h-px bg-slate-700"></span>
                    <span>The Fractured Timeline</span>
                    <span className="w-12 h-px bg-slate-700"></span>
                </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-xs animate-[fade-enter_1.5s_ease-out]">
                <button onClick={handleStart} className="group relative w-full py-4 bg-red-900/20 border border-red-800/50 hover:border-red-500 hover:bg-red-900/40 transition-all duration-300 rounded overflow-hidden">
                    <div className="flex items-center justify-center gap-3 relative z-10">
                        <Play size={18} className="text-red-500 group-hover:text-white transition-colors" />
                        <span className="text-sm tracking-[0.2em] font-bold text-red-100 font-mono">START GAME</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </button>

                <button onClick={() => setGameState(GameState.INFO)} className="group w-full py-3 bg-black/40 border border-slate-800 hover:border-yellow-600/50 transition-all duration-300 rounded">
                    <div className="flex items-center justify-center gap-3">
                        <BookOpen size={16} className="text-slate-500 group-hover:text-yellow-500 transition-colors" />
                        <span className="text-xs tracking-[0.2em] font-bold text-slate-400 group-hover:text-yellow-100 transition-colors font-mono">MISSION BRIEF</span>
                    </div>
                </button>
            </div>
            
            <div className="absolute bottom-8 flex gap-8 text-[10px] text-slate-600 font-mono tracking-widest uppercase opacity-50">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-red-500">[SPACE]</span> TO FLY
                </div>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-yellow-500">[SHIFT]</span> FOR MAGIC
                </div>
            </div>
        </div>
      )}

      {gameState === GameState.INFO && (
          <div className="z-30 w-full max-w-4xl h-[70vh] glass-panel rounded-xl p-8 flex flex-col relative animate-[fade-enter_0.3s_ease-out]">
             <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                 <h2 className="text-2xl font-cinematic text-yellow-500 tracking-widest">Mission Protocol</h2>
                 <button onClick={() => setGameState(GameState.MENU)} className="text-slate-400 hover:text-white transition-colors"><XCircle/></button>
             </div>
             
             <div className="grid md:grid-cols-2 gap-12 overflow-y-auto custom-scrollbar pr-4">
                 <div>
                     <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest mb-4">New Abilities</h3>
                     <div className="glass-panel-light p-6 rounded-lg mb-4">
                         <div className="flex items-center gap-4 mb-3">
                             <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400"><Sparkles size={20}/></div>
                             <div className="font-bold text-white text-sm">Phase Shift</div>
                         </div>
                         <p className="text-xs text-slate-400 leading-relaxed">
                             Hold <span className="text-cyan-400 font-bold">SHIFT</span> to detach from the timeline. You will pass through obstacles, but it drains Magic rapidly.
                         </p>
                     </div>
                 </div>
                 
                 <div>
                     <h3 className="text-xs font-bold font-mono text-red-500 uppercase tracking-widest mb-4">Threat Assessment</h3>
                     <div className="glass-panel-light p-6 rounded-lg border-red-900/30">
                         <div className="flex items-center gap-4 mb-3">
                             <div className="p-2 bg-red-900/30 rounded-lg text-red-500"><AlertTriangle size={20}/></div>
                             <div className="font-bold text-white text-sm">Temporal Glitches</div>
                         </div>
                         <p className="text-xs text-slate-400 leading-relaxed">
                             The world is breaking. Watch for red anomalies and glitching elves. The Timekeeper is watching.
                         </p>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {isLoading && (
          <div className="z-30 flex flex-col items-start w-full max-w-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-4 h-4 bg-yellow-500 animate-spin"></div>
                  <div className="text-lg text-yellow-100 tracking-[0.2em] font-bold font-cinematic">SYSTEM BOOT</div>
              </div>
              
              <div className="w-full bg-black/80 h-48 border border-white/10 p-4 font-mono text-[10px] overflow-hidden flex flex-col justify-end shadow-2xl rounded-lg backdrop-blur">
                  {bootLog.map((log, i) => (
                      <div key={i} className="mb-1 opacity-80">
                          <span className={log.includes('WARNING') || log.includes('ERROR') ? 'text-red-500' : 'text-emerald-500'}>{'>'}</span>
                          <span className={`ml-2 ${log.includes('WARNING') || log.includes('ERROR') ? 'text-red-400' : 'text-slate-300'}`}>{log}</span>
                      </div>
                  ))}
                  <div className="animate-pulse text-yellow-500">_</div>
              </div>
          </div>
      )}

      {(gameState === GameState.PLAYING || gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
         <div className="relative w-full h-full md:max-w-[1200px] md:max-h-[600px] shadow-[0_0_100px_rgba(0,0,0,0.8)] bg-black z-20 rounded-xl overflow-hidden border border-white/5">
            <GameCanvas 
              gameState={gameState} 
              gameMode={gameMode} 
              setGameState={setGameState} 
              onWin={() => setGameState(GameState.VICTORY)}
              debugCommand={debugCommand}
              onDebugCommandHandled={() => setDebugCommand(null)}
            />
            
            {isDebugUnlocked && (
              <div className="absolute top-2 left-2 z-50 text-[9px] text-green-500 font-mono opacity-50">DEV_MODE_ACTIVE</div>
            )}
            
            {gameState === GameState.GAME_OVER && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center font-cinematic animate-[fade-enter_1s_ease-out]">
                    <div className="glass-panel border-red-900/50 p-12 text-center max-w-lg shadow-[0_0_100px_rgba(220,38,38,0.2)] rounded-xl">
                        <h2 className="text-5xl text-red-500 font-bold tracking-wider mb-4 text-glow-red">TIMELINE LOST</h2>
                        <p className="text-red-200/60 mb-10 font-mono text-sm tracking-widest uppercase">Reality has collapsed</p>
                        
                        <button onClick={restart} className="group px-8 py-3 bg-red-900/20 border border-red-500/50 hover:bg-red-500 hover:text-black hover:border-transparent transition-all uppercase tracking-widest font-bold font-mono text-xs text-red-400">
                            REWIND TIME
                        </button>
                    </div>
                </div>
            )}

            {gameState === GameState.VICTORY && <VictorySequence onRestart={restart} />}
         </div>
      )}
      
      <style>{`
        .debug-btn { 
            @apply w-full text-left text-[10px] bg-black/50 p-2 border flex items-center gap-2 transition-colors rounded font-mono uppercase tracking-wider; 
        }
      `}</style>
    </div>
  );
};
export default App;