// Base paths
const BASE_PATH = '/Images/White Skin Tone';

// Team A Assets
export const TeamAAssets = {
  celebration: `${BASE_PATH}/Team A Celebration`,
  goalkeeper: `${BASE_PATH}/Team A Goal Keeper`,
  kick: `${BASE_PATH}/Team A Kick`,
  run: `${BASE_PATH}/Team A Run`,
  tackle: `${BASE_PATH}/Team A Tackle`
};

// Team B Assets
export const TeamBAssets = {
  celebration: `${BASE_PATH}/Team B Celebration`,
  goalkeeper: `${BASE_PATH}/Team B Goal Keeper`,
  kick: `${BASE_PATH}/Team B Kick`,
  run: `${BASE_PATH}/Team B Run`,
  tackle: `${BASE_PATH}/Team B Tackle`
};

// Common Assets
export const CommonAssets = {
  referee: `${BASE_PATH}/Referee`,
  ball: '/ball.png'
};

// Animation Frames Configuration
export const AnimationConfig = {
  frameRate: 10,
  repeat: -1
};

export const AnimationTypes = {
  RUN: 'run',
  KICK: 'kick',
  CELEBRATE: 'celebrate',
  TACKLE: 'tackle',
  IDLE: 'idle',
  SAVE: 'save'
};
