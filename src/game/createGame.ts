import Phaser from 'phaser';
import Preloader from './scenes/Preloader';
import MainScene from './scenes/MainScene';

/**
 * Configuração do jogo Phaser
 * 
 * Separado em arquivo próprio para:
 * - Facilitar testes
 * - Permitir múltiplas instâncias se necessário
 * - Manter configuração centralizada
 */

export interface GameConfig {
  parent: HTMLElement | string;
  width?: number;
  height?: number;
}

/**
 * Cria e retorna uma instância do jogo Phaser
 * 
 * @param config - Configuração com elemento pai e dimensões opcionais
 * @returns Instância do Phaser.Game
 */
export function createGame(config: GameConfig): Phaser.Game {
  const { parent, width = 800, height = 600 } = config;

  const phaserConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // WebGL com fallback para Canvas
    parent,
    width,
    height,
    backgroundColor: '#1a1a2e',
    
    // Configuração de física Arcade
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 }, // Gravidade será definida por objeto
        debug: import.meta.env.DEV, // Debug visual apenas em desenvolvimento
      },
    },

    // Cenas do jogo
    scene: [Preloader, MainScene],

    // Configuração de escala responsiva
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    // Renderização
    render: {
      antialias: true,
      pixelArt: false, // Mudar para true se usar pixel art
      roundPixels: false,
    },

    // Input
    input: {
      keyboard: true,
      mouse: true,
      touch: true,
      gamepad: false, // Habilitar depois se necessário
    },

    // Performance
    fps: {
      target: 60,
      forceSetTimeOut: false,
    },

    // Callbacks de lifecycle (útil para debug)
    callbacks: {
      preBoot: () => {
        console.log('[Phaser] Pre-boot');
      },
      postBoot: () => {
        console.log('[Phaser] Game initialized');
      },
    },
  };

  return new Phaser.Game(phaserConfig);
}

/**
 * Destrói uma instância do jogo de forma limpa
 * 
 * @param game - Instância do Phaser.Game para destruir
 */
export function destroyGame(game: Phaser.Game | null): void {
  if (game) {
    console.log('[Phaser] Destroying game instance');
    game.destroy(true);
  }
}
