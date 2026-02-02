import { useState } from 'react';
import PhaserGame from './game/PhaserGame';
import Hud from './ui/Hud';
import LevelSelect from './ui/LevelSelect';
import { gameState } from './game/GameState';
import './styles/global.css';

/**
 * App Component - Raiz da aplicação
 * 
 * Estados:
 * - 'menu': Tela de seleção de fases
 * - 'playing': Jogo em andamento
 */
function App() {
  const [gameState_, setGameState] = useState<'menu' | 'playing'>('menu');
  const isDev = import.meta.env.DEV;

  const handleLevelSelected = (levelId: string) => {
    gameState.setSelectedLevel(levelId);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="app">
      {gameState_ === 'menu' ? (
        <LevelSelect onLevelSelected={handleLevelSelected} />
      ) : (
        <>
          {/* Canvas do Phaser */}
          <PhaserGame 
            width={800} 
            height={600}
          />
          
          {/* HUD React sobreposto */}
          <Hud showDebug={isDev} onBackToMenu={handleBackToMenu} />
        </>
      )}
    </div>
  );
}

export default App;
