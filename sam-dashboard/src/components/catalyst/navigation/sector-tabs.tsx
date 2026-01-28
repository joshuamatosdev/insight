/**
 * Sector Tabs - Navigation tabs for switching between Federal/DoD, State & Local, and Commercial sectors
 */

import clsx from 'clsx'
import {motion} from 'motion/react'

export type Sector = 'federal' | 'state-local' | 'commercial'

export interface SectorTabsProps {
    currentSector: Sector
    onSectorChange: (sector: Sector) => void
    className?: string
}

const SECTOR_LABELS: Record<Sector, string> = {
    federal: 'Federal/DoD',
    'state-local': 'State & Local',
    commercial: 'Commercial',
}

const SECTOR_DESCRIPTIONS: Record<Sector, string> = {
    federal: 'SAM.gov, FPDS, USASpending opportunities',
    'state-local': 'State portals, BidNet opportunities',
    commercial: 'Private RFPs, referrals',
}

export function SectorTabs({
                               currentSector,
                               onSectorChange,
                               className,
                           }: SectorTabsProps): React.ReactElement {
    const sectors: Sector[] = ['federal', 'state-local', 'commercial']

    return (
        <nav
            className={clsx('flex items-center gap-1', className)}
            aria-label="Sector navigation"
        >
            {sectors.map((sector) => {
                const isCurrent = sector === currentSector

                return (
                    <button
                        key={sector}
                        onClick={() => onSectorChange(sector)}
                        className={clsx(
                            'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                            isCurrent
                                ? 'text-on-surface'
                                : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-container'
                        )}
                        aria-current={isCurrent ? 'page' : undefined}
                        title={SECTOR_DESCRIPTIONS[sector]}
                    >
                        {isCurrent && (
                            <motion.span
                                layoutId="sector-indicator"
                                className="absolute inset-x-0 -bottom-px h-0.5 bg-primary rounded-full"
                                transition={{type: 'spring', bounce: 0.2, duration: 0.5}}
                            />
                        )}
                        {SECTOR_LABELS[sector]}
                    </button>
                )
            })}
        </nav>
    )
}

export function SectorBadge({
                                sector,
                                className,
                            }: {
    sector: Sector
    className?: string
}): React.ReactElement {
    const colorClasses: Record<Sector, string> = {
        federal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'state-local': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
        commercial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    }

    return (
        <span
            className={clsx(
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                colorClasses[sector],
                className
            )}
        >
      {SECTOR_LABELS[sector]}
    </span>
    )
}

export default SectorTabs
