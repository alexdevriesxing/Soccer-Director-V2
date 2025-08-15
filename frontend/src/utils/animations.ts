import { MatchAssets } from '../assets/matchAssets';

type Direction = 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST';
type AnimationType = 'run' | 'kick' | 'celebrate' | 'goalie' | 'tackle';

/**
 * Creates animations for a player sprite
 * @param scene The Phaser scene
 * @param team 'A' or 'B'
 * @param playerKey The key used to identify this player's sprites
 */
export function createPlayerAnimations(
  scene: Phaser.Scene,
  team: 'A' | 'B',
  playerKey: string
) {
  const teamAssets = team === 'A' ? MatchAssets.teamA : MatchAssets.teamB;
  
  // Create run animations in all directions
  Object.entries(teamAssets.runFrames).forEach(([direction, frames]) => {
    const animKey = `${playerKey}-run-${direction}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: frames.map((frame, index) => ({
          key: `${playerKey}-run`,
          frame: index
        })),
        frameRate: MatchAssets.animations.run.frameRate,
        repeat: MatchAssets.animations.run.repeat
      });
    }
  });

  // Create kick animations
  Object.entries(teamAssets.kickFrames).forEach(([direction, frames]) => {
    const animKey = `${playerKey}-kick-${direction}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: frames.map((frame, index) => ({
          key: `${playerKey}-kick`,
          frame: index
        })),
        frameRate: MatchAssets.animations.kick.frameRate,
        repeat: MatchAssets.animations.kick.repeat
      });
    }
  });

  // Create celebrate animations
  Object.entries(teamAssets.celebrateFrames).forEach(([direction, frames]) => {
    const animKey = `${playerKey}-celebrate-${direction}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: frames.map((frame, index) => ({
          key: `${playerKey}-celebrate`,
          frame: index
        })),
        frameRate: MatchAssets.animations.celebrate.frameRate,
        repeat: MatchAssets.animations.celebrate.repeat
      });
    }
  });

  // Create goalie animations
  Object.entries(teamAssets.goalieFrames).forEach(([direction, frames]) => {
    const animKey = `${playerKey}-goalie-${direction}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: frames.map((frame, index) => ({
          key: `${playerKey}-goalie`,
          frame: index
        })),
        frameRate: MatchAssets.animations.goalie.frameRate,
        repeat: MatchAssets.animations.goalie.repeat
      });
    }
  });

  // Create tackle animations
  Object.entries(teamAssets.tackleFrames).forEach(([direction, frames]) => {
    const animKey = `${playerKey}-tackle-${direction}`;
    if (!scene.anims.exists(animKey)) {
      scene.anims.create({
        key: animKey,
        frames: frames.map((frame, index) => ({
          key: `${playerKey}-tackle`,
          frame: index
        })),
        frameRate: MatchAssets.animations.tackle.frameRate,
        repeat: MatchAssets.animations.tackle.repeat
      });
    }
  });
}

/**
 * Plays an animation on a sprite
 * @param sprite The Phaser sprite
 * @param animationType The type of animation to play
 * @param direction The direction to face
 * @returns The animation instance
 */
export function playAnimation(
  sprite: Phaser.GameObjects.Sprite,
  animationType: AnimationType,
  direction: Direction = 'SOUTH'
) {
  const animKey = `${sprite.texture.key.split('-')[0]}-${animationType}-${direction}`;
  return sprite.play(animKey, true);
}

/**
 * Loads all assets for a player
 * @param scene The Phaser scene
 * @param team 'A' or 'B'
 * @param playerKey The key to use for this player's assets
 */
export function loadPlayerAssets(
  scene: Phaser.Scene,
  team: 'A' | 'B',
  playerKey: string
) {
  const teamAssets = team === 'A' ? MatchAssets.teamA : MatchAssets.teamB;
  
  // Load all animation sheets
  scene.load.spritesheet(
    `${playerKey}-run`,
    teamAssets.run + 'NORTH_strip4.png',
    { frameWidth: 64, frameHeight: 64 }
  );
  
  scene.load.spritesheet(
    `${playerKey}-kick`,
    teamAssets.kick + 'NORTH.png',
    { frameWidth: 64, frameHeight: 64 }
  );
  
  scene.load.spritesheet(
    `${playerKey}-celebrate`,
    teamAssets.celebrate + 'NORTH_strip4.png',
    { frameWidth: 64, frameHeight: 64 }
  );
  
  scene.load.spritesheet(
    `${playerKey}-goalie`,
    teamAssets.goalie + 'NORTH.png',
    { frameWidth: 64, frameHeight: 64 }
  );
  
  scene.load.spritesheet(
    `${playerKey}-tackle`,
    teamAssets.tackle + 'NORTH_strip4.png',
    { frameWidth: 64, frameHeight: 64 }
  );
}

/**
 * Calculates the direction between two points
 * @param fromX Starting X position
 * @param fromY Starting Y position
 * @param toX Target X position
 * @param toY Target Y position
 * @returns The direction as a Direction string
 */
export function getDirection(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): Direction {
  const angle = Phaser.Math.RadToDeg(
    Phaser.Math.Angle.Between(fromX, fromY, toX, toY)
  );
  
  // Normalize angle to 0-360
  const normalizedAngle = (angle + 360) % 360;
  
  // Determine direction based on angle
  if (normalizedAngle >= 337.5 || normalizedAngle < 22.5) return 'EAST';
  if (normalizedAngle >= 22.5 && normalizedAngle < 67.5) return 'SOUTH_EAST';
  if (normalizedAngle >= 67.5 && normalizedAngle < 112.5) return 'SOUTH';
  if (normalizedAngle >= 112.5 && normalizedAngle < 157.5) return 'SOUTH_WEST';
  if (normalizedAngle >= 157.5 && normalizedAngle < 202.5) return 'WEST';
  if (normalizedAngle >= 202.5 && normalizedAngle < 247.5) return 'NORTH_WEST';
  if (normalizedAngle >= 247.5 && normalizedAngle < 292.5) return 'NORTH';
  return 'NORTH_EAST';
}

/**
 * Creates a tween to move a sprite to a target position
 * @param scene The Phaser scene
 * @param sprite The sprite to move
 * @param targetX Target X position
 * @param targetY Target Y position
 * @param duration Duration of the tween in ms
 * @param onComplete Callback when tween completes
 * @param onUpdate Callback on each tween update
 * @returns The tween instance
 */
export function moveTo(
  scene: Phaser.Scene,
  sprite: Phaser.GameObjects.Sprite,
  targetX: number,
  targetY: number,
  duration: number,
  onComplete?: () => void,
  onUpdate?: (sprite: Phaser.GameObjects.Sprite) => void
) {
  // Update direction based on movement
  const direction = getDirection(sprite.x, sprite.y, targetX, targetY);
  playAnimation(sprite, 'run', direction);
  
  return scene.tweens.add({
    targets: sprite,
    x: targetX,
    y: targetY,
    duration: duration,
    ease: 'Linear',
    onUpdate: () => {
      // Update direction during movement
      if (onUpdate) onUpdate(sprite);
    },
    onComplete: () => {
      if (onComplete) onComplete();
    }
  });
}
