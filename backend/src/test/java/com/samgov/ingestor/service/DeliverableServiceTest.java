package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractDeliverable;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableStatus;
import com.samgov.ingestor.model.ContractDeliverable.DeliverableType;
import com.samgov.ingestor.model.ScopeItem;
import com.samgov.ingestor.model.ScopeItem.ScopeItemType;
import com.samgov.ingestor.model.ScopeItem.ScopeStatus;
import com.samgov.ingestor.repository.ContractDeliverableRepository;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.repository.ScopeItemRepository;
import com.samgov.ingestor.service.DeliverableService.DeliverableResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Behavioral tests for DeliverableService progress calculation.
 *
 * Tests that deliverable progress is calculated based on linked ScopeItems:
 * - When ScopeItems are linked, progress = (completed / total) * 100
 * - When no ScopeItems are linked, uses status-based fallback
 */
@DisplayName("DeliverableService")
class DeliverableServiceTest extends BaseServiceTest {

    @Autowired
    private DeliverableService deliverableService;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private ContractDeliverableRepository deliverableRepository;

    @Autowired
    private ScopeItemRepository scopeItemRepository;

    private Contract testContract;

    @BeforeEach
    @Override
    protected void setUp() {
        super.setUp();

        // Create a test contract
        testContract = Contract.builder()
            .tenant(testTenant)
            .contractNumber("DELIVERABLE-TEST-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Deliverable Test Contract")
            .description("Contract for testing deliverable progress")
            .contractType(ContractType.FIRM_FIXED_PRICE)
            .status(ContractStatus.ACTIVE)
            .agency("Department of Defense")
            .agencyCode("DOD")
            .popStartDate(LocalDate.now())
            .popEndDate(LocalDate.now().plusYears(1))
            .totalValue(new BigDecimal("500000.00"))
            .build();
        testContract = contractRepository.save(testContract);
    }

    private ContractDeliverable createDeliverable(String title, DeliverableStatus status) {
        ContractDeliverable deliverable = ContractDeliverable.builder()
            .contract(testContract)
            .title(title)
            .deliverableType(DeliverableType.SOFTWARE)
            .status(status)
            .dueDate(LocalDate.now().plusMonths(1))
            .build();
        return deliverableRepository.save(deliverable);
    }

    private ScopeItem createScopeItem(ContractDeliverable deliverable, String name, ScopeStatus status) {
        ScopeItem scopeItem = ScopeItem.builder()
            .tenant(testTenant)
            .contract(testContract)
            .deliverable(deliverable)
            .wbsCode("1." + UUID.randomUUID().toString().substring(0, 4))
            .name(name)
            .itemType(ScopeItemType.TASK)
            .status(status)
            .build();
        return scopeItemRepository.save(scopeItem);
    }

    @Nested
    @DisplayName("Progress Calculation from ScopeItems")
    class ProgressCalculationFromScopeItems {

        @Test
        @DisplayName("should return 0% when no ScopeItems are linked and status is PENDING")
        void shouldReturn0PercentWhenNoScopeItemsAndPending() {
            // Given
            ContractDeliverable deliverable = createDeliverable("No Scope Items", DeliverableStatus.PENDING);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("should return 100% for ACCEPTED status without ScopeItems (fallback)")
        void shouldReturn100PercentForAcceptedStatusWithoutScopeItems() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Accepted Deliverable", DeliverableStatus.ACCEPTED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("should return 100% for WAIVED status without ScopeItems (fallback)")
        void shouldReturn100PercentForWaivedStatusWithoutScopeItems() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Waived Deliverable", DeliverableStatus.WAIVED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("should return 100% for SUBMITTED status without ScopeItems (functionally complete)")
        void shouldReturn100PercentForSubmittedStatusWithoutScopeItems() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Submitted Deliverable", DeliverableStatus.SUBMITTED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("should return 100% for UNDER_REVIEW status without ScopeItems (functionally complete)")
        void shouldReturn100PercentForUnderReviewStatusWithoutScopeItems() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Under Review Deliverable", DeliverableStatus.UNDER_REVIEW);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("should return 0% when all ScopeItems are PENDING")
        void shouldReturn0PercentWhenAllScopeItemsPending() {
            // Given
            ContractDeliverable deliverable = createDeliverable("With Pending Items", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 2", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 3", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 4", ScopeStatus.PENDING);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(0.0);
        }

        @Test
        @DisplayName("should return 100% when all ScopeItems are COMPLETED")
        void shouldReturn100PercentWhenAllScopeItemsCompleted() {
            // Given
            ContractDeliverable deliverable = createDeliverable("All Complete", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 3", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 4", ScopeStatus.COMPLETED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(100.0);
        }

        @Test
        @DisplayName("should return 50% when half of ScopeItems are COMPLETED")
        void shouldReturn50PercentWhenHalfCompleted() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Half Complete", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 3", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 4", ScopeStatus.IN_PROGRESS);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(50.0);
        }

        @Test
        @DisplayName("should return 25% when 1 of 4 ScopeItems is COMPLETED")
        void shouldReturn25PercentWhenOneOfFourCompleted() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Quarter Complete", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 3", ScopeStatus.ACTIVE);
            createScopeItem(deliverable, "Task 4", ScopeStatus.NOT_STARTED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(25.0);
        }

        @Test
        @DisplayName("should return 75% when 3 of 4 ScopeItems are COMPLETED")
        void shouldReturn75PercentWhenThreeOfFourCompleted() {
            // Given
            ContractDeliverable deliverable = createDeliverable("Three Quarters Complete", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 3", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 4", ScopeStatus.IN_PROGRESS);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then
            assertThat(response.progressPercentage()).isEqualTo(75.0);
        }

        @Test
        @DisplayName("should round progress to 1 decimal place")
        void shouldRoundProgressToOneDecimal() {
            // Given - 1 of 3 items completed = 33.333...%
            ContractDeliverable deliverable = createDeliverable("One Third Complete", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.PENDING);
            createScopeItem(deliverable, "Task 3", ScopeStatus.PENDING);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then - should round to 33.3
            assertThat(response.progressPercentage()).isEqualTo(33.3);
        }

        @Test
        @DisplayName("should calculate progress with mixed ScopeItem statuses (only COMPLETED counts)")
        void shouldCalculateProgressWithMixedStatuses() {
            // Given - 2 completed out of 5 total
            ContractDeliverable deliverable = createDeliverable("Mixed Statuses", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 3", ScopeStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 4", ScopeStatus.ON_HOLD);
            createScopeItem(deliverable, "Task 5", ScopeStatus.DEFERRED);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then - 2/5 = 40%
            assertThat(response.progressPercentage()).isEqualTo(40.0);
        }

        @Test
        @DisplayName("should not count CANCELLED ScopeItems as completed")
        void shouldNotCountCancelledAsCompleted() {
            // Given
            ContractDeliverable deliverable = createDeliverable("With Cancelled Items", DeliverableStatus.IN_PROGRESS);
            createScopeItem(deliverable, "Task 1", ScopeStatus.COMPLETED);
            createScopeItem(deliverable, "Task 2", ScopeStatus.CANCELLED);
            createScopeItem(deliverable, "Task 3", ScopeStatus.CANCELLED);
            createScopeItem(deliverable, "Task 4", ScopeStatus.PENDING);

            // When
            DeliverableResponse response = deliverableService.getDeliverable(deliverable.getId())
                .orElseThrow();

            // Then - 1 completed out of 4 = 25%
            assertThat(response.progressPercentage()).isEqualTo(25.0);
        }
    }
}
