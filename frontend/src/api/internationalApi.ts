// API utility for international management CRUD operations

const API_BASE = '/api/international';

// --- National Teams ---
export async function fetchNationalTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error('Failed to fetch national teams');
  return res.json();
}

export async function createNationalTeam(data: any) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create national team');
  return res.json();
}

export async function updateNationalTeam(id: number, data: any) {
  const res = await fetch(`${API_BASE}/teams/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update national team');
  return res.json();
}

export async function deleteNationalTeam(id: number) {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete national team');
}

// --- International Competitions ---
export async function fetchInternationalCompetitions() {
  const res = await fetch(`${API_BASE}/competitions`);
  if (!res.ok) throw new Error('Failed to fetch competitions');
  return res.json();
}

export async function createInternationalCompetition(data: any) {
  const res = await fetch(`${API_BASE}/competitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create competition');
  return res.json();
}

export async function updateInternationalCompetition(id: number, data: any) {
  const res = await fetch(`${API_BASE}/competitions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update competition');
  return res.json();
}

export async function deleteInternationalCompetition(id: number) {
  const res = await fetch(`${API_BASE}/competitions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete competition');
}

// --- International Managers ---
export async function fetchInternationalManagers() {
  const res = await fetch(`${API_BASE}/managers`);
  if (!res.ok) throw new Error('Failed to fetch managers');
  return res.json();
}

export async function createInternationalManager(data: any) {
  const res = await fetch(`${API_BASE}/managers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create manager');
  return res.json();
}

export async function updateInternationalManager(id: number, data: any) {
  const res = await fetch(`${API_BASE}/managers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update manager');
  return res.json();
}

export async function deleteInternationalManager(id: number) {
  const res = await fetch(`${API_BASE}/managers/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete manager');
} 