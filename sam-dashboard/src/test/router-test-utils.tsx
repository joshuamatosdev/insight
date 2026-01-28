/**
 * Test utilities for TanStack Router
 *
 * Provides wrappers and utilities for testing components that use routing.
 */
import {
    createMemoryHistory,
    createRootRoute,
    createRoute,
    createRouter,
    RouterProvider,
} from '@tanstack/react-router';
import type {ReactNode} from 'react';

/**
 * Creates a test router with custom routes for testing
 */
export function createTestRouter(options: {
    component: ReactNode;
    initialPath?: string;
    routes?: Array<{ path: string; component: ReactNode }>;
}) {
    const {component, initialPath = '/', routes = []} = options;

    const rootRoute = createRootRoute();

    const indexRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: () => <>{component}</>,
    });

    const additionalRoutes = routes.map((route, index) =>
        createRoute({
            getParentRoute: () => rootRoute,
            path: route.path,
            id: `route-${index}`,
            component: () => <>{route.component}</>,
        })
    );

    const routeTree = rootRoute.addChildren([indexRoute, ...additionalRoutes]);

    const memoryHistory = createMemoryHistory({
        initialEntries: [initialPath],
    });

    const router = createRouter({
        routeTree,
        history: memoryHistory,
    });

    return router;
}

/**
 * A simple wrapper component for testing components that need router context.
 * Use this for components that just need basic router context.
 */
export function RouterTestWrapper({
                                      children,
                                      initialPath = '/',
                                  }: {
    children: ReactNode;
    initialPath?: string;
}) {
    const router = createTestRouter({
        component: children,
        initialPath,
    });

    return <RouterProvider router={router}/>;
}

/**
 * Creates render options with router wrapper
 */
export function withRouter(initialPath = '/') {
    return {
        wrapper: ({children}: { children: ReactNode }) => (
            <RouterTestWrapper initialPath={initialPath}>{children}</RouterTestWrapper>
        ),
    };
}
