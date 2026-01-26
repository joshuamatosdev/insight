package com.samgov.ingestor.service;

import com.samgov.ingestor.config.JwtService;
import com.samgov.ingestor.dto.AuthenticationRequest;
import com.samgov.ingestor.dto.AuthenticationResponse;
import com.samgov.ingestor.dto.CreateTenantRequest;
import com.samgov.ingestor.dto.RegisterRequest;
import com.samgov.ingestor.dto.TenantDto;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.AuditLog.AuditAction;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final TenantService tenantService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final AuditService auditService;
    private final MfaService mfaService;

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("User with this email already exists");
        }

        // Create the user
        User user = User.builder()
            .email(request.getEmail().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .status(UserStatus.ACTIVE) // Auto-activate for now; would typically require email verification
            .emailVerified(false)
            .mfaEnabled(false)
            .build();

        user = userRepository.save(user);
        log.info("Created user with id: {}", user.getId());

        // If organization name provided, create a tenant and make user the admin
        if (request.getOrganizationName() != null && !request.getOrganizationName().isBlank()) {
            TenantDto tenant = tenantService.createTenant(
                CreateTenantRequest.builder()
                    .name(request.getOrganizationName())
                    .build()
            );
            log.info("Created tenant {} for user {}", tenant.getId(), user.getId());

            // Add user as tenant admin
            userService.addUserToTenant(user.getId(), tenant.getId(), Role.TENANT_ADMIN, null);
        }

        // Generate tokens
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateToken(claims, userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Audit log
        auditService.logActionForUser(
            user.getId(),
            null,
            AuditAction.USER_CREATED,
            "User registered: " + user.getEmail(),
            null
        );

        return AuthenticationResponse.of(accessToken, refreshToken, UserDto.fromEntity(user));
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Authenticating user: {}", request.getEmail());

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail().toLowerCase(),
                request.getPassword()
            )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Account is not active");
        }

        // Check if MFA is enabled and required
        if (Boolean.TRUE.equals(user.getMfaEnabled())) {
            String mfaCode = request.getMfaCode();

            // If MFA code not provided, return response indicating MFA is required
            if (mfaCode == null || mfaCode.isBlank()) {
                log.info("MFA required for user: {}", user.getId());
                return AuthenticationResponse.mfaRequired();
            }

            // Verify MFA code
            if (!mfaService.verifyCode(user.getId(), mfaCode)) {
                log.warn("Invalid MFA code for user: {}", user.getId());
                throw new IllegalArgumentException("Invalid MFA code");
            }

            log.info("MFA verification successful for user: {}", user.getId());
        }

        // Update last login
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateToken(claims, userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Audit log
        auditService.logActionForUser(
            user.getId(),
            null,
            AuditAction.LOGIN,
            "User logged in: " + user.getEmail(),
            null
        );

        return AuthenticationResponse.of(accessToken, refreshToken, UserDto.fromEntity(user));
    }

    @Transactional
    public AuthenticationResponse refreshToken(String refreshToken) {
        String userEmail = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

        if (!jwtService.isTokenValid(refreshToken, userDetails)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId().toString());

        String accessToken = jwtService.generateToken(claims, userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthenticationResponse.of(accessToken, newRefreshToken, UserDto.fromEntity(user));
    }
}
