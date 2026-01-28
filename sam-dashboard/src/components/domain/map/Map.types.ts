/**
 * Map Component Types
 *
 * Type definitions for the Opportunity Map visualization components.
 */

import type {CSSProperties} from 'react';
import type {Feature, FeatureCollection, Geometry} from 'geojson';

// ============================================================================
// State Data Types
// ============================================================================

/**
 * US State code abbreviations (USPS standard)
 */
export type StateCode =
    | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
    | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
    | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
    | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
    | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'
    | 'DC' | 'PR' | 'VI' | 'GU' | 'AS' | 'MP';

/**
 * Aggregated opportunity data for a single state
 */
export interface StateAggregation {
    stateCode: string;
    stateName: string;
    opportunityCount: number;
    totalValue: number;
    topAgencies: string[];
    topNaics: string[];
    setAsideBreakdown: Record<string, number>;
}

/**
 * Map data aggregation result
 */
export interface MapDataAggregation {
    byState: Map<string, StateAggregation>;
    totals: {
        count: number;
        value: number;
        statesWithData: number;
    };
    maxCount: number;
    maxValue: number;
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Data source filter options
 */
export type DataSource = 'sam' | 'sbir' | 'state-local' | 'commercial' | 'all';

/**
 * Set-aside type filter options
 */
export type SetAsideType =
    | 'all'
    | '8a'
    | 'hubzone'
    | 'sdvosb'
    | 'wosb'
    | 'edwosb'
    | 'small-business'
    | 'total-small-business'
    | 'none';

/**
 * Map filter state
 */
export interface MapFilters {
    dataSource: DataSource;
    naicsCode: string | null;
    setAside: SetAsideType;
    agency: string | null;
    dateRange: {
        start: string | null;
        end: string | null;
    };
    valueRange: {
        min: number | null;
        max: number | null;
    };
}

/**
 * Default filter values
 */
export const DEFAULT_MAP_FILTERS: MapFilters = {
    dataSource: 'all',
    naicsCode: null,
    setAside: 'all',
    agency: null,
    dateRange: {
        start: null,
        end: null,
    },
    valueRange: {
        min: null,
        max: null,
    },
};

// ============================================================================
// Component Props
// ============================================================================

/**
 * Color scale metric options
 */
export type ColorMetric = 'count' | 'value';

/**
 * Main map component props
 */
export interface USChoroplethMapProps {
    /** Aggregated map data by state */
    data: MapDataAggregation;
    /** Currently selected state code */
    selectedState?: string | null;
    /** Callback when a state is clicked */
    onStateClick?: (stateCode: string) => void;
    /** Callback when a state is hovered */
    onStateHover?: (stateCode: string | null) => void;
    /** Color scale metric (count or value) */
    colorMetric?: ColorMetric;
    /** Additional CSS class */
    className?: string;
    /** Inline styles */
    style?: CSSProperties;
    /** Whether the map is in dark mode */
    isDark?: boolean;
}

/**
 * State ranking sidebar props
 */
export interface StateRankingSidebarProps {
    /** Aggregated map data */
    data: MapDataAggregation;
    /** Currently selected state */
    selectedState?: string | null;
    /** Callback when a state is clicked */
    onStateClick?: (stateCode: string) => void;
    /** Maximum number of states to show */
    maxItems?: number;
    /** Sort by count or value */
    sortBy?: ColorMetric;
    /** Additional CSS class */
    className?: string;
}

/**
 * Map filters component props
 */
export interface MapFiltersProps {
    /** Current filter state */
    filters: MapFilters;
    /** Callback when filters change */
    onFiltersChange: (filters: MapFilters) => void;
    /** Available agencies for filter dropdown */
    availableAgencies?: string[];
    /** Available NAICS codes for filter dropdown */
    availableNaics?: string[];
    /** Additional CSS class */
    className?: string;
}

/**
 * Map tooltip props
 */
export interface MapTooltipProps {
    /** State data to display */
    stateData: StateAggregation | null;
    /** X position */
    x: number;
    /** Y position */
    y: number;
    /** Whether tooltip is visible */
    visible: boolean;
}

/**
 * Map legend props
 */
export interface MapLegendProps {
    /** Minimum value in scale */
    min: number;
    /** Maximum value in scale */
    max: number;
    /** Color metric being displayed */
    metric: ColorMetric;
    /** Dark mode flag */
    isDark?: boolean;
    /** Additional CSS class */
    className?: string;
}

// ============================================================================
// GeoJSON Types
// ============================================================================

/**
 * US State GeoJSON feature properties
 */
export interface StateGeoProperties {
    /** State FIPS code */
    STATEFP?: string;
    /** State name */
    NAME?: string;
    /** State abbreviation */
    STUSPS?: string;
    /** Alternative state code property */
    STATE?: string;
    /** Alternative name property */
    name?: string;
}

/**
 * US States GeoJSON Feature
 */
export type StateFeature = Feature<Geometry, StateGeoProperties>;

/**
 * US States GeoJSON FeatureCollection
 */
export type StatesFeatureCollection = FeatureCollection<Geometry, StateGeoProperties>;

// ============================================================================
// Viewport Types
// ============================================================================

/**
 * Map viewport state
 */
export interface MapViewport {
    longitude: number;
    latitude: number;
    zoom: number;
    bearing?: number;
    pitch?: number;
}

/**
 * Default US viewport
 */
export const US_VIEWPORT: MapViewport = {
    longitude: -98.5795,
    latitude: 39.8283,
    zoom: 3.5,
    bearing: 0,
    pitch: 0,
};

// ============================================================================
// State Name Mapping
// ============================================================================

/**
 * State code to full name mapping
 */
export const STATE_NAMES: Record<string, string> = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
    DC: 'District of Columbia',
    PR: 'Puerto Rico',
    VI: 'Virgin Islands',
    GU: 'Guam',
    AS: 'American Samoa',
    MP: 'Northern Mariana Islands',
};

/**
 * Get state name from code
 */
export function getStateName(stateCode: string): string {
    return STATE_NAMES[stateCode.toUpperCase()] ?? stateCode;
}
