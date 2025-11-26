
import React, { useEffect, useRef, useState } from 'react';
import { 
  GameState, Player, Obstacle, Powerup, DataLog, Particle, ParticleType, PowerupType, Entity, BackgroundLayer, DialogueLine, GameMode, Landmark, DebugCommand, ScorePopup, ObstacleType
} from '../types.ts';
import { 
  CANVAS_WIDTH, CANVAS_HEIGHT, GRAVITY, THRUST_POWER, MAX_FALL_SPEED, BASE_SPEED, 
  LEVELS, LEVEL_THRESHOLDS, POWERUP_COLORS, TOTAL_GAME_TIME_SECONDS, VICTORY_DISTANCE, 
  STABILITY_DRAIN_RATE, STABILITY_RECHARGE_RATE, STABILITY_MIN_ACTIVATION, STABILITY_RESTORE_REWARD, COMBO_DECAY,
  STORY_MOMENTS, LANDMARKS
} from '../constants.ts';
import UIOverlay from './UIOverlay.tsx';
import { soundManager } from '../audio.ts';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onWin: () => void;
  gameMode: GameMode;
  debugCommand?: DebugCommand;
  onDebugCommandHandled?: () => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, onWin, gameMode, debugCommand, onDebugCommandHandled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Entities
  const playerRef = useRef<Player>({
    id: 0, x: 100, y: 300, width: 80, height: 40, markedForDeletion: false,
    vy: 0, integrity: 100, stability: 100, maxStability: 100,
    isTimeSlipping: false, angle: 0, isThrusting: false, godMode: false,
    combo: 1, comboTimer: 0
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerupsRef = useRef<Powerup[]>([]);
  const logsRef = useRef<DataLog[]>([]);
  const landmarksRef = useRef<Landmark[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  
  // Visuals
  const bgLayersRef = useRef<BackgroundLayer[]>([
    { points: [], color: '#000000', speedModifier: 0.1, offset: 0 }, 
    { points: [], color: '#000000', speedModifier: 0.3, offset: 0 },  
    { points: [], color: '#000000', speedModifier: 0.6, offset: 0 },  
  ]);
  const matrixRainRef = useRef<{x:number, y:number, speed:number, char:string}[]>([]);

  // Logic
  const shakeRef = useRef(0);
  const isEndingSequenceRef = useRef(false);
  const endingTimerRef = useRef(0);

  // Debug Modifiers
  const speedMultiplierRef = useRef(1.0);
  const progressMultiplierRef = useRef(1.0);

  // State Sync
  const activeDialogueRef = useRef<DialogueLine | null>(null);
  const activeLogRef = useRef<string | null>(null);
  const triggeredEventsRef = useRef<Set<string>>(new Set());
  
  const distanceRef = useRef(0);
  const scoreRef = useRef(0);
  const timeRef = useRef(TOTAL_GAME_TIME_SECONDS);
  const lastFrameTimeRef = useRef(0);
  const lastLevelIndexRef = useRef(0); 
  const pressedKeysRef = useRef<Set<string>>(new Set());

  const [hudState, setHudState] = useState({
    integrity: 100, stability: 100, progress: 0, timeLeft: TOTAL_GAME_TIME_SECONDS, 
    levelIndex: 0, score: 0, combo: 1,
    activeDialogue: null as DialogueLine | null, activeLog: null as string | null,
    isTimeSlipping: false
  });

  // Handle Debug Commands
  useEffect(() => {
    if (!debugCommand) return;
    
    if (debugCommand === 'SKIP_TO_ENDING') {
      distanceRef.current = VICTORY_DISTANCE * 0.96; 
      obstaclesRef.current = [];
      scoreRef.current += 5000;
      createParticles(playerRef.current.x, playerRef.current.y, ParticleType.TIME_DUST, 50, '#00ff00');
    } 
    else if (debugCommand === 'TOGGLE_GOD_MODE') {
      playerRef.current.godMode = !playerRef.current.godMode;
      playerRef.current.stability = 100;
      playerRef.current.integrity = 100;
      createParticles(playerRef.current.x, playerRef.current.y, ParticleType.SPARK, 30, '#ffd700');
    }
    else if (debugCommand === 'INCREASE_SPEED') {
      speedMultiplierRef.current += 0.2;
      createParticles(playerRef.current.x, playerRef.current.y, ParticleType.THRUST, 30, '#00f3ff');
    }
    else if (debugCommand === 'TOGGLE_HYPER_PROGRESS') {
      progressMultiplierRef.current = progressMultiplierRef.current > 1 ? 1.0 : 10.0;
      createParticles(playerRef.current.x, playerRef.current.y, ParticleType.GLITCH, 30, '#bc13fe');
    }

    if (onDebugCommandHandled) onDebugCommandHandled();
  }, [debugCommand]);

  const createParticles = (x:number, y:number, type:ParticleType, count:number, color:string) => {
    for(let i=0; i<count; i++) {
        const speed = type === ParticleType.THRUST ? 4 : 6;
        particlesRef.current.push({ 
            id:Math.random(), 
            type, 
            x, 
            y, 
            radius: type === ParticleType.THRUST ? Math.random()*3+1 : Math.random()*3+1, 
            vx: type === ParticleType.THRUST ? -Math.random()*speed - 2 : (Math.random()-0.5)*speed, 
            vy: type === ParticleType.THRUST ? (Math.random()-0.5)*1 : (Math.random()-0.5)*speed, 
            alpha:1, 
            color, 
            life: type === ParticleType.THRUST ? 0.4 : 1.0, 
            maxLife: type === ParticleType.THRUST ? 0.4 : 1.0 
        });
    }
  };

  const createScorePopup = (x: number, y: number, value: number, text: string) => {
     scorePopupsRef.current.push({
         id: Math.random(), x, y, value, text, life: 1.0, color: '#facc15'
     });
  };

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      
      if (gameState === GameState.MENU) soundManager.init();
      pressedKeysRef.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeysRef.current.delete(e.code);
    };
    const handleTouchStart = (e: TouchEvent) => {
       if (gameState === GameState.MENU) soundManager.init();
       const touchX = e.touches[0].clientX;
       if (touchX > window.innerWidth * 0.5) pressedKeysRef.current.add('Space');
       else pressedKeysRef.current.add('ShiftLeft'); 
    };
    const handleTouchEnd = () => {
       pressedKeysRef.current.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => { 
        window.removeEventListener('keydown', handleKeyDown); 
        window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  // Main Game Loop & Init
  useEffect(() => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.INTRO) return;

    const genLandscape = (count: number, minH: number, maxH: number) => {
        const pts = [];
        for (let i = 0; i < count; i++) {
             pts.push({ height: minH + Math.random() * (maxH - minH), type: Math.floor(Math.random() * 5) });
        }
        return pts;
    };

    if (bgLayersRef.current[0].points.length === 0) {
        bgLayersRef.current[0].points = genLandscape(100, 150, 400);
        bgLayersRef.current[1].points = genLandscape(100, 80, 200);
        bgLayersRef.current[2].points = genLandscape(100, 40, 100);
        
        matrixRainRef.current = [];
        for(let i=0; i<50; i++) {
            matrixRainRef.current.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                speed: Math.random() * 5 + 2,
                char: Math.random() > 0.5 ? '1' : '0'
            });
        }
    }

    try {
        soundManager.init();
        soundManager.reset();
    } catch(e) { console.warn("Audio init warning", e); }

    let animId: number;
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resetGame = () => {
      playerRef.current = { 
          id: 0, x: 100, y: 300, width: 80, height: 40, markedForDeletion: false, vy: 0, integrity: 100, stability: 100, maxStability: 100, 
          isTimeSlipping: false, angle: 0, isThrusting: false, godMode: false,
          combo: 1, comboTimer: 0
      };
      obstaclesRef.current = []; powerupsRef.current = []; logsRef.current = []; landmarksRef.current = []; particlesRef.current = []; scorePopupsRef.current = [];
      distanceRef.current = 0; scoreRef.current = 0; timeRef.current = TOTAL_GAME_TIME_SECONDS;
      triggeredEventsRef.current.clear(); isEndingSequenceRef.current = false; endingTimerRef.current = 0;
      lastLevelIndexRef.current = 0;
      speedMultiplierRef.current = 1.0; progressMultiplierRef.current = 1.0;
      soundManager.stopBgm();
    };

    if (gameState === GameState.INTRO || playerRef.current.integrity <= 0) resetGame();
    lastFrameTimeRef.current = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = now;
      update(dt, now);
      draw(ctx, now);

      if (gameState === GameState.INTRO) { animId = requestAnimationFrame(render); return; }

      if (playerRef.current.integrity > 0) {
          animId = requestAnimationFrame(render);
      } else {
          setGameState(GameState.GAME_OVER);
      }
    };

    const update = (dt: number, now: number) => {
      const player = playerRef.current;
      const timeScale = dt * 60;

      // 1. Inputs & Physics
      if (!isEndingSequenceRef.current) {
          if (pressedKeysRef.current.has('Space') || pressedKeysRef.current.has('ArrowUp')) {
              player.vy += THRUST_POWER * timeScale; 
              player.isThrusting = true;
              createParticles(player.x - 20, player.y + 15, ParticleType.THRUST, 1, '#f87171'); 
          } else {
              player.isThrusting = false;
          }
          
          // Time Slip Logic
          const wantsToSlip = (pressedKeysRef.current.has('ShiftLeft') || pressedKeysRef.current.has('ShiftRight') || pressedKeysRef.current.has('KeyZ'));
          
          if (wantsToSlip && player.stability > 0) {
              if (player.stability > STABILITY_MIN_ACTIVATION || player.isTimeSlipping) {
                 player.isTimeSlipping = true;
                 if (!player.godMode) player.stability -= STABILITY_DRAIN_RATE * dt;
                 createParticles(player.x + Math.random()*player.width, player.y + Math.random()*player.height, ParticleType.TIME_DUST, 1, '#06b6d4');
              } else {
                 player.isTimeSlipping = false; 
              }
          } else {
              player.isTimeSlipping = false;
              player.stability = Math.min(player.maxStability, player.stability + STABILITY_RECHARGE_RATE * dt);
          }
          if (player.stability <= 0) player.isTimeSlipping = false;

          soundManager.setPhaseVolume(player.isTimeSlipping);

          player.vy += GRAVITY * timeScale;
          player.vy = Math.min(player.vy, MAX_FALL_SPEED);
          player.y += player.vy * timeScale;
          
          const targetAngle = player.vy * 0.05;
          player.angle += (targetAngle - player.angle) * 0.1 * timeScale;

          // Bounds
          if (player.y < 0) { player.y = 0; player.vy = 0; }
          if (player.y > CANVAS_HEIGHT - 60) { player.y = CANVAS_HEIGHT - 60; player.vy = 0; }
      }

      // Combo Decay
      if (player.combo > 1) {
          player.comboTimer -= dt;
          if (player.comboTimer <= 0) {
              player.combo = 1; 
          }
      }

      // 2. Progression
      const speedMult = speedMultiplierRef.current;
      let progressRatio = distanceRef.current / VICTORY_DISTANCE;
      if (gameMode === GameMode.STORY) progressRatio = Math.min(1.02, progressRatio);

      const currentSpeed = isEndingSequenceRef.current ? BASE_SPEED * 0.5 : BASE_SPEED * speedMult;
      
      soundManager.setEnginePitch(player.isThrusting ? 0.8 : 0.2);

      let levelIndex = 0;
      const progressPercent = progressRatio * 100;
      for (let i = LEVELS.length - 1; i >= 0; i--) { if (progressPercent >= LEVEL_THRESHOLDS[i]) { levelIndex = i; break; }}
      
      if (levelIndex !== lastLevelIndexRef.current) {
          soundManager.playLevelBgm(levelIndex);
          lastLevelIndexRef.current = levelIndex;
      }
      const level = LEVELS[levelIndex] || LEVELS[0];

      if (gameMode === GameMode.STORY && progressRatio >= 0.96 && !isEndingSequenceRef.current) {
          isEndingSequenceRef.current = true;
          player.isTimeSlipping = true; 
          player.godMode = true;
          soundManager.playEndingMusic();

          const vortexExists = landmarksRef.current.some(l => l.type === 'TIME_VORTEX');
          if (!vortexExists) {
             landmarksRef.current.push({
                 id: Date.now(), x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT/2, width: 300, height: 300,
                 type: 'TIME_VORTEX', name: 'The Singularity', markedForDeletion: false
             });
             triggeredEventsRef.current.add('TIME_VORTEX');
          }
      }

      if (isEndingSequenceRef.current) {
          player.y += (CANVAS_HEIGHT/2 - player.y) * 0.05 * timeScale;
          endingTimerRef.current += dt;
          if (endingTimerRef.current > 4.0) {
               setGameState(GameState.VICTORY); onWin();
          }
      } else {
          const distanceGain = currentSpeed * timeScale * progressMultiplierRef.current;
          distanceRef.current += distanceGain;
          scoreRef.current += distanceGain * 0.1 * player.combo;
          timeRef.current -= dt;
      }

      // 3. Spawning
      if (!isEndingSequenceRef.current) {
          // Obstacles
          const spawnChance = 0.02 * level.spawnRate * timeScale;
          if (Math.random() < spawnChance && level.allowedObstacles.length > 0) {
              const types = level.allowedObstacles;
              let type = types[Math.floor(Math.random() * types.length)];
              
              let y = Math.random() * (CANVAS_HEIGHT - 100);
              let w = 50; let h = 50;
              let score = 100;
              
              if (type === 'GLITCH_ELF') {
                  w = 40; h = 40; score = 200;
              } else if (type === 'STATIC_CLOUD') {
                  h = 80; w = 120; score = 150;
              } else if (type === 'CLOCKWORK_GEAR') {
                  w = 60; h = 60; score = 300;
              } else if (type === 'DRONE_SENTINEL') {
                  w = 50; h = 40; score = 400;
              } else if (type === 'TIME_RIFT') {
                  w = 30; h = 150; score = 500;
                  y = Math.random() * (CANVAS_HEIGHT - h);
              }

              obstaclesRef.current.push({
                  id: Date.now(), x: CANVAS_WIDTH + 50, y, width: w, height: h,
                  type, markedForDeletion: false, rotation: Math.random() * Math.PI * 2,
                  scoreValue: score, stabilized: false
              });
          }
          if (Math.random() < 0.005 * timeScale) {
              const types = Object.values(PowerupType);
              powerupsRef.current.push({
                  id: Date.now(), x: CANVAS_WIDTH, y: Math.random()*(CANVAS_HEIGHT-100), width: 40, height: 40,
                  type: types[Math.floor(Math.random()*types.length)], floatOffset: 0, markedForDeletion: false
              });
          }
      }

      // Narrative Spawning
      if (gameMode === GameMode.STORY) {
         STORY_MOMENTS.forEach(m => {
             if (progressRatio >= m.progress && !triggeredEventsRef.current.has(m.dialogue.id)) {
                 triggeredEventsRef.current.add(m.dialogue.id);
                 activeDialogueRef.current = m.dialogue;
                 setTimeout(() => { if (activeDialogueRef.current?.id === m.dialogue.id) activeDialogueRef.current = null; }, 6000);
             }
         });
         LANDMARKS.forEach(lm => {
             if (progressRatio >= lm.progress && !triggeredEventsRef.current.has(lm.type) && lm.type !== 'TIME_VORTEX') {
                 triggeredEventsRef.current.add(lm.type);
                 landmarksRef.current.push({
                     id: Date.now(), x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT/2, width: 300, height: 300,
                     type: lm.type, name: lm.name, markedForDeletion: false
                 });
             }
         });
      }

      // 4. Collisions
      
      obstaclesRef.current.forEach(obs => {
          obs.x -= currentSpeed * level.obstacleSpeed * timeScale;
          if (obs.x < -100) obs.markedForDeletion = true;
          if (obs.type === 'CLOCKWORK_GEAR' || obs.type === 'GLITCH_ELF') obs.rotation! += 0.05 * timeScale;
          
          if (obs.type === 'DRONE_SENTINEL') {
              obs.y += (player.y - obs.y) * 0.02 * timeScale;
          }

          // Player vs Obstacle Collision
          if (!obs.markedForDeletion && checkCollision(player, obs)) {
              if (player.isTimeSlipping || player.godMode) {
                  // Stabilize
                  if (!obs.stabilized) {
                      obs.stabilized = true;
                      soundManager.playScanSuccess();
                      createParticles(obs.x + obs.width/2, obs.y + obs.height/2, ParticleType.GLITCH, 8, '#06b6d4');
                      
                      // Reward
                      player.stability = Math.min(player.maxStability, player.stability + STABILITY_RESTORE_REWARD);
                      
                      player.combo = Math.min(50, player.combo + 1);
                      player.comboTimer = COMBO_DECAY;
                      const val = obs.scoreValue * player.combo;
                      scoreRef.current += val;
                      createScorePopup(player.x, player.y - 20, val, `STABILIZED ${player.combo}x`);
                  }
              } else {
                  // Collision Damage
                  player.integrity -= 20;
                  soundManager.playDamage();
                  shakeRef.current = 20;
                  obs.markedForDeletion = true;
                  // Reset Combo
                  if (player.combo > 1) {
                      createScorePopup(player.x, player.y - 20, 0, "CHAIN BROKEN");
                      player.combo = 1;
                  }
                  createParticles(player.x + 20, player.y + 10, ParticleType.SPARK, 15, '#f87171');
              }
          }
      });

      // Powerups
      powerupsRef.current.forEach(p => {
          p.x -= currentSpeed * timeScale;
          p.floatOffset += 0.05 * timeScale;
          if (checkCollision(player, p)) {
              p.markedForDeletion = true;
              soundManager.playCollectData();
              createParticles(p.x, p.y, ParticleType.GLITCH, 10, POWERUP_COLORS[p.type]);
              if (p.type === PowerupType.CHRONO_BOOST) player.stability = Math.min(player.maxStability, player.stability + 50);
              if (p.type === PowerupType.HULL_REPAIR) player.integrity = Math.min(100, player.integrity + 30);
              if (p.type === PowerupType.DATA_FRAGMENT) scoreRef.current += 1000;
              if (p.type === PowerupType.TIME_FREEZE) player.stability = player.maxStability; 
              createScorePopup(p.x, p.y, 500, p.type);
          }
      });

      // Environment
      landmarksRef.current.forEach(l => { l.x -= currentSpeed * timeScale; });

      // Particles
      particlesRef.current.forEach(p => {
          p.life -= dt;
          p.x += p.vx * timeScale;
          p.y += p.vy * timeScale;
      });
      
      // Score Popups
      scorePopupsRef.current.forEach(p => {
          p.life -= dt;
          p.y -= 1 * timeScale; // Float up
      });

      // Matrix Rain
      matrixRainRef.current.forEach(r => {
          r.y += r.speed * timeScale;
          if (r.y > CANVAS_HEIGHT) r.y = -10;
          // Randomly change char
          if (Math.random() < 0.1) r.char = Math.random() > 0.5 ? '1' : '0';
      });

      // Cleanup
      obstaclesRef.current = obstaclesRef.current.filter(e => !e.markedForDeletion);
      powerupsRef.current = powerupsRef.current.filter(e => !e.markedForDeletion);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      scorePopupsRef.current = scorePopupsRef.current.filter(p => p.life > 0);

      if (shakeRef.current > 0) shakeRef.current *= 0.9;

      if (now % 100 < 20) {
          setHudState({ 
            integrity: player.integrity, stability: player.stability, isTimeSlipping: player.isTimeSlipping,
            progress: progressPercent, timeLeft: timeRef.current, levelIndex, score: scoreRef.current,
            activeDialogue: activeDialogueRef.current, activeLog: activeLogRef.current,
            combo: player.combo
          });
      }
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, color: string, speed: number) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.2;
        
        const perspective = 0.5;
        const offset = (distanceRef.current * speed) % 50;

        ctx.beginPath();
        // Horizontal lines moving
        for(let i=0; i<CANVAS_HEIGHT; i+=40) {
             const y = i;
             ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y);
        }
        // Vertical lines (perspective)
        for(let i=-200; i<CANVAS_WIDTH+200; i+=80) {
            const x = i - offset;
            ctx.moveTo(x, 0); ctx.lineTo(x - (CANVAS_WIDTH/2 - x)*perspective, CANVAS_HEIGHT);
        }
        ctx.stroke();
        ctx.restore();
    };

    const draw = (ctx: CanvasRenderingContext2D, now: number) => {
        const levelIndex = Math.max(0, lastLevelIndexRef.current);
        const level = LEVELS[levelIndex] || LEVELS[0];
        
        // 1. Dynamic Sky Gradient
        const grad = ctx.createLinearGradient(0,0,0,CANVAS_HEIGHT);
        grad.addColorStop(0, level.colors.sky[0]); grad.addColorStop(1, level.colors.sky[1]);
        ctx.fillStyle = grad; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

        // Matrix Rain
        ctx.save();
        ctx.fillStyle = level.colors.grid;
        ctx.font = '10px monospace';
        ctx.globalAlpha = 0.2;
        matrixRainRef.current.forEach(r => {
            ctx.fillText(r.char, r.x, r.y);
        });
        ctx.restore();

        // 2. Grid Floor
        drawGrid(ctx, level.colors.grid, 0.5);

        // 3. Parallax Landscape (Glitch Mountains)
        bgLayersRef.current.forEach((layer, i) => {
            ctx.save();
            ctx.fillStyle = layer.color; // Using black mostly now
            
            // Only draw for layers with points
            if (layer.points.length > 0) {
                const blockWidth = 50 + i * 30; 
                const points = layer.points as any[];
                const scrollPos = (distanceRef.current * layer.speedModifier) % (points.length * blockWidth);
                const startIndex = Math.floor(scrollPos / blockWidth);
                const offset = scrollPos % blockWidth;

                ctx.beginPath();
                ctx.moveTo(-blockWidth, CANVAS_HEIGHT);
                
                for (let j = 0; j < Math.ceil(CANVAS_WIDTH / blockWidth) + 2; j++) {
                    const idx = (startIndex + j) % points.length;
                    const b = points[idx];
                    if (!b) continue;
                    
                    let h = b.height;
                    // Glitch effect on mountains
                    if (Math.random() < 0.01) h += Math.random() * 50 - 25;

                    const x = j * blockWidth - offset;
                    ctx.lineTo(x, CANVAS_HEIGHT - h);
                    ctx.lineTo(x + blockWidth, CANVAS_HEIGHT - h);
                }
                ctx.lineTo(CANVAS_WIDTH + blockWidth, CANVAS_HEIGHT);
                ctx.fill();
                
                // Neon outline
                ctx.strokeStyle = level.colors.grid;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            ctx.restore();
        });

        // 5. Entities
        ctx.save();
        const dx = (Math.random()-0.5)*shakeRef.current; const dy = (Math.random()-0.5)*shakeRef.current;
        ctx.translate(dx, dy);

        landmarksRef.current.forEach(l => drawLandmark(ctx, l));
        obstaclesRef.current.forEach(o => drawObstacle(ctx, o, now));
        powerupsRef.current.forEach(p => drawPowerup(ctx, p));

        drawPlayer(ctx, playerRef.current);
        
        particlesRef.current.forEach(p => drawParticle(ctx, p));
        scorePopupsRef.current.forEach(p => drawScorePopup(ctx, p));

        ctx.restore();

        // Vignette & Scanlines
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        for(let y=0; y<CANVAS_HEIGHT; y+=2) {
            ctx.fillRect(0, y, CANVAS_WIDTH, 1);
        }
        ctx.restore();
    };

    const drawScorePopup = (ctx: CanvasRenderingContext2D, s: ScorePopup) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 10;
        ctx.font = 'bold 20px Orbitron';
        ctx.fillText(s.text || `+${s.value}`, s.x, s.y);
        ctx.restore();
    };

    const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        
        ctx.fillStyle = p.color;
        if (p.type === ParticleType.GLITCH) {
             ctx.fillRect(p.x, p.y, p.radius*2, p.radius*2);
        } else {
             ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
        ctx.save(); ctx.translate(p.x + p.width/2, p.y + p.height/2); ctx.rotate(p.angle);
        
        // Time Slip Visuals
        if (p.isTimeSlipping) {
             ctx.globalAlpha = 0.5;
             ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 20;
             // Draw "Afterimages"
             ctx.fillStyle = "rgba(6, 182, 212, 0.3)";
             ctx.fillRect(-50, -20, 100, 40);
        } else {
             ctx.globalAlpha = 1.0;
             ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 10;
        }

        // Santa's Sleigh (Red & Gold)
        ctx.fillStyle = "#991b1b"; // Deep Red
        
        // Sleigh Body
        ctx.beginPath(); 
        ctx.moveTo(30, -10); 
        ctx.lineTo(-40, -10);
        ctx.quadraticCurveTo(-50, 0, -40, 20);
        ctx.lineTo(20, 20);
        ctx.quadraticCurveTo(40, 0, 30, -10);
        ctx.fill();

        // Gold Trim
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 2;
        ctx.stroke();

        // Santa Sprite
        ctx.fillStyle = "#fff"; // Beard
        ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ef4444"; // Hat
        ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, -30); ctx.fill();

        // Magic Thrusters (Time Engine)
        if (p.isThrusting) {
            ctx.fillStyle = p.isTimeSlipping ? "#06b6d4" : "#f59e0b";
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.ellipse(-45, 10, 10, 5, 0, 0, Math.PI*2);
            ctx.fill();
        }

        // Reindeer (Simplified holographic projections maybe?)
        ctx.strokeStyle = "#ffffff"; ctx.globalAlpha = 0.4;
        ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(70, 0); ctx.stroke();

        ctx.restore();
    };

    const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle, now: number) => {
        ctx.save(); ctx.translate(o.x + o.width/2, o.y + o.height/2);
        
        if (o.stabilized) {
            ctx.globalAlpha = 0.3;
            ctx.strokeStyle = "#06b6d4";
            ctx.strokeRect(-o.width/2, -o.height/2, o.width, o.height);
            ctx.restore();
            return;
        }

        if (o.type === 'CLOCKWORK_GEAR') {
             ctx.rotate(o.rotation || 0);
             ctx.fillStyle = "#b45309"; // Bronze
             ctx.beginPath();
             const outerRadius = o.width/2;
             const innerRadius = o.width/2 - 5;
             const holeRadius = 10;
             const teeth = 8;
             for (let i = 0; i < teeth * 2; i++) {
                const angle = (Math.PI * 2 * i) / (teeth * 2);
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
             }
             ctx.closePath();
             ctx.fill();
             ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(0,0, holeRadius, 0, Math.PI*2); ctx.fill();

        } else if (o.type === 'TIME_RIFT') {
             // Purple crack
             const h = o.height;
             ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 20;
             ctx.strokeStyle = "#d8b4fe"; ctx.lineWidth = 3;
             ctx.beginPath();
             ctx.moveTo(0, -h/2);
             for(let i=0; i<10; i++) {
                 ctx.lineTo((Math.random()-0.5)*20, -h/2 + (h/10)*i);
             }
             ctx.lineTo(0, h/2);
             ctx.stroke();

        } else if (o.type === 'DRONE_SENTINEL') {
            ctx.fillStyle = "#1e293b";
            ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#ef4444"; ctx.shadowColor="#ef4444"; ctx.shadowBlur=10;
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI*2); ctx.fill(); // Red Eye

        } else if (o.type === 'GLITCH_ELF') {
            // Distorted Elf
            ctx.rotate(o.rotation || 0);
            ctx.fillStyle = Math.random() > 0.5 ? "#166534" : "#ff00ff"; // Flashing color
            ctx.fillRect(-15, -15, 30, 30);
            // Glitch rects
            ctx.fillStyle = "#000";
            ctx.fillRect(Math.random()*20 - 10, Math.random()*20 - 10, 10, 2);

        } else if (o.type === 'STATIC_CLOUD') {
             const w = o.width; const h = o.height;
             const grad = ctx.createRadialGradient(0,0, 0, 0,0, w/2);
             grad.addColorStop(0, "#ffffff"); grad.addColorStop(1, "transparent");
             ctx.fillStyle = grad;
             ctx.globalAlpha = 0.5;
             ctx.beginPath(); ctx.arc(0,0, w/2, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    const drawLandmark = (ctx: CanvasRenderingContext2D, lm: Landmark) => {
        ctx.save(); ctx.translate(lm.x, lm.y - 150);
        if (lm.type === 'TIME_VORTEX') {
            ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 80;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
            const t = Date.now() / 1000;
            ctx.rotate(t);
            // Spiral
            ctx.beginPath();
            for (let i = 0; i < 100; i++) {
              const angle = 0.1 * i;
              const x = (1 + angle) * Math.cos(angle);
              const y = (1 + angle) * Math.sin(angle);
              ctx.lineTo(x, y);
            }
            ctx.stroke();
            
        } else if (lm.type === 'CLOCK_TOWER') {
            ctx.fillStyle = "#1e1b4b"; // Dark Indigo
            ctx.fillRect(-40, 0, 80, 400);
            // Clock Face
            ctx.fillStyle = "#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=20;
            ctx.beginPath(); ctx.arc(0, 50, 30, 0, Math.PI*2); ctx.fill();
            // Hands
            ctx.strokeStyle = "#000"; ctx.lineWidth=3;
            ctx.beginPath(); ctx.moveTo(0,50); ctx.lineTo(0, 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0,50); ctx.lineTo(15, 50); ctx.stroke();

        } else if (lm.type === 'NEON_FACTORY') {
            ctx.fillStyle = "#020617";
            ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2;
            ctx.fillRect(-150, 100, 300, 200);
            ctx.strokeRect(-150, 100, 300, 200);
            // Neon sign
            ctx.fillStyle = "#06b6d4";
            ctx.font = "20px Orbitron";
            ctx.fillText("SANTA_CORP", -80, 150);
        }
        ctx.restore();
    };

    const drawPowerup = (ctx: CanvasRenderingContext2D, p: Powerup) => {
        const color = POWERUP_COLORS[p.type] || '#ffffff';
        const cx = p.x + p.width/2; 
        const cy = p.y + p.height/2 + Math.sin(p.floatOffset)*5;
        
        ctx.save();
        ctx.translate(cx, cy);
        
        ctx.shadowColor = color; ctx.shadowBlur = 30;
        ctx.fillStyle = color;
        
        if (p.type === PowerupType.CHRONO_BOOST) {
            // Hourglass shape
            ctx.beginPath(); ctx.moveTo(-10,-10); ctx.lineTo(10,-10); ctx.lineTo(0,0); ctx.lineTo(10,10); ctx.lineTo(-10,10); ctx.lineTo(0,0); ctx.fill();
        } else if (p.type === PowerupType.HULL_REPAIR) {
            // Cross
            ctx.fillRect(-5, -15, 10, 30); ctx.fillRect(-15, -5, 30, 10);
        } else {
             ctx.beginPath(); ctx.arc(0,0, 10, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
    };

    const checkCollision = (r1: Entity, r2: Entity) => (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y);
    
    animId = requestAnimationFrame(render);
    return () => { 
        cancelAnimationFrame(animId);
        soundManager.stopBgm();
    };
  }, [gameState]);

  return (
    <div className="relative w-full h-full max-w-[1200px] max-h-[600px] mx-auto border-4 border-red-900/50 shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden bg-[#000000] rounded-lg">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full" />
      <UIOverlay {...hudState} currentLevelName={LEVELS[hudState.levelIndex].name} currentLevelSub={LEVELS[hudState.levelIndex].subtext} />
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 2px)' }}></div>
    </div>
  );
};
export default GameCanvas;