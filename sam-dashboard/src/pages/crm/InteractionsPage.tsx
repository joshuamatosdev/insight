import { useState } from 'react';
import { Section, SectionHeader } from '../../components/catalyst/layout/Section';
import { Stack, HStack } from '../../components/catalyst/layout/Stack';
import { Select } from '../../components/catalyst/primitives/Input';
import { Button } from '../../components/catalyst/primitives/Button';
import { Text } from '../../components/catalyst/primitives/Text';
import { InteractionTimeline, InteractionForm, UpcomingFollowups } from '../../components/domain/crm';
import { useInteractions, useUpcomingFollowups } from '../../hooks/useInteractions';
import type { InteractionType, CreateInteractionRequest, UpcomingFollowup } from '../../types/crm';

const INTERACTION_TYPE_OPTIONS: { value: InteractionType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'PHONE_CALL', label: 'Phone Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING_IN_PERSON', label: 'In-Person Meeting' },
  { value: 'MEETING_VIRTUAL', label: 'Virtual Meeting' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'TRADE_SHOW', label: 'Trade Show' },
  { value: 'INDUSTRY_DAY', label: 'Industry Day' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'PROPOSAL_SUBMISSION', label: 'Proposal Submission' },
  { value: 'DEBRIEF', label: 'Debrief' },
  { value: 'NOTE', label: 'Note' },
  { value: 'OTHER', label: 'Other' },
];

export function InteractionsPage() {
  const {
    interactions,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    filters,
    setFilters,
    setPage,
    create,
    refresh,
  } = useInteractions();

  const {
    followups,
    isLoading: followupsLoading,
    markComplete,
    refresh: refreshFollowups,
  } = useUpcomingFollowups();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTypeFilterChange = (value: string) => {
    if (value === '') {
      const { interactionType: _unused, ...rest } = filters;
      void _unused;
      setFilters(rest);
    } else {
      setFilters({ ...filters, interactionType: value as InteractionType });
    }
  };

  const handleCreateSubmit = async (data: CreateInteractionRequest) => {
    setIsSubmitting(true);
    try {
      await create(data);
      setShowCreateForm(false);
      await refresh();
    } catch (err) {
      console.error('Failed to create interaction:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkFollowupComplete = async (followup: UpcomingFollowup) => {
    try {
      await markComplete(followup.id);
      await refreshFollowups();
    } catch (err) {
      console.error('Failed to mark followup complete:', err);
    }
  };

  if (showCreateForm === true) {
    return (
      <Section id="log-interaction">
        <InteractionForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateForm(false)}
          isLoading={isSubmitting}
        />
      </Section>
    );
  }

  return (
    <Section id="interactions">
      <SectionHeader 
        title="Interactions"
        actions={<Button onClick={() => setShowCreateForm(true)}>Log Interaction</Button>}
      />

      <HStack gap="lg" align="start">
        <Stack gap="lg" style={{ flex: 2 }}>
          <HStack gap="md">
            <Select
              value={filters.interactionType ?? ''}
              onChange={(e) => handleTypeFilterChange(e.target.value)}
              options={INTERACTION_TYPE_OPTIONS}
            />
          </HStack>

          {error !== null && (
            <Text variant="body" color="danger">
              {error.message}
            </Text>
          )}

          <InteractionTimeline
            interactions={interactions}
            isLoading={isLoading}
            emptyMessage="No interactions found"
          />

          {totalPages > 1 && (
            <HStack justify="between" align="center">
              <Text variant="bodySmall" color="secondary">
                Showing {interactions.length} of {totalElements} interactions
              </Text>
              <HStack gap="sm">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Text variant="bodySmall">
                  Page {page + 1} of {totalPages}
                </Text>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </HStack>
            </HStack>
          )}
        </Stack>

        <Stack style={{ flex: 1 }}>
          <UpcomingFollowups
            followups={followups}
            isLoading={followupsLoading}
            onMarkComplete={handleMarkFollowupComplete}
          />
        </Stack>
      </HStack>
    </Section>
  );
}
