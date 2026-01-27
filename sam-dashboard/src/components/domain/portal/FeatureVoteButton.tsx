import type { CSSProperties } from 'react';
import type { FeatureVoteButtonProps } from './Portal.types';
import { Text } from '../../primitives';
import { Flex, Box } from '../../layout';

/**
 * Vote button for feature requests with count display.
 */
export function FeatureVoteButton({
  voteCount,
  hasVoted,
  onVote,
  onUnvote,
  disabled = false,
  className,
  style,
}: FeatureVoteButtonProps): React.ReactElement {
  const handleClick = () => {
    if (disabled) {
      return;
    }
    if (hasVoted) {
      onUnvote();
    } else {
      onVote();
    }
  };

  const buttonStyles: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-md)',
    border: hasVoted
      ? '2px solid var(--color-primary)'
      : '2px solid var(--color-gray-200)',
    backgroundColor: hasVoted ? 'var(--color-primary-light)' : 'var(--color-white)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.2s ease',
    minWidth: '50px',
    ...style,
  };

  const arrowStyles: CSSProperties = {
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderBottom: hasVoted
      ? '10px solid var(--color-primary)'
      : '10px solid var(--color-gray-400)',
    marginBottom: 'var(--spacing-1)',
  };

  return (
    <Box
      className={className}
      style={buttonStyles}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={hasVoted}
      aria-label={hasVoted ? 'Remove vote' : 'Vote for this feature'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Box style={arrowStyles} aria-hidden="true" />
      <Text
        variant="bodySmall"
        weight="semibold"
        style={{ color: hasVoted ? 'var(--color-primary)' : 'var(--color-gray-600)' }}
      >
        {voteCount}
      </Text>
    </Box>
  );
}

export default FeatureVoteButton;
