import {NAICSDistributionProps} from './NAICS.types';

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
      <p>
        No NAICS data available
      </p>
    );
  }

  return (
    <div style={style}>
      <div>
        {sorted.map(([naics, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={naics}>
              <span>{naics}</span>
              <div>
                <div>
                  <div
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span>{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NAICSDistribution;
