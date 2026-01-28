package com.samgov.ingestor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for OpenAI API integration via Spring AI.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "spring.ai.openai")
public class OpenAIConfig {

    /**
     * OpenAI API key (maps to spring.ai.openai.api-key).
     */
    private String apiKey;

    /**
     * Whether AI features are enabled.
     */
    private boolean enabled = true;

    /**
     * Chat options configuration.
     */
    private ChatOptions chat = new ChatOptions();

    @Data
    public static class ChatOptions {
        private Options options = new Options();

        @Data
        public static class Options {
            /**
             * Model to use (e.g., gpt-4, gpt-4o, gpt-3.5-turbo).
             */
            private String model = "gpt-4o";

            /**
             * Temperature for response creativity (0.0-2.0).
             */
            private double temperature = 0.3;

            /**
             * Maximum tokens for responses.
             */
            private int maxTokens = 2000;
        }
    }
}
