import {useCallback, useEffect, useState} from 'react';
import {Box, Card, CardBody, CardHeader, Flex, Grid, GridItem, Stack} from '../components/catalyst/layout';
import {Badge, Button, Text} from '../components/catalyst/primitives';
import {useAuth} from '../auth';
import type {
    BillingConfig,
    BillingPageProps,
    PlanDetails,
    Subscription,
    SubscriptionPlan,
} from '../types/billing.types';
import {PLAN_ORDER, STATUS_DISPLAY} from '../types/billing.types';
import {
    cancelSubscription,
    fetchBillingConfig,
    fetchPlans,
    fetchSubscription,
    formatBillingDate,
    formatPrice,
    isPlanDowngrade,
    isPlanUpgrade,
    subscribeToPlan,
    updatePlan,
} from '../services/billing';

/**
 * Get the badge color based on plan
 */
function getPlanBadgeColor(plan: SubscriptionPlan): 'blue' | 'green' | 'amber' | 'cyan' {
  switch (plan) {
    case 'FREE':
      return 'cyan';
    case 'STARTER':
      return 'blue';
    case 'PROFESSIONAL':
      return 'green';
    case 'ENTERPRISE':
      return 'amber';
    default:
      return 'cyan';
  }
}

/**
 * Plan card component for displaying plan options
 */
function PlanCard({
  plan,
  currentPlan,
  isLoading,
  onSelect,
}: {
  plan: PlanDetails;
  currentPlan: SubscriptionPlan;
  isLoading: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
}): React.ReactElement {
  const isCurrent = plan.id === currentPlan;
  const isUpgrade = isPlanUpgrade(currentPlan, plan.id);
  const isDowngrade = isPlanDowngrade(currentPlan, plan.id);

  const getButtonText = (): string => {
    if (isCurrent) {
      return 'Current Plan';
    }
    if (isUpgrade) {
      return 'Upgrade';
    }
    if (isDowngrade) {
      return 'Downgrade';
    }
    return 'Select';
  };

  const getButtonVariant = (): 'primary' | 'outline' | 'ghost' => {
    if (isCurrent) {
      return 'ghost';
    }
    if (isUpgrade) {
      return 'primary';
    }
    return 'outline';
  };

  return (
    <Card
      variant={isCurrent ? 'outlined' : 'elevated'}
    >
      <CardHeader>
        <Stack spacing="sm">
          <Flex justify="between" align="center">
            <Text variant="heading5">{plan.name}</Text>
            {isCurrent && (
              <Badge color="blue">
                Current
              </Badge>
            )}
          </Flex>
          <Text variant="caption" color="muted">
            {plan.description}
          </Text>
        </Stack>
      </CardHeader>
      <CardBody>
        <Stack spacing="md">
          {/* Price */}
          <Box>
            <Text variant="heading3" weight="bold">
              {formatPrice(plan.price, plan.interval)}
            </Text>
          </Box>

          {/* Features */}
          <Stack spacing="sm">
            {plan.features.map((feature, index) => (
              <Flex key={index} align="start" gap="sm">
                <Text variant="body" color="success">
                  &#10003;
                </Text>
                <Text variant="bodySmall">{feature}</Text>
              </Flex>
            ))}
          </Stack>

          {/* Action button */}
          <Button
            variant={getButtonVariant()}
            fullWidth
            isDisabled={isCurrent || isLoading}
            isLoading={isLoading}
            onClick={() => onSelect(plan.id)}
          >
            {getButtonText()}
          </Button>
        </Stack>
      </CardBody>
    </Card>
  );
}

/**
 * Billing page component for subscription management
 */
export function BillingPage({ onPlanChange }: BillingPageProps): React.ReactElement {
  const { token } = useAuth();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<PlanDetails[]>([]);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Load billing data on mount
  useEffect(() => {
    if (token === null) {
      return;
    }

    const loadBillingData = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const [subscriptionData, plansData, configData] = await Promise.all([
          fetchSubscription(),
          fetchPlans(),
          fetchBillingConfig(),
        ]);

        setSubscription(subscriptionData);
        setPlans(plansData);
        setConfig(configData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load billing data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBillingData();
  }, [token]);

  const handlePlanSelect = useCallback(
    async (plan: SubscriptionPlan) => {
      if (subscription === null) {
        return;
      }

      try {
        setIsProcessing(true);
        setError(null);
        setSuccessMessage(null);

        let updatedSubscription: Subscription;

        if (subscription.id === null) {
          // No existing subscription, create new one
          updatedSubscription = await subscribeToPlan(plan);
        } else {
          // Update existing subscription
          updatedSubscription = await updatePlan(plan);
        }

        setSubscription(updatedSubscription);
        setSuccessMessage(`Successfully updated to ${plan} plan!`);

        if (onPlanChange !== undefined) {
          onPlanChange();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update plan';
        setError(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [subscription, onPlanChange]
  );

  const handleCancelSubscription = useCallback(async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccessMessage(null);

      const updatedSubscription = await cancelSubscription(false);
      setSubscription(updatedSubscription);
      setShowCancelConfirm(false);
      setSuccessMessage('Subscription will be canceled at the end of the billing period.');

      if (onPlanChange !== undefined) {
        onPlanChange();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to cancel subscription';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [onPlanChange]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center">
        <Text variant="body">Loading billing information...</Text>
      </Flex>
    );
  }

  if (config !== null && config.configured === false) {
    return (
      <Box>
        <Card>
          <CardBody>
            <Stack spacing="md">
              <Text variant="heading4">Billing Not Configured</Text>
              <Text variant="body" color="muted">
                Payment processing is not currently configured for this instance.
                Please contact your administrator.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Box>
    );
  }

  const currentPlan = subscription?.plan ?? 'FREE';
  const statusDisplay = subscription !== null ? STATUS_DISPLAY[subscription.status] : null;

  return (
    <Box>
      <Stack spacing="lg">
        <Text variant="heading3">Billing & Subscription</Text>

        {/* Error message */}
        {error !== null && (
          <Box>
            <Text variant="bodySmall" color="danger">
              {error}
            </Text>
          </Box>
        )}

        {/* Success message */}
        {successMessage !== null && (
          <Box>
            <Text variant="bodySmall" color="success">
              {successMessage}
            </Text>
          </Box>
        )}

        {/* Current Subscription */}
        <Card>
          <CardHeader>
            <Text variant="heading5">Current Subscription</Text>
          </CardHeader>
          <CardBody>
            <Flex justify="between" align="center" wrap="wrap" gap="md">
              <Stack spacing="sm">
                <Flex align="center" gap="sm">
                  <Badge color={getPlanBadgeColor(currentPlan)}>
                    {currentPlan}
                  </Badge>
                  {statusDisplay !== null && (
                    <Badge color={statusDisplay.variant === 'success' ? 'green' : statusDisplay.variant === 'warning' ? 'amber' : statusDisplay.variant === 'danger' ? 'red' : statusDisplay.variant === 'info' ? 'cyan' : 'zinc'}>
                      {statusDisplay.label}
                    </Badge>
                  )}
                </Flex>
                {subscription?.currentPeriodEnd !== null && (
                  <Text variant="caption" color="muted">
                    {subscription?.cancelAtPeriodEnd
                      ? `Cancels on ${formatBillingDate(subscription.currentPeriodEnd)}`
                      : `Renews on ${formatBillingDate(subscription?.currentPeriodEnd ?? null)}`}
                  </Text>
                )}
              </Stack>

              {currentPlan !== 'FREE' &&
                subscription?.cancelAtPeriodEnd === false && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirm(true)}
                    isDisabled={isProcessing}
                  >
                    Cancel Subscription
                  </Button>
                )}
            </Flex>
          </CardBody>
        </Card>

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <Card variant="outlined">
            <CardBody>
              <Stack spacing="md">
                <Text variant="body" weight="medium">
                  Are you sure you want to cancel your subscription?
                </Text>
                <Text variant="bodySmall" color="muted">
                  Your subscription will remain active until the end of the current billing period.
                  After that, you will be moved to the Free plan.
                </Text>
                <Flex gap="md">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCancelConfirm(false)}
                    isDisabled={isProcessing}
                  >
                    Keep Subscription
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCancelSubscription}
                    isLoading={isProcessing}
                    isDisabled={isProcessing}
                  >
                    Confirm Cancellation
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        )}

        {/* Plan Comparison */}
        <Stack spacing="md">
          <Text variant="heading5">Available Plans</Text>
          <Grid columns={4} gap="md">
            {PLAN_ORDER.map((planId) => {
              const planDetails = plans.find((p) => p.id === planId);
              if (planDetails === undefined) {
                return null;
              }
              return (
                <GridItem key={planId}>
                  <PlanCard
                    plan={planDetails}
                    currentPlan={currentPlan}
                    isLoading={isProcessing}
                    onSelect={handlePlanSelect}
                  />
                </GridItem>
              );
            })}
          </Grid>
        </Stack>

        {/* Billing History Link */}
        <Card>
          <CardBody>
            <Flex justify="between" align="center">
              <Stack spacing="xs">
                <Text variant="body" weight="medium">
                  Billing History
                </Text>
                <Text variant="caption" color="muted">
                  View and download your invoices
                </Text>
              </Stack>
              <Button variant="outline" size="sm" isDisabled>
                View History
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* FAQ/Help */}
        <Card>
          <CardHeader>
            <Text variant="heading5">Frequently Asked Questions</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="md">
              <Box>
                <Text variant="body" weight="medium">
                  What happens when I upgrade?
                </Text>
                <Text variant="bodySmall" color="muted">
                  When you upgrade, you will be charged a prorated amount for the remainder of
                  your current billing period. Your new features will be available immediately.
                </Text>
              </Box>
              <Box>
                <Text variant="body" weight="medium">
                  What happens when I downgrade?
                </Text>
                <Text variant="bodySmall" color="muted">
                  When you downgrade, the change will take effect at the end of your current
                  billing period. You will continue to have access to your current plan features
                  until then.
                </Text>
              </Box>
              <Box>
                <Text variant="body" weight="medium">
                  Can I cancel at any time?
                </Text>
                <Text variant="bodySmall" color="muted">
                  Yes, you can cancel your subscription at any time. Your subscription will
                  remain active until the end of your current billing period.
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </Box>
  );
}

export default BillingPage;
