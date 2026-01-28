package com.samgov.ingestor.service;

/**
 * Service interface for sending emails.
 * Implementations can use different providers (SMTP, SendGrid, SES, etc.)
 */
public interface EmailService {

    /**
     * Send a password reset email.
     *
     * @param toEmail recipient email address
     * @param resetToken the password reset token
     * @param resetUrl the full URL for password reset (including token)
     */
    void sendPasswordResetEmail(String toEmail, String resetToken, String resetUrl);

    /**
     * Send an invitation email to join a tenant.
     *
     * @param toEmail recipient email address
     * @param inviterName name of the person who sent the invitation
     * @param tenantName name of the tenant/organization
     * @param inviteUrl the full URL to accept the invitation
     */
    void sendInvitationEmail(String toEmail, String inviterName, String tenantName, String inviteUrl);

    /**
     * Send a welcome email after registration.
     *
     * @param toEmail recipient email address
     * @param firstName user's first name
     */
    void sendWelcomeEmail(String toEmail, String firstName);

    /**
     * Send an email verification email.
     *
     * @param toEmail recipient email address
     * @param verificationUrl the full URL to verify the email
     */
    void sendEmailVerification(String toEmail, String verificationUrl);
}
