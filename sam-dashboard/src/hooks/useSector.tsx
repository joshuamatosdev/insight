/**
 * Sector Context and Hook
 * Manages the current sector selection across the application
 */

import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import type {Sector} from '../components/catalyst/navigation/sector-tabs';

interface SectorContextValue {
    currentSector: Sector;
    setSector: (sector: Sector) => void;
    sectorLabel: string;
}

const SECTOR_LABELS: Record<Sector, string> = {
    federal: 'Federal/DoD',
    'state-local': 'State & Local',
    commercial: 'Commercial',
};

const STORAGE_KEY = 'insight-current-sector';

// Default context value
const defaultContextValue: SectorContextValue = {
    currentSector: 'federal',
    setSector: () => {
        // No-op default
    },
    sectorLabel: 'Federal/DoD',
};

// Create context
export const SectorContext = createContext<SectorContextValue>(defaultContextValue);

// Provider props
export interface SectorProviderProps {
    children: React.ReactNode;
    defaultSector?: Sector;
}

/**
 * SectorProvider - Provides sector context to the application
 */
export function SectorProvider({
                                   children,
                                   defaultSector = 'federal',
                               }: SectorProviderProps): React.ReactElement {
    // Initialize from localStorage or default
    const [currentSector, setCurrentSector] = useState<Sector>(() => {
        if (typeof window === 'undefined') return defaultSector;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'federal' || stored === 'state-local' || stored === 'commercial') {
            return stored;
        }
        return defaultSector;
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, currentSector);
    }, [currentSector]);

    const setSector = useCallback((sector: Sector) => {
        setCurrentSector(sector);
    }, []);

    const value: SectorContextValue = {
        currentSector,
        setSector,
        sectorLabel: SECTOR_LABELS[currentSector],
    };

    // Return provider using createElement to avoid JSX in a TS file
    return (
        <SectorContext.Provider value={value}>
            {children}
        </SectorContext.Provider>
    );
}

/**
 * useSector - Hook to access sector context
 */
export function useSector(): SectorContextValue {
    const context = useContext(SectorContext);
    return context;
}

export type {Sector};
export default useSector;
