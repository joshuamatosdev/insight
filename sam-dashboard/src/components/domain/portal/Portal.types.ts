import type { CSSProperties, ReactNode } from 'react';
import type {
  Sprint,
  SprintTask,
  SprintTaskStatus,
  FeatureRequest,
  Message,
  MessageThread,
  Milestone,
  ScopeItem,
  ScopeChange,
} from '../../../types/portal';

// ============ Sprint Components ============

export interface SprintBoardProps {
  sprint: Sprint;
  onTaskMove?: (taskId: string, newStatus: SprintTaskStatus, newOrder: number) => void;
  onTaskClick?: (task: SprintTask) => void;
  onTaskCreate?: (status: SprintTaskStatus) => void;
  className?: string;
  style?: CSSProperties;
}

export interface SprintCardProps {
  sprint: Sprint;
  isSelected?: boolean;
  onClick?: (sprint: Sprint) => void;
  onEdit?: (sprint: Sprint) => void;
  onDelete?: (sprint: Sprint) => void;
  className?: string;
  style?: CSSProperties;
}

export interface SprintTaskCardProps {
  task: SprintTask;
  isDragging?: boolean;
  onClick?: (task: SprintTask) => void;
  className?: string;
  style?: CSSProperties;
}

// ============ Feature Request Components ============

export interface FeatureRequestCardProps {
  featureRequest: FeatureRequest;
  onVote?: (id: string) => void;
  onUnvote?: (id: string) => void;
  onClick?: (featureRequest: FeatureRequest) => void;
  onEdit?: (featureRequest: FeatureRequest) => void;
  className?: string;
  style?: CSSProperties;
}

export interface FeatureVoteButtonProps {
  voteCount: number;
  hasVoted: boolean;
  onVote: () => void;
  onUnvote: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface FeatureRequestBoardProps {
  featureRequests: FeatureRequest[];
  onVote?: (id: string) => void;
  onUnvote?: (id: string) => void;
  onClick?: (featureRequest: FeatureRequest) => void;
  groupBy?: 'status' | 'priority' | 'category';
  className?: string;
  style?: CSSProperties;
}

// ============ Messaging Components ============

export interface MessageThreadProps {
  thread: MessageThread;
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (body: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export interface MessageComposerProps {
  recipientIds?: string[];
  threadId?: string;
  placeholder?: string;
  onSend: (body: string, attachmentIds?: string[]) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface InboxListProps {
  threads: MessageThread[];
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
  onArchive?: (threadId: string) => void;
  isLoading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  className?: string;
  style?: CSSProperties;
}

// ============ Milestone Components ============

export interface MilestoneTimelineProps {
  milestones: Milestone[];
  onMilestoneClick?: (milestone: Milestone) => void;
  showCriticalPath?: boolean;
  criticalPath?: string[];
  className?: string;
  style?: CSSProperties;
}

export interface MilestoneCardProps {
  milestone: Milestone;
  onClick?: (milestone: Milestone) => void;
  onEdit?: (milestone: Milestone) => void;
  onDelete?: (milestone: Milestone) => void;
  showDeliverables?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface MilestoneProgressProps {
  percentComplete: number;
  status: string;
  className?: string;
  style?: CSSProperties;
}

// ============ Scope Components ============

export interface ScopeItemListProps {
  scopeItems: ScopeItem[];
  onItemClick?: (item: ScopeItem) => void;
  onItemEdit?: (item: ScopeItem) => void;
  onItemDelete?: (item: ScopeItem) => void;
  showHierarchy?: boolean;
  expandedIds?: string[];
  onToggleExpand?: (itemId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ScopeItemRowProps {
  item: ScopeItem;
  level: number;
  isExpanded?: boolean;
  hasChildren?: boolean;
  onClick?: (item: ScopeItem) => void;
  onEdit?: (item: ScopeItem) => void;
  onDelete?: (item: ScopeItem) => void;
  onToggleExpand?: () => void;
  className?: string;
  style?: CSSProperties;
}

export interface ScopeChangeTrackerProps {
  scopeChanges: ScopeChange[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onClick?: (change: ScopeChange) => void;
  className?: string;
  style?: CSSProperties;
}

export interface ScopeChangeCardProps {
  scopeChange: ScopeChange;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onClick?: (change: ScopeChange) => void;
  className?: string;
  style?: CSSProperties;
}

// ============ Common Props ============

export interface PortalEmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
