package com.samgov.ingestor.util;

import org.springframework.web.util.HtmlUtils;

import java.util.regex.Pattern;

/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 */
public final class InputSanitizer {

    private InputSanitizer() {}

    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
        "<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);
    
    private static final Pattern EVENT_HANDLER_PATTERN = Pattern.compile(
        "\\s+on\\w+\\s*=", Pattern.CASE_INSENSITIVE);
    
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "('|--|;|/\\*|\\*/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|" +
        "cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|" +
        "sys|sysobjects|syscolumns|table|update|xp_)",
        Pattern.CASE_INSENSITIVE);

    /**
     * Sanitize HTML content by escaping dangerous characters.
     */
    public static String sanitizeHtml(String input) {
        if (input == null) {
            return null;
        }
        return HtmlUtils.htmlEscape(input);
    }

    /**
     * Remove all HTML tags from input.
     */
    public static String stripHtml(String input) {
        if (input == null) {
            return null;
        }
        // Remove script tags and their content
        String result = SCRIPT_PATTERN.matcher(input).replaceAll("");
        // Remove all remaining HTML tags
        result = result.replaceAll("<[^>]+>", "");
        // Unescape HTML entities
        return HtmlUtils.htmlUnescape(result).trim();
    }

    /**
     * Sanitize input for safe use in logs (prevent log injection).
     */
    public static String sanitizeForLog(String input) {
        if (input == null) {
            return null;
        }
        return input
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t");
    }

    /**
     * Sanitize filename to prevent path traversal.
     */
    public static String sanitizeFilename(String filename) {
        if (filename == null) {
            return null;
        }
        return filename
            .replaceAll("[^a-zA-Z0-9._-]", "_")
            .replaceAll("\\.\\.", "_")
            .replaceAll("^\\.", "_");
    }

    /**
     * Check if input contains potential SQL injection patterns.
     */
    public static boolean containsSqlInjection(String input) {
        if (input == null) {
            return false;
        }
        return SQL_INJECTION_PATTERN.matcher(input).find();
    }

    /**
     * Check if input contains potential XSS patterns.
     */
    public static boolean containsXss(String input) {
        if (input == null) {
            return false;
        }
        return SCRIPT_PATTERN.matcher(input).find() || 
               EVENT_HANDLER_PATTERN.matcher(input).find() ||
               input.contains("javascript:");
    }

    /**
     * Sanitize email address.
     */
    public static String sanitizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.toLowerCase().trim();
    }

    /**
     * Truncate string to maximum length.
     */
    public static String truncate(String input, int maxLength) {
        if (input == null) {
            return null;
        }
        if (input.length() <= maxLength) {
            return input;
        }
        return input.substring(0, maxLength);
    }
}
