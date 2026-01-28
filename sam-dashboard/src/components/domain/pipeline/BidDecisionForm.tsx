import { useState, useMemo } from 'react';
import { Card, CardHeader, CardBody, Stack, HStack, Box } from '../../catalyst/layout';
import { Text, Button, Input, Select, Textarea, Badge } from '../../catalyst/primitives';
import type { BidDecisionFormProps, BidDecisionScoreItem } from './BidDecisionForm.types';
import type { BidDecision } from '../../../types/pipeline';

const DEFAULT_SCORECARD: Omit<BidDecisionScoreItem, 'score'>[] = [
  { id: '1', category: 'Strategic Fit', question: 'Aligns with company strategic goals', weight: 15 },
  { id: '2', category: 'Strategic Fit', question: 'Builds on existing capabilities', weight: 10 },
  { id: '3', category: 'Customer Relationship', question: 'Existing relationship with customer', weight: 10 },
  { id: '4', category: 'Customer Relationship', question: 'Previous contract performance', weight: 10 },
  { id: '5', category: 'Technical Capability', question: 'Technical expertise available', weight: 15 },
  { id: '6', category: 'Technical Capability', question: 'Past performance relevance', weight: 10 },
  { id: '7', category: 'Competition', question: 'Competitive advantage identified', weight: 10 },
  { id: '8', category: 'Competition', question: 'Known competitors beatable', weight: 5 },
  { id: '9', category: 'Resources', question: 'Resources available for proposal', weight: 10 },
  { id: '10', category: 'Price', question: 'Can win at target price', weight: 5 },
];

const SCORE_OPTIONS = [
  { value: '', label: 'Select' },
  { value: '0', label: '0 - No' },
  { value: '1', label: '1 - Weak' },
  { value: '2', label: '2 - Fair' },
  { value: '3', label: '3 - Good' },
  { value: '4', label: '4 - Strong' },
  { value: '5', label: '5 - Excellent' },
];

function getScoreColor(score: number): 'red' | 'yellow' | 'green' | 'gray' {
  if (score < 40) {
    return 'red';
  }
  if (score < 60) {
    return 'yellow';
  }
  return 'green';
}

function getRecommendation(score: number): { decision: BidDecision; label: string } {
  if (score >= 70) {
    return { decision: 'BID', label: 'Recommend: BID' };
  }
  if (score >= 50) {
    return { decision: 'WATCH', label: 'Recommend: WATCH / Further Review' };
  }
  return { decision: 'NO_BID', label: 'Recommend: NO BID' };
}

export function BidDecisionForm({
  opportunity,
  onSubmit,
  onCancel,
  isLoading = false,
}: BidDecisionFormProps) {
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const [notes, setNotes] = useState(opportunity.decisionNotes ?? '');
  const [selectedDecision, setSelectedDecision] = useState<BidDecision>(opportunity.decision);
  const [autoMoveStage, setAutoMoveStage] = useState(true);

  const handleScoreChange = (itemId: string, value: string) => {
    const newScores = new Map(scores);
    if (value === '') {
      newScores.delete(itemId);
    } else {
      newScores.set(itemId, parseInt(value, 10));
    }
    setScores(newScores);
  };

  const { totalScore, maxScore, percentage, isComplete } = useMemo(() => {
    let total = 0;
    let max = 0;
    let answeredCount = 0;

    for (const item of DEFAULT_SCORECARD) {
      const score = scores.get(item.id);
      max += item.weight * 5; // Max score per item is 5
      if (score !== undefined) {
        total += item.weight * score;
        answeredCount++;
      }
    }

    return {
      totalScore: total,
      maxScore: max,
      percentage: max > 0 ? Math.round((total / max) * 100) : 0,
      isComplete: answeredCount === DEFAULT_SCORECARD.length,
    };
  }, [scores]);

  const recommendation = useMemo(() => getRecommendation(percentage), [percentage]);

  const handleSubmit = () => {
    onSubmit(selectedDecision, notes, autoMoveStage);
  };

  // Group scorecard by category
  const groupedScorecard = useMemo(() => {
    const groups = new Map<string, typeof DEFAULT_SCORECARD>();

    for (const item of DEFAULT_SCORECARD) {
      const existing = groups.get(item.category);
      if (existing !== undefined) {
        existing.push(item);
      } else {
        groups.set(item.category, [item]);
      }
    }

    return groups;
  }, []);

  return (
    <Card>
      <CardHeader>
        <HStack justify="between" align="center">
          <Stack gap="xs">
            <Text variant="heading5">Bid/No-Bid Decision</Text>
            <Text variant="bodySmall" color="secondary">
              {opportunity.internalName ?? opportunity.opportunityTitle}
            </Text>
          </Stack>
          {scores.size > 0 && (
            <Stack gap="xs" align="end">
              <Badge color={getScoreColor(percentage)} size="lg">
                Score: {percentage}%
              </Badge>
              <Text variant="caption" color="secondary">
                {recommendation.label}
              </Text>
            </Stack>
          )}
        </HStack>
      </CardHeader>

      <CardBody>
        <Stack gap="lg">
          {/* Scorecard */}
          <Stack gap="md">
            <Text variant="bodySmall" weight="semibold">
              Bid Decision Scorecard
            </Text>

            {Array.from(groupedScorecard.entries()).map(([category, items]) => (
              <Box key={category}>
                <Text variant="caption" weight="semibold" color="secondary" className="mb-2">
                  {category}
                </Text>
                <Stack gap="sm">
                  {items.map((item) => (
                    <HStack key={item.id} justify="between" align="center" gap="md">
                      <HStack gap="sm" align="center" style={{ flex: 1 }}>
                        <Text variant="caption" color="secondary" style={{ width: '24px' }}>
                          {item.weight}%
                        </Text>
                        <Text variant="bodySmall">{item.question}</Text>
                      </HStack>
                      <Select
                        value={scores.get(item.id)?.toString() ?? ''}
                        onChange={(e) => handleScoreChange(item.id, e.target.value)}
                        options={SCORE_OPTIONS}
                        style={{ width: '120px' }}
                      />
                    </HStack>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>

          {/* Summary */}
          {scores.size > 0 && (
            <Box
              style={{
                padding: '1rem',
                backgroundColor: '#f4f4f5',
                borderRadius: '0.375rem',
              }}
            >
              <HStack justify="between" align="center">
                <Stack gap="xs">
                  <Text variant="bodySmall" weight="semibold">
                    Weighted Score
                  </Text>
                  <Text variant="caption" color="secondary">
                    {totalScore} / {maxScore} points ({scores.size}/{DEFAULT_SCORECARD.length} answered)
                  </Text>
                </Stack>
                <Stack gap="xs" align="end">
                  <Text variant="heading4" color={percentage >= 60 ? 'success' : percentage >= 40 ? 'warning' : 'danger'}>
                    {percentage}%
                  </Text>
                  <Text variant="caption" color="secondary">
                    {isComplete === true ? 'Complete' : 'Incomplete'}
                  </Text>
                </Stack>
              </HStack>
            </Box>
          )}

          {/* Decision Selection */}
          <Stack gap="sm">
            <Text variant="bodySmall" weight="semibold">
              Decision
            </Text>
            <HStack gap="sm">
              {(['BID', 'NO_BID', 'WATCH', 'PENDING'] as BidDecision[]).map((decision) => (
                <Button
                  key={decision}
                  variant={selectedDecision === decision ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedDecision(decision)}
                >
                  {decision === 'NO_BID' ? 'No Bid' : decision.charAt(0) + decision.slice(1).toLowerCase()}
                </Button>
              ))}
            </HStack>
          </Stack>

          {/* Notes */}
          <Stack gap="sm">
            <Text variant="bodySmall" weight="semibold">
              Decision Notes
            </Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter rationale for this decision..."
              rows={4}
            />
          </Stack>

          {/* Auto-move option */}
          <HStack gap="sm" align="center">
            <input
              type="checkbox"
              id="autoMoveStage"
              checked={autoMoveStage}
              onChange={(e) => setAutoMoveStage(e.target.checked)}
            />
            <label htmlFor="autoMoveStage">
              <Text variant="bodySmall">
                Automatically move to appropriate stage based on decision
              </Text>
            </label>
          </HStack>

          {/* Actions */}
          <HStack justify="end" gap="md">
            <Button variant="ghost" onClick={onCancel} disabled={isLoading === true}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading === true}>
              {isLoading === true ? 'Saving...' : 'Save Decision'}
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}
