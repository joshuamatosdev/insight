package com.samgov.ingestor.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;

import java.io.IOException;

/**
 * Security headers configuration for OWASP compliance.
 */
@Configuration
public class SecurityHeadersConfig {

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public Filter securityHeadersFilter() {
        return new SecurityHeadersFilter();
    }

    private static class SecurityHeadersFilter implements Filter {

        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
                throws IOException, ServletException {
            
            if (response instanceof HttpServletResponse httpResponse) {
                // Prevent clickjacking
                httpResponse.setHeader("X-Frame-Options", "DENY");
                
                // Prevent MIME type sniffing
                httpResponse.setHeader("X-Content-Type-Options", "nosniff");
                
                // Enable XSS protection
                httpResponse.setHeader("X-XSS-Protection", "1; mode=block");
                
                // Referrer policy
                httpResponse.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
                
                // Content Security Policy
                httpResponse.setHeader("Content-Security-Policy", buildCsp());
                
                // Permissions policy
                httpResponse.setHeader("Permissions-Policy", 
                    "geolocation=(), microphone=(), camera=(), payment=()");
                
                // Strict Transport Security (for HTTPS)
                httpResponse.setHeader("Strict-Transport-Security", 
                    "max-age=31536000; includeSubDomains; preload");
                
                // Cache control for sensitive data
                if (request.getServletContext().getContextPath().contains("/api/")) {
                    httpResponse.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
                    httpResponse.setHeader("Pragma", "no-cache");
                }
            }
            
            chain.doFilter(request, response);
        }

        private String buildCsp() {
            return String.join("; ",
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: https:",
                "font-src 'self' data:",
                "connect-src 'self' https://api.sam.gov",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            );
        }
    }
}
