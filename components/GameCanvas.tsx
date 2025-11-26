
import React, { useEffect, useRef, useState } from 'react';
import { 
  GameState, Player, Obstacle, Powerup, DataLog, Particle, ParticleType, PowerupType, Entity, BackgroundLayer, DialogueLine, GameMode, Landmark, DebugCommand, ScorePopup, ObstacleType, BackgroundPoint
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
  const landmarksRef = useRef<Landmark[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scorePopupsRef = useRef<ScorePopup[]>([]);
  
  // Visuals
  const bgLayersRef = useRef<BackgroundLayer[]>([
    { points: [], color: '#000000', speedModifier: 0.1, offset: 0, type: 'MOUNTAINS' }, 
    { points: [], color: '#000000', speedModifier: 0.3, offset: 0, type: 'CITY' },  
    { points: [], color: '#000000', speedModifier: 0.8, offset: 0, type: 'HILLS' },  
  ]);
  const starsRef = useRef<{x:number, y:number, size:number, opacity:number}[]>([]);
  const snowRef = useRef<{x:number, y:number, r:number, speed:number, swing:number}[]>([]);
  
  // Logic
  const shakeRef = useRef(0);
  const isEndingSequenceRef = useRef(false);
  const endingTimerRef = useRef(0);
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

  // Handle Debug
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
    }
    else if (debugCommand === 'TOGGLE_HYPER_PROGRESS') {
      progressMultiplierRef.current = progressMultiplierRef.current > 1 ? 1.0 : 10.0;
    }
    if (onDebugCommandHandled) onDebugCommandHandled();
  }, [debugCommand]);

  const createParticles = (x:number, y:number, type:ParticleType, count:number, color:string) => {
    for(let i=0; i<count; i++) {
        const speed = type === ParticleType.THRUST ? 4 : 6;
        particlesRef.current.push({ 
            id:Math.random(), type, x, y, 
            radius: type === ParticleType.SNOW ? Math.random()*2+1 : Math.random()*3+1, 
            vx: type === ParticleType.THRUST ? -Math.random()*speed - 2 : (Math.random()-0.5)*speed, 
            vy: type === ParticleType.THRUST ? (Math.random()-0.5)*1 : (Math.random()-0.5)*speed, 
            alpha:1, color, 
            life: type === ParticleType.THRUST ? 0.4 : 1.0, 
            maxLife: type === ParticleType.THRUST ? 0.4 : 1.0 
        });
    }
  };

  const createScorePopup = (x: number, y: number, value: number, text: string) => {
     scorePopupsRef.current.push({ id: Math.random(), x, y, value, text, life: 1.0, color: '#facc15' });
  };

  // --- Controls ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if(['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
      if (gameState === GameState.MENU) soundManager.init();
      pressedKeysRef.current.add(e.code);
    };
    const handleKeyUp = (e: KeyboardEvent) => { pressedKeysRef.current.delete(e.code); };
    const handleTouchStart = (e: TouchEvent) => {
       if (gameState === GameState.MENU) soundManager.init();
       if (e.touches[0].clientX > window.innerWidth * 0.5) pressedKeysRef.current.add('Space');
       else pressedKeysRef.current.add('ShiftLeft'); 
    };
    const handleTouchEnd = () => { pressedKeysRef.current.clear(); };

    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouchStart); window.addEventListener('touchend', handleTouchEnd);
    return () => { 
        window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp);
        window.removeEventListener('touchstart', handleTouchStart); window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameState]);

  // Main Game Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING && gameState !== GameState.INTRO) return;

    // --- Background Generation ---
    const generateBackgroundSegment = (type: 'MOUNTAINS' | 'CITY' | 'HILLS', count: number): BackgroundPoint[] => {
        const points: BackgroundPoint[] = [];
        let h = 0;
        
        if (type === 'MOUNTAINS') {
            h = 200;
            for(let i=0; i<count; i++) {
                h += (Math.random() - 0.5) * 50;
                h = Math.max(100, Math.min(350, h));
                points.push({ height: h, isBuilding: false, hasWindows: false });
            }
        } else if (type === 'CITY') {
            // City generation: blocks of heights
            let currentHeight = 150;
            let widthLeft = 0;
            let isGap = false;
            
            for(let i=0; i<count; i++) {
                if (widthLeft <= 0) {
                    isGap = Math.random() > 0.7; // 30% chance of gap
                    if (isGap) {
                        currentHeight = 50; // Low ground
                        widthLeft = Math.floor(Math.random() * 5) + 2;
                    } else {
                        currentHeight = 150 + Math.random() * 150; // Tall building
                        widthLeft = Math.floor(Math.random() * 8) + 4;
                    }
                }
                points.push({ 
                    height: currentHeight, 
                    isBuilding: !isGap, 
                    hasWindows: !isGap && Math.random() > 0.1 
                });
                widthLeft--;
            }
        } else {
            // Hills (Smooth)
            h = 50;
            for(let i=0; i<count; i++) {
                h += (Math.random() - 0.5) * 15;
                h = Math.max(20, Math.min(100, h));
                points.push({ height: h, isBuilding: false, hasWindows: false });
            }
        }
        return points;
    };

    if (bgLayersRef.current[0].points.length === 0) {
        bgLayersRef.current[0].points = generateBackgroundSegment('MOUNTAINS', 150);
        bgLayersRef.current[1].points = generateBackgroundSegment('CITY', 150);
        bgLayersRef.current[2].points = generateBackgroundSegment('HILLS', 150);
        
        snowRef.current = [];
        for(let i=0; i<200; i++) {
            snowRef.current.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                r: Math.random() * 2 + 0.5,
                speed: Math.random() * 2 + 1,
                swing: Math.random() * Math.PI
            });
        }
        
        starsRef.current = [];
        for(let i=0; i<150; i++) {
            starsRef.current.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * CANVAS_HEIGHT,
                size: Math.random() * 2,
                opacity: Math.random()
            });
        }
    }

    try { soundManager.init(); soundManager.reset(); } catch(e) {}

    let animId: number;
    const ctx = canvasRef.current?.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resetGame = () => {
      playerRef.current = { 
          id: 0, x: 100, y: 300, width: 80, height: 40, markedForDeletion: false, vy: 0, integrity: 100, stability: 100, maxStability: 100, 
          isTimeSlipping: false, angle: 0, isThrusting: false, godMode: false, combo: 1, comboTimer: 0
      };
      obstaclesRef.current = []; powerupsRef.current = []; landmarksRef.current = []; particlesRef.current = []; scorePopupsRef.current = [];
      distanceRef.current = 0; scoreRef.current = 0; timeRef.current = TOTAL_GAME_TIME_SECONDS;
      triggeredEventsRef.current.clear(); isEndingSequenceRef.current = false; endingTimerRef.current = 0;
      lastLevelIndexRef.current = 0; speedMultiplierRef.current = 1.0; progressMultiplierRef.current = 1.0;
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
      if (playerRef.current.integrity > 0) animId = requestAnimationFrame(render);
      else setGameState(GameState.GAME_OVER);
    };

    const update = (dt: number, now: number) => {
      const player = playerRef.current;
      const timeScale = dt * 60;

      // Physics
      if (!isEndingSequenceRef.current) {
          if (pressedKeysRef.current.has('Space') || pressedKeysRef.current.has('ArrowUp')) {
              player.vy += THRUST_POWER * timeScale; 
              player.isThrusting = true;
              createParticles(player.x - 20, player.y + 15, ParticleType.THRUST, 1, '#f87171'); 
          } else {
              player.isThrusting = false;
          }
          
          const wantsToSlip = (pressedKeysRef.current.has('ShiftLeft') || pressedKeysRef.current.has('ShiftRight') || pressedKeysRef.current.has('KeyZ'));
          if (wantsToSlip && player.stability > 0) {
              if (player.stability > STABILITY_MIN_ACTIVATION || player.isTimeSlipping) {
                 player.isTimeSlipping = true;
                 if (!player.godMode) player.stability -= STABILITY_DRAIN_RATE * dt;
                 createParticles(player.x + Math.random()*player.width, player.y + Math.random()*player.height, ParticleType.TIME_DUST, 1, '#06b6d4');
              } else { player.isTimeSlipping = false; }
          } else {
              player.isTimeSlipping = false;
              player.stability = Math.min(player.maxStability, player.stability + STABILITY_RECHARGE_RATE * dt);
          }
          if (player.stability <= 0) player.isTimeSlipping = false;
          soundManager.setPhaseVolume(player.isTimeSlipping);

          player.vy += GRAVITY * timeScale;
          player.vy = Math.min(player.vy, MAX_FALL_SPEED);
          player.y += player.vy * timeScale;
          player.angle += (player.vy * 0.05 - player.angle) * 0.1 * timeScale;

          if (player.y < 0) { player.y = 0; player.vy = 0; }
          if (player.y > CANVAS_HEIGHT - 60) { player.y = CANVAS_HEIGHT - 60; player.vy = 0; }
      }

      if (player.combo > 1) {
          player.comboTimer -= dt;
          if (player.comboTimer <= 0) player.combo = 1; 
      }

      // Progression
      let progressRatio = distanceRef.current / VICTORY_DISTANCE;
      if (gameMode === GameMode.STORY) progressRatio = Math.min(1.02, progressRatio);

      const currentSpeed = isEndingSequenceRef.current ? BASE_SPEED * 0.5 : BASE_SPEED * speedMultiplierRef.current;
      soundManager.setEnginePitch(player.isThrusting ? 0.8 : 0.2);

      let levelIndex = 0;
      const progressPercent = progressRatio * 100;
      for (let i = LEVELS.length - 1; i >= 0; i--) { if (progressPercent >= LEVEL_THRESHOLDS[i]) { levelIndex = i; break; }}
      
      if (levelIndex !== lastLevelIndexRef.current) {
          soundManager.playLevelBgm(LEVELS[levelIndex].musicTrack);
          lastLevelIndexRef.current = levelIndex;
      }
      const level = LEVELS[levelIndex];

      if (gameMode === GameMode.STORY && progressRatio >= 0.96 && !isEndingSequenceRef.current) {
          isEndingSequenceRef.current = true;
          player.isTimeSlipping = true; 
          player.godMode = true;
          soundManager.playEndingMusic();
          if (!landmarksRef.current.some(l => l.type === 'TIME_VORTEX')) {
             landmarksRef.current.push({
                 id: Date.now(), x: CANVAS_WIDTH + 100, y: CANVAS_HEIGHT/2, width: 300, height: 300,
                 type: 'TIME_VORTEX', name: 'The Singularity', markedForDeletion: false
             });
          }
      }

      if (isEndingSequenceRef.current) {
          player.y += (CANVAS_HEIGHT/2 - player.y) * 0.05 * timeScale;
          endingTimerRef.current += dt;
          if (endingTimerRef.current > 4.0) { setGameState(GameState.VICTORY); onWin(); }
      } else {
          distanceRef.current += currentSpeed * timeScale * progressMultiplierRef.current;
          scoreRef.current += currentSpeed * timeScale * 0.1 * player.combo;
          timeRef.current -= dt;
      }

      // Spawning
      if (!isEndingSequenceRef.current) {
          if (Math.random() < 0.02 * level.spawnRate * timeScale && level.allowedObstacles.length > 0) {
              const type = level.allowedObstacles[Math.floor(Math.random() * level.allowedObstacles.length)];
              let y = Math.random() * (CANVAS_HEIGHT - 100);
              let w = 50, h = 50, score = 100;
              
              if (['GLITCH_ELF','SNOWMAN'].includes(type)) { w=40; h=60; score=200; }
              else if (type === 'STATIC_CLOUD') { h=80; w=120; score=150; }
              else if (type === 'TIME_RIFT') { w=30; h=150; score=500; y = Math.random()*(CANVAS_HEIGHT-h); }
              else if (type === 'DECORATED_TREE') { w=80; h=120; score=100; y = CANVAS_HEIGHT-150; }
              else if (type === 'FESTIVE_ARCH') { w=50; h=200; score=250; y = Math.random()>0.5 ? 0 : CANVAS_HEIGHT-200; }

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

      // Collisions & Updates
      obstaclesRef.current.forEach(obs => {
          obs.x -= currentSpeed * level.obstacleSpeed * timeScale;
          if (obs.x < -100) obs.markedForDeletion = true;
          if (['CLOCKWORK_GEAR','GLITCH_ELF'].includes(obs.type)) obs.rotation! += 0.05 * timeScale;
          if (obs.type === 'DRONE_SENTINEL') obs.y += (player.y - obs.y) * 0.02 * timeScale;

          if (!obs.markedForDeletion && checkCollision(player, obs)) {
              if (player.isTimeSlipping || player.godMode) {
                  if (!obs.stabilized) {
                      obs.stabilized = true;
                      soundManager.playScanSuccess();
                      createParticles(obs.x + obs.width/2, obs.y + obs.height/2, ParticleType.GLITCH, 8, '#06b6d4');
                      player.stability = Math.min(player.maxStability, player.stability + STABILITY_RESTORE_REWARD);
                      player.combo = Math.min(50, player.combo + 1);
                      player.comboTimer = COMBO_DECAY;
                      scoreRef.current += obs.scoreValue * player.combo;
                      createScorePopup(player.x, player.y - 20, obs.scoreValue * player.combo, `${player.combo}x`);
                  }
              } else {
                  player.integrity -= 20;
                  soundManager.playDamage();
                  shakeRef.current = 20;
                  obs.markedForDeletion = true;
                  player.combo = 1;
                  createParticles(player.x + 20, player.y + 10, ParticleType.SPARK, 15, '#f87171');
              }
          }
      });

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
              createScorePopup(p.x, p.y, 500, "DATA");
          }
      });

      landmarksRef.current.forEach(l => { l.x -= currentSpeed * timeScale; });
      particlesRef.current.forEach(p => { p.life -= dt; p.x += p.vx * timeScale; p.y += p.vy * timeScale; });
      scorePopupsRef.current.forEach(p => { p.life -= dt; p.y -= 1 * timeScale; });
      snowRef.current.forEach(s => { s.y += s.speed * timeScale; s.x += Math.sin(s.swing += 0.05 * timeScale) * 0.5; if (s.y > CANVAS_HEIGHT) s.y = -5; if (s.x > CANVAS_WIDTH) s.x = 0; });

      obstaclesRef.current = obstaclesRef.current.filter(e => !e.markedForDeletion);
      powerupsRef.current = powerupsRef.current.filter(e => !e.markedForDeletion);
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      scorePopupsRef.current = scorePopupsRef.current.filter(p => p.life > 0);

      if (shakeRef.current > 0) shakeRef.current *= 0.9;
      if (now % 100 < 20) setHudState({ integrity: player.integrity, stability: player.stability, isTimeSlipping: player.isTimeSlipping, progress: progressPercent, timeLeft: timeRef.current, levelIndex, score: scoreRef.current, activeDialogue: activeDialogueRef.current, activeLog: activeLogRef.current, combo: player.combo });
    };

    // --- Drawing Functions ---

    const drawAurora = (ctx: CanvasRenderingContext2D, colors: [string, string], intensity: number, time: number) => {
        ctx.save();
        ctx.globalAlpha = 0.6 * (1 - intensity * 0.5); // Fades a bit if glitchy
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT / 2);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;

        // Draw flowing curves
        ctx.beginPath();
        ctx.moveTo(0, 100);
        for (let i = 0; i <= CANVAS_WIDTH; i += 50) {
            const y = 100 + Math.sin(i * 0.005 + time * 0.001) * 50 + Math.sin(i * 0.01 + time * 0.002) * 30;
            ctx.lineTo(i, y);
        }
        ctx.lineTo(CANVAS_WIDTH, 0);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Second Layer
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(0, 50);
        for (let i = 0; i <= CANVAS_WIDTH; i += 60) {
            const y = 80 + Math.cos(i * 0.004 - time * 0.001) * 60;
            ctx.lineTo(i, y);
        }
        ctx.lineTo(CANVAS_WIDTH, 0);
        ctx.lineTo(0, 0);
        ctx.fillStyle = colors[1];
        ctx.fill();

        ctx.restore();
    };

    const drawBackgroundLayers = (ctx: CanvasRenderingContext2D, level: typeof LEVELS[0]) => {
        bgLayersRef.current.forEach((layer, i) => {
            ctx.save();
            
            // Choose color based on type
            if (layer.type === 'MOUNTAINS') ctx.fillStyle = level.colors.mountains;
            else if (layer.type === 'CITY') ctx.fillStyle = level.colors.city;
            else ctx.fillStyle = level.colors.ground;

            // Parallax Scroll calculation
            const blockWidth = 50;
            const points = layer.points;
            if (points.length === 0) return;

            const scrollPos = (distanceRef.current * layer.speedModifier) % (points.length * blockWidth);
            const startIndex = Math.floor(scrollPos / blockWidth);
            const offset = scrollPos % blockWidth;

            ctx.beginPath();
            ctx.moveTo(-blockWidth, CANVAS_HEIGHT); // Start bottom-left offscreen

            for (let j = 0; j < Math.ceil(CANVAS_WIDTH / blockWidth) + 2; j++) {
                const idx = (startIndex + j) % points.length;
                const point = points[idx];
                const x = j * blockWidth - offset;
                const nextX = (j + 1) * blockWidth - offset;

                if (layer.type === 'CITY') {
                    // Step function for buildings
                    ctx.lineTo(x, CANVAS_HEIGHT - point.height);
                    ctx.lineTo(nextX, CANVAS_HEIGHT - point.height);
                } else if (layer.type === 'MOUNTAINS') {
                     // Jagged peaks
                     ctx.lineTo(x + blockWidth/2, CANVAS_HEIGHT - point.height);
                } else {
                     // Smooth hills
                     ctx.lineTo(x, CANVAS_HEIGHT - point.height);
                }
            }

            ctx.lineTo(CANVAS_WIDTH + blockWidth, CANVAS_HEIGHT);
            ctx.closePath();
            ctx.fill();

            // Draw Windows for City Layer
            if (layer.type === 'CITY') {
                ctx.fillStyle = level.glitchIntensity > 0.5 ? '#ef4444' : '#fbbf24'; // Red if glitch, Gold if normal
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = level.glitchIntensity > 0.5 ? 5 : 10;
                
                for (let j = 0; j < Math.ceil(CANVAS_WIDTH / blockWidth) + 2; j++) {
                    const idx = (startIndex + j) % points.length;
                    const point = points[idx];
                    
                    if (point.isBuilding && point.hasWindows) {
                         const x = j * blockWidth - offset;
                         const h = point.height;
                         
                         // Simple grid of windows
                         const rows = Math.floor(h / 30);
                         const cols = 2; 
                         
                         // Flickering logic
                         if (Math.random() > 0.95) continue; 

                         for(let r=1; r<rows; r++) {
                             for(let c=0; c<cols; c++) {
                                 const wx = x + 10 + c * 20;
                                 const wy = CANVAS_HEIGHT - h + 10 + r * 25;
                                 if (wy < CANVAS_HEIGHT - 10) {
                                     ctx.fillRect(wx, wy, 8, 12);
                                 }
                             }
                         }
                    }
                }
            }

            ctx.restore();
        });
    };

    const drawGrid = (ctx: CanvasRenderingContext2D, color: string) => {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.1;
        const perspective = 0.5;
        const offset = (distanceRef.current * 0.5) % 50;
        ctx.beginPath();
        // Floor Grid only
        for(let i=-200; i<CANVAS_WIDTH+200; i+=100) {
            const x = i - offset;
            ctx.moveTo(x, CANVAS_HEIGHT/2); // Horizon
            ctx.lineTo(x - (CANVAS_WIDTH/2 - x)*perspective, CANVAS_HEIGHT);
        }
        ctx.stroke();
        ctx.restore();
    };

    const draw = (ctx: CanvasRenderingContext2D, now: number) => {
        const level = LEVELS[Math.max(0, lastLevelIndexRef.current)];
        
        // Sky Gradient
        const grad = ctx.createLinearGradient(0,0,0,CANVAS_HEIGHT);
        grad.addColorStop(0, level.colors.sky[0]); 
        grad.addColorStop(1, level.colors.sky[1]);
        ctx.fillStyle = grad; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

        // Aurora
        drawAurora(ctx, level.colors.aurora, level.glitchIntensity, now);

        // Stars
        ctx.save();
        ctx.fillStyle = "#fff";
        starsRef.current.forEach(s => {
            const twinkle = Math.sin(now * 0.005 + s.x) * 0.5 + 0.5;
            ctx.globalAlpha = s.opacity * twinkle; 
            ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
        });
        ctx.restore();

        // Environment Layers
        drawBackgroundLayers(ctx, level);

        // Grid overlay on ground
        drawGrid(ctx, level.colors.grid);

        // Snow/Particles
        if (level.glitchIntensity < 0.6) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.globalAlpha = 0.4;
            snowRef.current.forEach(s => {
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
            });
            ctx.restore();
        }

        // Camera Shake
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

        // Overlay FX (Vignette)
        ctx.save();
        const vigIntensity = 0.3 + (level.glitchIntensity * 0.2);
        const rad = ctx.createRadialGradient(CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT/2, CANVAS_WIDTH/2, CANVAS_HEIGHT/2, CANVAS_HEIGHT);
        rad.addColorStop(0, "transparent");
        rad.addColorStop(1, `rgba(0,0,0,${vigIntensity})`);
        ctx.fillStyle = rad;
        ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
        ctx.restore();
    };

    const drawScorePopup = (ctx: CanvasRenderingContext2D, s: ScorePopup) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color; ctx.shadowBlur = 10;
        ctx.font = 'bold 20px Orbitron';
        ctx.fillText(s.text || `+${s.value}`, s.x, s.y);
        ctx.restore();
    };

    const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color; ctx.shadowBlur = 5;
        if (p.type === ParticleType.GLITCH) ctx.fillRect(p.x, p.y, p.radius*2, p.radius*2);
        else { ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
    };

    const drawPlayer = (ctx: CanvasRenderingContext2D, p: Player) => {
        ctx.save(); ctx.translate(p.x + p.width/2, p.y + p.height/2); ctx.rotate(p.angle);
        
        if (p.isTimeSlipping) {
             ctx.globalAlpha = 0.5;
             ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 20;
             ctx.fillStyle = "rgba(6, 182, 212, 0.3)";
             ctx.fillRect(-50, -20, 100, 40);
        } else {
             ctx.globalAlpha = 1.0;
             ctx.shadowColor = "#ef4444"; ctx.shadowBlur = 15;
        }

        // Sleigh Body - Premium Curve
        ctx.fillStyle = "#991b1b"; 
        ctx.beginPath(); 
        ctx.moveTo(35, -10); ctx.lineTo(-45, -10);
        ctx.bezierCurveTo(-55, 0, -55, 25, -45, 25);
        ctx.lineTo(25, 25);
        ctx.bezierCurveTo(45, 25, 45, 0, 35, -10);
        ctx.fill();

        // Gold Rails
        ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 3; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-40, 30); ctx.lineTo(40, 30); 
        ctx.moveTo(-40, 30); ctx.quadraticCurveTo(-60, 20, -60, -5); ctx.stroke();

        // Santa
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(8, -18); ctx.lineTo(0, -32); ctx.fill();

        // Thruster Glow
        if (p.isThrusting) {
            ctx.fillStyle = p.isTimeSlipping ? "#06b6d4" : "#f59e0b";
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 40;
            ctx.beginPath(); ctx.ellipse(-50, 15, 12, 6, 0, 0, Math.PI*2); ctx.fill();
        }

        // Reindeer Trail
        if (p.isThrusting) {
             ctx.fillStyle = "#fbbf24"; ctx.globalAlpha = 0.5;
             ctx.beginPath(); ctx.arc(90, -5, Math.random()*3, 0, Math.PI*2); ctx.fill();
        }

        // Reindeer
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(40, 0); ctx.lineTo(75, -5); ctx.stroke();
        
        ctx.fillStyle = "#78350f"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.ellipse(80, -5, 15, 8, 0, 0, Math.PI*2); ctx.fill(); // Body
        ctx.beginPath(); ctx.ellipse(95, -15, 6, 4, 0, 0, Math.PI*2); ctx.fill(); // Head
        ctx.fillStyle = "#ef4444"; ctx.beginPath(); ctx.arc(101, -15, 2, 0, Math.PI*2); ctx.fill(); // Nose

        ctx.restore();
    };

    const drawObstacle = (ctx: CanvasRenderingContext2D, o: Obstacle, now: number) => {
        ctx.save(); ctx.translate(o.x + o.width/2, o.y + o.height/2);
        
        if (o.stabilized) {
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = "#06b6d4"; ctx.lineWidth = 2;
            ctx.shadowColor = "#06b6d4"; ctx.shadowBlur = 10;
            ctx.strokeRect(-o.width/2, -o.height/2, o.width, o.height);
            ctx.restore(); return;
        }

        // Premium Shadows for all objects
        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10;

        if (o.type === 'SNOWMAN') {
             ctx.fillStyle = "#fff";
             ctx.beginPath(); ctx.arc(0, 15, 20, 0, Math.PI*2); ctx.fill();
             ctx.beginPath(); ctx.arc(0, -10, 15, 0, Math.PI*2); ctx.fill();
             ctx.fillStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(0,-10); ctx.lineTo(12,-7); ctx.lineTo(0,-4); ctx.fill();
             ctx.fillStyle = "#ef4444"; ctx.fillRect(-15, -8, 30, 4);
        } else if (o.type === 'PRESENT_STACK') {
             ctx.fillStyle = "#16a34a"; ctx.fillRect(-20, -10, 40, 40);
             ctx.fillStyle = "#ef4444"; ctx.fillRect(-15, -35, 30, 25);
             ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4;
             ctx.strokeRect(-20, -10, 40, 40); ctx.strokeRect(-15, -35, 30, 25);
        } else if (o.type === 'DECORATED_TREE') {
             ctx.fillStyle = "#14532d"; 
             ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(35, 50); ctx.lineTo(-35, 50); ctx.fill();
             ctx.shadowBlur = 5; ctx.shadowColor = "#fbbf24";
             ctx.fillStyle = "#fbbf24"; ctx.beginPath(); ctx.arc(0, -50, 5, 0, Math.PI*2); ctx.fill();
        } else if (o.type === 'TIME_RIFT') {
             const h = o.height;
             ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 30;
             ctx.strokeStyle = "#d8b4fe"; ctx.lineWidth = 3;
             ctx.beginPath(); ctx.moveTo(0, -h/2);
             for(let i=0; i<10; i++) ctx.lineTo((Math.random()-0.5)*25, -h/2 + (h/10)*i);
             ctx.lineTo(0, h/2); ctx.stroke();
        } else if (o.type === 'CLOCKWORK_GEAR') {
             ctx.rotate(o.rotation || 0);
             ctx.fillStyle = "#b45309"; 
             ctx.beginPath();
             const outer = o.width/2, inner = o.width/2-6;
             for (let i = 0; i < 16; i++) {
                const a = (Math.PI*2*i)/16; const r = i%2===0?outer:inner;
                ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
             }
             ctx.closePath(); ctx.fill();
             ctx.fillStyle="#000"; ctx.beginPath(); ctx.arc(0,0,8,0,Math.PI*2); ctx.fill();
        } else if (o.type === 'STATIC_CLOUD') {
             const w = o.width; 
             const grad = ctx.createRadialGradient(0,0, 0, 0,0, w/2);
             grad.addColorStop(0, "rgba(255,255,255,0.8)"); grad.addColorStop(1, "transparent");
             ctx.fillStyle = grad;
             ctx.beginPath(); ctx.arc(0,0, w/2, 0, Math.PI*2); ctx.fill();
        } else if (o.type === 'FESTIVE_ARCH') {
            ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 12;
            ctx.beginPath(); ctx.arc(0, 50, 40, Math.PI, 0); ctx.stroke();
            ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = 4; ctx.setLineDash([10, 10]);
            ctx.beginPath(); ctx.arc(0, 50, 40, Math.PI, 0); ctx.stroke();
        } else if (o.type === 'DRONE_SENTINEL') {
            ctx.fillStyle = "#0f172a"; ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "#ef4444"; ctx.shadowColor="#ef4444"; ctx.shadowBlur=15;
            ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fill(); 
        } else if (o.type === 'GLITCH_ELF') {
            ctx.rotate(o.rotation || 0);
            ctx.fillStyle = Math.random() > 0.5 ? "#166534" : "#ff00ff";
            ctx.fillRect(-15, -15, 30, 30);
        }
        ctx.restore();
    };

    const drawLandmark = (ctx: CanvasRenderingContext2D, lm: Landmark) => {
        ctx.save(); ctx.translate(lm.x, lm.y - 150);
        ctx.shadowColor = "rgba(0,0,0,0.8)"; ctx.shadowBlur = 20;
        if (lm.type === 'TIME_VORTEX') {
            ctx.shadowColor = "#a855f7"; ctx.shadowBlur = 60;
            ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
            const t = Date.now() / 1000; ctx.rotate(t);
            ctx.beginPath();
            for (let i = 0; i < 50; i++) { const a=0.2*i; ctx.lineTo((1+a)*Math.cos(a), (1+a)*Math.sin(a)); }
            ctx.stroke();
        } else if (lm.type === 'CLOCK_TOWER') {
            ctx.fillStyle = "#1e1b4b"; ctx.fillRect(-40, 0, 80, 400);
            ctx.fillStyle = "#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=20;
            ctx.beginPath(); ctx.arc(0, 50, 30, 0, Math.PI*2); ctx.fill();
        } else if (lm.type === 'GRAND_TREE') {
            ctx.fillStyle = "#064e3b"; ctx.beginPath(); ctx.moveTo(0,-200); ctx.lineTo(100, 300); ctx.lineTo(-100, 300); ctx.fill();
            ctx.fillStyle = "#facc15"; ctx.shadowColor="#facc15"; ctx.shadowBlur=30;
            ctx.beginPath(); ctx.arc(0, -200, 20, 0, Math.PI*2); ctx.fill();
        } else if (lm.type === 'TOY_WORKSHOP') {
            ctx.fillStyle = "#7f1d1d"; ctx.fillRect(-150, 100, 300, 200);
            ctx.fillStyle = "#fbbf24"; ctx.fillRect(-100, 150, 50, 50); ctx.fillRect(50, 150, 50, 50);
        }
        ctx.restore();
    };

    const drawPowerup = (ctx: CanvasRenderingContext2D, p: Powerup) => {
        const color = POWERUP_COLORS[p.type] || '#ffffff';
        const cx = p.x + p.width/2; const cy = p.y + p.height/2 + Math.sin(p.floatOffset)*5;
        ctx.save(); ctx.translate(cx, cy);
        ctx.shadowColor = color; ctx.shadowBlur = 25; ctx.fillStyle = color;
        if (p.type === PowerupType.CHRONO_BOOST) {
            ctx.beginPath();
            for(let i=0; i<5; i++){ ctx.lineTo(Math.cos((18+i*72)/180*Math.PI)*15, -Math.sin((18+i*72)/180*Math.PI)*15); ctx.lineTo(Math.cos((54+i*72)/180*Math.PI)*7, -Math.sin((54+i*72)/180*Math.PI)*7); }
            ctx.closePath(); ctx.fill();
        } else { ctx.beginPath(); ctx.arc(0,0, 12, 0, Math.PI*2); ctx.fill(); }
        ctx.restore();
    };

    const checkCollision = (r1: Entity, r2: Entity) => (r1.x < r2.x + r2.width && r1.x + r1.width > r2.x && r1.y < r2.y + r2.height && r1.y + r1.height > r2.y);
    animId = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(animId); soundManager.stopBgm(); };
  }, [gameState]);

  return (
    <div className="relative w-full h-full max-w-[1200px] max-h-[600px] mx-auto border border-yellow-900/30 shadow-2xl overflow-hidden bg-black rounded-lg">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full" />
      <UIOverlay {...hudState} currentLevelName={LEVELS[hudState.levelIndex].name} currentLevelSub={LEVELS[hudState.levelIndex].subtext} />
    </div>
  );
};
export default GameCanvas;
