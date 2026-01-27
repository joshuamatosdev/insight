import { Card, CardBody, Flex, Stack } from '../../layout';
import { Text, Button } from '../../primitives';

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
    <Card variant="elevated" style={{ maxWidth: '700px', width: '100%' }}>
      <CardBody padding="xl">
        <Stack spacing="var(--spacing-6)">
          {/* Header */}
          <Stack spacing="var(--spacing-2)">
            <Text variant="heading3">{title}</Text>
            <Text variant="body" color="muted">
              {description}
            </Text>
          </Stack>

          {/* Content */}
          <Stack spacing="var(--spacing-4)">{children}</Stack>

          {/* Actions */}
          <Flex justify="space-between" align="center" className="mt-4">
            <Flex gap="sm">
              {isFirst === false && onBack !== undefined && (
                <Button variant="secondary" onClick={onBack} disabled={loading}>
                  Back
                </Button>
              )}
              {canSkip && onSkip !== undefined && (
                <Button variant="ghost" onClick={onSkip} disabled={loading}>
                  Skip for now
                </Button>
              )}
            </Flex>
            <Button variant="primary" onClick={onNext} disabled={loading}>
              {loading ? 'Saving...' : isLast ? 'Complete Setup' : 'Continue'}
            </Button>
          </Flex>
        </Stack>
      </CardBody>
    </Card>
  );
}

export default OnboardingCard;
