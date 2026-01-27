import type { CSSProperties } from 'react';
import type { FeatureVoteButtonProps } from './Portal.types';
import { Text } from '../../catalyst/primitives';
import { Flex, Box } from '../../catalyst/layout';

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
    padding: '0.5rem 0.75rem',
    borderRadius: '0.375rem',
    border: hasVoted
      ? '2px solid #2563eb'
      : '2px solid #e4e4e7',
    backgroundColor: hasVoted ? '#dbeafe' : 'white',
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
      ? '10px solid #2563eb'
      : '10px solid #a1a1aa',
    marginBottom: '0.25rem',
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
        style={{ color: hasVoted ? '#2563eb' : '#52525b' }}
      >
        {voteCount}
      </Text>
    </Box>
  );
}

export default FeatureVoteButton;
