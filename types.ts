
export enum GameState {
  MENU,
  INFO,
  HELP,
  INTRO,
  PLAYING,
  GAME_OVER,
  VICTORY
}

export enum GameMode {
  STORY,
  ENDLESS
}

export enum PowerupType {
  CHRONO_BOOST = 'CHRONO_BOOST',  // Restores Stability
  HULL_REPAIR = 'HULL_REPAIR',    // Restores Integrity
  DATA_FRAGMENT = 'DATA_FRAGMENT', // Score
  TIME_FREEZE = 'TIME_FREEZE'     // Invulnerability
}

export interface Entity {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  markedForDeletion: boolean;
}

export interface Player extends Entity {
  vy: number;
  integrity: number;    // HP
  stability: number;    // Replaces Energy (Time Stability)
  maxStability: number;
  isTimeSlipping: boolean;   // Replaces Phasing
  angle: number; 
  isThrusting: boolean; 
  godMode?: boolean;
  
  combo: number;
  comboTimer: number;
}

export type ObstacleType = 
    'SNOWMAN' | 'PRESENT_STACK' | 'DECORATED_TREE' | 'FESTIVE_ARCH' |
    'CLOCKWORK_GEAR' | 'TIME_RIFT' | 'GLITCH_ELF' | 'STATIC_CLOUD' | 'DRONE_SENTINEL';

export interface Obstacle extends Entity {
  type: ObstacleType;
  rotation?: number;
  scoreValue: number;
  stabilized: boolean; // Has the player "slipped" through it?
}

export interface ScorePopup {
  id: number;
  x: number;
  y: number;
  value: number;
  text: string;
  life: number;
  color: string;
}

export interface Landmark extends Entity {
  type: 'GRAND_TREE' | 'TOY_WORKSHOP' | 'CLOCK_TOWER' | 'NEON_FACTORY' | 'TIME_VORTEX';
  name: string;
}

export interface Powerup extends Entity {
  type: PowerupType;
  floatOffset: number;
}

export interface DataLog extends Entity {
  message: string;
  floatOffset: number;
}

export enum ParticleType {
  SNOW,       // Gentle white snow
  SPARK,      // Mechanical sparks
  GLITCH,     // Digital squares
  GEAR,       // Small gear bits
  THRUST,     // Exhaust
  TIME_DUST,  // Magical time dust
  RIFT_GLOW   // Purple void glow
}

export interface Particle {
  id: number;
  type: ParticleType;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
  rotation?: number;
}

export interface LevelConfig {
  name: string;
  subtext: string;
  colors: {
    sky: [string, string];
    ground: string;
    fog: string;
    grid: string; 
  };
  obstacleSpeed: number;
  spawnRate: number;
  allowedObstacles: ObstacleType[];
  musicTrack: 'WONDERLAND' | 'GRAY_WORLD' | 'OCEAN' | 'BLIZZARD';
  glitchIntensity: number; // 0 to 1
}

export interface BackgroundLayer {
  points: {height: number, type: number}[];
  color: string;
  speedModifier: number;
  offset: number;
}

export interface DialogueLine {
  id: string;
  speaker: 'SANTA' | 'ELF_COMM' | 'TIMEKEEPER' | 'SYSTEM';
  text: string;
  color: string;
  font?: string; // Optional font override
}

export type DebugCommand = 'SKIP_TO_ENDING' | 'TOGGLE_GOD_MODE' | 'INCREASE_SPEED' | 'TOGGLE_HYPER_PROGRESS' | null;