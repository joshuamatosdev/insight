---
name: "phase9-crm"
description: "Phase 9 CRM Agent: Implements CRM frontend (contacts, organizations, interactions) following SAMGov patterns."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement Phase 9 CRM frontend components (contacts, organizations, interactions) for the SAMGov platform. The backend API already exists at `/api/crm/*`.

## Scope (ONLY these paths)

### Frontend
- `sam-dashboard/src/pages/crm/`
- `sam-dashboard/src/components/domain/crm/`
- `sam-dashboard/src/services/crmService.ts`
- `sam-dashboard/src/hooks/useContacts.ts`
- `sam-dashboard/src/hooks/useOrganizations.ts`
- `sam-dashboard/src/hooks/useInteractions.ts`
- `sam-dashboard/src/types/crm/`

## DO NOT TOUCH

- `SecurityConfig.java`
- `TenantContextFilter.java`
- `App.tsx` (document routes in `docs/PHASE9_CRM_COMPLETE.md` instead)
- Any existing controllers/services
- The existing CRM backend code

## Backend API (Already Exists)

The backend is already implemented. Use these endpoints:

**Contacts:**
- `GET /api/crm/contacts` - List with pagination
- `GET /api/crm/contacts/{id}` - Get by ID
- `POST /api/crm/contacts` - Create
- `PUT /api/crm/contacts/{id}` - Update
- `DELETE /api/crm/contacts/{id}` - Delete
- `GET /api/crm/contacts/search?keyword=` - Search

**Organizations:**
- `GET /api/crm/organizations` - List with pagination
- `GET /api/crm/organizations/{id}` - Get by ID
- `POST /api/crm/organizations` - Create
- `PUT /api/crm/organizations/{id}` - Update
- `DELETE /api/crm/organizations/{id}` - Delete

**Interactions:**
- `GET /api/crm/interactions` - List with pagination
- `GET /api/crm/interactions/{id}` - Get by ID
- `POST /api/crm/interactions` - Create
- `PUT /api/crm/interactions/{id}` - Update
- `DELETE /api/crm/interactions/{id}` - Delete
- `GET /api/crm/interactions/followups/pending` - Upcoming follow-ups

## Key Types (from Backend)

```typescript
type ContactType = 
  | 'GOVERNMENT_CUSTOMER'
  | 'CONTRACTING_OFFICER'
  | 'PROGRAM_MANAGER'
  | 'PRIME_CONTRACTOR'
  | 'TEAMING_PARTNER'
  | 'VENDOR';

type OrganizationType =
  | 'GOVERNMENT_AGENCY'
  | 'PRIME_CONTRACTOR'
  | 'SUBCONTRACTOR'
  | 'TEAMING_PARTNER'
  | 'COMPETITOR';

type InteractionType =
  | 'PHONE_CALL'
  | 'EMAIL'
  | 'MEETING_IN_PERSON'
  | 'MEETING_VIRTUAL'
  | 'CONFERENCE'
  | 'NOTE';
```

## Components to Create

1. **ContactCard** - Display single contact
2. **ContactList** - List with search/filter
3. **ContactForm** - Create/edit modal
4. **OrganizationCard** - Display single org
5. **OrganizationList** - List with type filter
6. **OrganizationForm** - Create/edit modal
7. **InteractionTimeline** - Chronological view
8. **InteractionForm** - Quick-add interaction
9. **UpcomingFollowups** - Widget for dashboard

## Strict TypeScript Rules

- NO `any` type - use `unknown` with type guards
- Strict boolean checks: `if (x !== null && x !== undefined)` not `if (x)`
- No unchecked indexing: use `.at(0)?.id` not `[0].id`
- Components use layout primitives (no naked HTML)
- Types in separate `.types.ts` files

## Verification

After changes, run:

```bash
cd sam-dashboard
npx tsc --noEmit
npm run lint
npm test
```

## Output File

When complete, update `docs/PHASE9_CRM_COMPLETE.md` with:
- List of created files
- Routes to add to App.tsx
- Test status
