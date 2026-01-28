package com.samgov.ingestor.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

/**
 * Development implementation of EmailService that logs emails to console.
 * In production, this should be replaced with a real email service.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.email.provider", havingValue = "console", matchIfMissing = true)
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl) {
        log.info("""

            ========== PASSWORD RESET EMAIL ==========
            To: {}
            Subject: Reset Your Password

            You requested a password reset for your account.

            Click here to reset your password: {}

            This link will expire in 24 hours.

            If you didn't request this, please ignore this email.
            ==========================================
            """, toEmail, resetUrl);
    }

    @Override
    public void sendInvitationEmail(String toEmail, String inviterName, String tenantName, String inviteUrl) {
        log.info("""

            ========== INVITATION EMAIL ==========
            To: {}
            Subject: You've been invited to join {}

            {} has invited you to join {} on SAM.gov Contract Intelligence.

            Click here to accept the invitation: {}

            This invitation will expire in 7 days.
            ======================================
            """, toEmail, tenantName, inviterName, tenantName, inviteUrl);
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String firstName) {
        log.info("""

            ========== WELCOME EMAIL ==========
            To: {}
            Subject: Welcome to SAM.gov Contract Intelligence!

            Hi {},

            Welcome to SAM.gov Contract Intelligence!

            You can now:
            - Track government contract opportunities
            - Manage your pipeline
            - Collaborate with your team

            Get started by logging in to your dashboard.
            ===================================
            """, toEmail, firstName != null ? firstName : "there");
    }

    @Override
    public void sendEmailVerification(String toEmail, String verificationUrl) {
        log.info("""

            ========== EMAIL VERIFICATION ==========
            To: {}
            Subject: Verify Your Email Address

            Please verify your email address by clicking the link below:

            {}

            This link will expire in 24 hours.
            ========================================
            """, toEmail, verificationUrl);
    }
}
