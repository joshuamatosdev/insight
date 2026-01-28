package com.samgov.ingestor.config;

import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@samgov.local}")
    private String adminEmail;

    @Value("${app.admin.password:Admin123!}")
    private String adminPassword;

    @Value("${app.admin.create-on-startup:true}")
    private boolean createAdminOnStartup;

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
        initializeAdminUser();
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

    private void initializeAdminUser() {
        if (!createAdminOnStartup) {
            log.info("Admin user creation on startup is disabled");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists: {}", adminEmail);
            return;
        }

        log.info("Creating default admin user: {}", adminEmail);

        User adminUser = User.builder()
            .email(adminEmail)
            .passwordHash(passwordEncoder.encode(adminPassword))
            .firstName("System")
            .lastName("Administrator")
            .status(UserStatus.ACTIVE)
            .emailVerified(true)
            .emailVerifiedAt(Instant.now())
            .mfaEnabled(false)
            .build();

        userRepository.save(adminUser);
        log.info("Default admin user created successfully: {}", adminEmail);
        log.info("===========================================");
        log.info("  DEFAULT ADMIN CREDENTIALS");
        log.info("  Email: {}", adminEmail);
        log.info("  Password: {}", adminPassword);
        log.info("  ** CHANGE THIS PASSWORD IMMEDIATELY **");
        log.info("===========================================");
    }
}
