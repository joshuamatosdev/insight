package com.samgov.ingestor.client;

import com.samgov.ingestor.config.SamGovProperties;
import com.samgov.ingestor.dto.SamOpportunityDto;
import com.samgov.ingestor.dto.SamSearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * SAM.gov API client for fetching government contract opportunities.
 * Implements rate limiting to avoid 429 errors from the API.
 * All parameters are configurable via application.yaml.
 * 
 * Note: Uses ReentrantLock instead of synchronized to avoid pinning virtual threads.
 */
@Service
public class SamApiClient {

    private static final Logger log = LoggerFactory.getLogger(SamApiClient.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");

    private final RestClient restClient;
    private final SamGovProperties properties;
    private final Lock rateLimitLock = new ReentrantLock();
    private volatile long lastCallTime = 0;

    public SamApiClient(RestClient samGovRestClient, SamGovProperties properties) {
        this.restClient = samGovRestClient;
        this.properties = properties;
    }

    /**
     * Fetches opportunities from SAM.gov for the given NAICS code.
     * Uses configured parameters for limit, date range, procurement types, and set-asides.
     *
     * @param naicsCode The NAICS code to filter opportunities (e.g., "541511")
     * @return List of SamOpportunityDto, empty list if error occurs
     */
    public List<SamOpportunityDto> fetchOpportunities(String naicsCode) {
        applyRateLimit();

        String postedFrom = LocalDate.now()
                .minusDays(properties.getPostedWithinDays())
                .format(DATE_FORMATTER);
        String postedTo = LocalDate.now().format(DATE_FORMATTER);

        log.info("Fetching SAM.gov opportunities - NAICS: {}, postedFrom: {}, postedTo: {}, limit: {}, ptype: {}",
                naicsCode, postedFrom, postedTo, properties.getLimit(), properties.getPtype());

        try {
            SamSearchResponse response = restClient.get()
                    .uri(uriBuilder -> buildUri(uriBuilder, naicsCode, postedFrom, postedTo))
                    .retrieve()
                    .body(SamSearchResponse.class);

            if (response == null) {
                log.warn("Received null response from SAM.gov API");
                return List.of();
            }

            List<SamOpportunityDto> opportunities = response.getOpportunities();
            log.info("Successfully fetched {} opportunities for NAICS {} (total available: {})",
                    opportunities.size(), naicsCode, response.totalRecords());

            return opportunities;

        } catch (RestClientException e) {
            log.error("Error fetching opportunities from SAM.gov for NAICS {}: {}",
                    naicsCode, e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error fetching opportunities from SAM.gov: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Builds the URI with all configured query parameters.
     * Uses URI template variables to properly encode special characters.
     */
    private java.net.URI buildUri(UriBuilder uriBuilder, String naicsCode, String postedFrom, String postedTo) {
        uriBuilder
                .queryParam("api_key", "{apiKey}")
                .queryParam("postedFrom", "{postedFrom}")
                .queryParam("postedTo", "{postedTo}")
                .queryParam("limit", "{limit}")
                .queryParam("ptype", "{ptype}")
                .queryParam("ncode", "{ncode}");

        // Add set-aside filter if configured
        String setAside = properties.getSetAside();
        if (setAside != null && !setAside.isBlank()) {
            uriBuilder.queryParam("setaside", "{setaside}");
            return uriBuilder.build(
                    properties.getApiKey(), postedFrom, postedTo, properties.getLimit(),
                    properties.getPtype(), naicsCode, setAside);
        }

        return uriBuilder.build(
                properties.getApiKey(), postedFrom, postedTo, properties.getLimit(),
                properties.getPtype(), naicsCode);
    }

    /**
     * Applies rate limiting by sleeping if necessary.
     * Uses configurable delay from properties to avoid 429 errors.
     * 
     * Uses ReentrantLock instead of synchronized to avoid pinning virtual threads.
     * Virtual threads can be unmounted during lock.lock() and Thread.sleep().
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
                    log.debug("Rate limiting: sleeping for {}ms", sleepTime);
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
     * Returns the configured NAICS codes from properties.
     */
    public List<String> getConfiguredNaicsCodes() {
        return properties.getNaicsCodes();
    }

    /**
     * Fetches opportunities with custom search parameters.
     * Allows overriding ptype for specific searches (e.g., Sources Sought only).
     *
     * @param naicsCode The NAICS code to filter
     * @param ptype     Procurement type: o=Original, k=Combined, p=Presolicitation, r=Sources Sought
     * @param limit     Maximum results to return
     * @return List of SamOpportunityDto
     */
    public List<SamOpportunityDto> fetchOpportunitiesWithParams(String naicsCode, String ptype, int limit) {
        applyRateLimit();

        String postedFrom = LocalDate.now()
                .minusDays(properties.getPostedWithinDays())
                .format(DATE_FORMATTER);
        String postedTo = LocalDate.now().format(DATE_FORMATTER);

        log.info("Custom search - NAICS: {}, ptype: {}, postedFrom: {}, postedTo: {}, limit: {}",
                naicsCode, ptype, postedFrom, postedTo, limit);

        try {
            SamSearchResponse response = restClient.get()
                    .uri(uriBuilder -> {
                        uriBuilder
                                .queryParam("api_key", "{apiKey}")
                                .queryParam("postedFrom", "{postedFrom}")
                                .queryParam("postedTo", "{postedTo}")
                                .queryParam("limit", "{limit}")
                                .queryParam("ptype", "{ptype}")
                                .queryParam("ncode", "{ncode}");

                        String setAside = properties.getSetAside();
                        if (setAside != null && !setAside.isBlank()) {
                            uriBuilder.queryParam("setaside", "{setaside}");
                            return uriBuilder.build(
                                    properties.getApiKey(), postedFrom, postedTo, limit, ptype, naicsCode, setAside);
                        }
                        return uriBuilder.build(
                                properties.getApiKey(), postedFrom, postedTo, limit, ptype, naicsCode);
                    })
                    .retrieve()
                    .body(SamSearchResponse.class);

            if (response == null) {
                log.warn("Received null response from SAM.gov API");
                return List.of();
            }

            List<SamOpportunityDto> opportunities = response.getOpportunities();
            log.info("Custom search returned {} opportunities for NAICS {} (total: {})",
                    opportunities.size(), naicsCode, response.totalRecords());

            return opportunities;

        } catch (RestClientException e) {
            log.error("Custom search error for NAICS {}: {}", naicsCode, e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error in custom search: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Convenience method to search for Sources Sought opportunities only.
     */
    public List<SamOpportunityDto> fetchSourcesSought(String naicsCode) {
        return fetchOpportunitiesWithParams(naicsCode, "r", properties.getLimit());
    }

    /**
     * Search across all configured NAICS codes for a specific ptype.
     */
    public List<SamOpportunityDto> searchAllNaics(String ptype) {
        return getConfiguredNaicsCodes().stream()
                .flatMap(naics -> fetchOpportunitiesWithParams(naics, ptype, properties.getLimit()).stream())
                .toList();
    }

    /**
     * Fetches SBIR/STTR opportunities by searching for keywords in titles.
     * Searches across all procurement types to capture SBIR Phase I, II, III.
     *
     * @param keyword The keyword to search (e.g., "SBIR" or "STTR")
     * @return List of matching opportunities
     */
    public List<SamOpportunityDto> fetchSbirOpportunities(String keyword) {
        applyRateLimit();

        String postedFrom = LocalDate.now()
                .minusDays(properties.getPostedWithinDays())
                .format(DATE_FORMATTER);
        String postedTo = LocalDate.now().format(DATE_FORMATTER);

        log.info("Fetching SBIR/STTR opportunities - keyword: {}, postedFrom: {}, postedTo: {}",
                keyword, postedFrom, postedTo);

        try {
            SamSearchResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .queryParam("api_key", "{apiKey}")
                            .queryParam("postedFrom", "{postedFrom}")
                            .queryParam("postedTo", "{postedTo}")
                            .queryParam("limit", "{limit}")
                            .queryParam("title", "{title}")
                            .build(properties.getApiKey(), postedFrom, postedTo, 
                                   properties.getLimit(), keyword))
                    .retrieve()
                    .body(SamSearchResponse.class);

            if (response == null) {
                log.warn("Received null response from SAM.gov API for SBIR search");
                return List.of();
            }

            List<SamOpportunityDto> opportunities = response.getOpportunities();
            log.info("Successfully fetched {} {} opportunities (total available: {})",
                    opportunities.size(), keyword, response.totalRecords());

            return opportunities;

        } catch (RestClientException e) {
            log.error("Error fetching {} opportunities from SAM.gov: {}", keyword, e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error fetching {} opportunities: {}", keyword, e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Fetches all SBIR and STTR opportunities using configured keywords.
     *
     * @return Combined list of SBIR and STTR opportunities
     */
    public List<SamOpportunityDto> fetchAllSbirSttr() {
        if (!properties.isSbirEnabled()) {
            log.info("SBIR/STTR search is disabled");
            return List.of();
        }

        return properties.getSbirKeywords().stream()
                .flatMap(keyword -> fetchSbirOpportunities(keyword).stream())
                .toList();
    }

    /**
     * Check if SBIR/STTR search is enabled.
     */
    public boolean isSbirEnabled() {
        return properties.isSbirEnabled();
    }
}
