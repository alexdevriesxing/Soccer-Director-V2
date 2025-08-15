import Phaser from 'phaser';

export class MatchHighlightScene extends Phaser.Scene {
    private homeTeam!: string;
    private awayTeam!: string;
    private homeScore: number = 0;
    private awayScore: number = 0;
    private matchEvents: MatchEvent[] = [];
    private currentEventIndex: number = 0;
    private isPlaying: boolean = false;
    private onComplete?: () => void;

    // Game objects
    private field!: Phaser.GameObjects.Graphics;
    private homeGoal!: Phaser.GameObjects.Rectangle;
    private awayGoal!: Phaser.GameObjects.Rectangle;
    private ball!: Phaser.GameObjects.Graphics;
    private homePlayers: Phaser.GameObjects.Rectangle[] = [];
    private awayPlayers: Phaser.GameObjects.Rectangle[] = [];
    private scoreText!: Phaser.GameObjects.Text;
    private eventText!: Phaser.GameObjects.Text;
    private timeText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MatchHighlightScene' });
    }

    init(data: {
        homeTeam: string;
        awayTeam: string;
        events: MatchEvent[];
        onComplete?: () => void;
    }) {
        this.homeTeam = data.homeTeam;
        this.awayTeam = data.awayTeam;
        this.matchEvents = data.events;
        this.onComplete = data.onComplete;
        this.currentEventIndex = 0;
        this.isPlaying = false;
    }

    create() {
        // Set background
        this.cameras.main.setBackgroundColor('#2d5a27');

        // Create football field
        this.createField();

        // Create goals
        this.createGoals();

        // Create players
        this.createPlayers();

        // Create ball
        this.createBall();

        // Create UI elements
        this.createUI();

        // Start the highlight sequence
        this.startHighlightSequence();
    }

    private createField() {
        this.field = this.add.graphics();
        
        // Main field
        this.field.fillStyle(0x4a7c59);
        this.field.fillRect(50, 50, 700, 400);
        
        // Field lines
        this.field.lineStyle(2, 0xffffff);
        
        // Center line
        this.field.moveTo(400, 50);
        this.field.lineTo(400, 450);
        
        // Center circle
        this.field.strokeCircle(400, 250, 50);
        
        // Penalty areas
        this.field.strokeRect(50, 150, 100, 200); // Left penalty area
        this.field.strokeRect(650, 150, 100, 200); // Right penalty area
        
        // Goal areas
        this.field.strokeRect(50, 200, 50, 100); // Left goal area
        this.field.strokeRect(700, 200, 50, 100); // Right goal area
    }

    private createGoals() {
        this.homeGoal = this.add.rectangle(25, 250, 10, 80, 0xffffff);
        this.awayGoal = this.add.rectangle(775, 250, 10, 80, 0xffffff);
    }

    private createPlayers() {
        // Home team players (left side, blue)
        const homePositions = [
            { x: 150, y: 100 }, { x: 150, y: 200 }, { x: 150, y: 300 }, { x: 150, y: 400 },
            { x: 250, y: 150 }, { x: 250, y: 250 }, { x: 250, y: 350 },
            { x: 350, y: 200 }, { x: 350, y: 300 }
        ];

        homePositions.forEach((pos, index) => {
            const player = this.add.rectangle(pos.x, pos.y, 20, 20, 0x0066cc);
            this.homePlayers.push(player);
        });

        // Away team players (right side, red)
        const awayPositions = [
            { x: 650, y: 100 }, { x: 650, y: 200 }, { x: 650, y: 300 }, { x: 650, y: 400 },
            { x: 550, y: 150 }, { x: 550, y: 250 }, { x: 550, y: 350 },
            { x: 450, y: 200 }, { x: 450, y: 300 }
        ];

        awayPositions.forEach((pos, index) => {
            const player = this.add.rectangle(pos.x, pos.y, 20, 20, 0xcc0000);
            this.awayPlayers.push(player);
        });
    }

    private createBall() {
        this.ball = this.add.graphics();
        this.ball.fillStyle(0xffffff);
        this.ball.fillCircle(400, 250, 8);
    }

    private createUI() {
        // Score display
        this.scoreText = this.add.text(400, 20, `${this.homeTeam} ${this.homeScore} - ${this.awayScore} ${this.awayTeam}`, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Event description
        this.eventText = this.add.text(400, 480, '', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // Time display
        this.timeText = this.add.text(750, 20, '0\'', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
    }

    private startHighlightSequence() {
        if (this.matchEvents.length === 0) {
            this.completeSequence();
            return;
        }

        this.isPlaying = true;
        this.playNextEvent();
    }

    private playNextEvent() {
        if (this.currentEventIndex >= this.matchEvents.length) {
            this.completeSequence();
            return;
        }

        const event = this.matchEvents[this.currentEventIndex];
        this.playEvent(event);
    }

    private playEvent(event: MatchEvent) {
        // Update time display
        this.timeText.setText(`${event.minute}'`);

        // Update event description
        this.eventText.setText(event.description);

        switch (event.type) {
            case 'GOAL':
                this.playGoalAnimation(event);
                break;
            case 'NEAR_MISS':
                this.playNearMissAnimation(event);
                break;
            case 'SAVE':
                this.playSaveAnimation(event);
                break;
            case 'YELLOW_CARD':
                this.playCardAnimation(event, 0xffff00);
                break;
            case 'RED_CARD':
                this.playCardAnimation(event, 0xff0000);
                break;
            case 'INJURY':
                this.playInjuryAnimation(event);
                break;
            default:
                this.playGenericAnimation(event);
        }
    }

    private playGoalAnimation(event: MatchEvent) {
        // Determine which team scored
        const isHomeGoal = event.teamId === 1; // Assuming 1 = home, 2 = away
        const targetGoal = isHomeGoal ? this.awayGoal : this.homeGoal;
        
        // Update score
        if (isHomeGoal) {
            this.homeScore++;
        } else {
            this.awayScore++;
        }
        this.scoreText.setText(`${this.homeTeam} ${this.homeScore} - ${this.awayScore} ${this.awayTeam}`);

        // Animate ball to goal
        this.tweens.add({
            targets: this.ball,
            x: targetGoal.x,
            y: targetGoal.y,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                // Goal celebration effect
                this.createGoalEffect(targetGoal.x, targetGoal.y);
                
                // Wait then move to next event
                this.time.delayedCall(2000, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private playNearMissAnimation(event: MatchEvent) {
        const isHomeShot = event.teamId === 1;
        const targetGoal = isHomeShot ? this.awayGoal : this.homeGoal;
        
        // Animate ball towards goal but miss
        const missOffset = Phaser.Math.Between(-30, 30);
        this.tweens.add({
            targets: this.ball,
            x: targetGoal.x + missOffset,
            y: targetGoal.y + missOffset,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                // Near miss effect
                this.createNearMissEffect(targetGoal.x + missOffset, targetGoal.y + missOffset);
                
                this.time.delayedCall(1500, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private playSaveAnimation(event: MatchEvent) {
        const isHomeShot = event.teamId === 1;
        const targetGoal = isHomeShot ? this.awayGoal : this.homeGoal;
        
        // Animate ball towards goal
        this.tweens.add({
            targets: this.ball,
            x: targetGoal.x,
            y: targetGoal.y,
            duration: 600,
            ease: 'Power2',
            onComplete: () => {
                // Save effect
                this.createSaveEffect(targetGoal.x, targetGoal.y);
                
                this.time.delayedCall(1500, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private playCardAnimation(event: MatchEvent, color: number) {
        // Create card effect
        const card = this.add.rectangle(400, 250, 60, 80, color);
        card.setStrokeStyle(2, 0x000000);
        
        this.tweens.add({
            targets: card,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                card.destroy();
                this.time.delayedCall(1000, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private playInjuryAnimation(event: MatchEvent) {
        // Create injury effect
        const injuryEffect = this.add.graphics();
        injuryEffect.fillStyle(0xff0000, 0.3);
        injuryEffect.fillCircle(400, 250, 100);
        
        this.tweens.add({
            targets: injuryEffect,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                injuryEffect.destroy();
                this.time.delayedCall(1000, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private playGenericAnimation(event: MatchEvent) {
        // Simple pulse effect
        this.tweens.add({
            targets: this.ball,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 300,
            yoyo: true,
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.currentEventIndex++;
                    this.playNextEvent();
                });
            }
        });
    }

    private createGoalEffect(x: number, y: number) {
        // Goal celebration effect using graphics
        const effect = this.add.graphics();
        effect.fillStyle(0xffff00, 0.8);
        
        // Create multiple circles for celebration effect
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 30 + Math.random() * 20;
            const effectX = x + Math.cos(angle) * radius;
            const effectY = y + Math.sin(angle) * radius;
            effect.fillCircle(effectX, effectY, 5 + Math.random() * 5);
        }

        // Add some additional celebration effects
        const sparkles = this.add.graphics();
        sparkles.fillStyle(0xff0000, 0.6);
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
            const radius = 40 + Math.random() * 15;
            const sparkleX = x + Math.cos(angle) * radius;
            const sparkleY = y + Math.sin(angle) * radius;
            sparkles.fillCircle(sparkleX, sparkleY, 3 + Math.random() * 3);
        }

        this.tweens.add({
            targets: [effect, sparkles],
            alpha: 0,
            scaleX: 2,
            scaleY: 2,
            duration: 1000,
            onComplete: () => {
                effect.destroy();
                sparkles.destroy();
            }
        });
    }

    private createNearMissEffect(x: number, y: number) {
        // Near miss effect
        const effect = this.add.graphics();
        effect.lineStyle(3, 0xffff00);
        effect.strokeCircle(x, y, 30);
        
        this.tweens.add({
            targets: effect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 1000,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    private createSaveEffect(x: number, y: number) {
        // Save effect
        const effect = this.add.graphics();
        effect.fillStyle(0x00ff00, 0.5);
        effect.fillCircle(x, y, 40);
        
        this.tweens.add({
            targets: effect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                effect.destroy();
            }
        });
    }

    private completeSequence() {
        this.isPlaying = false;
        this.eventText.setText('Match Complete');
        
        this.time.delayedCall(2000, () => {
            if (this.onComplete) {
                this.onComplete();
            }
        });
    }
}

export interface MatchEvent {
    type: 'GOAL' | 'NEAR_MISS' | 'SAVE' | 'YELLOW_CARD' | 'RED_CARD' | 'INJURY' | 'SUBSTITUTION';
    minute: number;
    description: string;
    playerName?: string;
    teamId?: number; // 1 = home, 2 = away
} 