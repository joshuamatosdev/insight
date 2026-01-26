package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.CreateTenantRequest;
import com.samgov.ingestor.dto.TenantDto;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.Tenant.SubscriptionTier;
import com.samgov.ingestor.model.Tenant.TenantStatus;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final TenantMembershipRepository membershipRepository;

    @Transactional
    public TenantDto createTenant(CreateTenantRequest request) {
        log.info("Creating tenant: {}", request.getName());

        String slug = request.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(request.getName());
        }

        if (tenantRepository.existsBySlug(slug)) {
            throw new IllegalArgumentException("Tenant with slug '" + slug + "' already exists");
        }

        if (request.getDomain() != null && tenantRepository.existsByDomain(request.getDomain())) {
            throw new IllegalArgumentException("Tenant with domain '" + request.getDomain() + "' already exists");
        }

        Tenant tenant = Tenant.builder()
            .name(request.getName())
            .slug(slug)
            .domain(request.getDomain())
            .status(TenantStatus.ACTIVE)
            .subscriptionTier(SubscriptionTier.FREE)
            .logoUrl(request.getLogoUrl())
            .primaryColor(request.getPrimaryColor())
            .trialEndsAt(Instant.now().plus(14, ChronoUnit.DAYS))
            .build();

        tenant = tenantRepository.save(tenant);
        log.info("Created tenant with id: {}", tenant.getId());

        return TenantDto.fromEntity(tenant);
    }

    @Transactional(readOnly = true)
    public Optional<TenantDto> getTenantById(UUID id) {
        return tenantRepository.findById(id)
            .map(TenantDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Optional<TenantDto> getTenantBySlug(String slug) {
        return tenantRepository.findBySlug(slug)
            .map(TenantDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<TenantDto> getAllActiveTenants() {
        return tenantRepository.findByStatus(TenantStatus.ACTIVE)
            .stream()
            .map(TenantDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public TenantDto updateTenant(UUID id, CreateTenantRequest request) {
        log.info("Updating tenant: {}", id);

        Tenant tenant = tenantRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + id));

        if (request.getName() != null) {
            tenant.setName(request.getName());
        }

        if (request.getDomain() != null) {
            if (!request.getDomain().equals(tenant.getDomain()) &&
                tenantRepository.existsByDomain(request.getDomain())) {
                throw new IllegalArgumentException("Domain already in use: " + request.getDomain());
            }
            tenant.setDomain(request.getDomain());
        }

        if (request.getLogoUrl() != null) {
            tenant.setLogoUrl(request.getLogoUrl());
        }

        if (request.getPrimaryColor() != null) {
            tenant.setPrimaryColor(request.getPrimaryColor());
        }

        tenant = tenantRepository.save(tenant);
        return TenantDto.fromEntity(tenant);
    }

    @Transactional
    public void updateSubscriptionTier(UUID tenantId, SubscriptionTier tier) {
        log.info("Updating subscription tier for tenant {}: {}", tenantId, tier);

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        tenant.setSubscriptionTier(tier);
        tenantRepository.save(tenant);
    }

    @Transactional
    public void suspendTenant(UUID tenantId) {
        log.info("Suspending tenant: {}", tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        tenant.setStatus(TenantStatus.SUSPENDED);
        tenantRepository.save(tenant);
    }

    @Transactional
    public void activateTenant(UUID tenantId) {
        log.info("Activating tenant: {}", tenantId);

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        tenant.setStatus(TenantStatus.ACTIVE);
        tenantRepository.save(tenant);
    }

    private String generateSlug(String name) {
        String baseSlug = name.toLowerCase()
            .replaceAll("[^a-z0-9]+", "-")
            .replaceAll("^-|-$", "");

        String slug = baseSlug;
        int counter = 1;

        while (tenantRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter;
            counter++;
        }

        return slug;
    }

    @Transactional(readOnly = true)
    public List<TenantMembershipDto> getTenantMemberships(UUID tenantId) {
        return membershipRepository.findByTenantId(tenantId)
            .stream()
            .map(TenantMembershipDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean existsById(UUID tenantId) {
        return tenantRepository.existsById(tenantId);
    }
}
