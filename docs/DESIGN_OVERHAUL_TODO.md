# Design Overhaul TODO

## Reference: Tailwind UI Studio/Pocket Templates
- Use studio_ui_base components for animations (FadeIn, FadeInStagger)
- Clean typography with proper Text/Heading components
- Grid/GridItem for layouts - NO raw divs in pages
- Card, CardHeader, CardBody for content sections
- Proper spacing using component props (padding, gap, margin)
- Badge for status indicators
- StatGroup/Stat for metrics

## Rules
- NO raw HTML elements (div, span, main, section) in page files
- USE: Text, Heading, Grid, GridItem, Card, Stack, Flex, Box
- All styling via Tailwind classes inside component definitions only
- Pages consume components, never define raw Tailwind

---

## Pages to Overhaul (70+ pages)

### Group 1 - Auth Pages (Agent 1)
- [ ] LoginPage.tsx
- [ ] RegisterPage.tsx
- [ ] ForgotPasswordPage.tsx
- [ ] ResetPasswordPage.tsx
- [ ] VerifyEmailPage.tsx
- [ ] MfaSetupPage.tsx
- [ ] OAuthCallbackPage.tsx

### Group 2 - Dashboard & Main (Agent 2)
- [ ] DashboardPage.tsx
- [ ] AllOpportunitiesPage.tsx
- [ ] AlertsPage.tsx
- [ ] NAICSPage.tsx
- [ ] SettingsPage.tsx
- [ ] ErrorPage.tsx

### Group 3 - Admin Pages (Agent 3)
- [ ] admin/PermissionsPage.tsx
- [ ] admin/RolesPage.tsx
- [ ] admin/TenantSettingsPage.tsx
- [ ] admin/UserRolesPage.tsx
- [ ] RolesPage.tsx (root)

### Group 4 - Pipeline & Opportunities (Agent 4)
- [ ] pipeline/PipelinePage.tsx
- [ ] pipeline/PipelineDetailPage.tsx
- [ ] pipeline/ProposalPage.tsx
- [ ] SBIRPage.tsx
- [ ] SBIRAwardsPage.tsx
- [ ] PresolicationPage.tsx
- [ ] SolicitationPage.tsx
- [ ] SourcesSoughtPage.tsx

### Group 5 - Contracts (Agent 5)
- [ ] contracts/ContractsPage.tsx
- [ ] contracts/ContractDetailPage.tsx
- [ ] contracts/ContractClinsPage.tsx
- [ ] contracts/DeliverablesPage.tsx
- [ ] contracts/ModificationsPage.tsx

### Group 6 - Financial (Agent 6)
- [ ] financial/FinancialDashboardPage.tsx
- [ ] financial/BudgetsPage.tsx
- [ ] financial/BudgetDetailPage.tsx
- [ ] financial/InvoicesPage.tsx
- [ ] financial/InvoiceDetailPage.tsx
- [ ] financial/LaborRatesPage.tsx
- [ ] BillingPage.tsx
- [ ] UsagePage.tsx

### Group 7 - CRM (Agent 7)
- [ ] crm/ContactsPage.tsx
- [ ] crm/ContactDetailPage.tsx
- [ ] crm/OrganizationsPage.tsx
- [ ] crm/OrganizationDetailPage.tsx
- [ ] crm/InteractionsPage.tsx

### Group 8 - Documents & Compliance (Agent 8)
- [ ] documents/DocumentsPage.tsx
- [ ] documents/DocumentDetailPage.tsx
- [ ] documents/DocumentUploadPage.tsx
- [ ] compliance/CompliancePage.tsx
- [ ] compliance/CertificationsPage.tsx
- [ ] compliance/CertificationDetailPage.tsx
- [ ] compliance/ClearancesPage.tsx
- [ ] compliance/SbomDashboardPage.tsx

### Group 9 - Portal (Agent 9)
- [ ] portal/ContractorDashboard.tsx
- [ ] portal/FeatureRequestsPage.tsx
- [ ] portal/MessagingPage.tsx
- [ ] portal/MilestonesPage.tsx
- [ ] portal/ScopeTrackerPage.tsx
- [ ] portal/SprintTrackingPage.tsx
- [ ] portal/widgets/ContractStatusCards.tsx
- [ ] portal/widgets/DeliverableTracker.tsx
- [ ] portal/widgets/InvoiceSummary.tsx
- [ ] portal/widgets/UpcomingDeadlines.tsx

### Group 10 - Reports & Onboarding (Agent 10)
- [ ] ReportBuilderPage.tsx
- [ ] ReportsListPage.tsx
- [ ] AnalyticsDashboardPage.tsx
- [ ] AuditLogPage.tsx
- [ ] onboarding/OnboardingWizard.tsx
- [ ] onboarding/steps/CertificationsStep.tsx
- [ ] onboarding/steps/CompanyProfileStep.tsx
- [ ] onboarding/steps/IntegrationStep.tsx
- [ ] onboarding/steps/NAICSStep.tsx
- [ ] onboarding/steps/TeamInviteStep.tsx

---

## Component Guidelines

### Page Structure Pattern
```tsx
import { Grid, GridItem, PageHeading, Card, Text } from '@/components/catalyst';

export function ExamplePage() {
  return (
    <Grid columns={1} gap="lg" padding="lg">
      <GridItem>
        <PageHeading>
          <PageHeadingSection>
            <PageHeadingTitle>Page Title</PageHeadingTitle>
            <PageHeadingDescription>Description</PageHeadingDescription>
          </PageHeadingSection>
        </PageHeading>
      </GridItem>

      <GridItem>
        <Card>
          <CardHeader>
            <CardTitle>Section</CardTitle>
          </CardHeader>
          <CardBody>
            <Text>Content here</Text>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );
}
```

### Imports Pattern
```tsx
import {
  // Layout
  Grid, GridItem, Stack, Flex, Box,
  // Typography
  Text, Heading,
  // Cards
  Card, CardHeader, CardTitle, CardBody, CardFooter,
  // Page structure
  PageHeading, PageHeadingSection, PageHeadingTitle, PageHeadingDescription,
  // Data display
  Badge, StatGroup, Stat, StatLabel, StatValue,
  // Forms
  Input, Select, Button, Checkbox,
  // Feedback
  Alert, Spinner,
} from '@/components/catalyst';
```
