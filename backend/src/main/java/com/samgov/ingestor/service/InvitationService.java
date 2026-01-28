package com.samgov.ingestor.service;

import com.samgov.ingestor.config.TenantContext;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.UserInvitation;
import com.samgov.ingestor.model.UserInvitation.InvitationStatus;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserInvitationRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final UserInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final UserService userService;
    private final EmailService emailService;

    @Value("${app.invitation.expiration-days:7}")
    private int expirationDays;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Create and send an invitation to join a tenant.
     */
    @Transactional
    public InvitationDto createInvitation(String email, UUID tenantId, String roleName) {
        log.info("Creating invitation for {} to tenant {} with role {}", email, tenantId, roleName);

        String normalizedEmail = email.toLowerCase();

        // Check if user is already a member
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            User existingUser = userRepository.findByEmail(normalizedEmail).get();
            if (userService.getUserMemberships(existingUser.getId()).stream()
                    .anyMatch(m -> m.getTenantId().equals(tenantId))) {
                throw new IllegalArgumentException("User is already a member of this tenant");
            }
        }

        // Check for existing pending invitation
        if (invitationRepository.existsByEmailAndTenantIdAndStatus(normalizedEmail, tenantId, InvitationStatus.PENDING)) {
            throw new IllegalArgumentException("An invitation is already pending for this email");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found"));

        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        User inviter = null;
        UUID currentUserId = TenantContext.getCurrentUserId();
        if (currentUserId != null) {
            inviter = userRepository.findById(currentUserId).orElse(null);
        }

        String token = generateSecureToken();
        String tokenHash = hashToken(token);

        UserInvitation invitation = UserInvitation.builder()
            .email(normalizedEmail)
            .tokenHash(tokenHash)
            .tenant(tenant)
            .role(role)
            .invitedBy(inviter)
            .status(InvitationStatus.PENDING)
            .expiresAt(Instant.now().plus(expirationDays, ChronoUnit.DAYS))
            .build();

        invitation = invitationRepository.save(invitation);

        // Send invitation email
        String inviteUrl = baseUrl + "/invite/accept?token=" + token;
        String inviterName = inviter != null ? inviter.getFullName() : "A team member";
        emailService.sendInvitationEmail(normalizedEmail, inviterName, tenant.getName(), inviteUrl);

        return InvitationDto.fromEntity(invitation);
    }

    /**
     * Accept an invitation using the token.
     */
    @Transactional
    public UserDto acceptInvitation(String token, String password, String firstName, String lastName) {
        log.info("Accepting invitation with token");

        String tokenHash = hashToken(token);
        UserInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
            .orElseThrow(() -> new IllegalArgumentException("Invalid invitation token"));

        if (!invitation.isValid()) {
            throw new IllegalArgumentException("Invitation has expired or is no longer valid");
        }

        String email = invitation.getEmail();

        // Check if user already exists
        Optional<User> existingUserOpt = userRepository.findByEmail(email);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
        } else {
            // Create new user
            var createRequest = com.samgov.ingestor.dto.CreateUserRequest.builder()
                .email(email)
                .password(password)
                .firstName(firstName)
                .lastName(lastName)
                .build();

            UserDto newUserDto = userService.createUser(createRequest);
            user = userRepository.findById(newUserDto.getId())
                .orElseThrow(() -> new IllegalStateException("Failed to create user"));

            // Activate the user immediately since they accepted an invitation
            userService.activateUser(user.getId());
        }

        // Add user to tenant with the invited role
        UUID invitedBy = invitation.getInvitedBy() != null ? invitation.getInvitedBy().getId() : null;
        userService.addUserToTenant(
            user.getId(),
            invitation.getTenant().getId(),
            invitation.getRole().getName(),
            invitedBy
        );

        // Mark invitation as accepted
        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitation.setAcceptedAt(Instant.now());
        invitationRepository.save(invitation);

        log.info("Invitation accepted by user {}", user.getId());
        return UserDto.fromEntity(user);
    }

    /**
     * Get invitation details by token (for showing the invitation page).
     */
    @Transactional(readOnly = true)
    public Optional<InvitationDto> getInvitationByToken(String token) {
        String tokenHash = hashToken(token);
        return invitationRepository.findByTokenHash(tokenHash)
            .map(InvitationDto::fromEntity);
    }

    /**
     * Get all pending invitations for a tenant.
     */
    @Transactional(readOnly = true)
    public List<InvitationDto> getPendingInvitations(UUID tenantId) {
        return invitationRepository.findByTenantIdAndStatus(tenantId, InvitationStatus.PENDING)
            .stream()
            .map(InvitationDto::fromEntity)
            .collect(Collectors.toList());
    }

    /**
     * Cancel a pending invitation.
     */
    @Transactional
    public void cancelInvitation(UUID invitationId) {
        UserInvitation invitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending invitations can be cancelled");
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitationRepository.save(invitation);
        log.info("Invitation {} cancelled", invitationId);
    }

    /**
     * Resend an invitation email with a new token.
     */
    @Transactional
    public void resendInvitation(UUID invitationId) {
        UserInvitation invitation = invitationRepository.findById(invitationId)
            .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending invitations can be resent");
        }

        // Generate a new token (old one is now invalid)
        String newToken = generateSecureToken();
        String newTokenHash = hashToken(newToken);

        // Update invitation with new token hash and extended expiration
        invitation.setTokenHash(newTokenHash);
        invitation.setExpiresAt(Instant.now().plus(expirationDays, ChronoUnit.DAYS));
        invitationRepository.save(invitation);

        // Resend email with new token
        String inviteUrl = baseUrl + "/invite/accept?token=" + newToken;
        String inviterName = invitation.getInvitedBy() != null ?
            invitation.getInvitedBy().getFullName() : "A team member";
        emailService.sendInvitationEmail(
            invitation.getEmail(),
            inviterName,
            invitation.getTenant().getName(),
            inviteUrl
        );

        log.info("Invitation {} resent with new token", invitationId);
    }

    /**
     * Clean up expired invitations.
     */
    @Transactional
    public int expireOldInvitations() {
        int expired = invitationRepository.expireOldInvitations(Instant.now());
        if (expired > 0) {
            log.info("Expired {} old invitations", expired);
        }
        return expired;
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    /**
     * Hash a token using SHA-256 for secure storage.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }

    public record InvitationDto(
        UUID id,
        String email,
        UUID tenantId,
        String tenantName,
        String role,
        InvitationStatus status,
        String invitedByName,
        Instant expiresAt,
        Instant createdAt
    ) {
        public static InvitationDto fromEntity(UserInvitation invitation) {
            return new InvitationDto(
                invitation.getId(),
                invitation.getEmail(),
                invitation.getTenant().getId(),
                invitation.getTenant().getName(),
                invitation.getRole().getName(),
                invitation.getStatus(),
                invitation.getInvitedBy() != null ? invitation.getInvitedBy().getFullName() : null,
                invitation.getExpiresAt(),
                invitation.getCreatedAt()
            );
        }
    }
}
