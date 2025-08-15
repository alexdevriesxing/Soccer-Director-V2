// Asset mapping for match highlight simulation
// Uses Dark Skin Tone set as default for better visibility

type AnimationFrames = {
  [key: string]: string[];
};

type TeamAssets = {
  run: string;
  runFrames: AnimationFrames;
  kick: string;
  kickFrames: AnimationFrames;
  celebrate: string;
  celebrateFrames: AnimationFrames;
  goalie: string;
  goalieFrames: AnimationFrames;
  tackle: string;
  tackleFrames: AnimationFrames;
  color: string;
  secondaryColor: string;
};

type RefereeAssets = {
  stand: string;
  caution: string;
  redCard: string;
  whistle: string;
};

export const MatchAssets = {
  // Field and ball
  pitch: '/Images/Staduim_Pitch.png',
  pitchSmall: '/Images/StaduimPitch 8x8.png',
  pitchLarge: '/Images/Staduim Pitch 16x16.png',
  goalTop: '/Images/Goal_1.png',
  goalBottom: '/Images/Goal_2.png',
  goalTopTransparent: '/Images/Goal_1_Alpha_0.50.png',
  goalBottomTransparent: '/Images/Goal_2_Alpha_0.50.png',
  ball: '/Images/Ball_Icons.png',
  
  // Referee
  referee: {
    stand: '/Images/Dark skin Tone/Referee/Team_B_Referee_Stand.png',
    caution: '/Images/Dark skin Tone/Referee/Team_B_Referee_Caution.png',
    redCard: '/Images/Dark skin Tone/Referee/Team_B_Referee_RedCard.png',
    whistle: '/Images/Dark skin Tone/Referee/Team_B_Referee_Whistle.png',
  } as RefereeAssets,

  // Team A (Home - Blue)
  teamA: {
    // Base paths
    run: '/Images/Dark skin Tone/Team A Run/Team_A_Run_',
    kick: '/Images/Dark skin Tone/Team A Kick/Team_A_Kick_',
    celebrate: '/Images/Dark skin Tone/Team A Celebration/Team_A_Celebration_',
    goalie: '/Images/Dark skin Tone/Team A Goal Keeper/Team_A_Goalie_',
    tackle: '/Images/Dark skin Tone/Team A Tackle/Team_A_Tackle_',
    
    // Animation frame configurations
    runFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png'],
      EAST: ['EAST_strip4.png'],
      WEST: ['WEST_strip4.png'],
      NORTH_EAST: ['NORTH_EAST_strip4.png'],
      NORTH_WEST: ['NORTH_WEST_strip4.png'],
      SOUTH_EAST: ['SOUTH_EAST_strip4.png'],
      SOUTH_WEST: ['SOUTH_WEST_strip4.png']
    },
    
    kickFrames: {
      NORTH: ['NORTH.png'],
      SOUTH: ['SOUTH.png'],
      EAST: ['EAST.png'],
      WEST: ['WEST.png']
    },
    
    celebrateFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png']
    },
    
    goalieFrames: {
      NORTH: ['NORTH.png'],
      SOUTH: ['SOUTH.png'],
      EAST: ['EAST.png'],
      WEST: ['WEST.png'],
      NORTH_EAST: ['NORTH_EAST.png'],
      NORTH_WEST: ['NORTH_WEST.png'],
      SOUTH_EAST: ['SOUTH_EAST.png'],
      SOUTH_WEST: ['SOUTH_WEST.png']
    },
    
    tackleFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png']
    },
    
    // Team colors
    color: '#3498db',  // Blue
    secondaryColor: '#ffffff'  // White
  } as TeamAssets,

  // Team B (Away - Red)
  teamB: {
    // Base paths
    run: '/Images/Dark skin Tone/Team B Run/Team_B_Run_',
    kick: '/Images/Dark skin Tone/Team B Kick/Team_B_Kick_',
    celebrate: '/Images/Dark skin Tone/Team B Celebration/Team_B_Celebration_',
    goalie: '/Images/Dark skin Tone/Team B Goal Keeper/Team_B_Goalie_',
    tackle: '/Images/Dark skin Tone/Team B Tackle/Team_B_Tackle_',
    
    // Animation frame configurations
    runFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png'],
      EAST: ['EAST_strip4.png'],
      WEST: ['WEST_strip4.png'],
      NORTH_EAST: ['NORTH_EAST_strip4.png'],
      NORTH_WEST: ['NORTH_WEST_strip4.png'],
      SOUTH_EAST: ['SOUTH_EAST_strip4.png'],
      SOUTH_WEST: ['SOUTH_WEST_strip4.png']
    },
    
    kickFrames: {
      NORTH: ['NORTH.png'],
      SOUTH: ['SOUTH.png'],
      EAST: ['EAST.png'],
      WEST: ['WEST.png']
    },
    
    celebrateFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png']
    },
    
    goalieFrames: {
      NORTH: ['NORTH.png'],
      SOUTH: ['SOUTH.png'],
      EAST: ['EAST.png'],
      WEST: ['WEST.png'],
      NORTH_EAST: ['NORTH_EAST.png'],
      NORTH_WEST: ['NORTH_WEST.png'],
      SOUTH_EAST: ['SOUTH_EAST.png'],
      SOUTH_WEST: ['SOUTH_WEST.png']
    },
    
    tackleFrames: {
      NORTH: ['NORTH_strip4.png'],
      SOUTH: ['SOUTH_strip4.png']
    },
    
    // Team colors
    color: '#e74c3c',  // Red
    secondaryColor: '#ffffff'  // White
  } as TeamAssets,
  
  // Animation configurations
  animations: {
    run: {
      frameRate: 10,
      repeat: -1
    },
    kick: {
      frameRate: 5,
      repeat: 0
    },
    celebrate: {
      frameRate: 8,
      repeat: -1
    },
    goalie: {
      frameRate: 5,
      repeat: 0
    },
    tackle: {
      frameRate: 8,
      repeat: 0
    }
  }
};