'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : prefersDark;

    setIsDark(shouldUseDark);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark, mounted]);

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="fixed right-4 top-4 z-50 rounded-full border border-gray-300 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur"
      >
        🌓
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      onClick={() => setIsDark((prev) => !prev)}
      className="fixed right-4 top-4 z-50 rounded-full border border-gray-300 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
