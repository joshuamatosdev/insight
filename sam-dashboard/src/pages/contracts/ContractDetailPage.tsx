import {useCallback, useState} from 'react';
import {
    Badge,
    Button,
    ChevronLeftIcon,
    InlineAlert,
    InlineAlertDescription,
    InlineAlertTitle,
    PencilIcon,
    Text
} from '../../components/catalyst/primitives';
import {Box, Card, CardBody, Flex, Grid, HStack, Section, SectionHeader, Stack} from '../../components/catalyst/layout';
import type {DeliverableStatus, UpdateContractRequest,} from '../../components/domain/contracts';
import {
    ClinTable,
    ContractForm,
    ContractStatusBadge,
    ContractValueChart,
    DeliverableTracker,
    formatDate,
    getContractTypeLabel,
    ModificationTimeline,
} from '../../components/domain/contracts';
import {useContract} from '../../hooks/useContracts';

export interface ContractDetailPageProps {
  contractId: string;
  onBack?: () => void;
  onNavigateToClins?: () => void;
  onNavigateToDeliverables?: () => void;
  onNavigateToModifications?: () => void;
}

type TabType = 'overview' | 'clins' | 'deliverables' | 'modifications';

export function ContractDetailPage({
  contractId,
  onBack,
  onNavigateToClins,
  onNavigateToDeliverables,
  onNavigateToModifications,
}: ContractDetailPageProps) {
  const {
    contract,
    summary,
    clins,
    modifications,
    deliverables,
    isLoading,
    error,
    refresh,
    updateContractData,
    executeModificationAction,
    updateDeliverableStatusAction,
  } = useContract(contractId);

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateContract = useCallback(
    async (data: UpdateContractRequest) => {
      setIsUpdating(true);
      const success = await updateContractData(data);
      setIsUpdating(false);
      if (success) {
        setIsEditing(false);
        refresh();
      }
    },
    [updateContractData, refresh]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleExecuteModification = useCallback(
    async (modificationId: string) => {
      await executeModificationAction(modificationId);
    },
    [executeModificationAction]
  );

  const handleDeliverableStatusChange = useCallback(
    async (deliverableId: string, status: DeliverableStatus) => {
      await updateDeliverableStatusAction(deliverableId, status);
    },
    [updateDeliverableStatusAction]
  );

  if (isLoading) {
    return (
      <Section>
        <Flex justify="center" align="center">
          <Text variant="body" color="muted">
            Loading contract details...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (error !== null || contract === null) {
    return (
      <Section>
        <InlineAlert color="error">
          <InlineAlertTitle>Error</InlineAlertTitle>
          <InlineAlertDescription>
            {error !== null ? error.message : 'Contract not found'}
          </InlineAlertDescription>
        </InlineAlert>
        {onBack !== undefined && (
          <Box>
            <Button variant="secondary" onClick={onBack}>
              Back to Contracts
            </Button>
          </Box>
        )}
      </Section>
    );
  }

  if (isEditing) {
    return (
      <Section>
        <ContractForm
          contract={contract}
          onSubmit={handleUpdateContract}
          onCancel={handleCancelEdit}
          isLoading={isUpdating}
        />
      </Section>
    );
  }

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'clins', label: 'CLINs', count: clins.length },
    { key: 'deliverables', label: 'Deliverables', count: deliverables.length },
    { key: 'modifications', label: 'Modifications', count: modifications.length },
  ];

  return (
    <Section>
      <SectionHeader>
        <HStack justify="between" align="start">
          <Box>
            {onBack !== undefined && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<ChevronLeftIcon size="sm" />}
                onClick={onBack}
              >
                Back to Contracts
              </Button>
            )}
            <HStack spacing="md" align="center">
              <Text variant="heading3">{contract.title}</Text>
              <ContractStatusBadge status={contract.status} />
            </HStack>
            <HStack spacing="md">
              <Text variant="body" color="muted">
                {contract.contractNumber}
              </Text>
              <Badge color="cyan">
                {getContractTypeLabel(contract.contractType)}
              </Badge>
            </HStack>
          </Box>
          <Button
            variant="secondary"
            leftIcon={<PencilIcon size="sm" />}
            onClick={() => setIsEditing(true)}
          >
            Edit Contract
          </Button>
        </HStack>
      </SectionHeader>

      <Box>
        <HStack spacing="0">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'primary' : 'secondary'}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge
                  color={activeTab === tab.key ? 'zinc' : 'blue'}
                >
                  {tab.count}
                </Badge>
              )}
            </Button>
          ))}
        </HStack>
      </Box>

      {activeTab === 'overview' && (
        <Stack spacing="lg">
          {summary !== null && <ContractValueChart summary={summary} />}

          <Card>
            <CardBody>
              <Text variant="heading5">
                Contract Details
              </Text>
              <Grid columns={3} gap="md">
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    Agency
                  </Text>
                  <Text variant="body">{contract.agency ?? 'N/A'}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    Award Date
                  </Text>
                  <Text variant="body">{formatDate(contract.awardDate)}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    NAICS Code
                  </Text>
                  <Text variant="body">{contract.naicsCode ?? 'N/A'}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    Contract Vehicle
                  </Text>
                  <Text variant="body">{contract.contractVehicle ?? 'N/A'}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    Set-Aside Type
                  </Text>
                  <Text variant="body">{contract.setAsideType ?? 'N/A'}</Text>
                </Stack>
                <Stack spacing="xs">
                  <Text variant="caption" color="muted">
                    Security Clearance
                  </Text>
                  <Text variant="body">
                    {contract.requiresClearance === true
                      ? contract.clearanceLevel ?? 'Required'
                      : 'Not Required'}
                  </Text>
                </Stack>
              </Grid>

              {contract.description !== null && (
                <Box>
                  <Text variant="caption" color="muted">
                    Description
                  </Text>
                  <Text variant="body">
                    {contract.description}
                  </Text>
                </Box>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Text variant="heading5">
                Key Contacts
              </Text>
              <Grid columns={2} gap="lg">
                <Box>
                  <Text variant="bodySmall" weight="semibold">
                    Contracting Officer
                  </Text>
                  <Stack spacing="xs">
                    <Text variant="body">
                      {contract.contractingOfficerName ?? 'Not specified'}
                    </Text>
                    {contract.contractingOfficerEmail !== null && (
                      <Text variant="bodySmall" color="muted">
                        {contract.contractingOfficerEmail}
                      </Text>
                    )}
                  </Stack>
                </Box>
                <Box>
                  <Text variant="bodySmall" weight="semibold">
                    COR (Contracting Officer Representative)
                  </Text>
                  <Stack spacing="xs">
                    <Text variant="body">{contract.corName ?? 'Not specified'}</Text>
                    {contract.corEmail !== null && (
                      <Text variant="bodySmall" color="muted">
                        {contract.corEmail}
                      </Text>
                    )}
                  </Stack>
                </Box>
                <Box>
                  <Text variant="bodySmall" weight="semibold">
                    Program Manager
                  </Text>
                  <Text variant="body">
                    {contract.programManagerName ?? 'Not assigned'}
                  </Text>
                </Box>
                <Box>
                  <Text variant="bodySmall" weight="semibold">
                    Contract Manager
                  </Text>
                  <Text variant="body">
                    {contract.contractManagerName ?? 'Not assigned'}
                  </Text>
                </Box>
              </Grid>
            </CardBody>
          </Card>
        </Stack>
      )}

      {activeTab === 'clins' && (
        <ClinTable clins={clins} />
      )}

      {activeTab === 'deliverables' && (
        <DeliverableTracker
          deliverables={deliverables}
          onStatusChange={handleDeliverableStatusChange}
        />
      )}

      {activeTab === 'modifications' && (
        <ModificationTimeline
          modifications={modifications}
          onExecuteModification={handleExecuteModification}
        />
      )}
    </Section>
  );
}

export default ContractDetailPage;
