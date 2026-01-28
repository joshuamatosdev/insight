package com.samgov.ingestor.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * SBOM (Software Bill of Materials) configuration and endpoint.
 * Provides access to SBOM data in CycloneDX and SPDX formats.
 */
@Slf4j
@Component
@Endpoint(id = "sbom")
public class SbomConfig {

    private static final String CYCLONEDX_PATH = "sbom/bom.json";
    private static final String SPDX_PATH = "sbom/spdx.json";

    /**
     * Actuator endpoint to retrieve SBOM information.
     * Access via /actuator/sbom
     */
    @ReadOperation
    public Map<String, Object> getSbomInfo() {
        Map<String, Object> sbomInfo = new HashMap<>();

        sbomInfo.put("formats", Map.of(
            "cyclonedx", "/actuator/sbom/cyclonedx",
            "spdx", "/actuator/sbom/spdx"
        ));

        sbomInfo.put("cyclonedxAvailable", isResourceAvailable(CYCLONEDX_PATH));
        sbomInfo.put("spdxAvailable", isResourceAvailable(SPDX_PATH));
        sbomInfo.put("generatedBy", "gradle-cyclonedx-plugin");
        sbomInfo.put("specification", "CycloneDX 1.5");

        return sbomInfo;
    }

    @ReadOperation
    public String getCycloneDxSbom() {
        return loadSbomResource(CYCLONEDX_PATH);
    }

    @ReadOperation
    public String getSpdxSbom() {
        return loadSbomResource(SPDX_PATH);
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
            return "{\"error\": \"SBOM not found. Run './gradlew cyclonedxBom' to generate.\"}";
        } catch (IOException e) {
            log.error("Failed to load SBOM from {}", path, e);
            return "{\"error\": \"Failed to load SBOM: " + e.getMessage() + "\"}";
        }
    }
}
