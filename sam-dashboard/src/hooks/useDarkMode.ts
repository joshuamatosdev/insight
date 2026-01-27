/**
 * useDarkMode hook
 * 
 * Manages dark mode state with localStorage persistence.
 * Adds/removes 'dark' class on document.documentElement for Tailwind CSS.
 */

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme-preference'

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

function applyTheme(theme: Theme): void {
  const effectiveTheme = theme === 'system' ? getSystemPreference() : theme
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [isDark, setIsDark] = useState<boolean>(false)

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme)
    const effectiveTheme = theme === 'system' ? getSystemPreference() : theme
    setIsDark(effectiveTheme === 'dark')
  }, [theme])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      applyTheme('system')
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    setThemeState(newTheme)
  }

  const toggleDark = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return {
    theme,
    isDark,
    setTheme,
    toggleDark,
  }
}

export type { Theme }
