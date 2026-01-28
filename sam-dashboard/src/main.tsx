import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import {SectorProvider} from './hooks/useSector';
import {queryClient} from './lib/query-client';
import './styles/globals.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
    throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>');
}

createRoot(rootElement).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <SectorProvider>
                <App/>
            </SectorProvider>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </StrictMode>
);
