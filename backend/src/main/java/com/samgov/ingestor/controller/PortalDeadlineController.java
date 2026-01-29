package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.UpcomingDeadlineDto;
import com.samgov.ingestor.service.PortalDeadlineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller for portal deadline aggregation endpoints.
 */
@Slf4j
@RestController
@RequestMapping("/portal/deadlines")
@RequiredArgsConstructor
public class PortalDeadlineController {

    private final PortalDeadlineService deadlineService;

    /**
     * Get upcoming deadlines aggregated from multiple sources.
     *
     * @param daysAhead Number of days to look ahead (default 30)
     * @return List of upcoming deadlines sorted by due date
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<UpcomingDeadlineDto>> getUpcomingDeadlines(
            @RequestParam(defaultValue = "30") int daysAhead) {
        log.debug("Request for upcoming deadlines within {} days", daysAhead);
        List<UpcomingDeadlineDto> deadlines = deadlineService.getUpcomingDeadlines(daysAhead);
        return ResponseEntity.ok(deadlines);
    }
}
