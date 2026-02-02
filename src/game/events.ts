/**
 * EventBus - Sistema de eventos para comunicação entre Phaser e React
 * 
 * Este módulo permite que o jogo Phaser dispare eventos que o React pode ouvir,
 * e vice-versa, mantendo as camadas desacopladas.
 * 
 * Uso:
 * - Phaser: EventBus.emit('collectible-picked', { picked: 1, total: 3 });
 * - React:  EventBus.on('collectible-picked', (data) => setCoins(data.picked));
 */

type EventCallback<T = unknown> = (data: T) => void;

interface EventBusType {
  events: Map<string, Set<EventCallback>>;
  on<T = unknown>(event: string, callback: EventCallback<T>): void;
  off<T = unknown>(event: string, callback: EventCallback<T>): void;
  emit<T = unknown>(event: string, data?: T): void;
  removeAllListeners(event?: string): void;
}

// Tipos específicos dos eventos do jogo (type-safety)
export interface GameEvents {
  'level-started': {
    id: string;
    name: string;
    totalCollectibles: number;
  };
  'collectible-picked': {
    picked: number;
    total: number;
  };
  'player-died': {
    deaths: number;
  };
  'level-completed': {
    id: string;
    timeMs: number;
    picked: number;
    deaths: number;
  };
  'game-ready': undefined;
  'game-paused': {
    paused: boolean;
  };
}

// Event keys para autocomplete
export type GameEventKey = keyof GameEvents;

const EventBus: EventBusType = {
  events: new Map(),

  on<T = unknown>(event: string, callback: EventCallback<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback as EventCallback);
  },

  off<T = unknown>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
    }
  },

  emit<T = unknown>(event: string, data?: T): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  },

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  },
};

export default EventBus;
