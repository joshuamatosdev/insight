package com.samgov.ingestor.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.util.List;

/**
 * Configuration properties for SAM.gov API integration.
 * Binds to the 'sam.gov' prefix in application.yaml.
 * 
 * Validated at startup - missing required properties will fail fast.
 */
@Validated
@ConfigurationProperties(prefix = "sam.gov")
public class SamGovProperties {

    @NotBlank(message = "SAM.gov API key is required")
    private String apiKey;
    
    @NotBlank(message = "SAM.gov base URL is required")
    private String baseUrl;
    
    @NotEmpty(message = "At least one NAICS code is required")
    private List<String> naicsCodes;
    
    @Min(value = 1, message = "Limit must be at least 1")
    private int limit = 1000;
    
    @Min(value = 1, message = "Posted within days must be at least 1")
    private int postedWithinDays = 30;
    
    private String ptype = "k,o";
    private String setAside = "";
    
    @Min(value = 0, message = "Rate limit cannot be negative")
    private long rateLimitMs = 500;

    // Getters and Setters

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public List<String> getNaicsCodes() {
        return naicsCodes;
    }

    public void setNaicsCodes(List<String> naicsCodes) {
        this.naicsCodes = naicsCodes;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public int getPostedWithinDays() {
        return postedWithinDays;
    }

    public void setPostedWithinDays(int postedWithinDays) {
        this.postedWithinDays = postedWithinDays;
    }

    public String getPtype() {
        return ptype;
    }

    public void setPtype(String ptype) {
        this.ptype = ptype;
    }

    public String getSetAside() {
        return setAside;
    }

    public void setSetAside(String setAside) {
        this.setAside = setAside;
    }

    public long getRateLimitMs() {
        return rateLimitMs;
    }

    public void setRateLimitMs(long rateLimitMs) {
        this.rateLimitMs = rateLimitMs;
    }
}
