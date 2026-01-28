package com.samgov.ingestor.controller;

import com.samgov.ingestor.dto.UserDto;
import com.samgov.ingestor.model.Role;
import com.samgov.ingestor.service.InvitationService;
import com.samgov.ingestor.service.InvitationService.InvitationDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    @PreAuthorize("@tenantSecurityService.canManageUsers(#request.tenantId())")
    public ResponseEntity<InvitationDto> createInvitation(
        @Valid @RequestBody CreateInvitationRequest request
    ) {
        log.info("Creating invitation for {} to tenant {}", request.email(), request.tenantId());

        InvitationDto invitation = invitationService.createInvitation(
            request.email(),
            request.tenantId(),
            request.role() != null ? request.role() : Role.USER
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(invitation);
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<InvitationDto> getInvitationByToken(@PathVariable String token) {
        return invitationService.getInvitationByToken(token)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/accept")
    public ResponseEntity<UserDto> acceptInvitation(
        @Valid @RequestBody AcceptInvitationRequest request
    ) {
        log.info("Accepting invitation");

        UserDto user = invitationService.acceptInvitation(
            request.token(),
            request.password(),
            request.firstName(),
            request.lastName()
        );

        return ResponseEntity.ok(user);
    }

    @GetMapping("/tenant/{tenantId}/pending")
    @PreAuthorize("@tenantSecurityService.canManageUsers(#tenantId)")
    public ResponseEntity<List<InvitationDto>> getPendingInvitations(
        @PathVariable UUID tenantId
    ) {
        List<InvitationDto> invitations = invitationService.getPendingInvitations(tenantId);
        return ResponseEntity.ok(invitations);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@tenantSecurityService.canManageUsers(#tenantId)")
    public ResponseEntity<Void> cancelInvitation(
        @PathVariable UUID id,
        @RequestParam UUID tenantId
    ) {
        log.info("Cancelling invitation {}", id);
        invitationService.cancelInvitation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/resend")
    @PreAuthorize("@tenantSecurityService.canManageUsers(#tenantId)")
    public ResponseEntity<Void> resendInvitation(
        @PathVariable UUID id,
        @RequestParam UUID tenantId
    ) {
        log.info("Resending invitation {}", id);
        invitationService.resendInvitation(id);
        return ResponseEntity.noContent().build();
    }

    public record CreateInvitationRequest(
        @NotBlank @Email String email,
        @NotNull UUID tenantId,
        String role
    ) {}

    public record AcceptInvitationRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 50) String firstName,
        @Size(max = 50) String lastName
    ) {}
}
