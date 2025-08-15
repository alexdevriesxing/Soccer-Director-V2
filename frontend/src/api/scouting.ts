import { api } from '../services/api';

export interface Scout {
  id: string;
  name: string;
  skill: number;
  cost: number;
  assignedRegion?: string;
}

export interface ScoutingReport {
  id: string;
  scoutId: string;
  playerId: string;
  playerName: string;
  potential: number;
  reportDate: string;
  notes: string;
}

export const getScouts = async (clubId: number): Promise<Scout[]> => {
  const response = await api.get<Scout[]>(`/scouting/scouts/${clubId}`);
  return response.data;
};

export const assignScout = async (scoutId: string, region: string): Promise<void> => {
  await api.post<{ success: boolean }>(`/scouting/assign`, { scoutId, region });
};

export const getScoutingReports = async (clubId: number): Promise<ScoutingReport[]> => {
  const response = await api.get<ScoutingReport[]>(`/scouting/reports/${clubId}`);
  return response.data;
};
