package com.samgov.ingestor.controller;

import com.samgov.ingestor.service.AlertService;
import com.samgov.ingestor.service.AlertService.AlertDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<Page<AlertDto>> getMyAlerts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AlertDto> alerts = alertService.getMyAlerts(pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/unread")
    public ResponseEntity<Page<AlertDto>> getUnreadAlerts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<AlertDto> alerts = alertService.getUnreadAlerts(pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/count")
    public ResponseEntity<AlertCountResponse> getUnreadCount() {
        long count = alertService.getUnreadCount();
        return ResponseEntity.ok(new AlertCountResponse(count));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<AlertDto> markAsRead(@PathVariable UUID id) {
        AlertDto alert = alertService.markAsRead(id);
        return ResponseEntity.ok(alert);
    }

    @PostMapping("/read-all")
    public ResponseEntity<MarkAllReadResponse> markAllAsRead() {
        int count = alertService.markAllAsRead();
        return ResponseEntity.ok(new MarkAllReadResponse(count));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> dismissAlert(@PathVariable UUID id) {
        alertService.dismissAlert(id);
        return ResponseEntity.noContent().build();
    }

    public record AlertCountResponse(long count) {}

    public record MarkAllReadResponse(int markedCount) {}
}
