import { api } from '../services/api';

export interface YouthPlayer {
  id: string;
  name: string;
  age: number;
  position: string;
  potential: number;
  currentAbility: number;
  value: number;
  contractEnd: string;
}

export interface YouthAcademy {
  id: string;
  level: number;
  capacity: number;
  currentPlayers: YouthPlayer[];
  trainingFacilities: number;
  youthCoaches: number;
}

export const getYouthAcademy = async (clubId: number): Promise<YouthAcademy> => {
  const response = await api.get<YouthAcademy>(`/youth-academy/${clubId}`);
  return response.data;
};

export const createYouthAcademy = async (clubId: number): Promise<YouthAcademy> => {
  const response = await api.post<YouthAcademy>('/youth-academy', { clubId });
  return response.data;
};

export const upgradeYouthAcademy = async (
  clubId: number, 
  upgradeType: 'level' | 'facilities' | 'coaches'
): Promise<YouthAcademy> => {
  const response = await api.put<YouthAcademy>(
    `/youth-academy/${clubId}/upgrade`, 
    { upgradeType }
  );
  return response.data;
};
