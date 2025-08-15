import React, { useEffect, useState } from 'react';
import {
    getLeagues,
    getLeagueTopScorers,
    getLeagueAssistLeaders,
    getLeagueYellowCards,
    getLeagueRedCards,
    getLeagueAppearances,
} from '../api/footballApi';

interface League {
    id: string;
    name: string;
}

interface PlayerStat {
    rank: number;
    id: string;
    name: string;
    club: string;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    appearances?: number;
    nationality: string;
    position: string;
    age: number;
    isJongTeam?: boolean;
    parentClub?: { name: string };
}

const leaderboardConfigs = [
    {
        title: 'Top Scorers',
        fetch: getLeagueTopScorers,
        statKey: 'goals',
        statLabel: 'Goals',
    },
    {
        title: 'Top Assists',
        fetch: getLeagueAssistLeaders,
        statKey: 'assists',
        statLabel: 'Assists',
    },
    {
        title: 'Most Yellow Cards',
        fetch: getLeagueYellowCards,
        statKey: 'yellowCards',
        statLabel: 'Yellows',
    },
    {
        title: 'Most Red Cards',
        fetch: getLeagueRedCards,
        statKey: 'redCards',
        statLabel: 'Reds',
    },
    {
        title: 'Most Appearances',
        fetch: getLeagueAppearances,
        statKey: 'appearances',
        statLabel: 'Apps',
    },
];

const LeagueStatsPage: React.FC = () => {
    const [leagues, setLeagues] = useState<League[]>([]);
    const [selectedLeague, setSelectedLeague] = useState<string>('');
    const [leaderboards, setLeaderboards] = useState<PlayerStat[][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getLeagues()
            .then((data) => {
                setLeagues(data);
                if (data.length > 0) setSelectedLeague(data[0].id);
            })
            .catch((e) => setError(e.message));
    }, []);

    useEffect(() => {
        if (!selectedLeague) return;
        setLoading(true);
        setError(null);
        Promise.all(
            leaderboardConfigs.map((cfg) =>
                cfg.fetch(selectedLeague).then((data) => data.slice(0, 10))
            )
        )
            .then((results) => {
                setLeaderboards(results);
                setLoading(false);
            })
            .catch((e) => {
                setError(e.message);
                setLoading(false);
            });
    }, [selectedLeague]);

    return (
        <div className="max-w-5xl mx-auto p-4 text-white">
            <h1 className="text-2xl font-bold mb-4">League Stats & Leaderboards</h1>
            <div className="mb-4">
                <label className="mr-2 font-medium">Select League:</label>
                <select
                    className="border rounded px-2 py-1 bg-gray-700 text-white border-gray-600"
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                >
                    {leagues.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
            </div>
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {leaderboardConfigs.map((cfg, i) => (
                        <div key={cfg.title} className="bg-gray-800 rounded shadow p-4 border border-gray-600">
                            <h2 className="text-lg font-semibold mb-2">{cfg.title}</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border border-gray-600 text-sm">
                                    <thead>
                                        <tr className="bg-gray-700">
                                            <th className="px-2 py-1 border-r border-gray-600">#</th>
                                            <th className="px-2 py-1 text-left border-r border-gray-600">Player</th>
                                            <th className="px-2 py-1 text-left border-r border-gray-600">Club</th>
                                            <th className="px-2 py-1 border-r border-gray-600">{cfg.statLabel}</th>
                                            <th className="px-2 py-1 border-r border-gray-600">Pos</th>
                                            <th className="px-2 py-1 border-r border-gray-600">Age</th>
                                            <th className="px-2 py-1">Nat</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboards[i] && leaderboards[i].length > 0 ? (
                                            leaderboards[i].map((row) => (
                                                <tr key={row.id} className="border-b border-gray-600 hover:bg-gray-700">
                                                    <td className="px-2 py-1 text-center font-semibold border-r border-gray-600">{row.rank}</td>
                                                    <td className="px-2 py-1 border-r border-gray-600">{row.name}</td>
                                                    <td className="px-2 py-1 border-r border-gray-600">
                                                      {row.isJongTeam ? (
                                                        <span className="inline-flex items-center" title={row.parentClub?.name ? `Jong team of ${row.parentClub.name}` : 'Jong (O21) team'}>
                                                          {typeof row.club === 'object' && row.club !== null ? String((row.club as any).name) : String(row.club)} <span className="ml-1 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">🧒 Jong</span>
                                                          {row.parentClub?.name && (
                                                            <span className="ml-1 text-xs text-gray-500">({String(row.parentClub?.name)})</span>
                                                          )}
                                                        </span>
                                                      ) : (
                                                        typeof row.club === 'object' && row.club !== null ? String((row.club as any).name) : String(row.club)
                                                      )}
                                                    </td>
                                                    <td className="px-2 py-1 text-center border-r border-gray-600">
                                                      {(() => {
                                                        const value = row[cfg.statKey as keyof PlayerStat];
                                                        if (typeof value === 'object' && value !== null && 'name' in value) {
                                                          return value.name;
                                                        }
                                                        return value as string | number | boolean | undefined;
                                                      })()}
                                                    </td>
                                                    <td className="px-2 py-1 text-center border-r border-gray-600">{row.position}</td>
                                                    <td className="px-2 py-1 text-center border-r border-gray-600">{row.age}</td>
                                                    <td className="px-2 py-1 text-center">{row.nationality}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} className="text-center py-2 text-gray-400">
                                                    No data
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LeagueStatsPage; 