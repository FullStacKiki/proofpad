export interface Recent {
  path: string;
  openedAt: number;
}

const KEY = 'proofpad.recents';

export function loadRecents(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecent(path: string): Recent[] {
  const list = [{ path, openedAt: Date.now() }, ...loadRecents().filter((r) => r.path !== path)].slice(0, 8);
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export function loadPref<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem('proofpad.' + key);
    return v === null ? fallback : (JSON.parse(v) as T);
  } catch {
    return fallback;
  }
}

export function savePref(key: string, value: unknown) {
  try {
    localStorage.setItem('proofpad.' + key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}
