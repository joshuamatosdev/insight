import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Section, SectionHeader } from '../../components/layout/Section';
import { Stack, HStack } from '../../components/layout/Stack';
import { Box } from '../../components/layout/Box';
import { Card, CardHeader, CardBody } from '../../components/layout/Card';
import { Text } from '../../components/primitives/Text';
import { Button } from '../../components/primitives/Button';
import { Badge } from '../../components/primitives/Badge';
import { TextArea } from '../../components/primitives/Input';
import { ProposalTracker } from '../../components/domain/pipeline';
import { usePipeline, usePipelineOpportunity } from '../../hooks/usePipeline';

interface ProposalSection {
  id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'review' | 'complete';
  assignee: string | null;
  dueDate: string | null;
  lastUpdated: string | null;
}

const DEFAULT_SECTIONS: ProposalSection[] = [
  { id: '1', name: 'Executive Summary', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '2', name: 'Technical Approach', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '3', name: 'Management Approach', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '4', name: 'Past Performance', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '5', name: 'Staffing Plan', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '6', name: 'Quality Control', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '7', name: 'Pricing Volume', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
  { id: '8', name: 'Certifications & Reps', status: 'not_started', assignee: null, dueDate: null, lastUpdated: null },
];

function getStatusLabel(status: ProposalSection['status']): string {
  const labels: Record<ProposalSection['status'], string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    review: 'Under Review',
    complete: 'Complete',
  };
  return labels[status];
}

function getStatusColor(status: ProposalSection['status']): 'gray' | 'blue' | 'yellow' | 'green' {
  const colors: Record<ProposalSection['status'], 'gray' | 'blue' | 'yellow' | 'green'> = {
    not_started: 'gray',
    in_progress: 'blue',
    review: 'yellow',
    complete: 'green',
  };
  return colors[status];
}

export function ProposalPage() {
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
  } = usePipelineOpportunity(pipelineId ?? '', opportunityId ?? '');

  const [sections] = useState<ProposalSection[]>(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState('');

  const sectionStats = useMemo(() => {
    const stats = {
      total: sections.length,
      complete: sections.filter((s) => s.status === 'complete').length,
      inProgress: sections.filter((s) => s.status === 'in_progress').length,
      review: sections.filter((s) => s.status === 'review').length,
      notStarted: sections.filter((s) => s.status === 'not_started').length,
    };
    return stats;
  }, [sections]);

  const progressPercentage = useMemo(() => {
    if (sections.length === 0) {
      return 0;
    }
    return Math.round((sectionStats.complete / sections.length) * 100);
  }, [sections, sectionStats.complete]);

  const isLoading = loadingPipeline === true || loadingOpportunity === true;

  if (isLoading === true) {
    return (
      <Section id="proposal">
        <Box style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
          <Text variant="body" color="secondary">
            Loading...
          </Text>
        </Box>
      </Section>
    );
  }

  if (error !== null) {
    return (
      <Section id="proposal">
        <Box style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
          <Text variant="body" color="danger">
            Error: {error.message}
          </Text>
        </Box>
      </Section>
    );
  }

  if (opportunity === null || pipeline === null) {
    return (
      <Section id="proposal">
        <Box style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
          <Text variant="body" color="secondary">
            Opportunity not found
          </Text>
        </Box>
      </Section>
    );
  }

  const title = opportunity.internalName ?? opportunity.opportunityTitle ?? 'Untitled Opportunity';

  return (
    <Section id="proposal">
      <SectionHeader
        title={`Proposal: ${title}`}
        actions={
          <HStack gap="md">
            <Button
              variant="ghost"
              onClick={() => navigate(`/pipeline/${pipelineId}/opportunity/${opportunityId}`)}
            >
              ← Back to Details
            </Button>
            <Button variant="secondary">Export Proposal</Button>
            <Button>Submit for Review</Button>
          </HStack>
        }
      />

      <Stack gap="lg">
        {/* Progress Overview */}
        <Card>
          <CardBody>
            <HStack justify="between" align="center" wrap="wrap">
              <Stack gap="sm">
                <Text variant="heading5">Proposal Progress</Text>
                <HStack gap="sm">
                  <Badge color="green">{sectionStats.complete} Complete</Badge>
                  <Badge color="blue">{sectionStats.inProgress} In Progress</Badge>
                  <Badge color="yellow">{sectionStats.review} Review</Badge>
                  <Badge color="gray">{sectionStats.notStarted} Not Started</Badge>
                </HStack>
              </Stack>
              <Stack gap="xs" align="end">
                <Text variant="heading4">{progressPercentage}%</Text>
                <Box
                  style={{
                    width: '200px',
                    height: '8px',
                    backgroundColor: 'var(--color-gray-200)',
                    borderRadius: 'var(--radius-full)',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      height: '100%',
                      width: `${progressPercentage}%`,
                      backgroundColor: 'var(--color-success)',
                    }}
                  />
                </Box>
              </Stack>
            </HStack>
          </CardBody>
        </Card>

        {/* Pipeline Stage Tracker */}
        <ProposalTracker opportunity={opportunity} stages={pipeline.stages} />

        <HStack gap="lg" align="start">
          {/* Section List */}
          <Card style={{ flex: '0 0 350px' }}>
            <CardHeader>
              <Text variant="heading5">Proposal Sections</Text>
            </CardHeader>
            <CardBody>
              <Stack gap="sm">
                {sections.map((section) => (
                  <Box
                    key={section.id}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setSectionContent('');
                    }}
                    style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor:
                        selectedSection === section.id
                          ? 'var(--color-primary-light)'
                          : 'var(--color-bg)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${
                        selectedSection === section.id
                          ? 'var(--color-primary)'
                          : 'var(--color-border)'
                      }`,
                      cursor: 'pointer',
                    }}
                  >
                    <HStack justify="between" align="center">
                      <Stack gap="0">
                        <Text
                          variant="bodySmall"
                          weight={selectedSection === section.id ? 'semibold' : 'normal'}
                        >
                          {section.name}
                        </Text>
                        {section.assignee !== null && (
                          <Text variant="caption" color="secondary">
                            {section.assignee}
                          </Text>
                        )}
                      </Stack>
                      <Badge color={getStatusColor(section.status)} size="sm">
                        {getStatusLabel(section.status)}
                      </Badge>
                    </HStack>
                  </Box>
                ))}
              </Stack>
            </CardBody>
          </Card>

          {/* Section Editor */}
          <Card style={{ flex: 1 }}>
            <CardHeader>
              <HStack justify="between" align="center">
                <Text variant="heading5">
                  {selectedSection !== null
                    ? sections.find((s) => s.id === selectedSection)?.name ?? 'Select a Section'
                    : 'Select a Section'}
                </Text>
                {selectedSection !== null && (
                  <HStack gap="sm">
                    <Button variant="secondary" size="sm">
                      Assign
                    </Button>
                    <Button variant="secondary" size="sm">
                      Set Due Date
                    </Button>
                  </HStack>
                )}
              </HStack>
            </CardHeader>
            <CardBody>
              {selectedSection === null ? (
                <Box style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
                  <Text variant="body" color="secondary">
                    Select a section to view or edit its content
                  </Text>
                </Box>
              ) : (
                <Stack gap="md">
                  <TextArea
                    value={sectionContent}
                    onChange={(e) => setSectionContent(e.target.value)}
                    placeholder="Enter section content..."
                    rows={15}
                  />
                  <HStack justify="between" align="center">
                    <Stack gap="xs">
                      <Text variant="caption" color="secondary">
                        Last updated: Never
                      </Text>
                    </Stack>
                    <HStack gap="sm">
                      <Button variant="ghost">Cancel</Button>
                      <Button variant="secondary">Save Draft</Button>
                      <Button>Mark Complete</Button>
                    </HStack>
                  </HStack>
                </Stack>
              )}
            </CardBody>
          </Card>
        </HStack>

        {/* Compliance Matrix */}
        <Card>
          <CardHeader>
            <HStack justify="between" align="center">
              <Text variant="heading5">Compliance Matrix</Text>
              <Button variant="secondary" size="sm">
                Import Requirements
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box style={{ padding: 'var(--spacing-4)', textAlign: 'center' }}>
              <Text variant="body" color="secondary">
                Compliance matrix will track RFP requirements against proposal sections.
              </Text>
              <Text variant="caption" color="secondary">
                This feature is coming soon.
              </Text>
            </Box>
          </CardBody>
        </Card>
      </Stack>
    </Section>
  );
}
