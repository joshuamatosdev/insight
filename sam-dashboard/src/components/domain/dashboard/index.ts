/**
 * Dashboard components barrel export
 */

// Types
export type {
  PipelineStageData,
  PipelineFunnelProps,
  AgencyDistributionData,
  AgencyDistributionProps,
  ContractValueByTypeData,
  ContractValueByTypeProps,
  DeadlineItem,
  DeadlineTimelineProps,
  SetAsideData,
  SetAsideDistributionProps,
  UpcomingDeadline,
  UpcomingDeadlinesTableProps,
  PipelineOpportunityRow,
  PipelineOpportunitiesTableProps,
  ExpiringContract,
  ExpiringContractsTableProps,
  ComplianceAlert,
  ComplianceAlertsTableProps,
} from './Dashboard.types';

// Existing components
export {PipelineValueChart} from './PipelineValueChart';
export {DeadlineCalendar} from './DeadlineCalendar';
// Note: ActivityFeed is exported from analytics/index.ts to avoid conflict

// New chart components
export {PipelineFunnel} from './PipelineFunnel';
export {AgencyDistribution} from './AgencyDistribution';
export {ContractValueByType} from './ContractValueByType';
export {DeadlineTimeline} from './DeadlineTimeline';
export {SetAsideDistribution} from './SetAsideDistribution';

// New table components
export {UpcomingDeadlinesTable} from './UpcomingDeadlinesTable';
export {PipelineOpportunitiesTable} from './PipelineOpportunitiesTable';
export {ExpiringContractsTable} from './ExpiringContractsTable';
export {ComplianceAlertsTable} from './ComplianceAlertsTable';
