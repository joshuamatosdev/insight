import type {FeatureVoteButtonProps} from './Portal.types';
import {Text} from '../../catalyst/primitives';
import {Box} from '../../catalyst/layout';

/**
 * Vote button for feature requests with count display.
 */
export function FeatureVoteButton({
                                      voteCount,
                                      hasVoted,
                                      onVote,
                                      onUnvote,
                                      disabled = false,
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

    return (
        <Box
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
            <Box aria-hidden="true"/>
            <Text
                variant="bodySmall"
                weight="semibold"
            >
                {voteCount}
            </Text>
        </Box>
    );
}

export default FeatureVoteButton;
