import {CSSProperties, useMemo} from 'react';
import {TrendChartProps} from './Analytics.types';
import {Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardHeader, Stack} from '../../catalyst/layout';

/**
 * TrendChart displays a simple line chart for trend data.
 * Uses SVG for a lightweight chart without external dependencies.
 */
export function TrendChart({
                               title,
                               data,
                               color = '#2563eb',
                               height = 200,
                               showLegend = false,
                               loading = false,
                               className,
                               style,
                           }: TrendChartProps) {
    const chartData = useMemo(() => {
        if (data.length === 0) {
            return {points: '', min: 0, max: 0, range: 1, areaPath: ''};
        }

        const values = data.map((d) => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const range = max - min || 1;

        const chartWidth = 100;
        const chartHeight = 100;
        const padding = 10;

        const pointsArray = data.map((d, i) => {
            const x = padding + (i / (data.length - 1 || 1)) * (chartWidth - 2 * padding);
            const y =
                chartHeight - padding - ((d.value - min) / range) * (chartHeight - 2 * padding);
            return `${x},${y}`;
        });

        const points = pointsArray.join(' ');

        // Create area path for fill
        const firstX = padding;
        const lastX = padding + ((data.length - 1) / (data.length - 1 || 1)) * (chartWidth - 2 * padding);
        const bottomY = chartHeight - padding;
        const areaPath = `M ${firstX},${bottomY} L ${points.replace(/,/g, ' L ').replace(/ L /g, ' L ')} L ${lastX},${bottomY} Z`;

        return {points, min, max, range, areaPath};
    }, [data]);

    const containerStyles: CSSProperties = {
        ...style,
    };

    if (loading) {
        return (
            <Card style={containerStyles}>
                <CardHeader>
                    <Text variant="heading5">{title}</Text>
                </CardHeader>
                <CardBody>
                    <Box
                        style={{
                            height: `${height}px`,
                            background: '#f4f4f5',
                            borderRadius: '0.375rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text variant="body" color="secondary">
                            Loading...
                        </Text>
                    </Box>
                </CardBody>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card style={containerStyles}>
                <CardHeader>
                    <Text variant="heading5">{title}</Text>
                </CardHeader>
                <CardBody>
                    <Box
                        style={{
                            height: `${height}px`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text variant="body" color="secondary">
                            No data available
                        </Text>
                    </Box>
                </CardBody>
            </Card>
        );
    }

    // Calculate summary stats
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const average = total / data.length;

    return (
        <Card style={containerStyles}>
            <CardHeader>
                <Stack spacing="xs">
                    <Text variant="heading5">{title}</Text>
                    {showLegend && (
                        <Text variant="caption" color="secondary">
                            Total: {total.toLocaleString()} | Avg: {average.toFixed(1)}
                        </Text>
                    )}
                </Stack>
            </CardHeader>
            <CardBody>
                <Box style={{height: `${height}px`, position: 'relative'}}>
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {/* Grid lines */}
                        <line
                            x1="10"
                            y1="25"
                            x2="90"
                            y2="25"
                            stroke="#d4d4d8"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                        <line
                            x1="10"
                            y1="50"
                            x2="90"
                            y2="50"
                            stroke="#d4d4d8"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />
                        <line
                            x1="10"
                            y1="75"
                            x2="90"
                            y2="75"
                            stroke="#d4d4d8"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                        />

                        {/* Area fill */}
                        <path
                            d={chartData.areaPath.replace(/ L /g, ' L ').replace(/L /g, ' ')}
                            fill={color}
                            fillOpacity="0.1"
                        />

                        {/* Line */}
                        <polyline
                            points={chartData.points}
                            fill="none"
                            stroke={color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {data.map((d, i) => {
                            const x = 10 + (i / (data.length - 1 || 1)) * 80;
                            const y =
                                90 - ((d.value - chartData.min) / chartData.range) * 80;
                            return (
                                <circle
                                    key={d.date}
                                    cx={x}
                                    cy={y}
                                    r="2"
                                    fill={color}
                                />
                            );
                        })}
                    </svg>

                    {/* Y-axis labels */}
                    <Box
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '0.25rem',
                        }}
                    >
                        <Text variant="caption" color="secondary" style={{fontSize: '10px'}}>
                            {chartData.max.toLocaleString()}
                        </Text>
                        <Text variant="caption" color="secondary" style={{fontSize: '10px'}}>
                            {chartData.min.toLocaleString()}
                        </Text>
                    </Box>
                </Box>

                {/* X-axis labels */}
                <Box
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '0.5rem',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                    }}
                >
                    {data.length > 0 && (
                        <>
                            <Text variant="caption" color="secondary" style={{fontSize: '10px'}}>
                                {new Date(data.at(0)?.date ?? '').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                            {data.length > 2 && (
                                <Text variant="caption" color="secondary" style={{fontSize: '10px'}}>
                                    {new Date(data.at(Math.floor(data.length / 2))?.date ?? '').toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </Text>
                            )}
                            <Text variant="caption" color="secondary" style={{fontSize: '10px'}}>
                                {new Date(data.at(-1)?.date ?? '').toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </Text>
                        </>
                    )}
                </Box>
            </CardBody>
        </Card>
    );
}

export default TrendChart;
