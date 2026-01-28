import {useState} from 'react';
import {Card, CardBody, CardFooter, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {Button, Input, Select, Text} from '../../catalyst/primitives';
import type {CreateInteractionRequest, Interaction, InteractionOutcome, InteractionType} from '../../../types/crm';

export interface InteractionFormProps {
  interaction?: Interaction;
  onSubmit: (data: CreateInteractionRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  contactId?: string;
  organizationId?: string;
}

interface FormData {
  interactionType: InteractionType;
  subject: string;
  description: string;
  interactionDate: string;
  durationMinutes: string;
  outcome: InteractionOutcome | '';
  outcomeNotes: string;
  location: string;
  followUpRequired: boolean;
  followUpDate: string;
  followUpNotes: string;
  meetingLink: string;
}

interface FormErrors {
  subject?: string;
  interactionDate?: string;
}

const INTERACTION_TYPES: { value: InteractionType; label: string }[] = [
  { value: 'PHONE_CALL', label: 'Phone Call' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'MEETING_IN_PERSON', label: 'In-Person Meeting' },
  { value: 'MEETING_VIRTUAL', label: 'Virtual Meeting' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'TRADE_SHOW', label: 'Trade Show' },
  { value: 'INDUSTRY_DAY', label: 'Industry Day' },
  { value: 'SITE_VISIT', label: 'Site Visit' },
  { value: 'PRESENTATION', label: 'Presentation' },
  { value: 'PROPOSAL_SUBMISSION', label: 'Proposal Submission' },
  { value: 'DEBRIEF', label: 'Debrief' },
  { value: 'NETWORKING_EVENT', label: 'Networking Event' },
  { value: 'LINKEDIN_MESSAGE', label: 'LinkedIn Message' },
  { value: 'NOTE', label: 'Note' },
  { value: 'OTHER', label: 'Other' },
];

const OUTCOMES: { value: InteractionOutcome | ''; label: string }[] = [
  { value: '', label: 'Select Outcome' },
  { value: 'POSITIVE', label: 'Positive' },
  { value: 'NEUTRAL', label: 'Neutral' },
  { value: 'NEGATIVE', label: 'Negative' },
  { value: 'FOLLOW_UP_REQUIRED', label: 'Follow-up Required' },
  { value: 'NO_ANSWER', label: 'No Answer' },
  { value: 'LEFT_MESSAGE', label: 'Left Message' },
  { value: 'MEETING_SCHEDULED', label: 'Meeting Scheduled' },
  { value: 'REFERRAL_RECEIVED', label: 'Referral Received' },
  { value: 'INFORMATION_GATHERED', label: 'Information Gathered' },
  { value: 'RELATIONSHIP_STRENGTHENED', label: 'Relationship Strengthened' },
];

function getInitialFormData(interaction?: Interaction): FormData {
  if (interaction !== undefined) {
    return {
      interactionType: interaction.interactionType,
      subject: interaction.subject,
      description: interaction.description ?? '',
      interactionDate: interaction.interactionDate.slice(0, 16),
      durationMinutes: interaction.durationMinutes?.toString() ?? '',
      outcome: interaction.outcome ?? '',
      outcomeNotes: interaction.outcomeNotes ?? '',
      location: interaction.location ?? '',
      followUpRequired: interaction.followUpRequired,
      followUpDate: interaction.followUpDate ?? '',
      followUpNotes: interaction.followUpNotes ?? '',
      meetingLink: interaction.meetingLink ?? '',
    };
  }
  const now = new Date();
  return {
    interactionType: 'NOTE',
    subject: '',
    description: '',
    interactionDate: now.toISOString().slice(0, 16),
    durationMinutes: '',
    outcome: '',
    outcomeNotes: '',
    location: '',
    followUpRequired: false,
    followUpDate: '',
    followUpNotes: '',
    meetingLink: '',
  };
}

export function InteractionForm({
  interaction,
  onSubmit,
  onCancel,
  isLoading = false,
  contactId,
  organizationId,
}: InteractionFormProps) {
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(interaction));
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (formData.subject.trim() === '') {
      newErrors.subject = 'Subject is required';
    }
    if (formData.interactionDate === '') {
      newErrors.interactionDate = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() === false) {
      return;
    }

    const request: CreateInteractionRequest = {
      interactionType: formData.interactionType,
      subject: formData.subject,
      interactionDate: formData.interactionDate,
    };

    if (formData.description !== '') request.description = formData.description;
    if (formData.durationMinutes !== '') request.durationMinutes = parseInt(formData.durationMinutes, 10);
    if (formData.outcome !== '') request.outcome = formData.outcome as InteractionOutcome;
    if (formData.outcomeNotes !== '') request.outcomeNotes = formData.outcomeNotes;
    if (formData.location !== '') request.location = formData.location;
    if (formData.followUpRequired === true) request.followUpRequired = true;
    if (formData.followUpDate !== '') request.followUpDate = formData.followUpDate;
    if (formData.followUpNotes !== '') request.followUpNotes = formData.followUpNotes;
    if (formData.meetingLink !== '') request.meetingLink = formData.meetingLink;
    if (contactId !== undefined) request.contactId = contactId;
    if (organizationId !== undefined) request.organizationId = organizationId;

    await onSubmit(request);
  };

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors] !== undefined) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const isEditing = interaction !== undefined;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <Text variant="heading4">{isEditing ? 'Edit Interaction' : 'Log Interaction'}</Text>
        </CardHeader>
        <CardBody>
          <Stack gap="lg">
            <HStack gap="md">
              <Select
                label="Type"
                value={formData.interactionType}
                onChange={(e) => handleChange('interactionType', e.target.value)}
                options={INTERACTION_TYPES}
              />
              <Input
                label="Date & Time *"
                type="datetime-local"
                value={formData.interactionDate}
                onChange={(e) => handleChange('interactionDate', e.target.value)}
                error={errors.interactionDate}
              />
            </HStack>
            <Input
              label="Subject *"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              error={errors.subject}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            <HStack gap="md">
              <Select
                label="Outcome"
                value={formData.outcome}
                onChange={(e) => handleChange('outcome', e.target.value)}
                options={OUTCOMES}
              />
              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => handleChange('durationMinutes', e.target.value)}
              />
            </HStack>
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
            <HStack gap="md" align="center">
              <label>
                <input
                  type="checkbox"
                  checked={formData.followUpRequired}
                  onChange={(e) => handleChange('followUpRequired', e.target.checked)}
                />
                {' '}Follow-up Required
              </label>
              {formData.followUpRequired === true && (
                <Input
                  label="Follow-up Date"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleChange('followUpDate', e.target.value)}
                />
              )}
            </HStack>
            {formData.followUpRequired === true && (
              <Input
                label="Follow-up Notes"
                value={formData.followUpNotes}
                onChange={(e) => handleChange('followUpNotes', e.target.value)}
              />
            )}
          </Stack>
        </CardBody>
        <CardFooter>
          <HStack justify="end" gap="md">
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Log Interaction'}
            </Button>
          </HStack>
        </CardFooter>
      </Card>
    </form>
  );
}
