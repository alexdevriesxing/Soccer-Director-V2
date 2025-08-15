// Transfer Offer Negotiation API Client

export async function createTransferOffer(data: {
  playerId: number;
  fromClubId: number;
  toClubId: number;
  initiator: 'user' | 'AI';
  fee: number;
  clauses: any[];
  deadline: string;
}) {
  const res = await fetch('/api/transfer-offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function respondToTransferOffer(offerId: number, response: 'accepted' | 'rejected' | 'countered' | 'withdrawn', update: Partial<{ fee: number; clauses: any[]; deadline: string; initiator: 'user' | 'AI' }>) {
  const res = await fetch(`/api/transfer-offers/${offerId}/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ response, update })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransferOfferById(offerId: number) {
  const res = await fetch(`/api/transfer-offers/${offerId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransferOffersForPlayer(playerId: number) {
  const res = await fetch(`/api/transfer-offers/player/${playerId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getTransferOffersForClub(clubId: number) {
  const res = await fetch(`/api/transfer-offers/club/${clubId}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
} 