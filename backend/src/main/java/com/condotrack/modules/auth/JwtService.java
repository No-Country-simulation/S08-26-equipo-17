package com.condotrack.modules.auth;

import java.util.Date;

import javax.crypto.SecretKey;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.io.Decoders;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private static final String TOKEN_TYPE = "token_type";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";

    private final SecretKey signingKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
        @Value("${app.security.jwt.secret}") String secret,
        @Value("${app.security.jwt.expiration-ms}") long accessExpirationMs,
        @Value("${app.security.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(User user) {
        return generateToken(user, ACCESS_TOKEN, accessExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, REFRESH_TOKEN, refreshExpirationMs);
    }

    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isAccessToken(String token) {
        return ACCESS_TOKEN.equals(parseClaims(token).get(TOKEN_TYPE, String.class));
    }

    public boolean isRefreshToken(String token) {
        return REFRESH_TOKEN.equals(parseClaims(token).get(TOKEN_TYPE, String.class));
    }

    public long getAccessExpirationSeconds() {
        return accessExpirationMs / 1000;
    }

    private String generateToken(User user, String tokenType, long expirationMs) {
        Date issuedAt = new Date();
        return Jwts.builder()
            .subject(user.getUsername())
            .claim(TOKEN_TYPE, tokenType)
            .issuedAt(issuedAt)
            .expiration(new Date(issuedAt.getTime() + expirationMs))
            .signWith(signingKey)
            .compact();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
            .verifyWith(signingKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}