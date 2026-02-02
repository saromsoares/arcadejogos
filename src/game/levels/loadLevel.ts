/**
 * Loader de Fases
 * Carrega dados de fase a partir de arquivos JSON
 */

import { LevelData, validateLevelData } from './schema';

/**
 * Cache de fases carregadas
 */
const levelCache = new Map<string, LevelData>();

/**
 * Carrega uma fase pelo ID
 * @param levelId - ID da fase (ex: 'wind_01')
 * @returns Promise com os dados da fase
 * @throws Error se a fase não puder ser carregada ou validada
 */
export async function loadLevel(levelId: string): Promise<LevelData> {
  // Verificar cache
  if (levelCache.has(levelId)) {
    return levelCache.get(levelId)!;
  }

  try {
    // Importar dinamicamente o arquivo JSON
    const levelModule = await import(`./wind/${levelId}.json`);
    const levelData = levelModule.default;

    // Validar dados
    if (!validateLevelData(levelData)) {
      throw new Error(`Invalid level data for ${levelId}`);
    }

    // Armazenar em cache
    levelCache.set(levelId, levelData);

    return levelData;
  } catch (error) {
    console.error(`Failed to load level ${levelId}:`, error);
    throw new Error(`Could not load level ${levelId}`);
  }
}

/**
 * Pré-carrega múltiplas fases
 * @param levelIds - Array de IDs de fases
 * @returns Promise que resolve quando todas as fases forem carregadas
 */
export async function preloadLevels(levelIds: string[]): Promise<void> {
  await Promise.all(levelIds.map((id) => loadLevel(id)));
}

/**
 * Limpa o cache de fases
 */
export function clearLevelCache(): void {
  levelCache.clear();
}

/**
 * Obtém uma fase do cache sem carregar
 * @param levelId - ID da fase
 * @returns Dados da fase ou undefined se não estiver em cache
 */
export function getCachedLevel(levelId: string): LevelData | undefined {
  return levelCache.get(levelId);
}
