export type InteractionType =
  | 'PHONE_CALL'
  | 'EMAIL'
  | 'MEETING_IN_PERSON'
  | 'MEETING_VIRTUAL'
  | 'CONFERENCE'
  | 'TRADE_SHOW'
  | 'INDUSTRY_DAY'
  | 'SITE_VISIT'
  | 'PRESENTATION'
  | 'PROPOSAL_SUBMISSION'
  | 'DEBRIEF'
  | 'NETWORKING_EVENT'
  | 'LINKEDIN_MESSAGE'
  | 'NOTE'
  | 'OTHER';

export type InteractionOutcome =
  | 'POSITIVE'
  | 'NEUTRAL'
  | 'NEGATIVE'
  | 'FOLLOW_UP_REQUIRED'
  | 'NO_ANSWER'
  | 'LEFT_MESSAGE'
  | 'MEETING_SCHEDULED'
  | 'REFERRAL_RECEIVED'
  | 'INFORMATION_GATHERED'
  | 'RELATIONSHIP_STRENGTHENED';

export interface Interaction {
  id: string;
  interactionType: InteractionType;
  subject: string;
  description: string | null;
  interactionDate: string;
  durationMinutes: number | null;
  outcome: InteractionOutcome | null;
  outcomeNotes: string | null;
  location: string | null;
  locationType: string | null;
  attendees: string | null;
  internalAttendees: string | null;
  followUpRequired: boolean;
  followUpDate: string | null;
  followUpNotes: string | null;
  followUpCompleted: boolean;
  attachmentUrls: string | null;
  meetingLink: string | null;
  tags: string | null;
  contactId: string | null;
  contactName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  opportunityId: string | null;
  opportunityTitle: string | null;
  contractId: string | null;
  contractTitle: string | null;
  loggedById: string;
  loggedByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInteractionRequest {
  interactionType: InteractionType;
  subject: string;
  description?: string;
  interactionDate: string;
  durationMinutes?: number;
  outcome?: InteractionOutcome;
  outcomeNotes?: string;
  location?: string;
  locationType?: string;
  attendees?: string;
  internalAttendees?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  meetingLink?: string;
  tags?: string;
  contactId?: string;
  organizationId?: string;
  opportunityId?: string;
  contractId?: string;
}

export interface UpdateInteractionRequest extends Partial<CreateInteractionRequest> {
  followUpCompleted?: boolean;
}

export interface InteractionFilters {
  search?: string;
  interactionType?: InteractionType;
  outcome?: InteractionOutcome;
  contactId?: string;
  organizationId?: string;
  followUpRequired?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpcomingFollowup {
  id: string;
  subject: string;
  followUpDate: string;
  followUpNotes: string | null;
  contactId: string | null;
  contactName: string | null;
  organizationId: string | null;
  organizationName: string | null;
  isOverdue: boolean;
  daysUntilDue: number;
}
