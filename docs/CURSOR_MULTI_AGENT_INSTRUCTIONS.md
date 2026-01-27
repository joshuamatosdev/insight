# Cursor Multi-Agent Parallel Development Instructions

## CRITICAL: READ FIRST

You are working **INDEPENDENTLY** of Claude Code (another AI agent system).
To avoid merge conflicts, you MUST follow these file boundaries STRICTLY.

This document defines **70 parallel agent tasks** across 6 waves.

---

## Project Context

- **Backend**: Java Spring Boot with PostgreSQL
- **Frontend**: React + TypeScript + Vite (sam-dashboard/)
- **Architecture**: Multi-tenant SaaS with row-level security
- **Main Branch**: `master`

---

## Global Rules (from CLAUDE.md)

### Backend (Java)
- All entities MUST have `tenantId` field (UUID)
- Use `TenantContext.getCurrentTenantId()` in all service queries
- DTOs separate from entities
- Repository pattern with Spring Data JPA
- Follow existing patterns in `src/main/java/com/samgov/ingestor/`

### Frontend (TypeScript)
- **NO `any` type** - use `unknown` with type guards
- **Strict booleans**: `if (x !== null && x !== undefined)` NOT `if (x)`
- **Safe indexing**: `.at(0)?.id` NOT `[0].id`
- Types in separate `.types.ts` files
- Components follow existing patterns

### Testing
- Write tests for ALL new code
- Behavioral tests only (test outcomes, not internals)
- Backend: `src/test/java/com/samgov/ingestor/`
- Frontend: co-located `.test.tsx` files

### Branch Naming
```
cursor/wave{N}/{feature-name}
```

---

## FILES YOU MUST NOT TOUCH

```
❌ NEVER MODIFY THESE FILES:

src/main/java/com/samgov/ingestor/
├── config/SecurityConfig.java
├── config/TenantContextFilter.java
├── controller/AuthController.java
├── service/AuthenticationService.java
├── service/JwtService.java
├── service/UserService.java (existing)
├── service/TenantService.java (existing)

sam-dashboard/src/
├── App.tsx
├── auth/**
├── pages/LoginPage.tsx
├── pages/DashboardPage.tsx

Root files:
├── build.gradle (document deps in markdown)
├── sam-dashboard/package.json (document deps in markdown)
```

---

## WAVE 1: Foundation Infrastructure

### Agent: cursor/wave1/elasticsearch
```yaml
task: Setup Elasticsearch for search
files_to_create:
  - src/main/java/com/samgov/ingestor/config/ElasticsearchConfig.java
  - src/main/java/com/samgov/ingestor/service/SearchService.java
  - src/main/java/com/samgov/ingestor/service/SearchIndexService.java
  - src/main/java/com/samgov/ingestor/dto/SearchRequest.java
  - src/main/java/com/samgov/ingestor/dto/SearchResult.java
  - docker-compose.elasticsearch.yml
  - src/test/java/com/samgov/ingestor/service/SearchServiceTest.java
output: docs/WAVE1_ELASTICSEARCH_COMPLETE.md
```

### Agent: cursor/wave1/redis
```yaml
task: Setup Redis caching layer
files_to_create:
  - src/main/java/com/samgov/ingestor/config/RedisConfig.java
  - src/main/java/com/samgov/ingestor/service/CacheService.java
  - src/main/java/com/samgov/ingestor/annotation/Cacheable.java
  - docker-compose.redis.yml
  - src/test/java/com/samgov/ingestor/service/CacheServiceTest.java
output: docs/WAVE1_REDIS_COMPLETE.md
```

### Agent: cursor/wave1/s3-storage
```yaml
task: Setup S3 file storage
files_to_create:
  - src/main/java/com/samgov/ingestor/config/S3Config.java
  - src/main/java/com/samgov/ingestor/service/StorageService.java
  - src/main/java/com/samgov/ingestor/dto/StorageUploadRequest.java
  - src/main/java/com/samgov/ingestor/dto/StorageUploadResponse.java
  - src/test/java/com/samgov/ingestor/service/StorageServiceTest.java
output: docs/WAVE1_S3_COMPLETE.md
```

### Agent: cursor/wave1/ci-cd
```yaml
task: Create CI/CD pipelines
files_to_create:
  - .github/workflows/ci.yml
  - .github/workflows/test.yml
  - .github/workflows/build.yml
  - .github/workflows/deploy-staging.yml
  - .github/workflows/deploy-prod.yml
output: docs/WAVE1_CICD_COMPLETE.md
```

### Agent: cursor/wave1/docker
```yaml
task: Docker Compose full stack
files_to_create:
  - docker-compose.yml
  - docker-compose.prod.yml
  - docker-compose.test.yml
  - Dockerfile
  - sam-dashboard/Dockerfile
  - .dockerignore
output: docs/WAVE1_DOCKER_COMPLETE.md
```

### Agent: cursor/wave1/monitoring
```yaml
task: Monitoring and health checks
files_to_create:
  - src/main/java/com/samgov/ingestor/config/ActuatorConfig.java
  - src/main/java/com/samgov/ingestor/health/DatabaseHealthIndicator.java
  - src/main/java/com/samgov/ingestor/health/ElasticsearchHealthIndicator.java
  - .github/workflows/healthcheck.yml
output: docs/WAVE1_MONITORING_COMPLETE.md
```

---

## WAVE 2: CRM (Phase 9) - 10 Agents

### Agent: cursor/wave2/crm-contact-entity
```yaml
task: Contact entity and repository
files_to_create:
  - src/main/java/com/samgov/ingestor/model/Contact.java
  - src/main/java/com/samgov/ingestor/model/ContactType.java
  - src/main/java/com/samgov/ingestor/repository/ContactRepository.java
  - src/main/java/com/samgov/ingestor/service/ContactService.java
entity_fields:
  - id: UUID
  - tenantId: UUID
  - firstName: String
  - lastName: String
  - email: String
  - phone: String
  - title: String
  - department: String
  - organizationId: UUID (nullable)
  - contactType: ContactType (enum: GOVERNMENT, COMMERCIAL, PARTNER, INTERNAL)
  - notes: String (text)
  - tags: List<String>
  - createdAt: LocalDateTime
  - updatedAt: LocalDateTime
  - createdBy: UUID
output: docs/WAVE2_CRM_CONTACT_ENTITY_COMPLETE.md
```

### Agent: cursor/wave2/crm-org-entity
```yaml
task: Organization entity and repository
files_to_create:
  - src/main/java/com/samgov/ingestor/model/Organization.java
  - src/main/java/com/samgov/ingestor/model/OrganizationType.java
  - src/main/java/com/samgov/ingestor/repository/OrganizationRepository.java
  - src/main/java/com/samgov/ingestor/service/OrganizationService.java
entity_fields:
  - id: UUID
  - tenantId: UUID
  - name: String
  - description: String
  - organizationType: OrganizationType (enum: GOVERNMENT_AGENCY, PRIME_CONTRACTOR, SUBCONTRACTOR, PARTNER, COMPETITOR, CUSTOMER)
  - website: String
  - phone: String
  - address: String
  - parentOrganizationId: UUID (nullable, self-reference)
  - naicsCodes: List<String>
  - cageCodes: List<String>
  - createdAt: LocalDateTime
  - updatedAt: LocalDateTime
output: docs/WAVE2_CRM_ORG_ENTITY_COMPLETE.md
```

### Agent: cursor/wave2/crm-interaction-entity
```yaml
task: Interaction entity and repository
files_to_create:
  - src/main/java/com/samgov/ingestor/model/Interaction.java
  - src/main/java/com/samgov/ingestor/model/InteractionType.java
  - src/main/java/com/samgov/ingestor/repository/InteractionRepository.java
  - src/main/java/com/samgov/ingestor/service/InteractionService.java
entity_fields:
  - id: UUID
  - tenantId: UUID
  - contactId: UUID
  - organizationId: UUID (nullable)
  - opportunityId: UUID (nullable)
  - interactionType: InteractionType (enum: MEETING, CALL, EMAIL, EVENT, NOTE)
  - subject: String
  - description: String (text)
  - interactionDate: LocalDateTime
  - followUpDate: LocalDateTime (nullable)
  - createdAt: LocalDateTime
  - createdBy: UUID
output: docs/WAVE2_CRM_INTERACTION_ENTITY_COMPLETE.md
```

### Agent: cursor/wave2/crm-contact-api
```yaml
task: Contact REST API
files_to_create:
  - src/main/java/com/samgov/ingestor/controller/ContactController.java
  - src/main/java/com/samgov/ingestor/dto/ContactDTO.java
  - src/main/java/com/samgov/ingestor/dto/CreateContactRequest.java
  - src/main/java/com/samgov/ingestor/dto/UpdateContactRequest.java
  - src/main/java/com/samgov/ingestor/dto/ContactSearchRequest.java
endpoints:
  - GET /api/v1/contacts (list with pagination)
  - GET /api/v1/contacts/{id}
  - POST /api/v1/contacts
  - PUT /api/v1/contacts/{id}
  - DELETE /api/v1/contacts/{id}
  - GET /api/v1/contacts/{id}/interactions
  - GET /api/v1/contacts/search
output: docs/WAVE2_CRM_CONTACT_API_COMPLETE.md
```

### Agent: cursor/wave2/crm-org-api
```yaml
task: Organization REST API
files_to_create:
  - src/main/java/com/samgov/ingestor/controller/OrganizationController.java
  - src/main/java/com/samgov/ingestor/dto/OrganizationDTO.java
  - src/main/java/com/samgov/ingestor/dto/CreateOrganizationRequest.java
  - src/main/java/com/samgov/ingestor/dto/UpdateOrganizationRequest.java
endpoints:
  - GET /api/v1/organizations (list with pagination)
  - GET /api/v1/organizations/{id}
  - POST /api/v1/organizations
  - PUT /api/v1/organizations/{id}
  - DELETE /api/v1/organizations/{id}
  - GET /api/v1/organizations/{id}/contacts
  - GET /api/v1/organizations/{id}/children
output: docs/WAVE2_CRM_ORG_API_COMPLETE.md
```

### Agent: cursor/wave2/crm-interaction-api
```yaml
task: Interaction REST API
files_to_create:
  - src/main/java/com/samgov/ingestor/controller/InteractionController.java
  - src/main/java/com/samgov/ingestor/dto/InteractionDTO.java
  - src/main/java/com/samgov/ingestor/dto/CreateInteractionRequest.java
  - src/main/java/com/samgov/ingestor/dto/UpdateInteractionRequest.java
endpoints:
  - GET /api/v1/interactions (list with pagination)
  - GET /api/v1/interactions/{id}
  - POST /api/v1/interactions
  - PUT /api/v1/interactions/{id}
  - DELETE /api/v1/interactions/{id}
  - GET /api/v1/interactions/upcoming
output: docs/WAVE2_CRM_INTERACTION_API_COMPLETE.md
```

### Agent: cursor/wave2/crm-contact-ui
```yaml
task: Contact frontend pages
files_to_create:
  - sam-dashboard/src/pages/crm/ContactsPage.tsx
  - sam-dashboard/src/pages/crm/ContactsPage.types.ts
  - sam-dashboard/src/pages/crm/ContactDetailPage.tsx
  - sam-dashboard/src/pages/crm/ContactDetailPage.types.ts
  - sam-dashboard/src/components/domain/crm/ContactList.tsx
  - sam-dashboard/src/components/domain/crm/ContactCard.tsx
  - sam-dashboard/src/components/domain/crm/ContactForm.tsx
  - sam-dashboard/src/components/domain/crm/ContactForm.types.ts
  - sam-dashboard/src/components/domain/crm/index.ts
  - sam-dashboard/src/services/contactService.ts
  - sam-dashboard/src/hooks/useContacts.ts
features:
  - List view with search/filter
  - Detail page with interactions timeline
  - Create/edit form modal
  - Delete confirmation
output: docs/WAVE2_CRM_CONTACT_UI_COMPLETE.md
```

### Agent: cursor/wave2/crm-org-ui
```yaml
task: Organization frontend pages
files_to_create:
  - sam-dashboard/src/pages/crm/OrganizationsPage.tsx
  - sam-dashboard/src/pages/crm/OrganizationsPage.types.ts
  - sam-dashboard/src/pages/crm/OrganizationDetailPage.tsx
  - sam-dashboard/src/pages/crm/OrganizationDetailPage.types.ts
  - sam-dashboard/src/components/domain/crm/OrganizationList.tsx
  - sam-dashboard/src/components/domain/crm/OrganizationCard.tsx
  - sam-dashboard/src/components/domain/crm/OrganizationForm.tsx
  - sam-dashboard/src/components/domain/crm/OrganizationForm.types.ts
  - sam-dashboard/src/services/organizationService.ts
  - sam-dashboard/src/hooks/useOrganizations.ts
features:
  - List view with type filters
  - Detail page showing contacts & hierarchy
  - Create/edit form
output: docs/WAVE2_CRM_ORG_UI_COMPLETE.md
```

### Agent: cursor/wave2/crm-interaction-ui
```yaml
task: Interaction frontend pages
files_to_create:
  - sam-dashboard/src/pages/crm/InteractionsPage.tsx
  - sam-dashboard/src/pages/crm/InteractionsPage.types.ts
  - sam-dashboard/src/components/domain/crm/InteractionList.tsx
  - sam-dashboard/src/components/domain/crm/InteractionTimeline.tsx
  - sam-dashboard/src/components/domain/crm/InteractionForm.tsx
  - sam-dashboard/src/components/domain/crm/InteractionForm.types.ts
  - sam-dashboard/src/components/domain/crm/UpcomingFollowups.tsx
  - sam-dashboard/src/services/interactionService.ts
  - sam-dashboard/src/hooks/useInteractions.ts
features:
  - Activity feed view
  - Timeline component (reusable)
  - Quick-add interaction modal
  - Follow-up reminder widget
output: docs/WAVE2_CRM_INTERACTION_UI_COMPLETE.md
```

### Agent: cursor/wave2/crm-tests
```yaml
task: CRM test suite
files_to_create:
  - src/test/java/com/samgov/ingestor/controller/ContactControllerTest.java
  - src/test/java/com/samgov/ingestor/controller/OrganizationControllerTest.java
  - src/test/java/com/samgov/ingestor/controller/InteractionControllerTest.java
  - src/test/java/com/samgov/ingestor/service/ContactServiceTest.java
  - src/test/java/com/samgov/ingestor/service/OrganizationServiceTest.java
  - src/test/java/com/samgov/ingestor/service/InteractionServiceTest.java
  - sam-dashboard/src/pages/crm/ContactsPage.test.tsx
  - sam-dashboard/src/pages/crm/OrganizationsPage.test.tsx
  - sam-dashboard/src/hooks/useContacts.test.ts
  - sam-dashboard/src/hooks/useOrganizations.test.ts
output: docs/WAVE2_CRM_TESTS_COMPLETE.md
```

---

## WAVE 2: Documents (Phase 7) - 8 Agents

### Agent: cursor/wave2/doc-entity
```yaml
task: Document entity and repository
files_to_create:
  - src/main/java/com/samgov/ingestor/model/Document.java
  - src/main/java/com/samgov/ingestor/model/DocumentType.java
  - src/main/java/com/samgov/ingestor/model/DocumentVersion.java
  - src/main/java/com/samgov/ingestor/repository/DocumentRepository.java
  - src/main/java/com/samgov/ingestor/repository/DocumentVersionRepository.java
entity_fields_document:
  - id: UUID
  - tenantId: UUID
  - name: String
  - description: String
  - documentType: DocumentType (enum: PROPOSAL, CONTRACT, RFP, DELIVERABLE, TEMPLATE, OTHER)
  - mimeType: String
  - fileSize: Long
  - storageKey: String (S3 key)
  - opportunityId: UUID (nullable)
  - contractId: UUID (nullable)
  - tags: List<String>
  - createdAt: LocalDateTime
  - updatedAt: LocalDateTime
  - createdBy: UUID
output: docs/WAVE2_DOC_ENTITY_COMPLETE.md
```

### Agent: cursor/wave2/doc-template-entity
```yaml
task: Document template entity
files_to_create:
  - src/main/java/com/samgov/ingestor/model/DocumentTemplate.java
  - src/main/java/com/samgov/ingestor/model/TemplateVariable.java
  - src/main/java/com/samgov/ingestor/repository/DocumentTemplateRepository.java
entity_fields:
  - id: UUID
  - tenantId: UUID
  - name: String
  - description: String
  - category: String
  - content: String (text, template content)
  - variables: List<TemplateVariable>
  - isActive: Boolean
  - createdAt: LocalDateTime
  - updatedAt: LocalDateTime
output: docs/WAVE2_DOC_TEMPLATE_ENTITY_COMPLETE.md
```

### Agent: cursor/wave2/doc-service
```yaml
task: Document service layer
files_to_create:
  - src/main/java/com/samgov/ingestor/service/DocumentService.java
  - src/main/java/com/samgov/ingestor/service/DocumentVersionService.java
  - src/main/java/com/samgov/ingestor/service/DocumentTemplateService.java
features:
  - CRUD operations
  - Version management
  - Template rendering
  - Search integration
output: docs/WAVE2_DOC_SERVICE_COMPLETE.md
```

### Agent: cursor/wave2/doc-storage
```yaml
task: Document storage integration
files_to_create:
  - src/main/java/com/samgov/ingestor/service/DocumentStorageService.java
features:
  - Upload to S3
  - Download from S3
  - Generate presigned URLs
  - Delete files
  - Copy/move files
depends_on: cursor/wave1/s3-storage
output: docs/WAVE2_DOC_STORAGE_COMPLETE.md
```

### Agent: cursor/wave2/doc-api
```yaml
task: Document REST API
files_to_create:
  - src/main/java/com/samgov/ingestor/controller/DocumentController.java
  - src/main/java/com/samgov/ingestor/controller/DocumentTemplateController.java
  - src/main/java/com/samgov/ingestor/dto/DocumentDTO.java
  - src/main/java/com/samgov/ingestor/dto/CreateDocumentRequest.java
  - src/main/java/com/samgov/ingestor/dto/UploadDocumentRequest.java
  - src/main/java/com/samgov/ingestor/dto/DocumentTemplateDTO.java
endpoints:
  - GET /api/v1/documents
  - GET /api/v1/documents/{id}
  - POST /api/v1/documents/upload
  - PUT /api/v1/documents/{id}
  - DELETE /api/v1/documents/{id}
  - GET /api/v1/documents/{id}/download
  - GET /api/v1/documents/{id}/versions
  - GET /api/v1/document-templates
  - POST /api/v1/document-templates
output: docs/WAVE2_DOC_API_COMPLETE.md
```

### Agent: cursor/wave2/doc-ui-list
```yaml
task: Document list UI
files_to_create:
  - sam-dashboard/src/pages/documents/DocumentsPage.tsx
  - sam-dashboard/src/pages/documents/DocumentsPage.types.ts
  - sam-dashboard/src/components/domain/documents/DocumentList.tsx
  - sam-dashboard/src/components/domain/documents/DocumentCard.tsx
  - sam-dashboard/src/components/domain/documents/DocumentUpload.tsx
  - sam-dashboard/src/components/domain/documents/DocumentFilters.tsx
  - sam-dashboard/src/components/domain/documents/index.ts
  - sam-dashboard/src/services/documentService.ts
  - sam-dashboard/src/hooks/useDocuments.ts
output: docs/WAVE2_DOC_UI_LIST_COMPLETE.md
```

### Agent: cursor/wave2/doc-ui-detail
```yaml
task: Document detail UI
files_to_create:
  - sam-dashboard/src/pages/documents/DocumentDetailPage.tsx
  - sam-dashboard/src/pages/documents/DocumentDetailPage.types.ts
  - sam-dashboard/src/components/domain/documents/DocumentViewer.tsx
  - sam-dashboard/src/components/domain/documents/DocumentVersionHistory.tsx
  - sam-dashboard/src/components/domain/documents/DocumentMetadata.tsx
output: docs/WAVE2_DOC_UI_DETAIL_COMPLETE.md
```

### Agent: cursor/wave2/doc-tests
```yaml
task: Document test suite
files_to_create:
  - src/test/java/com/samgov/ingestor/controller/DocumentControllerTest.java
  - src/test/java/com/samgov/ingestor/service/DocumentServiceTest.java
  - src/test/java/com/samgov/ingestor/service/DocumentStorageServiceTest.java
  - sam-dashboard/src/pages/documents/DocumentsPage.test.tsx
  - sam-dashboard/src/hooks/useDocuments.test.ts
output: docs/WAVE2_DOC_TESTS_COMPLETE.md
```

---

## OUTPUT REQUIREMENTS

For each agent task, create a completion document:

```markdown
# {WAVE}_{FEATURE}_COMPLETE.md

## Files Created
- [ ] file1.java
- [ ] file2.tsx
...

## Routes to Add to App.tsx
(Claude will add these)
- /crm/contacts → ContactsPage
- /crm/contacts/:id → ContactDetailPage

## Dependencies to Add
(Claude will add these)

### build.gradle
implementation 'org.springframework.boot:spring-boot-starter-data-elasticsearch'

### sam-dashboard/package.json
"@tanstack/react-query": "^5.0.0"

## Database Migrations
(If needed, describe schema changes)

## Test Results
- Backend: X tests passing
- Frontend: X tests passing

## Verification Commands Run
./gradlew build ✅
cd sam-dashboard && npx tsc --noEmit ✅
cd sam-dashboard && npm test ✅
```

---

## VERIFICATION (MANDATORY)

Before marking ANY task complete:

```bash
# Backend
./gradlew build
./gradlew test

# Frontend
cd sam-dashboard
npx tsc --noEmit
npm run lint
npm test
```

**ALL must pass.**

---

## WAVES 3-6

See separate instruction files:
- docs/CURSOR_WAVE3_INSTRUCTIONS.md
- docs/CURSOR_WAVE4_INSTRUCTIONS.md
- docs/CURSOR_WAVE5_INSTRUCTIONS.md
- docs/CURSOR_WAVE6_INSTRUCTIONS.md

(These will be generated as Wave 1-2 complete)
