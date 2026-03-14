import { useState, useEffect } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 读取保存的主题设置
    const saved = localStorage.getItem('theme-mode') as ThemeMode;
    if (saved) {
      setThemeMode(saved);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let resolved: 'light' | 'dark';
      if (themeMode === 'system') {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      } else {
        resolved = themeMode;
      }
      setResolvedTheme(resolved);
      
      // 应用到 document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    };

    updateTheme();
    mediaQuery.addEventListener('change', updateTheme);
    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, [themeMode]);

  const setMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem('theme-mode', mode);
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  return { themeMode, resolvedTheme, setMode, toggleTheme };
}
