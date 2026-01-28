---
name: "wave4-billing"
description: "Wave 4: Subscription Billing - Stripe integration for SaaS billing."
tools: ['vscode', 'execute', 'read', 'edit', 'search']
model: 'inherit'
permissionMode: 'default'
---
## Mission

Implement Stripe-based subscription billing with plans, usage tracking, and invoices.

## Branch

`claude/wave4/billing`

## Scope (ONLY these paths)

### Backend
- `src/main/java/com/samgov/ingestor/config/StripeConfig.java`
- `src/main/java/com/samgov/ingestor/model/Subscription.java`
- `src/main/java/com/samgov/ingestor/model/SubscriptionPlan.java`
- `src/main/java/com/samgov/ingestor/model/PaymentMethod.java`
- `src/main/java/com/samgov/ingestor/model/Invoice.java` (billing)
- `src/main/java/com/samgov/ingestor/repository/SubscriptionRepository.java`
- `src/main/java/com/samgov/ingestor/service/BillingService.java`
- `src/main/java/com/samgov/ingestor/service/StripeService.java`
- `src/main/java/com/samgov/ingestor/service/StripeWebhookService.java`
- `src/main/java/com/samgov/ingestor/controller/BillingController.java`
- `src/main/java/com/samgov/ingestor/controller/StripeWebhookController.java`
- `src/main/java/com/samgov/ingestor/dto/BillingDTO.java`

### Frontend
- `sam-dashboard/src/pages/billing/BillingPage.tsx`
- `sam-dashboard/src/pages/billing/BillingPage.types.ts`
- `sam-dashboard/src/pages/billing/PricingPage.tsx`
- `sam-dashboard/src/pages/billing/InvoicesPage.tsx`
- `sam-dashboard/src/pages/billing/PaymentMethodsPage.tsx`
- `sam-dashboard/src/components/domain/billing/PlanCard.tsx`
- `sam-dashboard/src/components/domain/billing/SubscriptionStatus.tsx`
- `sam-dashboard/src/components/domain/billing/PaymentMethodCard.tsx`
- `sam-dashboard/src/services/billingService.ts`
- `sam-dashboard/src/hooks/useBilling.ts`

### Tests
- `src/test/java/com/samgov/ingestor/service/BillingServiceTest.java`
- `sam-dashboard/src/pages/billing/BillingPage.test.tsx`

## Data Model

### Subscription
```java
@Entity
public class Subscription {
    UUID id;
    UUID tenantId;
    String stripeSubscriptionId;
    String stripePriceId;
    SubscriptionPlan plan;
    String status;          // active, canceled, past_due
    Instant currentPeriodStart;
    Instant currentPeriodEnd;
    boolean cancelAtPeriodEnd;
    Instant createdAt;
}
```

### SubscriptionPlan
```java
public enum SubscriptionPlan {
    FREE,       // Limited features
    STARTER,    // $49/month
    PROFESSIONAL, // $149/month
    ENTERPRISE  // Custom pricing
}
```

## Features

1. **Plans & Pricing**
   - Display available plans
   - Feature comparison matrix
   - Upgrade/downgrade flow

2. **Payment Methods**
   - Add/remove cards (Stripe Elements)
   - Set default payment method

3. **Invoices**
   - View invoice history
   - Download PDF invoices

4. **Webhooks**
   - Handle payment succeeded
   - Handle payment failed
   - Handle subscription changes

## API Endpoints

- `GET /billing/subscription` - Current subscription
- `POST /billing/checkout` - Create checkout session
- `POST /billing/portal` - Create customer portal session
- `GET /billing/invoices` - List invoices
- `POST /webhooks/stripe` - Stripe webhook endpoint

## Verification

```bash
./gradlew build && ./gradlew test
cd sam-dashboard && npx tsc --noEmit && npm run lint && npm test
```

## Output

`docs/WAVE4_BILLING_COMPLETE.md`
