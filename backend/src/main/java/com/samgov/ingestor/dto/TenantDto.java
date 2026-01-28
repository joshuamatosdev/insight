package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.model.Tenant.TenantStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TenantDto {

    private UUID id;
    private String name;
    private String slug;
    private String domain;
    private TenantStatus status;
    private SubscriptionTier subscriptionTier;
    private String logoUrl;
    private String primaryColor;
    private Instant trialEndsAt;
    private Instant subscriptionEndsAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static TenantDto fromEntity(Tenant tenant) {
        return TenantDto.builder()
            .id(tenant.getId())
            .name(tenant.getName())
            .slug(tenant.getSlug())
            .domain(tenant.getDomain())
            .status(tenant.getStatus())
            .subscriptionTier(tenant.getSubscriptionTier())
            .logoUrl(tenant.getLogoUrl())
            .primaryColor(tenant.getPrimaryColor())
            .trialEndsAt(tenant.getTrialEndsAt())
            .subscriptionEndsAt(tenant.getSubscriptionEndsAt())
            .createdAt(tenant.getCreatedAt())
            .updatedAt(tenant.getUpdatedAt())
            .build();
    }
}
