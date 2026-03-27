import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { ManagerProfileProvider } from './context/ManagerProfileContext';
import V2RouteErrorBoundary from './v2/components/V2RouteErrorBoundary';
import { V2PreferencesProvider } from './v2/preferences/V2PreferencesContext';

// Styles
import './App.css';
import './i18n';

function lazyWithRetry<T extends React.ComponentType<unknown>>(
  importer: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      const shouldReload =
        typeof window !== 'undefined' &&
        message.toLowerCase().includes('loading chunk') &&
        window.sessionStorage.getItem('sd_v2_chunk_retry') !== 'done';

      if (shouldReload) {
        window.sessionStorage.setItem('sd_v2_chunk_retry', 'done');
        window.location.reload();
      }

      throw error;
    }
  });
}

const TitleScreenPage = lazyWithRetry(() => import('./pages/TitleScreenPage'));
const ProfileCreationPage = lazyWithRetry(() => import('./pages/ProfileCreationPage'));
const FinancesPage = lazyWithRetry(() => import('./pages/FinancesPage').then((module) => ({ default: module.FinancesPage })));
const StadiumManagementPage = lazyWithRetry(() => import('./pages/StadiumManagementPage'));
const FacilitiesPage = lazyWithRetry(() => import('./pages/FacilitiesPage'));
const CompliancePage = lazyWithRetry(() => import('./pages/CompliancePage'));
const SquadPage = lazyWithRetry(() => import('./pages/SquadPage'));
const TransfersPage = lazyWithRetry(() => import('./pages/TransfersPage'));
const ClubPage = lazyWithRetry(() => import('./pages/ClubPage'));
const MatchPage = lazyWithRetry(() => import('./pages/MatchPage'));
const LanguageSelectionPage = lazyWithRetry(() => import('./pages/LanguageSelectionPage'));
const O21ManagementPage = lazyWithRetry(() => import('./pages/O21ManagementPage'));
const YouthAcademyPage = lazyWithRetry(() => import('./pages/YouthAcademyPage'));
const ClubTacticsPage = lazyWithRetry(() => import('./pages/ClubTacticsPage'));
const NewCareerPage = lazyWithRetry(() => import('./v2/pages/NewCareerPage'));
const HQPage = lazyWithRetry(() => import('./v2/pages/HQPage'));
const ClubPulsePage = lazyWithRetry(() => import('./v2/pages/ClubPulsePage'));
const WeekPlannerPage = lazyWithRetry(() => import('./v2/pages/WeekPlannerPage'));
const InboxPage = lazyWithRetry(() => import('./v2/pages/InboxPage'));
const MatchCenterPage = lazyWithRetry(() => import('./v2/pages/MatchCenterPage'));
const PostMatchPage = lazyWithRetry(() => import('./v2/pages/PostMatchPage'));
const StandingsPage = lazyWithRetry(() => import('./v2/pages/StandingsPage'));
const SquadV2Page = lazyWithRetry(() => import('./v2/pages/SquadPage'));
const FinancesV2Page = lazyWithRetry(() => import('./v2/pages/FinancesPage'));
const SaveLoadPage = lazyWithRetry(() => import('./v2/pages/SaveLoadPage'));

// Default quotes in case the API fails
const DEFAULT_QUOTES = [
  { quote: 'Football is a simple game. Twenty-two men chase a ball for 90 minutes and at the end, the Germans always win.', author: 'Gary Lineker' },
  { quote: 'Some people think football is a matter of life and death. I assure you, it\'s much more serious than that.', author: 'Bill Shankly' },
  { quote: 'The ball is round, the game lasts 90 minutes, and everything else is pure theory.', author: 'Sepp Herberger' },
  { quote: 'You can change your wife, your politics, your religion, but never, never can you change your favorite football team.', author: 'Eric Cantona' }
];

// Feature flag to enable/disable live quote fetching
const ENABLE_QUOTES = (process.env.REACT_APP_ENABLE_QUOTES || '').toLowerCase() === 'true';
const ENABLE_V2 = (process.env.REACT_APP_V2_ENABLED || 'true').toLowerCase() !== 'false';

// Game content wrapper component
const GameContent: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-content">
      <div className="app-bg"></div>
      {children}
    </div>
  );
};

const RouteFallback: React.FC = () => (
  <div className="app-content">
    <div className="app-bg"></div>
    <div className="v2-route-fallback" role="status" aria-live="polite">
      <div className="v2-route-fallback__card">
        <p className="v2-route-fallback__eyebrow">Soccer Director</p>
        <h2 className="v2-route-fallback__title">Loading interface</h2>
        <p className="v2-route-fallback__body">Preparing the next management surface.</p>
      </div>
    </div>
  </div>
);

const QuoteBanner: React.FC<{ quote: { quote: string; author: string } }> = ({ quote }) => {
  const location = useLocation();
  const managerRoutePrefixes = [
    '/profile-creation',
    '/new-career',
    '/hq',
    '/club-pulse',
    '/week-planner',
    '/inbox',
    '/match-center',
    '/post-match',
    '/standings',
    '/career-squad',
    '/career-finances',
    '/save-load',
    '/v2'
  ];
  if (managerRoutePrefixes.some((prefix) => location.pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      padding: '12px 24px',
      textAlign: 'center',
      fontStyle: 'italic',
      fontSize: '1rem',
      borderRadius: '8px',
      maxWidth: '800px',
      width: '90%',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      pointerEvents: 'none'
    }}>
      "{quote.quote}" — <span style={{ fontWeight: 'bold' }}>{quote.author}</span>
    </div>
  );
};

const LegacyMatchCenterRedirect: React.FC = () => {
  const { matchId } = useParams();
  if (!matchId) {
    return <Navigate to="/hq" replace />;
  }
  return <Navigate to={`/match-center/${matchId}`} replace />;
};

const LegacyPostMatchRedirect: React.FC = () => {
  const { matchId } = useParams();
  if (!matchId) {
    return <Navigate to="/hq" replace />;
  }
  return <Navigate to={`/post-match/${matchId}`} replace />;
};

function App() {
  const [quote, setQuote] = useState<{ quote: string; author: string }>(DEFAULT_QUOTES[0]);

  // Fetch a random football quote on component mount
  useEffect(() => {
    if (!ENABLE_QUOTES) {
      // Use a random default quote and do not schedule polling
      const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      setQuote(DEFAULT_QUOTES[randomIndex]);
      return;
    }

    let intervalId: number | undefined;
    const fetchQuote = async () => {
      try {
        const base = process.env.REACT_APP_API_BASE || '';
        const response = await fetch(`${base}/api/football-quotes`);
        if (response.ok) {
          const data = await response.json();
          setQuote(data);
          return true;
        }
      } catch (_) {
        // Quietly fall back below
      }
      // Fallback to default quotes if API fails
      const randomIndex = Math.floor(Math.random() * DEFAULT_QUOTES.length);
      setQuote(DEFAULT_QUOTES[randomIndex]);
      return false;
    };

    (async () => {
      const ok = await fetchQuote();
      // Only poll if initial request succeeded to avoid repeated 500s in console
      if (ok) {
        intervalId = window.setInterval(fetchQuote, 30000);
      }
    })();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Add animated background styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bgMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      .app-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        background: linear-gradient(-45deg, #1e293b, #0f172a, #1e1e2e, #1e1b4b);
        background-size: 400% 400%;
        animation: bgMove 15s ease infinite;
      }
      .app-content {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ManagerProfileProvider>
      <V2PreferencesProvider>
        <Router>
          <div className="App">
            <V2RouteErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<Navigate to={ENABLE_V2 ? '/new-career' : '/title-screen'} replace />} />
                  <Route path="/title-screen" element={
                    <div className="app-content">
                      <div className="app-bg"></div>
                      <TitleScreenPage onStartGame={() => window.location.href = '/language-selector'} />
                    </div>
                  } />
                  <Route path="/language-selector" element={
                    <div className="app-content">
                      <div className="app-bg"></div>
                      <LanguageSelectionPage />
                    </div>
                  } />
                  <Route path="/profile-creation" element={
                    <div className="app-content">
                      <div className="app-bg"></div>
                      <ProfileCreationPage />
                    </div>
                  } />

                  {ENABLE_V2 && (
                    <>
                      <Route path="/new-career" element={<NewCareerPage />} />
                      <Route path="/hq" element={<HQPage />} />
                      <Route path="/club-pulse" element={<ClubPulsePage />} />
                      <Route path="/week-planner" element={<WeekPlannerPage />} />
                      <Route path="/inbox" element={<InboxPage />} />
                      <Route path="/match-center/:matchId" element={<MatchCenterPage />} />
                      <Route path="/post-match/:matchId" element={<PostMatchPage />} />
                      <Route path="/standings" element={<StandingsPage />} />
                      <Route path="/career-squad" element={<SquadV2Page />} />
                      <Route path="/career-finances" element={<FinancesV2Page />} />
                      <Route path="/save-load" element={<SaveLoadPage />} />

                      <Route path="/v2" element={<Navigate to="/new-career" replace />} />
                      <Route path="/v2/new-career" element={<Navigate to="/new-career" replace />} />
                      <Route path="/v2/hq" element={<Navigate to="/hq" replace />} />
                      <Route path="/v2/pulse" element={<Navigate to="/club-pulse" replace />} />
                      <Route path="/v2/week-planner" element={<Navigate to="/week-planner" replace />} />
                      <Route path="/v2/inbox" element={<Navigate to="/inbox" replace />} />
                      <Route path="/v2/match-center/:matchId" element={<LegacyMatchCenterRedirect />} />
                      <Route path="/v2/post-match/:matchId" element={<LegacyPostMatchRedirect />} />
                      <Route path="/v2/standings" element={<Navigate to="/standings" replace />} />
                      <Route path="/v2/squad" element={<Navigate to="/career-squad" replace />} />
                      <Route path="/v2/finances" element={<Navigate to="/career-finances" replace />} />
                      <Route path="/v2/save-load" element={<Navigate to="/save-load" replace />} />
                    </>
                  )}

                  {/* Main Game Routes */}
                  <Route path="/club" element={<GameContent><ClubPage /></GameContent>} />
                  <Route path="/squad" element={<GameContent><SquadPage /></GameContent>} />
                  <Route path="/transfers" element={<GameContent><TransfersPage /></GameContent>} />
                  <Route path="/finances" element={<GameContent><FinancesPage /></GameContent>} />
                  <Route path="/stadium" element={<GameContent><StadiumManagementPage /></GameContent>} />
                  <Route path="/facilities" element={<GameContent><FacilitiesPage /></GameContent>} />
                  <Route path="/compliance" element={<GameContent><CompliancePage /></GameContent>} />
                  <Route path="/youth-academy" element={<GameContent><YouthAcademyPage /></GameContent>} />
                  <Route path="/o21-management" element={<GameContent><O21ManagementPage /></GameContent>} />
                  <Route path="/tactics" element={<GameContent><ClubTacticsPage /></GameContent>} />
                  <Route path="/match/:fixtureId" element={<GameContent><MatchPage /></GameContent>} />

                  <Route path="*" element={<Navigate to="/title-screen" replace />} />
                </Routes>
              </Suspense>
            </V2RouteErrorBoundary>

            <QuoteBanner quote={quote} />
          </div>
        </Router>
      </V2PreferencesProvider>
    </ManagerProfileProvider>
  );
}

export default App;
