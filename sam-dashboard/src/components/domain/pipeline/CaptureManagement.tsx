import {useState} from 'react';
import {Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Button, Input, Text, Textarea} from '../../catalyst/primitives';
import type {CaptureManagementProps} from './CaptureManagement.types';
import type {UpdatePipelineOpportunityRequest} from '../../../types/pipeline';

export function CaptureManagement({
  opportunity,
  onUpdate,
  isLoading = false,
}: CaptureManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    captureManager: opportunity.captureManager ?? '',
    proposalManager: opportunity.proposalManager ?? '',
    winThemes: opportunity.winThemes ?? '',
    discriminators: opportunity.discriminators ?? '',
    internalDeadline: opportunity.internalDeadline ?? '',
    reviewDate: opportunity.reviewDate ?? '',
    estimatedValue: opportunity.estimatedValue?.toString() ?? '',
    probabilityOfWin: opportunity.probabilityOfWin?.toString() ?? '',
    notes: opportunity.notes ?? '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const request: UpdatePipelineOpportunityRequest = {
      captureManager: formData.captureManager.length > 0 ? formData.captureManager : undefined,
      proposalManager: formData.proposalManager.length > 0 ? formData.proposalManager : undefined,
      winThemes: formData.winThemes.length > 0 ? formData.winThemes : undefined,
      discriminators: formData.discriminators.length > 0 ? formData.discriminators : undefined,
      internalDeadline: formData.internalDeadline.length > 0 ? formData.internalDeadline : undefined,
      reviewDate: formData.reviewDate.length > 0 ? formData.reviewDate : undefined,
      estimatedValue: formData.estimatedValue.length > 0 ? parseFloat(formData.estimatedValue) : undefined,
      probabilityOfWin: formData.probabilityOfWin.length > 0 ? parseInt(formData.probabilityOfWin, 10) : undefined,
      notes: formData.notes.length > 0 ? formData.notes : undefined,
    };

    await onUpdate(request);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      captureManager: opportunity.captureManager ?? '',
      proposalManager: opportunity.proposalManager ?? '',
      winThemes: opportunity.winThemes ?? '',
      discriminators: opportunity.discriminators ?? '',
      internalDeadline: opportunity.internalDeadline ?? '',
      reviewDate: opportunity.reviewDate ?? '',
      estimatedValue: opportunity.estimatedValue?.toString() ?? '',
      probabilityOfWin: opportunity.probabilityOfWin?.toString() ?? '',
      notes: opportunity.notes ?? '',
    });
    setIsEditing(false);
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null) {
      return '-';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string | null): string => {
    if (dateString === null) {
      return '-';
    }
    return new Date(dateString).toLocaleDateString();
  };

  if (isEditing === false) {
    return (
      <Card>
        <CardHeader>
          <HStack justify="between" align="center">
            <Text variant="heading5">Capture Plan</Text>
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          <Stack gap="md">
            <HStack gap="lg">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Capture Manager</Text>
                <Text variant="bodySmall">{opportunity.captureManager ?? '-'}</Text>
              </Stack>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Proposal Manager</Text>
                <Text variant="bodySmall">{opportunity.proposalManager ?? '-'}</Text>
              </Stack>
            </HStack>

            <HStack gap="lg">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Estimated Value</Text>
                <Text variant="bodySmall">{formatCurrency(opportunity.estimatedValue)}</Text>
              </Stack>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Probability of Win</Text>
                <Text variant="bodySmall">
                  {opportunity.probabilityOfWin !== null ? `${opportunity.probabilityOfWin}%` : '-'}
                </Text>
              </Stack>
            </HStack>

            <HStack gap="lg">
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Internal Deadline</Text>
                <Text variant="bodySmall">{formatDate(opportunity.internalDeadline)}</Text>
              </Stack>
              <Stack gap="xs" style={{ flex: 1 }}>
                <Text variant="caption" color="secondary">Review Date</Text>
                <Text variant="bodySmall">{formatDate(opportunity.reviewDate)}</Text>
              </Stack>
            </HStack>

            <Stack gap="xs">
              <Text variant="caption" color="secondary">Win Themes</Text>
              <Text variant="bodySmall" style={{ whiteSpace: 'pre-wrap' }}>
                {opportunity.winThemes ?? '-'}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text variant="caption" color="secondary">Discriminators</Text>
              <Text variant="bodySmall" style={{ whiteSpace: 'pre-wrap' }}>
                {opportunity.discriminators ?? '-'}
              </Text>
            </Stack>

            <Stack gap="xs">
              <Text variant="caption" color="secondary">Notes</Text>
              <Text variant="bodySmall" style={{ whiteSpace: 'pre-wrap' }}>
                {opportunity.notes ?? '-'}
              </Text>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <Text variant="heading5">Edit Capture Plan</Text>
      </CardHeader>
      <CardBody>
        <Stack gap="md">
          <HStack gap="md">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Capture Manager</Text>
              <Input
                value={formData.captureManager}
                onChange={(e) => handleChange('captureManager', e.target.value)}
                placeholder="Name of capture manager"
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Proposal Manager</Text>
              <Input
                value={formData.proposalManager}
                onChange={(e) => handleChange('proposalManager', e.target.value)}
                placeholder="Name of proposal manager"
              />
            </Stack>
          </HStack>

          <HStack gap="md">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Estimated Value ($)</Text>
              <Input
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => handleChange('estimatedValue', e.target.value)}
                placeholder="0"
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Probability of Win (%)</Text>
              <Input
                type="number"
                min={0}
                max={100}
                value={formData.probabilityOfWin}
                onChange={(e) => handleChange('probabilityOfWin', e.target.value)}
                placeholder="0-100"
              />
            </Stack>
          </HStack>

          <HStack gap="md">
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Internal Deadline</Text>
              <Input
                type="date"
                value={formData.internalDeadline}
                onChange={(e) => handleChange('internalDeadline', e.target.value)}
              />
            </Stack>
            <Stack gap="xs" style={{ flex: 1 }}>
              <Text variant="caption" weight="semibold">Review Date</Text>
              <Input
                type="date"
                value={formData.reviewDate}
                onChange={(e) => handleChange('reviewDate', e.target.value)}
              />
            </Stack>
          </HStack>

          <Stack gap="xs">
            <Text variant="caption" weight="semibold">Win Themes</Text>
            <Textarea
              value={formData.winThemes}
              onChange={(e) => handleChange('winThemes', e.target.value)}
              placeholder="Key themes that will help win this opportunity..."
              rows={3}
            />
          </Stack>

          <Stack gap="xs">
            <Text variant="caption" weight="semibold">Discriminators</Text>
            <Textarea
              value={formData.discriminators}
              onChange={(e) => handleChange('discriminators', e.target.value)}
              placeholder="What sets us apart from competition..."
              rows={3}
            />
          </Stack>

          <Stack gap="xs">
            <Text variant="caption" weight="semibold">Notes</Text>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </Stack>

          <HStack justify="end" gap="md">
            <Button variant="ghost" onClick={handleCancel} disabled={isLoading === true}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading === true}>
              {isLoading === true ? 'Saving...' : 'Save Changes'}
            </Button>
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
}
