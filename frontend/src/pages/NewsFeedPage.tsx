import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../api/footballApi';

const newsTypes = [
    { key: 'all', label: 'All', icon: '📰' },
    { key: 'match', label: 'Matches', icon: '⚽️' },
    { key: 'transfer', label: 'Transfers', icon: '🔄' },
    { key: 'board', label: 'Board', icon: '🏢' },
    { key: 'injury', label: 'Injuries', icon: '🤕' },
    { key: 'milestone', label: 'Milestones', icon: '🏆' },
    { key: 'suspension', label: 'Suspensions', icon: '⛔️' },
    { key: 'retirement', label: 'Retirements', icon: '👴' },
    { key: 'debut', label: 'Debuts', icon: '🌟' },
    { key: 'record', label: 'Records', icon: '📈' },
    { key: 'award', label: 'Awards', icon: '🥇' },
    { key: 'press', label: 'Press', icon: '🗞️' },
    { key: 'fan', label: 'Fan', icon: '🎉' },
    { key: 'media', label: 'Media', icon: '🎤' },
    { key: 'scandal', label: 'Scandal', icon: '🚨' },
    { key: 'weather', label: 'Weather', icon: '🌦️' },
    { key: 'stadium', label: 'Stadium', icon: '🏟️' },
    { key: 'contract', label: 'Contract', icon: '📝' },
    { key: 'youth', label: 'Youth', icon: '🧒' },
    { key: 'international', label: 'International', icon: '🌍' },
    { key: 'testimonial', label: 'Testimonial', icon: '🎖️' },
];

const clubBadges: Record<string, string> = {
    ajax: '🔴',
    psv: '⚪️',
    feyenoord: '⚫️',
    utrecht: '🔵',
    az: '🟣',
};

const SAVE_KEY = 'football-sim-save';

const NewsFeedPage: React.FC = () => {
    const [filter, setFilter] = useState('all');
    const [modalNews, setModalNews] = useState<any | null>(null);
    const [news, setNews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);
    const isAdmin = true; // Hardcoded admin flag for demo
    // Add state for news modal (add/edit)
    const [showNewsModal, setShowNewsModal] = useState(false);
    const [editNews, setEditNews] = useState<any | null>(null);
    const [newsType, setNewsType] = useState('match');
    const [newsHeadline, setNewsHeadline] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const [savingNews, setSavingNews] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getNews()
            .then(setNews)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    const filteredNews = filter === 'all' ? news : news.filter(n => n.type === filter);

    function clubNameWithBadge(clubId: string) {
        return (
            <span
                className="inline-flex items-center gap-1 cursor-pointer hover:underline"
                onClick={() => navigate('/clubs', { state: { clubId } })}
            >
                <span>{clubBadges[clubId] || '🏟️'}</span>
                <span>{clubId}</span>
            </span>
        );
    }

    function playerLink(playerId: string) {
        return (
            <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => navigate('/clubs', { state: { playerId } })}>
                Player {playerId}
            </span>
        );
    }

    // Save to localStorage
    function handleSave() {
        try {
            // For MVP, save all localStorage (or a placeholder game state)
            const gameState = { ...localStorage };
            localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
            setSaveStatus('Game saved to localStorage!');
            setTimeout(() => setSaveStatus(null), 2000);
        } catch (e) {
            setSaveStatus('Failed to save game.');
        }
    }

    // Download as JSON
    function handleDownload() {
        try {
            const gameState = { ...localStorage };
            const blob = new Blob([JSON.stringify(gameState, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'football-sim-save.json';
            a.click();
            URL.revokeObjectURL(url);
        } catch { }
    }

    // Load from localStorage
    function handleLoad() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                Object.keys(parsed).forEach(k => localStorage.setItem(k, parsed[k]));
                setSaveStatus('Game loaded from localStorage!');
                setTimeout(() => window.location.reload(), 1000);
            } else {
                setSaveStatus('No save found in localStorage.');
            }
        } catch (e) {
            setSaveStatus('Failed to load game.');
        }
    }

    // Upload JSON
    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                Object.keys(parsed).forEach(k => localStorage.setItem(k, parsed[k]));
                setSaveStatus('Game loaded from file!');
                setTimeout(() => window.location.reload(), 1000);
            } catch {
                setSaveStatus('Failed to load file.');
            }
        };
        reader.readAsText(file);
    }

    // Add News handlers
    const openAddNews = () => {
      setEditNews(null);
      setNewsType('match');
      setNewsHeadline('');
      setNewsContent('');
      setShowNewsModal(true);
      setError(null);
    };
    const openEditNews = (n: any) => {
      setEditNews(n);
      setNewsType(n.type);
      setNewsHeadline(n.headline);
      setNewsContent(n.content || n.summary || '');
      setShowNewsModal(true);
      setError(null);
    };
    const closeNewsModal = () => {
      setShowNewsModal(false);
      setEditNews(null);
      setNewsType('match');
      setNewsHeadline('');
      setNewsContent('');
      setError(null);
    };
    const handleSaveNews = async () => {
      setSavingNews(true);
      setError(null);
      try {
        const method = editNews ? 'PATCH' : 'POST';
        const url = editNews ? `/api/news/${editNews.id}` : '/api/news';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: newsType, headline: newsHeadline, content: newsContent })
        });
        if (!res.ok) throw new Error('Failed to save news');
        closeNewsModal();
        // Refresh news
        setLoading(true);
        getNews().then(setNews).catch(e => setError(e.message)).finally(() => setLoading(false));
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      } finally {
        setSavingNews(false);
      }
    };
    const handleDeleteNews = async (id: string | number) => {
      setError(null);
      try {
        const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 204) throw new Error('Failed to delete news');
        // Refresh news
        setLoading(true);
        getNews().then(setNews).catch(e => setError(e.message)).finally(() => setLoading(false));
      } catch (e: any) {
        setError(e.message || 'Unknown error');
      }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center gap-4 mb-4">
                <button className="text-blue-600 hover:underline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
                <h1 className="text-2xl font-bold flex-1">News Feed</h1>
            </div>
            <div className="mb-4 flex gap-2 flex-wrap">
                {newsTypes.map(nt => (
                    <button
                        key={nt.key}
                        className={`px-3 py-1 rounded-full font-semibold flex items-center gap-1 border ${filter === nt.key ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 text-blue-600 border-blue-600'} transition`}
                        onClick={() => setFilter(nt.key)}
                    >
                        <span>{nt.icon}</span> {nt.label}
                    </button>
                ))}
            </div>
            {/* Save/Load UI */}
            <div className="mb-6 flex flex-wrap gap-2 items-center">
                <button className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={handleSave}>Save to LocalStorage</button>
                <button className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold" onClick={handleDownload}>Download JSON</button>
                <button className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold" onClick={handleLoad}>Load from LocalStorage</button>
                <button className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold" onClick={() => fileInputRef.current?.click()}>Upload JSON</button>
                <input type="file" accept="application/json" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                {saveStatus && <span className="ml-4 text-sm font-semibold text-green-700 dark:text-green-400">{saveStatus}</span>}
            </div>
            {isAdmin && (
              <button className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={openAddNews}>Add News</button>
            )}
            {loading && <div className="text-center py-8"><span className="animate-spin inline-block mr-2">⏳</span>Loading news...</div>}
            {error && <div className="text-red-500 text-center py-4">{error}</div>}
            <div className="space-y-4">
                {!loading && !error && filteredNews.length === 0 && <div className="text-gray-500">No news items.</div>}
                {filteredNews.map(news => (
                    <div key={news.id} className="bg-white dark:bg-gray-900 rounded shadow p-4 flex gap-4 items-start cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-800" onClick={() => setModalNews(news)}>
                        <div className="text-3xl mr-2">
                            {newsTypes.find(nt => nt.key === news.type)?.icon || '📰'}
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 mb-1">{news.date}</div>
                            <div className="font-semibold text-lg mb-1">{news.headline}</div>
                            <div className="text-gray-600 dark:text-gray-300 mb-1">{news.summary}</div>
                            <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                                {news.clubs.map((c: string) => clubNameWithBadge(c))}
                                {news.players.map((p: string) => playerLink(p))}
                            </div>
                        </div>
                        {isAdmin && (
                          <div className="flex flex-col gap-2 ml-2">
                            <button className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700" onClick={e => { e.stopPropagation(); openEditNews(news); }}>Edit</button>
                            <button className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700" onClick={e => { e.stopPropagation(); if (window.confirm('Delete this news item?')) handleDeleteNews(news.id); }}>Delete</button>
                          </div>
                        )}
                    </div>
                ))}
            </div>
            {/* News Details Modal */}
            {modalNews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setModalNews(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                        <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={() => setModalNews(null)}>&times;</button>
                        <div className="text-3xl mb-2">{newsTypes.find(nt => nt.key === modalNews.type)?.icon || '📰'}</div>
                        <div className="text-xs text-gray-400 mb-1">{modalNews.date}</div>
                        <div className="font-bold text-xl mb-2">{modalNews.headline}</div>
                        <div className="mb-2 text-gray-600 dark:text-gray-300">{modalNews.details}</div>
                        <div className="flex gap-2 flex-wrap text-xs text-gray-500">
                            {modalNews.clubs.map((c: string) => clubNameWithBadge(c))}
                            {modalNews.players.map((p: string) => playerLink(p))}
                        </div>
                    </div>
                </div>
            )}
            {/* News Add/Edit Modal */}
            {showNewsModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={closeNewsModal}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-8 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                  <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl" onClick={closeNewsModal}>&times;</button>
                  <h2 className="text-xl font-bold mb-4">{editNews ? 'Edit News' : 'Add News'}</h2>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Type</label>
                    <select className="border rounded px-2 py-1 w-full" value={newsType} onChange={e => setNewsType(e.target.value)} disabled={savingNews}>
                      {newsTypes.map(nt => <option key={nt.key} value={nt.key}>{nt.label}</option>)}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">Headline</label>
                    <input className="border rounded px-2 py-1 w-full" value={newsHeadline} onChange={e => setNewsHeadline(e.target.value)} disabled={savingNews} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm mb-1">Content</label>
                    <textarea className="border rounded px-2 py-1 w-full" value={newsContent} onChange={e => setNewsContent(e.target.value)} disabled={savingNews} rows={4} />
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleSaveNews} disabled={savingNews || !newsHeadline}>{savingNews ? 'Saving...' : 'Save'}</button>
                    <button className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={closeNewsModal} disabled={savingNews}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
        </div>
    );
};

export default NewsFeedPage; 