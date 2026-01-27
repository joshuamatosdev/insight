package com.samgov.ingestor.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

/**
 * Enhanced OpenAPI configuration with detailed documentation.
 */
@Configuration
public class OpenApiEnhancedConfig {

    @Value("${app.version:1.0.0}")
    private String appVersion;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(apiInfo())
            .externalDocs(externalDocs())
            .servers(servers())
            .tags(tags())
            .components(components())
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }

    private Info apiInfo() {
        return new Info()
            .title("SAM.gov Contract Intelligence API")
            .description("""
                ## Overview
                
                The SAM.gov Contract Intelligence API provides access to government contracting 
                opportunities, contract management, and business intelligence features.
                
                ## Authentication
                
                All API endpoints (except `/auth/*`) require a valid JWT token in the 
                `Authorization` header:
                
                ```
                Authorization: Bearer <your-jwt-token>
                ```
                
                ## Rate Limiting
                
                - General API: 100 requests/minute
                - Authentication endpoints: 10 requests/minute
                - Export endpoints: 5 requests/minute
                
                ## Error Handling
                
                All errors follow a consistent format:
                
                ```json
                {
                  "error": "ERROR_CODE",
                  "message": "Human-readable message",
                  "timestamp": "2024-01-15T10:30:00Z",
                  "path": "/api/v1/resource"
                }
                ```
                
                ## Pagination
                
                List endpoints support pagination with `page` and `size` parameters.
                Response includes `totalElements`, `totalPages`, and `number` (current page).
                """)
            .version(appVersion)
            .contact(new Contact()
                .name("API Support")
                .email("api-support@samgov.example.com")
                .url("https://docs.samgov.example.com"))
            .license(new License()
                .name("Proprietary")
                .url("https://samgov.example.com/license"));
    }

    private ExternalDocumentation externalDocs() {
        return new ExternalDocumentation()
            .description("SAM.gov Contract Intelligence Documentation")
            .url("https://docs.samgov.example.com");
    }

    private List<Server> servers() {
        return List.of(
            new Server()
                .url(baseUrl)
                .description("Current Environment"),
            new Server()
                .url("https://api.samgov.example.com")
                .description("Production"),
            new Server()
                .url("https://api-staging.samgov.example.com")
                .description("Staging")
        );
    }

    private List<Tag> tags() {
        return List.of(
            new Tag().name("Authentication")
                .description("User authentication and authorization"),
            new Tag().name("Opportunities")
                .description("Government contracting opportunities from SAM.gov"),
            new Tag().name("Contracts")
                .description("Contract management and tracking"),
            new Tag().name("Pipeline")
                .description("Opportunity pipeline and bid management"),
            new Tag().name("Users")
                .description("User management (Admin only)"),
            new Tag().name("Tenants")
                .description("Multi-tenant administration"),
            new Tag().name("Reports")
                .description("Reporting and analytics"),
            new Tag().name("Export")
                .description("Data export functionality"),
            new Tag().name("Search")
                .description("Advanced search features")
        );
    }

    private Components components() {
        return new Components()
            .addSecuritySchemes("bearerAuth", new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Enter your JWT token"))
            .addSchemas("ErrorResponse", errorResponseSchema())
            .addSchemas("PageResponse", pageResponseSchema());
    }

    @SuppressWarnings("rawtypes")
    private Schema errorResponseSchema() {
        return new Schema<>()
            .type("object")
            .description("Standard error response")
            .addProperty("error", new Schema<String>().type("string").example("NOT_FOUND"))
            .addProperty("message", new Schema<String>().type("string").example("Resource not found"))
            .addProperty("timestamp", new Schema<String>().type("string").format("date-time"))
            .addProperty("path", new Schema<String>().type("string").example("/api/v1/opportunities/123"));
    }

    @SuppressWarnings("rawtypes")
    private Schema pageResponseSchema() {
        return new Schema<>()
            .type("object")
            .description("Paginated response wrapper")
            .addProperty("content", new Schema<>().type("array"))
            .addProperty("totalElements", new Schema<Long>().type("integer").format("int64"))
            .addProperty("totalPages", new Schema<Integer>().type("integer"))
            .addProperty("number", new Schema<Integer>().type("integer"))
            .addProperty("size", new Schema<Integer>().type("integer"));
    }
}
