import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useV2Preferences, v2ShortcutLabel } from '../preferences/V2PreferencesContext';

const links = [
  { to: '/new-career', label: 'New Career' },
  { to: '/hq', label: 'HQ' },
  { to: '/club-pulse', label: 'Pulse' },
  { to: '/week-planner', label: 'Planner' },
  { to: '/inbox', label: 'Inbox' },
  { to: '/standings', label: 'Standings' },
  { to: '/career-squad', label: 'Squad' },
  { to: '/career-finances', label: 'Finances' },
  { to: '/save-load', label: 'Save/Load' }
];

interface V2ShellProps {
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

type DrawerMode = 'help' | 'settings' | null;

function isTextInputTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
}

function isRouteActive(currentPathname: string, route: string): boolean {
  return currentPathname === route || currentPathname.startsWith(`${route}/`);
}

const V2Shell: React.FC<V2ShellProps> = ({ title, children, actions }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef<HTMLElement | null>(null);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const {
    preferences,
    resolvedMotion,
    prefersReducedMotion,
    setMotion,
    setDensity,
    setTextScale,
    setContrast,
    dismissOnboarding,
    restoreOnboarding,
    resetPreferences
  } = useV2Preferences();

  const activeShortcutSummary = useMemo(
    () => [
      `Motion: ${resolvedMotion === 'reduce' ? 'Reduced' : preferences.motion === 'system' ? 'System' : 'Full'}`,
      `Density: ${preferences.density === 'compact' ? 'Compact' : 'Comfortable'}`,
      `Text: ${preferences.textScale === 'x-large' ? 'XL' : preferences.textScale === 'large' ? 'Large' : 'Standard'}`,
      `Contrast: ${preferences.contrast === 'high' ? 'High' : 'Standard'}`
    ],
    [preferences.contrast, preferences.density, preferences.motion, preferences.textScale, resolvedMotion]
  );
  const showOnboardingBanner = !preferences.onboardingDismissed && location.pathname === '/new-career';

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      mainRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextInputTarget(event.target)) {
        return;
      }

      if (event.key === 'Escape' && drawerMode) {
        event.preventDefault();
        setDrawerMode(null);
        return;
      }

      if (event.altKey && !event.ctrlKey && !event.metaKey) {
        if (/^[1-9]$/.test(event.key)) {
          const targetLink = links[Number(event.key) - 1];
          if (targetLink) {
            event.preventDefault();
            navigate(targetLink.to);
          }
          return;
        }

        if (event.key === '0') {
          event.preventDefault();
          setDrawerMode('settings');
          return;
        }
      }

      if ((event.key === '?' || (event.key === '/' && event.shiftKey)) && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setDrawerMode('help');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerMode, navigate]);

  return (
    <div className="v2-shell">
      <a className="v2-shell__skip-link" href="#v2-main-content">
        Skip to main content
      </a>
      <div className="v2-shell__chrome">
        <div className="v2-shell__header-wrap">
          <header className="v2-shell__header">
            <div className="v2-shell__header-main">
              <div className="v2-shell__title-block">
                <p className="v2-shell__eyebrow">Soccer Director</p>
                <h1 className="v2-shell__title">{title}</h1>
                <p className="v2-shell__title-sub">Run the club week to week with fast decisions and clear consequences.</p>
              </div>
              <div className="v2-shell__header-actions">
                <div className="v2-shell__header-actions-main">{actions}</div>
                <button type="button" className="v2-button v2-button--ghost" onClick={() => setDrawerMode('help')} aria-label="Open manager guide">
                  Guide
                </button>
                <button type="button" className="v2-button v2-button--secondary" onClick={() => setDrawerMode('settings')} aria-label="Open interface settings">
                  Settings
                </button>
              </div>
            </div>
            <div className="v2-shell__status-row" aria-label="Interface preferences summary">
              <div className="v2-chip-row">
                {activeShortcutSummary.map((item) => (
                  <span key={item} className="v2-chip">{item}</span>
                ))}
              </div>
              <div className="v2-shell__shortcut-hint">Shortcuts: <strong>Alt+1-9</strong> navigate, <strong>Alt+0</strong> settings, <strong>?</strong> guide</div>
            </div>
            <nav className="v2-shell__nav" aria-label="Manager navigation">
              {links.map((link, index) => {
                const active = isRouteActive(location.pathname, link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`v2-shell__nav-link${active ? ' is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    aria-keyshortcuts={v2ShortcutLabel(index)}
                    title={`${link.label} (${v2ShortcutLabel(index)})`}
                  >
                    <span>{link.label}</span>
                    <span className="v2-shell__nav-shortcut">{index + 1}</span>
                  </Link>
                );
              })}
            </nav>
          </header>
        </div>
        <main id="v2-main-content" ref={mainRef} tabIndex={-1} className="v2-shell__main">
          <div className="v2-shell__inner v2-page">
            {showOnboardingBanner ? (
              <section className="v2-shell__onboarding v2-panel v2-panel--soft" data-testid="v2-shell-onboarding-banner">
                <div className="v2-shell__onboarding-copy">
                  <p className="v2-kicker" style={{ marginTop: 0, marginBottom: 6 }}>New Manager Tip</p>
                  <h2 className="v2-panel__title" style={{ marginBottom: 4 }}>Start with the weekly loop, not the menus.</h2>
                  <p className="v2-panel__subtitle">
                    Create a career, continue from HQ, then only open Planner, Inbox, Match Center, or Finances when the week exposes a decision.
                  </p>
                </div>
                <div className="v2-inline-actions">
                  <button type="button" className="v2-button v2-button--primary" onClick={() => setDrawerMode('help')}>
                    Open Guide
                  </button>
                  <button type="button" className="v2-button v2-button--ghost" onClick={dismissOnboarding}>
                    Hide onboarding
                  </button>
                </div>
              </section>
            ) : null}
            {children}
          </div>
        </main>
      </div>

      {drawerMode ? (
        <div className="v2-shell__drawer-backdrop">
          <aside
            className="v2-shell__drawer"
            role="dialog"
            aria-labelledby="v2-shell-drawer-title"
          >
            <div className="v2-shell__drawer-header">
              <div>
                <p className="v2-kicker">Manager Assist</p>
                <h2 id="v2-shell-drawer-title" className="v2-panel__title">
                  {drawerMode === 'help' ? 'Quick Guide' : 'Interface Settings'}
                </h2>
              </div>
              <button type="button" className="v2-button v2-button--ghost" onClick={() => setDrawerMode(null)}>
                Close
              </button>
            </div>

            <div className="v2-shell__drawer-tabs" role="tablist" aria-label="Shell panel mode">
              <button
                type="button"
                className={`v2-shell__drawer-tab${drawerMode === 'help' ? ' is-active' : ''}`}
                onClick={() => setDrawerMode('help')}
                role="tab"
                aria-selected={drawerMode === 'help'}
              >
                Guide
              </button>
              <button
                type="button"
                className={`v2-shell__drawer-tab${drawerMode === 'settings' ? ' is-active' : ''}`}
                onClick={() => setDrawerMode('settings')}
                role="tab"
                aria-selected={drawerMode === 'settings'}
              >
                Settings
              </button>
            </div>

            {drawerMode === 'help' ? (
              <div className="v2-shell__drawer-body v2-stack">
                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Weekly Loop</h3>
                  <ol className="v2-shell__ordered-list">
                    <li>Create or resume a career from New Career.</li>
                    <li>Use HQ and the Continue action to stay in the intended weekly flow.</li>
                    <li>Planner, Inbox, Match Center, and Post-Match will surface only when that phase is ready.</li>
                    <li>Open Squad or Finances when the loop exposes a decision that needs context.</li>
                  </ol>
                </section>

                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Navigation Shortcuts</h3>
                  <div className="v2-shell__shortcut-grid">
                    {links.map((link, index) => (
                      <button
                        key={link.to}
                        type="button"
                        className="v2-shell__shortcut-card"
                        onClick={() => {
                          navigate(link.to);
                          setDrawerMode(null);
                        }}
                      >
                        <span className="v2-badge v2-badge--success">{v2ShortcutLabel(index)}</span>
                        <strong>{link.label}</strong>
                      </button>
                    ))}
                    <div className="v2-shell__shortcut-card v2-shell__shortcut-card--static">
                      <span className="v2-badge v2-badge--medium">?</span>
                      <strong>Open this guide</strong>
                    </div>
                    <div className="v2-shell__shortcut-card v2-shell__shortcut-card--static">
                      <span className="v2-badge v2-badge--medium">Alt+0</span>
                      <strong>Open settings</strong>
                    </div>
                  </div>
                </section>

                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Accessibility State</h3>
                  <div className="v2-chip-row">
                    <span className="v2-chip">System reduced motion: {prefersReducedMotion ? 'On' : 'Off'}</span>
                    <span className="v2-chip">Onboarding: {preferences.onboardingDismissed ? 'Hidden' : 'Auto-open on Career Setup'}</span>
                  </div>
                  <div className="v2-inline-actions" style={{ marginTop: 10 }}>
                    {preferences.onboardingDismissed ? (
                      <button type="button" className="v2-button v2-button--secondary" onClick={restoreOnboarding}>
                        Re-enable onboarding
                      </button>
                    ) : (
                      <button type="button" className="v2-button v2-button--ghost" onClick={dismissOnboarding}>
                        Stop auto-opening this guide
                      </button>
                    )}
                  </div>
                </section>
              </div>
            ) : (
              <div className="v2-shell__drawer-body v2-stack">
                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Motion</h3>
                  <div className="v2-shell__choice-grid">
                    {[
                      { value: 'system', label: 'System', note: 'Follow operating-system motion preference.' },
                      { value: 'full', label: 'Full', note: 'Keep page transitions and hover motion.' },
                      { value: 'reduce', label: 'Reduced', note: 'Disable decorative motion and transitions.' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`v2-shell__choice-card${preferences.motion === option.value ? ' is-active' : ''}`}
                        onClick={() => setMotion(option.value as typeof preferences.motion)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Readability</h3>
                  <div className="v2-shell__choice-grid">
                    {[
                      { value: 'normal', label: 'Standard text', note: 'Default reading density.' },
                      { value: 'large', label: 'Large text', note: 'Boost labels and page copy.' },
                      { value: 'x-large', label: 'Extra large', note: 'Prioritize legibility over density.' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`v2-shell__choice-card${preferences.textScale === option.value ? ' is-active' : ''}`}
                        onClick={() => setTextScale(option.value as typeof preferences.textScale)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Layout Density</h3>
                  <div className="v2-shell__choice-grid">
                    {[
                      { value: 'comfortable', label: 'Comfortable', note: 'More spacing between cards and controls.' },
                      { value: 'compact', label: 'Compact', note: 'Fit more management data above the fold.' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`v2-shell__choice-card${preferences.density === option.value ? ' is-active' : ''}`}
                        onClick={() => setDensity(option.value as typeof preferences.density)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section className="v2-panel v2-panel--soft">
                  <h3 className="v2-panel__title">Contrast</h3>
                  <div className="v2-shell__choice-grid">
                    {[
                      { value: 'standard', label: 'Standard', note: 'Balanced game presentation.' },
                      { value: 'high', label: 'High contrast', note: 'Stronger borders, brighter text, deeper surfaces.' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`v2-shell__choice-card${preferences.contrast === option.value ? ' is-active' : ''}`}
                        onClick={() => setContrast(option.value as typeof preferences.contrast)}
                      >
                        <strong>{option.label}</strong>
                        <span>{option.note}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <div className="v2-inline-actions">
                  <button type="button" className="v2-button v2-button--ghost" onClick={resetPreferences}>
                    Reset to defaults
                  </button>
                  {preferences.onboardingDismissed ? (
                    <button type="button" className="v2-button v2-button--secondary" onClick={restoreOnboarding}>
                      Re-enable onboarding
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </aside>
        </div>
      ) : null}
    </div>
  );
};

export default V2Shell;
