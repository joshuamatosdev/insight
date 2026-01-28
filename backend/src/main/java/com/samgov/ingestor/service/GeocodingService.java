package com.samgov.ingestor.service;

import com.samgov.ingestor.client.CensusGeocoderClient;
import com.samgov.ingestor.config.CensusProperties;
import com.samgov.ingestor.dto.GeocodingResultDto.SimpleGeocodingResult;
import com.samgov.ingestor.model.Opportunity;
import com.samgov.ingestor.repository.OpportunityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Service for geocoding opportunities using Census Bureau Geocoder.
 * Batch processes opportunities that have address data but no coordinates.
 */
@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final CensusGeocoderClient geocoderClient;
    private final OpportunityRepository opportunityRepository;
    private final CensusProperties properties;

    public GeocodingService(
            CensusGeocoderClient geocoderClient,
            OpportunityRepository opportunityRepository,
            CensusProperties properties) {
        this.geocoderClient = geocoderClient;
        this.opportunityRepository = opportunityRepository;
        this.properties = properties;
    }

    /**
     * Geocode a single opportunity.
     *
     * @param opportunity The opportunity to geocode
     * @return true if geocoding was successful
     */
    @Transactional
    public boolean geocodeOpportunity(Opportunity opportunity) {
        if (opportunity == null) {
            return false;
        }

        // Skip if already geocoded
        if (opportunity.getLatitude() != null && opportunity.getLongitude() != null) {
            log.debug("Opportunity {} already geocoded", opportunity.getId());
            return true;
        }

        // Skip non-US opportunities
        String country = opportunity.getPlaceOfPerformanceCountry();
        if (country != null && !country.equalsIgnoreCase("USA") &&
            !country.equalsIgnoreCase("US") && !country.equalsIgnoreCase("United States")) {
            log.debug("Skipping non-US opportunity {}: {}", opportunity.getId(), country);
            return false;
        }

        // Build address for geocoding
        String city = opportunity.getPlaceOfPerformanceCity();
        String state = opportunity.getPlaceOfPerformanceState();
        String zip = opportunity.getPlaceOfPerformanceZip();

        // Need at least one address component
        if ((city == null || city.isBlank()) &&
            (state == null || state.isBlank()) &&
            (zip == null || zip.isBlank())) {
            log.debug("No address data for opportunity {}", opportunity.getId());
            return false;
        }

        // Try geocoding with components (more accurate)
        SimpleGeocodingResult result = geocoderClient.geocodeAddressComponents(
                null, // no street address typically available
                city,
                state,
                zip
        );

        // Fallback: try single-line address if components failed
        if (result == null || !result.isValid()) {
            String addressLine = buildAddressLine(city, state, zip);
            if (!addressLine.isBlank()) {
                result = geocoderClient.geocodeAddress(addressLine);
            }
        }

        if (result != null && result.isValid()) {
            opportunity.setLatitude(result.latitude());
            opportunity.setLongitude(result.longitude());
            opportunity.setFipsStateCode(result.stateFips());
            opportunity.setFipsCountyCode(result.countyFips());
            opportunity.setCensusTract(result.censusTract());
            opportunity.setGeocodedAt(Instant.now());

            opportunityRepository.save(opportunity);

            log.info("Geocoded opportunity {}: ({}, {}) FIPS: {}-{}",
                    opportunity.getId(),
                    result.latitude(),
                    result.longitude(),
                    result.stateFips(),
                    result.countyFips());

            return true;
        }

        log.debug("Could not geocode opportunity {}", opportunity.getId());
        return false;
    }

    /**
     * Batch geocode opportunities that need geocoding.
     *
     * @param maxRecords Maximum number of opportunities to geocode
     * @return Number of successfully geocoded opportunities
     */
    @Transactional
    public int batchGeocodeOpportunities(int maxRecords) {
        if (!geocoderClient.isEnabled()) {
            log.info("Geocoding is disabled");
            return 0;
        }

        int batchSize = Math.min(properties.getBatchSize(), maxRecords);
        PageRequest pageRequest = PageRequest.of(0, batchSize);

        List<Opportunity> toGeocode = opportunityRepository.findOpportunitiesNeedingGeocoding(pageRequest);

        if (toGeocode.isEmpty()) {
            log.info("No opportunities needing geocoding found");
            return 0;
        }

        log.info("Starting batch geocoding of {} opportunities", toGeocode.size());

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        for (Opportunity opp : toGeocode) {
            try {
                if (geocodeOpportunity(opp)) {
                    successCount.incrementAndGet();
                } else {
                    failCount.incrementAndGet();
                }
            } catch (Exception e) {
                log.error("Error geocoding opportunity {}: {}", opp.getId(), e.getMessage());
                failCount.incrementAndGet();
            }
        }

        log.info("Batch geocoding complete: {} success, {} failed",
                successCount.get(), failCount.get());

        return successCount.get();
    }

    /**
     * Get geocoding statistics.
     *
     * @return Statistics about geocoded vs non-geocoded opportunities
     */
    public GeocodingStats getStats() {
        long total = opportunityRepository.count();
        long geocoded = opportunityRepository.countGeocodedOpportunities();
        long needsGeocoding = opportunityRepository.findOpportunitiesNeedingGeocoding(
                PageRequest.of(0, 1)).size() > 0 ? total - geocoded : 0;

        return new GeocodingStats(total, geocoded, needsGeocoding);
    }

    /**
     * Build single-line address from components.
     */
    private String buildAddressLine(String city, String state, String zip) {
        StringBuilder sb = new StringBuilder();

        if (city != null && !city.isBlank()) {
            sb.append(city);
        }

        if (state != null && !state.isBlank()) {
            if (sb.length() > 0) {
                sb.append(", ");
            }
            sb.append(state);
        }

        if (zip != null && !zip.isBlank()) {
            if (sb.length() > 0) {
                sb.append(" ");
            }
            sb.append(zip);
        }

        return sb.toString().trim();
    }

    /**
     * Geocoding statistics record.
     */
    public record GeocodingStats(
            long totalOpportunities,
            long geocodedCount,
            long needsGeocodingCount
    ) {
        public double geocodedPercentage() {
            if (totalOpportunities == 0) return 0.0;
            return (geocodedCount * 100.0) / totalOpportunities;
        }
    }
}
