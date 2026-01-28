package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.OpportunityDto;
import com.samgov.ingestor.model.Opportunity.OpportunityStatus;
import com.samgov.ingestor.service.OpportunityService;
import com.samgov.ingestor.service.OpportunityService.DashboardStats;
import com.samgov.ingestor.service.OpportunityService.FilterOptions;
import com.samgov.ingestor.service.OpportunityService.OpportunitySearchRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Slf4j
@RestController
@RequestMapping("/opportunities")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Validated
public class OpportunityController {

    private static final int MAX_PAGE_SIZE = 100;

    // Whitelist of allowed sort fields to prevent SQL column injection
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
        "responseDeadLine", "postedDate", "title", "agency", "naicsCode",
        "type", "status", "solicitationNumber", "state"
    );
    private static final String DEFAULT_SORT_FIELD = "responseDeadLine";

    private final OpportunityService opportunityService;

    @GetMapping("/{id}")
    public ResponseEntity<OpportunityDto> getOpportunity(@PathVariable String id) {
        return opportunityService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/solicitation/{solicitationNumber}")
    public ResponseEntity<OpportunityDto> getOpportunityBySolicitation(
        @PathVariable String solicitationNumber
    ) {
        return opportunityService.getBySolicitationNumber(solicitationNumber)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<OpportunityDto>> searchOpportunities(
        @RequestParam(required = false) @Size(max = 200) String keyword,
        @RequestParam(required = false) @Size(max = 6) String naicsCode,
        @RequestParam(required = false) @Size(max = 200) String agency,
        @RequestParam(required = false) @Size(max = 50) String setAsideType,
        @RequestParam(required = false) @Size(max = 50) String type,
        @RequestParam(required = false) Boolean isSbir,
        @RequestParam(required = false) Boolean isSttr,
        @RequestParam(required = false) Boolean sbirOrSttr,
        @RequestParam(required = false) @Size(max = 20) String phase,
        @RequestParam(required = false) @Size(max = 50) String state,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedDateFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate postedDateTo,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate responseDeadlineFrom,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate responseDeadlineTo,
        @RequestParam(required = false) OpportunityStatus status,
        @RequestParam(required = false, defaultValue = "true") Boolean activeOnly,
        @RequestParam(defaultValue = "0") @Min(0) int page,
        @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
        @RequestParam(defaultValue = "responseDeadLine") String sortBy,
        @RequestParam(defaultValue = "asc") String sortDirection
    ) {
        // Enforce max page size
        int safeSize = Math.min(size, MAX_PAGE_SIZE);
        // Validate sort field to prevent SQL column injection
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : DEFAULT_SORT_FIELD;
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), safeSortBy);
        Pageable pageable = PageRequest.of(page, safeSize, sort);

        OpportunitySearchRequest request = new OpportunitySearchRequest(
            keyword, naicsCode, agency, setAsideType, type,
            isSbir, isSttr, sbirOrSttr, phase, state,
            postedDateFrom, postedDateTo,
            responseDeadlineFrom, responseDeadlineTo,
            status, activeOnly
        );

        Page<OpportunityDto> result = opportunityService.search(request, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/active")
    public ResponseEntity<Page<OpportunityDto>> getActiveOpportunities(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result = opportunityService.getActiveOpportunities(pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/closing-soon")
    public ResponseEntity<List<OpportunityDto>> getClosingSoon(
        @RequestParam(defaultValue = "7") int days
    ) {
        List<OpportunityDto> result = opportunityService.getClosingSoon(days);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recent")
    public ResponseEntity<Page<OpportunityDto>> getRecentlyPosted(
        @RequestParam(defaultValue = "7") int days,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("postedDate").descending());
        Page<OpportunityDto> result = opportunityService.getRecentlyPosted(days, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/naics/{naicsCode}")
    public ResponseEntity<Page<OpportunityDto>> getByNaicsCode(
        @PathVariable String naicsCode,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result = opportunityService.getByNaicsCode(naicsCode, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/agency")
    public ResponseEntity<Page<OpportunityDto>> getByAgency(
        @RequestParam String name,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result = opportunityService.getByAgency(name, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/set-aside/{type}")
    public ResponseEntity<Page<OpportunityDto>> getBySetAsideType(
        @PathVariable String type,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result = opportunityService.getBySetAsideType(type, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sbir-sttr")
    public ResponseEntity<Page<OpportunityDto>> getSbirSttr(
        @RequestParam(required = false) String phase,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result;

        if (phase != null && !phase.isBlank()) {
            result = opportunityService.getSbirSttrByPhase(phase, pageable);
        } else {
            result = opportunityService.getSbirSttr(pageable);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<Page<OpportunityDto>> getByState(
        @PathVariable String state,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("responseDeadLine").ascending());
        Page<OpportunityDto> result = opportunityService.getByState(state, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = opportunityService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/filters")
    public ResponseEntity<FilterOptions> getFilterOptions() {
        FilterOptions options = opportunityService.getFilterOptions();
        return ResponseEntity.ok(options);
    }
}
