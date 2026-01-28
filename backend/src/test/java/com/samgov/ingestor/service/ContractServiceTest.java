package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.exception.ResourceNotFoundException;
import com.samgov.ingestor.model.Contract;
import com.samgov.ingestor.model.Contract.ContractStatus;
import com.samgov.ingestor.model.Contract.ContractType;
import com.samgov.ingestor.model.ContractClin;
import com.samgov.ingestor.model.ContractClin.ClinType;
import com.samgov.ingestor.model.ContractClin.PricingType;
import com.samgov.ingestor.model.ContractModification.ModificationStatus;
import com.samgov.ingestor.model.ContractModification.ModificationType;
import com.samgov.ingestor.model.ContractOption.OptionStatus;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.ContractRepository;
import com.samgov.ingestor.service.ContractService.ClinDto;
import com.samgov.ingestor.service.ContractService.ContractDto;
import com.samgov.ingestor.service.ContractService.CreateClinRequest;
import com.samgov.ingestor.service.ContractService.CreateContractRequest;
import com.samgov.ingestor.service.ContractService.CreateModificationRequest;
import com.samgov.ingestor.service.ContractService.CreateOptionRequest;
import com.samgov.ingestor.service.ContractService.ModificationDto;
import com.samgov.ingestor.service.ContractService.OptionDto;
import com.samgov.ingestor.service.ContractService.UpdateContractRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Behavioral tests for ContractService.
 *
 * Tests focus on contract lifecycle behaviors:
 * - CRUD operations
 * - Contract hierarchy (IDIQ -> Task Orders)
 * - Status transitions
 * - Period of performance validation
 * - Multi-tenant isolation
 */
@DisplayName("ContractService")
class ContractServiceTest extends BaseServiceTest {

    @Autowired
    private ContractService contractService;

    @Autowired
    private ContractRepository contractRepository;

    private CreateContractRequest createDefaultContractRequest(String contractNumber) {
        return new CreateContractRequest(
            contractNumber,
            "Test Contract " + contractNumber,
            "Test contract description",
            ContractType.FIRM_FIXED_PRICE,
            null, // parentContractId
            null, // opportunityId
            "Department of Defense",
            "DOD",
            "Army",
            "Contracting Office",
            LocalDate.now(),
            LocalDate.now().plusYears(1),
            LocalDate.now().plusMonths(6),
            LocalDate.now().plusYears(3),
            new BigDecimal("500000.00"),
            new BigDecimal("500000.00"),
            new BigDecimal("1000000.00"),
            new BigDecimal("250000.00"),
            "541512",
            "R425",
            "Washington",
            "DC",
            "USA",
            "John Smith",
            "john.smith@agency.gov",
            "202-555-1234",
            "Jane Doe",
            "jane.doe@agency.gov",
            "202-555-5678",
            null, // primeContractor
            false, // isSubcontract
            "GSA Schedule",
            "8(a)",
            new BigDecimal("23.00"),
            false, // requiresClearance
            null, // clearanceLevel
            null, // programManagerId
            null, // contractManagerId
            LocalDate.now().minusDays(30),
            "Internal test notes"
        );
    }

    @Nested
    @DisplayName("Contract CRUD Operations")
    class ContractCrudOperations {

        @Test
        @DisplayName("should create a new contract successfully")
        void shouldCreateContractSuccessfully() {
            // Given
            CreateContractRequest request = createDefaultContractRequest("W912AB-24-C-0001");

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isNotNull();
            assertThat(result.contractNumber()).isEqualTo("W912AB-24-C-0001");
            assertThat(result.title()).isEqualTo("Test Contract W912AB-24-C-0001");
            assertThat(result.contractType()).isEqualTo(ContractType.FIRM_FIXED_PRICE);
            assertThat(result.status()).isEqualTo(ContractStatus.ACTIVE);
            assertThat(result.agency()).isEqualTo("Department of Defense");
            assertThat(result.totalValue()).isEqualByComparingTo(new BigDecimal("500000.00"));
        }

        @Test
        @DisplayName("should reject duplicate contract numbers within same tenant")
        void shouldRejectDuplicateContractNumber() {
            // Given
            String contractNumber = "DUP-2024-0001";
            contractService.createContract(createDefaultContractRequest(contractNumber));

            // When/Then
            assertThatThrownBy(() -> contractService.createContract(createDefaultContractRequest(contractNumber)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Contract number already exists");
        }

        @Test
        @DisplayName("should retrieve contract by ID")
        void shouldRetrieveContractById() {
            // Given
            ContractDto created = contractService.createContract(createDefaultContractRequest("GET-2024-0001"));

            // When
            ContractDto result = contractService.getContract(created.id());

            // Then
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(created.id());
            assertThat(result.contractNumber()).isEqualTo("GET-2024-0001");
        }

        @Test
        @DisplayName("should throw ResourceNotFoundException for non-existent contract")
        void shouldThrowExceptionForNonExistentContract() {
            // Given
            UUID nonExistentId = UUID.randomUUID();

            // When/Then
            assertThatThrownBy(() -> contractService.getContract(nonExistentId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Contract not found");
        }

        @Test
        @DisplayName("should update contract successfully")
        void shouldUpdateContractSuccessfully() {
            // Given
            ContractDto created = contractService.createContract(createDefaultContractRequest("UPD-2024-0001"));
            UpdateContractRequest updateRequest = new UpdateContractRequest(
                "Updated Title",
                "Updated description",
                ContractStatus.ON_HOLD,
                "Department of Navy",
                LocalDate.now().plusDays(10),
                LocalDate.now().plusYears(2),
                new BigDecimal("750000.00"),
                new BigDecimal("400000.00"),
                "Jane Williams",
                "jane.williams@navy.gov",
                "Bob Brown",
                "bob.brown@navy.gov",
                null, // programManagerId
                null, // contractManagerId
                "Updated notes"
            );

            // When
            ContractDto result = contractService.updateContract(created.id(), updateRequest);

            // Then
            assertThat(result.title()).isEqualTo("Updated Title");
            assertThat(result.description()).isEqualTo("Updated description");
            assertThat(result.status()).isEqualTo(ContractStatus.ON_HOLD);
            assertThat(result.agency()).isEqualTo("Department of Navy");
            assertThat(result.totalValue()).isEqualByComparingTo(new BigDecimal("750000.00"));
        }

        @Test
        @DisplayName("should update contract status")
        void shouldUpdateContractStatus() {
            // Given
            ContractDto created = contractService.createContract(createDefaultContractRequest("STS-2024-0001"));
            assertThat(created.status()).isEqualTo(ContractStatus.ACTIVE);

            // When
            contractService.updateContractStatus(created.id(), ContractStatus.COMPLETED);

            // Then
            ContractDto result = contractService.getContract(created.id());
            assertThat(result.status()).isEqualTo(ContractStatus.COMPLETED);
        }

        @Test
        @DisplayName("should list contracts with pagination")
        void shouldListContractsWithPagination() {
            // Given
            for (int i = 1; i <= 5; i++) {
                contractService.createContract(createDefaultContractRequest("LIST-2024-000" + i));
            }

            // When
            Page<ContractDto> page = contractService.getContracts(PageRequest.of(0, 3));

            // Then
            assertThat(page.getContent()).hasSize(3);
            assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(5);
            assertThat(page.getTotalPages()).isGreaterThanOrEqualTo(2);
        }

        @Test
        @DisplayName("should search contracts by keyword")
        void shouldSearchContractsByKeyword() {
            // Given
            CreateContractRequest request = new CreateContractRequest(
                "SEARCH-2024-0001",
                "Cybersecurity Assessment Services",
                "Comprehensive security testing and vulnerability assessment",
                ContractType.TIME_AND_MATERIALS,
                null, null, "DHS", "DHS", null, null,
                LocalDate.now(), LocalDate.now().plusYears(1),
                null, null,
                new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                LocalDate.now(), null
            );
            contractService.createContract(request);

            // When
            Page<ContractDto> results = contractService.searchContracts("Cybersecurity", PageRequest.of(0, 10));

            // Then
            assertThat(results.getContent()).isNotEmpty();
            assertThat(results.getContent().get(0).title()).containsIgnoringCase("Cybersecurity");
        }
    }

    @Nested
    @DisplayName("Contract Hierarchy (IDIQ -> Task Orders)")
    class ContractHierarchy {

        @Test
        @DisplayName("should create IDIQ contract as parent")
        void shouldCreateIdiqContractAsParent() {
            // Given
            CreateContractRequest idiqRequest = new CreateContractRequest(
                "FA8732-24-D-0001",
                "IT Services IDIQ",
                "Indefinite Delivery Indefinite Quantity contract for IT services",
                ContractType.INDEFINITE_DELIVERY,
                null, null,
                "Department of Air Force",
                "USAF",
                null, null,
                LocalDate.now(), LocalDate.now().plusYears(5),
                LocalDate.now().plusYears(1), LocalDate.now().plusYears(5),
                new BigDecimal("1000000.00"),
                new BigDecimal("10000000.00"), // ceiling
                new BigDecimal("10000000.00"),
                new BigDecimal("0.00"), // no initial funding
                "541512", "D302",
                null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When
            ContractDto idiq = contractService.createContract(idiqRequest);

            // Then
            assertThat(idiq).isNotNull();
            assertThat(idiq.contractType()).isEqualTo(ContractType.INDEFINITE_DELIVERY);
            assertThat(idiq.ceilingValue()).isEqualByComparingTo(new BigDecimal("10000000.00"));
        }

        @Test
        @DisplayName("should create task order under IDIQ parent")
        void shouldCreateTaskOrderUnderIdiq() {
            // Given - Create IDIQ first
            CreateContractRequest idiqRequest = new CreateContractRequest(
                "FA8732-24-D-0002",
                "IT Services IDIQ",
                "Parent IDIQ contract",
                ContractType.INDEFINITE_DELIVERY,
                null, null,
                "USAF", "USAF", null, null,
                LocalDate.now(), LocalDate.now().plusYears(5),
                null, null,
                new BigDecimal("0.00"), new BigDecimal("50000000.00"),
                new BigDecimal("50000000.00"), new BigDecimal("0.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );
            ContractDto idiq = contractService.createContract(idiqRequest);

            // When - Create Task Order under IDIQ
            CreateContractRequest taskOrderRequest = new CreateContractRequest(
                "FA8732-24-F-0001",
                "Network Security Assessment - Task Order 1",
                "First task order under IT Services IDIQ",
                ContractType.TASK_ORDER,
                idiq.id(), // parent contract ID
                null,
                "USAF", "USAF", null, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                null, null,
                new BigDecimal("150000.00"), new BigDecimal("150000.00"),
                null, new BigDecimal("75000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );
            ContractDto taskOrder = contractService.createContract(taskOrderRequest);

            // Then
            assertThat(taskOrder).isNotNull();
            assertThat(taskOrder.contractType()).isEqualTo(ContractType.TASK_ORDER);
            assertThat(taskOrder.parentContractId()).isEqualTo(idiq.id());
        }

        @Test
        @DisplayName("should fail when parent contract does not exist")
        void shouldFailWhenParentContractNotFound() {
            // Given
            UUID nonExistentParentId = UUID.randomUUID();
            CreateContractRequest taskOrderRequest = new CreateContractRequest(
                "FA8732-24-F-9999",
                "Orphan Task Order",
                "Task order with non-existent parent",
                ContractType.TASK_ORDER,
                nonExistentParentId,
                null,
                "USAF", "USAF", null, null,
                LocalDate.now(), LocalDate.now().plusMonths(6),
                null, null,
                new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                null, new BigDecimal("50000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When/Then
            assertThatThrownBy(() -> contractService.createContract(taskOrderRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Parent contract not found");
        }
    }

    @Nested
    @DisplayName("Contract Types")
    class ContractTypes {

        @Test
        @DisplayName("should create Firm Fixed Price (FFP) contract")
        void shouldCreateFfpContract() {
            // Given
            CreateContractRequest request = createDefaultContractRequest("FFP-2024-0001");

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result.contractType()).isEqualTo(ContractType.FIRM_FIXED_PRICE);
        }

        @Test
        @DisplayName("should create Time and Materials (T&M) contract")
        void shouldCreateTmContract() {
            // Given
            CreateContractRequest request = new CreateContractRequest(
                "TM-2024-0001",
                "Software Development T&M",
                "Time and materials contract for software development",
                ContractType.TIME_AND_MATERIALS,
                null, null,
                "GSA", "GSA", null, null,
                LocalDate.now(), LocalDate.now().plusYears(1),
                null, null,
                new BigDecimal("0.00"), // no base for T&M
                new BigDecimal("500000.00"), // ceiling
                new BigDecimal("500000.00"),
                new BigDecimal("100000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result.contractType()).isEqualTo(ContractType.TIME_AND_MATERIALS);
        }

        @Test
        @DisplayName("should create Cost Plus Fixed Fee (CPFF) contract")
        void shouldCreateCpffContract() {
            // Given
            CreateContractRequest request = new CreateContractRequest(
                "CPFF-2024-0001",
                "R&D Cost Plus Fixed Fee",
                "Research and development cost reimbursement contract",
                ContractType.COST_PLUS_FIXED_FEE,
                null, null,
                "NASA", "NASA", null, null,
                LocalDate.now(), LocalDate.now().plusYears(3),
                null, null,
                new BigDecimal("2000000.00"),
                new BigDecimal("2200000.00"), // includes fee
                null, new BigDecimal("500000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, true, "SECRET",
                null, null, LocalDate.now(), null
            );

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result.contractType()).isEqualTo(ContractType.COST_PLUS_FIXED_FEE);
            assertThat(result.requiresClearance()).isTrue();
            assertThat(result.clearanceLevel()).isEqualTo("SECRET");
        }

        @Test
        @DisplayName("should create Blanket Purchase Agreement (BPA)")
        void shouldCreateBpa() {
            // Given
            CreateContractRequest request = new CreateContractRequest(
                "BPA-2024-0001",
                "Office Supplies BPA",
                "Blanket purchase agreement for office supplies",
                ContractType.BLANKET_PURCHASE_AGREEMENT,
                null, null,
                "GSA", "GSA", null, null,
                LocalDate.now(), LocalDate.now().plusYears(5),
                null, null,
                new BigDecimal("0.00"),
                new BigDecimal("100000.00"),
                new BigDecimal("100000.00"),
                new BigDecimal("0.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, "GSA Advantage", "8(a)", null, false, null,
                null, null, LocalDate.now(), null
            );

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result.contractType()).isEqualTo(ContractType.BLANKET_PURCHASE_AGREEMENT);
            assertThat(result.contractVehicle()).isEqualTo("GSA Advantage");
        }
    }

    @Nested
    @DisplayName("Status Transitions")
    class StatusTransitions {

        @Test
        @DisplayName("should transition from ACTIVE to ON_HOLD")
        void shouldTransitionActiveToOnHold() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("STAT-2024-0001"));
            assertThat(contract.status()).isEqualTo(ContractStatus.ACTIVE);

            // When
            contractService.updateContractStatus(contract.id(), ContractStatus.ON_HOLD);

            // Then
            ContractDto updated = contractService.getContract(contract.id());
            assertThat(updated.status()).isEqualTo(ContractStatus.ON_HOLD);
        }

        @Test
        @DisplayName("should transition from ACTIVE to COMPLETED")
        void shouldTransitionActiveToCompleted() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("STAT-2024-0002"));

            // When
            contractService.updateContractStatus(contract.id(), ContractStatus.COMPLETED);

            // Then
            ContractDto updated = contractService.getContract(contract.id());
            assertThat(updated.status()).isEqualTo(ContractStatus.COMPLETED);
        }

        @Test
        @DisplayName("should transition from ACTIVE to TERMINATED")
        void shouldTransitionActiveToTerminated() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("STAT-2024-0003"));

            // When
            contractService.updateContractStatus(contract.id(), ContractStatus.TERMINATED);

            // Then
            ContractDto updated = contractService.getContract(contract.id());
            assertThat(updated.status()).isEqualTo(ContractStatus.TERMINATED);
        }

        @Test
        @DisplayName("should transition through multiple states")
        void shouldTransitionThroughMultipleStates() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("STAT-2024-0004"));

            // When - Transition through multiple states
            contractService.updateContractStatus(contract.id(), ContractStatus.ON_HOLD);
            ContractDto afterOnHold = contractService.getContract(contract.id());
            assertThat(afterOnHold.status()).isEqualTo(ContractStatus.ON_HOLD);

            contractService.updateContractStatus(contract.id(), ContractStatus.ACTIVE);
            ContractDto afterReactivate = contractService.getContract(contract.id());
            assertThat(afterReactivate.status()).isEqualTo(ContractStatus.ACTIVE);

            contractService.updateContractStatus(contract.id(), ContractStatus.COMPLETED);
            ContractDto afterComplete = contractService.getContract(contract.id());
            assertThat(afterComplete.status()).isEqualTo(ContractStatus.COMPLETED);

            contractService.updateContractStatus(contract.id(), ContractStatus.CLOSED);
            ContractDto afterClose = contractService.getContract(contract.id());
            assertThat(afterClose.status()).isEqualTo(ContractStatus.CLOSED);
        }
    }

    @Nested
    @DisplayName("Period of Performance")
    class PeriodOfPerformance {

        @Test
        @DisplayName("should track period of performance dates")
        void shouldTrackPeriodOfPerformanceDates() {
            // Given
            LocalDate popStart = LocalDate.now();
            LocalDate popEnd = LocalDate.now().plusYears(1);
            LocalDate basePeriodEnd = LocalDate.now().plusMonths(6);
            LocalDate finalOptionEnd = LocalDate.now().plusYears(3);

            CreateContractRequest request = new CreateContractRequest(
                "POP-2024-0001",
                "Period of Performance Test",
                "Testing PoP date tracking",
                ContractType.FIRM_FIXED_PRICE,
                null, null,
                "DOD", "DOD", null, null,
                popStart, popEnd, basePeriodEnd, finalOptionEnd,
                new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                null, new BigDecimal("50000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, LocalDate.now(), null
            );

            // When
            ContractDto result = contractService.createContract(request);

            // Then
            assertThat(result.popStartDate()).isEqualTo(popStart);
            assertThat(result.popEndDate()).isEqualTo(popEnd);
            assertThat(result.basePeriodEndDate()).isEqualTo(basePeriodEnd);
            assertThat(result.finalOptionEndDate()).isEqualTo(finalOptionEnd);
        }

        @Test
        @DisplayName("should find expiring contracts")
        void shouldFindExpiringContracts() {
            // Given - Create contracts with different expiration dates
            LocalDate today = LocalDate.now();

            // Contract expiring in 30 days
            CreateContractRequest expiringSoon = new CreateContractRequest(
                "EXP-2024-0001",
                "Expiring Soon Contract",
                "Contract expiring within 90 days",
                ContractType.FIRM_FIXED_PRICE,
                null, null,
                "DOD", "DOD", null, null,
                today.minusMonths(11), today.plusDays(30), // expires in 30 days
                null, null,
                new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                null, new BigDecimal("50000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, today.minusMonths(11), null
            );
            contractService.createContract(expiringSoon);

            // Contract expiring in 1 year (not expiring soon)
            CreateContractRequest notExpiring = new CreateContractRequest(
                "EXP-2024-0002",
                "Not Expiring Soon",
                "Contract expiring beyond threshold",
                ContractType.FIRM_FIXED_PRICE,
                null, null,
                "DOD", "DOD", null, null,
                today, today.plusYears(1),
                null, null,
                new BigDecimal("100000.00"), new BigDecimal("100000.00"),
                null, new BigDecimal("50000.00"),
                null, null, null, null, null,
                null, null, null, null, null, null,
                null, false, null, null, null, false, null,
                null, null, today, null
            );
            contractService.createContract(notExpiring);

            // When
            List<ContractDto> expiringContracts = contractService.getExpiringContracts(90);

            // Then
            assertThat(expiringContracts).isNotEmpty();
            assertThat(expiringContracts)
                .extracting(ContractDto::contractNumber)
                .contains("EXP-2024-0001");
        }

        @Test
        @DisplayName("should update period of performance dates via modification")
        void shouldUpdatePoPViaModification() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("POP-MOD-2024-0001"));
            LocalDate newPopEnd = LocalDate.now().plusYears(2);

            CreateModificationRequest modRequest = new CreateModificationRequest(
                "P00001",
                "Period of Performance Extension",
                "Extending PoP by 12 months",
                ModificationType.NO_COST_EXTENSION,
                LocalDate.now(),
                null, // no value change
                null, // no funding change
                null,
                365, // extension days
                newPopEnd,
                null,
                "Program Office",
                "John Smith",
                "Mission requirement extension",
                null
            );

            // When
            contractService.createModification(contract.id(), modRequest);
            ModificationDto mod = contractService.getModifications(contract.id()).get(0);
            contractService.executeModification(contract.id(), mod.id());

            // Then
            ContractDto updated = contractService.getContract(contract.id());
            assertThat(updated.popEndDate()).isEqualTo(newPopEnd);
        }
    }

    @Nested
    @DisplayName("Multi-Tenant Isolation")
    class MultiTenantIsolation {

        private Tenant tenant2;
        private User user2;

        @BeforeEach
        void setUpSecondTenant() {
            // Create second tenant
            tenant2 = Tenant.builder()
                .name("Second Tenant")
                .slug("second-tenant-" + UUID.randomUUID().toString().substring(0, 8))
                .build();
            tenant2 = tenantRepository.save(tenant2);

            // Create second user
            user2 = User.builder()
                .email("user2-" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("$2a$10$test.hash.for.testing.only")
                .firstName("Second")
                .lastName("User")
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();
            user2 = userRepository.save(user2);

            // Create role and membership for tenant2
            Role role2 = createTestRole(tenant2, Role.USER);
            TenantMembership membership2 = TenantMembership.builder()
                .user(user2)
                .tenant(tenant2)
                .role(role2)
                .isDefault(true)
                .acceptedAt(Instant.now())
                .build();
            tenantMembershipRepository.save(membership2);
        }

        @Test
        @DisplayName("should isolate contracts between tenants")
        void shouldIsolateContractsBetweenTenants() {
            // Given - Create contract in tenant 1
            ContractDto tenant1Contract = contractService.createContract(createDefaultContractRequest("ISO-2024-0001"));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // Create contract in tenant 2
            ContractDto tenant2Contract = contractService.createContract(createDefaultContractRequest("ISO-2024-0002"));

            // Then - Each tenant should only see their own contracts
            Page<ContractDto> tenant2Contracts = contractService.getContracts(PageRequest.of(0, 100));
            assertThat(tenant2Contracts.getContent())
                .extracting(ContractDto::contractNumber)
                .contains("ISO-2024-0002")
                .doesNotContain("ISO-2024-0001");

            // Switch back to tenant 1
            switchTenant(testTenant);
            TenantContext.setCurrentUserId(testUser.getId());

            Page<ContractDto> tenant1Contracts = contractService.getContracts(PageRequest.of(0, 100));
            assertThat(tenant1Contracts.getContent())
                .extracting(ContractDto::contractNumber)
                .contains("ISO-2024-0001")
                .doesNotContain("ISO-2024-0002");
        }

        @Test
        @DisplayName("should not allow access to other tenant's contract by ID")
        void shouldNotAllowCrossTenantAccessById() {
            // Given - Create contract in tenant 1
            ContractDto tenant1Contract = contractService.createContract(createDefaultContractRequest("CROSS-2024-0001"));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When/Then - Attempting to access tenant 1's contract should fail
            assertThatThrownBy(() -> contractService.getContract(tenant1Contract.id()))
                .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("should allow same contract number in different tenants")
        void shouldAllowSameContractNumberInDifferentTenants() {
            // Given - Create contract in tenant 1
            String sameContractNumber = "SAME-2024-0001";
            ContractDto tenant1Contract = contractService.createContract(createDefaultContractRequest(sameContractNumber));

            // Switch to tenant 2
            switchTenant(tenant2);
            TenantContext.setCurrentUserId(user2.getId());

            // When - Create contract with same number in tenant 2
            ContractDto tenant2Contract = contractService.createContract(createDefaultContractRequest(sameContractNumber));

            // Then - Both should exist with different IDs
            assertThat(tenant2Contract.contractNumber()).isEqualTo(sameContractNumber);
            assertThat(tenant2Contract.id()).isNotEqualTo(tenant1Contract.id());
        }
    }

    @Nested
    @DisplayName("CLIN Management")
    class ClinManagement {

        @Test
        @DisplayName("should add CLIN to contract")
        void shouldAddClinToContract() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("CLIN-2024-0001"));
            CreateClinRequest clinRequest = new CreateClinRequest(
                "0001",
                "Base Year Services",
                ClinType.BASE,
                PricingType.FIRM_FIXED_PRICE,
                "Month",
                new BigDecimal("12"),
                new BigDecimal("10000.00"),
                new BigDecimal("120000.00"),
                new BigDecimal("60000.00"),
                "541512",
                "R425",
                false,
                null,
                "Base year CLIN"
            );

            // When
            ClinDto clin = contractService.addClin(contract.id(), clinRequest);

            // Then
            assertThat(clin).isNotNull();
            assertThat(clin.id()).isNotNull();
            assertThat(clin.clinNumber()).isEqualTo("0001");
            assertThat(clin.clinType()).isEqualTo(ClinType.BASE);
            assertThat(clin.totalValue()).isEqualByComparingTo(new BigDecimal("120000.00"));
        }

        @Test
        @DisplayName("should retrieve CLINs for contract in order")
        void shouldRetrieveClinsInOrder() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("CLIN-2024-0002"));

            // Add multiple CLINs
            contractService.addClin(contract.id(), new CreateClinRequest(
                "0002", "Second CLIN", ClinType.SERVICES, PricingType.TIME_AND_MATERIALS,
                "Hour", new BigDecimal("100"), new BigDecimal("150.00"), new BigDecimal("15000.00"),
                new BigDecimal("7500.00"), null, null, false, null, null
            ));
            contractService.addClin(contract.id(), new CreateClinRequest(
                "0001", "First CLIN", ClinType.BASE, PricingType.FIRM_FIXED_PRICE,
                "Lot", new BigDecimal("1"), new BigDecimal("50000.00"), new BigDecimal("50000.00"),
                new BigDecimal("25000.00"), null, null, false, null, null
            ));
            contractService.addClin(contract.id(), new CreateClinRequest(
                "1001", "Option Year 1", ClinType.OPTION, PricingType.FIRM_FIXED_PRICE,
                "Lot", new BigDecimal("1"), new BigDecimal("55000.00"), new BigDecimal("55000.00"),
                new BigDecimal("0.00"), null, null, true, 1, "Option year 1"
            ));

            // When
            List<ClinDto> clins = contractService.getClins(contract.id());

            // Then
            assertThat(clins).hasSize(3);
            // CLINs should be ordered by sort order (order of addition)
            assertThat(clins.get(0).clinNumber()).isEqualTo("0002");
            assertThat(clins.get(1).clinNumber()).isEqualTo("0001");
            assertThat(clins.get(2).clinNumber()).isEqualTo("1001");
        }

        @Test
        @DisplayName("should reject duplicate CLIN numbers within same contract")
        void shouldRejectDuplicateClinNumber() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("CLIN-2024-0003"));
            contractService.addClin(contract.id(), new CreateClinRequest(
                "0001", "First CLIN", ClinType.BASE, PricingType.FIRM_FIXED_PRICE,
                "Lot", new BigDecimal("1"), new BigDecimal("50000.00"), new BigDecimal("50000.00"),
                new BigDecimal("25000.00"), null, null, false, null, null
            ));

            // When/Then
            assertThatThrownBy(() -> contractService.addClin(contract.id(), new CreateClinRequest(
                "0001", "Duplicate CLIN", ClinType.BASE, PricingType.FIRM_FIXED_PRICE,
                "Lot", new BigDecimal("1"), new BigDecimal("50000.00"), new BigDecimal("50000.00"),
                new BigDecimal("25000.00"), null, null, false, null, null
            ))).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CLIN number already exists");
        }

        @Test
        @DisplayName("should calculate remaining funds for CLIN")
        void shouldCalculateRemainingFundsForClin() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("CLIN-2024-0004"));
            contractService.addClin(contract.id(), new CreateClinRequest(
                "0001", "Services CLIN", ClinType.SERVICES, PricingType.TIME_AND_MATERIALS,
                "Hour", new BigDecimal("1000"), new BigDecimal("100.00"), new BigDecimal("100000.00"),
                new BigDecimal("50000.00"), null, null, false, null, null
            ));

            List<ClinDto> clins = contractService.getClins(contract.id());
            ClinDto clin = clins.get(0);

            // When - Update with invoiced amount
            contractService.updateClin(contract.id(), clin.id(),
                new ContractService.UpdateClinRequest(null, null, null, new BigDecimal("15000.00"), null));

            // Then
            List<ClinDto> updatedClins = contractService.getClins(contract.id());
            ClinDto updatedClin = updatedClins.get(0);
            assertThat(updatedClin.fundedAmount()).isEqualByComparingTo(new BigDecimal("50000.00"));
            assertThat(updatedClin.invoicedAmount()).isEqualByComparingTo(new BigDecimal("15000.00"));
            assertThat(updatedClin.remainingFunds()).isEqualByComparingTo(new BigDecimal("35000.00"));
        }
    }

    @Nested
    @DisplayName("Options Management")
    class OptionsManagement {

        @Test
        @DisplayName("should add option to contract")
        void shouldAddOptionToContract() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("OPT-2024-0001"));
            CreateOptionRequest optionRequest = new CreateOptionRequest(
                1, // optionNumber
                2, // optionYear
                "Option Year 1",
                LocalDate.now().plusYears(1),
                LocalDate.now().plusYears(2),
                LocalDate.now().plusMonths(10), // exercise deadline
                new BigDecimal("150000.00"),
                12, // duration months
                "First option year"
            );

            // When
            OptionDto option = contractService.addOption(contract.id(), optionRequest);

            // Then
            assertThat(option).isNotNull();
            assertThat(option.optionNumber()).isEqualTo(1);
            assertThat(option.optionYear()).isEqualTo(2);
            assertThat(option.status()).isEqualTo(OptionStatus.PENDING);
            assertThat(option.optionValue()).isEqualByComparingTo(new BigDecimal("150000.00"));
        }

        @Test
        @DisplayName("should exercise option and update contract")
        void shouldExerciseOptionAndUpdateContract() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("OPT-2024-0002"));
            OptionDto option = contractService.addOption(contract.id(), new CreateOptionRequest(
                1, 2, "Option Year 1",
                LocalDate.now().plusYears(1),
                LocalDate.now().plusYears(2),
                LocalDate.now().plusMonths(10),
                new BigDecimal("150000.00"),
                12, null
            ));

            // When
            OptionDto exercisedOption = contractService.exerciseOption(contract.id(), option.id(), "P00001");

            // Then
            assertThat(exercisedOption.status()).isEqualTo(OptionStatus.EXERCISED);
            assertThat(exercisedOption.exercisedDate()).isEqualTo(LocalDate.now());
            assertThat(exercisedOption.exerciseModificationNumber()).isEqualTo("P00001");

            // Contract should have updated total value
            ContractDto updatedContract = contractService.getContract(contract.id());
            assertThat(updatedContract.totalValue())
                .isEqualByComparingTo(new BigDecimal("650000.00")); // 500k + 150k option
        }

        @Test
        @DisplayName("should track approaching option deadlines")
        void shouldTrackApproachingOptionDeadlines() {
            // Given
            ContractDto contract = contractService.createContract(createDefaultContractRequest("OPT-2024-0003"));

            // Option with deadline in 30 days
            contractService.addOption(contract.id(), new CreateOptionRequest(
                1, 2, "Option expiring soon",
                LocalDate.now().plusYears(1),
                LocalDate.now().plusYears(2),
                LocalDate.now().plusDays(30), // approaching deadline
                new BigDecimal("100000.00"),
                12, null
            ));

            // Option with deadline in 1 year
            contractService.addOption(contract.id(), new CreateOptionRequest(
                2, 3, "Option not expiring soon",
                LocalDate.now().plusYears(2),
                LocalDate.now().plusYears(3),
                LocalDate.now().plusYears(1),
                new BigDecimal("100000.00"),
                12, null
            ));

            // When
            List<OptionDto> approachingDeadlines = contractService.getApproachingOptionDeadlines(60);

            // Then
            assertThat(approachingDeadlines).isNotEmpty();
            assertThat(approachingDeadlines)
                .extracting(OptionDto::description)
                .contains("Option expiring soon");
        }
    }
}
