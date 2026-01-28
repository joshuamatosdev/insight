package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.TenantBranding;
import jakarta.validation.constraints.Pattern;
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
public class TenantBrandingDTO {

    private UUID id;
    private UUID tenantId;

    private String logoUrl;
    private String faviconUrl;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color format")
    private String primaryColor;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color format")
    private String secondaryColor;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color format")
    private String accentColor;

    private String companyName;
    private String supportEmail;
    private String supportPhone;
    private String customCss;
    private String loginMessage;

    private Instant createdAt;
    private Instant updatedAt;

    public static TenantBrandingDTO fromEntity(TenantBranding entity) {
        if (entity == null) {
            return null;
        }
        return TenantBrandingDTO.builder()
            .id(entity.getId())
            .tenantId(entity.getTenant() != null ? entity.getTenant().getId() : null)
            .logoUrl(entity.getLogoUrl())
            .faviconUrl(entity.getFaviconUrl())
            .primaryColor(entity.getPrimaryColor())
            .secondaryColor(entity.getSecondaryColor())
            .accentColor(entity.getAccentColor())
            .companyName(entity.getCompanyName())
            .supportEmail(entity.getSupportEmail())
            .supportPhone(entity.getSupportPhone())
            .customCss(entity.getCustomCss())
            .loginMessage(entity.getLoginMessage())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
