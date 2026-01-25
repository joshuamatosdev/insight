package com.samgov.ingestor.config;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Configuration properties for SBIR.gov API integration.
 * Binds to the 'sbir.gov' prefix in application.yaml.
 */
@Validated
@ConfigurationProperties(prefix = "sbir.gov")
public class SbirGovProperties {

    private boolean enabled = true;

    private String baseUrl = "https://api.www.sbir.gov/public/api";

    /**
     * Agencies to fetch awards from.
     * Valid values: DOD, HHS, NASA, NSF, DOE, USDA, EPA, DOC, ED, DOT, DHS
     */
    private List<String> agencies = List.of("DOD", "NASA", "NSF", "DOE", "HHS");

    @Min(value = 1, message = "Rows per request must be at least 1")
    private int rowsPerRequest = 100;

    @Min(value = 1, message = "Max results must be at least 1")
    private int maxResults = 1000;

    @Min(value = 0, message = "Rate limit cannot be negative")
    private long rateLimitMs = 500;

    /**
     * Keywords to filter IT-related awards.
     */
    private List<String> itKeywords = List.of(
            "software", "cybersecurity", "cloud", "AI", "artificial intelligence",
            "machine learning", "data", "analytics", "IT", "information technology",
            "computer", "programming", "application", "platform", "SaaS",
            "automation", "digital", "API", "microservices", "DevOps"
    );

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

    public List<String> getAgencies() {
        return agencies;
    }

    public void setAgencies(List<String> agencies) {
        this.agencies = agencies;
    }

    public int getRowsPerRequest() {
        return rowsPerRequest;
    }

    public void setRowsPerRequest(int rowsPerRequest) {
        this.rowsPerRequest = rowsPerRequest;
    }

    public int getMaxResults() {
        return maxResults;
    }

    public void setMaxResults(int maxResults) {
        this.maxResults = maxResults;
    }

    public long getRateLimitMs() {
        return rateLimitMs;
    }

    public void setRateLimitMs(long rateLimitMs) {
        this.rateLimitMs = rateLimitMs;
    }

    public List<String> getItKeywords() {
        return itKeywords;
    }

    public void setItKeywords(List<String> itKeywords) {
        this.itKeywords = itKeywords;
    }
}
