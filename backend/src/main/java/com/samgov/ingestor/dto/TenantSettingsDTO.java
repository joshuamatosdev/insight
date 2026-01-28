package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.TenantSettings;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
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
public class TenantSettingsDTO {

    private UUID id;
    private UUID tenantId;

    @NotBlank
    private String timezone;

    @NotBlank
    private String dateFormat;

    @NotBlank
    private String currency;

    private boolean mfaRequired;

    @Min(5)
    @Max(1440)
    private int sessionTimeoutMinutes;

    @Min(0)
    @Max(365)
    private int passwordExpiryDays;

    private boolean ssoEnabled;
    private String ssoProvider;
    private String ssoConfig;

    private Instant createdAt;
    private Instant updatedAt;

    public static TenantSettingsDTO fromEntity(TenantSettings entity) {
        if (entity == null) {
            return null;
        }
        return TenantSettingsDTO.builder()
            .id(entity.getId())
            .tenantId(entity.getTenant() != null ? entity.getTenant().getId() : null)
            .timezone(entity.getTimezone())
            .dateFormat(entity.getDateFormat())
            .currency(entity.getCurrency())
            .mfaRequired(entity.isMfaRequired())
            .sessionTimeoutMinutes(entity.getSessionTimeoutMinutes())
            .passwordExpiryDays(entity.getPasswordExpiryDays())
            .ssoEnabled(entity.isSsoEnabled())
            .ssoProvider(entity.getSsoProvider())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
