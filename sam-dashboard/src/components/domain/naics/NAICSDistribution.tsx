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
      <p className="text-sm text-zinc-500">
        No NAICS data available
      </p>
    );
  }

  return (
    <div className={className} style={style}>
      <div className="space-y-3">
        {sorted.map(([naics, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={naics} className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-600 min-w-[80px]">{naics}</span>
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-1 max-w-[120px] bg-zinc-100 rounded-full h-1.5">
                  <div
                    className="bg-accent rounded-full h-1.5 transition-all duration-200"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-zinc-400 w-8 text-right tabular-nums">{count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NAICSDistribution;
