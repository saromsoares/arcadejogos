/**
 * Índice de Fases
 * Lista metadados de todas as fases disponíveis
 */

import { LevelMetadata } from './schema';

export const LEVEL_WORLDS = {
  WIND: 'wind',
} as const;

export const LEVELS_METADATA: LevelMetadata[] = [
  {
    id: 'wind_01',
    name: 'Brisa Suave',
    description: 'Sua primeira aventura no Mundo do Vento. Aprenda a controlar o personagem.',
    difficulty: 1,
    timeGoalSeconds: 60,
  },
  {
    id: 'wind_02',
    name: 'Vento Crescente',
    description: 'O vento fica mais forte. Aprenda a lidar com a força do ar.',
    difficulty: 2,
    timeGoalSeconds: 75,
  },
  {
    id: 'wind_03',
    name: 'Redemoinhos',
    description: 'Redemoinhos de ar criam padrões complexos. Navegue com cuidado.',
    difficulty: 3,
    timeGoalSeconds: 90,
  },
  {
    id: 'wind_04',
    name: 'Plataformas Flutuantes',
    description: 'Plataformas que flutuam no ar. Não há chão seguro.',
    difficulty: 4,
    timeGoalSeconds: 105,
  },
  {
    id: 'wind_05',
    name: 'Vórtice Ascendente',
    description: 'Um grande vórtice te puxa para cima. Controle sua subida.',
    difficulty: 5,
    timeGoalSeconds: 120,
  },
  {
    id: 'wind_06',
    name: 'Tempestade Dupla',
    description: 'Dois ventos opostos criam um padrão caótico.',
    difficulty: 6,
    timeGoalSeconds: 135,
  },
  {
    id: 'wind_07',
    name: 'Labirinto Aéreo',
    description: 'Navegue por um labirinto suspenso no ar.',
    difficulty: 7,
    timeGoalSeconds: 150,
  },
  {
    id: 'wind_08',
    name: 'Correntes de Ar',
    description: 'Correntes de ar invisíveis guiam seu caminho.',
    difficulty: 8,
    timeGoalSeconds: 165,
  },
  {
    id: 'wind_09',
    name: 'Furacão',
    description: 'Um furacão poderoso testa seus limites.',
    difficulty: 9,
    timeGoalSeconds: 180,
  },
  {
    id: 'wind_10',
    name: 'Dimensão Invertida',
    description: 'A gravidade se comporta de forma estranha aqui.',
    difficulty: 10,
    timeGoalSeconds: 195,
  },
  {
    id: 'wind_11',
    name: 'Convergência',
    description: 'Todos os ventos convergem em um único ponto.',
    difficulty: 11,
    timeGoalSeconds: 210,
  },
  {
    id: 'wind_12',
    name: 'Coração do Vento',
    description: 'O desafio final: enfrente o coração do Mundo do Vento.',
    difficulty: 12,
    timeGoalSeconds: 240,
  },
];

/**
 * Obtém metadados de uma fase pelo ID
 */
export function getLevelMetadata(levelId: string): LevelMetadata | undefined {
  return LEVELS_METADATA.find((level) => level.id === levelId);
}

/**
 * Obtém todas as fases de um mundo
 */
export function getLevelsByWorld(world: string): LevelMetadata[] {
  return LEVELS_METADATA.filter((level) => level.id.startsWith(world));
}

/**
 * Obtém o número total de fases
 */
export function getTotalLevels(): number {
  return LEVELS_METADATA.length;
}

/**
 * Obtém a próxima fase após a atual
 */
export function getNextLevel(currentLevelId: string): LevelMetadata | undefined {
  const currentIndex = LEVELS_METADATA.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex === -1 || currentIndex === LEVELS_METADATA.length - 1) {
    return undefined;
  }
  return LEVELS_METADATA[currentIndex + 1];
}

/**
 * Obtém a fase anterior à atual
 */
export function getPreviousLevel(currentLevelId: string): LevelMetadata | undefined {
  const currentIndex = LEVELS_METADATA.findIndex(
    (level) => level.id === currentLevelId
  );
  if (currentIndex <= 0) {
    return undefined;
  }
  return LEVELS_METADATA[currentIndex - 1];
}
