export {
  fetchOpportunities,
  fetchSbirOpportunities,
  triggerIngest,
  triggerFullIngest,
  triggerSbirIngest,
  // SBIR.gov
  fetchSbirAwards,
  fetchSbirStats,
  searchSbirAwards,
  triggerSbirGovIngest,
  fetchSbirAgencies,
  // Opportunity Alerts
  fetchOpportunityAlerts,
  fetchOpportunityAlert,
  createOpportunityAlert,
  updateOpportunityAlert,
  deleteOpportunityAlert,
  toggleOpportunityAlert,
} from './api';
export { exportToCSV } from './csv';
export {
  login,
  register,
  refreshToken,
  validateToken,
  createAuthenticatedFetch,
  getAuthHeader,
} from './auth';
export {
  fetchMyAuditLogs,
  fetchUserAuditLogs,
  fetchTenantAuditLogs,
  fetchTenantAuditLogsByDateRange,
  fetchEntityAuditLogs,
} from './audit';
export {
  // Roles API
  fetchRoles,
  fetchRole,
  createRole,
  updateRole,
  deleteRole,
  // Permissions API
  fetchPermissions,
  fetchPermissionCodes,
  fetchMyPermissions,
  // User-Role Management API
  fetchUsersWithRoles,
  updateUserRole,
  removeUserRole,
} from './rbac';
export {
  fetchCurrentUsage,
  fetchUsageForPeriod,
  fetchUsageHistory,
  fetchUsageLimits,
  fetchUsageTrend,
  calculatePercentage,
  formatUsageNumber,
  getUsageStatusColor,
  getUsageStatusVariant,
} from './usage';
export {
  fetchSubscription,
  fetchPlans,
  fetchBillingConfig,
  subscribeToPlan,
  cancelSubscription,
  updatePlan,
  isPlanUpgrade,
  isPlanDowngrade,
  formatPrice,
  formatBillingDate,
} from './billing';
export {
  // Contacts
  fetchContacts,
  fetchContact,
  createContact,
  updateContact,
  deleteContact,
  searchContacts,
  fetchContactsByOrganization,
  // Organizations
  fetchOrganizations,
  fetchOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  searchOrganizations,
  // Interactions
  fetchInteractions,
  fetchInteraction,
  createInteraction,
  updateInteraction,
  deleteInteraction,
  fetchInteractionsByContact,
  fetchInteractionsByOrganization,
  fetchUpcomingFollowups,
  markFollowupComplete,
  // Activity & Stats
  fetchRecentActivity,
  fetchCrmStats,
} from './crmService';
export type { CrmStats } from './crmService';
export {
  // Sprint Management
  fetchSprints,
  fetchSprint,
  createSprint,
  updateSprint,
  deleteSprint,
  createSprintTask,
  updateSprintTask,
  deleteSprintTask,
  moveSprintTask,
  // Feature Requests
  fetchFeatureRequests,
  fetchFeatureRequest,
  createFeatureRequest,
  updateFeatureRequest,
  deleteFeatureRequest,
  voteFeatureRequest,
  unvoteFeatureRequest,
  addFeatureRequestComment,
  // Messaging
  fetchInboxSummary,
  fetchMessageThreads,
  fetchMessageThread,
  fetchMessages,
  sendMessage,
  markAsRead,
  markMessageAsRead,
  archiveMessage,
  // Milestones
  fetchMilestones,
  fetchMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  fetchMilestoneTimeline,
  // Scope Management
  fetchScopeItems,
  fetchScopeItem,
  createScopeItem,
  updateScopeItem,
  deleteScopeItem,
  fetchScopeChanges,
  fetchScopeChange,
  createScopeChange,
  updateScopeChange,
  approveScopeChange,
  rejectScopeChange,
  fetchScopeSummary,
} from './portalService';
export {
  // Documents
  fetchDocuments,
  fetchDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  fetchDocumentsByFolder,
  fetchDocumentsByOpportunity,
  fetchDocumentsByContract,
  fetchDocumentVersions,
  checkoutDocument,
  checkinDocument,
  updateDocumentStatus,
  fetchExpiringDocuments,
  fetchStorageSummary,
  // Folders
  fetchFolders,
  fetchFolder,
  fetchChildFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  searchFolders,
  fetchFolderBreadcrumb,
  // Templates
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  approveTemplate,
  setDefaultTemplate,
  recordTemplateUsage,
  searchTemplates,
  fetchTemplatesByType,
  fetchTemplateCategories,
  // Helpers
  formatFileSize,
  getDocumentTypeLabel,
  getDocumentStatusVariant,
  getAccessLevelVariant,
  getFileIcon,
} from './documentService';
export {
  // Pipeline Management
  fetchPipelines,
  fetchPipeline,
  createPipeline,
  updatePipeline,
  setDefaultPipeline,
  archivePipeline,
  deletePipeline,
  // Stage Management
  addStage,
  updateStage,
  reorderStages,
  deleteStage,
  // Pipeline Opportunity Management
  fetchPipelineOpportunities,
  fetchPipelineOpportunity,
  addOpportunityToPipeline,
  updatePipelineOpportunity,
  moveOpportunityToStage,
  setBidDecision,
  removeOpportunityFromPipeline,
  // Analytics
  fetchPipelineSummary,
  fetchApproachingDeadlines,
  fetchStaleOpportunities,
  // Teaming Partners
  fetchTeamingPartners,
} from './pipelineService';
export {
  // File operations
  uploadFile,
  downloadFile,
  getPresignedUrl,
  fetchFiles,
  fetchFile,
  deleteFile,
  moveFile,
  renameFile,
  // Folder operations
  fetchFolders as fetchFileFolders,
  createFolder as createFileFolder,
  deleteFolder as deleteFileFolder,
  renameFolder,
} from './fileService';
export type {
  FileMetadata,
  FileFolder,
  CreateFolderRequest as CreateFileFolderRequest,
  UploadResponse,
} from './fileService';
export {
  fetchNotifications,
  fetchNotification,
  markAsRead as markNotificationAsRead,
  markAllAsRead as markAllNotificationsAsRead,
  deleteNotification,
  deleteAllRead as deleteAllReadNotifications,
  getUnreadCount,
  fetchPreferences as fetchNotificationPreferences,
  updatePreferences as updateNotificationPreferences,
} from './notificationService';
export type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreferences,
} from './notificationService';
export {
  fetchUsers,
  fetchUser,
  fetchCurrentUser,
  createUser,
  updateUser,
  updateCurrentUser,
  deleteUser,
  updateUserStatus,
  resetUserPassword,
  resendVerificationEmail,
  updateUserRoles,
} from './userService';
export type {
  User,
  UserStatus,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from './userService';
export {
  fetchSavedSearches,
  fetchSavedSearch,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
  executeSavedSearch,
  setDefaultSearch,
  duplicateSavedSearch,
} from './savedSearchService';
export type {
  SavedSearch,
  SavedSearchFilters,
  CreateSavedSearchRequest,
  UpdateSavedSearchRequest,
  SearchResult,
} from './savedSearchService';
export {
  fetchWebhooks,
  fetchWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  fetchWebhookDeliveries,
  retryWebhookDelivery,
  toggleWebhookStatus,
} from './webhookService';
export type {
  Webhook,
  WebhookEventType,
  WebhookStatus,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookTestResult,
  WebhookDelivery,
} from './webhookService';
export {
  fetchApiKeys,
  fetchApiKey,
  createApiKey,
  revokeApiKey,
  regenerateApiKey,
  updateApiKeyScopes,
  updateApiKeyIpWhitelist,
  fetchApiKeyUsage,
} from './apiKeyService';
export type {
  ApiKey,
  ApiKeyWithSecret,
  ApiKeyScope,
  CreateApiKeyRequest,
} from './apiKeyService';
export {
  fetchInvitations,
  fetchInvitation,
  createInvitation,
  createBulkInvitations,
  resendInvitation,
  revokeInvitation,
  getInvitationByToken,
  acceptInvitation,
  validateInvitationToken,
} from './invitationService';
export type {
  Invitation,
  InvitationStatus,
  CreateInvitationRequest,
  AcceptInvitationRequest,
  InvitationDetails,
} from './invitationService';
