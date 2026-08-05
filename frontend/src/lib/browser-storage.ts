'use client';

export function getBrowserStorage(): Storage | null {
  if (globalThis.window === undefined) {
    return null;
  }

  try {
    const storage = globalThis.window.localStorage;

    return storage && typeof storage.getItem === 'function' ? storage : null;
  } catch {
    return null;
  }
}
