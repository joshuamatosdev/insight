package com.samgov.ingestor.config;

import java.util.UUID;

/**
 * Holds the current tenant context in a ThreadLocal for multi-tenant isolation.
 * The tenant ID is extracted from the JWT token and set by the TenantFilter.
 */
public final class TenantContext {

    private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();
    private static final ThreadLocal<UUID> CURRENT_USER = new ThreadLocal<>();

    private TenantContext() {
        // Utility class
    }

    public static UUID getCurrentTenantId() {
        return CURRENT_TENANT.get();
    }

    public static void setCurrentTenantId(UUID tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static UUID getCurrentUserId() {
        return CURRENT_USER.get();
    }

    public static void setCurrentUserId(UUID userId) {
        CURRENT_USER.set(userId);
    }

    public static void clear() {
        CURRENT_TENANT.remove();
        CURRENT_USER.remove();
    }

    public static boolean hasTenant() {
        return CURRENT_TENANT.get() != null;
    }

    public static boolean hasUser() {
        return CURRENT_USER.get() != null;
    }
}
