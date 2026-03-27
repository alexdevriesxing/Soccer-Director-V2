import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type V2MotionPreference = 'system' | 'full' | 'reduce';
export type V2DensityPreference = 'comfortable' | 'compact';
export type V2TextScalePreference = 'normal' | 'large' | 'x-large';
export type V2ContrastPreference = 'standard' | 'high';

export interface V2PreferencesState {
  motion: V2MotionPreference;
  density: V2DensityPreference;
  textScale: V2TextScalePreference;
  contrast: V2ContrastPreference;
  onboardingDismissed: boolean;
}

interface V2PreferencesContextValue {
  preferences: V2PreferencesState;
  resolvedMotion: Exclude<V2MotionPreference, 'system'>;
  prefersReducedMotion: boolean;
  setMotion: (motion: V2MotionPreference) => void;
  setDensity: (density: V2DensityPreference) => void;
  setTextScale: (textScale: V2TextScalePreference) => void;
  setContrast: (contrast: V2ContrastPreference) => void;
  dismissOnboarding: () => void;
  restoreOnboarding: () => void;
  resetPreferences: () => void;
}

const STORAGE_KEY = 'soccer-director:v2-preferences';

const defaultPreferences: V2PreferencesState = {
  motion: 'system',
  density: 'comfortable',
  textScale: 'normal',
  contrast: 'standard',
  onboardingDismissed: false
};

const V2PreferencesContext = createContext<V2PreferencesContextValue | null>(null);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readPreferences(): V2PreferencesState {
  if (typeof window === 'undefined') {
    return defaultPreferences;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultPreferences;
    }

    const parsed = JSON.parse(raw);
    if (!isObject(parsed)) {
      return defaultPreferences;
    }

    return {
      motion: parsed.motion === 'full' || parsed.motion === 'reduce' || parsed.motion === 'system'
        ? parsed.motion
        : defaultPreferences.motion,
      density: parsed.density === 'compact' ? 'compact' : defaultPreferences.density,
      textScale:
        parsed.textScale === 'large' || parsed.textScale === 'x-large'
          ? parsed.textScale
          : defaultPreferences.textScale,
      contrast: parsed.contrast === 'high' ? 'high' : defaultPreferences.contrast,
      onboardingDismissed: parsed.onboardingDismissed === true
    };
  } catch {
    return defaultPreferences;
  }
}

function resolvePrefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const V2PreferencesProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<V2PreferencesState>(() => readPreferences());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => resolvePrefersReducedMotion());

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = (event?: MediaQueryListEvent) => {
      setPrefersReducedMotion(event ? event.matches : mediaQuery.matches);
    };

    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    mediaQuery.addListener(update);
    return () => mediaQuery.removeListener(update);
  }, []);

  const resolvedMotion: Exclude<V2MotionPreference, 'system'> =
    preferences.motion === 'system'
      ? prefersReducedMotion
        ? 'reduce'
        : 'full'
      : preferences.motion;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));

    const root = document.documentElement;
    root.dataset.v2Motion = resolvedMotion;
    root.dataset.v2Density = preferences.density;
    root.dataset.v2TextScale = preferences.textScale;
    root.dataset.v2Contrast = preferences.contrast;
  }, [preferences, resolvedMotion]);

  const value = useMemo<V2PreferencesContextValue>(() => ({
    preferences,
    resolvedMotion,
    prefersReducedMotion,
    setMotion: (motion) => setPreferences((current) => ({ ...current, motion })),
    setDensity: (density) => setPreferences((current) => ({ ...current, density })),
    setTextScale: (textScale) => setPreferences((current) => ({ ...current, textScale })),
    setContrast: (contrast) => setPreferences((current) => ({ ...current, contrast })),
    dismissOnboarding: () => setPreferences((current) => ({ ...current, onboardingDismissed: true })),
    restoreOnboarding: () => setPreferences((current) => ({ ...current, onboardingDismissed: false })),
    resetPreferences: () => setPreferences(defaultPreferences)
  }), [preferences, prefersReducedMotion, resolvedMotion]);

  return <V2PreferencesContext.Provider value={value}>{children}</V2PreferencesContext.Provider>;
};

export function useV2Preferences(): V2PreferencesContextValue {
  const context = useContext(V2PreferencesContext);
  if (!context) {
    throw new Error('useV2Preferences must be used within a V2PreferencesProvider.');
  }
  return context;
}

export function v2ShortcutLabel(index: number): string {
  return `Alt+${index + 1}`;
}
