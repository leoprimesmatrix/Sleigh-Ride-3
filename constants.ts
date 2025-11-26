
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
  [PowerupType.CHRONO_BOOST]: '#06b6d4',    // Cyan
  [PowerupType.HULL_REPAIR]: '#22c55e',     // Green
  [PowerupType.DATA_FRAGMENT]: '#eab308',   // Gold
  [PowerupType.TIME_FREEZE]: '#a855f7',     // Purple
};

export const LEVEL_THRESHOLDS = [0, 20, 40, 70, 95];

export const LEVELS: LevelConfig[] = [
  {
    name: "THE GLITCHING FOREST", 
    subtext: "NATURE IS DESYNCHRONIZING",
    colors: { 
      sky: ['#1a0505', '#2b1010'], // Dark Red/Black
      ground: '#450a0a', 
      fog: 'rgba(69, 10, 10, 0.4)', 
      grid: '#ef4444' // Red Grid
    },
    obstacleSpeed: 1.0,
    spawnRate: 1.0,
    allowedObstacles: ['STATIC_CLOUD', 'GLITCH_ELF'] 
  },
  {
    name: "NEON VILLAGE", 
    subtext: "TECHNOLOGY REPLACES MAGIC",
    colors: { 
      sky: ['#020617', '#172554'], // Midnight Blue
      ground: '#1e3a8a', 
      fog: 'rgba(30, 58, 138, 0.3)',
      grid: '#06b6d4' // Cyan Grid
    },
    obstacleSpeed: 1.2,
    spawnRate: 1.3,
    allowedObstacles: ['DRONE_SENTINEL', 'STATIC_CLOUD']
  },
  {
    name: "THE TICKING TUNDRA", 
    subtext: "TIME IS RUNNING OUT",
    colors: { 
      sky: ['#3b0764', '#581c87'], // Deep Purple
      ground: '#6b21a8', 
      fog: 'rgba(107, 33, 168, 0.3)',
      grid: '#d8b4fe' // Lavender Grid
    },
    obstacleSpeed: 1.4,
    spawnRate: 1.5,
    allowedObstacles: ['CLOCKWORK_GEAR', 'TIME_RIFT'] 
  },
  {
    name: "CHRONOS CITADEL", 
    subtext: "THE HEART OF THE REWRITE",
    colors: { 
      sky: ['#000000', '#18181b'], 
      ground: '#71717a', 
      fog: 'rgba(255, 255, 255, 0.1)',
      grid: '#fbbf24' // Gold Grid
    },
    obstacleSpeed: 1.6,
    spawnRate: 2.0,
    allowedObstacles: ['CLOCKWORK_GEAR', 'DRONE_SENTINEL', 'TIME_RIFT']
  },
  {
    name: "EVENT HORIZON", 
    subtext: "THE END OF HISTORY",
    colors: { 
      sky: ['#ffffff', '#e2e8f0'], 
      ground: '#000000', 
      fog: 'rgba(255,255,255,0.8)',
      grid: '#000000'
    },
    obstacleSpeed: 0, 
    spawnRate: 0,
    allowedObstacles: []
  }
];

export const TOTAL_GAME_TIME_SECONDS = 9999; 
export const VICTORY_DISTANCE = 120000; 

// --- Narrative Content ---

export const DATA_LOGS = [
  "SYSTEM: 'Timeline integrity at 45%.'",
  "SANTA: 'Why are the elves... glitching?'",
  "TIMEKEEPER: 'Efficiency is the only true magic.'",
  "SYSTEM: 'Warning: Future timeline ERADICATED.'"
];

export const STORY_MOMENTS: { progress: number; dialogue: DialogueLine }[] = [
  { progress: 0.02, dialogue: { id: 'intro', speaker: 'SANTA', text: "The sky... it looks like broken glass. What is happening to my home?", color: '#ef4444' } },
  { progress: 0.15, dialogue: { id: 'tk_reveal', speaker: 'TIMEKEEPER', text: "Santa Claus. You are an anomaly. An unpredictable variable.", color: '#fbbf24' } },
  
  { progress: 0.30, dialogue: { id: 'santa_confused', speaker: 'SANTA', text: "Who are you? Why are you twisting the North Pole?", color: '#ef4444' } },
  { progress: 0.45, dialogue: { id: 'tk_motive', speaker: 'TIMEKEEPER', text: "I am Chronos. I am rewriting history to be perfect. No more chaos. No more... spirit.", color: '#fbbf24' } },
  
  { progress: 0.60, dialogue: { id: 'santa_resolve', speaker: 'SANTA', text: "Perfection isn't Christmas! It's the joy, the surprise... the magic!", color: '#ef4444' } },
  { progress: 0.75, dialogue: { id: 'system_warn', speaker: 'SYSTEM', text: "CRITICAL ALERT: TIMELINE COLLAPSE IMMINENT.", color: '#06b6d4' } },

  { progress: 0.90, dialogue: { id: 'tk_final', speaker: 'TIMEKEEPER', text: "It is too late. The gears are turning. The rewrite is complete.", color: '#fbbf24' } },

  { progress: 0.96, dialogue: { id: 'santa_final', speaker: 'SANTA', text: "Not while I still draw breath! Sleigh... full power! BREAK THE CYCLE!", color: '#ef4444' } },
];

export const LANDMARKS = [
    { progress: 0.25, type: 'NEON_FACTORY', name: "Automated Toy Sector" },
    { progress: 0.50, type: 'CLOCK_TOWER', name: "The Infinite Clock" },
    { progress: 0.99, type: 'TIME_VORTEX', name: "The Singularity" }
] as const;