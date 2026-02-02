import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGame, destroyGame } from './createGame';

/**
 * PhaserGame Component
 * 
 * Bridge entre React e Phaser que:
 * - Inicializa o jogo Phaser em um div container
 * - Gerencia o lifecycle corretamente (evita duplicação em StrictMode)
 * - Faz cleanup no unmount
 * - Expõe a instância do jogo se necessário
 */

interface PhaserGameProps {
  /** Callback quando o jogo é criado */
  onGameReady?: (game: Phaser.Game) => void;
  /** Largura do canvas */
  width?: number;
  /** Altura do canvas */
  height?: number;
  /** Classes CSS adicionais */
  className?: string;
}

export default function PhaserGame({
  onGameReady,
  width = 800,
  height = 600,
  className = '',
}: PhaserGameProps) {
  // Ref para o container div
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ref para a instância do jogo (não causa re-render)
  const gameRef = useRef<Phaser.Game | null>(null);
  
  // Flag para evitar inicialização dupla em StrictMode
  const initializedRef = useRef(false);

  // Estado para controle de loading
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Guard: evitar dupla inicialização (React StrictMode)
    if (initializedRef.current || !containerRef.current) {
      return;
    }

    console.log('[PhaserGame] Initializing...');
    initializedRef.current = true;

    // Criar instância do jogo
    const game = createGame({
      parent: containerRef.current,
      width,
      height,
    });

    gameRef.current = game;

    // Callback quando pronto
    if (onGameReady) {
      // Aguardar o jogo inicializar completamente
      game.events.once('ready', () => {
        onGameReady(game);
        setIsLoading(false);
      });
    }

    // Fallback para loading (caso o evento ready não dispare)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Cleanup function
    return () => {
      console.log('[PhaserGame] Cleanup');
      clearTimeout(loadingTimeout);
      
      // Destruir o jogo apenas se foi realmente criado
      if (gameRef.current) {
        destroyGame(gameRef.current);
        gameRef.current = null;
      }
      
      // Reset da flag para permitir nova inicialização se o componente remontar
      initializedRef.current = false;
    };
  }, [width, height, onGameReady]);

  return (
    <div className={`phaser-game-container ${className}`}>
      {isLoading && (
        <div className="phaser-loading">
          <span>Iniciando jogo...</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        id="phaser-container"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      />
    </div>
  );
}
