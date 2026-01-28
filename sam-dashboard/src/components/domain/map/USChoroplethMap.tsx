/**
 * USChoroplethMap Component
 *
 * A choropleth map of the United States showing opportunity data by state.
 * Uses a simple SVG-based approach for rendering state shapes.
 */

import {useCallback, useEffect, useMemo, useState} from 'react';

import {Box} from '@/components/catalyst';

import type {
  ColorMetric,
  StateGeoProperties,
  StatesFeatureCollection,
  USChoroplethMapProps,
} from './Map.types';
import {MapLegend} from './MapLegend';
import {MapTooltip} from './MapTooltip';

// US States GeoJSON URL
const US_STATES_GEOJSON_URL =
  'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json';

// Color scales
const LIGHT_COLOR_SCALE = [
  '#f7fbff',  // Very light blue
  '#deebf7',
  '#c6dbef',
  '#9ecae1',
  '#6baed6',
  '#4292c6',
  '#2171b5',
  '#08519c',
  '#08306b',  // Dark blue
];

const DARK_COLOR_SCALE = [
  '#1e1e2e',  // Very dark
  '#312e59',
  '#453e84',
  '#594eaf',
  '#6e5fc9',
  '#8673dc',
  '#a08ceb',
  '#bca8f6',
  '#dcc8ff',  // Light purple
];

// No data color
const NO_DATA_COLOR_LIGHT = '#f0f0f0';
const NO_DATA_COLOR_DARK = '#28283c';

/**
 * Get color for a state based on its value
 */
function getStateColor(
  value: number,
  maxValue: number,
  isDark: boolean
): string {
  if (value === 0 || maxValue === 0) {
    return isDark ? NO_DATA_COLOR_DARK : NO_DATA_COLOR_LIGHT;
  }

  const colorScale = isDark ? DARK_COLOR_SCALE : LIGHT_COLOR_SCALE;
  const normalizedValue = value / maxValue;
  const colorIndex = Math.min(
    Math.floor(normalizedValue * (colorScale.length - 1)),
    colorScale.length - 1
  );

  return colorScale[colorIndex] ?? (isDark ? NO_DATA_COLOR_DARK : NO_DATA_COLOR_LIGHT);
}

/**
 * Get state code from GeoJSON feature properties
 */
function getStateCodeFromFeature(properties: StateGeoProperties): string | null {
  const code = properties.STUSPS ?? properties.STATE ?? properties.name?.slice(0, 2);
  return typeof code === 'string' ? code.toUpperCase() : null;
}

// SVG viewBox for US map
const SVG_VIEWBOX = '0 0 959 593';

export function USChoroplethMap({
  data,
  selectedState,
  onStateClick,
  onStateHover,
  colorMetric = 'count',
  className,
  style,
  isDark = false,
}: USChoroplethMapProps) {
  const [geoData, setGeoData] = useState<StatesFeatureCollection | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{
    x: number;
    y: number;
    stateCode: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load GeoJSON data
  useEffect(() => {
    let cancelled = false;

    async function loadGeoData() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(US_STATES_GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.status}`);
        }
        const json = (await response.json()) as StatesFeatureCollection;
        if (!cancelled) {
          setGeoData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load map data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadGeoData().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate max value based on metric
  const maxValue = useMemo(() => {
    return colorMetric === 'count' ? data.maxCount : data.maxValue;
  }, [data.maxCount, data.maxValue, colorMetric]);

  // Get value for a state based on metric
  const getStateValue = useCallback(
    (stateCode: string): number => {
      const stateData = data.byState.get(stateCode);
      if (stateData === undefined) return 0;
      return colorMetric === 'count' ? stateData.opportunityCount : stateData.totalValue;
    },
    [data.byState, colorMetric]
  );

  // Handle mouse events
  const handleMouseEnter = useCallback(
    (stateCode: string, event: React.MouseEvent) => {
      setHoveredState(stateCode);
      setTooltipInfo({
        x: event.clientX,
        y: event.clientY,
        stateCode,
      });
      if (onStateHover !== undefined) {
        onStateHover(stateCode);
      }
    },
    [onStateHover]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredState(null);
    setTooltipInfo(null);
    if (onStateHover !== undefined) {
      onStateHover(null);
    }
  }, [onStateHover]);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (tooltipInfo !== null) {
      setTooltipInfo((prev) =>
        prev !== null ? {...prev, x: event.clientX, y: event.clientY} : null
      );
    }
  }, [tooltipInfo]);

  const handleClick = useCallback(
    (stateCode: string) => {
      if (onStateClick !== undefined) {
        onStateClick(stateCode);
      }
    },
    [onStateClick]
  );

  // Get tooltip state data
  const tooltipStateData = useMemo(() => {
    if (tooltipInfo === null) return null;
    return data.byState.get(tooltipInfo.stateCode) ?? null;
  }, [tooltipInfo, data.byState]);

  // Render loading state
  if (isLoading) {
    return (
      <Box
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <span className="text-on-surface-variant">Loading map data...</span>
      </Box>
    );
  }

  // Render error state
  if (error !== null) {
    return (
      <Box
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <span className="text-error">Error: {error}</span>
      </Box>
    );
  }

  // Render placeholder if no data
  if (geoData === null) {
    return (
      <Box
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          minHeight: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        <span className="text-on-surface-variant">No map data available</span>
      </Box>
    );
  }

  return (
    <Box
      className={className}
      style={{position: 'relative', width: '100%', height: '100%', minHeight: 400, ...style}}
    >
      {/* SVG Map */}
      <svg
        viewBox={SVG_VIEWBOX}
        style={{width: '100%', height: '100%'}}
        onMouseMove={handleMouseMove}
      >
        {/* State paths */}
        <g>
          {geoData.features.map((feature, index) => {
            const stateCode = getStateCodeFromFeature(feature.properties);
            if (stateCode === null) return null;

            const value = getStateValue(stateCode);
            const isSelected = selectedState === stateCode;
            const isHovered = hoveredState === stateCode;

            // Get fill color
            let fillColor = getStateColor(value, maxValue, isDark);
            if (isSelected) {
              fillColor = '#ffc800'; // Highlight color
            } else if (isHovered) {
              // Lighten the color slightly for hover
              fillColor = lightenColor(fillColor, 20);
            }

            // Convert GeoJSON to SVG path
            const pathData = geoJsonToSvgPath(feature);

            return (
              <path
                key={`state-${stateCode}-${index}`}
                d={pathData}
                fill={fillColor}
                stroke={isDark ? '#50506a' : '#646478'}
                strokeWidth={0.5}
                style={{
                  cursor: 'pointer',
                  transition: 'fill 0.2s ease',
                }}
                onMouseEnter={(e) => handleMouseEnter(stateCode, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleClick(stateCode)}
                role="button"
                tabIndex={0}
                aria-label={`${stateCode}: ${value} ${colorMetric === 'count' ? 'opportunities' : 'dollars'}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick(stateCode);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <MapLegend
        min={0}
        max={maxValue}
        metric={colorMetric}
        isDark={isDark}
        className="absolute bottom-4 left-4 z-10"
      />

      {/* Tooltip */}
      <MapTooltip
        stateData={tooltipStateData}
        x={tooltipInfo?.x ?? 0}
        y={tooltipInfo?.y ?? 0}
        visible={tooltipInfo !== null && tooltipStateData !== null}
      />
    </Box>
  );
}

/**
 * Lighten a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

/**
 * Simplified GeoJSON to SVG path converter
 * Uses a simple projection suitable for the contiguous US
 */
function geoJsonToSvgPath(feature: GeoJSON.Feature): string {
  // Simple projection for US (Albers-like approximation)
  const projectPoint = (lon: number, lat: number): [number, number] => {
    // Approximate projection for contiguous US
    const x = ((lon + 125) / 60) * 959;
    const y = ((50 - lat) / 25) * 593;
    return [x, y];
  };

  const pathParts: string[] = [];

  const processCoordinates = (coords: GeoJSON.Position[]): void => {
    if (coords.length === 0) return;

    const firstPoint = coords[0];
    if (firstPoint === undefined) return;

    const [startX, startY] = projectPoint(firstPoint[0], firstPoint[1]);
    pathParts.push(`M${startX.toFixed(1)},${startY.toFixed(1)}`);

    for (let i = 1; i < coords.length; i++) {
      const point = coords[i];
      if (point === undefined) continue;
      const [x, y] = projectPoint(point[0], point[1]);
      pathParts.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
    }

    pathParts.push('Z');
  };

  const geometry = feature.geometry;

  if (geometry.type === 'Polygon') {
    for (const ring of geometry.coordinates) {
      processCoordinates(ring);
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      for (const ring of polygon) {
        processCoordinates(ring);
      }
    }
  }

  return pathParts.join(' ');
}

export default USChoroplethMap;
