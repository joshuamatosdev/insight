package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractModification.ModificationStatus;
import com.samgov.ingestor.model.ContractModification.ModificationType;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.service.ContractService.ContractDto;
import com.samgov.ingestor.service.ContractService.CreateContractRequest;
import com.samgov.ingestor.service.ContractService.CreateModificationRequest;
import com.samgov.ingestor.service.ContractService.ModificationDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for Contract Modification management.
 *
 * Tests focus on modification lifecycle behaviors:
 * - Creating modifications of different types
 * - Modification tracking and history
 * - Executing modifications and their effects on contracts
 * - Value and funding changes
 * - Period of performance extensions
 */
@DisplayName("Contract Modifications")
class ContractModificationTest extends BaseServiceTest {

    @Autowired
    private ContractService contractService;

    @Autowired
    private ContractRepository contractRepository;

    private ContractDto createBaseContract(String contractNumber) {
        CreateContractRequest request = new CreateContractRequest(
            contractNumber,
            "Test Contract " + contractNumber,
            "Contract for modification testing",
            ContractType.FIRM_FIXED_PRICE,
            null, null,
            "Department of Defense", "DOD", "Army", "Contracting Office",
            LocalDate.now(), LocalDate.now().plusYears(1),
            LocalDate.now().plusMonths(6), LocalDate.now().plusYears(3),
            new BigDecimal("500000.00"), new BigDecimal("500000.00"),
            new BigDecimal("1000000.00"), new BigDecimal("250000.00"),
            "541512", "R425",
            "Washington", "DC", "USA",
            "John Smith", "john.smith@agency.gov", "202-555-1234",
            "Jane Doe", "jane.doe@agency.gov", "202-555-5678",
            null, false, null, null, null, false, null,
            null, null, LocalDate.now().minusDays(30), null
        );
        return contractService.createContract(request);
    }

    @Nested
    @DisplayName("Creating Modifications")
    class CreatingModifications {

        @Test
        @DisplayName("should create administrative modification")
        void shouldCreateAdministrativeModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-ADMIN-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "A00001",
                "Change of COR",
                "Administrative modification to change COR assignment",
                ModificationType.ADMINISTRATIVE,
                LocalDate.now(),
                null, // no value change
                null, // no funding change
                null,
                null,
                null,
                "COR changed from Jane Doe to Bob Wilson",
                "Program Office",
                "John Smith",
                "Personnel reassignment",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification).isNotNull();
            assertThat(modification.modificationNumber()).isEqualTo("A00001");
            assertThat(modification.modificationType()).isEqualTo(ModificationType.ADMINISTRATIVE);
            assertThat(modification.status()).isEqualTo(ModificationStatus.PENDING);
            assertThat(modification.valueChange()).isNull();
            assertThat(modification.fundingChange()).isNull();
        }

        @Test
        @DisplayName("should create bilateral modification with value change")
        void shouldCreateBilateralModificationWithValueChange() {
            // Given
            ContractDto contract = createBaseContract("MOD-BILAT-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Scope Expansion",
                "Bilateral modification to expand contract scope",
                ModificationType.BILATERAL,
                LocalDate.now(),
                new BigDecimal("100000.00"), // value increase
                new BigDecimal("50000.00"),  // additional funding
                new BigDecimal("600000.00"), // new total
                null,
                null,
                "Adding network security assessment services",
                "IT Department",
                "John Smith",
                "Mission requirement expansion",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification).isNotNull();
            assertThat(modification.modificationNumber()).isEqualTo("P00001");
            assertThat(modification.modificationType()).isEqualTo(ModificationType.BILATERAL);
            assertThat(modification.valueChange()).isEqualByComparingTo(new BigDecimal("100000.00"));
            assertThat(modification.fundingChange()).isEqualByComparingTo(new BigDecimal("50000.00"));
            assertThat(modification.newTotalValue()).isEqualByComparingTo(new BigDecimal("600000.00"));
        }

        @Test
        @DisplayName("should create incremental funding modification")
        void shouldCreateIncrementalFundingModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-IF-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00002",
                "Incremental Funding",
                "Incremental funding modification",
                ModificationType.INCREMENTAL_FUNDING,
                LocalDate.now(),
                null, // no value change
                new BigDecimal("125000.00"), // additional funding
                null,
                null,
                null,
                null,
                "Finance Office",
                "John Smith",
                "FY25 funding allocation",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.INCREMENTAL_FUNDING);
            assertThat(modification.fundingChange()).isEqualByComparingTo(new BigDecimal("125000.00"));
            assertThat(modification.valueChange()).isNull();
        }

        @Test
        @DisplayName("should create no-cost extension modification")
        void shouldCreateNoCostExtensionModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-NCE-001");
            LocalDate newEndDate = LocalDate.now().plusYears(2);
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00003",
                "No-Cost Extension",
                "Extending period of performance without additional cost",
                ModificationType.NO_COST_EXTENSION,
                LocalDate.now(),
                null, // no value change
                null, // no funding change
                null,
                365, // extension days
                newEndDate,
                null,
                "Program Office",
                "John Smith",
                "Schedule delay due to external factors",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.NO_COST_EXTENSION);
            assertThat(modification.popExtensionDays()).isEqualTo(365);
            assertThat(modification.newPopEndDate()).isEqualTo(newEndDate);
            assertThat(modification.valueChange()).isNull();
        }

        @Test
        @DisplayName("should create option exercise modification")
        void shouldCreateOptionExerciseModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-OPT-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00004",
                "Option Year 1 Exercise",
                "Exercising Option Year 1",
                ModificationType.OPTION_EXERCISE,
                LocalDate.now(),
                new BigDecimal("150000.00"), // option value
                new BigDecimal("75000.00"),  // initial funding
                new BigDecimal("650000.00"), // new total
                365, // extends PoP
                LocalDate.now().plusYears(2),
                "Exercising priced option per contract terms",
                "Contracting Office",
                "John Smith",
                "Government exercised Option Year 1",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.OPTION_EXERCISE);
            assertThat(modification.valueChange()).isEqualByComparingTo(new BigDecimal("150000.00"));
            assertThat(modification.newPopEndDate()).isNotNull();
        }

        @Test
        @DisplayName("should reject duplicate modification numbers")
        void shouldRejectDuplicateModificationNumbers() {
            // Given
            ContractDto contract = createBaseContract("MOD-DUP-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001", "First Mod", "First modification",
                ModificationType.BILATERAL, LocalDate.now(),
                new BigDecimal("10000.00"), null, null,
                null, null, null, null, null, null, null
            );
            contractService.createModification(contract.id(), modRequest);

            // When/Then
            CreateModificationRequest duplicateRequest = new CreateModificationRequest(
                "P00001", "Duplicate Mod", "Duplicate modification number",
                ModificationType.BILATERAL, LocalDate.now(),
                new BigDecimal("20000.00"), null, null,
                null, null, null, null, null, null, null
            );

            assertThatThrownBy(() -> contractService.createModification(contract.id(), duplicateRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Modification number already exists");
        }
    }

    @Nested
    @DisplayName("Modification Tracking")
    class ModificationTracking {

        @Test
        @DisplayName("should retrieve all modifications for contract in order")
        void shouldRetrieveModificationsInOrder() {
            // Given
            ContractDto contract = createBaseContract("MOD-TRACK-001");

            contractService.createModification(contract.id(), new CreateModificationRequest(
                "P00001", "Mod 1", "First modification",
                ModificationType.INCREMENTAL_FUNDING, LocalDate.now(),
                null, new BigDecimal("50000.00"), null,
                null, null, null, null, null, null, null
            ));
            contractService.createModification(contract.id(), new CreateModificationRequest(
                "P00002", "Mod 2", "Second modification",
                ModificationType.BILATERAL, LocalDate.now(),
                new BigDecimal("75000.00"), null, null,
                null, null, null, null, null, null, null
            ));
            contractService.createModification(contract.id(), new CreateModificationRequest(
                "A00001", "Admin Mod", "Administrative modification",
                ModificationType.ADMINISTRATIVE, LocalDate.now(),
                null, null, null,
                null, null, null, null, null, null, null
            ));

            // When
            List<ModificationDto> modifications = contractService.getModifications(contract.id());

            // Then
            assertThat(modifications).hasSize(3);
            // Ordered by modification number descending
            assertThat(modifications.get(0).modificationNumber()).isEqualTo("P00002");
            assertThat(modifications.get(1).modificationNumber()).isEqualTo("P00001");
            assertThat(modifications.get(2).modificationNumber()).isEqualTo("A00001");
        }

        @Test
        @DisplayName("should track modification creation timestamp")
        void shouldTrackModificationCreationTimestamp() {
            // Given
            ContractDto contract = createBaseContract("MOD-TIME-001");

            // When
            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Timestamped Mod", "Modification with timestamp",
                    ModificationType.BILATERAL, LocalDate.now(),
                    new BigDecimal("10000.00"), null, null,
                    null, null, null, null, null, null, null
                ));

            // Then
            assertThat(modification.createdAt()).isNotNull();
        }

        @Test
        @DisplayName("should track modification status changes")
        void shouldTrackModificationStatusChanges() {
            // Given
            ContractDto contract = createBaseContract("MOD-STATUS-001");
            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Status Track Mod", "Modification for status tracking",
                    ModificationType.BILATERAL, LocalDate.now(),
                    new BigDecimal("50000.00"), new BigDecimal("25000.00"),
                    new BigDecimal("550000.00"),
                    null, null, null, null, null, null, null
                ));
            assertThat(modification.status()).isEqualTo(ModificationStatus.PENDING);

            // When
            ModificationDto executed = contractService.executeModification(contract.id(), modification.id());

            // Then
            assertThat(executed.status()).isEqualTo(ModificationStatus.EXECUTED);
            assertThat(executed.executedDate()).isEqualTo(LocalDate.now());
        }
    }

    @Nested
    @DisplayName("Executing Modifications")
    class ExecutingModifications {

        @Test
        @DisplayName("should update contract total value when executing modification")
        void shouldUpdateContractTotalValueWhenExecuting() {
            // Given
            ContractDto contract = createBaseContract("MOD-EXEC-001");
            BigDecimal originalTotal = contract.totalValue();
            assertThat(originalTotal).isEqualByComparingTo(new BigDecimal("500000.00"));

            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Value Change Mod", "Modification changing total value",
                    ModificationType.BILATERAL, LocalDate.now(),
                    new BigDecimal("100000.00"), null,
                    new BigDecimal("600000.00"), // new total
                    null, null, null, null, null, null, null
                ));

            // When
            contractService.executeModification(contract.id(), modification.id());

            // Then
            ContractDto updatedContract = contractService.getContract(contract.id());
            assertThat(updatedContract.totalValue()).isEqualByComparingTo(new BigDecimal("600000.00"));
        }

        @Test
        @DisplayName("should update contract funded value when executing incremental funding")
        void shouldUpdateContractFundedValue() {
            // Given
            ContractDto contract = createBaseContract("MOD-FUND-001");
            BigDecimal originalFunded = contract.fundedValue();
            assertThat(originalFunded).isEqualByComparingTo(new BigDecimal("250000.00"));

            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Funding Mod", "Incremental funding modification",
                    ModificationType.INCREMENTAL_FUNDING, LocalDate.now(),
                    null, // no value change
                    new BigDecimal("125000.00"), // funding change
                    null,
                    null, null, null, null, null, null, null
                ));

            // When
            contractService.executeModification(contract.id(), modification.id());

            // Then
            ContractDto updatedContract = contractService.getContract(contract.id());
            assertThat(updatedContract.fundedValue()).isEqualByComparingTo(new BigDecimal("375000.00"));
        }

        @Test
        @DisplayName("should update contract PoP end date when executing extension")
        void shouldUpdateContractPoPEndDate() {
            // Given
            ContractDto contract = createBaseContract("MOD-POP-001");
            LocalDate originalEndDate = contract.popEndDate();
            LocalDate newEndDate = LocalDate.now().plusYears(2);

            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "PoP Extension", "Period of performance extension",
                    ModificationType.NO_COST_EXTENSION, LocalDate.now(),
                    null, null, null,
                    365, newEndDate, null, null, null, null, null
                ));

            // When
            contractService.executeModification(contract.id(), modification.id());

            // Then
            ContractDto updatedContract = contractService.getContract(contract.id());
            assertThat(updatedContract.popEndDate()).isEqualTo(newEndDate);
            assertThat(updatedContract.popEndDate()).isAfter(originalEndDate);
        }

        @Test
        @DisplayName("should apply multiple changes in single modification execution")
        void shouldApplyMultipleChangesInSingleExecution() {
            // Given
            ContractDto contract = createBaseContract("MOD-MULTI-001");
            LocalDate newEndDate = LocalDate.now().plusYears(2);

            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Combined Mod", "Modification with multiple changes",
                    ModificationType.BILATERAL, LocalDate.now(),
                    new BigDecimal("200000.00"), // value change
                    new BigDecimal("100000.00"), // funding change
                    new BigDecimal("700000.00"), // new total
                    365, newEndDate, // PoP extension
                    "Adding new scope and extending PoP",
                    null, null, null, null
                ));

            // When
            contractService.executeModification(contract.id(), modification.id());

            // Then
            ContractDto updatedContract = contractService.getContract(contract.id());
            assertThat(updatedContract.totalValue()).isEqualByComparingTo(new BigDecimal("700000.00"));
            assertThat(updatedContract.fundedValue()).isEqualByComparingTo(new BigDecimal("350000.00")); // 250k + 100k
            assertThat(updatedContract.popEndDate()).isEqualTo(newEndDate);
        }

        @Test
        @DisplayName("should set execution date when modification is executed")
        void shouldSetExecutionDate() {
            // Given
            ContractDto contract = createBaseContract("MOD-DATE-001");
            ModificationDto modification = contractService.createModification(contract.id(),
                new CreateModificationRequest(
                    "P00001", "Date Test Mod", "Testing execution date",
                    ModificationType.ADMINISTRATIVE, LocalDate.now(),
                    null, null, null, null, null, null, null, null, null, null
                ));
            assertThat(modification.executedDate()).isNull();

            // When
            ModificationDto executed = contractService.executeModification(contract.id(), modification.id());

            // Then
            assertThat(executed.executedDate()).isEqualTo(LocalDate.now());
        }
    }

    @Nested
    @DisplayName("Modification Types and Scenarios")
    class ModificationTypesAndScenarios {

        @Test
        @DisplayName("should handle termination modification")
        void shouldHandleTerminationModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-TERM-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Partial Termination",
                "Partial termination for convenience",
                ModificationType.TERMINATION,
                LocalDate.now(),
                new BigDecimal("-100000.00"), // reduction
                null,
                new BigDecimal("400000.00"), // new reduced total
                null, null,
                "Government terminating CLIN 0002 for convenience",
                "Contracting Office",
                "John Smith",
                "Budget constraints",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.TERMINATION);
            assertThat(modification.valueChange()).isEqualByComparingTo(new BigDecimal("-100000.00"));
            assertThat(modification.newTotalValue()).isEqualByComparingTo(new BigDecimal("400000.00"));
        }

        @Test
        @DisplayName("should handle scope change modification")
        void shouldHandleScopeChangeModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-SCOPE-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Scope Change",
                "Change in contract scope",
                ModificationType.SCOPE_CHANGE,
                LocalDate.now(),
                new BigDecimal("75000.00"),
                new BigDecimal("40000.00"),
                new BigDecimal("575000.00"),
                null, null,
                "Adding cloud migration services to scope. Original SOW section 3.2 modified.",
                "IT Program Office",
                "John Smith",
                "Mission requirement change",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.SCOPE_CHANGE);
            assertThat(modification.scopeChangeSummary()).contains("cloud migration");
        }

        @Test
        @DisplayName("should handle unilateral modification")
        void shouldHandleUnilateralModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-UNILAT-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "A00001",
                "Unilateral Change",
                "Government directed change",
                ModificationType.UNILATERAL,
                LocalDate.now(),
                null, null, null,
                null, null,
                "Government directed administrative change",
                "Contracting Office",
                "John Smith",
                "Regulatory compliance requirement",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.UNILATERAL);
        }

        @Test
        @DisplayName("should handle supplemental agreement modification")
        void shouldHandleSupplementalAgreementModification() {
            // Given
            ContractDto contract = createBaseContract("MOD-SUPP-001");
            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Supplemental Funding",
                "Supplemental funding agreement",
                ModificationType.SUPPLEMENTAL,
                LocalDate.now(),
                new BigDecimal("200000.00"),
                new BigDecimal("200000.00"),
                new BigDecimal("700000.00"),
                null, null,
                null,
                "Program Office",
                "John Smith",
                "Additional funding from supplemental appropriation",
                null
            );

            // When
            ModificationDto modification = contractService.createModification(contract.id(), modRequest);

            // Then
            assertThat(modification.modificationType()).isEqualTo(ModificationType.SUPPLEMENTAL);
            assertThat(modification.valueChange()).isEqualByComparingTo(new BigDecimal("200000.00"));
            assertThat(modification.fundingChange()).isEqualByComparingTo(new BigDecimal("200000.00"));
        }
    }

    @Nested
    @DisplayName("Modification Summary Analytics")
    class ModificationSummaryAnalytics {

        @Test
        @DisplayName("should count modifications in contract summary")
        void shouldCountModificationsInSummary() {
            // Given
            ContractDto contract = createBaseContract("MOD-SUM-001");

            // Create multiple modifications
            for (int i = 1; i <= 3; i++) {
                contractService.createModification(contract.id(), new CreateModificationRequest(
                    "P0000" + i, "Mod " + i, "Modification " + i,
                    ModificationType.INCREMENTAL_FUNDING, LocalDate.now(),
                    null, new BigDecimal("10000.00"), null,
                    null, null, null, null, null, null, null
                ));
            }

            // Execute one of them
            List<ModificationDto> mods = contractService.getModifications(contract.id());
            contractService.executeModification(contract.id(), mods.get(0).id());

            // When
            var summary = contractService.getContractSummary(contract.id());

            // Then
            assertThat(summary.modificationCount()).isEqualTo(3);
            assertThat(summary.pendingModifications()).isEqualTo(2); // 2 still pending
        }
    }
}
