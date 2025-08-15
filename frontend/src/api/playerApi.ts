import axios from 'axios';

export const getPlayers = (params: { clubId?: string } = {}) => {
  const queryParams = new URLSearchParams();
  if (params.clubId) queryParams.append('clubId', params.clubId);
  const endpoint = params.clubId ? `/api/players?${queryParams}` : '/api/players';
  return axios.get(endpoint);
};
export const getPlayer = (id: number) => axios.get(`/api/players/${id}`);
export const createPlayer = (data: any) => axios.post('/api/players', data);
export const updatePlayer = (id: number, data: any) => axios.put(`/api/players/${id}`, data);
export const deletePlayer = (id: number) => axios.delete(`/api/players/${id}`);
export const developPlayer = (id: number, amount: number) => axios.post(`/api/players/${id}/develop`, { amount });
export const setPlayerMorale = (id: number, morale: number) => axios.post(`/api/players/${id}/morale`, { morale });
export const updatePlayerContract = (id: number, data: { wage?: number; contractExpiry?: string }) => axios.post(`/api/players/${id}/contract`, data);
export const getPlayerHistory = (id: number) => axios.get(`/api/players/${id}/history`);

export const getPlayerPositions = (playerId: number) =>
  axios.get(`/api/players/${playerId}/positions`);

export const addOrUpdatePlayerPosition = (playerId: number, data: { position: string; proficiency: number }) =>
  axios.post(`/api/players/${playerId}/positions`, data);

export const deletePlayerPosition = (playerId: number, position: string) =>
  axios.delete(`/api/players/${playerId}/positions/${encodeURIComponent(position)}`);

export async function getContract(playerId: number) {
  const res = await fetch(`/api/players/${playerId}`);
  if (!res.ok) throw new Error('Failed to fetch player contract');
  return res.json();
}

export async function updateContract(playerId: number, data: any) {
  const res = await fetch(`/api/players/${playerId}/contract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update contract');
  return res.json();
}

export async function offerContract(playerId: number, offer: any) {
  const res = await fetch(`/api/players/${playerId}/contract/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer)
  });
  if (!res.ok) throw new Error('Failed to offer contract');
  return res.json();
}

export async function acceptContract(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/contract/accept`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to accept contract');
  return res.json();
}

export async function rejectContract(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/contract/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject contract');
  return res.json();
}

export async function counterContract(playerId: number, offer: any) {
  const res = await fetch(`/api/players/${playerId}/contract/counter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer)
  });
  if (!res.ok) throw new Error('Failed to counter contract');
  return res.json();
}

export async function triggerClause(playerId: number, clause: string) {
  const res = await fetch(`/api/players/${playerId}/contract/trigger-clause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clause })
  });
  if (!res.ok) throw new Error('Failed to trigger clause');
  return res.json();
}

export async function renewContract(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/contract/renew`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to renew contract');
  return res.json();
}

export async function getExpiringContracts() {
  const res = await fetch(`/api/players/expiring-contracts`);
  if (!res.ok) throw new Error('Failed to fetch expiring contracts');
  return res.json();
}

export async function getMoralePsychology(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/morale-psychology`);
  if (!res.ok) throw new Error('Failed to fetch morale/psychology');
  return res.json();
}

export async function updateMoralePsychology(playerId: number, data: any) {
  const res = await fetch(`/api/players/${playerId}/morale-psychology`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update morale/psychology');
  return res.json();
}

export async function managerAction(playerId: number, action: string) {
  const res = await fetch(`/api/players/${playerId}/manager-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error('Failed to process manager action');
  return res.json();
}

export async function getMoraleLog(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/morale-log`);
  if (!res.ok) throw new Error('Failed to fetch morale log');
  const data = await res.json();
  return data.logs;
}

export async function getPlayerAwards(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/awards`);
  if (!res.ok) throw new Error('Failed to fetch player awards');
  return res.json();
}

export async function getPlayerCareerStats(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/career-stats`);
  if (!res.ok) throw new Error('Failed to fetch player career stats');
  return res.json();
}

export async function getPlayerInjuries(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/injuries`);
  if (!res.ok) throw new Error('Failed to fetch player injuries');
  return res.json();
}

export async function getPlayerTransfers(playerId: number) {
  const res = await fetch(`/api/players/${playerId}/transfers`);
  if (!res.ok) throw new Error('Failed to fetch player transfers');
  return res.json();
}

export async function addPlayerAward(playerId: number, data: { awardName: string; season: string; description?: string }) {
  const res = await fetch(`/api/players/${playerId}/awards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add player award');
  return res.json();
}

export async function addPlayerInjury(playerId: number, data: { type: string; severity: string; startDate: string; endDate?: string; description?: string }) {
  const res = await fetch(`/api/players/${playerId}/injuries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add player injury');
  return res.json();
}

export async function addPlayerCareerStat(playerId: number, data: { season: string; clubId: number; appearances?: number; goals?: number; assists?: number; yellowCards?: number; redCards?: number; avgRating?: number }) {
  const res = await fetch(`/api/players/${playerId}/career-stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to add player career stat');
  return res.json();
}

export async function deletePlayerAward(playerId: number, awardId: number) {
  const res = await fetch(`/api/players/${playerId}/awards/${awardId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete player award');
}

export async function deletePlayerInjury(playerId: number, injuryId: number) {
  const res = await fetch(`/api/players/${playerId}/injuries/${injuryId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete player injury');
}

export async function deletePlayerCareerStat(playerId: number, statId: number) {
  const res = await fetch(`/api/players/${playerId}/career-stats/${statId}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('Failed to delete player career stat');
}

export async function editPlayerAward(playerId: number, awardId: number, data: any) {
  const res = await fetch(`/api/players/${playerId}/awards/${awardId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to edit player award');
  return res.json();
}

export async function editPlayerInjury(playerId: number, injuryId: number, data: any) {
  const res = await fetch(`/api/players/${playerId}/injuries/${injuryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to edit player injury');
  return res.json();
}

export async function editPlayerCareerStat(playerId: number, statId: number, data: any) {
  const res = await fetch(`/api/players/${playerId}/career-stats/${statId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to edit player career stat');
  return res.json();
}

// Example usage in a React component:
//
// import { useState, useEffect } from 'react';
// import { getPlayersByClub } from '../api/playerApi';
//
// function ClubRoster({ clubId }: { clubId: number }) {
//   const [players, setPlayers] = useState<any[]>([]);
//   const [pagination, setPagination] = useState<any>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//
//   useEffect(() => {
//     if (clubId) {
//       getPlayersByClub(clubId, { page: currentPage }).then(data => {
//         setPlayers(data.players);
//         setPagination({
//           totalPlayers: data.totalPlayers,
//           totalPages: data.totalPages,
//           currentPage: data.currentPage,
//         });
//       });
//     }
//   }, [clubId, currentPage]);
//
//   // ... render players and pagination controls ...
// } 