import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as Phaser from 'phaser';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { 
  HighlightEvent, 
  Team, 
  PITCH_WIDTH, 
  PITCH_HEIGHT, 
  TEAM_COLORS, 
  ANIMATION_DURATIONS, 
  HighlightEventType,
  HighlightPhaserSceneProps
} from '../types/highlight';

// --- Helper Functions and Constants ---

// Default team data creator, moved outside the component to prevent recreation on re-renders.
const getDefaultTeam = (id: string, name: string, team: 'A' | 'B'): Team => ({
  id,
  name,
  formation: '4-4-2',
  players: [
    {
      id: `${team}1`,
      name: `${name} Player`,
      number: team === 'A' ? 10 : 5,
      position: team === 'A' ? 'FW' : 'DF',
      team
    }
  ]
});

// --- Phaser Scene ---

class HighlightScene extends Phaser.Scene {
  private homeTeam: Readonly<Team> = getDefaultTeam('home', 'Home', 'A');
  private awayTeam: Readonly<Team> = getDefaultTeam('away', 'Away', 'B');
  private onCompleteCb: () => void = () => {};
  private onReadyCb: () => void = () => {};
  
  private players: Phaser.GameObjects.Arc[] = [];
  private ball: Phaser.GameObjects.Arc | null = null;
  private scoreText: Phaser.GameObjects.Text | null = null;
  private minuteText: Phaser.GameObjects.Text | null = null;
  
  private homeScore = 0;
  private awayScore = 0;
  private isAnimating = false;
  private isDestroyed = false;

  constructor() {
    super('HighlightScene');
  }

  init(data: { homeTeam: Team; awayTeam: Team; onComplete: () => void; onReady: () => void; }) {
    this.homeTeam = data.homeTeam;
    this.awayTeam = data.awayTeam;
    this.onCompleteCb = data.onComplete;
    this.onReadyCb = data.onReady;
  }

  preload() {
    this.load.once('complete', () => {
      if (!this.isDestroyed) {
        this.onReadyCb?.();
      }
    });
    this.load.start();
  }

  create() {
    this.createField();
    this.createPlayers();
    this.createBall();
    this.createUI();
  }

  public updateHighlight(highlightEvent: HighlightEvent) {
    if (this.isAnimating || this.isDestroyed) {
      return;
    }
    this.isAnimating = true;
    this.startHighlight(highlightEvent).catch(error => {
      console.error('Error in highlight animation:', error);
      this.isAnimating = false;
      this.onCompleteCb();
    });
  }

  private createField() {
    const g = this.add.graphics();
    g.fillStyle(0x2e8b57, 1);
    g.fillRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
    g.lineStyle(2, 0xffffff, 0.8);
    g.beginPath();
    g.moveTo(PITCH_WIDTH / 2, 0);
    g.lineTo(PITCH_WIDTH / 2, PITCH_HEIGHT);
    g.strokePath();
    g.strokeCircle(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 50);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 4);
    g.lineStyle(4, 0xffffff, 1);
    g.strokeRect(0, 0, PITCH_WIDTH, PITCH_HEIGHT);
    g.fillStyle(0x2a7f4c, 0.3);
    for (let y = 0; y < PITCH_HEIGHT; y += 40) {
      for (let x = 0; x < PITCH_WIDTH; x += 40) {
        if ((x / 40 + y / 40) % 2 === 0) {
          g.fillRect(x, y, 20, 20);
        }
      }
    }
  }

  private createPlayers() {
    const homePlayer = this.homeTeam.players?.[0];
    const awayPlayer = this.awayTeam.players?.[0];
    
    const home = this.add.circle(200, PITCH_HEIGHT / 2, 14, TEAM_COLORS.A);
    home.setData({ team: 'A', name: homePlayer?.name || 'Home', number: homePlayer?.number || 10 });
    
    const homeText = this.add.text(home.x, home.y, homePlayer?.number?.toString() || '10', { fontSize: '12px', color: '#ffffff', fontFamily: 'Arial, sans-serif', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
    home.setData('text', homeText);
    this.players.push(home);

    const away = this.add.circle(PITCH_WIDTH - 200, PITCH_HEIGHT / 2, 14, TEAM_COLORS.B);
    away.setData({ team: 'B', name: awayPlayer?.name || 'Away', number: awayPlayer?.number || 7 });
    
    const awayText = this.add.text(away.x, away.y, awayPlayer?.number?.toString() || '7', { fontSize: '12px', color: '#ffffff', fontFamily: 'Arial, sans-serif', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
    away.setData('text', awayText);
    this.players.push(away);
    
    this.players.forEach(player => {
      player.setInteractive();
      player.on('pointerover', () => {
        if (this.isDestroyed) return;
        const data = player.getData('player') as { name: string; number: number };
        const tooltip = this.add.text(player.x, player.y - 30, `${data.name} (${data.number})`, { fontSize: '12px', color: '#ffffff', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: { x: 5, y: 2 } }).setOrigin(0.5);
        player.setData('tooltip', tooltip);
      });
      
      player.on('pointerout', () => {
        if (this.isDestroyed) return;
        const tooltip = player.getData('tooltip');
        if (tooltip) {
          tooltip.destroy();
          player.setData('tooltip', null);
        }
      });
    });
  }

  private createBall() {
    this.ball = this.add.circle(PITCH_WIDTH / 2, PITCH_HEIGHT / 2, 6, 0xffffff);
    this.ball.setStrokeStyle(2, 0xcccccc, 0.5);
    
    const glow = this.add.circle(this.ball.x, this.ball.y, this.ball.radius * 1.5, 0xffffff, 0.3);
    this.ball.setData('glow', glow);
    
    this.tweens.add({
      targets: [this.ball, glow],
      y: '+=5',
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createUI() {
    this.scoreText = this.add.text(PITCH_WIDTH / 2, 20, `${this.homeTeam.name} 00 - 00 ${this.awayTeam.name}`, { fontSize: '18px', color: '#ffffff', fontFamily: 'Arial, sans-serif', stroke: '#000000', strokeThickness: 3, shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 2, stroke: true, fill: true } }).setOrigin(0.5, 0.5);
    this.minuteText = this.add.text(PITCH_WIDTH - 60, 20, `0'`, { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial, sans-serif', backgroundColor: 'rgba(0, 0, 0, 0.7)', padding: { x: 10, y: 5 } }).setOrigin(0.5, 0.5);
  }
  
  private getEventTypeText = (type: HighlightEventType): string => ({
    goal: 'GOAL!', miss: 'MISSED!', save: 'SAVED!', yellow: 'YELLOW CARD', red: 'RED CARD', halftime: 'HALF TIME', fulltime: 'FULL TIME'
  }[type] || '');
  
  private getEventTypeColor = (type: HighlightEventType): string => ({
    goal: 'rgba(0, 200, 0, 0.8)', 
    miss: 'rgba(200, 0, 0, 0.8)', 
    save: 'rgba(0, 100, 200, 0.8)', 
    yellow: 'rgba(255, 255, 0, 0.8)', 
    red: 'rgba(255, 0, 0, 0.8)',
    halftime: 'rgba(255, 165, 0, 0.8)',
    fulltime: 'rgba(255, 255, 255, 0.8)'
  }[type] || 'rgba(0, 0, 0, 0.8)');

  private updateScore() {
    if (this.scoreText && !this.isDestroyed) {
      const homeScore = this.homeScore.toString().padStart(2, '0');
      const awayScore = this.awayScore.toString().padStart(2, '0');
      this.scoreText.setText(`${this.homeTeam.name} ${homeScore} - ${awayScore} ${this.awayTeam.name}`);
      this.tweens.add({ targets: this.scoreText, scale: 1.2, duration: 200, yoyo: true, ease: 'Power1' });
      this.tweens.add({ targets: this.scoreText, alpha: 0.5, duration: 100, yoyo: true, repeat: 1 });
    }
  }

  private cleanup(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    
    this.players.forEach(player => {
      player.getData('text')?.destroy();
      player.getData('tooltip')?.destroy();
      if (player.active) player.destroy();
    });
    this.players = [];
    
    if (this.ball?.active) {
      this.ball.getData('glow')?.destroy();
      this.ball.destroy();
      this.ball = null;
    }
    
    this.scoreText?.destroy();
    this.minuteText?.destroy();
    this.scoreText = null;
    this.minuteText = null;
    
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
  
  shutdown(): void {
    this.cleanup();
  }

  private showCelebration(isHomeTeam: boolean) {
    const teamColor = isHomeTeam ? TEAM_COLORS.A : TEAM_COLORS.B;
    const celebrationText = this.add.text(PITCH_WIDTH / 2, PITCH_HEIGHT / 4, 'GOAL!', { fontSize: '48px', color: '#ffffff', backgroundColor: `#${teamColor.toString(16)}`, padding: { x: 20, y: 10 }, fontStyle: 'bold' }).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: celebrationText,
      y: PITCH_HEIGHT / 3,
      alpha: 0,
      duration: ANIMATION_DURATIONS.CELEBRATE,
      ease: 'Power2',
      onComplete: () => celebrationText.destroy()
    });
  }

  private async startHighlight(highlightEvent: HighlightEvent) {
    if (this.isDestroyed || !this.ball) {
      this.onCompleteCb();
      return;
    }

    this.minuteText?.setText(`${highlightEvent.minute}'`);

    const eventText = this.add.text(PITCH_WIDTH / 2, 50, this.getEventTypeText(highlightEvent.type), { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial, sans-serif', backgroundColor: this.getEventTypeColor(highlightEvent.type), padding: { x: 10, y: 5 } }).setOrigin(0.5, 0.5);
    this.tweens.add({ targets: eventText, y: 70, alpha: 0, delay: 2000, duration: 1000, onComplete: () => eventText.destroy() });

    if (highlightEvent.type !== 'goal' && highlightEvent.type !== 'miss') {
      this.time.delayedCall(ANIMATION_DURATIONS.CELEBRATE, () => {
        if (!this.isDestroyed) {
          this.isAnimating = false;
          this.onCompleteCb();
        }
      });
      return;
    }

    const isHomeTeam = highlightEvent.team === 'A';
    const shooter = this.players.find(p => p.getData('team') === highlightEvent.team) || this.players[0];
    const goalY = PITCH_HEIGHT / 2 + (Math.random() * 100 - 50);
    
    if (shooter) {
      const shooterX = isHomeTeam ? 200 : PITCH_WIDTH - 200;
      shooter.setPosition(shooterX, PITCH_HEIGHT / 2);
      this.ball.setPosition(shooterX + (isHomeTeam ? 20 : -20), PITCH_HEIGHT / 2);
    }
    
    const targetX = isHomeTeam ? PITCH_WIDTH : 0;
    const controlY = PITCH_HEIGHT / 4 + Math.random() * (PITCH_HEIGHT / 2);
    const curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(this.ball.x, this.ball.y), new Phaser.Math.Vector2((this.ball.x + targetX) / 2, controlY), new Phaser.Math.Vector2(targetX, goalY));
    
    this.tweens.add({
      targets: this.ball,
      x: targetX,
      y: goalY,
      duration: ANIMATION_DURATIONS.BALL_FLIGHT,
      ease: 'Power1',
      onUpdate: (tween: Phaser.Tweens.Tween) => {
        const point = curve.getPoint(tween.progress);
        this.ball?.setPosition(point.x, point.y);
      },
      onComplete: () => {
        if (this.isDestroyed) return;
        
        if (highlightEvent.type === 'goal') {
          isHomeTeam ? this.homeScore++ : this.awayScore++;
          this.updateScore();
          this.showCelebration(isHomeTeam);
        }
        
        this.time.delayedCall(ANIMATION_DURATIONS.CELEBRATE, () => {
          if (!this.isDestroyed) {
            this.isAnimating = false;
            this.onCompleteCb();
          }
        });
      }
    });
  }
}

// --- React Component ---

const HighlightPhaserScene: React.FC<HighlightPhaserSceneProps> = ({
  highlightEvent,
  homeTeam,
  awayTeam,
  onComplete,
  onReady,
  onError
}) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<HighlightScene | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs for callbacks to prevent re-triggering useEffect
  const onCompleteRef = useRef(onComplete);
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onReadyRef.current = onReady;
    onErrorRef.current = onError;
  });

  const normalizedEvent = useMemo<HighlightEvent>(() => ({
    ...highlightEvent,
    playerName: highlightEvent.playerName || 'Player',
    description: highlightEvent.description || ''
  }), [highlightEvent]);

  const safeHomeTeam = useMemo(() => homeTeam || getDefaultTeam('home', 'Home', 'A'), [homeTeam]);
  const safeAwayTeam = useMemo(() => awayTeam || getDefaultTeam('away', 'Away', 'B'), [awayTeam]);

  useEffect(() => {
    let isMounted = true;

    const initializeGame = async () => {
      try {
        if (!gameContainerRef.current || gameRef.current) return;

        const scene = new HighlightScene();
        sceneRef.current = scene;

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: PITCH_WIDTH,
          height: PITCH_HEIGHT,
          backgroundColor: '#2d2d2d',
          parent: gameContainerRef.current,
          scene: scene,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
          },
          physics: {
            default: 'arcade',
            arcade: {
              debug: process.env.NODE_ENV !== 'production',
              gravity: { x: 0, y: 0 }
            }
          }
        };

        const game = new Phaser.Game(config);
        gameRef.current = game;
        
        game.scene.start('HighlightScene', {
          homeTeam: safeHomeTeam,
          awayTeam: safeAwayTeam,
          onComplete: () => onCompleteRef.current?.(),
          onReady: () => {
            if (isMounted) {
              setLoading(false);
              onReadyRef.current?.();
            }
          }
        });

      } catch (err) {
        console.error('Error initializing game:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
        if (isMounted) {
          setError(errorMessage);
          setLoading(false);
          onErrorRef.current?.(err instanceof Error ? err : new Error(errorMessage));
        }
      }
    };

    initializeGame();

    return () => {
      isMounted = false;
      gameRef.current?.destroy(true);
      gameRef.current = null;
      sceneRef.current = null;
    };
  }, [safeHomeTeam, safeAwayTeam]); // Effect for initialization, depends on teams

  useEffect(() => {
    if (sceneRef.current && !loading && !error) {
      sceneRef.current.updateHighlight(normalizedEvent);
    }
  }, [normalizedEvent, loading, error]); // Effect for updates

  if (loading) {
    return <div className="flex items-center justify-center w-full h-full"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="flex items-center justify-center w-full h-full"><ErrorMessage message={error} /></div>;
  }

  return (
    <div 
      className="relative w-full h-full"
      role="region"
      aria-label="Football highlight animation"
      aria-live="polite"
    >
      <div 
        ref={gameContainerRef} 
        className="w-full h-full" 
        aria-hidden={!!error}
      />
    </div>
  );
};

export default HighlightPhaserScene;
