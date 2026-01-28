package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.TenantMembership;
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
public class TenantMembershipDto {

    private UUID id;
    private UUID userId;
    private String userEmail;
    private String userFullName;
    private UUID tenantId;
    private String tenantName;
    private String roleName;
    private Boolean isDefault;
    private Instant invitedAt;
    private Instant acceptedAt;
    private Instant createdAt;

    public static TenantMembershipDto fromEntity(TenantMembership membership) {
        return TenantMembershipDto.builder()
            .id(membership.getId())
            .userId(membership.getUser().getId())
            .userEmail(membership.getUser().getEmail())
            .userFullName(membership.getUser().getFullName())
            .tenantId(membership.getTenant().getId())
            .tenantName(membership.getTenant().getName())
            .roleName(membership.getRole().getName())
            .isDefault(membership.getIsDefault())
            .invitedAt(membership.getInvitedAt())
            .acceptedAt(membership.getAcceptedAt())
            .createdAt(membership.getCreatedAt())
            .build();
    }
}
