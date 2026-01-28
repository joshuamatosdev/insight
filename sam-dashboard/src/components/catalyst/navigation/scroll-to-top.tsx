/**
 * ScrollToTop component for TanStack Router
 *
 * Scrolls to top of page on route change.
 */

import {useEffect} from 'react'
import {useLocation} from '@tanstack/react-router'

export function ScrollToTop() {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return null
}
