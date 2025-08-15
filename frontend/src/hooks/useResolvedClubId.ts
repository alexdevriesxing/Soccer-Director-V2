import { useEffect, useState } from 'react';
import { useManagerProfile } from '../context/ManagerProfileContext';
import { getClubs } from '../api/footballApi';

export function useResolvedClubId() {
  const { profile } = useManagerProfile();
  const [clubId, setClubId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setClubId(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getClubs().then(clubs => {
      const club = clubs.find((c: any) => c.name === profile.club);
      setClubId(club ? club.id : null);
      setLoading(false);
    });
  }, [profile]);

  return { clubId, loading };
} 