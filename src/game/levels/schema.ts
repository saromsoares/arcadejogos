/**
 * Schema TypeScript para Fases do Mundo do Vento
 * Define tipos e interfaces para validação de dados de fases
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hazard {
  type: 'spikes' | 'lava' | 'void';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Collectible {
  x: number;
  y: number;
  id: string;
}

export interface Goal {
  x: number;
  y: number;
  radius: number;
}

export interface WindZone {
  x: number;
  y: number;
  width: number;
  height: number;
  forceX: number;
  forceY: number;
  type: 'constant' | 'pulsed';
  pulseDuration?: number; // em ms, apenas se type === 'pulsed'
}

export interface MovingPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  targetX: number;
  targetY: number;
  speed: number;
}

export interface Checkpoint {
  x: number;
  y: number;
  radius: number;
}

export interface LevelData {
  id: string;
  name: string;
  description: string;
  difficulty: number; // 1-12
  timeGoalSeconds: number;
  playerSpawn: Vector2;
  goal: Goal;
  platforms: Platform[];
  hazards: Hazard[];
  collectibles: Collectible[];
  windZones: WindZone[];
  movingPlatforms: MovingPlatform[];
  checkpoints: Checkpoint[];
  hints: string[];
}

/**
 * Validação básica de dados de fase
 */
export function validateLevelData(data: unknown): data is LevelData {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const level = data as Record<string, unknown>;

  // Verificar campos obrigatórios
  if (
    typeof level.id !== 'string' ||
    typeof level.name !== 'string' ||
    typeof level.description !== 'string' ||
    typeof level.difficulty !== 'number' ||
    typeof level.timeGoalSeconds !== 'number'
  ) {
    return false;
  }

  // Verificar estruturas aninhadas
  if (
    !isVector2(level.playerSpawn) ||
    !isGoal(level.goal) ||
    !Array.isArray(level.platforms) ||
    !Array.isArray(level.hazards) ||
    !Array.isArray(level.collectibles) ||
    !Array.isArray(level.windZones) ||
    !Array.isArray(level.movingPlatforms) ||
    !Array.isArray(level.checkpoints) ||
    !Array.isArray(level.hints)
  ) {
    return false;
  }

  // Validar arrays
  if (
    !level.platforms.every(isPlatform) ||
    !level.hazards.every(isHazard) ||
    !level.collectibles.every(isCollectible) ||
    !level.windZones.every(isWindZone) ||
    !level.movingPlatforms.every(isMovingPlatform) ||
    !level.checkpoints.every(isCheckpoint) ||
    !level.hints.every((h) => typeof h === 'string')
  ) {
    return false;
  }

  return true;
}

function isVector2(obj: unknown): obj is Vector2 {
  if (!obj || typeof obj !== 'object') return false;
  const v = obj as Record<string, unknown>;
  return typeof v.x === 'number' && typeof v.y === 'number';
}

function isGoal(obj: unknown): obj is Goal {
  if (!obj || typeof obj !== 'object') return false;
  const g = obj as Record<string, unknown>;
  return (
    typeof g.x === 'number' &&
    typeof g.y === 'number' &&
    typeof g.radius === 'number'
  );
}

function isPlatform(obj: unknown): obj is Platform {
  if (!obj || typeof obj !== 'object') return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p.x === 'number' &&
    typeof p.y === 'number' &&
    typeof p.width === 'number' &&
    typeof p.height === 'number'
  );
}

function isHazard(obj: unknown): obj is Hazard {
  if (!obj || typeof obj !== 'object') return false;
  const h = obj as Record<string, unknown>;
  return (
    (h.type === 'spikes' || h.type === 'lava' || h.type === 'void') &&
    typeof h.x === 'number' &&
    typeof h.y === 'number' &&
    typeof h.width === 'number' &&
    typeof h.height === 'number'
  );
}

function isCollectible(obj: unknown): obj is Collectible {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.x === 'number' &&
    typeof c.y === 'number' &&
    typeof c.id === 'string'
  );
}

function isWindZone(obj: unknown): obj is WindZone {
  if (!obj || typeof obj !== 'object') return false;
  const w = obj as Record<string, unknown>;
  const isValid =
    typeof w.x === 'number' &&
    typeof w.y === 'number' &&
    typeof w.width === 'number' &&
    typeof w.height === 'number' &&
    typeof w.forceX === 'number' &&
    typeof w.forceY === 'number' &&
    (w.type === 'constant' || w.type === 'pulsed');

  if (!isValid) return false;

  // Se type é 'pulsed', pulseDuration deve ser um número
  if (w.type === 'pulsed' && typeof w.pulseDuration !== 'number') {
    return false;
  }

  return true;
}

function isMovingPlatform(obj: unknown): obj is MovingPlatform {
  if (!obj || typeof obj !== 'object') return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.x === 'number' &&
    typeof m.y === 'number' &&
    typeof m.width === 'number' &&
    typeof m.height === 'number' &&
    typeof m.targetX === 'number' &&
    typeof m.targetY === 'number' &&
    typeof m.speed === 'number'
  );
}

function isCheckpoint(obj: unknown): obj is Checkpoint {
  if (!obj || typeof obj !== 'object') return false;
  const c = obj as Record<string, unknown>;
  return (
    typeof c.x === 'number' &&
    typeof c.y === 'number' &&
    typeof c.radius === 'number'
  );
}

/**
 * Metadados de fase para exibição na UI
 */
export interface LevelMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  timeGoalSeconds: number;
}

/**
 * Progresso do jogador em uma fase
 */
export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestTimeMs: number | null;
  bestCollectibles: number;
  totalDeaths: number;
}

/**
 * Dados de conclusão de fase
 */
export interface LevelCompletionData {
  id: string;
  timeMs: number;
  picked: number;
  deaths: number;
}
