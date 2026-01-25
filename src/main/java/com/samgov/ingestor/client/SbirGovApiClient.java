package com.samgov.ingestor.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.config.SbirGovProperties;
import com.samgov.ingestor.dto.SbirAwardDto;
import com.samgov.ingestor.dto.SbirSolicitationDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * SBIR.gov API client for fetching SBIR/STTR awards and solicitations.
 * API Documentation: https://www.sbir.gov/api
 * 
 * Note: Uses ReentrantLock instead of synchronized to avoid pinning virtual threads.
 */
@Service
public class SbirGovApiClient {

    private static final Logger log = LoggerFactory.getLogger(SbirGovApiClient.class);

    private final RestClient restClient;
    private final SbirGovProperties properties;
    private final ObjectMapper objectMapper;
    private final Lock rateLimitLock = new ReentrantLock();
    private volatile long lastCallTime = 0;

    public SbirGovApiClient(SbirGovProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .build();
    }

    /**
     * Fetches SBIR/STTR awards from SBIR.gov API.
     * Supports filtering by agency and year.
     *
     * @param agency Agency code (DOD, NASA, NSF, etc.) or null for all
     * @param year   Award year or null for recent
     * @return List of SbirAwardDto
     */
    public List<SbirAwardDto> fetchAwards(String agency, Integer year) {
        List<SbirAwardDto> allAwards = new ArrayList<>();
        int start = 0;
        int rows = properties.getRowsPerRequest();
        boolean hasMore = true;

        while (hasMore && start < properties.getMaxResults()) {
            applyRateLimit();
            
            final int currentStart = start;

            try {
                String response = restClient.get()
                        .uri(uriBuilder -> {
                            uriBuilder.path("/awards");
                            if (agency != null && !agency.isBlank()) {
                                uriBuilder.queryParam("agency", agency);
                            }
                            if (year != null) {
                                uriBuilder.queryParam("year", year);
                            }
                            uriBuilder.queryParam("rows", rows);
                            uriBuilder.queryParam("start", currentStart);
                            return uriBuilder.build();
                        })
                        .retrieve()
                        .body(String.class);

                if (response == null || response.isBlank()) {
                    log.warn("Empty response from SBIR.gov API");
                    break;
                }

                List<SbirAwardDto> awards = objectMapper.readValue(response, 
                        new TypeReference<List<SbirAwardDto>>() {});

                if (awards == null || awards.isEmpty()) {
                    hasMore = false;
                } else {
                    allAwards.addAll(awards);
                    start += rows;
                    log.debug("Fetched {} awards, total so far: {}", awards.size(), allAwards.size());
                    
                    // If we got fewer than requested, we've reached the end
                    if (awards.size() < rows) {
                        hasMore = false;
                    }
                }

            } catch (RestClientException e) {
                log.error("Error fetching awards from SBIR.gov: {}", e.getMessage());
                break;
            } catch (Exception e) {
                log.error("Unexpected error parsing SBIR.gov response: {}", e.getMessage(), e);
                break;
            }
        }

        log.info("Fetched {} total awards from SBIR.gov (agency: {}, year: {})", 
                allAwards.size(), agency, year);
        return allAwards;
    }

    /**
     * Fetches awards for all configured agencies.
     */
    public List<SbirAwardDto> fetchAwardsForAllAgencies(Integer year) {
        List<SbirAwardDto> allAwards = new ArrayList<>();
        
        for (String agency : properties.getAgencies()) {
            log.info("Fetching SBIR awards for agency: {}", agency);
            List<SbirAwardDto> agencyAwards = fetchAwards(agency, year);
            allAwards.addAll(agencyAwards);
        }
        
        return allAwards;
    }

    /**
     * Fetches recent awards (current year and previous year).
     */
    public List<SbirAwardDto> fetchRecentAwards() {
        int currentYear = java.time.Year.now().getValue();
        List<SbirAwardDto> allAwards = new ArrayList<>();
        
        // Fetch current year
        allAwards.addAll(fetchAwardsForAllAgencies(currentYear));
        
        // Fetch previous year
        allAwards.addAll(fetchAwardsForAllAgencies(currentYear - 1));
        
        return allAwards;
    }

    /**
     * Fetches open solicitations from SBIR.gov API.
     * Note: This endpoint may be under maintenance per SBIR.gov notice.
     *
     * @return List of SbirSolicitationDto
     */
    public List<SbirSolicitationDto> fetchOpenSolicitations() {
        applyRateLimit();

        try {
            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/solicitations")
                            .queryParam("open", "1")
                            .build())
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                log.warn("Empty response from SBIR.gov solicitations API");
                return List.of();
            }

            List<SbirSolicitationDto> solicitations = objectMapper.readValue(response,
                    new TypeReference<List<SbirSolicitationDto>>() {});

            log.info("Fetched {} open solicitations from SBIR.gov", 
                    solicitations != null ? solicitations.size() : 0);
            return solicitations != null ? solicitations : List.of();

        } catch (RestClientException e) {
            log.error("Error fetching solicitations from SBIR.gov: {}", e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error parsing SBIR.gov solicitations: {}", e.getMessage(), e);
            return List.of();
        }
    }

    /**
     * Search awards by company/firm name.
     */
    public List<SbirAwardDto> searchByFirm(String firmName) {
        applyRateLimit();

        try {
            String response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/awards")
                            .queryParam("firm", firmName)
                            .queryParam("rows", properties.getRowsPerRequest())
                            .build())
                    .retrieve()
                    .body(String.class);

            if (response == null || response.isBlank()) {
                return List.of();
            }

            List<SbirAwardDto> awards = objectMapper.readValue(response,
                    new TypeReference<List<SbirAwardDto>>() {});

            log.info("Found {} awards for firm: {}", awards != null ? awards.size() : 0, firmName);
            return awards != null ? awards : List.of();

        } catch (Exception e) {
            log.error("Error searching SBIR.gov by firm: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Search awards by research keywords.
     */
    public List<SbirAwardDto> searchByKeyword(String keyword, String agency) {
        // SBIR.gov API doesn't have a direct keyword search, 
        // so we fetch and filter client-side
        List<SbirAwardDto> awards = fetchAwards(agency, null);
        
        String keywordLower = keyword.toLowerCase();
        return awards.stream()
                .filter(a -> {
                    String title = a.awardTitle() != null ? a.awardTitle().toLowerCase() : "";
                    String abstractText = a.abstractText() != null ? a.abstractText().toLowerCase() : "";
                    String keywords = a.researchAreaKeywords() != null ? a.researchAreaKeywords().toLowerCase() : "";
                    return title.contains(keywordLower) || 
                           abstractText.contains(keywordLower) || 
                           keywords.contains(keywordLower);
                })
                .toList();
    }

    /**
     * Get list of configured agencies.
     */
    public List<String> getConfiguredAgencies() {
        return properties.getAgencies();
    }

    /**
     * Check if SBIR.gov integration is enabled.
     */
    public boolean isEnabled() {
        return properties.isEnabled();
    }

    /**
     * Applies rate limiting to avoid overwhelming the SBIR.gov API.
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
                    log.debug("Rate limiting SBIR.gov: sleeping for {}ms", sleepTime);
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
}
