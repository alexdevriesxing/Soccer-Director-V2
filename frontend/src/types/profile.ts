export interface ProfileBase {
  name: string;
  club: string;
  clubId: number;
}

export interface Profile extends ProfileBase {
  id: string;
  createdAt: string;
  lastPlayed: string;
}

export type CreateProfileData = Omit<Profile, 'id' | 'createdAt' | 'lastPlayed'>;
