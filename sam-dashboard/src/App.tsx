import {RouterProvider} from '@tanstack/react-router';
import {AuthProvider, useAuth} from './auth';
import {router} from './router';

function InnerApp() {
    const auth = useAuth();

    // Wait for auth to initialize before rendering routes
    if (auth.isLoading) {
        return null;
    }

    return <RouterProvider router={router} context={{auth}}/>;
}

function App() {
    return (
        <AuthProvider>
            <InnerApp/>
        </AuthProvider>
    );
}

export default App;
