package com.samgov.ingestor.client;

import com.samgov.ingestor.config.UsaSpendingProperties;
import com.samgov.ingestor.dto.UsaSpendingAwardDto;
import com.samgov.ingestor.dto.UsaSpendingSearchResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * USAspending.gov API client for fetching federal spending and award data.
 * Implements rate limiting to respect API quotas.
 *
 * API Documentation: https://api.usaspending.gov/
 * No API key required (free public API).
 *
 * Note: Uses ReentrantLock instead of synchronized to avoid pinning virtual threads.
 */
@Service
public class UsaSpendingApiClient {

    private static final Logger log = LoggerFactory.getLogger(UsaSpendingApiClient.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final RestClient restClient;
    private final UsaSpendingProperties properties;
    private final Lock rateLimitLock = new ReentrantLock();
    private volatile long lastCallTime = 0;

    public UsaSpendingApiClient(UsaSpendingProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    /**
     * Search for prime awards (contracts) within a date range.
     * Uses POST /search/spending_by_award/ endpoint.
     *
     * @param naicsCode Optional NAICS code to filter by (null for all)
     * @param agency    Optional agency code to filter by (null for all)
     * @param page      Page number (1-based)
     * @return List of awards, empty list on error
     */
    public List<UsaSpendingAwardDto> searchAwards(String naicsCode, String agency, int page) {
        if (!properties.isEnabled()) {
            log.debug("USAspending integration is disabled");
            return List.of();
        }

        applyRateLimit();

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(properties.getAwardLookbackDays());

        Map<String, Object> requestBody = buildSearchRequest(naicsCode, agency, startDate, endDate, page);

        log.info("Searching USAspending awards - NAICS: {}, agency: {}, page: {}, dateRange: {} to {}",
                naicsCode, agency, page, startDate, endDate);

        try {
            UsaSpendingSearchResponse response = restClient.post()
                    .uri("/search/spending_by_award/")
                    .body(requestBody)
                    .retrieve()
                    .body(UsaSpendingSearchResponse.class);

            if (response == null) {
                log.warn("Received null response from USAspending API");
                return List.of();
            }

            List<UsaSpendingAwardDto> awards = response.getAwards();
            log.info("Successfully fetched {} awards (total: {}, hasMore: {})",
                    awards.size(), response.getTotalCount(), response.hasMore());

            return awards;

        } catch (RestClientException e) {
            log.error("Error fetching awards from USAspending: {}", e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error fetching awards from USAspending: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Fetch all awards with pagination, respecting max results limit.
     *
     * @param naicsCode Optional NAICS code filter
     * @param agency    Optional agency filter
     * @return Aggregated list of all awards up to maxResults
     */
    public List<UsaSpendingAwardDto> fetchAllAwards(String naicsCode, String agency) {
        List<UsaSpendingAwardDto> allAwards = new ArrayList<>();
        int page = 1;
        int maxPages = properties.getMaxResults() / properties.getPageSize();

        while (page <= maxPages) {
            List<UsaSpendingAwardDto> pageAwards = searchAwards(naicsCode, agency, page);
            if (pageAwards.isEmpty()) {
                break;
            }
            allAwards.addAll(pageAwards);

            if (pageAwards.size() < properties.getPageSize()) {
                // Last page reached
                break;
            }
            page++;
        }

        log.info("Fetched total of {} awards across {} pages", allAwards.size(), page);
        return allAwards;
    }

    /**
     * Get spending data for a specific recipient by UEI.
     * Uses GET /recipient/{uei}/ endpoint.
     *
     * @param uei The Unique Entity Identifier
     * @return Map of recipient data, empty map on error
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getRecipientSpending(String uei) {
        if (!properties.isEnabled() || uei == null || uei.isBlank()) {
            return Map.of();
        }

        applyRateLimit();

        log.info("Fetching recipient spending data for UEI: {}", uei);

        try {
            Map<String, Object> response = restClient.get()
                    .uri("/recipient/{uei}/", uei)
                    .retrieve()
                    .body(Map.class);

            return response != null ? response : Map.of();

        } catch (RestClientException e) {
            log.error("Error fetching recipient data for UEI {}: {}", uei, e.getMessage());
            return Map.of();
        }
    }

    /**
     * Get agency budgetary resources.
     * Uses GET /agency/{toptier_code}/budgetary_resources/ endpoint.
     *
     * @param agencyCode The toptier agency code (e.g., "097" for DOD)
     * @return Map of budgetary data, empty map on error
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getAgencyBudget(String agencyCode) {
        if (!properties.isEnabled() || agencyCode == null || agencyCode.isBlank()) {
            return Map.of();
        }

        applyRateLimit();

        log.info("Fetching agency budget for code: {}", agencyCode);

        try {
            Map<String, Object> response = restClient.get()
                    .uri("/agency/{code}/budgetary_resources/", agencyCode)
                    .retrieve()
                    .body(Map.class);

            return response != null ? response : Map.of();

        } catch (RestClientException e) {
            log.error("Error fetching agency budget for code {}: {}", agencyCode, e.getMessage());
            return Map.of();
        }
    }

    /**
     * Get list of all toptier agencies.
     * Useful for populating agency dropdowns.
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getToptierAgencies() {
        if (!properties.isEnabled()) {
            return List.of();
        }

        applyRateLimit();

        log.info("Fetching toptier agencies list");

        try {
            Map<String, Object> response = restClient.get()
                    .uri("/references/toptier_agencies/")
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("results")) {
                return (List<Map<String, Object>>) response.get("results");
            }
            return List.of();

        } catch (RestClientException e) {
            log.error("Error fetching toptier agencies: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Builds the request body for the award search endpoint.
     */
    private Map<String, Object> buildSearchRequest(
            String naicsCode, String agency, LocalDate startDate, LocalDate endDate, int page) {

        Map<String, Object> request = new LinkedHashMap<>();

        // Award type filters (contracts only by default)
        request.put("filters", buildFilters(naicsCode, agency, startDate, endDate));

        // Fields to return
        request.put("fields", List.of(
                "Award ID",
                "Recipient Name",
                "recipient_id",
                "recipient_uei",
                "Start Date",
                "End Date",
                "Award Amount",
                "Total Outlays",
                "Description",
                "Awarding Agency",
                "Awarding Sub Agency",
                "Contract Award Type",
                "Award Type",
                "Place of Performance City",
                "Place of Performance State",
                "Place of Performance Zip",
                "Place of Performance Country",
                "NAICS Code",
                "NAICS Description",
                "PSC Code",
                "PSC Description",
                "Parent Award ID",
                "Last Modified Date",
                "generated_internal_id"
        ));

        // Pagination
        request.put("page", page);
        request.put("limit", properties.getPageSize());

        // Sort by award amount descending
        request.put("sort", "Award Amount");
        request.put("order", "desc");

        return request;
    }

    /**
     * Builds the filters object for the search request.
     */
    private Map<String, Object> buildFilters(
            String naicsCode, String agency, LocalDate startDate, LocalDate endDate) {

        Map<String, Object> filters = new LinkedHashMap<>();

        // Award types: A-D are contracts
        filters.put("award_type_codes", properties.getAwardTypes());

        // Time period filter
        List<Map<String, String>> timePeriod = List.of(Map.of(
                "start_date", startDate.format(DATE_FORMATTER),
                "end_date", endDate.format(DATE_FORMATTER)
        ));
        filters.put("time_period", timePeriod);

        // NAICS filter
        if (naicsCode != null && !naicsCode.isBlank()) {
            filters.put("naics_codes", List.of(naicsCode));
        }

        // Agency filter
        if (agency != null && !agency.isBlank()) {
            filters.put("agencies", List.of(Map.of(
                    "type", "awarding",
                    "tier", "toptier",
                    "name", agency
            )));
        }

        return filters;
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
     * Returns whether the integration is enabled.
     */
    public boolean isEnabled() {
        return properties.isEnabled();
    }
}
