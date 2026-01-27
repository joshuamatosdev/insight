package com.samgov.ingestor.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration properties for OAuth2 providers.
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "app.oauth2")
public class OAuth2Properties {

    /**
     * Whether OAuth2 login is enabled
     */
    private boolean enabled = false;

    /**
     * Frontend URL for redirects after OAuth login
     */
    private String frontendUrl = "http://localhost:5173";

    /**
     * OAuth callback path on frontend
     */
    private String callbackPath = "/oauth/callback";

    /**
     * Provider-specific configurations
     */
    private Map<String, ProviderConfig> providers = new HashMap<>();

    @Data
    public static class ProviderConfig {
        /**
         * Whether this provider is enabled
         */
        private boolean enabled = false;

        /**
         * Client ID for this provider
         */
        private String clientId;

        /**
         * Client secret for this provider
         */
        private String clientSecret;

        /**
         * Authorization URI (for custom providers)
         */
        private String authorizationUri;

        /**
         * Token URI (for custom providers)
         */
        private String tokenUri;

        /**
         * User info URI (for custom providers)
         */
        private String userInfoUri;

        /**
         * Scopes to request
         */
        private String[] scopes = new String[]{"openid", "email", "profile"};
    }

    /**
     * Get the full callback URL for a provider
     */
    public String getCallbackUrl(String provider) {
        return frontendUrl + callbackPath + "?provider=" + provider;
    }

    /**
     * Check if a specific provider is enabled
     */
    public boolean isProviderEnabled(String provider) {
        ProviderConfig config = providers.get(provider);
        return config != null && config.isEnabled();
    }
}
