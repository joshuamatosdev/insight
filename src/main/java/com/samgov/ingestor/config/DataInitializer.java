package com.samgov.ingestor.config;

import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    private static final Map<String, String> ROLE_DESCRIPTIONS = Map.of(
        Role.SUPER_ADMIN, "System-wide administrator with full access to all tenants",
        Role.TENANT_ADMIN, "Administrator for a specific tenant organization",
        Role.MANAGER, "Can manage users and opportunities within their tenant",
        Role.USER, "Standard user with access to opportunities and pipeline",
        Role.VIEWER, "Read-only access to tenant data"
    );

    @Override
    @Transactional
    public void run(String... args) {
        initializeRoles();
    }

    private void initializeRoles() {
        log.info("Initializing system roles...");

        for (String roleName : ROLE_DESCRIPTIONS.keySet()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                Role role = Role.builder()
                    .name(roleName)
                    .description(ROLE_DESCRIPTIONS.get(roleName))
                    .isSystemRole(true)
                    .build();

                roleRepository.save(role);
                log.info("Created role: {}", roleName);
            }
        }

        log.info("Role initialization complete. Total roles: {}", roleRepository.count());
    }
}
