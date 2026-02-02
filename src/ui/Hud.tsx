import { useEffect, useState } from 'react';
import EventBus, { type GameEvents } from '../game/events';

/**
 * HUD Component
 * 
 * Interface de usuário sobreposta ao canvas do Phaser.
 * Recebe eventos do jogo via EventBus e atualiza estado React.
 * 
 * Responsabilidades:
 * - Mostrar contador de moedas
 * - Mostrar contador de mortes
 * - Mostrar timer
 * - Mostrar informações de debug (em dev)
 * - Botão para voltar ao menu
 */

interface HudProps {
  /** Mostrar informações de debug */
  showDebug?: boolean;
  /** Callback para voltar ao menu */
  onBackToMenu?: () => void;
}

export default function Hud({ showDebug = false, onBackToMenu }: HudProps) {
  // Estado das moedas
  const [coins, setCoins] = useState(0);
  const [totalCoins, setTotalCoins] = useState(0);
  
  // Estado de mortes
  const [deaths, setDeaths] = useState(0);
  
  // Estado do timer
  const [timeMs, setTimeMs] = useState(0);
  
  // Estado do jogo
  const [gameReady, setGameReady] = useState(false);
  const [levelName, setLevelName] = useState('');
  const [levelCompleted, setLevelCompleted] = useState(false);

  // Efeito para se inscrever nos eventos do Phaser
  useEffect(() => {
    // Handler para início de nível
    const handleLevelStarted = (data: GameEvents['level-started']) => {
      setLevelName(data.name);
      setTotalCoins(data.totalCollectibles);
      setCoins(0);
      setDeaths(0);
      setTimeMs(0);
      setLevelCompleted(false);
    };

    // Handler para coleta de moedas
    const handleCollectiblePicked = (data: GameEvents['collectible-picked']) => {
      setCoins(data.picked);
    };

    // Handler para morte do player
    const handlePlayerDied = (data: GameEvents['player-died']) => {
      setDeaths(data.deaths);
    };

    // Handler para conclusão de nível
    const handleLevelCompleted = (data: GameEvents['level-completed']) => {
      setTimeMs(data.timeMs);
      setLevelCompleted(true);
    };

    // Handler para jogo pronto
    const handleGameReady = () => {
      setGameReady(true);
    };

    // Inscrever nos eventos
    EventBus.on('level-started', handleLevelStarted);
    EventBus.on('collectible-picked', handleCollectiblePicked);
    EventBus.on('player-died', handlePlayerDied);
    EventBus.on('level-completed', handleLevelCompleted);
    EventBus.on('game-ready', handleGameReady);

    // Cleanup: desinscrever ao desmontar
    return () => {
      EventBus.off('level-started', handleLevelStarted);
      EventBus.off('collectible-picked', handleCollectiblePicked);
      EventBus.off('player-died', handlePlayerDied);
      EventBus.off('level-completed', handleLevelCompleted);
      EventBus.off('game-ready', handleGameReady);
    };
  }, []);

  // Atualizar timer a cada frame
  useEffect(() => {
    if (levelCompleted) return;

    const interval = setInterval(() => {
      setTimeMs((prev) => prev + 16); // ~60 FPS
    }, 16);

    return () => clearInterval(interval);
  }, [levelCompleted]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="hud">
      {/* Botão de voltar ao menu */}
      <button className="hud-back-button" onClick={onBackToMenu} title="Voltar ao menu">
        ← Menu
      </button>

      {/* Nome do nível */}
      {levelName && (
        <div className="hud-level-name">
          {levelName}
        </div>
      )}

      {/* Contador de Moedas */}
      <div className="hud-coins">
        <span className="hud-coin-icon">🪙</span>
        <span className="hud-coin-count">{coins}/{totalCoins}</span>
      </div>

      {/* Contador de Mortes */}
      <div className="hud-deaths">
        <span className="hud-death-icon">💀</span>
        <span className="hud-death-count">{deaths}</span>
      </div>

      {/* Timer */}
      <div className="hud-timer">
        <span className="hud-timer-icon">⏱️</span>
        <span className="hud-timer-text">{formatTime(timeMs)}</span>
      </div>

      {/* Controles / Instruções */}
      <div className="hud-controls">
        <span>← → mover</span>
        <span>↑ pular</span>
      </div>

      {/* Tela de conclusão */}
      {levelCompleted && (
        <div className="hud-completion-overlay">
          <div className="hud-completion-card">
            <h2>🎉 Nível Concluído!</h2>
            <div className="hud-completion-stats">
              <div className="completion-stat">
                <span className="stat-label">Tempo</span>
                <span className="stat-value">{formatTime(timeMs)}</span>
              </div>
              <div className="completion-stat">
                <span className="stat-label">Moedas</span>
                <span className="stat-value">{coins}/3</span>
              </div>
              <div className="completion-stat">
                <span className="stat-label">Mortes</span>
                <span className="stat-value">{deaths}</span>
              </div>
            </div>
            <button className="hud-completion-button" onClick={onBackToMenu}>
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}

      {/* Debug info (apenas em desenvolvimento) */}
      {showDebug && (
        <div className="hud-debug">
          <span>Game Ready: {gameReady ? '✅' : '⏳'}</span>
          <span>Coins: {coins}/{totalCoins}</span>
          <span>Deaths: {deaths}</span>
          <span>Time: {formatTime(timeMs)}</span>
        </div>
      )}
    </div>
  );
}
