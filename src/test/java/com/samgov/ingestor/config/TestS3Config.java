package com.samgov.ingestor.config;

import org.mockito.Mockito;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

/**
 * Test configuration providing mock S3 beans when S3 is disabled.
 * This allows services that depend on S3 to be instantiated in tests
 * without requiring real AWS credentials.
 */
@Configuration
@ConditionalOnProperty(name = "aws.s3.enabled", havingValue = "false")
public class TestS3Config {

    @Bean
    @Primary
    public S3Client s3Client() {
        return Mockito.mock(S3Client.class);
    }

    @Bean
    @Primary
    public S3Presigner s3Presigner() {
        return Mockito.mock(S3Presigner.class);
    }

    @Bean
    @Primary
    public S3Config s3Config() {
        S3Config config = Mockito.mock(S3Config.class);
        Mockito.when(config.getBucket()).thenReturn("test-bucket");
        Mockito.when(config.getRegion()).thenReturn("us-east-1");
        Mockito.when(config.getPresignedUrlExpirationMinutes()).thenReturn(15);
        return config;
    }
}
