import { StatsGridProps } from './Stats.types';
import { Grid } from '../../layout';

export function StatsGrid({ children, columns = 4 }: StatsGridProps) {
  return (
    <Grid columns={columns} gap="var(--spacing-4)" className="mb-6">
      {children}
    </Grid>
  );
}

export default StatsGrid;
