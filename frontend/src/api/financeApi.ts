// API utility for finance CRUD operations

const API_BASE = '/api/finance';

export async function fetchSponsorships(clubId: number | string) {
  const res = await fetch(`${API_BASE}/${clubId}/sponsorships`);
  if (!res.ok) throw new Error('Failed to fetch sponsorships');
  return res.json();
}

export async function fetchFinancialRecords(clubId: number | string) {
  const res = await fetch(`${API_BASE}/${clubId}/transactions`);
  if (!res.ok) throw new Error('Failed to fetch financial records');
  return res.json();
}

export async function createSponsorship(data: any) {
  const res = await fetch(`${API_BASE}/negotiate-sponsorship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create sponsorship');
  return res.json();
}

export async function updateClubFinances(id: number, data: any) {
  const res = await fetch(`${API_BASE}/club-finances/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update financial record');
  return res.json();
}

export async function deleteClubFinances(id: number) {
  const res = await fetch(`${API_BASE}/club-finances/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete financial record');
}

export async function updateSponsorship(id: number, data: any) {
  const res = await fetch(`${API_BASE}/sponsorship/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update sponsorship');
  return res.json();
}

export async function deleteSponsorship(id: number) {
  const res = await fetch(`${API_BASE}/sponsorship/${id}`, {
    method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete sponsorship');
} 