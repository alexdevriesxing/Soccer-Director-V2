import React, { useEffect, useState } from 'react';
import { getTransferMarketPlayers } from '../api/footballApi';
import { TransferMarketPlayer } from '../types';
import useTransferMarket from './useTransferMarket';

interface Props {
    onRowClick: (player: TransferMarketPlayer) => void;
}

const TransferMarketTable: React.FC<Props> = ({ onRowClick }) => {
    const {
        players,
        filter,
        setFilter,
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPlayers,
        totalPages,
        loading,
        error,
        PAGE_SIZE_OPTIONS
    } = useTransferMarket();

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(Number(e.target.value));
        setPage(1);
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-2">Transfer Market</h2>
            <input
                className="border p-1 mb-2 w-full"
                placeholder="Filter by name, nationality, or position"
                value={filter}
                onChange={e => { setFilter(e.target.value); setPage(1); }}
            />
            {loading ? (
                <div className="py-8 text-center">Loading...</div>
            ) : error ? (
                <div className="py-8 text-center text-red-400">{error}</div>
            ) : (
                <>
                    <table className="w-full border text-sm">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Nationality</th>
                                <th>Position</th>
                                <th>Skill</th>
                                <th>Last Club</th>
                                <th>Agent</th>
                                <th>Ambition</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map(player => (
                                <tr key={player.id}>
                                    <td>{player.name}</td>
                                    <td>{player.nationality}</td>
                                    <td>{player.position}</td>
                                    <td>{player.skill}</td>
                                    <td>{player.lastClub}</td>
                                    <td>{player.agent.name} ({player.agent.style})</td>
                                    <td>{player.ambition}</td>
                                    <td>
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded"
                                            onClick={() => onRowClick(player)}
                                        >Negotiate</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            Page {page} of {totalPages} ({totalPlayers} players)
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                            >Prev</button>
                            <button
                                className="px-2 py-1 bg-gray-700 rounded disabled:opacity-50"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                            >Next</button>
                            <select value={pageSize} onChange={handlePageSizeChange} className="ml-2 p-1 bg-gray-700 rounded">
                                {PAGE_SIZE_OPTIONS.map(size => (
                                    <option key={size} value={size}>{size} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TransferMarketTable; 