package com.samgov.ingestor.service;

import com.samgov.ingestor.model.TenantMembership;
import com.samgov.ingestor.model.User;
import com.samgov.ingestor.repository.TenantMembershipRepository;
import com.samgov.ingestor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final TenantMembershipRepository membershipRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        List<TenantMembership> memberships = membershipRepository.findByUserId(user.getId());

        List<SimpleGrantedAuthority> authorities = memberships.stream()
            .map(m -> new SimpleGrantedAuthority("ROLE_" + m.getRole().getName()))
            .distinct()
            .collect(Collectors.toList());

        // Add user status based authority
        if (user.getStatus() == User.UserStatus.ACTIVE) {
            authorities.add(new SimpleGrantedAuthority("STATUS_ACTIVE"));
        }

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(user.getStatus() == User.UserStatus.SUSPENDED)
            .credentialsExpired(false)
            .disabled(user.getStatus() == User.UserStatus.DEACTIVATED)
            .build();
    }
}
