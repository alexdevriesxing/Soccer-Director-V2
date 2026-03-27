import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { V2PreferencesProvider } from '../preferences/V2PreferencesContext';

interface RenderV2Options {
  route: string;
  path: string;
}

export function renderV2(element: React.ReactElement, options: RenderV2Options): RenderResult {
  return render(
    <V2PreferencesProvider>
      <MemoryRouter initialEntries={[options.route]}>
        <Routes>
          <Route path={options.path} element={element} />
        </Routes>
      </MemoryRouter>
    </V2PreferencesProvider>
  );
}
