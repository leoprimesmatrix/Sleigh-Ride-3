
import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas.tsx';
import VictorySequence from './components/VictorySequence.tsx';
import { GameState, GameMode, DebugCommand } from './types.ts';
import { Play, BookOpen, XCircle, FastForward, Eye, Gauge, AlertTriangle, Clock } from 'lucide-react';
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
        if (gameState === GameState.PLAYING && (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown')) {
            e.preventDefault();
        }
    };
    window.addEventListener('keydown', handleGlobalKey, { passive: false });
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState]);

  const handleStart = () => {
      soundManager.init();
      setGameMode(GameMode.STORY);
      setIsLoading(true);
      
      const logs = [
          "DETECTING TEMPORAL ANOMALY...",
          "SANTA VITALS: ELEVATED STRESS",
          "CHRONOS FIELD: UNSTABLE",
          "SLEIGH SYSTEMS: ONLINE",
          "TIME SLIP ENGINE: CHARGED",
          "TARGET: THE TIMEKEEPER",
          "OBJECTIVE: PRESERVE THE TIMELINE",
      ];
      
      let delay = 0;
      logs.forEach((log, index) => {
          delay += Math.random() * 300 + 100;
          setTimeout(() => {
              setBootLog(prev => [...prev, log]);
          }, delay);
      });

      setTimeout(() => { 
          setIsLoading(false); 
          setBootLog([]);
          setGameState(GameState.PLAYING); 
      }, delay + 800);
  };

  const restart = () => setGameState(GameState.MENU);

  const handleSecretClick = () => {
      if (isDebugUnlocked) {
          setShowDebugMenu(true);
          return;
      }
      const newCount = debugClicks + 1;
      setDebugClicks(newCount);
      if (newCount === 5) {
          setIsDebugUnlocked(true);
          setShowDebugMenu(true);
          setDebugClicks(0);
      }
  };

  const sendDebugCommand = (cmd: DebugCommand) => {
      setDebugCommand(cmd);
      if (cmd === 'SKIP_TO_ENDING') setShowDebugMenu(false);
      
      if (gameState !== GameState.PLAYING && cmd === 'SKIP_TO_ENDING') {
          setGameState(GameState.PLAYING);
      }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#000000] flex flex-col items-center justify-center font-mono text-red-50 relative select-none">
      
      <div className="warp-container opacity-20"></div>
      
      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at center, #1a0505 0%, #000000 80%)' }}></div>

      <div className="absolute top-4 left-4 text-[10px] text-red-900 flex flex-col gap-1 z-50 cursor-pointer hover:text-red-500 transition-colors font-bold" onClick={handleSecretClick}>
          <div>OPERATOR: SANTA_CLAUS</div>
          <div>YEAR: ???? (ERR)</div>
          <div>STATUS: CRITICAL</div>
      </div>

      {showDebugMenu && (
          <div className="absolute top-20 left-20 z-[90] bg-[#1a0505]/95 border border-red-500 p-4 w-72 shadow-xl backdrop-blur-md rounded">
               <div className="flex justify-between items-center mb-4 border-b border-red-900 pb-2">
                   <h3 className="text-red-500 font-bold tracking-widest text-xs">CHRONOS_DEBUG</h3>
                   <button onClick={() => setShowDebugMenu(false)} className="text-red-700 hover:text-red-400"><XCircle size={14}/></button>
               </div>
               <div className="space-y-2">
                   <button onClick={() => sendDebugCommand('SKIP_TO_ENDING')} className="w-full text-left text-xs bg-black hover:bg-red-900/30 text-red-400 p-2 border border-red-900 hover:border-red-500 flex items-center gap-2 transition-colors">
                       <FastForward size={14} /> FORCE SINGULARITY
                   </button>
                   <button onClick={() => sendDebugCommand('TOGGLE_GOD_MODE')} className="w-full text-left text-xs bg-black hover:bg-red-900/30 text-yellow-400 p-2 border border-red-900 hover:border-yellow-500 flex items-center gap-2 transition-colors">
                       <Eye size={14} /> TOGGLE ETERNAL FORM
                   </button>
                   <button onClick={() => sendDebugCommand('INCREASE_SPEED')} className="w-full text-left text-xs bg-black hover:bg-red-900/30 text-green-400 p-2 border border-red-900 hover:border-green-500 flex items-center gap-2 transition-colors">
                       <Gauge size={14} /> INCREASE VELOCITY
                   </button>
               </div>
          </div>
      )}

      {gameState === GameState.MENU && !isLoading && (
        <div className="z-20 text-center flex flex-col items-center gap-8 relative w-full px-4">
            
            <div className="relative mb-8 w-full max-w-4xl animate-pulse">
                <div className="text-4xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 tracking-tighter glitch-text whitespace-nowrap mb-2 font-['Orbitron']" data-text="SLEIGH RIDE 3">
                    SLEIGH RIDE 3
                </div>
                <div className="flex items-center justify-center w-full mt-2 py-1 gap-4">
                    <span className="h-px w-12 bg-red-800"></span>
                    <h2 className="text-lg md:text-3xl text-red-400 tracking-[0.5em] uppercase font-serif text-shadow-glow">
                        The Fractured Timeline
                    </h2>
                    <span className="h-px w-12 bg-red-800"></span>
                </div>
            </div>

            <div className="w-full max-w-md bg-[#0a0a0a]/90 border border-red-900 backdrop-blur-md p-1 relative group shadow-[0_0_50px_rgba(220,38,38,0.15)] skew-x-[-2deg]">
                
                <div className="p-8 flex flex-col gap-6">
                    <div className="text-left text-xs text-red-400/80 font-mono mb-2 leading-relaxed">
                        <p>> TIMEKEEPER INTERCEPTED.</p>
                        <p>> HISTORY IS BEING REWRITTEN.</p>
                        <p>> SAVE THE HEARTBEAT OF CHRISTMAS.</p>
                    </div>

                    <button onClick={handleStart} className="relative overflow-hidden group/btn bg-red-950 border border-red-800 hover:border-red-400 py-4 px-8 transition-all duration-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.4)]">
                        <div className="absolute inset-0 w-full h-full bg-red-500/20 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300"></div>
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <Play className="text-red-500 group-hover/btn:text-white transition-colors" size={20} />
                            <span className="text-lg tracking-[0.2em] group-hover/btn:text-white transition-colors font-bold font-['Orbitron'] text-white">ENGAGE SYSTEMS</span>
                        </div>
                    </button>

                    <button onClick={() => setGameState(GameState.INFO)} className="relative overflow-hidden group/btn bg-black border border-slate-800 hover:border-yellow-600 py-3 px-8 transition-all duration-300">
                        <div className="absolute inset-0 w-full h-full bg-yellow-600/10 scale-x-0 group-hover/btn:scale-x-100 transition-transform origin-left duration-300"></div>
                        <div className="flex items-center justify-center gap-3 relative z-10">
                            <BookOpen className="text-yellow-600 group-hover/btn:text-white transition-colors" size={18} />
                            <span className="text-sm tracking-[0.2em] group-hover/btn:text-white transition-colors font-bold font-mono text-slate-300">MISSION DATA</span>
                        </div>
                    </button>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <div className="bg-black/50 border border-slate-900 p-2 text-xs text-slate-500 text-center">
                            <span className="text-red-500 font-bold block mb-1">FLY</span>
                            [SPACE]
                        </div>
                         <div className="bg-black/50 border border-slate-900 p-2 text-xs text-slate-500 text-center">
                            <span className="text-cyan-400 font-bold block mb-1">TIME SLIP</span>
                            [SHIFT]
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {gameState === GameState.INFO && (
          <div className="z-30 w-full max-w-4xl h-[80vh] bg-[#0f0505]/95 border border-red-900 backdrop-blur-md p-6 relative flex flex-col overflow-hidden shadow-2xl rounded">
             <div className="flex items-center justify-between border-b border-red-900/50 pb-4 mb-4">
                 <div className="flex items-center gap-4">
                     <AlertTriangle className="text-yellow-600" size={24} />
                     <h2 className="text-2xl font-bold tracking-widest text-white font-serif">Mission Briefing</h2>
                 </div>
                 <button onClick={() => setGameState(GameState.MENU)} className="text-slate-400 hover:text-white flex items-center gap-2 text-xs tracking-widest uppercase border border-slate-700 px-4 py-2 hover:bg-slate-800 transition-colors">
                     <XCircle size={16} /> Close
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-8 pr-2 custom-scrollbar p-4">
                 <div className="space-y-6">
                     <h3 className="text-cyan-400 border-b border-cyan-900 pb-1 text-sm tracking-widest uppercase mb-4 font-bold">New Capabilities</h3>
                     
                     <div className="flex gap-4 p-4 bg-black/50 border border-slate-800 items-start hover:border-cyan-500/50 transition-colors">
                         <div className="w-12 h-12 border border-cyan-500 flex items-center justify-center bg-cyan-900/20 shrink-0 rounded-full">
                             <Clock size={20} className="text-cyan-400" />
                         </div>
                         <div>
                             <h4 className="text-white font-bold text-sm font-['Orbitron']">TIME SLIP [HOLD SHIFT]</h4>
                             <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                                 Desynchronize from the current timeline to pass through solid objects.
                                 <br/><br/>
                                 <span className="text-cyan-400">TACTIC:</span> Slip through glitches and drones to STABILIZE them and restore your timeline stability.
                             </p>
                         </div>
                     </div>
                 </div>

                 <div className="space-y-6">
                     <h3 className="text-yellow-600 border-b border-yellow-900 pb-1 text-sm tracking-widest uppercase mb-4 font-bold">Target Profile</h3>

                     <div className="flex gap-4 p-4 bg-black/50 border border-slate-800 items-start">
                         <div className="w-12 h-12 rounded-full border border-slate-500 flex items-center justify-center bg-slate-900/20 shrink-0">
                            <div className="text-xs text-slate-500 font-bold">?</div>
                         </div>
                         <div>
                             <h4 className="text-slate-300 font-bold text-sm font-serif">The Timekeeper</h4>
                             <p className="text-slate-500 text-xs mt-2 leading-relaxed italic">
                                 "He seeks to replace the chaos of magic with the cold precision of clockwork. If he succeeds, Christmas will never have existed."
                             </p>
                         </div>
                     </div>
                 </div>
             </div>
          </div>
      )}

      {isLoading && (
          <div className="z-30 flex flex-col items-start w-full max-w-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                  <div className="clock-loader border-red-500"></div>
                  <div className="text-xl text-white tracking-widest font-bold font-['Orbitron']">SYNCHRONIZING</div>
              </div>
              
              <div className="w-full bg-black/90 h-64 border border-red-900 p-4 font-mono text-xs overflow-hidden flex flex-col justify-end shadow-lg rounded">
                  {bootLog.map((log, i) => (
                      <div key={i} className="mb-1">
                          <span className="text-red-500 mr-2">{'>'}</span>
                          <span className="text-red-100 opacity-80">{log}</span>
                      </div>
                  ))}
                  <div className="animate-pulse text-red-500">_</div>
              </div>
              
              <div className="w-full h-1 bg-slate-800 mt-2 relative overflow-hidden rounded-full">
                  <div className="absolute inset-0 bg-red-600 animate-[slide-in-right_3s_ease-out]"></div>
              </div>
          </div>
      )}

      {(gameState === GameState.PLAYING || gameState === GameState.GAME_OVER || gameState === GameState.VICTORY) && (
         <div className="relative w-full h-full md:max-w-[1200px] md:max-h-[600px] shadow-2xl overflow-hidden bg-black z-20 border-2 border-red-900/50 rounded-lg">
            <GameCanvas 
              gameState={gameState} 
              gameMode={gameMode} 
              setGameState={setGameState} 
              onWin={() => setGameState(GameState.VICTORY)}
              debugCommand={debugCommand}
              onDebugCommandHandled={() => setDebugCommand(null)}
            />
            
            {isDebugUnlocked && (
              <div className="absolute top-2 left-2 flex gap-2 z-50">
                  <div className="text-[10px] text-green-500 border border-green-800 px-2 py-1 bg-black/80 font-mono">
                    DEV_OVERRIDE
                  </div>
              </div>
            )}
            
            {gameState === GameState.GAME_OVER && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center font-serif">
                    <div className="border border-red-900/50 p-10 bg-red-950/20 backdrop-blur text-center max-w-lg shadow-[0_0_50px_rgba(185,28,28,0.1)] rounded-lg">
                        <AlertTriangle size={64} className="text-red-600 mb-6 mx-auto opacity-80" />
                        <h2 className="text-4xl text-red-500 font-bold tracking-widest mb-2 font-['Orbitron']">TIMELINE LOST</h2>
                        <div className="h-px w-full bg-red-900/50 my-6"></div>
                        <p className="text-red-300/60 mb-8 tracking-wider italic">"The Timekeeper has won. Magic is extinct."</p>
                        
                        <button onClick={restart} className="group px-8 py-3 border border-red-800 text-red-500 hover:bg-red-900 hover:text-white transition-all uppercase tracking-widest flex items-center gap-2 mx-auto font-mono text-xs">
                            <Clock size={14} />
                            REWIND
                        </button>
                    </div>
                </div>
            )}

            {gameState === GameState.VICTORY && <VictorySequence onRestart={restart} />}
         </div>
      )}
    </div>
  );
};
export default App;