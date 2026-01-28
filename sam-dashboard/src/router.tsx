import {createRouter, createRootRoute, createRoute} from '@tanstack/react-router';
import {Route as RootRoute} from './routes/__root';
import {Route as AuthenticatedRoute} from './routes/_authenticated';
import {Route as PublicRoute} from './routes/_public';
import {Route as DashboardRoute} from './routes/_authenticated/index';
import {Route as LoginRoute} from './routes/_public/login';

// Create the route tree
const routeTree = RootRoute.addChildren([
  AuthenticatedRoute.addChildren([
    DashboardRoute,
    // Additional authenticated routes will be added here
  ]),
  PublicRoute.addChildren([
    LoginRoute,
    // Additional public routes will be added here
  ]),
]);

// Create the router
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!, // Will be provided by RouterProvider
  },
});

// Type-safe router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
