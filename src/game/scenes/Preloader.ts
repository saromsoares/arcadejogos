import Phaser from 'phaser';

/**
 * Preloader Scene
 * 
 * Responsável por:
 * - Carregar todos os assets do jogo
 * - Mostrar barra de progresso
 * - Criar texturas placeholder (para desenvolvimento)
 * 
 * No MVP final, substituir os placeholders por assets reais.
 */
export default class Preloader extends Phaser.Scene {
  constructor() {
    super({ key: 'Preloader' });
  }

  preload(): void {
    // Criar barra de loading
    this.createLoadingBar();

    // Gerar texturas placeholder (substituir por assets reais depois)
    this.createPlaceholderTextures();
  }

  create(): void {
    // Transição para a cena principal
    this.scene.start('MainScene');
  }

  /**
   * Cria uma barra de loading visual
   */
  private createLoadingBar(): void {
    const { width, height } = this.cameras.main;
    const barWidth = 320;
    const barHeight = 32;
    const x = (width - barWidth) / 2;
    const y = (height - barHeight) / 2;

    // Background da barra
    const bgBar = this.add.graphics();
    bgBar.fillStyle(0x1a1a2e, 1);
    bgBar.fillRoundedRect(x, y, barWidth, barHeight, 8);

    // Barra de progresso
    const progressBar = this.add.graphics();

    // Texto de loading
    const loadingText = this.add.text(width / 2, y - 30, 'Carregando...', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    // Atualizar barra conforme carrega
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x7c3aed, 1); // Roxo vibrante
      progressBar.fillRoundedRect(x + 4, y + 4, (barWidth - 8) * value, barHeight - 8, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      bgBar.destroy();
      loadingText.destroy();
    });
  }

  /**
   * Gera texturas placeholder usando Graphics API do Phaser
   * Isso permite desenvolver sem assets finais
   * 
   * TODO: Substituir por assets reais do style guide
   */
  private createPlaceholderTextures(): void {
    // ==========================================
    // PLAYER - Retângulo arredondado azul
    // ==========================================
    const playerGraphics = this.make.graphics({ x: 0, y: 0 });
    playerGraphics.fillStyle(0x3b82f6, 1); // Azul
    playerGraphics.fillRoundedRect(0, 0, 48, 64, 8);
    // Olhos
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(16, 20, 6);
    playerGraphics.fillCircle(32, 20, 6);
    // Pupilas
    playerGraphics.fillStyle(0x1e293b, 1);
    playerGraphics.fillCircle(18, 20, 3);
    playerGraphics.fillCircle(34, 20, 3);
    // Sorriso
    playerGraphics.lineStyle(3, 0x1e293b, 1);
    playerGraphics.beginPath();
    playerGraphics.arc(24, 38, 10, 0.2, Math.PI - 0.2, false);
    playerGraphics.strokePath();
    playerGraphics.generateTexture('player', 48, 64);
    playerGraphics.destroy();

    // ==========================================
    // MOEDA - Círculo dourado com brilho
    // ==========================================
    const coinGraphics = this.make.graphics({ x: 0, y: 0 });
    // Sombra
    coinGraphics.fillStyle(0xb8860b, 1);
    coinGraphics.fillCircle(18, 18, 14);
    // Corpo da moeda
    coinGraphics.fillStyle(0xffd700, 1);
    coinGraphics.fillCircle(16, 16, 14);
    // Brilho
    coinGraphics.fillStyle(0xfffacd, 0.6);
    coinGraphics.fillCircle(12, 12, 5);
    coinGraphics.generateTexture('coin', 32, 32);
    coinGraphics.destroy();

    // ==========================================
    // CHÃO/PLATAFORMA - Retângulo verde
    // ==========================================
    const groundGraphics = this.make.graphics({ x: 0, y: 0 });
    groundGraphics.fillStyle(0x22c55e, 1); // Verde
    groundGraphics.fillRect(0, 0, 64, 32);
    // Textura de grama
    groundGraphics.fillStyle(0x16a34a, 1);
    for (let i = 0; i < 8; i++) {
      groundGraphics.fillRect(i * 8 + 2, 0, 4, 6);
    }
    groundGraphics.generateTexture('ground', 64, 32);
    groundGraphics.destroy();

    // ==========================================
    // BACKGROUND - Gradiente céu
    // ==========================================
    const bgGraphics = this.make.graphics({ x: 0, y: 0 });
    // Gradiente simulado com faixas
    const bgHeight = 600;
    const bgWidth = 800;
    for (let i = 0; i < bgHeight; i++) {
      const ratio = i / bgHeight;
      // Interpolar de azul claro (topo) para azul mais escuro (base)
      const r = Math.floor(135 + (59 - 135) * ratio);
      const g = Math.floor(206 + (130 - 206) * ratio);
      const b = Math.floor(235 + (246 - 235) * ratio);
      bgGraphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bgGraphics.fillRect(0, i, bgWidth, 1);
    }
    bgGraphics.generateTexture('background', bgWidth, bgHeight);
    bgGraphics.destroy();
  }
}
