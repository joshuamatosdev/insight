import {createRouter} from '@tanstack/react-router';
import {routeTree} from './routeTree.gen';

// Create the router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: undefined!, // Will be provided by RouterProvider in App.tsx
  },
});

// Type-safe router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
