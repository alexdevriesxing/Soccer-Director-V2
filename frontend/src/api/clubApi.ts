import axios from 'axios';

export const getClubs = () => axios.get('/api/clubs');
export const getClub = (id: number) => axios.get(`/api/clubs/${id}`);
export const createClub = (data: any) => axios.post('/api/clubs', data);
export const updateClub = (id: number, data: any) => axios.put(`/api/clubs/${id}`, data);
export const deleteClub = (id: number) => axios.delete(`/api/clubs/${id}`);

export const registerSquad = (clubId: number, data: { season: number; competition: string; registeredPlayers: number[] }) =>
  axios.post(`/api/clubs/${clubId}/squad-registration`, data);

export const getSquadRegistrations = (clubId: number) =>
  axios.get(`/api/clubs/${clubId}/squad-registrations`); 