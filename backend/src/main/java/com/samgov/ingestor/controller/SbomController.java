package com.samgov.ingestor.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for SBOM (Software Bill of Materials) access.
 * Provides SBOM data in multiple formats for compliance and security audits.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/sbom")
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class SbomController {

    private static final String CYCLONEDX_PATH = "sbom/bom.json";
    private static final String SPDX_PATH = "sbom/spdx.json";

    /**
     * Get SBOM overview and available formats.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getSbomInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "samgov-ingestor");
        info.put("sbomVersion", "1.0");
        info.put("formats", Map.of(
            "cyclonedx", "/api/v1/sbom/cyclonedx",
            "spdx", "/api/v1/sbom/spdx"
        ));
        info.put("cyclonedxAvailable", isResourceAvailable(CYCLONEDX_PATH));
        info.put("spdxAvailable", isResourceAvailable(SPDX_PATH));
        info.put("standard", "CycloneDX 1.5");
        info.put("generationCommand", "./gradlew cyclonedxBom");

        return ResponseEntity.ok(info);
    }

    /**
     * Download SBOM in CycloneDX JSON format.
     */
    @GetMapping("/cyclonedx")
    public ResponseEntity<String> getCycloneDxSbom() {
        String content = loadSbomResource(CYCLONEDX_PATH);

        if (content.startsWith("{\"error\"")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bom.json\"")
            .contentType(MediaType.APPLICATION_JSON)
            .body(content);
    }

    /**
     * Download SBOM in SPDX JSON format.
     */
    @GetMapping("/spdx")
    public ResponseEntity<String> getSpdxSbom() {
        String content = loadSbomResource(SPDX_PATH);

        if (content.startsWith("{\"error\"")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"spdx.json\"")
            .contentType(MediaType.APPLICATION_JSON)
            .body(content);
    }

    /**
     * Get SBOM vulnerabilities summary (requires additional tooling).
     */
    @GetMapping("/vulnerabilities")
    public ResponseEntity<Map<String, Object>> getVulnerabilities() {
        Map<String, Object> vulnInfo = new HashMap<>();
        vulnInfo.put("status", "not_implemented");
        vulnInfo.put("message", "Vulnerability scanning requires integration with tools like Grype, Trivy, or OSV-Scanner");
        vulnInfo.put("recommendation", "Run 'grype sbom:./build/reports/sbom/bom.json' to scan for vulnerabilities");

        return ResponseEntity.ok(vulnInfo);
    }

    private boolean isResourceAvailable(String path) {
        try {
            return new ClassPathResource(path).exists();
        } catch (Exception e) {
            return false;
        }
    }

    private String loadSbomResource(String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            if (resource.exists()) {
                return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            }
            return "{\"error\": \"SBOM not found. Generate with: ./gradlew cyclonedxBom\"}";
        } catch (IOException e) {
            log.error("Failed to load SBOM from {}", path, e);
            return "{\"error\": \"Failed to load SBOM: " + e.getMessage() + "\"}";
        }
    }
}
