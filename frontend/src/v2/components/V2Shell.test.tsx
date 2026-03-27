import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import V2Shell from './V2Shell';
import { V2PreferencesProvider } from '../preferences/V2PreferencesContext';

function renderShell(initialRoute = '/new-career') {
  return render(
    <V2PreferencesProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/new-career" element={<V2Shell title="Career Setup"><div>Career Setup Body</div></V2Shell>} />
          <Route path="/club-pulse" element={<V2Shell title="Pulse"><div>Pulse Body</div></V2Shell>} />
          <Route path="/hq" element={<V2Shell title="HQ"><div>HQ Body</div></V2Shell>} />
        </Routes>
      </MemoryRouter>
    </V2PreferencesProvider>
  );
}

describe('V2Shell', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.v2Motion;
    delete document.documentElement.dataset.v2Density;
    delete document.documentElement.dataset.v2TextScale;
    delete document.documentElement.dataset.v2Contrast;
  });

  it('shows an onboarding banner on the career setup route instead of auto-opening the guide', async () => {
    renderShell('/new-career');

    expect(await screen.findByTestId('v2-shell-onboarding-banner')).toBeInTheDocument();
    expect(screen.getByText(/Start with the weekly loop, not the menus/i)).toBeInTheDocument();
    expect(screen.queryByText('Weekly Loop')).not.toBeInTheDocument();
  });

  it('applies interface preference changes to the document root', async () => {
    renderShell('/hq');

    fireEvent.click(screen.getByRole('button', { name: /open interface settings/i }));
    fireEvent.click(await screen.findByRole('button', { name: /high contrast/i }));
    fireEvent.click(screen.getByRole('button', { name: /compact/i }));
    fireEvent.click(screen.getByRole('button', { name: /reduced/i }));

    expect(document.documentElement.dataset.v2Contrast).toBe('high');
    expect(document.documentElement.dataset.v2Density).toBe('compact');
    expect(document.documentElement.dataset.v2Motion).toBe('reduce');
  });

  it('supports keyboard navigation shortcuts', async () => {
    renderShell('/hq');

    expect(screen.getByText('HQ Body')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: '3', altKey: true });

    expect(await screen.findByText('Pulse Body')).toBeInTheDocument();
  });
});
