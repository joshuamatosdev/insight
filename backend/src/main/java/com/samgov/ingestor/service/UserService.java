package com.samgov.ingestor.service;

import com.samgov.ingestor.dto.CreateUserRequest;
import com.samgov.ingestor.dto.TenantMembershipDto;
import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.model.Tenant;
import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
import com.samgov.ingestor.repository.RoleRepository;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.TenantRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final RoleRepository roleRepository;
    private final TenantMembershipRepository membershipRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        log.info("Creating user: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("User with email already exists: " + request.getEmail());
        }

        User.UserBuilder userBuilder = User.builder()
            .email(request.getEmail().toLowerCase())
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .status(UserStatus.PENDING)
            .emailVerified(false)
            .mfaEnabled(false);

        // Password is optional for invited users (they'll set it via password reset)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            userBuilder.passwordHash(passwordEncoder.encode(request.getPassword()));
        }

        User user = userBuilder.build();

        user = userRepository.save(user);
        log.info("Created user with id: {}", user.getId());

        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUserById(UUID id) {
        return userRepository.findById(id)
            .map(UserDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public Optional<UserDto> getUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
            .map(UserDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getUsersByTenantId(UUID tenantId) {
        return userRepository.findByTenantId(tenantId)
            .stream()
            .map(UserDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public void activateUser(UUID userId) {
        log.info("Activating user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setStatus(UserStatus.ACTIVE);
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(Instant.now());
        userRepository.save(user);
    }

    @Transactional
    public void suspendUser(UUID userId) {
        log.info("Suspending user: {}", userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);
    }

    @Transactional
    public TenantMembershipDto addUserToTenant(UUID userId, UUID tenantId, String roleName, UUID invitedBy) {
        log.info("Adding user {} to tenant {} with role {}", userId, tenantId, roleName);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new IllegalArgumentException("Tenant not found: " + tenantId));

        Role role = roleRepository.findByTenantIdAndName(tenantId, roleName)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName + " in tenant " + tenantId));

        if (membershipRepository.existsByUserIdAndTenantId(userId, tenantId)) {
            throw new IllegalArgumentException("User is already a member of this tenant");
        }

        boolean isFirstMembership = membershipRepository.countByUserId(userId) == 0;

        TenantMembership membership = TenantMembership.builder()
            .user(user)
            .tenant(tenant)
            .role(role)
            .isDefault(isFirstMembership)
            .invitedBy(invitedBy)
            .invitedAt(Instant.now())
            .build();

        membership = membershipRepository.save(membership);
        return TenantMembershipDto.fromEntity(membership);
    }

    @Transactional
    public void removeUserFromTenant(UUID userId, UUID tenantId) {
        log.info("Removing user {} from tenant {}", userId, tenantId);

        TenantMembership membership = membershipRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("User is not a member of this tenant"));

        if (membership.getIsDefault()) {
            List<TenantMembership> otherMemberships = membershipRepository.findByUserId(userId)
                .stream()
                .filter(m -> !m.getId().equals(membership.getId()))
                .toList();

            if (!otherMemberships.isEmpty()) {
                TenantMembership newDefault = otherMemberships.get(0);
                newDefault.setIsDefault(true);
                membershipRepository.save(newDefault);
            }
        }

        membershipRepository.delete(membership);
    }

    @Transactional(readOnly = true)
    public List<TenantMembershipDto> getUserMemberships(UUID userId) {
        return membershipRepository.findByUserId(userId)
            .stream()
            .map(TenantMembershipDto::fromEntity)
            .collect(Collectors.toList());
    }

    @Transactional
    public void updateLastLogin(UUID userId, String ipAddress) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        user.setLastLoginAt(Instant.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);
    }

    @Transactional
    public void setDefaultTenant(UUID userId, UUID tenantId) {
        log.info("Setting default tenant {} for user {}", tenantId, userId);

        // Verify user is a member of the tenant
        TenantMembership newDefault = membershipRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("User is not a member of this tenant"));

        // Clear existing default
        List<TenantMembership> memberships = membershipRepository.findByUserId(userId);
        for (TenantMembership membership : memberships) {
            if (membership.getIsDefault() && !membership.getId().equals(newDefault.getId())) {
                membership.setIsDefault(false);
                membershipRepository.save(membership);
            }
        }

        // Set new default
        newDefault.setIsDefault(true);
        membershipRepository.save(newDefault);
    }

    @Transactional
    public void updateUserRole(UUID userId, UUID tenantId, String newRole) {
        log.info("Updating role for user {} in tenant {} to {}", userId, tenantId, newRole);

        TenantMembership membership = membershipRepository.findByUserIdAndTenantId(userId, tenantId)
            .orElseThrow(() -> new IllegalArgumentException("User is not a member of this tenant"));

        Role role = roleRepository.findByTenantIdAndName(tenantId, newRole)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + newRole + " in tenant " + tenantId));

        membership.setRole(role);
        membershipRepository.save(membership);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email.toLowerCase());
    }
}
