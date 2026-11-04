import { useSyncExternalStore } from 'react';

// Theme lives on <html class="dark">. A tiny external store keeps every
// toggle on the page in sync (header, mobile menu, app top bar).
const listeners = new Set();

const subscribe = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

const getSnapshot = () => (document.documentElement.classList.contains('dark') ? 'dark' : 'light');

const setTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // storage blocked (private mode) — theme still applies for this visit
  }
  listeners.forEach((listener) => listener());
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => 'light');
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  return { theme, toggleTheme };
};
