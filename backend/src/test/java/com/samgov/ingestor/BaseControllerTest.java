package com.samgov.ingestor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.samgov.ingestor.config.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

/**
 * Base class for controller integration tests.
 *
 * Provides:
 * - Real PostgreSQL database (dev server)
 * - MockMvc for HTTP request simulation
 * - JSON serialization utilities
 * - Transactional test isolation
 * - Tenant context headers for multi-tenant tests
 *
 * Usage:
 * <pre>
 * class MyControllerTest extends BaseControllerTest {
 *     @Test
 *     void shouldDoSomething() throws Exception {
 *         performGet("/api/v1/resource")
 *             .andExpect(status().isOk());
 *     }
 * }
 * </pre>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Transactional
public abstract class BaseControllerTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    // Tenant and user IDs for test context - subclasses should set these in setUp()
    protected UUID testTenantId;
    protected UUID testUserId;

    /**
     * Override this method to perform test-specific setup before each test.
     * Subclasses should set testTenantId and testUserId for multi-tenant tests.
     */
    @BeforeEach
    protected void setUp() {
        // Subclasses can override for custom setup
    }

    /**
     * Add tenant context headers to a request builder.
     * Also sets TenantContext directly for service-layer access during tests.
     */
    protected MockHttpServletRequestBuilder withTenantContext(MockHttpServletRequestBuilder builder) {
        // Set headers for filter processing
        if (testTenantId != null) {
            builder.header("X-Tenant-Id", testTenantId.toString());
            // Also set TenantContext directly for service-layer access
            TenantContext.setCurrentTenantId(testTenantId);
        }
        if (testUserId != null) {
            builder.header("X-User-Id", testUserId.toString());
            TenantContext.setCurrentUserId(testUserId);
        }
        return builder;
    }

    /**
     * Serialize an object to JSON string.
     */
    protected String toJson(Object object) throws Exception {
        return objectMapper.writeValueAsString(object);
    }

    /**
     * Deserialize a JSON string to an object.
     */
    protected <T> T fromJson(String json, Class<T> clazz) throws Exception {
        return objectMapper.readValue(json, clazz);
    }

    /**
     * Perform a GET request to the specified URL.
     */
    protected ResultActions performGet(String url) throws Exception {
        return mockMvc.perform(withTenantContext(get(url)
            .contentType(MediaType.APPLICATION_JSON)));
    }

    /**
     * Perform a GET request with path variables.
     */
    protected ResultActions performGet(String url, Object... uriVars) throws Exception {
        return mockMvc.perform(withTenantContext(get(url, uriVars)
            .contentType(MediaType.APPLICATION_JSON)));
    }

    /**
     * Perform a POST request with a JSON body.
     */
    protected ResultActions performPost(String url, Object body) throws Exception {
        return mockMvc.perform(withTenantContext(post(url)
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(body))));
    }

    /**
     * Perform a POST request without a body.
     */
    protected ResultActions performPost(String url) throws Exception {
        return mockMvc.perform(withTenantContext(post(url)
            .contentType(MediaType.APPLICATION_JSON)));
    }

    /**
     * Perform a PUT request with a JSON body.
     */
    protected ResultActions performPut(String url, Object body) throws Exception {
        return mockMvc.perform(withTenantContext(put(url)
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(body))));
    }

    /**
     * Perform a PATCH request with a JSON body.
     */
    protected ResultActions performPatch(String url, Object body) throws Exception {
        return mockMvc.perform(withTenantContext(patch(url)
            .contentType(MediaType.APPLICATION_JSON)
            .content(toJson(body))));
    }

    /**
     * Perform a PATCH request without body.
     */
    protected ResultActions performPatch(String url) throws Exception {
        return mockMvc.perform(withTenantContext(patch(url)
            .contentType(MediaType.APPLICATION_JSON)));
    }

    /**
     * Perform a DELETE request.
     */
    protected ResultActions performDelete(String url) throws Exception {
        return mockMvc.perform(withTenantContext(delete(url)
            .contentType(MediaType.APPLICATION_JSON)));
    }

    /**
     * Perform a DELETE request with path variables.
     */
    protected ResultActions performDelete(String url, Object... uriVars) throws Exception {
        return mockMvc.perform(withTenantContext(delete(url, uriVars)
            .contentType(MediaType.APPLICATION_JSON)));
    }
}
