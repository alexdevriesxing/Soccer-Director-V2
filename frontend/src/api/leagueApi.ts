import axios from 'axios';

export const getLeagues = () => axios.get('/api/leagues');
export const getLeague = (id: number) => axios.get(`/api/leagues/${id}`);
export const createLeague = (data: any) => axios.post('/api/leagues', data);
export const updateLeague = (id: number, data: any) => axios.put(`/api/leagues/${id}`, data);
export const deleteLeague = (id: number) => axios.delete(`/api/leagues/${id}`); 