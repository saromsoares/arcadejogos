import EventBus from '../events';
import { loadLevel } from '../levels/loadLevel';
import { LevelData, WindZone } from '../levels/schema';
import { gameState } from '../GameState';

/**
 * MainScene - Cena principal do jogo
 * 
 * Carrega fases a partir de JSON e gerencia:
 * - Plataformas estáticas
 * - Hazards (espinhos)
 * - Collectibles (moedas)
 * - Wind Zones (vento)
 * - Goal/Portal
 * - Hints
 */
export default class MainScene extends Phaser.Scene {
  // Referências tipadas
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private coins!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.Sprite;
  private windZones: Map<string, WindZoneData> = new Map();
  private hintText!: Phaser.GameObjects.Text;

  // Estado do jogo
  private coinCount: number = 0;
  private canJump: boolean = true;
  private deaths: number = 0;
  private startTime: number = 0;
  private currentLevelData: LevelData | null = null;
  private levelId: string | null = null;

  // Configurações de movimento
  private readonly PLAYER_SPEED = 280;
  private readonly JUMP_VELOCITY = -450;
  private readonly GRAVITY = 800;
  private readonly WIND_FORCE_MULTIPLIER = 1;

  constructor() {
    super({ key: 'MainScene' });
  }

  async preload(): Promise<void> {
    // Pré-carregar assets
    this.load.image('player', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect fill="%234CAF50" width="32" height="32"/></svg>');
    this.load.image('ground', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect fill="%238B4513" width="64" height="32"/></svg>');
    this.load.image('background', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect fill="%2387CEEB" width="800" height="600"/></svg>');
    this.load.image('coin', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><circle cx="8" cy="8" r="8" fill="%23FFD700"/></svg>');
    this.load.image('spike', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><polygon points="16,0 32,32 0,32" fill="%23FF0000"/></svg>');
    this.load.image('portal', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="%23FF00FF" opacity="0.7"/></svg>');
  }

  async create(): Promise<void> {
    const { width, height } = this.cameras.main;

    // Obter ID da fase selecionada
    this.levelId = gameState.getSelectedLevel();
    if (!this.levelId) {
      console.error('No level selected');
      return;
    }

    // Carregar dados da fase
    try {
      this.currentLevelData = await loadLevel(this.levelId);
    } catch (error) {
      console.error('Failed to load level:', error);
      return;
    }

    // Background
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    // Inicializar grupos
    this.platforms = this.physics.add.staticGroup();
    this.coins = this.physics.add.group();
    this.hazards = this.physics.add.group();

    // Montar fase a partir do JSON
    this.mountLevel();

    // Criar player
    this.createPlayer();

    // Configurar input
    this.setupInput();

    // Configurar colisões
    this.setupCollisions();

    // Criar hint text (invisível inicialmente)
    this.hintText = this.add.text(width / 2, 50, '', {
      fontSize: '16px',
      color: '#fff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center',
    });
    this.hintText.setOrigin(0.5, 0);
    this.hintText.setVisible(false);

    // Iniciar cronômetro
    this.startTime = this.time.now;

    // Emitir evento de início
    EventBus.emit('level-started', {
      id: this.levelId,
      name: this.currentLevelData.name,
      totalCollectibles: this.currentLevelData.collectibles.length,
    });
  }

  update(): void {
    if (!this.currentLevelData) return;

    this.handlePlayerMovement();
    this.updateWindZones();
    this.checkHints();
  }

  /**
   * Monta a fase a partir dos dados do JSON
   */
  private mountLevel(): void {
    if (!this.currentLevelData) return;

    const levelData = this.currentLevelData;

    // Criar plataformas
    levelData.platforms.forEach((platform) => {
      this.platforms.create(platform.x, platform.y, 'ground').setScale(
        platform.width / 64,
        platform.height / 32
      );
    });

    // Criar hazards (espinhos)
    levelData.hazards.forEach((hazard) => {
      if (hazard.type === 'spikes') {
        const spike = this.hazards.create(hazard.x, hazard.y, 'spike');
        spike.setScale(hazard.width / 32, hazard.height / 32);
        spike.setImmovable(true);
      }
    });

    // Criar collectibles (moedas)
    levelData.collectibles.forEach((collectible) => {
      const coin = this.coins.create(collectible.x, collectible.y, 'coin');
      coin.setData('id', collectible.id);
      coin.setBounce(0.3);
    });

    // Criar goal (portal)
    const goalData = levelData.goal;
    this.goal = this.physics.add.sprite(goalData.x, goalData.y, 'portal');
    this.goal.setImmovable(true);
    this.goal.setScale(goalData.radius / 16);

    // Criar wind zones
    levelData.windZones.forEach((zone, index) => {
      this.windZones.set(`wind_${index}`, {
        zone,
        active: true,
        pulseTimer: 0,
      });
    });
  }

  /**
   * Cria e configura o player
   */
  private createPlayer(): void {
    if (!this.currentLevelData) return;

    const spawn = this.currentLevelData.playerSpawn;
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player');

    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(this.GRAVITY);
    this.player.setDisplaySize(32, 32);
  }

  /**
   * Configura input do teclado
   */
  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  /**
   * Configura colisões
   */
  private setupCollisions(): void {
    // Player colide com plataformas
    this.physics.add.collider(this.player, this.platforms);

    // Player coleta moedas
    this.physics.add.overlap(
      this.player,
      this.coins,
      this.collectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player toca em hazards
    this.physics.add.overlap(
      this.player,
      this.hazards,
      this.hitHazard as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );

    // Player toca no goal
    this.physics.add.overlap(
      this.player,
      this.goal,
      this.reachGoal as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      this
    );
  }

  /**
   * Lógica de movimento do player
   */
  private handlePlayerMovement(): void {
    // Movimento horizontal
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    // Detectar se está no chão
    const onGround = this.player.body?.touching.down ?? false;

    // Pulo
    if (this.cursors.up.isDown && onGround && this.canJump) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
      this.canJump = false;

      // Efeito visual de squash
      this.tweens.add({
        targets: this.player,
        scaleY: 1.15,
        scaleX: 0.9,
        duration: 100,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    // Reset do pulo
    if (this.cursors.up.isUp && onGround) {
      this.canJump = true;
    }

    // Squash ao pousar
    if (onGround && this.player.body!.velocity.y >= 0) {
      if (Math.abs(this.player.body!.velocity.y) < 5) {
        this.player.setScale(1, 1);
      }
    }
  }

  /**
   * Callback quando player coleta uma moeda
   */
  private collectCoin = (
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void => {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite;

    this.coinCount++;

    // Efeito visual
    this.tweens.add({
      targets: coinSprite,
      scale: 1.5,
      alpha: 0,
      y: coinSprite.y - 30,
      duration: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        coinSprite.destroy();
      },
    });

    // Emitir evento
    EventBus.emit('collectible-picked', {
      picked: this.coinCount,
      total: this.currentLevelData?.collectibles.length ?? 0,
    });
  };

  /**
   * Callback quando player toca em hazard
   */
  private hitHazard = (
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _hazard: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void => {
    this.deaths++;
    this.respawnPlayer();

    EventBus.emit('player-died', { deaths: this.deaths });
  };

  /**
   * Callback quando player atinge o goal
   */
  private reachGoal = (
    _player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
    _goal: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
  ): void => {
    if (!this.currentLevelData || !this.levelId) return;

    const timeMs = this.time.now - this.startTime;

    // Salvar progresso
    gameState.completeLevel(this.levelId, {
      id: this.levelId,
      timeMs,
      picked: this.coinCount,
      deaths: this.deaths,
    });

    // Emitir evento
    EventBus.emit('level-completed', {
      id: this.levelId,
      timeMs,
      picked: this.coinCount,
      deaths: this.deaths,
    });

    // Pausar jogo
    this.physics.pause();
  };

  /**
   * Respawna o player
   */
  private respawnPlayer(): void {
    if (!this.currentLevelData) return;

    const spawn = this.currentLevelData.playerSpawn;
    this.player.setPosition(spawn.x, spawn.y);
    this.player.setVelocity(0, 0);
  }

  /**
   * Atualiza wind zones
   */
  private updateWindZones(): void {
    this.windZones.forEach((windData) => {
      const zone = windData.zone;
      const playerX = this.player.x;
      const playerY = this.player.y;

      // Verificar se player está dentro da wind zone
      const inZone =
        playerX >= zone.x - zone.width / 2 &&
        playerX <= zone.x + zone.width / 2 &&
        playerY >= zone.y - zone.height / 2 &&
        playerY <= zone.y + zone.height / 2;

      if (!inZone) return;

      // Aplicar força do vento
      if (zone.type === 'constant') {
        this.player.setAccelerationX(zone.forceX * this.WIND_FORCE_MULTIPLIER);
        this.player.setAccelerationY(zone.forceY * this.WIND_FORCE_MULTIPLIER);
      } else if (zone.type === 'pulsed' && zone.pulseDuration) {
        windData.pulseTimer += this.game.loop.delta;

        const cycle = windData.pulseTimer % (zone.pulseDuration * 2);
        if (cycle < zone.pulseDuration) {
          this.player.setAccelerationX(zone.forceX * this.WIND_FORCE_MULTIPLIER);
          this.player.setAccelerationY(zone.forceY * this.WIND_FORCE_MULTIPLIER);
        }
      }
    });
  }

  /**
   * Verifica e exibe hints
   */
  private checkHints(): void {
    if (!this.currentLevelData || !this.hintText) return;

    if (this.deaths >= 3 && this.currentLevelData.hints.length > 0) {
      const hintIndex = Math.min(
        Math.floor(this.deaths / 3) - 1,
        this.currentLevelData.hints.length - 1
      );
      const hint = this.currentLevelData.hints[hintIndex];
      if (hint) {
        this.hintText.setText(hint);
        this.hintText.setVisible(true);
      }
    } else {
      this.hintText.setVisible(false);
    }
  }
}

/**
 * Dados internos de wind zone
 */
interface WindZoneData {
  zone: WindZone;
  active: boolean;
  pulseTimer: number;
}
