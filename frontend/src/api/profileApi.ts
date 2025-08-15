import { CreateProfileData, Profile } from '../types/profile';

export interface Club {
  id: number;
  name: string;
  league: {
    id: number;
    name: string;
    tier: number;
  };
}

export interface GetClubsParams {
  search?: string;
  leagueId?: number;
}

export const getClubs = async (params?: GetClubsParams): Promise<Club[]> => {
  const url = new URL('/api/clubs', window.location.origin);
  
  if (params?.search) {
    url.searchParams.append('search', params.search);
  }
  
  if (params?.leagueId) {
    url.searchParams.append('leagueId', params.leagueId.toString());
  }
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch clubs');
  }
  return response.json();
};

export const getProfiles = async (): Promise<Profile[]> => {
  const response = await fetch('/api/profiles');
  if (!response.ok) throw new Error('Failed to fetch profiles');
  return response.json();
};

export const createProfile = async (profileData: CreateProfileData): Promise<Profile> => {
  const response = await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  if (!response.ok) {
    throw new Error('Failed to create profile');
  }
  const data = await response.json();
  // Transform the response to match the Profile type
  return {
    ...data,
    clubId: data.clubId || 0, // Ensure clubId is always a number
  };
};
