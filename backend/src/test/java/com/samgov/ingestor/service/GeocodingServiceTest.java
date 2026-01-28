package com.samgov.ingestor.service;

import com.samgov.ingestor.BaseServiceTest;
import com.samgov.ingestor.client.CensusGeocoderClient;
import com.samgov.ingestor.config.CensusProperties;
import com.samgov.ingestor.dto.GeocodingResultDto.SimpleGeocodingResult;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

/**
 * Service layer tests for GeocodingService.
 * Tests batch geocoding, opportunity updates, and statistics.
 */
class GeocodingServiceTest extends BaseServiceTest {

    @Autowired
    private GeocodingService geocodingService;

    @Autowired
    private OpportunityRepository opportunityRepository;

    @MockBean
    private CensusGeocoderClient censusGeocoderClient;

    @Autowired
    private CensusProperties censusProperties;

    @Override
    @BeforeEach
    protected void setUp() {
        super.setUp();
        opportunityRepository.deleteAll();
    }

    @Nested
    @DisplayName("Geocode Single Opportunity")
    class GeocodeSingleOpportunity {

        @Test
        @DisplayName("should geocode opportunity with address data")
        void shouldGeocodeOpportunityWithAddress() {
            // Given
            Opportunity opp = createOpportunityWithAddress("opp-1", "Washington", "DC", "20001");
            opportunityRepository.save(opp);

            when(censusGeocoderClient.geocodeAddressComponents(any(), any(), any(), any()))
                .thenReturn(createTestGeocodingResult());

            // When
            boolean result = geocodingService.geocodeOpportunity(opp);

            // Then
            assertThat(result).isTrue();

            Opportunity updated = opportunityRepository.findById("opp-1").orElseThrow();
            assertThat(updated.getLatitude()).isEqualByComparingTo(new BigDecimal("38.9072"));
            assertThat(updated.getLongitude()).isEqualByComparingTo(new BigDecimal("-77.0369"));
            assertThat(updated.getFipsStateCode()).isEqualTo("11");
            assertThat(updated.getFipsCountyCode()).isEqualTo("11001");
            assertThat(updated.getGeocodedAt()).isNotNull();
        }

        @Test
        @DisplayName("should skip already geocoded opportunities")
        void shouldSkipAlreadyGeocodedOpportunities() {
            // Given
            Opportunity opp = createOpportunityWithAddress("opp-2", "Washington", "DC", "20001");
            opp.setLatitude(new BigDecimal("38.0"));
            opp.setLongitude(new BigDecimal("-77.0"));
            opportunityRepository.save(opp);

            // When
            boolean result = geocodingService.geocodeOpportunity(opp);

            // Then
            assertThat(result).isTrue(); // Returns true for already geocoded
        }

        @Test
        @DisplayName("should skip non-US opportunities")
        void shouldSkipNonUsOpportunities() {
            // Given
            Opportunity opp = createOpportunityWithAddress("opp-3", "London", null, null);
            opp.setPlaceOfPerformanceCountry("UK");
            opportunityRepository.save(opp);

            // When
            boolean result = geocodingService.geocodeOpportunity(opp);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return false when geocoding fails")
        void shouldReturnFalseWhenGeocodingFails() {
            // Given
            Opportunity opp = createOpportunityWithAddress("opp-4", "Unknown City", "XX", "00000");
            opportunityRepository.save(opp);

            when(censusGeocoderClient.geocodeAddressComponents(any(), any(), any(), any()))
                .thenReturn(null);
            when(censusGeocoderClient.geocodeAddress(anyString()))
                .thenReturn(null);

            // When
            boolean result = geocodingService.geocodeOpportunity(opp);

            // Then
            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should skip opportunities without address data")
        void shouldSkipOpportunitiesWithoutAddress() {
            // Given
            Opportunity opp = Opportunity.builder()
                .id("opp-5")
                .solicitationNumber("SOL-005")
                .status(OpportunityStatus.ACTIVE)
                .placeOfPerformanceCountry("USA")
                // No city, state, or zip
                .build();
            opportunityRepository.save(opp);

            // When
            boolean result = geocodingService.geocodeOpportunity(opp);

            // Then
            assertThat(result).isFalse();
        }
    }

    @Nested
    @DisplayName("Batch Geocode Opportunities")
    class BatchGeocodeOpportunities {

        @Test
        @DisplayName("should geocode multiple opportunities in batch")
        void shouldGeocodeBatch() {
            // Given
            opportunityRepository.save(createOpportunityWithAddress("opp-b1", "Washington", "DC", "20001"));
            opportunityRepository.save(createOpportunityWithAddress("opp-b2", "New York", "NY", "10001"));
            opportunityRepository.save(createOpportunityWithAddress("opp-b3", "Los Angeles", "CA", "90001"));

            when(censusGeocoderClient.isEnabled()).thenReturn(true);
            when(censusGeocoderClient.geocodeAddressComponents(any(), any(), any(), any()))
                .thenReturn(createTestGeocodingResult());

            // When
            int geocoded = geocodingService.batchGeocodeOpportunities(10);

            // Then
            assertThat(geocoded).isEqualTo(3);

            List<Opportunity> all = opportunityRepository.findAll();
            assertThat(all).allMatch(o -> o.getLatitude() != null);
        }

        @Test
        @DisplayName("should respect batch limit")
        void shouldRespectBatchLimit() {
            // Given - Create 5 opportunities
            for (int i = 1; i <= 5; i++) {
                opportunityRepository.save(
                    createOpportunityWithAddress("opp-lim-" + i, "City" + i, "DC", "2000" + i));
            }

            when(censusGeocoderClient.isEnabled()).thenReturn(true);
            when(censusGeocoderClient.geocodeAddressComponents(any(), any(), any(), any()))
                .thenReturn(createTestGeocodingResult());

            // When - Only process 2
            int geocoded = geocodingService.batchGeocodeOpportunities(2);

            // Then
            assertThat(geocoded).isLessThanOrEqualTo(2);
        }

        @Test
        @DisplayName("should return zero when geocoding is disabled")
        void shouldReturnZeroWhenDisabled() {
            // Given
            opportunityRepository.save(createOpportunityWithAddress("opp-dis-1", "Washington", "DC", "20001"));

            when(censusGeocoderClient.isEnabled()).thenReturn(false);

            // When
            int geocoded = geocodingService.batchGeocodeOpportunities(10);

            // Then
            assertThat(geocoded).isEqualTo(0);
        }

        @Test
        @DisplayName("should handle partial failures in batch")
        void shouldHandlePartialFailures() {
            // Given
            opportunityRepository.save(createOpportunityWithAddress("opp-pf-1", "Washington", "DC", "20001"));
            opportunityRepository.save(createOpportunityWithAddress("opp-pf-2", "Unknown", "XX", "00000"));

            when(censusGeocoderClient.isEnabled()).thenReturn(true);
            when(censusGeocoderClient.geocodeAddressComponents(any(), any(), any(), any()))
                .thenReturn(createTestGeocodingResult())  // First succeeds
                .thenReturn(null);  // Second fails

            // When
            int geocoded = geocodingService.batchGeocodeOpportunities(10);

            // Then
            assertThat(geocoded).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Get Stats")
    class GetStats {

        @Test
        @DisplayName("should return accurate geocoding statistics")
        void shouldReturnAccurateStats() {
            // Given - Create mix of geocoded and non-geocoded opportunities
            Opportunity geocoded1 = createOpportunityWithAddress("geo-1", "Washington", "DC", "20001");
            geocoded1.setLatitude(new BigDecimal("38.9"));
            geocoded1.setLongitude(new BigDecimal("-77.0"));
            opportunityRepository.save(geocoded1);

            Opportunity geocoded2 = createOpportunityWithAddress("geo-2", "New York", "NY", "10001");
            geocoded2.setLatitude(new BigDecimal("40.7"));
            geocoded2.setLongitude(new BigDecimal("-74.0"));
            opportunityRepository.save(geocoded2);

            opportunityRepository.save(createOpportunityWithAddress("not-geo-1", "Chicago", "IL", "60601"));
            opportunityRepository.save(createOpportunityWithAddress("not-geo-2", "Dallas", "TX", "75201"));

            // When
            var stats = geocodingService.getStats();

            // Then
            assertThat(stats.totalOpportunities()).isEqualTo(4);
            assertThat(stats.geocodedCount()).isEqualTo(2);
            assertThat(stats.geocodedPercentage()).isEqualTo(50.0);
        }

        @Test
        @DisplayName("should handle empty repository")
        void shouldHandleEmptyRepository() {
            // When
            var stats = geocodingService.getStats();

            // Then
            assertThat(stats.totalOpportunities()).isEqualTo(0);
            assertThat(stats.geocodedCount()).isEqualTo(0);
            assertThat(stats.geocodedPercentage()).isEqualTo(0.0);
        }
    }

    // =====================================
    // Test Data Helpers
    // =====================================

    private Opportunity createOpportunityWithAddress(String id, String city, String state, String zip) {
        return Opportunity.builder()
            .id(id)
            .solicitationNumber("SOL-" + UUID.randomUUID().toString().substring(0, 8))
            .title("Test Opportunity - " + city)
            .status(OpportunityStatus.ACTIVE)
            .postedDate(LocalDate.now().minusDays(5))
            .responseDeadLine(LocalDate.now().plusDays(30))
            .placeOfPerformanceCity(city)
            .placeOfPerformanceState(state)
            .placeOfPerformanceZip(zip)
            .placeOfPerformanceCountry("USA")
            .build();
    }

    private SimpleGeocodingResult createTestGeocodingResult() {
        return new SimpleGeocodingResult(
            "123 Test Street, Washington, DC 20001",  // matchedAddress
            new BigDecimal("38.9072"),                 // latitude
            new BigDecimal("-77.0369"),                // longitude
            "11",                                      // stateFips
            "11001",                                   // countyFips
            "000100",                                  // censusTract
            "Washington",                              // city
            "DC",                                      // state
            "20001"                                    // zip
        );
    }
}
