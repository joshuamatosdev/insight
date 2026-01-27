import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, SectionHeader } from '../../components/catalyst/layout/Section';
import { Stack, HStack } from '../../components/catalyst/layout/Stack';
import { Box } from '../../components/catalyst/layout/Box';
import { Text } from '../../components/catalyst/primitives/Text';
import { Button } from '../../components/catalyst/primitives/Button';
import { Badge } from '../../components/catalyst/primitives/Badge';
import {
  CaptureManagement,
  TeamingPartnerList,
  ProposalTracker,
  BidDecisionForm,
} from '../../components/domain/pipeline';
import { usePipeline, usePipelineOpportunity } from '../../hooks/usePipeline';
import type { BidDecision, UpdatePipelineOpportunityRequest } from '../../types/pipeline';

function formatCurrency(value: number | null): string {
  if (value === null) {
    return '-';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(dateString: string | null): string {
  if (dateString === null) {
    return '-';
  }
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getBidDecisionLabel(decision: BidDecision): string {
  const labels: Record<BidDecision, string> = {
    PENDING: 'Pending Decision',
    BID: 'Bid',
    NO_BID: 'No Bid',
    WATCH: 'Watching',
  };
  return labels[decision];
}

function getBidDecisionVariant(decision: BidDecision): 'yellow' | 'green' | 'red' | 'blue' {
  const variants: Record<BidDecision, 'yellow' | 'green' | 'red' | 'blue'> = {
    PENDING: 'yellow',
    BID: 'green',
    NO_BID: 'red',
    WATCH: 'blue',
  };
  return variants[decision];
}

export function PipelineDetailPage() {
  const { pipelineId, opportunityId } = useParams<{
    pipelineId: string;
    opportunityId: string;
  }>();
  const navigate = useNavigate();

  const { pipeline, isLoading: loadingPipeline } = usePipeline(pipelineId ?? '');
  const {
    opportunity,
    isLoading: loadingOpportunity,
    error,
    update,
    moveToStage,
    setDecision,
  } = usePipelineOpportunity(pipelineId ?? '', opportunityId ?? '');

  const [showBidDecisionForm, setShowBidDecisionForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = useCallback(
    async (request: UpdatePipelineOpportunityRequest) => {
      setIsUpdating(true);
      try {
        await update(request);
      } finally {
        setIsUpdating(false);
      }
    },
    [update]
  );

  const handleStageChange = useCallback(
    async (stageId: string) => {
      setIsUpdating(true);
      try {
        await moveToStage(stageId);
      } finally {
        setIsUpdating(false);
      }
    },
    [moveToStage]
  );

  const handleBidDecisionSubmit = useCallback(
    async (decision: BidDecision, notes: string, autoMoveStage: boolean) => {
      setIsUpdating(true);
      try {
        await setDecision({ decision, notes, autoMoveStage });
        setShowBidDecisionForm(false);
      } finally {
        setIsUpdating(false);
      }
    },
    [setDecision]
  );

  const isLoading = loadingPipeline === true || loadingOpportunity === true;

  if (isLoading === true) {
    return (
      <Section id="pipeline-detail">
        <Box className="p-8 text-center">
          <Text variant="body" color="secondary">
            Loading...
          </Text>
        </Box>
      </Section>
    );
  }

  if (error !== null) {
    return (
      <Section id="pipeline-detail">
        <Box className="p-8 text-center">
          <Text variant="body" color="danger">
            Error: {error.message}
          </Text>
        </Box>
      </Section>
    );
  }

  if (opportunity === null || pipeline === null) {
    return (
      <Section id="pipeline-detail">
        <Box className="p-8 text-center">
          <Text variant="body" color="secondary">
            Opportunity not found
          </Text>
        </Box>
      </Section>
    );
  }

  const title = opportunity.internalName ?? opportunity.opportunityTitle ?? 'Untitled Opportunity';

  if (showBidDecisionForm === true) {
    return (
      <Section id="pipeline-detail">
        <Box className="mb-4">
          <Button variant="ghost" onClick={() => setShowBidDecisionForm(false)}>
            ← Back to Details
          </Button>
        </Box>
        <BidDecisionForm
          opportunity={opportunity}
          onSubmit={handleBidDecisionSubmit}
          onCancel={() => setShowBidDecisionForm(false)}
          isLoading={isUpdating}
        />
      </Section>
    );
  }

  return (
    <Section id="pipeline-detail">
      <SectionHeader
        title={title}
        actions={
          <HStack gap="md">
            <Button variant="ghost" onClick={() => navigate(`/pipeline`)}>
              ← Back to Pipeline
            </Button>
            <Button variant="secondary" onClick={() => setShowBidDecisionForm(true)}>
              Bid Decision
            </Button>
            <Button onClick={() => navigate(`/pipeline/${pipelineId}/proposal/${opportunityId}`)}>
              View Proposal
            </Button>
          </HStack>
        }
      />

      <Stack gap="lg">
        {/* Overview Card */}
        <Box
          style={{
            padding: '1rem',
            backgroundColor: '#f4f4f5',
            borderRadius: '0.5rem',
            border: '1px solid #e4e4e7',
          }}
        >
          <Stack gap="md">
            <HStack justify="between" align="start" wrap="wrap">
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Solicitation Number
                </Text>
                <Text variant="body" weight="medium">
                  {opportunity.solicitationNumber ?? '-'}
                </Text>
              </Stack>
              <Badge color={getBidDecisionVariant(opportunity.decision)} size="lg">
                {getBidDecisionLabel(opportunity.decision)}
              </Badge>
            </HStack>

            <HStack gap="lg" wrap="wrap">
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Estimated Value
                </Text>
                <Text variant="heading5">{formatCurrency(opportunity.estimatedValue)}</Text>
              </Stack>
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Weighted Value
                </Text>
                <Text variant="heading5">{formatCurrency(opportunity.weightedValue)}</Text>
              </Stack>
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Probability of Win
                </Text>
                <Text variant="heading5">
                  {opportunity.probabilityOfWin !== null
                    ? `${opportunity.probabilityOfWin}%`
                    : '-'}
                </Text>
              </Stack>
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Response Deadline
                </Text>
                <Text variant="heading5">{formatDate(opportunity.responseDeadline)}</Text>
              </Stack>
            </HStack>

            <HStack gap="lg" wrap="wrap">
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Current Stage
                </Text>
                <Text variant="body">{opportunity.stageName}</Text>
              </Stack>
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Owner
                </Text>
                <Text variant="body">{opportunity.ownerName ?? 'Unassigned'}</Text>
              </Stack>
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Added to Pipeline
                </Text>
                <Text variant="body">{formatDate(opportunity.createdAt)}</Text>
              </Stack>
            </HStack>

            {opportunity.decisionNotes !== null && (
              <Stack gap="xs">
                <Text variant="caption" color="secondary">
                  Decision Notes
                </Text>
                <Text variant="bodySmall" style={{ whiteSpace: 'pre-wrap' }}>
                  {opportunity.decisionNotes}
                </Text>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Proposal Progress */}
        <ProposalTracker
          opportunity={opportunity}
          stages={pipeline.stages}
          onStageChange={handleStageChange}
        />

        {/* Capture Management */}
        <CaptureManagement
          opportunity={opportunity}
          onUpdate={handleUpdate}
          isLoading={isUpdating}
        />

        {/* Teaming Partners */}
        <TeamingPartnerList
          partners={[]}
          teamingPartnersString={opportunity.teamingPartners ?? undefined}
        />
      </Stack>
    </Section>
  );
}
