package com.samgov.ingestor.dto;

import com.samgov.ingestor.model.User;
import com.samgov.ingestor.model.User.UserStatus;
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
public class UserDto {

    private UUID id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String avatarUrl;
    private UserStatus status;
    private Boolean emailVerified;
    private Boolean mfaEnabled;
    private Instant lastLoginAt;
    private Instant createdAt;
    private Instant updatedAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .avatarUrl(user.getAvatarUrl())
            .status(user.getStatus())
            .emailVerified(user.getEmailVerified())
            .mfaEnabled(user.getMfaEnabled())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .build();
    }
}
