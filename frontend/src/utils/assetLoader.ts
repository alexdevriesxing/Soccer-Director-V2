import * as Phaser from 'phaser';
import { TeamAAssets, TeamBAssets, CommonAssets, AnimationTypes } from '../config/assets';

type LoaderCallback = (progress: number) => void;

export class AssetLoader {
  private scene: Phaser.Scene;
  private totalAssets = 0;
  private loadedAssets = 0;
  private onProgress?: LoaderCallback;
  private onComplete?: () => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  loadAssets(onProgress?: LoaderCallback, onComplete?: () => void) {
    this.onProgress = onProgress;
    this.onComplete = onComplete;
    
    // Load team A assets
    this.loadTeamAssets('A', TeamAAssets);
    
    // Load team B assets
    this.loadTeamAssets('B', TeamBAssets);
    
    // Load common assets
    this.loadCommonAssets();
    
    // Start loading
    this.scene.load.start();
  }

  private loadTeamAssets(team: 'A' | 'B', assets: typeof TeamAAssets) {
    // Load player sprite sheets
    const directions = ['EAST', 'NORTHEAST', 'NORTH', 'NORTHWEST', 'WEST', 'SOUTHWEST', 'SOUTH', 'SOUTHEAST'];
    
    // Load run animations
    directions.forEach(dir => {
      const key = `${team}_run_${dir}`.toLowerCase();
      this.scene.load.spritesheet(
        key,
        `${assets.run}/Team_${team}_Run_${dir}_strip4.png`,
        { frameWidth: 64, frameHeight: 64 }
      );
      this.totalAssets++;
    });
    
    // Load kick animations
    directions.forEach(dir => {
      const key = `${team}_kick_${dir}`.toLowerCase();
      this.scene.load.spritesheet(
        key,
        `${assets.kick}/Team_${team}_Kick_${dir}_strip6.png`,
        { frameWidth: 64, frameHeight: 64 }
      );
      this.totalAssets++;
    });
    
    // Load celebration animations
    directions.forEach(dir => {
      const key = `${team}_celebrate_${dir}`.toLowerCase();
      this.scene.load.spritesheet(
        key,
        `${assets.celebration}/Team_${team}_Celebration_${dir}_strip8.png`,
        { frameWidth: 64, frameHeight: 64 }
      );
      this.totalAssets++;
    });
    
    // Load goalkeeper animations
    directions.forEach(dir => {
      const key = `${team}_goalkeeper_${dir}`.toLowerCase();
      this.scene.load.spritesheet(
        key,
        `${assets.goalkeeper}/Team_${team}_Goalkeeper_${dir}_strip4.png`,
        { frameWidth: 64, frameHeight: 64 }
      );
      this.totalAssets++;
    });
  }

  private loadCommonAssets() {
    // Load ball
    this.scene.load.image('ball', CommonAssets.ball);
    this.totalAssets++;
  }

  private createAnimations() {
    const directions = ['east', 'northeast', 'north', 'northwest', 'west', 'southwest', 'south', 'southeast'];
    const teams = ['a', 'b'] as const;
    
    teams.forEach(team => {
      // Create run animations
      directions.forEach(dir => {
        const key = `${team}_run_${dir}`;
        this.scene.anims.create({
          key,
          frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        });
      });
      
      // Create kick animations
      directions.forEach(dir => {
        const key = `${team}_kick_${dir}`;
        this.scene.anims.create({
          key,
          frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 5 }),
          frameRate: 10,
          repeat: 0
        });
      });
      
      // Create celebration animations
      directions.forEach(dir => {
        const key = `${team}_celebrate_${dir}`;
        this.scene.anims.create({
          key,
          frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 7 }),
          frameRate: 10,
          repeat: -1
        });
      });
      
      // Create goalkeeper animations
      directions.forEach(dir => {
        const key = `${team}_goalkeeper_${dir}`;
        this.scene.anims.create({
          key,
          frames: this.scene.anims.generateFrameNumbers(key, { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        });
      });
    });
  }

  private onAssetLoaded() {
    this.loadedAssets++;
    const progress = Math.floor((this.loadedAssets / this.totalAssets) * 100);
    if (this.onProgress) {
      this.onProgress(progress);
    }
    
    if (this.loadedAssets >= this.totalAssets && this.onComplete) {
      this.onComplete();
    }
  }
}
