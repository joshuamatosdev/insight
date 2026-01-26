package com.samgov.ingestor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    /**
     * MFA code - required if MFA is enabled for the user.
     * If MFA is enabled and this is null, the server will return
     * mfaRequired=true to indicate the client needs to re-submit
     * with the MFA code.
     */
    private String mfaCode;
}
