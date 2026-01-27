package com.samgov.ingestor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for OpenAI API integration.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "openai")
public class OpenAIConfig {

    /**
     * OpenAI API key.
     */
    private String apiKey;

    /**
     * Model to use for completions (e.g., gpt-4, gpt-3.5-turbo).
     */
    private String model = "gpt-4";

    /**
     * Maximum tokens for responses.
     */
    private int maxTokens = 2000;

    /**
     * Temperature for response creativity (0.0-2.0).
     */
    private double temperature = 0.3;

    /**
     * Base URL for OpenAI API.
     */
    private String baseUrl = "https://api.openai.com/v1";

    /**
     * Timeout for API calls in seconds.
     */
    private int timeout = 60;

    /**
     * Whether AI features are enabled.
     */
    private boolean enabled = true;
}
