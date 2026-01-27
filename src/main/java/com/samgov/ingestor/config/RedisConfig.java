package com.samgov.ingestor.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis configuration for distributed caching.
 * Provides JSON serialization with proper type handling and per-cache TTL settings.
 *
 * Enabled when spring.data.redis.host is configured (not empty).
 * Falls back to ConcurrentMapCacheManager when Redis is not available.
 */
@Slf4j
@Configuration
@ConditionalOnProperty(name = "spring.data.redis.host", matchIfMissing = false)
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${spring.cache.redis.time-to-live:3600000}")
    private long defaultTtlMs;

    /**
     * Configure Redis connection factory.
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration(redisHost, redisPort);
        if (redisPassword != null && !redisPassword.isEmpty()) {
            config.setPassword(redisPassword);
        }
        log.info("Configuring Redis connection to {}:{}", redisHost, redisPort);
        return new LettuceConnectionFactory(config);
    }

    /**
     * Configure ObjectMapper for JSON serialization in Redis.
     * Includes type information to handle polymorphism correctly.
     */
    private ObjectMapper createRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
            LaissezFaireSubTypeValidator.instance,
            ObjectMapper.DefaultTyping.NON_FINAL,
            JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    /**
     * Configure RedisTemplate for direct Redis operations.
     * Uses String keys and JSON values for easy debugging.
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Use JSON serializer for values
        GenericJackson2JsonRedisSerializer jsonSerializer =
            new GenericJackson2JsonRedisSerializer(createRedisObjectMapper());
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        log.info("Configured RedisTemplate with JSON serialization");
        return template;
    }

    /**
     * Configure Redis CacheManager with per-cache TTL settings.
     */
    @Bean
    @Primary
    public CacheManager redisCacheManager(RedisConnectionFactory connectionFactory) {
        // Default configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMillis(defaultTtlMs))
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(
                    new GenericJackson2JsonRedisSerializer(createRedisObjectMapper())
                )
            )
            .disableCachingNullValues();

        // Per-cache TTL configurations
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();

        cacheConfigs.put(CacheConfig.OPPORTUNITIES_CACHE,
            defaultConfig.entryTtl(Duration.ofSeconds(CacheConfig.CacheTTL.OPPORTUNITIES_SECONDS)));

        cacheConfigs.put(CacheConfig.CONTRACTS_CACHE,
            defaultConfig.entryTtl(Duration.ofSeconds(CacheConfig.CacheTTL.CONTRACTS_SECONDS)));

        cacheConfigs.put(CacheConfig.USERS_CACHE,
            defaultConfig.entryTtl(Duration.ofSeconds(CacheConfig.CacheTTL.USERS_SECONDS)));

        cacheConfigs.put(CacheConfig.TENANT_SETTINGS_CACHE,
            defaultConfig.entryTtl(Duration.ofSeconds(CacheConfig.CacheTTL.TENANT_SETTINGS_SECONDS)));

        cacheConfigs.put(CacheConfig.PERMISSIONS_CACHE,
            defaultConfig.entryTtl(Duration.ofSeconds(CacheConfig.CacheTTL.PERMISSIONS_SECONDS)));

        // Add search cache with shorter TTL (2 minutes)
        cacheConfigs.put("searchResults",
            defaultConfig.entryTtl(Duration.ofMinutes(2)));

        // Add API response cache with short TTL (1 minute)
        cacheConfigs.put("apiResponses",
            defaultConfig.entryTtl(Duration.ofMinutes(1)));

        log.info("Configured Redis CacheManager with per-cache TTL settings");

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaultConfig)
            .withInitialCacheConfigurations(cacheConfigs)
            .transactionAware()
            .build();
    }
}
