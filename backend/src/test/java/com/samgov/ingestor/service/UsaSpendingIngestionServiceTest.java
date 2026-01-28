package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.client.UsaSpendingApiClient;
import com.samgov.ingestor.config.UsaSpendingProperties;
import com.samgov.ingestor.dto.UsaSpendingAwardDto;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.DataSource;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Service layer tests for UsaSpendingIngestionService.
 * Tests ingestion logic, upsert pattern, and data mapping.
 */
class UsaSpendingIngestionServiceTest extends BaseServiceTest {

    @Autowired
    private UsaSpendingIngestionService usaSpendingIngestionService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @MockBean
    private UsaSpendingApiClient usaSpendingApiClient;

    @Autowired
    private UsaSpendingProperties usaSpendingProperties;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Ingest Recent Awards")
    class IngestRecentAwards {

        @Test
        @DisplayName("should create new opportunity from USAspending award")
        void shouldCreateNewOpportunityFromAward() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(List.of(createTestAwardDto("AWARD-001")));

            // When
            var result = usaSpendingIngestionService.ingestRecentAwards();

            // Then
            assertThat(result.newRecords()).isEqualTo(1);
            assertThat(result.updatedRecords()).isEqualTo(0);

            List<Opportunity> opportunities = opportunityRepository.findAll();
            assertThat(opportunities).hasSize(1);

            Opportunity opp = opportunities.get(0);
            assertThat(opp.getSolicitationNumber()).contains("USASPEND-AWARD-001");
            assertThat(opp.getDataSource()).isEqualTo(DataSource.USA_SPENDING);
            assertThat(opp.getAwardAmount()).isEqualTo(new BigDecimal("1000000.00"));
        }

        @Test
        @DisplayName("should update existing opportunity on re-ingestion")
        void shouldUpdateExistingOpportunity() {
            // Given - Create existing opportunity
            Opportunity existing = Opportunity.builder()
                .id("existing-id")
                .solicitationNumber("USASPEND-AWARD-002")
                .title("Old Title")
                .dataSource(DataSource.USA_SPENDING)
                .status(OpportunityStatus.AWARDED)
                .build();
            opportunityRepository.save(existing);

            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(List.of(createTestAwardDto("AWARD-002")));

            // When
            var result = usaSpendingIngestionService.ingestRecentAwards();

            // Then
            assertThat(result.newRecords()).isEqualTo(0);
            assertThat(result.updatedRecords()).isEqualTo(1);

            List<Opportunity> opportunities = opportunityRepository.findAll();
            assertThat(opportunities).hasSize(1);

            Opportunity updated = opportunities.get(0);
            assertThat(updated.getId()).isEqualTo("existing-id");
            assertThat(updated.getAgency()).isEqualTo("Test Agency");
        }

        @Test
        @DisplayName("should return zero counts when integration is disabled")
        void shouldReturnZeroWhenDisabled() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(false);

            // When
            var result = usaSpendingIngestionService.ingestRecentAwards();

            // Then
            assertThat(result.newRecords()).isEqualTo(0);
            assertThat(result.updatedRecords()).isEqualTo(0);
        }

        @Test
        @DisplayName("should handle empty API response")
        void shouldHandleEmptyResponse() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(Collections.emptyList());

            // When
            var result = usaSpendingIngestionService.ingestRecentAwards();

            // Then
            assertThat(result.newRecords()).isEqualTo(0);
            assertThat(opportunityRepository.findAll()).isEmpty();
        }

        @Test
        @DisplayName("should skip awards with null ID")
        void shouldSkipAwardsWithNullId() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(List.of(createTestAwardDto(null)));

            // When
            var result = usaSpendingIngestionService.ingestRecentAwards();

            // Then
            assertThat(result.skippedRecords()).isEqualTo(1);
            assertThat(result.newRecords()).isEqualTo(0);
        }
    }

    @Nested
    @DisplayName("Ingest By NAICS")
    class IngestByNaics {

        @Test
        @DisplayName("should ingest awards for specific NAICS code")
        void shouldIngestByNaics() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards("541511", null))
                .thenReturn(List.of(
                    createTestAwardDto("AWARD-N1"),
                    createTestAwardDto("AWARD-N2")
                ));

            // When
            var result = usaSpendingIngestionService.ingestByNaics("541511");

            // Then
            assertThat(result.newRecords()).isEqualTo(2);
            assertThat(opportunityRepository.findAll()).hasSize(2);
        }
    }

    @Nested
    @DisplayName("Ingest By Agency")
    class IngestByAgency {

        @Test
        @DisplayName("should ingest awards for specific agency")
        void shouldIngestByAgency() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(null, "DOD"))
                .thenReturn(List.of(createTestAwardDto("AWARD-A1")));

            // When
            var result = usaSpendingIngestionService.ingestByAgency("DOD");

            // Then
            assertThat(result.newRecords()).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Data Mapping")
    class DataMapping {

        @Test
        @DisplayName("should correctly map DTO fields to Opportunity entity")
        void shouldMapDtoFieldsCorrectly() {
            // Given
            UsaSpendingAwardDto dto = new UsaSpendingAwardDto(
                "AWARD-MAP-001",          // awardId
                "Acme Corporation",        // recipientName
                "RECIP-123",              // recipientId
                "2024-01-15",             // startDate
                "2025-01-15",             // endDate
                new BigDecimal("2500000.00"), // awardAmount
                new BigDecimal("500000.00"),  // totalOutlays
                "IT modernization services", // description
                null,                      // defCodes
                null,                      // covidObligations
                null,                      // covidOutlays
                null,                      // infrastructureObligations
                null,                      // infrastructureOutlays
                "Department of Defense",  // awardingAgency
                "DISA",                   // awardingSubAgency
                "Definitive Contract",    // contractAwardType
                "UEI123456",              // recipientUei
                null,                      // primeAwardRecipientId
                "Washington",             // popCity
                "DC",                     // popState
                "20301",                  // popZip
                "USA",                    // popCountry
                "541511",                 // naicsCode
                "Custom Programming",     // naicsDescription
                "D302",                   // pscCode
                "IT Services",            // pscDescription
                null,                      // parentAwardId
                "Definitive Contract",    // awardType
                "INT-001",                // internalId
                "2024-06-01"              // lastModifiedDate
            );

            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(List.of(dto));

            // When
            usaSpendingIngestionService.ingestRecentAwards();

            // Then
            Opportunity opp = opportunityRepository.findAll().get(0);

            // Verify mapping
            assertThat(opp.getTitle()).contains("Acme Corporation");
            assertThat(opp.getDescription()).isEqualTo("IT modernization services");
            assertThat(opp.getAgency()).isEqualTo("Department of Defense");
            assertThat(opp.getSubAgency()).isEqualTo("DISA");
            assertThat(opp.getAwardAmount()).isEqualByComparingTo(new BigDecimal("2500000.00"));
            assertThat(opp.getIncumbentContractor()).isEqualTo("Acme Corporation");
            assertThat(opp.getNaicsCode()).isEqualTo("541511");
            assertThat(opp.getPscCode()).isEqualTo("D302");
            assertThat(opp.getPlaceOfPerformanceCity()).isEqualTo("Washington");
            assertThat(opp.getPlaceOfPerformanceState()).isEqualTo("DC");
            assertThat(opp.getPlaceOfPerformanceZip()).isEqualTo("20301");
            assertThat(opp.getPlaceOfPerformanceCountry()).isEqualTo("USA");
            assertThat(opp.getDataSource()).isEqualTo(DataSource.USA_SPENDING);
            assertThat(opp.getUrl()).contains("INT-001");
        }

        @Test
        @DisplayName("should mark DoD agencies correctly")
        void shouldMarkDodAgencies() {
            // Given
            UsaSpendingAwardDto dodAward = createTestAwardDtoWithAgency(
                "DOD-001", "Department of Defense");

            when(usaSpendingApiClient.isEnabled()).thenReturn(true);
            when(usaSpendingApiClient.fetchAllAwards(any(), any()))
                .thenReturn(List.of(dodAward));

            // When
            usaSpendingIngestionService.ingestRecentAwards();

            // Then
            Opportunity opp = opportunityRepository.findAll().get(0);
            assertThat(opp.getIsDod()).isTrue();
            assertThat(opp.getContractLevel())
                .isEqualTo(Opportunity.ContractLevel.DOD);
        }
    }

    @Nested
    @DisplayName("Get Stats")
    class GetStats {

        @Test
        @DisplayName("should return stats with total count and enabled status")
        void shouldReturnStats() {
            // Given
            when(usaSpendingApiClient.isEnabled()).thenReturn(true);

            // Create some USAspending opportunities
            opportunityRepository.save(Opportunity.builder()
                .id("usa-1")
                .solicitationNumber("USASPEND-001")
                .dataSource(DataSource.USA_SPENDING)
                .status(OpportunityStatus.AWARDED)
                .build());

            // When
            var stats = usaSpendingIngestionService.getStats();

            // Then
            assertThat(stats.totalAwards()).isEqualTo(1);
            assertThat(stats.integrationEnabled()).isTrue();
        }
    }

    // =====================================
    // Test Data Helpers
    // =====================================

    private UsaSpendingAwardDto createTestAwardDto(String awardId) {
        return new UsaSpendingAwardDto(
            awardId,                       // awardId
            "Test Recipient",              // recipientName
            "RECIP-001",                   // recipientId
            "2024-01-01",                  // startDate
            "2025-12-31",                  // endDate
            new BigDecimal("1000000.00"),  // awardAmount
            null,                          // totalOutlays
            "Test contract description",   // description
            null,                          // defCodes
            null,                          // covidObligations
            null,                          // covidOutlays
            null,                          // infrastructureObligations
            null,                          // infrastructureOutlays
            "Test Agency",                 // awardingAgency
            "Test Sub Agency",             // awardingSubAgency
            "Definitive Contract",         // contractAwardType
            "UEI001",                      // recipientUei
            null,                          // primeAwardRecipientId
            "Test City",                   // popCity
            "TX",                          // popState
            "75001",                       // popZip
            "USA",                         // popCountry
            "541511",                      // naicsCode
            "Custom Programming",          // naicsDescription
            "D302",                        // pscCode
            "IT Services",                 // pscDescription
            null,                          // parentAwardId
            "Definitive Contract",         // awardType
            "INT-TEST-001",                // internalId
            "2024-06-01"                   // lastModifiedDate
        );
    }

    private UsaSpendingAwardDto createTestAwardDtoWithAgency(String awardId, String agency) {
        return new UsaSpendingAwardDto(
            awardId,
            "Test Recipient",
            "RECIP-001",
            "2024-01-01",
            "2025-12-31",
            new BigDecimal("1000000.00"),
            null,
            "Test contract",
            null, null, null, null, null,
            agency,                        // awardingAgency
            "Sub Agency",
            "Definitive Contract",
            "UEI001", null,
            "City", "DC", "20001", "USA",
            "541511", "Programming", "D302", "IT",
            null, "Definitive Contract",
            "INT-001", "2024-06-01"
        );
    }
}
