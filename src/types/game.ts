export type CharacterType = 'ROSE' | 'ARYA' | 'AETHER' | 'CHRONO';

export type GameMode = 'LOCAL' | 'ONLINE' | 'PRACTICE';

export interface Player3DPos {
  x: number;
  y: number;
  z: number;
  rotY: number; // Y orientation angle
  vx: number;
  vy: number;
  vz: number;
  isGrounded: boolean;
  isJumping: boolean;
  isUsingAbility: boolean;
  energy: number; // 0 to 100
  carryingItemId: string | null;
  animationState: 'idle' | 'walk' | 'jump' | 'interact' | 'cheer' | 'hug';
  score: number;
}

export type InteractiveObjectType =
  | 'LEVER'
  | 'PRESSURE_PLATE'
  | 'BOOK_BRIDGE'
  | 'GEAR_LOCK'
  | 'HEART_KEY'
  | 'CANDLE_LIGHT'
  | 'MUSIC_BOX'
  | 'TIME_DIAL'
  | 'DOOR'
  | 'MAGNET_HOOK'
  | 'FLOATING_BOOK'
  | 'TEA_CUP_PLATFORM'
  | 'THREAD_SLIDE';

export interface InteractiveObject3D {
  id: string;
  type: InteractiveObjectType;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  state: boolean | number; // boolean active state or rotation angle
  targetId?: string; // object ID this triggers
  color?: string;
  label?: { fa: string; en: string };
  requiresBoth?: boolean;
  activeUntil?: number;
}

export interface Platform3D {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color?: string;
  type?: 'NORMAL' | 'BOOK' | 'WOOD_BLOCK' | 'BOUNCE_CUSHION' | 'MOVING' | 'ICE' | 'TEA_CUP_PLATFORM';
  moveAxis?: 'x' | 'y' | 'z';
  moveRange?: number;
  moveSpeed?: number;
}

export type PlayerPos = Player3DPos;
export type PuzzleDefinition = PuzzleDefinition3D;
export type InteractiveObject = InteractiveObject3D;

export interface PuzzleDefinition3D {
  id: string;
  title: { fa: string; en: string };
  description: { fa: string; en: string };
  hintDescription: { fa: string; en: string };
  goalPos: { x: number; y: number; z: number };
  goalRadius: number;
  p1Spawn: { x: number; y: number; z: number };
  p2Spawn: { x: number; y: number; z: number };
  platforms: Platform3D[];
  objects: InteractiveObject3D[];
  roseRoleText: { fa: string; en: string };
  aryaRoleText: { fa: string; en: string };
  romanticPrompt: { fa: string; en: string };
}

export interface ChapterDefinition3D {
  id: number;
  title: { fa: string; en: string };
  subtitle: { fa: string; en: string };
  loreIntro: { fa: string; en: string };
  themeColor: string;
  puzzles: PuzzleDefinition3D[];
}

export interface DialogueLine {
  speaker: 'ROSE' | 'ARYA' | 'LOVE_BOOK' | 'AETHER' | 'CHRONO' | 'ORACLE';
  text: { fa: string; en: string };
  avatar?: string;
  emotion?: 'happy' | 'sad' | 'surprised' | 'loving' | 'determined';
}

export interface ChatMessage {
  sender: CharacterType;
  text: string;
  time: number;
}

export interface CustomizationSettings {
  rose: {
    hairColor: string;
    dressColor: string;
    heartColor: string;
    woodTint: string;
  };
  arya: {
    woodTint: string;
    keyFinish: string;
    heartColor: string;
  };
  room: {
    theme: 'WORKSHOP' | 'CANDLELIGHT' | 'TWILIGHT' | 'CYBER_CLOCKWORK';
    deskStyle: 'CARVED_WOOD' | 'MAHOGANY' | 'ROYAL_CARPET';
    particles: 'SPARKLES' | 'HEARTS' | 'GEAR_STEAM';
  };
}

