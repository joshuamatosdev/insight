package com.samgov.ingestor.controller;

import com.samgov.ingestor.BaseControllerTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.test.context.support.WithMockUser;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * E2E tests for SbomController endpoints.
 */
@DisplayName("SbomController")
class SbomControllerTest extends BaseControllerTest {

    private static final String BASE_URL = "/portal/sbom";

    @Nested
    @DisplayName("GET /sbom")
    class GetSbom {

        @Test
        @DisplayName("should return SBOM data")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnSbom() throws Exception {
            performGet(BASE_URL)
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /sbom/dependencies")
    class GetDependencies {

        @Test
        @DisplayName("should return dependencies")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnDependencies() throws Exception {
            performGet(BASE_URL + "/dependencies")
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /sbom/vulnerabilities")
    class GetVulnerabilities {

        @Test
        @DisplayName("should return vulnerabilities")
        @WithMockUser(username = "user", roles = {"USER"})
        void should_ReturnVulnerabilities() throws Exception {
            performGet(BASE_URL + "/vulnerabilities")
                .andExpect(status().isOk());
        }
    }
}
