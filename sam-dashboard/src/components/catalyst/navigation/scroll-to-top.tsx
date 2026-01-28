/**
 * ScrollToTop component for React Router
 * 
 * Scrolls to top of page on route change.
 * Required because React Router doesn't do this automatically.
 */

import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
