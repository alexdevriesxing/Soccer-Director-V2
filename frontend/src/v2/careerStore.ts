const KEY = 'sd_v2_active_career_id';
const CHANGE_EVENT = 'sd_v2_active_career_changed';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function emitChange(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getActiveCareerId(): string | null {
  if (!hasStorage()) {
    return null;
  }
  return window.localStorage.getItem(KEY);
}

export function setActiveCareerId(careerId: string) {
  if (!hasStorage()) {
    return;
  }
  const nextId = careerId.trim();
  if (!nextId) {
    window.localStorage.removeItem(KEY);
  } else {
    window.localStorage.setItem(KEY, nextId);
  }
  emitChange();
}

export function clearActiveCareerId() {
  if (!hasStorage()) {
    return;
  }
  window.localStorage.removeItem(KEY);
  emitChange();
}

export function subscribeActiveCareer(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      listener();
    }
  };

  const handleChangeEvent = () => listener();

  window.addEventListener('storage', handleStorage);
  window.addEventListener(CHANGE_EVENT, handleChangeEvent);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(CHANGE_EVENT, handleChangeEvent);
  };
}
