package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.TenantBrandingDTO;
import com.samgov.ingestor.dto.TenantSettingsDTO;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantBranding;
import com.samgov.ingestor.model.TenantSettings;
import com.samgov.ingestor.repository.TenantBrandingRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.TenantSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantAdminService {

    private final TenantRepository tenantRepository;
    private final TenantSettingsRepository settingsRepository;
    private final TenantBrandingRepository brandingRepository;

    /**
     * Get tenant settings, creating defaults if not exists.
     */
    @Transactional
    public TenantSettingsDTO getSettings(UUID tenantId) {
        TenantSettings settings = settingsRepository.findByTenantId(tenantId)
            .orElseGet(() -> createDefaultSettings(tenantId));
        return TenantSettingsDTO.fromEntity(settings);
    }

    /**
     * Update tenant settings.
     */
    @Transactional
    public TenantSettingsDTO updateSettings(UUID tenantId, TenantSettingsDTO dto) {
        TenantSettings settings = settingsRepository.findByTenantId(tenantId)
            .orElseGet(() -> createDefaultSettings(tenantId));

        settings.setTimezone(dto.getTimezone());
        settings.setDateFormat(dto.getDateFormat());
        settings.setCurrency(dto.getCurrency());
        settings.setMfaRequired(dto.isMfaRequired());
        settings.setSessionTimeoutMinutes(dto.getSessionTimeoutMinutes());
        settings.setPasswordExpiryDays(dto.getPasswordExpiryDays());
        settings.setSsoEnabled(dto.isSsoEnabled());
        settings.setSsoProvider(dto.getSsoProvider());
        settings.setSsoConfig(dto.getSsoConfig());

        settings = settingsRepository.save(settings);
        log.info("Updated settings for tenant: {}", tenantId);

        return TenantSettingsDTO.fromEntity(settings);
    }

    /**
     * Get tenant branding, creating defaults if not exists.
     */
    @Transactional
    public TenantBrandingDTO getBranding(UUID tenantId) {
        TenantBranding branding = brandingRepository.findByTenantId(tenantId)
            .orElseGet(() -> createDefaultBranding(tenantId));
        return TenantBrandingDTO.fromEntity(branding);
    }

    /**
     * Update tenant branding.
     */
    @Transactional
    public TenantBrandingDTO updateBranding(UUID tenantId, TenantBrandingDTO dto) {
        TenantBranding branding = brandingRepository.findByTenantId(tenantId)
            .orElseGet(() -> createDefaultBranding(tenantId));

        branding.setLogoUrl(dto.getLogoUrl());
        branding.setFaviconUrl(dto.getFaviconUrl());
        branding.setPrimaryColor(dto.getPrimaryColor());
        branding.setSecondaryColor(dto.getSecondaryColor());
        branding.setAccentColor(dto.getAccentColor());
        branding.setCompanyName(dto.getCompanyName());
        branding.setSupportEmail(dto.getSupportEmail());
        branding.setSupportPhone(dto.getSupportPhone());
        branding.setCustomCss(dto.getCustomCss());
        branding.setLoginMessage(dto.getLoginMessage());

        branding = brandingRepository.save(branding);
        log.info("Updated branding for tenant: {}", tenantId);

        return TenantBrandingDTO.fromEntity(branding);
    }

    private TenantSettings createDefaultSettings(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        TenantSettings settings = TenantSettings.builder()
            .tenant(tenant)
            .build();

        return settingsRepository.save(settings);
    }

    private TenantBranding createDefaultBranding(UUID tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        TenantBranding branding = TenantBranding.builder()
            .tenant(tenant)
            .companyName(tenant.getName())
            .build();

        return brandingRepository.save(branding);
    }
}
