package com.samgov.ingestor.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for US Census Bureau API integration.
 * Binds to the 'census' prefix in application.yaml.
 *
 * Census APIs used:
 * - Geocoder: Convert addresses to lat/long and FIPS codes
 * - Data API: Economic/demographic data (requires API key for higher limits)
 *
 * API Documentation: https://geocoding.geo.census.gov/geocoder/
 */
@Validated
@ConfigurationProperties(prefix = "census")
public class CensusProperties {

    private boolean enabled = true;

    @NotBlank(message = "Census geocoder URL is required")
    private String geocoderUrl = "https://geocoding.geo.census.gov/geocoder";

    @NotBlank(message = "Census API URL is required")
    private String apiUrl = "https://api.census.gov/data";

    // Optional API key - increases rate limits for data API
    private String apiKey = "";

    @Min(value = 0, message = "Rate limit cannot be negative")
    private long rateLimitMs = 200;

    // Benchmark for geocoding (default: Public_AR_Current)
    private String benchmark = "Public_AR_Current";

    // Vintage for geocoding (default: Current_Current)
    private String vintage = "Current_Current";

    // Batch geocoding settings
    @Min(value = 1, message = "Batch size must be at least 1")
    private int batchSize = 100;

    @Min(value = 1, message = "Max retries must be at least 1")
    private int maxRetries = 3;

    // Getters and Setters

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getGeocoderUrl() {
        return geocoderUrl;
    }

    public void setGeocoderUrl(String geocoderUrl) {
        this.geocoderUrl = geocoderUrl;
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public long getRateLimitMs() {
        return rateLimitMs;
    }

    public void setRateLimitMs(long rateLimitMs) {
        this.rateLimitMs = rateLimitMs;
    }

    public String getBenchmark() {
        return benchmark;
    }

    public void setBenchmark(String benchmark) {
        this.benchmark = benchmark;
    }

    public String getVintage() {
        return vintage;
    }

    public void setVintage(String vintage) {
        this.vintage = vintage;
    }

    public int getBatchSize() {
        return batchSize;
    }

    public void setBatchSize(int batchSize) {
        this.batchSize = batchSize;
    }

    public int getMaxRetries() {
        return maxRetries;
    }

    public void setMaxRetries(int maxRetries) {
        this.maxRetries = maxRetries;
    }
}
