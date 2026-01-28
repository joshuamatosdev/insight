import {Button} from '../../catalyst';

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
    <div>
      <div>
        <div>
          <div>
            {/* Header */}
            <div>
              <h3>
                {title}
              </h3>
              <p>
                {description}
              </p>
            </div>

            {/* Content */}
            <div>{children}</div>

            {/* Actions */}
            <div>
              <div>
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
