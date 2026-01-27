import clsx from 'clsx';
import { Button } from '../../catalyst';

interface OnboardingCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  canSkip?: boolean;
  loading?: boolean;
}

/**
 * Card wrapper for onboarding step content.
 */
export function OnboardingCard({
  title,
  description,
  children,
  onNext,
  onBack,
  onSkip,
  isFirst = false,
  isLast = false,
  canSkip = false,
  loading = false,
}: OnboardingCardProps): React.ReactElement {
  return (
    <div className="w-full max-w-[700px]">
      <div className="rounded-lg bg-white shadow-sm ring-1 ring-zinc-950/5 dark:bg-zinc-800/50 dark:ring-white/10">
        <div className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-white">
                {title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4">{children}</div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-2">
                {isFirst === false && onBack !== undefined && (
                  <Button
                    outline
                    onClick={onBack}
                    disabled={loading}
                  >
                    Back
                  </Button>
                )}
                {canSkip && onSkip !== undefined && (
                  <Button
                    plain
                    onClick={onSkip}
                    disabled={loading}
                  >
                    Skip for now
                  </Button>
                )}
              </div>
              <Button
                onClick={onNext}
                disabled={loading}
              >
                {loading ? 'Saving...' : isLast ? 'Complete Setup' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingCard;
