export type ViewSection =
  | 'dashboard'
  | 'all-opportunities'
  | 'sources-sought'
  | 'presolicitation'
  | 'solicitation'
  | 'sbir'
  | 'sbir-awards'
  | 'alerts'
  | 'usage'
  | 'admin-roles'
  | 'admin-permissions'
  | 'admin-user-roles'
  | 'crm-contacts'
  | 'crm-organizations'
  | 'crm-interactions'
  | 'analytics'
  | 'reports-list'
  | 'reports-builder'
  | 'portal'
  | 'portal-sprints'
  | 'portal-features'
  | 'portal-messaging'
  | 'portal-milestones'
  | 'portal-scope'
  | 'settings'
  | 'audit-log'
  | 'billing'
  | 'documents'
  | 'pipeline'
  | 'contracts'
  | 'financial'
  | 'financial-budgets'
  | 'financial-invoices'
  | 'financial-labor-rates'
  | 'compliance'
  | 'certifications'
  | 'clearances'
  | 'sbom'
  | `contract-${string}`
  | `budget-${string}`
  | `invoice-${string}`
  | `certification-${string}`
  | `naics-${string}`;



