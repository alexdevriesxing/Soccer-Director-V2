import axios from 'axios';

export const scoutYouthPlayers = (clubId: number) => axios.post('/api/youth/scout', { clubId });
export const promoteYouthPlayer = (playerId: number) => axios.post('/api/youth/promote', { playerId });
export const releaseYouthPlayer = (playerId: number) => axios.post('/api/youth/release', { playerId });
export const getYouthTournaments = (clubId: number) => axios.get('/api/youth/tournaments', { params: { clubId } });
export const getAvailableTrainers = (clubId: number) => axios.get('/api/youth/trainers', { params: { clubId } }); 