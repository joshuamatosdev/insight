package com.samgov.ingestor.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * AWS S3 configuration for file storage.
 *
 * Supports:
 * - Production AWS S3 with IAM credentials
 * - Local development with LocalStack
 * - Configurable regions and endpoints
 */
@Configuration
@ConditionalOnProperty(name = "aws.s3.enabled", havingValue = "true", matchIfMissing = true)
public class S3Config {

    @Value("${aws.s3.bucket}")
    private String bucket;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.endpoint:}")
    private String endpoint;

    @Value("${aws.credentials.access-key:}")
    private String accessKey;

    @Value("${aws.credentials.secret-key:}")
    private String secretKey;

    @Value("${aws.s3.presigned-url-expiration-minutes:15}")
    private int presignedUrlExpirationMinutes;

    @Bean
    @ConditionalOnMissingBean
    public S3Client s3Client() {
        var builder = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        // Configure custom endpoint for LocalStack or other S3-compatible services
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint))
                   .forcePathStyle(true); // Required for LocalStack
        }

        return builder.build();
    }

    @Bean
    @ConditionalOnMissingBean
    public S3Presigner s3Presigner() {
        var builder = S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(credentialsProvider());

        // Configure custom endpoint for LocalStack or other S3-compatible services
        if (endpoint != null && !endpoint.isBlank()) {
            builder.endpointOverride(URI.create(endpoint));
        }

        return builder.build();
    }

    private AwsCredentialsProvider credentialsProvider() {
        // If explicit credentials are provided, use them
        if (accessKey != null && !accessKey.isBlank()
                && secretKey != null && !secretKey.isBlank()) {
            return StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)
            );
        }
        // Otherwise, use the default credential chain (IAM roles, env vars, etc.)
        return DefaultCredentialsProvider.create();
    }

    public String getBucket() {
        return bucket;
    }

    public String getRegion() {
        return region;
    }

    public int getPresignedUrlExpirationMinutes() {
        return presignedUrlExpirationMinutes;
    }
}
