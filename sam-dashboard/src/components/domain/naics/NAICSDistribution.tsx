import { Text, Badge } from '../../primitives';
import { HStack, Stack, Box } from '../../layout';
import { NAICSDistributionProps } from './NAICS.types';

export function NAICSDistribution({
  distribution,
  total,
  maxItems = 8,
  className,
  style,
}: NAICSDistributionProps) {
  const sorted = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems);

  if (sorted.length === 0) {
    return (
      <Text variant="body" color="muted">
        No NAICS data available
      </Text>
    );
  }

  return (
    <Stack spacing="var(--spacing-3)" className={className} style={style}>
      {sorted.map(([naics, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
          <HStack key={naics} justify="between" align="center">
            <Text variant="bodySmall">{naics}</Text>
            <HStack spacing="var(--spacing-2)" align="center">
              <Box
                style={{
                  width: '100px',
                  height: '8px',
                  backgroundColor: 'var(--color-gray-200)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'var(--gradient-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width var(--transition-normal)',
                  }}
                />
              </Box>
              <Badge variant="secondary" size="sm">
                {count}
              </Badge>
            </HStack>
          </HStack>
        );
      })}
    </Stack>
  );
}

export default NAICSDistribution;
