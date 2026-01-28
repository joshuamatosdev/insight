package com.samgov.ingestor.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@Service
public class JwtService {

    private static final String INSECURE_DEFAULT_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final int MINIMUM_KEY_BYTES = 32; // 256 bits for HS256

    @Value("${jwt.secret:}")
    private String secretKey;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}")
    private long refreshExpiration;

    /**
     * Validate JWT configuration at startup to prevent insecure deployments.
     */
    @PostConstruct
    public void validateConfiguration() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                "JWT secret key is not configured. Set the 'jwt.secret' property with a secure, " +
                "randomly generated Base64-encoded key of at least 256 bits.");
        }

        if (INSECURE_DEFAULT_KEY.equals(secretKey)) {
            throw new IllegalStateException(
                "JWT secret key is using the insecure default value. " +
                "Set the 'jwt.secret' property with a unique, randomly generated key.");
        }

        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey);
            if (keyBytes.length < MINIMUM_KEY_BYTES) {
                throw new IllegalStateException(
                    "JWT secret key is too short. Must be at least " + MINIMUM_KEY_BYTES +
                    " bytes (256 bits) for HS256. Current length: " + keyBytes.length + " bytes.");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException(
                "JWT secret key is not valid Base64. Ensure it is properly encoded.", e);
        }

        log.info("JWT configuration validated successfully");
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public UUID extractUserId(String token) {
        String userId = extractClaim(token, claims -> claims.get("userId", String.class));
        return userId != null ? UUID.fromString(userId) : null;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
            .claims(extraClaims)
            .subject(userDetails.getUsername())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSignInKey())
            .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
            .verifyWith(getSignInKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
