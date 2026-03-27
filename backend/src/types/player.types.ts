import { Player, PlayerAttribute, PlayerContract, PlayerMoraleEvent } from '@prisma/client';

export type PlayerPosition = 
  | 'GK'  // Goalkeeper
  | 'CB'  // Center Back
  | 'RB'  // Right Back
  | 'LB'  // Left Back
  | 'RWB' // Right Wing Back
  | 'LWB' // Left Wing Back
  | 'CDM' // Central Defensive Midfielder
  | 'CM'  // Central Midfielder
  | 'CAM' // Central Attacking Midfielder
  | 'RM'  // Right Midfielder
  | 'LM'  // Left Midfielder
  | 'RW'  // Right Winger
  | 'LW'  // Left Winger
  | 'CF'  // Center Forward
  | 'ST'; // Striker

export type PlayerFoot = 'LEFT' | 'RIGHT' | 'BOTH';

export type PlayerAttributeGroup = 'MENTAL' | 'PHYSICAL' | 'TECHNICAL' | 'GOALKEEPING';

export type PlayerAttributeName =
  // Mental attributes
  | 'determination' | 'workRate' | 'teamwork' | 'leadership' | 'positioning' | 'offTheBall' | 'vision' | 'decisions' | 'composure' | 'concentration' | 'anticipation' | 'flair' | 'aggression' | 'bravery'
  // Physical attributes
  | 'pace' | 'acceleration' | 'stamina' | 'strength' | 'jumpingReach' | 'naturalFitness' | 'agility' | 'balance' | 'reactions'
  // Technical attributes
  | 'finishing' | 'longShots' | 'passing' | 'technique' | 'dribbling' | 'firstTouch' | 'heading' | 'tackling' | 'marking' | 'crossing' | 'longThrows' | 'freeKicks' | 'penaltyTaking' | 'corners' | 'throwIns'
  // Goalkeeping attributes
  | 'handling' | 'reflexes' | 'oneOnOnes' | 'commandOfArea' | 'aerialReach' | 'kicking' | 'throwing' | 'rushingOut' | 'punching';

export type PersonalityType =
  | 'Model Citizen' | 'Model Professional' | 'Professional' | 'Perfectionist' | 'Resolute' | 'Fairly Professional' | 'Light-Hearted' | 'Spirited' | 'Jovial' | 'Driven' | 'Determined' | 'Fairly Determined' | 'Resolute' | 'Iron Willed' | 'Very Ambitious' | 'Ambitious' | 'Fairly Ambitious' | 'Fairly Loyal' | 'Loyal' | 'Very Loyal' | 'Fickle' | 'Realist' | 'Temperamental' | 'Volatile' | 'Unflappable' | 'Easily Discouraged' | 'Slack' | 'Low Self-Belief' | 'Unsporting' | 'Honest' | 'Sporting' | 'Evasive' | 'Honest' | 'Reserved' | 'Outspoken' | 'Media Friendly' | 'Unflappable' | 'Temperamental' | 'Volatile' | 'Easily Discouraged' | 'Slack' | 'Low Self-Belief' | 'Unsporting' | 'Honest' | 'Sporting' | 'Evasive' | 'Honest' | 'Reserved' | 'Outspoken' | 'Media Friendly' | 'Unflappable' | 'Temperamental' | 'Volatile';

export type TrainingFocus =
  | 'Quickness' | 'Strength' | 'Aerobic' | 'Tactics' | 'Defending' | 'Attacking' | 'Shooting' | 'Passing' | 'Ball Control' | 'Goalkeeping' | 'Set Pieces';

export interface PlayerWithDetails extends Player {
  attributes: PlayerAttribute[];
  contracts: PlayerContract[];
  moraleEvents: PlayerMoraleEvent[];
  currentContract?: PlayerContract;
  nextContract?: PlayerContract;
  isTransferListed?: boolean;
  transferStatus?: 'Not for Sale' | 'Listed for Transfer' | 'Listed for Loan' | 'Transfer Listed by Request';
}

export interface PlayerAttributeUpdate {
  attributeGroup: PlayerAttributeGroup;
  attributeName: PlayerAttributeName;
  attributeValue: number;
}

export interface PlayerContractInput {
  playerId: number;
  clubId: number;
  startDate: Date;
  endDate: Date;
  weeklyWage: number;
  yearlySalaryIncreasePercent?: number;
  releaseClause?: number;
  minReleaseClause?: number;
  relegationReleaseClause?: number;
  promotionSalaryIncreasePercent?: number;
  appearanceFee?: number;
  goalBonus?: number;
  cleanSheetBonus?: number;
  internationalCapBonus?: number;
}

export interface PlayerMoraleEventInput {
  playerId: number;
  eventType: string;
  description: string;
  moraleEffect: number;
  expiresAt?: Date;
}

export interface PlayerSearchFilters {
  name?: string;
  position?: PlayerPosition;
  minAge?: number;
  maxAge?: number;
  minValue?: number;
  maxValue?: number;
  nationality?: string;
  clubId?: number;
  contractExpiring?: boolean;
  transferListed?: boolean;
  minPotential?: number;
  minCurrentAbility?: number;
  sortBy?: 'value' | 'age' | 'wage' | 'ability' | 'potential';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  cleanSheets: number;
  minutesPlayed: number;
  averageRating: number;
  manOfTheMatch: number;
}
