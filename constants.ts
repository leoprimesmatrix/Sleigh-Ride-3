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
  [PowerupType.CHRONO_BOOST]: '#fbbf24',    // Gold
  [PowerupType.HULL_REPAIR]: '#22c55e',     // Emerald
  [PowerupType.DATA_FRAGMENT]: '#38bdf8',   // Sky Blue
  [PowerupType.TIME_FREEZE]: '#a855f7',     // Royal Purple
};

export const LEVEL_THRESHOLDS = [0, 25, 50, 75, 96];

export const LEVELS: LevelConfig[] = [
  {
    name: "NORTH POLE PLAZA", 
    subtext: "A PERFECT CHRISTMAS EVE",
    colors: { 
      sky: ['#0f172a', '#1e293b'], // Deep starry blue
      ground: '#f8fafc', // Pristine Snow
      fog: 'rgba(255, 255, 255, 0.15)', 
      grid: '#334155' // Slate
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
      sky: ['#1e1b4b', '#312e81'], // Indigo Night
      ground: '#e0f2fe', // Icy Blue
      fog: 'rgba(200, 230, 255, 0.2)',
      grid: '#4f46e5' // Indigo
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
      sky: ['#111827', '#374151'], // Storm Dark
      ground: '#94a3b8', // Gray Snow
      fog: 'rgba(255, 255, 255, 0.4)',
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
      sky: ['#0f0505', '#2b0a0a'], // Deep Void Red
      ground: '#450a0a', 
      fog: 'rgba(153, 27, 27, 0.2)',
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
      sky: ['#000000', '#020617'], // Absolute Void
      ground: '#000000', 
      fog: 'rgba(6, 182, 212, 0.1)',
      grid: '#06b6d4' // Cyan Tech
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
export const STORY_MOMENTS: { progress: number; dialogue: DialogueLine }[] = [
  // 0-20%: Pure Joy
  { progress: 0.01, dialogue: { id: 'intro_joy', speaker: 'SANTA', text: "Look at the lights... it's the most beautiful Christmas yet.", color: '#ef4444', font: 'font-holiday' } },
  { progress: 0.10, dialogue: { id: 'elf_check', speaker: 'ELF_COMM', text: "Systems green. Spirit levels are optimal, Santa.", color: '#22c55e', font: 'font-tech' } },
  
  // 20-40%: Subtle glitches
  { progress: 0.25, dialogue: { id: 'santa_huh', speaker: 'SANTA', text: "Did that star just... blink out of existence?", color: '#ef4444' } },
  { progress: 0.35, dialogue: { id: 'elf_glitch', speaker: 'ELF_COMM', text: "Reading... [STATIC] ...energy spikes in the lattice.", color: '#22c55e', font: 'font-tech' } },
  
  // 40-70%: The turn
  { progress: 0.45, dialogue: { id: 'time_slow', speaker: 'SANTA', text: "The wind is frozen. Why aren't the snowflakes moving?", color: '#ef4444' } },
  { progress: 0.55, dialogue: { id: 'tk_intro', speaker: 'TIMEKEEPER', text: "Joy is inefficient. Chaos must be corrected.", color: '#fbbf24', font: 'font-tech' } },
  
  // 70-90%: High stakes
  { progress: 0.70, dialogue: { id: 'santa_realization', speaker: 'SANTA', text: "You're turning the world into a clock! Stop this!", color: '#ef4444' } },
  { progress: 0.80, dialogue: { id: 'tk_threat', speaker: 'TIMEKEEPER', text: "I am saving history from itself. I am the Cure.", color: '#fbbf24', font: 'font-tech' } },
  
  // 90%+: Finale
  { progress: 0.90, dialogue: { id: 'system_fail', speaker: 'SYSTEM', text: "CRITICAL: REALITY COLLAPSE IMMINENT.", color: '#06b6d4', font: 'font-tech' } },
  { progress: 0.96, dialogue: { id: 'santa_final', speaker: 'SANTA', text: "Christmas is MAGIC! You can't calculate Magic!", color: '#ef4444' } },
];

export const LANDMARKS = [
    { progress: 0.15, type: 'GRAND_TREE', name: "The Ever-Tree" },
    { progress: 0.35, type: 'TOY_WORKSHOP', name: "Sector 7 Workshop" },
    { progress: 0.60, type: 'CLOCK_TOWER', name: "The First Gear" },
    { progress: 0.99, type: 'TIME_VORTEX', name: "The Singularity" }
] as const;