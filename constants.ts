
import { LevelConfig, PowerupType, DialogueLine } from './types.ts';

export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 600;

// Physics & Movement
export const GRAVITY = 0.25; 
export const THRUST_POWER = -0.55; 
export const MAX_FALL_SPEED = 9;
export const BASE_SPEED = 10; 

// Time Slip Mechanic
export const STABILITY_DRAIN_RATE = 35; 
export const STABILITY_RECHARGE_RATE = 10; 
export const STABILITY_MIN_ACTIVATION = 15; 
export const STABILITY_RESTORE_REWARD = 25; 

export const COMBO_DECAY = 3.0; 

export const POWERUP_COLORS: Record<PowerupType, string> = {
  [PowerupType.CHRONO_BOOST]: '#fbbf24',    // Gold (was Cyan)
  [PowerupType.HULL_REPAIR]: '#22c55e',     // Green
  [PowerupType.DATA_FRAGMENT]: '#eab308',   // Gold
  [PowerupType.TIME_FREEZE]: '#a855f7',     // Purple
};

export const LEVEL_THRESHOLDS = [0, 25, 50, 75, 96];

export const LEVELS: LevelConfig[] = [
  {
    name: "NORTH POLE PLAZA", 
    subtext: "A PERFECT CHRISTMAS EVE",
    colors: { 
      sky: ['#0f172a', '#1e293b'], // Deep starry blue
      ground: '#f8fafc', // Snow white
      fog: 'rgba(255, 255, 255, 0.2)', 
      grid: '#94a3b8' // Subtle slate grid
    },
    obstacleSpeed: 1.0,
    spawnRate: 1.0,
    allowedObstacles: ['SNOWMAN', 'PRESENT_STACK', 'DECORATED_TREE'],
    musicTrack: 'WONDERLAND',
    glitchIntensity: 0.0
  },
  {
    name: "CANDY CANE LANE", 
    subtext: "SOMETHING FEELS... OFF",
    colors: { 
      sky: ['#1e1b4b', '#312e81'], // Indigo
      ground: '#e0f2fe', // Icy white
      fog: 'rgba(200, 230, 255, 0.3)',
      grid: '#fca5a5' // Reddish grid
    },
    obstacleSpeed: 1.1,
    spawnRate: 1.2,
    allowedObstacles: ['FESTIVE_ARCH', 'SNOWMAN', 'STATIC_CLOUD'],
    musicTrack: 'WONDERLAND',
    glitchIntensity: 0.1
  },
  {
    name: "THE STUTTERING STORM", 
    subtext: "TIME IS SKIPPING BEATS",
    colors: { 
      sky: ['#374151', '#4b5563'], // Storm Grey
      ground: '#94a3b8', 
      fog: 'rgba(255, 255, 255, 0.5)',
      grid: '#fbbf24' // Warning Gold
    },
    obstacleSpeed: 1.3,
    spawnRate: 1.4,
    allowedObstacles: ['STATIC_CLOUD', 'CLOCKWORK_GEAR', 'GLITCH_ELF'],
    musicTrack: 'BLIZZARD',
    glitchIntensity: 0.3
  },
  {
    name: "FRACTURED REALITY", 
    subtext: "THE TIMELINE IS BREAKING",
    colors: { 
      sky: ['#1a0505', '#2b0a0a'], // Dark Red
      ground: '#450a0a', 
      fog: 'rgba(69, 10, 10, 0.4)',
      grid: '#ef4444' // Error Red
    },
    obstacleSpeed: 1.5,
    spawnRate: 1.8,
    allowedObstacles: ['TIME_RIFT', 'DRONE_SENTINEL', 'CLOCKWORK_GEAR'],
    musicTrack: 'GRAY_WORLD',
    glitchIntensity: 0.7
  },
  {
    name: "THE SINGULARITY", 
    subtext: "THE END OF CHRISTMAS",
    colors: { 
      sky: ['#000000', '#000000'], // Void
      ground: '#000000', 
      fog: 'rgba(255,255,255,0.1)',
      grid: '#06b6d4' // Time Cyan
    },
    obstacleSpeed: 0, 
    spawnRate: 0,
    allowedObstacles: [],
    musicTrack: 'OCEAN',
    glitchIntensity: 1.0
  }
];

export const TOTAL_GAME_TIME_SECONDS = 9999; 
export const VICTORY_DISTANCE = 120000; 

// --- Narrative Content ---
// Progression: Joy -> Confusion -> Realization -> Panic

export const STORY_MOMENTS: { progress: number; dialogue: DialogueLine }[] = [
  // 0-20%: Pure Joy
  { progress: 0.01, dialogue: { id: 'intro_joy', speaker: 'SANTA', text: "Ho ho ho! Look at the lights, the snow... it's the most beautiful Christmas yet!", color: '#ef4444', font: 'Mountains of Christmas' } },
  { progress: 0.10, dialogue: { id: 'elf_check', speaker: 'ELF_COMM', text: "Sleigh systems green! The spirit levels are off the charts, Santa!", color: '#22c55e' } },
  
  // 20-40%: Subtle glitches
  { progress: 0.25, dialogue: { id: 'santa_huh', speaker: 'SANTA', text: "Hmm? Did that star just... blink out of existence?", color: '#ef4444' } },
  { progress: 0.35, dialogue: { id: 'elf_glitch', speaker: 'ELF_COMM', text: "Santa, I'm readi-- [STATIC] --ading strange energy spikes.", color: '#22c55e' } },
  
  // 40-70%: The turn
  { progress: 0.45, dialogue: { id: 'time_slow', speaker: 'SANTA', text: "The wind... it's frozen in place. Why aren't the snowflakes moving?", color: '#ef4444' } },
  { progress: 0.55, dialogue: { id: 'tk_intro', speaker: 'TIMEKEEPER', text: "Inefficiency detected. Joy is unpredictable. It must be... corrected.", color: '#fbbf24', font: 'Orbitron' } },
  
  // 70-90%: High stakes
  { progress: 0.70, dialogue: { id: 'santa_realization', speaker: 'SANTA', text: "You! You're stealing the moments! You're stealing Christmas!", color: '#ef4444' } },
  { progress: 0.80, dialogue: { id: 'tk_threat', speaker: 'TIMEKEEPER', text: "I am saving history from chaos. I am the cure.", color: '#fbbf24', font: 'Orbitron' } },
  
  // 90%+: Finale
  { progress: 0.90, dialogue: { id: 'system_fail', speaker: 'SYSTEM', text: "TIMELINE INTEGRITY: CRITICAL. REALITY COLLAPSE IMMINENT.", color: '#06b6d4', font: 'Orbitron' } },
  { progress: 0.96, dialogue: { id: 'santa_final', speaker: 'SANTA', text: "I won't let you turn the world into a clock! Christmas is MAGIC!", color: '#ef4444' } },
];

export const LANDMARKS = [
    { progress: 0.15, type: 'GRAND_TREE', name: "The Ever-Tree" },
    { progress: 0.35, type: 'TOY_WORKSHOP', name: "Sector 7 Workshop" },
    { progress: 0.60, type: 'CLOCK_TOWER', name: "The First Gear" },
    { progress: 0.99, type: 'TIME_VORTEX', name: "The Singularity" }
] as const;