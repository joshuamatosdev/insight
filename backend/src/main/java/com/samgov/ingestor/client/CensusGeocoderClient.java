package com.samgov.ingestor.client;

import com.samgov.ingestor.config.CensusProperties;
import com.samgov.ingestor.dto.GeocodingResultDto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * US Census Bureau Geocoder API client.
 * Converts addresses to lat/long coordinates and FIPS codes.
 *
 * API Documentation: https://geocoding.geo.census.gov/geocoder/
 * Free API, no key required.
 *
 * Note: Uses ReentrantLock instead of synchronized to avoid pinning virtual threads.
 */
@Service
public class CensusGeocoderClient {

    private static final Logger log = LoggerFactory.getLogger(CensusGeocoderClient.class);

    private final RestClient restClient;
    private final CensusProperties properties;
    private final Lock rateLimitLock = new ReentrantLock();
    private volatile long lastCallTime = 0;

    public CensusGeocoderClient(CensusProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getGeocoderUrl())
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Geocode a single-line address to coordinates and geographies.
     *
     * @param address Full address string (e.g., "1600 Pennsylvania Ave NW, Washington, DC 20500")
     * @return SimpleGeocodingResult with lat/long and FIPS codes, or null if no match
     */
    public SimpleGeocodingResult geocodeAddress(String address) {
        if (!properties.isEnabled() || address == null || address.isBlank()) {
            return null;
        }

        applyRateLimit();

        log.debug("Geocoding address: {}", address);

        try {
            GeocoderResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/geographies/onelineaddress")
                            .queryParam("address", address)
                            .queryParam("benchmark", properties.getBenchmark())
                            .queryParam("vintage", properties.getVintage())
                            .queryParam("layers", "all")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .body(GeocoderResponse.class);

            if (response == null || response.result() == null) {
                log.debug("No geocoding result for address: {}", address);
                return null;
            }

            GeocoderResult result = response.result();
            if (!result.hasMatches()) {
                log.debug("No address matches found for: {}", address);
                return null;
            }

            SimpleGeocodingResult simpleResult = SimpleGeocodingResult.from(result.getBestMatch());
            log.debug("Successfully geocoded address to: {}, {}",
                    simpleResult.latitude(), simpleResult.longitude());

            return simpleResult;

        } catch (RestClientException e) {
            log.error("Error geocoding address '{}': {}", address, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error geocoding address '{}': {}", address, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Geocode address components separately (more accurate than single-line).
     *
     * @param street Street address
     * @param city   City name
     * @param state  State abbreviation (e.g., "DC")
     * @param zip    ZIP code (optional)
     * @return SimpleGeocodingResult with lat/long and FIPS codes, or null if no match
     */
    public SimpleGeocodingResult geocodeAddressComponents(
            String street, String city, String state, String zip) {

        if (!properties.isEnabled()) {
            return null;
        }

        // Validate required fields
        if ((street == null || street.isBlank()) &&
                (city == null || city.isBlank()) &&
                (state == null || state.isBlank())) {
            log.debug("Insufficient address components for geocoding");
            return null;
        }

        applyRateLimit();

        log.debug("Geocoding address components: {}, {}, {} {}", street, city, state, zip);

        try {
            GeocoderResponse response = restClient.get()
                    .uri(uriBuilder -> {
                        var builder = uriBuilder
                                .path("/geographies/address")
                                .queryParam("benchmark", properties.getBenchmark())
                                .queryParam("vintage", properties.getVintage())
                                .queryParam("layers", "all")
                                .queryParam("format", "json");

                        if (street != null && !street.isBlank()) {
                            builder.queryParam("street", street);
                        }
                        if (city != null && !city.isBlank()) {
                            builder.queryParam("city", city);
                        }
                        if (state != null && !state.isBlank()) {
                            builder.queryParam("state", state);
                        }
                        if (zip != null && !zip.isBlank()) {
                            builder.queryParam("zip", zip);
                        }

                        return builder.build();
                    })
                    .retrieve()
                    .body(GeocoderResponse.class);

            if (response == null || response.result() == null) {
                log.debug("No geocoding result for address components");
                return null;
            }

            GeocoderResult result = response.result();
            if (!result.hasMatches()) {
                log.debug("No address matches found for components: {}, {}, {}", city, state, zip);
                return null;
            }

            SimpleGeocodingResult simpleResult = SimpleGeocodingResult.from(result.getBestMatch());
            log.debug("Successfully geocoded to: {}, {}",
                    simpleResult.latitude(), simpleResult.longitude());

            return simpleResult;

        } catch (RestClientException e) {
            log.error("Error geocoding address components: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error geocoding address components: {}", e.getMessage(), e);
            return null;
        }
    }

    /**
     * Reverse geocode: Get geography info from coordinates.
     *
     * @param latitude  Latitude
     * @param longitude Longitude
     * @return SimpleGeocodingResult with FIPS codes, or null if no match
     */
    public SimpleGeocodingResult reverseGeocode(double latitude, double longitude) {
        if (!properties.isEnabled()) {
            return null;
        }

        applyRateLimit();

        log.debug("Reverse geocoding coordinates: {}, {}", latitude, longitude);

        try {
            GeocoderResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/geographies/coordinates")
                            .queryParam("x", longitude)
                            .queryParam("y", latitude)
                            .queryParam("benchmark", properties.getBenchmark())
                            .queryParam("vintage", properties.getVintage())
                            .queryParam("layers", "all")
                            .queryParam("format", "json")
                            .build())
                    .retrieve()
                    .body(GeocoderResponse.class);

            if (response == null || response.result() == null) {
                log.debug("No reverse geocoding result for coordinates: {}, {}", latitude, longitude);
                return null;
            }

            // For reverse geocoding, we construct from geographies directly
            GeocoderResult result = response.result();
            if (result.addressMatches() != null && !result.addressMatches().isEmpty()) {
                return SimpleGeocodingResult.from(result.getBestMatch());
            }

            log.debug("No geography matches for coordinates: {}, {}", latitude, longitude);
            return null;

        } catch (RestClientException e) {
            log.error("Error reverse geocoding {}, {}: {}", latitude, longitude, e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Unexpected error reverse geocoding {}, {}: {}", latitude, longitude, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Applies rate limiting by sleeping if necessary.
     * Uses ReentrantLock to avoid pinning virtual threads.
     */
    private void applyRateLimit() {
        rateLimitLock.lock();
        try {
            long now = System.currentTimeMillis();
            long timeSinceLastCall = now - lastCallTime;
            long rateLimitMs = properties.getRateLimitMs();

            if (timeSinceLastCall < rateLimitMs && lastCallTime > 0) {
                try {
                    long sleepTime = rateLimitMs - timeSinceLastCall;
                    log.trace("Rate limiting: sleeping for {}ms", sleepTime);
                    TimeUnit.MILLISECONDS.sleep(sleepTime);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Rate limit sleep interrupted");
                }
            }

            lastCallTime = System.currentTimeMillis();
        } finally {
            rateLimitLock.unlock();
        }
    }

    /**
     * Returns whether the integration is enabled.
     */
    public boolean isEnabled() {
        return properties.isEnabled();
    }
}
