package com.samgov.ingestor.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Standard API error response format.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard error response for API errors")
public class ApiErrorResponse {

    @Schema(description = "Error code", example = "VALIDATION_ERROR")
    private String error;

    @Schema(description = "Human-readable error message", example = "Validation failed")
    private String message;

    @Schema(description = "Timestamp of the error", example = "2024-01-15T10:30:00Z")
    private Instant timestamp;

    @Schema(description = "Request path that caused the error", example = "/api/v1/opportunities")
    private String path;

    @Schema(description = "Detailed validation errors (for validation failures)")
    private List<FieldError> fieldErrors;

    @Schema(description = "Request ID for tracking", example = "abc-123-def-456")
    private String requestId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Field-level validation error")
    public static class FieldError {
        @Schema(description = "Field name", example = "email")
        private String field;

        @Schema(description = "Error message", example = "must be a valid email address")
        private String message;

        @Schema(description = "Rejected value", example = "invalid-email")
        private Object rejectedValue;
    }

    /**
     * Common error codes
     */
    public static class ErrorCode {
        public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
        public static final String NOT_FOUND = "NOT_FOUND";
        public static final String UNAUTHORIZED = "UNAUTHORIZED";
        public static final String FORBIDDEN = "FORBIDDEN";
        public static final String CONFLICT = "CONFLICT";
        public static final String RATE_LIMITED = "RATE_LIMITED";
        public static final String INTERNAL_ERROR = "INTERNAL_ERROR";
        public static final String BAD_REQUEST = "BAD_REQUEST";
        public static final String SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
    }

    public static ApiErrorResponse notFound(String path, String message) {
        return ApiErrorResponse.builder()
            .error(ErrorCode.NOT_FOUND)
            .message(message)
            .timestamp(Instant.now())
            .path(path)
            .build();
    }

    public static ApiErrorResponse validationError(String path, List<FieldError> errors) {
        return ApiErrorResponse.builder()
            .error(ErrorCode.VALIDATION_ERROR)
            .message("Validation failed")
            .timestamp(Instant.now())
            .path(path)
            .fieldErrors(errors)
            .build();
    }

    public static ApiErrorResponse unauthorized(String path) {
        return ApiErrorResponse.builder()
            .error(ErrorCode.UNAUTHORIZED)
            .message("Authentication required")
            .timestamp(Instant.now())
            .path(path)
            .build();
    }

    public static ApiErrorResponse forbidden(String path) {
        return ApiErrorResponse.builder()
            .error(ErrorCode.FORBIDDEN)
            .message("Access denied")
            .timestamp(Instant.now())
            .path(path)
            .build();
    }

    public static ApiErrorResponse internalError(String path, String requestId) {
        return ApiErrorResponse.builder()
            .error(ErrorCode.INTERNAL_ERROR)
            .message("An unexpected error occurred")
            .timestamp(Instant.now())
            .path(path)
            .requestId(requestId)
            .build();
    }
}
