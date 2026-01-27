export { useOpportunities } from './useOpportunities';
export { useLocalStorage } from './useLocalStorage';
export { useContacts, useContact } from './useContacts';
export type { UseContactsReturn, UseContactReturn } from './useContacts';
export { useOrganizations, useOrganization } from './useOrganizations';
export type { UseOrganizationsReturn, UseOrganizationReturn } from './useOrganizations';
export {
  useInteractions,
  useInteraction,
  useContactInteractions,
  useOrganizationInteractions,
  useUpcomingFollowups,
} from './useInteractions';
export type {
  UseInteractionsReturn,
  UseInteractionReturn,
  UseContactInteractionsReturn,
  UseOrganizationInteractionsReturn,
  UseUpcomingFollowupsReturn,
} from './useInteractions';
export {
  useCertifications,
  useCertification,
  useExpiringCertifications,
  useClearances,
  useExpiringClearances,
  useSbom,
  useComplianceOverview,
} from './useCompliance';
export type {
  UseCertificationsReturn,
  UseCertificationReturn,
  UseExpiringCertificationsReturn,
  UseClearancesReturn,
  UseExpiringClearancesReturn,
  UseSbomReturn,
  UseComplianceOverviewReturn,
} from './useCompliance';
export {
  useSprints,
  useSprint,
  useFeatureRequests,
  useMessaging,
  useMilestones,
  useScope,
  usePortal,
} from './usePortal';
export {
  useDocuments,
  useDocument,
  useFolders,
  useTemplates,
} from './useDocuments';
export type {
  UseDocumentsReturn,
  UseDocumentReturn,
  UseFoldersReturn,
  UseTemplatesReturn,
} from './useDocuments';
export {
  usePipelines,
  usePipeline,
  usePipelineOpportunities,
  usePipelineOpportunity,
  usePipelineSummary,
} from './usePipeline';
export type {
  UsePipelinesReturn,
  UsePipelineReturn,
  UsePipelineOpportunitiesReturn,
  UsePipelineOpportunityReturn,
  UsePipelineSummaryReturn,
} from './usePipeline';
export {
  useContracts,
  useContract,
  useCreateContract,
} from './useContracts';
export type {
  UseContractsReturn,
  UseContractReturn,
  UseCreateContractReturn,
} from './useContracts';
export {
  useInvoices,
  useInvoice,
  useBudgets,
  useBudget,
  useLaborRates,
  useLaborRate,
  useFinancialSummary,
} from './useFinancial';
export { useOnboarding } from './useOnboarding';

// Accessibility hooks
export { useKeyboardNavigation } from './useKeyboardNavigation';
export type { UseKeyboardNavigationOptions, UseKeyboardNavigationReturn } from './useKeyboardNavigation';
export { useFocusTrap } from './useFocusTrap';
export type { UseFocusTrapOptions, UseFocusTrapReturn } from './useFocusTrap';
export { useAnnounce } from './useAnnounce';
export type { AnnouncePoliteness, UseAnnounceOptions, UseAnnounceReturn } from './useAnnounce';
