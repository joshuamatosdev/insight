/**
 * ThemeToggle component using Catalyst Button
 * 
 * Toggles between light/dark mode using the useDarkMode hook.
 */

import {MoonIcon, SunIcon} from '@heroicons/react/20/solid'
import {Button} from '../primitives/button'
import {useDarkMode} from '../../../hooks/useDarkMode'

export function ThemeToggle() {
  const { isDark, toggleDark } = useDarkMode()

  return (
    <Button
      outline
      onClick={toggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 dark:block" />
    </Button>
  )
}

export function ThemeToggleCompact() {
  const { isDark, toggleDark } = useDarkMode()

  return (
    <Button
      plain
      onClick={toggleDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <SunIcon className="h-5 w-5 dark:hidden" />
      <MoonIcon className="hidden h-5 w-5 dark:block" />
    </Button>
  )
}
