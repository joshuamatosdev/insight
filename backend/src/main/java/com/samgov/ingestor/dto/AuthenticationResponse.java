package com.samgov.ingestor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserDto user;

    /**
     * If true, MFA verification is required. Client should re-submit login
     * request with the mfaCode field populated.
     */
    private Boolean mfaRequired;

    public static AuthenticationResponse of(String accessToken, String refreshToken, UserDto user) {
        return AuthenticationResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(86400L) // 24 hours in seconds
            .user(user)
            .mfaRequired(false)
            .build();
    }

    /**
     * Create a response indicating MFA is required before authentication can complete.
     */
    public static AuthenticationResponse mfaRequired() {
        return AuthenticationResponse.builder()
            .mfaRequired(true)
            .build();
    }
}
