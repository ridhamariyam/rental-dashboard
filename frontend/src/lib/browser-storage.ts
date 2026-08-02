'use client';

export function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storage = window.localStorage;

    return storage && typeof storage.getItem === 'function' ? storage : null;
  } catch {
    return null;
  }
}
