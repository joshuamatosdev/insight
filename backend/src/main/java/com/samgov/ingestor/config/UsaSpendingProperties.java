package com.samgov.ingestor.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Configuration properties for USAspending.gov API integration.
 * Binds to the 'usa-spending' prefix in application.yaml.
 *
 * USAspending.gov is a free API (no key required) that provides
 * federal spending data, awards, and agency budgetary resources.
 */
@Validated
@ConfigurationProperties(prefix = "usa-spending")
public class UsaSpendingProperties {

    private boolean enabled = true;

    @NotBlank(message = "USAspending base URL is required")
    private String baseUrl = "https://api.usaspending.gov/v2";

    @Min(value = 0, message = "Rate limit cannot be negative")
    private long rateLimitMs = 500;

    @Min(value = 1, message = "Page size must be at least 1")
    private int pageSize = 100;

    @Min(value = 1, message = "Max results must be at least 1")
    private int maxResults = 5000;

    // Filter by award types (contracts, grants, etc.)
    private List<String> awardTypes = List.of("A", "B", "C", "D"); // A-D are contract types

    // Filter by agencies (toptier agency codes)
    private List<String> agencies = List.of();

    // Time range for awards (in days from today)
    @Min(value = 1, message = "Award lookback days must be at least 1")
    private int awardLookbackDays = 365;

    // NAICS codes to filter (empty means all)
    private List<String> naicsCodes = List.of();

    // Getters and Setters

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public long getRateLimitMs() {
        return rateLimitMs;
    }

    public void setRateLimitMs(long rateLimitMs) {
        this.rateLimitMs = rateLimitMs;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public int getMaxResults() {
        return maxResults;
    }

    public void setMaxResults(int maxResults) {
        this.maxResults = maxResults;
    }

    public List<String> getAwardTypes() {
        return awardTypes;
    }

    public void setAwardTypes(List<String> awardTypes) {
        this.awardTypes = awardTypes;
    }

    public List<String> getAgencies() {
        return agencies;
    }

    public void setAgencies(List<String> agencies) {
        this.agencies = agencies;
    }

    public int getAwardLookbackDays() {
        return awardLookbackDays;
    }

    public void setAwardLookbackDays(int awardLookbackDays) {
        this.awardLookbackDays = awardLookbackDays;
    }

    public List<String> getNaicsCodes() {
        return naicsCodes;
    }

    public void setNaicsCodes(List<String> naicsCodes) {
        this.naicsCodes = naicsCodes;
    }
}
