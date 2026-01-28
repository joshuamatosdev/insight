import {createRootRouteWithContext, Outlet} from '@tanstack/react-router';
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools';
import Lenis from 'lenis';
import {useEffect} from 'react';
import {RootFrame} from '@/components/catalyst/layout';
import type {AuthContextType} from '@/auth/Auth.types';

// Router context includes auth state
export interface RouterContext {
    auth: AuthContextType;
}

// Initialize smooth scrolling
function useSmoothScrolling() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);
}

function RootComponent() {
    useSmoothScrolling();

    return (
        <RootFrame>
            <Outlet/>
            {process.env.NODE_ENV === 'development' && (
                <TanStackRouterDevtools position="bottom-right"/>
            )}
        </RootFrame>
    );
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
});
