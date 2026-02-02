/**
 * GameState - Gerenciador de Estado Global do Jogo
 * Mantém o estado do jogo e sincroniza com localStorage
 */

import { LevelProgress, LevelCompletionData } from './levels/schema';

const STORAGE_KEY = 'portais-do-improviso:progress';

export interface GameStateData {
  selectedLevelId: string | null;
  levelProgress: Map<string, LevelProgress>;
  totalCoinsCollected: number;
  totalDeaths: number;
}

class GameStateManager {
  private state: GameStateData = {
    selectedLevelId: null,
    levelProgress: new Map(),
    totalCoinsCollected: 0,
    totalDeaths: 0,
  };

  private listeners: Set<(state: GameStateData) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Carrega o estado do localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.state.levelProgress = new Map(data.levelProgress || []);
        this.state.totalCoinsCollected = data.totalCoinsCollected || 0;
        this.state.totalDeaths = data.totalDeaths || 0;
      }
    } catch (error) {
      console.error('Failed to load game state from storage:', error);
    }
  }

  /**
   * Salva o estado no localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        levelProgress: Array.from(this.state.levelProgress.entries()),
        totalCoinsCollected: this.state.totalCoinsCollected,
        totalDeaths: this.state.totalDeaths,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save game state to storage:', error);
    }
  }

  /**
   * Define a fase selecionada
   */
  setSelectedLevel(levelId: string | null): void {
    this.state.selectedLevelId = levelId;
    this.notifyListeners();
  }

  /**
   * Obtém a fase selecionada
   */
  getSelectedLevel(): string | null {
    return this.state.selectedLevelId;
  }

  /**
   * Atualiza o progresso de uma fase
   */
  updateLevelProgress(levelId: string, progress: Partial<LevelProgress>): void {
    const current = this.state.levelProgress.get(levelId) || {
      levelId,
      completed: false,
      bestTimeMs: null,
      bestCollectibles: 0,
      totalDeaths: 0,
    };

    const updated = { ...current, ...progress };
    this.state.levelProgress.set(levelId, updated);
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Completa uma fase
   */
  completeLevel(levelId: string, data: LevelCompletionData): void {
    const current = this.state.levelProgress.get(levelId) || {
      levelId,
      completed: false,
      bestTimeMs: null,
      bestCollectibles: 0,
      totalDeaths: 0,
    };

    const updated: LevelProgress = {
      levelId,
      completed: true,
      bestTimeMs:
        current.bestTimeMs === null
          ? data.timeMs
          : Math.min(current.bestTimeMs, data.timeMs),
      bestCollectibles: Math.max(current.bestCollectibles, data.picked),
      totalDeaths: current.totalDeaths + data.deaths,
    };

    this.state.levelProgress.set(levelId, updated);
    this.state.totalCoinsCollected += data.picked;
    this.state.totalDeaths += data.deaths;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Obtém o progresso de uma fase
   */
  getLevelProgress(levelId: string): LevelProgress | undefined {
    return this.state.levelProgress.get(levelId);
  }

  /**
   * Obtém todo o progresso
   */
  getAllProgress(): Map<string, LevelProgress> {
    return new Map(this.state.levelProgress);
  }

  /**
   * Verifica se uma fase foi completada
   */
  isLevelCompleted(levelId: string): boolean {
    return this.state.levelProgress.get(levelId)?.completed ?? false;
  }

  /**
   * Obtém o melhor tempo de uma fase
   */
  getBestTime(levelId: string): number | null {
    return this.state.levelProgress.get(levelId)?.bestTimeMs ?? null;
  }

  /**
   * Obtém o melhor número de moedas coletadas
   */
  getBestCollectibles(levelId: string): number {
    return this.state.levelProgress.get(levelId)?.bestCollectibles ?? 0;
  }

  /**
   * Obtém o total de moedas coletadas
   */
  getTotalCoinsCollected(): number {
    return this.state.totalCoinsCollected;
  }

  /**
   * Obtém o total de mortes
   */
  getTotalDeaths(): number {
    return this.state.totalDeaths;
  }

  /**
   * Registra um listener para mudanças de estado
   */
  subscribe(listener: (state: GameStateData) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Reseta todo o progresso
   */
  resetProgress(): void {
    this.state.levelProgress.clear();
    this.state.totalCoinsCollected = 0;
    this.state.totalDeaths = 0;
    this.state.selectedLevelId = null;
    this.saveToStorage();
    this.notifyListeners();
  }

  /**
   * Obtém o estado completo
   */
  getState(): GameStateData {
    return { ...this.state };
  }
}

// Singleton
export const gameState = new GameStateManager();
