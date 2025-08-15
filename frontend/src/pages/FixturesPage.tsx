import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FixturesPage: React.FC = () => {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/fixtures');
        if (!res.ok) throw new Error('Failed to fetch fixtures');
        const data = await res.json();
        setFixtures(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFixtures();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <div>
      <h1>Fixtures</h1>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Home</th>
            <th>Away</th>
            <th>Attendance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {fixtures.length === 0 ? (
            <tr><td colSpan={5}>No fixtures found.</td></tr>
          ) : (
            fixtures.map(fix => (
              <tr key={fix.id}>
                <td>{fix.date ? new Date(fix.date).toLocaleString() : '-'}</td>
                <td>{fix.homeClub?.name ?? '-'}</td>
                <td>{fix.awayClub?.name ?? '-'}</td>
                <td>{typeof fix.attendance === 'number' ? fix.attendance : '-'}</td>
                <td><Link to={`/matches/${fix.id}`}>View/Simulate</Link></td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FixturesPage; 